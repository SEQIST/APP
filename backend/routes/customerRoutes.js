// /backend/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kunden:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für neuen Kunden:', req.body);
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
    console.log('Gespeicherter Kunde:', savedCustomer);
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error('Fehler beim Erstellen des Kunden:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Empfangene Daten für Update Kunde:', req.body);
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ error: 'Kunde nicht gefunden' });
    res.json(customer);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Kunden:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Kunde nicht gefunden' });
    res.json({ message: 'Kunde gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Kunden:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

module.exports = router;