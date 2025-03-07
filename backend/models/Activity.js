const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  abbreviation: { type: String, required: true, unique: true },
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' },
  result: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' },
  multiplicator: { type: Number, default: 1 },
  workMode: { type: String, default: '0' },
  knownTime: { type: String, default: '0' },
  estimatedTime: { type: String, default: '0' },
  timeUnit: { type: String, default: 'minutes' },
  versionMajor: { type: Number, default: 1 },
  versionMinor: { type: Number, default: 0 },
  icon: { type: String },
  trigger: {
    workProducts: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct', required: true },
        completionPercentage: { type: Number, required: true, min: 0, max: 100 },
        isDeterminingFactor: { type: Boolean, default: false },
      },
    ],
    determiningFactorId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);