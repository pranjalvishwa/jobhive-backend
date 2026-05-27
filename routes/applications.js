const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, employerOnly } = require('../middleware/auth');

// @POST /api/applications/:jobId - Apply for job
router.post('/:jobId', protect, async (req, res) => {
  try {
    const existing = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id
    });
    if (existing) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter,
      resume: req.user.resume,
    });

    await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicants: 1 } });

    res.status(201).json({ application, message: 'Application submitted!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/applications/me - Get my applications
router.get('/me', protect, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title companyName location type salaryMin salaryMax')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/applications/job/:jobId - Get applications for a job
router.get('/job/:jobId', protect, employerOnly, async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email title avatar skills resume')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PATCH /api/applications/:id/status - Update status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/applications/:id - Withdraw application
router.delete('/:id', protect, async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application withdrawn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;