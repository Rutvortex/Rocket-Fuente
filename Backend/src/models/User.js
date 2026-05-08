import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['User', 'Creator', 'Bot', 'Developer'], default: 'User' },
    subType: { type: String, enum: ['Personal', 'Infantil', 'Empresarial'], default: 'Personal' },
    badges: [{ type: String }],
    isBot: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
