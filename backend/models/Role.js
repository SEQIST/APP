const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  abbreviation: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  paymentType: { type: String, enum: ['yearly', 'hourly'], required: true },
  paymentValue: { type: Number, required: true },
  numberOfHolders: { type: Number, default: 0, min: 0 }, // Neues Feld: Anzahl der Rolleninhaber
});

// Index für die Kombination von Name und Abkürzung (UNIQUE)
roleSchema.index({ name: 1, abbreviation: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);