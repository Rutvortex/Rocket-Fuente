import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true, maxlength: 500 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // Para replies
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);