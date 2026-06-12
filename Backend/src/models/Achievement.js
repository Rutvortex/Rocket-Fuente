import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String }, // URL o ruta del icono
    // Requisito para obtener el logro
    requiredAction: { type: String, enum: ['posts', 'followers', 'communities', 'engagement', 'consecutive_days'], required: true },
    requiredCount: { type: Number, required: true }, // p.ej., 10 posts, 100 followers
    // Recompensa: espacios adicionales de comunidades
    communitySpacesReward: { type: Number, default: 0 },
    botSpacesReward: { type: Number, default: 0 },
    badge: { type: String }, // nombre del badge que se asigna
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);
