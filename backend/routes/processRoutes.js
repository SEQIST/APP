const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Process = require('../models/Process');

router.get('/', async (req, res) => {
  try {
    const processes = await Process.find().populate('owner processGroup');
    if (!processes || processes.length === 0) {
      return res.status(404).json({ error: 'Keine Prozesse gefunden' });
    }
    res.json(processes);
  } catch (error) {
    console.error('Fehler beim Abrufen der Prozesse:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const process = await Process.findById(req.params.id).populate('owner processGroup');
    if (!process) {
      return res.status(404).json({ error: 'Prozess nicht gefunden' });
    }
    res.json(process);
  } catch (error) {
    console.error('Fehler beim Abrufen des Prozesses:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Ungültige Prozess-ID' });
    }

    const { name, abbreviation, workProducts } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (abbreviation !== undefined) updateData.abbreviation = abbreviation;
    if (workProducts !== undefined) {
      updateData.workProducts = workProducts.map(wp => ({
        workProductId: new mongoose.Types.ObjectId(wp.workProductId),
        known: Number(wp.known) || 0,
        unknown: Number(wp.unknown) || 0,
      }));
    }

    console.log('Empfangene Daten:', JSON.stringify(updateData, null, 2));

    const updatedProcess = await Process.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner processGroup');

    if (!updatedProcess) {
      return res.status(404).json({ error: 'Prozess nicht gefunden' });
    }

    res.json(updatedProcess);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Prozesses:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler', details: Object.values(error.errors).map(e => e.message) });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Ungültiges Datenformat', details: error.message });
    }
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const cleanedProcess = {
      ...req.body,
      processGroup: req.body.processGroup ? new mongoose.Types.ObjectId(req.body.processGroup) : null,
      owner: req.body.owner ? new mongoose.Types.ObjectId(req.body.owner) : null,
    };
    const newProcess = new Process(cleanedProcess);
    const savedProcess = await newProcess.save();
    res.status(201).json(savedProcess);
  } catch (error) {
    console.error('Fehler beim Erstellen des Prozesses:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedProcess = await Process.findByIdAndDelete(req.params.id);
    if (!deletedProcess) {
      return res.status(404).json({ error: 'Prozess nicht gefunden' });
    }
    res.json({ message: 'Prozess erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Prozesses:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;