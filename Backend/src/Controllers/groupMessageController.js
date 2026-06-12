import Group from '../models/Group.js';
import GroupMessage from '../models/GroupMessage.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

export const getGroupMessages = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id;
  const group = await Group.findById(groupId);
  if (!group) return next(new AppError('Group not found', HTTP_STATUS.NOT_FOUND));

  const messages = await GroupMessage.find({ group: groupId })
    .populate('sender', 'username profilePicture')
    .populate('media')
    .sort({ createdAt: 1 });

  return res.status(HTTP_STATUS.OK).json({ success: true, data: messages });
});

export const sendGroupMessage = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id;
  const { text, media } = req.body;

  if (!text || !text.trim()) {
    return next(new AppError('Message text is required', HTTP_STATUS.BAD_REQUEST));
  }

  const group = await Group.findById(groupId);
  if (!group) return next(new AppError('Group not found', HTTP_STATUS.NOT_FOUND));

  // Optional: verify membership for private groups
  if (group.isPrivate && !group.members.includes(req.user.userId)) {
    return next(new AppError('Not a member of this private group', HTTP_STATUS.FORBIDDEN));
  }

  const msg = await GroupMessage.create({
    sender: req.user.userId,
    group: groupId,
    text: text.trim(),
    media: media || []
  });

  const populated = await GroupMessage.findById(msg._id).populate('sender', 'username profilePicture');

  // Emit real-time event to group room if socket server available
  try {
    const io = req.app.get('io');
    if (io) {
      io.to(`group:${groupId}`).emit('group:message', populated);
    }
  } catch (err) {
    // Non-fatal: log and continue
    // eslint-disable-next-line no-console
    console.error('Error emitting group message via socket:', err.message);
  }

  return res.status(HTTP_STATUS.CREATED).json({ success: true, data: populated, message: 'Message sent' });
});
