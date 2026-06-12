import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    isRead: { type: Boolean, default: false },
    conversationId: { type: String, required: true }, // Para agrupar mensajes en conversación
}, { timestamps: true });

// Índice para conversaciones
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);