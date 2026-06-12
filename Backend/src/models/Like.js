import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    type: { type: String, enum: ['like', 'star'], default: 'like' }, // Para estrellas
}, { timestamps: true });

// Un usuario solo puede likear una vez por post/comment
likeSchema.index({ user: 1, post: 1 });
likeSchema.index({ user: 1, comment: 1 });

export default mongoose.model('Like', likeSchema);