import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  text: { type: String, required: true, maxlength: 2000 },
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

groupMessageSchema.index({ group: 1, createdAt: 1 });

export default mongoose.model('GroupMessage', groupMessageSchema);
