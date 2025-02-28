const mongoose = require('mongoose');

const recurringTaskSchema = new mongoose.Schema({
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }, // Referenz zur Rolle
  name: { type: String, required: true },
  frequency: { type: Number, required: true }, // Wie oft (z. B. 1)
  rhythm: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'], default: 'daily' }, // Zeitrhythmus
  duration: { type: Number, required: true }, // Dauer
  unit: { type: String, enum: ['minutes', 'hours', 'days'], default: 'minutes' }, // Zeiteinheit
});

module.exports = mongoose.model('RecurringTask', recurringTaskSchema);
