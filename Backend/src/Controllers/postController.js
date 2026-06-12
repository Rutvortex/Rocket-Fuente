import Post from '../models/Post.js';
import Media from '../models/Media.js';
import Like from '../models/Like.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

export const createPost = asyncHandler(async (req, res) => {
  const { title, content, tags, isPublic, group, image } = req.body;
  const mediaIds = req.body.media || []; // Asumir que se pasan IDs de media

  const post = await Post.create({
    title,
    content,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    image,
    media: mediaIds,
    author: req.user.userId,
    isPublic: isPublic !== undefined ? isPublic : true,
    group
  });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Post created successfully',
    data: post
  });
});

export const getPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const userId = req.query.userId;

  const filters = { isPublic: true };
  if (userId) filters.author = userId;

  if (search) {
    filters.$text = { $search: search };
  }

  const [posts, total] = await Promise.all([
    Post.find(filters)
      .populate('author', 'username profilePicture')
      .populate('media')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filters)
  ]);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Posts fetched successfully',
    data: posts,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username profilePicture bio')
    .populate('media')
    .populate({
      path: 'comments',
      populate: { path: 'author', select: 'username profilePicture' }
    })
    .populate('likes', 'user type');

  if (!post) {
    return next(new AppError('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Post fetched successfully',
    data: post
  });
});

export const updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id, author: req.user.userId });

  if (!post) {
    return next(new AppError('Post not found or not authorized', HTTP_STATUS.NOT_FOUND));
  }

  const { title, content, tags, isPublic } = req.body;
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  if (tags !== undefined) post.tags = tags.split(',').map(tag => tag.trim());
  if (isPublic !== undefined) post.isPublic = isPublic;

  await post.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Post updated successfully',
    data: post
  });
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id, author: req.user.userId });

  if (!post) {
    return next(new AppError('Post not found or not authorized', HTTP_STATUS.NOT_FOUND));
  }

  // Eliminar media asociada si es necesario
  if (post.media.length > 0) {
    await Media.deleteMany({ _id: { $in: post.media } });
  }

  await post.deleteOne();
  return res.status(HTTP_STATUS.NO_CONTENT).send();
});

export const likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  // Lógica simplificada: toggle like
  const existingLike = await Like.findOne({ user: req.user.userId, post: req.params.id });
  if (existingLike) {
    await existingLike.deleteOne();
    post.likes.pull(existingLike._id);
  } else {
    const like = await Like.create({ user: req.user.userId, post: req.params.id });
    post.likes.push(like._id);
  }

  await post.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: existingLike ? 'Post unliked' : 'Post liked',
    data: { likesCount: post.likes.length }
  });
});