const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Company = require('./models/Company');
const WorkProduct = require('./models/WorkProduct');
const Department = require('./models/Department');
const Role = require('./models/Role');
const RecurringTask = require('./models/RecurringTask');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/myapp', {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

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

// Arbeitsprodukt-Endpunkte
app.post('/api/workproducts', async (req, res) => {
  try {
    const workProduct = new WorkProduct(req.body);
    await workProduct.save();
    res.status(201).json(workProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/workproducts', async (req, res) => {
  try {
    const workProducts = await WorkProduct.find();
    res.json(workProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const role = new Role(req.body);
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/roles', async (req, res) => {
  try {
    const roles = await Role.find().populate('company').populate('department');
    res.json(roles.map(role => ({
      ...role._doc,
      dailyWorkload: role.dailyWorkload || role.company.workHoursDayMaxLoad, // Default: Max Load aus Firma
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

// Nach den bestehenden Rollen-Endpunkten
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

app.listen(5001, () => console.log('Server läuft auf Port 5001'));