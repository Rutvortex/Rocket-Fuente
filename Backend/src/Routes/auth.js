import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, userType, subType, isBot, isAdmin } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            userType: userType || 'User',
            subType: subType || 'Personal',
            isBot: isBot || false,
            isAdmin: isAdmin || false,
            badges: isAdmin ? ['Staff', 'Developer'] : []
        });

        await newUser.save();
        res.status(201).json({
            message: 'User created successfully', user: {
                id: newUser._id,
                username: newUser.username,
                userType: newUser.userType,
                isBot: newUser.isBot,
                isAdmin: newUser.isAdmin
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                userType: user.userType,
                subType: user.subType || 'Personal',
                isBot: user.isBot || false,
                isAdmin: user.isAdmin || false,
                badges: user.badges || []
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
