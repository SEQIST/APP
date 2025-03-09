const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  name: { type: String, required: false }, // Optional, kann leer sein
  abbreviation: { type: String, required: false }, // Optional, kann leer sein
  processPurpose: { type: String, required: false }, // Optional, kann leer sein
  processGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcessGroup', required: false }, // Optional, kann null sein
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: false }, // Optional, kann null sein
  workProducts: [{
    workProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct', required: true },
    known: { type: Number, default: 0, min: 0 },
    unknown: { type: Number, default: 0, min: 0 },
  }],
}, {
  timestamps: true, // Fügt createdAt und updatedAt auf Dokument-Ebene hinzu
});

module.exports = mongoose.model('Process', processSchema);