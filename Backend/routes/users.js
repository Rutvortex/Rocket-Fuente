const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update User Badges (Developer Only)
router.put('/:id/badges', async (req, res) => {
    try {
        const { devId, badges } = req.body;
        const targetId = req.params.id;

        // Verify Developer status
        const developer = await User.findById(devId);
        if (!developer || !developer.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Developer privileges required.' });
        }

        const user = await User.findByIdAndUpdate(
            targetId,
            { badges: badges },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        res.status(200).json({ message: 'Badges updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get User by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
