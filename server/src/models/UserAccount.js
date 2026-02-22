const mongoose = require('mongoose');

const userAccountSchema = new mongoose.Schema({
  account_name: {
    type: String,
    required: true,
    index: true
  },
  account_type: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserAccount', userAccountSchema);
