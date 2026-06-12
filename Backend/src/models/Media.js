import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true }, // Cloudinary URL o local path
    publicId: { type: String }, // Para Cloudinary
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['image', 'video', 'audio'], default: 'image' },
    // Detección de IA
    isAIGenerated: { type: Boolean, default: null }, // null = no analizado, true/false = analizado
    aiDetectionMethods: [{ 
        method: { type: String }, // ej: 'huggingface', 'metadata', 'forensic'
        confidence: { type: Number, min: 0, max: 100 }, // Porcentaje de confianza
        isAI: { type: Boolean },
        timestamp: { type: Date, default: Date.now }
    }],
    overallConfidence: { type: Number, min: 0, max: 100 }, // Promedio de todas las pruebas
    aiDetectionStatus: { 
        type: String, 
        enum: ['pending', 'analyzing', 'completed', 'failed'], 
        default: 'pending' 
    },
    aiDetectionError: { type: String }, // Si hubo error en análisis
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin que confirmó/corrigió
    markedAt: { type: Date },
    markedReason: { type: String }, // Razón de la marca manual
    hasMetadata: { type: Boolean, default: false }, // Si contiene metadata de IA
    metadataInfo: { type: Object }, // Información de metadata encontrada
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        stars: { type: Number, min: 1, max: 5, default: 5 },
        createdAt: { type: Date, default: Date.now }
    }],
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        stars: { type: Number, min: 1, max: 5, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);