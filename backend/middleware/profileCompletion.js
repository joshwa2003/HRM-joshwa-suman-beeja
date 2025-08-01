const User = require('../models/User');

// Middleware to check if user has completed 75% of their profile
const checkProfileCompletion = async (req, res, next) => {
  try {
    // Skip profile completion check for certain routes
    const exemptRoutes = [
      '/api/auth/profile',
      '/api/auth/profile-completion',
      '/api/auth/logout',
      '/api/auth/force-password-change',
      '/api/auth/validate-password',
      '/api/auth/upload-profile-photo',
      '/api/auth/profile/documents',
      '/api/auth/profile/photo'
    ];

    // Check if current route is exempt
    const isExemptRoute = exemptRoutes.some(route => req.path.startsWith(route));
    if (isExemptRoute) {
      return next();
    }

    // Get user with latest profile completion percentage
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate current profile completion
    const completionPercentage = user.calculateProfileCompletion();
    
    // Update stored percentage if different
    if (user.profileCompletionPercentage !== completionPercentage) {
      user.profileCompletionPercentage = completionPercentage;
      await user.save();
    }

    // Check if profile completion is less than 70%
    if (completionPercentage < 70) {
      return res.status(403).json({
        success: false,
        message: 'Profile completion required',
        profileCompletionPercentage: completionPercentage,
        requiredPercentage: 70,
        redirectTo: '/profile'
      });
    }

    // Profile is complete, continue to next middleware
    next();
  } catch (error) {
    console.error('Profile completion check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile completion check',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Middleware to check if user needs to change default password
const checkDefaultPassword = async (req, res, next) => {
  try {
    // Skip password check for certain routes
    const exemptRoutes = [
      '/api/auth/force-password-change',
      '/api/auth/validate-password',
      '/api/auth/logout',
      '/api/auth/profile' // Allow profile access for password change
    ];

    // Check if current route is exempt
    const isExemptRoute = exemptRoutes.some(route => req.path.startsWith(route));
    if (isExemptRoute) {
      return next();
    }

    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has default password
    if (user.isDefaultPassword) {
      return res.status(403).json({
        success: false,
        message: 'Password change required',
        isDefaultPassword: true,
        redirectTo: '/change-password'
      });
    }

    // Password is not default, continue
    next();
  } catch (error) {
    console.error('Default password check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password check',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  checkProfileCompletion,
  checkDefaultPassword
};
