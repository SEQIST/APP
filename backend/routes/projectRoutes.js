const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    console.log('Geladene Projekte:', projects);
    res.json(projects);
  } catch (error) {
    console.error('Fehler beim Abrufen der Projekte:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projekt nicht gefunden' });
    res.json(project);
  } catch (error) {
    console.error('Fehler beim Abrufen des Projekts:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für neues Projekt:', req.body);
    const project = new Project(req.body);
    const savedProject = await project.save();
    console.log('Gespeichertes Projekt:', savedProject);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Fehler beim Erstellen des Projekts:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Empfangene Daten für Update Projekt:', req.body);
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Projekt nicht gefunden' });
    res.json(project);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Projekts:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projekt nicht gefunden' });
    res.json({ message: 'Projekt gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Projekts:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

module.exports = router;