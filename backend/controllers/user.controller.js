const User = require('../models/user.model');
const DailyUpload = require('../models/upload.model');

// @desc    Get leaderboard (Public/Protected)
// @route   GET /api/users/leaderboard
// @access  Protected (User)
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select('username avatar totalPoints')
      .sort({ totalPoints: -1, username: 1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getLeaderboard', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get user public profile by username
// @route   GET /api/users/:username
// @access  Protected
const getUserProfile = async (req, res) => {
  try {
    let username = req.params.username;
    console.log(`[DEBUG] getUserProfile params.username: ${username}`);
    
    // Handle "me" alias to get current user's profile
    if (username === 'me') {
       if (!req.user) {
         console.log('[DEBUG] "me" requested but no req.user');
         return res.status(401).json({ error: 'Not authorized' });
       }
       username = req.user.username;
       console.log(`[DEBUG] "me" resolved to username: ${username}`);
    }

    const user = await User.findOne({ username }).select('-password');
    console.log(`[DEBUG] User findOne result: ${user ? 'Found' : 'Not Found'}`);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's gallery (all uploads)
    const uploads = await DailyUpload.find({ userId: user._id }).sort({ createdAt: -1 });

    res.status(200).json({ user, gallery: uploads });
  } catch (error) {
    console.error('Error in getUserProfile', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Protected
const updateUserProfile = async (req, res) => {
  console.log('[DEBUG] updateUserProfile called');
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.age = req.body.age || user.age;
      user.height = req.body.height || user.height;
      user.weight = req.body.weight || user.weight;
      user.bio = req.body.bio || user.bio;
      
      // Handle avatar file upload
      if (req.file) {
        console.log('[DEBUG] File received:', req.file);
        user.avatar = req.file.path;
      } else if (req.body.avatar) {
        user.avatar = req.body.avatar; 
      }
      
      const updatedUser = await user.save();
      console.log('[DEBUG] User updated successfully');
      
      res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        age: updatedUser.age,
        height: updatedUser.height,
        weight: updatedUser.weight,
        targetWorkoutDaysPerWeek: updatedUser.targetWorkoutDaysPerWeek
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('❌ Error in updateUserProfile:', error); // Log full error
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getAllUsers', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      
      // Also delete their uploads? Ideally yes, but skipping complex cleanup for now to stick to core speed.
      // In a real app we'd delete from Cloudinary and DB.
      await DailyUpload.deleteMany({ userId: user._id });

      res.status(200).json({ message: 'User removed' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in deleteUser', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  getLeaderboard,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser
};
