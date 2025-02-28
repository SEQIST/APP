const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isJuniorTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null }, // Referenz auf übergeordnete Abteilung
});

module.exports = mongoose.model('Department', departmentSchema);
