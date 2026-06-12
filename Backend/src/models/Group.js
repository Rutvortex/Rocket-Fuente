import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50 },
    description: { type: String, maxlength: 500 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPrivate: { type: Boolean, default: false },
    coverImage: { type: String },
    category: { type: String, enum: ['Arte', 'Música', 'Fotografía', 'Diseño', 'Otro'], default: 'Otro' },
    memberLimit: { type: Number, default: 0 }, // 0 = sin límite
    audienceType: { type: String, enum: ['Infantil', 'Normal', 'Empresarial'], default: 'Normal' },
    regionConstraint: { type: String, default: 'Mundial' },
    // Identificar si es una comunidad o un bot
    type: { type: String, enum: ['community', 'bot'], default: 'community' },
    // Relación con empresa si pertenece a una
    enterprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Enterprise' },
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);