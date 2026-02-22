const express = require('express');
const ScheduledMessageService = require('../services/ScheduledMessageService');

const router = express.Router();
const messageService = new ScheduledMessageService();

// Start processing scheduled messages on route initialization
messageService.startProcessing();

/**
 * POST /api/messages/schedule
 * Create a scheduled message
 * Body: { message, day, time }
 * Example: { "message": "Hello", "day": "Monday", "time": "14:30" }
 */
router.post('/schedule', async (req, res) => {
  try {
    const { message, day, time } = req.body;

    if (!message || !day || !time) {
      return res.status(400).json({ 
        error: 'message, day, and time are required' 
      });
    }

    const result = await messageService.createScheduledMessage(message, day, time);
    res.json(result);
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
