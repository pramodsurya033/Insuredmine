const ScheduledMessage = require('../models/ScheduledMessage');

class ScheduledMessageService {
  constructor() {
    this.messageQueue = [];
    this.isProcessing = false;
  }

  async createScheduledMessage(message, day, time) {
    try {
      // Parse day and time
      const scheduledDate = this.parseScheduledDateTime(day, time);

      if (!scheduledDate) {
        throw new Error('Invalid day or time format. Use format: "Monday" for day and "14:30" for time');
      }

      const scheduledMsg = await ScheduledMessage.create({
        message,
        scheduled_day: day,
        scheduled_time: time,
        scheduled_date: scheduledDate,
        is_sent: false
      });

      console.log(`Scheduled message created: ${scheduledMsg._id}`);
      return {
        success: true,
        message: 'Message scheduled successfully',
        data: scheduledMsg
      };
    } catch (error) {
      throw new Error(`Error creating scheduled message: ${error.message}`);
    }
  }

  parseScheduledDateTime(day, time) {
    try {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = days.indexOf(day.toLowerCase());

      if (dayIndex === -1) {
        return null;
      }

      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        return null;
      }

      const now = new Date();
      const currentDay = now.getDay();
      let daysAhead = dayIndex - currentDay;

      if (daysAhead <= 0) {
        daysAhead += 7;
      }

      const scheduledDate = new Date(now);
      scheduledDate.setDate(scheduledDate.getDate() + daysAhead);
      scheduledDate.setHours(hours, minutes, 0, 0);

      return scheduledDate;
    } catch (error) {
      console.error('Error parsing scheduled date time:', error);
      return null;
    }
  }

  async processPendingMessages() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const now = new Date();
      const pendingMessages = await ScheduledMessage.find({
        is_sent: false,
        scheduled_date: { $lte: now }
      });

      for (const msg of pendingMessages) {
        try {
          // Message is "sent" (you can integrate with actual messaging service here)
          msg.is_sent = true;
          msg.sent_at = new Date();
          await msg.save();
          console.log(`✓ Message sent: "${msg.message}"`);
        } catch (error) {
          console.error(`Error sending message ${msg._id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error processing pending messages:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  startProcessing(intervalMs = 60000) {
    console.log('Scheduled message processor started');
    this.processingInterval = setInterval(() => {
      this.processPendingMessages();
    }, intervalMs);
  }

  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      console.log('Scheduled message processor stopped');
    }
  }
}

module.exports = ScheduledMessageService;
