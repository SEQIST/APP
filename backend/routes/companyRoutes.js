const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// Firma-Endpunkte
router.post('/', async (req, res) => {
  try {
    await Company.deleteMany({});
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) return res.status(404).json({ error: 'No company found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;