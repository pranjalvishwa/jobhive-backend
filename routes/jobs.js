const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, employerOnly } = require('../middleware/auth');

// @GET /api/jobs - Get all jobs with filters
router.get('/', async (req, res) => {
  try {
    const { q, location, type, workMode, experience, category, sort, page = 1, limit = 12 } = req.query;

    let query = { status: 'active' };

    if (q) query.$text = { $search: q };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (workMode) query.workMode = workMode;
    if (experience) query.experienceLevel = experience;
    if (category) query.category = category;

    let sortBy = { createdAt: -1 };
    if (sort === 'salary_desc') sortBy = { salaryMax: -1 };
    if (sort === 'salary_asc') sortBy = { salaryMin: 1 };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('company', 'name avatar companyName');

    res.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/jobs/featured
router.get('/featured', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active', featured: true })
      .limit(6).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name avatar companyName companyWebsite bio');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.views += 1;
    await job.save();
    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/jobs - Create job (employer only)
router.post('/', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      company: req.user._id,
      companyName: req.user.companyName || req.user.name,
    });
    res.status(201).json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/jobs/:id - Update job
router.put('/:id', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ job: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/jobs/:id
router.delete('/:id', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;