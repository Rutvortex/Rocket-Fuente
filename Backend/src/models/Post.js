import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    image: { type: String },
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }], // Referencia al/los documento(s) Media
    // Información de detección de IA
    hasAIContent: { type: Boolean, default: false }, // Si la imagen fue generada por IA
    aiDetectionConfidence: { type: Number, min: 0, max: 100 }, // Confianza del análisis
    aiWarning: { 
        type: String,
        enum: ['none', 'likely_ai', 'confirmed_ai', 'user_disclosed'],
        default: 'none'
    },
    userDisclosedAI: { type: Boolean, default: false }, // Si el usuario confirmó que es IA
    stars: { type: Number, default: 0 },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    isBot: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Post', postSchema);
