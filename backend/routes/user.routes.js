const express = require('express');
const { 
  getLeaderboard,
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  deleteUser 
} = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route('/leaderboard').get(protect, getLeaderboard);
router.route('/profile').put(protect, upload.single('avatar'), updateUserProfile);
router.route('/:username').get(protect, getUserProfile); 

// Admin routes
router.route('/').get(protect, admin, getAllUsers);
router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;
