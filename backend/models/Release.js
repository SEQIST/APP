const mongoose = require('mongoose');

const releaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  workProducts: [{
    workProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Release = mongoose.models.Release || mongoose.model('Release', releaseSchema);
module.exports = Release;