import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

// Get all posts, or filter by userId if provided
router.get('/', async (req, res) => {
    try {
        const { userId, limit } = req.query
        const filter = {}

        if (userId) {
            filter.author = userId
        }

        const query = Post.find(filter).populate('author', 'username').sort({ createdAt: -1 })
        if (limit && Number(limit) > 0) {
            query.limit(Number(limit))
        }

        const posts = await query
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create a post
router.post('/', async (req, res) => {
    try {
        const { authorId, content, image } = req.body;
        const newPost = new Post({
            author: authorId,
            content,
            image,
            isBot: req.body.isBot || false
        });

        await newPost.save();
        const populatedPost = await Post.findById(newPost._id).populate('author', 'username');
        res.status(201).json(populatedPost);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add a comment to a post
router.post('/:id/comment', async (req, res) => {
    try {
        const { userId, text } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: { user: userId, text } } },
            { new: true }
        ).populate('comments.user', 'username');

        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Rate a post (update stars)
router.put('/:id/rate', async (req, res) => {
    try {
        const { stars } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { stars },
            { new: true }
        );

        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;