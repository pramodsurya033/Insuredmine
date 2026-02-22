const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agent_name: {
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

module.exports = mongoose.model('Agent', agentSchema);
