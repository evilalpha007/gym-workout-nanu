const User = require('../models/user.model');

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        
        if (!adminExists) {
            await User.create({
                username: 'admin',
                email: 'admin@admin.com',
                password: 'admin', // Will be hashed by pre-save hook
                role: 'admin',
                targetWorkoutDaysPerWeek: 7, // Default
                bio: 'System Administrator'
            });
            console.log('Admin user created (admin / admin)');
        } else {
            // Optional: Ensure admin always has admin role
            if (adminExists.role !== 'admin') {
                adminExists.role = 'admin';
                await adminExists.save();
                console.log('Admin role restored for user "admin"');
            }
        }
    } catch (error) {
        console.error('Error seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
