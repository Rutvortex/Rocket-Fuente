import mongoose from 'mongoose';

const enterpriseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    description: { type: String },
    // Verificación y licencia
    isVerified: { type: Boolean, default: false },
    licenseType: { type: String, enum: ['Free', 'Professional', 'Premium'], default: 'Free' },
    licenseExpiresAt: { type: Date },
    // Administrador principal
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Miembros de la empresa
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Bots y comunidades
    botsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
    communitiesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    // Límites según plan
    // Free: 3 comunidades, 0 bots
    // Professional: 50 comunidades, 10 bots
    // Premium: 100 comunidades, 100 bots
    maxCommunities: { type: Number, default: 3 },
    maxBots: { type: Number, default: 0 },
    // Información
    website: { type: String },
    logo: { type: String },
    paymentStatus: { type: String, enum: ['Active', 'Pending', 'Suspended'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Enterprise', enterpriseSchema);
