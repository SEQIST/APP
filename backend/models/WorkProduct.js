const mongoose = require('mongoose');

const workProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkProduct', workProductSchema);