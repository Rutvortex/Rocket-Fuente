import mongoose from 'mongoose';

const botSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    enterprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Enterprise' },
    // Configuración del bot
    token: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },
    permissions: [{ type: String }], // permisos que tiene el bot
    // Estadísticas
    commandsCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Bot', botSchema);
