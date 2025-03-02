const mongoose = require('mongoose');
const Trigger = require('./Trigger');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Unique innerhalb eines Prozesses
  description: { type: String, required: true }, // WYSIWYG wird als String gespeichert
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }, // Verknüpfung mit Rolle
  process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process', required: true }, // Verknüpfung mit Prozess
  triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Trigger' }, // Verknüpfung mit Trigger
  result: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct', required: true }, // Work Product als Ergebnis
  abbreviation: { type: String, unique: true, required: false }, // Eindeutige Abkürzung, optional
  multiplicator: { type: Number, default: 1 }, // Multiplikator/Compressor
  workMode: { type: String, enum: ['0', '1'], default: '0' }, // Work Mode (0 = Einer, 1 = Jeder)
  timeIfKnown: { type: String }, // Zeit, wenn bekannt
  timeIfNew: { type: String }, // Geschätzte Zeit
  versionMajor: { type: Number, default: 1 }, // Major-Version
  versionMinor: { type: Number, default: 0 }, // Minor-Version, automatisch inkrementiert
  icon: { type: String } // Pfad oder URL für ein Icon/Bild
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);