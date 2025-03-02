const mongoose = require('mongoose');

const processGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // UNIQUE Name
  abbreviation: { type: String, required: true, unique: true }, // UNIQUE Abkürzung
  description: { type: String, required: true },
});

// Index für die Kombination von Name und Abkürzung (UNIQUE)
processGroupSchema.index({ name: 1, abbreviation: 1 }, { unique: true });

module.exports = mongoose.model('ProcessGroup', processGroupSchema);