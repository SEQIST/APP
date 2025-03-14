const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name der Aktivität
  description: { type: String, required: true }, // Beschreibung der Aktivität
  abbreviation: { type: String, required: true, unique: true }, // Abkürzung, muss eindeutig sein
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }, // Referenz auf die ausführende Rolle
  process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' }, // Referenz auf den zugehörigen Prozess
  result: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' }, // Referenz auf das resultierende Work Product
  multiplicator: { type: Number, default: 1 }, // Multiplikator für die Zeitberechnung
  compressor: { type: String, enum: ['multiply', 'compress'], default: 'multiply' }, // Kalkulationsfaktor (multiply/compress)
  executionMode: { type: String, enum: ['parallel', 'forEach'], default: 'parallel' }, // Modus der Ausführung (Parallel/Sequentiell)
  workMode: { type: String, enum: ['Einer', 'Jeder', 'Geteilt'], default: 'Einer' }, // Arbeitsmodus
  knownTime: { type: Number, default: 0 }, // Bekannte Zeit in Stunden
  estimatedTime: { type: Number, default: 0 }, // Geschätzte Zeit in Stunden
  timeUnit: { type: String, enum: ['minutes', 'hours'], default: 'hours' }, // Einheit der Zeitwerte
  versionMajor: { type: Number, default: 1 }, // Hauptversion
  versionMinor: { type: Number, default: 0 }, // Nebenversion
  icon: { type: String }, // Optionaler Icon für die Darstellung
  trigger: {
    workProducts: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct', required: true }, // Referenz auf Work Product
        completionPercentage: { type: Number, required: true, min: 0, max: 100 }, // Abgeschlossener Prozentsatz
        isDeterminingFactor: { type: Boolean, default: false }, // Ist bestimmender Faktor?
      },
    ],
    determiningFactorId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' }, // Bestimmender Faktor
  },
}, { timestamps: true }); // Automatische Erstellung von createdAt und updatedAt

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
module.exports = Activity;