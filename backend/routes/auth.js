const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  login,
  register,
  getProfile,
  updateProfile,
  verifyToken,
  logout,
  changePassword,
  uploadProfilePhoto,
  forcePasswordChange,
  validatePassword,
  checkProfileCompletion,
  sendPasswordEmail
} = require('../controllers/authController');
const supabaseUpload = require('../middleware/supabaseUpload');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], login);

// @route   POST /api/auth/register
// @desc    Register new user (Admin only)
// @access  Private (Admin only)
router.post('/register', [
  auth,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('role')
    .optional()
    .isIn(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader', 'Employee'])
    .withMessage('Invalid role specified'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name must be less than 100 characters'),
  body('employeeId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Employee ID cannot be empty if provided'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation must be less than 100 characters')
], register);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender specified'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('nationality')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nationality must be less than 100 characters'),
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage('Invalid marital status specified'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group specified'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('alternatePhone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid alternate phone number'),
  body('personalEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid personal email')
], updateProfile);

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.get('/verify', auth, verifyToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, logout);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', [
  auth,
  body('currentPassword')
    .isLength({ min: 6 })
    .withMessage('Current password must be at least 6 characters long'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], changePassword);

// @route   POST /api/auth/force-password-change
// @desc    Force password change for first login
// @access  Private
router.post('/force-password-change', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
], forcePasswordChange);

// @route   POST /api/auth/validate-password
// @desc    Validate password strength
// @access  Private
router.post('/validate-password', [
  auth,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validatePassword);

// @route   GET /api/auth/profile-completion
// @desc    Check profile completion status
// @access  Private
router.get('/profile-completion', auth, checkProfileCompletion);

// @route   POST /api/auth/send-password-email
// @desc    Send password via email (Admin only)
// @access  Private
router.post('/send-password-email', [
  auth,
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
], sendPasswordEmail);

// @route   POST /api/auth/upload-profile-photo
// @desc    Upload profile photo to Supabase
// @access  Private
router.post('/upload-profile-photo', auth, supabaseUpload.profilePhoto, uploadProfilePhoto, supabaseUpload.handleError);

// @route   POST /api/auth/profile/documents
// @desc    Upload profile documents to Supabase
// @access  Private
router.post('/profile/documents', auth, supabaseUpload.singleDocument, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    const user = await require('../models/User').findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize documents object if it doesn't exist
    if (!user.documents) {
      user.documents = {};
    }

    // Delete old document from Supabase if exists
    if (user.documents[documentType]?.fileName) {
      try {
        const { deleteFromSupabase, STORAGE_BUCKETS } = require('../services/supabaseStorageService');
        await deleteFromSupabase(STORAGE_BUCKETS.DOCUMENTS, user.documents[documentType].fileName);
      } catch (deleteError) {
        console.error('Error deleting old document:', deleteError);
      }
    }

    // Save new document info
    user.documents[documentType] = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      bucket: req.file.bucket,
      uploadedAt: new Date()
    };

    // Mark the documents field as modified for Mongoose to detect the change
    user.markModified('documents');
    await user.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: user.documents[documentType]
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading document',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}, supabaseUpload.handleError);

// @route   DELETE /api/auth/profile/documents/:documentType
// @desc    Delete profile document
// @access  Private
router.delete('/profile/documents/:documentType', auth, async (req, res) => {
  try {
    const { documentType } = req.params;

    const user = await require('../models/User').findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.documents || !user.documents[documentType]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Supabase
    if (user.documents[documentType].fileName) {
      try {
        const { deleteFromSupabase, STORAGE_BUCKETS } = require('../services/supabaseStorageService');
        await deleteFromSupabase(STORAGE_BUCKETS.DOCUMENTS, user.documents[documentType].fileName);
      } catch (deleteError) {
        console.error('Error deleting from Supabase:', deleteError);
      }
    }

    // Remove from user documents
    delete user.documents[documentType];
    
    // Mark the documents field as modified for Mongoose to detect the change
    user.markModified('documents');
    await user.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting document',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/auth/profile/documents/:documentType/preview
// @desc    Get document preview URL
// @access  Private
router.get('/profile/documents/:documentType/preview', auth, async (req, res) => {
  try {
    const { documentType } = req.params;

    const user = await require('../models/User').findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.documents || !user.documents[documentType]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = user.documents[documentType];
    
    // Generate preview URL for Supabase stored files
    if (document.fileUrl) {
      return res.json({
        success: true,
        previewUrl: document.fileUrl,
        documentType: documentType,
        fileName: document.originalName || document.fileName
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Preview not available for this document'
      });
    }

  } catch (error) {
    console.error('Get document preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting document preview',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/auth/profile/photo
// @desc    Update profile photo URL (for backward compatibility)
// @access  Private
router.put('/profile/photo', auth, async (req, res) => {
  try {
    const { profilePhoto } = req.body;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profilePhoto = profilePhoto;
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    console.error('Profile photo update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile photo'
    });
  }
});

module.exports = router;
