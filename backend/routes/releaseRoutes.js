const express = require('express');
const router = express.Router();
const Release = require('../models/Release');

router.get('/', async (req, res) => {
  try {
    const releases = await Release.find().populate('project workProducts.workProductId');
    console.log('Geladene Releases:', releases);
    res.json(releases);
  } catch (error) {
    console.error('Fehler beim Abrufen der Releases:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für neues Release:', req.body);
    const release = new Release(req.body);
    const savedRelease = await release.save();
    console.log('Gespeichertes Release:', savedRelease);
    res.status(201).json(savedRelease);
  } catch (error) {
    console.error('Fehler beim Erstellen des Releases:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Empfangene Daten für Update Release:', req.body);
    const release = await Release.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!release) return res.status(404).json({ error: 'Release nicht gefunden' });
    res.json(release);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Releases:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

module.exports = router;