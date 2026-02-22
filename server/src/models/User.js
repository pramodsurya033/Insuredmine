const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    index: true
  },
  dob: Date,
  address: String,
  phone: String,
  state: String,
  zip: String,
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  gender: String,
  userType: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
