const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  niceToHave: [{ type: String }],
  skills: [{ type: String }],
  benefits: [{ type: String }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  location: { type: String },
  type: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    default: 'Full-time'
  },
  workMode: { 
    type: String, 
    enum: ['Remote', 'Hybrid', 'On-site'],
    default: 'On-site'
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'],
  },
  category: { type: String },
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  currency: { type: String, default: '₹' },
  status: { 
    type: String, 
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  featured: { type: Boolean, default: false },
  applicants: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  deadline: { type: Date },
}, { timestamps: true });

// Text search index
jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });

module.exports = mongoose.model('Job', jobSchema);