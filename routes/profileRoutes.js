// routes/profileRoutes.js
const express = require('express');
const FarmerProfile = require('../models/FarmerProfile'); // Assume this model exists
const router = express.Router();

// Get profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ farmerId: req.user.id }); // Assuming farmer ID is stored in user session
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.post('/profile', async (req, res) => {
  try {
    const updatedProfile = await FarmerProfile.findOneAndUpdate({ farmerId: req.user.id }, req.body, { new: true });
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
