const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Company = require('./models/Company');
const WorkProduct = require('./models/WorkProduct');
const Department = require('./models/Department');
const Role = require('./models/Role');
const RecurringTask = require('./models/RecurringTask');
const ProcessGroup = require('./models/ProcessGroup');
const Process = require('./models/Process');
const Activity = require('./models/Activity');
const Trigger = require('./models/Trigger');

const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`Anfrage empfangen: ${req.method} ${req.url}`);
  next();
});

mongoose.connect('mongodb://127.0.0.1:27017/myapp', {})
  .then(() => console.log('MongoDB connected mit myapp'))
  .catch(err => console.log('MongoDB myapp connection error:', err));

// Firma-Endpunkte
app.post('/api/company', async (req, res) => {
  try {
    await Company.deleteMany({});
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/company', async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) return res.status(404).json({ error: 'No company found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger-Endpunkte
app.get('/api/triggers', async (req, res) => {
  try {
    const triggers = await Trigger.find().populate('workProducts.workProduct workloadLoad');
    res.json(triggers);
  } catch (error) {
    console.error('Fehler beim Abrufen der Trigger:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

app.post('/api/triggers', async (req, res) => {
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

app.get('/api/triggers/:id', async (req, res) => {
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

// Arbeitsprodukt-Endpunkte
app.get('/api/workproducts', async (req, res) => {
  try {
    const workProducts = await WorkProduct.find();
    res.json(workProducts);
  } catch (error) {
    console.error('Fehler beim Abrufen der Work Products:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

app.post('/api/workproducts', async (req, res) => {
  try {
    const workProduct = new WorkProduct(req.body);
    const savedWorkProduct = await workProduct.save();
    res.status(201).json(savedWorkProduct);
  } catch (error) {
    console.error('Fehler beim Erstellen des Work Products:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

app.put('/api/workproducts/:id', async (req, res) => {
  try {
    const workProduct = await WorkProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workProduct) return res.status(404).json({ error: 'WorkProduct not found' });
    res.json(workProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/workproducts/:id', async (req, res) => {
  try {
    const workProduct = await WorkProduct.findByIdAndDelete(req.params.id);
    if (!workProduct) return res.status(404).json({ error: 'WorkProduct not found' });
    res.json({ message: 'WorkProduct deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Abteilungs-Endpunkte
app.post('/api/departments', async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find().populate('isJuniorTo');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return res.status(404).json({ error: 'Department not found' });
    res.json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rollen-Endpunkte
app.post('/api/roles', async (req, res) => {
  try {
    console.log('Empfangene Daten für Rolle:', req.body); // Debugging
    const role = new Role(req.body);
    const savedRole = await role.save();
    console.log('Gespeicherte Rolle:', savedRole); // Debugging
    res.status(201).json(savedRole);
  } catch (error) {
    console.error('Fehler beim Erstellen der Rolle:', error); // Verbesserte Fehlerprotokollierung
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(400).json({ error: error.message });
  }
});
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await Role.find().populate('company').populate('department');
    res.json(roles.map(role => ({
      ...role._doc,
      dailyWorkload: role.dailyWorkload || role.company.workHoursDayMaxLoad,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/roles/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/roles/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/roles/:id/dailyWorkload', async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, { dailyWorkload: null }, { new: true });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Wiederkehrende Tätigkeiten-Endpunkte
app.post('/api/recurring-tasks', async (req, res) => {
  try {
    const task = new RecurringTask(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/recurring-tasks', async (req, res) => {
  try {
    const tasks = await RecurringTask.find().populate('role');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/recurring-tasks/:id', async (req, res) => {
  try {
    const task = await RecurringTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/recurring-tasks/:id', async (req, res) => {
  try {
    const task = await RecurringTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Prozessgruppen-Endpunkte
app.post('/api/process-groups', async (req, res) => {
  try {
    const newProcessGroup = new ProcessGroup(req.body);
    const savedProcessGroup = await newProcessGroup.save();
    res.status(201).json(savedProcessGroup);
  } catch (error) {
    console.error('Fehler beim Erstellen der Prozessgruppe:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

app.get('/api/process-groups', async (req, res) => {
  try {
    const processGroups = await ProcessGroup.find();
    res.json(processGroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/process-groups/:id', async (req, res) => {
  try {
    const processGroup = await ProcessGroup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!processGroup) return res.status(404).json({ error: 'ProcessGroup not found' });
    res.json(processGroup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/process-groups/:id', async (req, res) => {
  try {
    const processGroup = await ProcessGroup.findByIdAndDelete(req.params.id);
    if (!processGroup) return res.status(404).json({ error: 'ProcessGroup not found' });
    res.json({ message: 'ProcessGroup deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Prozess-Endpunkte
app.get('/api/processes', async (req, res) => {
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

app.get('/api/processes/:id', async (req, res) => {
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

// const mongoose = require('mongoose');
//const Process = require('./models/Process'); // Annahme: Dein Process-Modell

app.put('/api/processes/:id', async (req, res) => {
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

app.post('/api/processes', async (req, res) => {
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

app.delete('/api/processes/:id', async (req, res) => {
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

// Aktivitäten-Endpunkte
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('process')
      .populate('result')
      .populate('executedBy')
      .populate('trigger.workProducts._id'); // Populiere Work Products im Trigger
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('process')
      .populate('result')
      .populate('executedBy')
      .populate('trigger.workProducts._id');
    if (!activity) {
      return res.status(404).json({ error: 'Aktivität nicht gefunden' });
    }
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    // Validierung des Trigger-Feldes
    if (req.body.trigger) {
      const { workProducts, determiningFactorId } = req.body.trigger;
      if (workProducts) {
        // Prüfe, ob determiningFactorId in workProducts enthalten ist
        if (determiningFactorId && !workProducts.some(wp => wp._id.toString() === determiningFactorId.toString())) {
          return res.status(400).json({ error: 'determiningFactorId muss ein Work Product in der Liste sein' });
        }
        // Prüfe, dass nur ein Work Product als bestimmender Faktor markiert ist
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
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    // Validierung des Trigger-Feldes
    if (req.body.trigger) {
      const { workProducts, determiningFactorId } = req.body.trigger;
      if (workProducts) {
        // Prüfe, ob determiningFactorId in workProducts enthalten ist
        if (determiningFactorId && !workProducts.some(wp => wp._id.toString() === determiningFactorId.toString())) {
          return res.status(400).json({ error: 'determiningFactorId muss ein Work Product in der Liste sein' });
        }
        // Prüfe, dass nur ein Work Product als bestimmender Faktor markiert ist
        const determiningFactors = workProducts.filter(wp => wp.isDeterminingFactor);
        if (determiningFactors.length > 1) {
          return res.status(400).json({ error: 'Nur ein Work Product kann der bestimmende Faktor sein' });
        }
      }
    }
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('process')
      .populate('result')
      .populate('executedBy')
      .populate('trigger.workProducts._id');
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(5001, () => console.log('Server läuft auf Port 5001 mit 27017'));