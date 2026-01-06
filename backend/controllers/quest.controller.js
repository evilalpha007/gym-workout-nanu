const WeeklyQuest = require('../models/quest.model');
const QuestSubmission = require('../models/submission.model');
const User = require('../models/user.model');

// @desc    Create a new quest (Admin)
// @route   POST /api/quests
// @access  Private/Admin
const createQuest = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const quest = await WeeklyQuest.create({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.user._id
    });

    res.status(201).json(quest);
  } catch (error) {
    console.error('Error in createQuest', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get all quests (Active + Past) - or filter?
// @route   GET /api/quests
// @access  Protected
const getQuests = async (req, res) => {
  try {
    // For now get all. Can add query params later.
    const quests = await WeeklyQuest.find({}).sort({ startDate: -1 });
    res.status(200).json(quests);
  } catch (error) {
    console.error('Error in getQuests', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Submit entry for a quest
// @route   POST /api/quests/:id/submit
// @access  Protected
const submitQuestEntry = async (req, res) => {
  try {
    const questId = req.params.id;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if quest is active
    const quest = await WeeklyQuest.findById(questId);
    if (!quest) {
        return res.status(404).json({ error: 'Quest not found' });
    }
    
    // Check if already submitted
    const existingSubmission = await QuestSubmission.findOne({ questId, userId });
    if (existingSubmission) {
        return res.status(400).json({ error: 'You have already submitted for this quest' });
    }

    const submission = await QuestSubmission.create({
        questId,
        userId,
        mediaUrl: req.file.path,
        mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        status: 'pending'
    });

    res.status(201).json(submission);

  } catch (error) {
    console.error('Error in submitQuestEntry', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get submissions for a quest (Admin)
// @route   GET /api/quests/:id/submissions
// @access  Private/Admin
const getQuestSubmissions = async (req, res) => {
    try {
        const submissions = await QuestSubmission.find({ questId: req.params.id }).populate('userId', 'username avatar');
        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error in getQuestSubmissions', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
}

// @desc    Evaluate submission (Admin)
// @route   PUT /api/quests/submissions/:id/evaluate
// @access  Private/Admin
const evaluateSubmission = async (req, res) => {
    try {
        const { status } = req.body; // 'completed' or 'failed'
        const submissionId = req.params.id;

        const submission = await QuestSubmission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (submission.status !== 'pending') {
             return res.status(400).json({ error: 'Submission already evaluated' });
        }

        const user = await User.findById(submission.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (status === 'completed') {
            submission.status = 'completed';
            submission.pointsAwarded = 5;
            user.totalPoints += 5;
        } else if (status === 'failed') {
            submission.status = 'failed';
            submission.pointsAwarded = -3; // Negative points for failure? Logic says: "-3 points"
            // Wait, failure usually means not doing it, or doing it wrong.
            // Requirement: "Failed quest -> -3 points".
            // If they submitted and it was rejected? Yes.
            user.totalPoints -= 3;
        } else {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await submission.save();
        await user.save();

        res.status(200).json(submission);

    } catch (error) {
        console.error('Error in evaluateSubmission', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
}

// @desc    Get current user's quest submissions
// @route   GET /api/quests/my-submissions
// @access  Protected
const getUserQuestSubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const submissions = await QuestSubmission.find({ userId })
            .populate('questId', 'title description startDate endDate')
            .sort({ createdAt: -1 });
        
        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error in getUserQuestSubmissions', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
}

module.exports = {
    createQuest,
    getQuests,
    submitQuestEntry,
    getQuestSubmissions,
    evaluateSubmission,
    getUserQuestSubmissions
};
