// /backend/models/Role.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  description: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false }, // Hinzugefügt
  paymentType: { type: String, enum: ['yearly', 'hourly'], default: 'yearly' },
  paymentValue: { type: Number, default: 0 },
  numberOfHolders: { type: Number, default: 0 },
  dailyWorkload: { type: Number, default: null },
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
module.exports = Role;