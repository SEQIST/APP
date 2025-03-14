// /backend/routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const Role = require('../models/Role');

router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für Rolle:', req.body);
    const role = new Role(req.body);
    const savedRole = await role.save();
    console.log('Gespeicherte Rolle:', savedRole);
    res.status(201).json(savedRole);
  } catch (error) {
    console.error('Fehler beim Erstellen der Rolle:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('Starte Abruf von Rollen...');
    const roles = await Role.find()
      .populate('company') // Jetzt möglich, da das Feld im Schema vorhanden ist
      .populate('department');
    console.log('Rollen abgerufen:', roles);
    res.json(roles.map(role => ({
      ...role._doc,
      dailyWorkload: role.dailyWorkload || (role.company ? role.company.workHoursDayMaxLoad : 6.8), // Sicherheitsprüfung
    })));
  } catch (error) {
    console.error('Fehler beim Abrufen der Rollen:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (error) {
    console.error('Fehler beim Bearbeiten der Rolle:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json({ message: 'Role deleted' });
  } catch (error) {
    console.error('Fehler beim Löschen der Rolle:', error);
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/dailyWorkload', async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, { dailyWorkload: null }, { new: true });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (error) {
    console.error('Fehler beim Zurücksetzen der Arbeitslast:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;