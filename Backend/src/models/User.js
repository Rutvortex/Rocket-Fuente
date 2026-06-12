import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['User', 'Creator', 'Bot', 'Developer'], default: 'User' },
    subType: { type: String, enum: ['Personal', 'Infantil', 'Empresarial'], default: 'Personal' },
    badges: [{ type: String }],
    profilePicture: { type: String, default: '' },
    coverPicture: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    isBot: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Sistema de suscripción y comunidades
    subscriptionPlan: { type: String, enum: ['Free', 'Premium'], default: 'Free' },
    communitiesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    botsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
    achievementsUnlocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
    // Relación con empresa (si el usuario es miembro de una)
    enterprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Enterprise' },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
