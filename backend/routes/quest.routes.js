const express = require('express');
const { 
    createQuest, 
    getQuests, 
    submitQuestEntry, 
    getQuestSubmissions, 
    evaluateSubmission,
    getUserQuestSubmissions
} = require('../controllers/quest.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Public/Protected
router.route('/').get(protect, getQuests);
router.route('/my-submissions').get(protect, getUserQuestSubmissions);
router.route('/:id/submit').post(protect, upload.single('media'), submitQuestEntry);

// Admin Routes
router.route('/').post(protect, admin, createQuest);
router.route('/:id/submissions').get(protect, admin, getQuestSubmissions);
router.route('/submissions/:id/evaluate').put(protect, admin, evaluateSubmission);

module.exports = router;
