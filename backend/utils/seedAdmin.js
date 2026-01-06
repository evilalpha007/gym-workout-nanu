const User = require('../models/user.model');

const seedAdmin = async () => {
    try {
        // Check for the specific admin username
        let adminExists = await User.findOne({ username: 'slimshady' });
        
        if (!adminExists) {
            // Check for any old admin accounts and update/replace
            const oldAdmins = await User.find({ role: 'admin' });
            
            if (oldAdmins.length > 0) {
                // Update the first found admin or just create new one
                const firstAdmin = oldAdmins[0];
                firstAdmin.username = 'slimshady';
                firstAdmin.password = 'Ajeet@0306u';
                firstAdmin.email = 'admin@fitnessleague.com';
                firstAdmin.bio = 'System Administrator';
                await firstAdmin.save();
                console.log('Existing admin updated to "slimshady"');
            } else {
                // Create new admin
                await User.create({
                    username: 'slimshady',
                    email: 'admin@fitnessleague.com',
                    password: 'Ajeet@0306u', // Will be hashed by pre-save hook
                    role: 'admin',
                    targetWorkoutDaysPerWeek: 7,
                    bio: 'System Administrator'
                });
                console.log('Admin user created (slimshady / Ajeet@0306u)');
            }
        } else {
            // Ensure exact password and role if user exists
            adminExists.password = 'Ajeet@0306u';
            adminExists.role = 'admin';
            await adminExists.save();
            console.log('Admin user "slimshady" credentials verified/updated');
        }
    } catch (error) {
        console.error('Error seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
