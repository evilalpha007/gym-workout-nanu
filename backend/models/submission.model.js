const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  questId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeeklyQuest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  pointsAwarded: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('QuestSubmission', submissionSchema);
