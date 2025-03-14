const express = require('express');
const router = express.Router();
const ProcessGroup = require('../models/ProcessGroup');

router.post('/', async (req, res) => {
  try {
    const newProcessGroup = new ProcessGroup(req.body);
    const savedProcessGroup = await newProcessGroup.save();
    res.status(201).json(savedProcessGroup);
  } catch (error) {
    console.error('Fehler beim Erstellen der Prozessgruppe:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

router.get('/', async (req, res) => {
  try {
    const processGroups = await ProcessGroup.find();
    res.json(processGroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const processGroup = await ProcessGroup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!processGroup) return res.status(404).json({ error: 'ProcessGroup not found' });
    res.json(processGroup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const processGroup = await ProcessGroup.findByIdAndDelete(req.params.id);
    if (!processGroup) return res.status(404).json({ error: 'ProcessGroup not found' });
    res.json({ message: 'ProcessGroup deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;