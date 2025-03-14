const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('release');
    console.log('Geladene Events:', events);
    res.json(events);
  } catch (error) {
    console.error('Fehler beim Abrufen der Events:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für neues Event:', req.body);
    const event = new Event(req.body);
    const savedEvent = await event.save();
    console.log('Gespeichertes Event:', savedEvent);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Fehler beim Erstellen des Events:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Empfangene Daten für Update Event:', req.body);
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ error: 'Event nicht gefunden' });
    res.json(event);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Events:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

module.exports = router;