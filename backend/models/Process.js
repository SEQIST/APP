const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  name: { type: String }, // Optional, kann leer sein
  abbreviation: { type: String }, // Optional, kann leer sein
  processPurpose: { type: String }, // Optional, kann leer sein
  processGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcessGroup', required: false }, // Optional, kann null sein
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: false }, // Optional, kann null sein
}, {
  timestamps: true, // Fügt createdAt und updatedAt Felder hinzu
});

module.exports = mongoose.model('Process', processSchema);