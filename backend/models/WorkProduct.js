const mongoose = require('mongoose');

const workProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  number: { type: String, required: true }, // Neues Feld: Nummer
  useMode: { 
    type: String, 
    enum: ['None', 'Internal', 'FromCustomer', 'FromSupplier', 'ToCustomer'], 
    default: 'None' 
  }, // Neues Feld: Use Mode
  cost: { type: Number, default: null } // Neues Feld: Kosten (optional)
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkProduct', workProductSchema);