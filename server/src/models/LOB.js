const mongoose = require('mongoose');

const lobSchema = new mongoose.Schema({
  category_name: {
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

module.exports = mongoose.model('LOB', lobSchema);
