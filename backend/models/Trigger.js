const mongoose = require('mongoose');

const triggerSchema = new mongoose.Schema({
  workProducts: [{
    workProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' },
    completeness: { type: Number, min: 0, max: 100 },
  }],
  andOr: { type: String, enum: ['AND', 'OR'] },
  timeTrigger: {
    unit: { type: String, enum: ['sec', 'min', 'hour', 'day', 'week', 'month', 'year'] },
    value: { type: Number, required: true },
    repetition: { type: String } // Z. B. "every first Monday of every 2nd month"
  },
  workloadLoad: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' } // Bestimmendes Arbeitsprodukt für Arbeitslast
});

module.exports = mongoose.model('Trigger', triggerSchema);