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
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);