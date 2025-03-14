const express = require('express');
const router = express.Router();
const RecurringTask = require('../models/RecurringTask');

router.post('/', async (req, res) => {
  try {
    const task = new RecurringTask(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Fehler beim Erstellen der wiederkehrenden Tätigkeit:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('Starte Abruf der wiederkehrenden Tätigkeiten...');
    const tasks = await RecurringTask.find().populate('role');
    console.log('Wiederkehrende Tätigkeiten abgerufen:', tasks);
    res.json(tasks);
  } catch (error) {
    console.error('Fehler beim Abrufen der wiederkehrenden Tätigkeiten:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await RecurringTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Fehler beim Bearbeiten der wiederkehrenden Tätigkeit:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await RecurringTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Fehler beim Löschen der wiederkehrenden Tätigkeit:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;