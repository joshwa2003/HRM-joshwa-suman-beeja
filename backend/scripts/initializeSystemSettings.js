const mongoose = require('mongoose');
const SystemSettings = require('../models/SystemSettings');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const initializeSystemSettings = async () => {
  try {
    console.log('🔧 Initializing System Settings...');
    
    // Use the model's built-in initialization method
    const settingsCount = await SystemSettings.initializeDefaults();
    console.log(`✅ Initialized ${settingsCount} default system settings`);

    // Verify critical attendance settings exist
    const workHours = await SystemSettings.getWorkHours();
    console.log('📋 Work Hours Configuration:');
    console.log(`   Check-in Time: ${workHours.checkInTime}`);
    console.log(`   Check-out Time: ${workHours.checkOutTime}`);
    console.log(`   Working Hours: ${workHours.workingHours}`);
    console.log(`   Minimum Hours: ${workHours.minimumWorkHours}`);
    console.log(`   Late Threshold: ${workHours.lateThreshold * 60} minutes`);

    console.log('🎉 System Settings initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing system settings:', error);
    throw error;
  }
};

// If this script is run directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('📊 MongoDB connected for system settings initialization');
    await initializeSystemSettings();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
}

module.exports = initializeSystemSettings;
