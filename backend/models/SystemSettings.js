const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    default: 'general'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to initialize default system settings
systemSettingsSchema.statics.initializeDefaults = async function() {
  const defaultSettings = [
    {
      key: 'work_hours_check_in_time',
      value: '09:00',
      description: 'Default check-in time for employees',
      category: 'attendance'
    },
    {
      key: 'work_hours_check_out_time',
      value: '18:00',
      description: 'Default check-out time for employees',
      category: 'attendance'
    },
    {
      key: 'work_hours_working_hours',
      value: 9,
      description: 'Standard working hours per day',
      category: 'attendance'
    },
    {
      key: 'work_hours_minimum_work_hours',
      value: 8,
      description: 'Minimum required working hours per day',
      category: 'attendance'
    },
    {
      key: 'work_hours_late_threshold',
      value: 0.25,
      description: 'Late threshold in hours (0.25 = 15 minutes)',
      category: 'attendance'
    },
    {
      key: 'work_hours_overtime_threshold',
      value: 9,
      description: 'Overtime threshold in hours',
      category: 'attendance'
    },
    {
      key: 'work_hours_break_duration',
      value: 1,
      description: 'Break duration in hours',
      category: 'attendance'
    },
    {
      key: 'auto_checkout_enabled',
      value: true,
      description: 'Enable automatic checkout for employees',
      category: 'attendance'
    },
    {
      key: 'auto_checkout_time',
      value: '19:00',
      description: 'Time for automatic checkout',
      category: 'attendance'
    },
    {
      key: 'notification_enabled',
      value: true,
      description: 'Enable system notifications',
      category: 'notifications'
    },
    {
      key: 'email_notifications_enabled',
      value: true,
      description: 'Enable email notifications',
      category: 'notifications'
    }
  ];

  let settingsCount = 0;
  
  for (const setting of defaultSettings) {
    try {
      const existingSetting = await this.findOne({ key: setting.key });
      if (!existingSetting) {
        await this.create(setting);
        settingsCount++;
        console.log(`✅ Created setting: ${setting.key}`);
      } else {
        console.log(`⚠️  Setting already exists: ${setting.key}`);
      }
    } catch (error) {
      console.error(`❌ Error creating setting ${setting.key}:`, error.message);
    }
  }

  return settingsCount;
};

// Static method to get work hours configuration
systemSettingsSchema.statics.getWorkHours = async function() {
  const settings = await this.find({ 
    key: { 
      $in: [
        'work_hours_check_in_time',
        'work_hours_check_out_time', 
        'work_hours_working_hours',
        'work_hours_minimum_work_hours',
        'work_hours_late_threshold',
        'work_hours_overtime_threshold',
        'work_hours_break_duration'
      ] 
    } 
  });

  const workHours = {
    checkInTime: '09:00',
    checkOutTime: '18:00',
    workingHours: 9,
    minimumWorkHours: 8,
    lateThreshold: 0.25,
    overtimeThreshold: 9,
    breakDuration: 1
  };

  settings.forEach(setting => {
    switch (setting.key) {
      case 'work_hours_check_in_time':
        workHours.checkInTime = setting.value;
        break;
      case 'work_hours_check_out_time':
        workHours.checkOutTime = setting.value;
        break;
      case 'work_hours_working_hours':
        workHours.workingHours = setting.value;
        break;
      case 'work_hours_minimum_work_hours':
        workHours.minimumWorkHours = setting.value;
        break;
      case 'work_hours_late_threshold':
        workHours.lateThreshold = setting.value;
        break;
      case 'work_hours_overtime_threshold':
        workHours.overtimeThreshold = setting.value;
        break;
      case 'work_hours_break_duration':
        workHours.breakDuration = setting.value;
        break;
    }
  });

  return workHours;
};

// Static method to get a specific setting by key
systemSettingsSchema.statics.getSetting = async function(key) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

// Static method to set a specific setting
systemSettingsSchema.statics.setSetting = async function(key, value, description = '', category = 'general', updatedBy = null) {
  const setting = await this.findOneAndUpdate(
    { key },
    { 
      value, 
      description, 
      category, 
      updatedBy,
      updatedAt: new Date()
    },
    { 
      upsert: true, 
      new: true 
    }
  );
  return setting;
};

// Static method to get settings by category
systemSettingsSchema.statics.getSettingsByCategory = async function(category) {
  const settings = await this.find({ category });
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
