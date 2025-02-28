const mongoose = require('mongoose');

const workProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }, // RTF als Text gespeichert
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WorkProduct', workProductSchema);