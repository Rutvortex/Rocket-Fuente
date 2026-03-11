const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['User', 'Creator', 'Bot', 'Developer'], default: 'User' },
    subType: { type: String, enum: ['Personal', 'Infantil', 'Empresarial'], default: 'Personal' },
    badges: [{ type: String }],
    isBot: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
