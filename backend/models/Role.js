const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  paymentType: { type: String, enum: ['yearly', 'hourly'], required: true },
  paymentValue: { type: Number, required: true },
  dailyWorkload: { type: Number, default: null }, // Neue tägliche Arbeitsbelastung (optional)
});

module.exports = mongoose.model('Role', roleSchema);