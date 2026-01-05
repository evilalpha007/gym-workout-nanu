const express = require('express');
const { createUpload, markOffDay } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.post('/', protect, upload.single('media'), createUpload);
router.post('/off-day', protect, markOffDay);

module.exports = router;
