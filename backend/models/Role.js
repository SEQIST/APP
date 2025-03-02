const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // UNIQUE Name
  abbreviation: { type: String, required: true, unique: true }, // UNIQUE Abkürzung
  description: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // Referenz zur Firma
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null }, // Referenz zur Abteilung
  paymentType: { type: String, enum: ['yearly', 'hourly'], required: true }, // Angestellt (jährlich) oder Freiberuflich (stündlich)
  paymentValue: { type: Number, required: true }, // Jahresgehalt oder Stundensatz
});

// Index für die Kombination von Name und Abkürzung (UNIQUE)
roleSchema.index({ name: 1, abbreviation: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);