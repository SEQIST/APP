const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

router.get('/', async (req, res) => {
  try {
    console.log('Starte Abruf von Activities...');
    const activities = await Activity.find()
      .populate('process')
      .populate('executedBy')
      .populate('result');
    console.log('Activities abgerufen:', activities);
    res.json(activities);
  } catch (error) {
    console.error('Fehler beim Abrufen der Activities:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('process')
      .populate('executedBy')
      .populate('result');
    if (!activity) {
      return res.status(404).json({ error: 'Aktivität nicht gefunden' });
    }
    res.status(200).json(activity);
  } catch (error) {
    console.error('Fehler beim Abrufen der Aktivität:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (req.body.trigger) {
      const { workProducts, determiningFactorId } = req.body.trigger;
      if (workProducts) {
        if (determiningFactorId && !workProducts.some(wp => wp._id.toString() === determiningFactorId.toString())) {
          return res.status(400).json({ error: 'determiningFactorId muss ein Work Product in der Liste sein' });
        }
        const determiningFactors = workProducts.filter(wp => wp.isDeterminingFactor);
        if (determiningFactors.length > 1) {
          return res.status(400).json({ error: 'Nur ein Work Product kann der bestimmende Faktor sein' });
        }
      }
    }
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Fehler beim Erstellen der Aktivität:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.body.trigger) {
      const { workProducts, determiningFactorId } = req.body.trigger;
      if (workProducts) {
        if (determiningFactorId && !workProducts.some(wp => wp._id.toString() === determiningFactorId.toString())) {
          return res.status(400).json({ error: 'determiningFactorId muss ein Work Product in der Liste sein' });
        }
        const determiningFactors = workProducts.filter(wp => wp.isDeterminingFactor);
        if (determiningFactors.length > 1) {
          return res.status(400).json({ error: 'Nur ein Work Product kann der bestimmende Faktor sein' });
        }
      }
    }
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('process')
      .populate('executedBy')
      .populate('result');
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Aktivität:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    console.error('Fehler beim Löschen der Aktivität:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;