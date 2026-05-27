const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['seeker', 'employer', 'admin'], default: 'seeker' },
  title: { type: String },
  bio: { type: String },
  location: { type: String },
  phone: { type: String },
  avatar: { type: String },
  resume: { type: String },
  skills: [{ type: String }],
  experience: { type: String },
  companyName: { type: String },
  companyWebsite: { type: String },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);