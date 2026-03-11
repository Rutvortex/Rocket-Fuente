const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.status(200).json(posts);
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

module.exports = router;
