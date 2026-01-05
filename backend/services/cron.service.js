const cron = require('node-cron');
const User = require('../models/user.model');

const setupCronJobs = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily missed workout check...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find users who:
      // 1. Did NOT upload yesterday (lastDailyUploadDate < today's start)
      // NOTE: Strictly "yesterday" logic depends on run time. 
      // If run at 00:00, "today" became "today". 
      // User must have uploaded between Yesterday 00:00 and Yesterday 23:59.
      // So lastDailyUploadDate should be >= Yesterday 00:00.
      
      // Easier logic: Get all users. 
      // If valid upload date < Yesterday 00:00 -> Missed multiple days, but we apply penalty daily.
      // We just need to check if they did NOT upload yesterday.
      // So if lastDailyUploadDate < Yesterday 00:00 OR null.
      // AND lastOffDayDate < Yesterday 00:00 (didn't take yesterday off).

      const users = await User.find({});

      for (const user of users) {
        // Parse dates
        const lastUpload = user.lastDailyUploadDate ? new Date(user.lastDailyUploadDate) : new Date(0); // Epoch if null
        lastUpload.setHours(0,0,0,0);
        
        const lastOff = user.lastOffDayDate ? new Date(user.lastOffDayDate) : new Date(0);
        lastOff.setHours(0,0,0,0);

        // Check for yesterday
        // yesterday variable is set to (Now - 1 day) at 00:00.
        // If lastUpload < yesterday (meaning before yesterday 00:00), then they missed yesterday.
        
        const uploadedYesterday = lastUpload.getTime() === yesterday.getTime();
        const offYesterday = lastOff.getTime() === yesterday.getTime();

        if (!uploadedYesterday && !offYesterday) {
            // Apply Penalty
            user.totalPoints -= 1;
            console.log(`Applied penalty to user ${user.username}`);
            await user.save();
        }
      }
      console.log('Daily check complete.');
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  // Run every Sunday at midnight to reset offDaysUsedThisWeek
  cron.schedule('0 0 * * 0', async () => {
      console.log('Resetting weekly stats...');
      try {
          await User.updateMany({}, { offDaysUsedThisWeek: 0 });
          console.log('Weekly stats reset.');
      } catch (error) {
          console.error('Weekly reset error:', error);
      }
  });
};

module.exports = setupCronJobs;
