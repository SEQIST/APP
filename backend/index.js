// /backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const companyRoutes = require('./routes/companyRoutes');
const triggerRoutes = require('./routes/triggerRoutes');
const workProductRoutes = require('./routes/workProductRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const roleRoutes = require('./routes/roleRoutes');
const recurringTaskRoutes = require('./routes/recurringTaskRoutes');
const processGroupRoutes = require('./routes/processGroupRoutes');
const processRoutes = require('./routes/processRoutes');
const activityRoutes = require('./routes/activityRoutes');
const customerRoutes = require('./routes/customerRoutes');
const releaseRoutes = require('./routes/releaseRoutes');
// const eventRoutes = require('./routes/eventRoutes');
//const projectRoutes = require('./routes/projectRoutes');

const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`Anfrage empfangen: ${req.method} ${req.url}`);
  next();
});

app.use('/api/company', companyRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/workproducts', workProductRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/recurring-tasks', recurringTaskRoutes);
app.use('/api/process-groups', processGroupRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/release', releaseRoutes);
// app.use('/api/event', eventRoutes);
// app.use('/api/projects', projectRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/myapp', {})
  .then(() => console.log('MongoDB connected mit myapp'))
  .catch(err => console.log('MongoDB myapp connection error:', err));

app.listen(5001, () => console.log('Server läuft auf Port 5001 mit 27017'));