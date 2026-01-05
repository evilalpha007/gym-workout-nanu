const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  targetWorkoutDaysPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1625213600/sample.jpg'
  },
  age: Number,
  height: Number,
  weight: Number,
  bio: String,
  totalPoints: {
    type: Number,
    default: 0
  },
  offDaysUsedThisWeek: {
    type: Number,
    default: 0
  },
  lastOffDayDate: Date,
  lastDailyUploadDate: Date,
}, { timestamps: true });

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
