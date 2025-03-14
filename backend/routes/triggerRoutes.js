const express = require('express');
const router = express.Router();
const Trigger = require('../models/Trigger');

router.get('/', async (req, res) => {
  try {
    const triggers = await Trigger.find().populate('workProducts.workProduct workloadLoad');
    res.json(triggers);
  } catch (error) {
    console.error('Fehler beim Abrufen der Trigger:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const triggerData = req.body;
    console.log('Empfangene Trigger-Daten:', triggerData);
    if (!triggerData.timeTrigger || typeof triggerData.timeTrigger.value !== 'number') {
      return res.status(400).json({ error: 'timeTrigger.value ist erforderlich und muss eine Zahl sein' });
    }
    const trigger = new Trigger(triggerData);
    const savedTrigger = await trigger.save();
    res.status(201).json(savedTrigger);
  } catch (error) {
    console.error('Fehler beim Erstellen des Triggers:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const trigger = await Trigger.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!trigger) return res.status(404).json({ error: 'Trigger nicht gefunden' });
    res.json(trigger);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Triggers:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.get('/:id', async (req, res) => {
  console.log('GET /api/triggers/:id aufgerufen mit ID:', req.params.id);
  try {
    const trigger = await Trigger.findById(req.params.id).populate('workProducts.workProduct workloadLoad');
    if (!trigger) {
      console.log('Kein Trigger gefunden für ID:', req.params.id);
      return res.status(404).json({ error: 'Trigger nicht gefunden' });
    }
    res.json(trigger);
  } catch (error) {
    console.error('Fehler beim Abrufen des Triggers:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

module.exports = router;