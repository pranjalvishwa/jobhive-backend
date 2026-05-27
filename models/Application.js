const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String },
  resume: { type: String },
  status: {
    type: String,
    enum: ['applied', 'review', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  notes: { type: String },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);