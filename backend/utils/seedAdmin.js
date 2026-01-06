const User = require('../models/user.model');

const seedAdmin = async () => {
    try {
        // Check for both old and new admin usernames
        let adminExists = await User.findOne({ username: 'ajeetadmin' });
        
        if (!adminExists) {
            // Check if old admin exists and update it
            const oldAdmin = await User.findOne({ username: 'admin' });
            if (oldAdmin) {
                oldAdmin.username = 'ajeetadmin';
                oldAdmin.bio = 'Ajeet - System Administrator';
                await oldAdmin.save();
                console.log('Admin username updated to "ajeetadmin"');
            } else {
                // Create new admin
                await User.create({
                    username: 'ajeetadmin',
                    email: 'ajeet@admin.com',
                    password: 'admin', // Will be hashed by pre-save hook
                    role: 'admin',
                    targetWorkoutDaysPerWeek: 7, // Default
                    bio: 'Ajeet - System Administrator'
                });
                console.log('Admin user created (ajeetadmin / admin)');
            }
        } else {
            // Optional: Ensure admin always has admin role
            if (adminExists.role !== 'admin') {
                adminExists.role = 'admin';
                await adminExists.save();
                console.log('Admin role restored for user "ajeetadmin"');
            }
        }
    } catch (error) {
        console.error('Error seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
