const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  scheduled_day: String,
  scheduled_time: String,
  scheduled_date: Date,
  is_sent: {
    type: Boolean,
    default: false
  },
  sent_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema);
