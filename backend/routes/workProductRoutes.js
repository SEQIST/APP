const express = require('express');
const router = express.Router();
const WorkProduct = require('../models/WorkProduct');

router.get('/', async (req, res) => {
  try {
    const workProducts = await WorkProduct.find();
    res.json(workProducts);
  } catch (error) {
    console.error('Fehler beim Abrufen der Work Products:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für Work Product:', req.body);
    const workProduct = new WorkProduct(req.body);
    const savedWorkProduct = await workProduct.save();
    console.log('Gespeichertes Work Product:', savedWorkProduct);
    res.status(201).json(savedWorkProduct);
  } catch (error) {
    console.error('Fehler beim Erstellen des Work Products:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Empfangene Daten für Update Work Product:', req.body);
    const workProduct = await WorkProduct.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!workProduct) return res.status(404).json({ error: 'WorkProduct not found' });
    res.json(workProduct);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Work Products:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const workProduct = await WorkProduct.findByIdAndDelete(req.params.id);
    if (!workProduct) return res.status(404).json({ error: 'WorkProduct not found' });
    res.json({ message: 'WorkProduct deleted' });
  } catch (error) {
    console.error('Fehler beim Löschen des Work Products:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;