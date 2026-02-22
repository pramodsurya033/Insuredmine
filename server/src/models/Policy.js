const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policy_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  policy_start_date: Date,
  policy_end_date: Date,
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LOB',
    required: true
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  premium_amount: Number,
  policy_type: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Policy', policySchema);
