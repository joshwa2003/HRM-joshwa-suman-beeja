const express = require('express');
const router = express.Router();
const { auth, roleAccess } = require('../middleware/auth');
const SystemSettings = require('../models/SystemSettings');

// Helper function to categorize settings
const getCategoryForSetting = (key) => {
  const workHoursKeys = ['checkInTime', 'checkOutTime', 'workingHours', 'minimumWorkHours', 'lateThreshold', 'breakTime'];
  const notificationKeys = ['enableEmailNotifications'];
  
  if (workHoursKeys.includes(key)) return 'workHours';
  if (notificationKeys.includes(key)) return 'notifications';
  return 'general';
};

// Get system settings for work hours
const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.find({
      category: { $in: ['workHours', 'general', 'notifications'] }
    });
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    // Default values if not set
    const defaultSettings = {
      checkInTime: '09:00',
      checkOutTime: '18:00',
      workingHours: 8,
      minimumWorkHours: 6,
      lateThreshold: 30,
      breakTime: 60,
      enableAutoFreeze: false,
      freezeAfterDays: 30,
      requireApprovalWorkflow: true,
      maxTasksPerDay: 20,
      enableEmailNotifications: true
    };
    
    res.json({ ...defaultSettings, ...settingsObj });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system settings', error: error.message });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user.id;
    
    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await SystemSettings.findOneAndUpdate(
        { key },
        { 
          value, 
          updatedBy: userId,
          category: getCategoryForSetting(key)
        },
        { upsert: true, new: true }
      );
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// Get system settings
router.get('/settings', auth, getSystemSettings);

// Update system settings (Admin and HR Manager only)
router.put('/settings', auth, roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']), updateSystemSettings);

module.exports = router;
