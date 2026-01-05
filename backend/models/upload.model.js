const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Gym Goer', 'Home Workout'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  pointsAwarded: {
    type: Number,
    default: 3
  }
}, { timestamps: true });

// Ensure only one upload per user per day
// This can be checked in the controller, but adding a compound index for day might be complex.
// We'll rely on controller logic and lastDailyUploadDate in User model.

module.exports = mongoose.model('DailyUpload', uploadSchema);
