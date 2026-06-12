import Message from '../models/Message.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiver, content, media } = req.body;

  // Crear conversationId único para la conversación entre sender y receiver
  const conversationId = [req.user.userId, receiver].sort().join('-');

  const message = await Message.create({
    sender: req.user.userId,
    receiver,
    content,
    media: media || [],
    conversationId
  });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Message sent successfully',
    data: message
  });
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const { userId } = req.params; // El otro usuario
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const conversationId = [req.user.userId, userId].sort().join('-');

  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .populate('media')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversationId })
  ]);

  // Marcar como leídos los mensajes del otro usuario
  await Message.updateMany(
    { conversationId, receiver: req.user.userId, isRead: false },
    { isRead: true }
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: messages.reverse(), // Más antiguos primero
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
});

export const getConversations = asyncHandler(async (req, res) => {
  // Obtener conversaciones únicas
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: req.user.userId }, { receiver: req.user.userId }]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiver', req.user.userId] }, { $eq: ['$isRead', false] }] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.receiver',
        foreignField: '_id',
        as: 'receiver'
      }
    },
    {
      $project: {
        conversationId: '$_id',
        lastMessage: 1,
        unreadCount: 1,
        otherUser: {
          $cond: {
            if: { $eq: ['$lastMessage.sender', req.user.userId] },
            then: { $arrayElemAt: ['$receiver', 0] },
            else: { $arrayElemAt: ['$sender', 0] }
          }
        }
      }
    }
  ]);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: conversations
  });
});