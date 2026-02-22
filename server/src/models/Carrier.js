const mongoose = require('mongoose');

const carrierSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Carrier', carrierSchema);
