const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const { deleteFromSupabase, STORAGE_BUCKETS } = require('../services/supabaseStorageService');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://etvdufporvnfpgdzpcrr.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0dmR1ZnBvcnZuZnBnZHpwY3JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEzODI0MSwiZXhwIjoyMDY3NzE0MjQxfQ.ij-v-aNRdKuAOfReghfw_usAwlG8PFXdthre0_a8278'
);

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Configure multer for file uploads (keeping for backward compatibility)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG files are allowed.'), false);
    }
  }
});

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and populate department
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('department', 'name code');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login and first login status
    user.lastLogin = new Date();
    if (user.isFirstLogin) {
      user.isFirstLogin = false;
    }
    
    // Calculate profile completion percentage
    user.profileCompletionPercentage = user.calculateProfileCompletion();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send response with additional fields for first login and profile completion
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        department: user.department?.name || 'N/A',
        employeeId: user.employeeId,
        designation: user.designation,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        isFirstLogin: user.isFirstLogin,
        isDefaultPassword: user.isDefaultPassword,
        profileCompletionPercentage: user.profileCompletionPercentage,
        canAccessDashboard: user.canAccessDashboard
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Register new user (Admin only)
// @route   POST /api/auth/register
// @access  Private (Admin only)
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role = 'Employee',
      department,
      employeeId,
      phoneNumber,
      designation
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employeeId already exists (if provided)
    if (employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId });
      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role,
      department,
      employeeId,
      phoneNumber,
      designation,
      createdBy: req.user ? req.user._id : null
    });

    await user.save();

    // Populate department for response
    await user.populate('department', 'name code');

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        department: user.department?.name || 'N/A',
        employeeId: user.employeeId,
        designation: user.designation,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('department', 'name code')
      .populate('team', 'name')
      .populate('reportingManager', 'firstName lastName');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        department: user.department?.name || 'N/A',
        team: user.team?.name || null,
        reportingManager: user.reportingManager ? {
          firstName: user.reportingManager.firstName,
          lastName: user.reportingManager.lastName
        } : null,
        employeeId: user.employeeId,
        phoneNumber: user.phoneNumber,
        alternatePhone: user.alternatePhone,
        personalEmail: user.personalEmail,
        designation: user.designation,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        maritalStatus: user.maritalStatus,
        bloodGroup: user.bloodGroup,
        address: user.address || {},
        permanentAddress: user.permanentAddress || {},
        profilePhoto: user.profilePhoto,
        religion: user.religion,
        region: user.region,
        stateOfOrigin: user.stateOfOrigin,
        workLocation: user.workLocation,
        employmentType: user.employmentType,
        joiningDate: user.joiningDate,
        probationEndDate: user.probationEndDate,
        confirmationDate: user.confirmationDate,
        emergencyContact: user.emergencyContact || {},
        bankDetails: user.bankDetails || {},
        leaveBalance: user.leaveBalance || {},
        currentGoals: user.currentGoals || [],
        lastAppraisal: user.lastAppraisal || null,
        // Identity Details
        aadharNumber: user.aadharNumber,
        panNumber: user.panNumber,
        passportNumber: user.passportNumber,
        drivingLicenseNumber: user.drivingLicenseNumber,
        voterIdNumber: user.voterIdNumber,
        // Family Details
        fatherName: user.fatherName,
        motherName: user.motherName,
        spouseName: user.spouseName,
        numberOfDependents: user.numberOfDependents,
        nomineeForBenefits: user.nomineeForBenefits,
        // Other Details
        languagesKnown: user.languagesKnown || [],
        hobbies: user.hobbies || [],
        casteCategory: user.casteCategory,
        disability: user.disability,
        allergies: user.allergies,
        // Security & Compliance
        consentToShareInfo: user.consentToShareInfo,
        // Documents
        documents: user.documents || {},
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    // Get user with populated department for consistent response
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department', 'name code');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If we reach here, the auth middleware has already verified the token
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        department: user.department?.name || 'N/A',
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a JWT implementation, logout is typically handled client-side
    // by removing the token from storage. Here we just confirm the logout.
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log('Update profile request received:', {
      userId: req.user._id,
      body: req.body
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      // Personal Information
      firstName,
      lastName,
      gender,
      dateOfBirth,
      nationality,
      maritalStatus,
      bloodGroup,
      phoneNumber,
      alternatePhone,
      personalEmail,
      address,
      permanentAddress,
      profilePhoto,
      religion,
      region,
      stateOfOrigin,
      
      // Work Information
      designation,
      workLocation,
      employmentType,
      probationEndDate,
      confirmationDate,
      
      // Emergency Contact
      emergencyContact,
      
      // Bank Details
      bankDetails,
      
      // Other fields
      currentGoals,
      lastAppraisal
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Current user found:', user.email);

    // Update personal information fields
    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (nationality !== undefined) user.nationality = nationality.trim();
    if (maritalStatus !== undefined) user.maritalStatus = maritalStatus;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
    if (alternatePhone !== undefined) user.alternatePhone = alternatePhone.trim();
    if (personalEmail !== undefined) user.personalEmail = personalEmail.toLowerCase().trim();
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (religion !== undefined) user.religion = religion.trim();
    if (region !== undefined) user.region = region.trim();
    if (stateOfOrigin !== undefined) user.stateOfOrigin = stateOfOrigin.trim();

    // Update identity details
    if (req.body.aadharNumber !== undefined) user.aadharNumber = req.body.aadharNumber?.trim();
    if (req.body.panNumber !== undefined) user.panNumber = req.body.panNumber?.trim();
    if (req.body.passportNumber !== undefined) user.passportNumber = req.body.passportNumber?.trim();
    if (req.body.drivingLicenseNumber !== undefined) user.drivingLicenseNumber = req.body.drivingLicenseNumber?.trim();
    if (req.body.voterIdNumber !== undefined) user.voterIdNumber = req.body.voterIdNumber?.trim();

    // Update family details
    if (req.body.fatherName !== undefined) user.fatherName = req.body.fatherName?.trim();
    if (req.body.motherName !== undefined) user.motherName = req.body.motherName?.trim();
    if (req.body.spouseName !== undefined) user.spouseName = req.body.spouseName?.trim();
    if (req.body.numberOfDependents !== undefined) user.numberOfDependents = req.body.numberOfDependents;
    if (req.body.nomineeForBenefits !== undefined) user.nomineeForBenefits = req.body.nomineeForBenefits?.trim();

    // Update other details
    if (req.body.languagesKnown !== undefined) user.languagesKnown = req.body.languagesKnown;
    if (req.body.hobbies !== undefined) user.hobbies = req.body.hobbies;
    if (req.body.casteCategory !== undefined) user.casteCategory = req.body.casteCategory;
    if (req.body.disability !== undefined) user.disability = req.body.disability?.trim();
    if (req.body.allergies !== undefined) user.allergies = req.body.allergies?.trim();

    // Update security & compliance
    if (req.body.consentToShareInfo !== undefined) user.consentToShareInfo = req.body.consentToShareInfo;

    // Update work information (only if user has permission)
    const userRole = user.role.toLowerCase();
    const canUpdateWorkInfo = ['admin', 'hr manager', 'hr bp', 'hr executive'].includes(userRole);
    
    if (canUpdateWorkInfo) {
      if (designation !== undefined) user.designation = designation.trim();
      if (workLocation !== undefined) user.workLocation = workLocation;
      if (employmentType !== undefined) user.employmentType = employmentType;
      if (probationEndDate !== undefined) user.probationEndDate = probationEndDate;
      if (confirmationDate !== undefined) user.confirmationDate = confirmationDate;
    }

    // Update address if provided
    if (address && typeof address === 'object') {
      user.address = {
        street: address.street?.trim() || user.address?.street || '',
        city: address.city?.trim() || user.address?.city || '',
        state: address.state?.trim() || user.address?.state || '',
        zipCode: address.zipCode?.trim() || user.address?.zipCode || '',
        country: address.country?.trim() || user.address?.country || ''
      };
    }

    // Update permanent address if provided
    if (permanentAddress && typeof permanentAddress === 'object') {
      user.permanentAddress = {
        street: permanentAddress.street?.trim() || user.permanentAddress?.street || '',
        city: permanentAddress.city?.trim() || user.permanentAddress?.city || '',
        state: permanentAddress.state?.trim() || user.permanentAddress?.state || '',
        zipCode: permanentAddress.zipCode?.trim() || user.permanentAddress?.zipCode || '',
        country: permanentAddress.country?.trim() || user.permanentAddress?.country || ''
      };
    }

    // Update emergency contact if provided
    if (emergencyContact && typeof emergencyContact === 'object') {
      user.emergencyContact = {
        name: emergencyContact.name?.trim() || user.emergencyContact?.name || '',
        relationship: emergencyContact.relationship?.trim() || user.emergencyContact?.relationship || '',
        phone: emergencyContact.phone?.trim() || user.emergencyContact?.phone || '',
        alternatePhone: emergencyContact.alternatePhone?.trim() || user.emergencyContact?.alternatePhone || '',
        address: emergencyContact.address?.trim() || user.emergencyContact?.address || ''
      };
    }

    // Update bank details if provided (only if user has permission)
    if (bankDetails && typeof bankDetails === 'object') {
      user.bankDetails = {
        accountNumber: bankDetails.accountNumber?.trim() || user.bankDetails?.accountNumber || '',
        bankName: bankDetails.bankName?.trim() || user.bankDetails?.bankName || '',
        ifscCode: bankDetails.ifscCode?.trim() || user.bankDetails?.ifscCode || '',
        bankBranch: bankDetails.bankBranch?.trim() || user.bankDetails?.bankBranch || '',
        panNumber: bankDetails.panNumber?.trim() || user.bankDetails?.panNumber || '',
        uanNumber: bankDetails.uanNumber?.trim() || user.bankDetails?.uanNumber || '',
        pfAccountNumber: bankDetails.pfAccountNumber?.trim() || user.bankDetails?.pfAccountNumber || '',
        accountHolderName: bankDetails.accountHolderName?.trim() || user.bankDetails?.accountHolderName || ''
      };
    }

    // Update goals and appraisal (only if user has permission)
    if (canUpdateWorkInfo) {
      if (currentGoals !== undefined && Array.isArray(currentGoals)) {
        user.currentGoals = currentGoals;
      }
      if (lastAppraisal !== undefined && typeof lastAppraisal === 'object') {
        user.lastAppraisal = lastAppraisal;
      }
    }

    console.log('Saving user with updated data...');
    await user.save();
    console.log('User saved successfully');

    // Populate related fields for response
    await user.populate([
      { path: 'department', select: 'name code' },
      { path: 'team', select: 'name' },
      { path: 'reportingManager', select: 'firstName lastName' }
    ]);

    const responseUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      department: user.department?.name || 'N/A',
      team: user.team?.name || null,
      reportingManager: user.reportingManager ? {
        firstName: user.reportingManager.firstName,
        lastName: user.reportingManager.lastName
      } : null,
      employeeId: user.employeeId,
      phoneNumber: user.phoneNumber,
      alternatePhone: user.alternatePhone,
      personalEmail: user.personalEmail,
      designation: user.designation,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      nationality: user.nationality,
      maritalStatus: user.maritalStatus,
      bloodGroup: user.bloodGroup,
      address: user.address || {},
      permanentAddress: user.permanentAddress || {},
      profilePhoto: user.profilePhoto,
      religion: user.religion,
      region: user.region,
      stateOfOrigin: user.stateOfOrigin,
      workLocation: user.workLocation,
      employmentType: user.employmentType,
      joiningDate: user.joiningDate,
      probationEndDate: user.probationEndDate,
      confirmationDate: user.confirmationDate,
      emergencyContact: user.emergencyContact || {},
      bankDetails: user.bankDetails || {},
      leaveBalance: user.leaveBalance || {},
      currentGoals: user.currentGoals || [],
      lastAppraisal: user.lastAppraisal || null,
      // Identity Details
      aadharNumber: user.aadharNumber,
      panNumber: user.panNumber,
      passportNumber: user.passportNumber,
      drivingLicenseNumber: user.drivingLicenseNumber,
      voterIdNumber: user.voterIdNumber,
      // Family Details
      fatherName: user.fatherName,
      motherName: user.motherName,
      spouseName: user.spouseName,
      numberOfDependents: user.numberOfDependents,
      nomineeForBenefits: user.nomineeForBenefits,
      // Other Details
      languagesKnown: user.languagesKnown || [],
      hobbies: user.hobbies || [],
      casteCategory: user.casteCategory,
      disability: user.disability,
      allergies: user.allergies,
      // Security & Compliance
      consentToShareInfo: user.consentToShareInfo,
      // Documents
      documents: user.documents || {},
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('Profile update successful for user:', user.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: responseUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('Mongoose validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    
    if (error.name === 'CastError') {
      console.log('Cast error:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid data format provided',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/upload-profile-photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile photo from Supabase if exists
    if (user.profilePhoto) {
      try {
        // Extract filename from the URL
        const urlParts = user.profilePhoto.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await deleteFromSupabase(STORAGE_BUCKETS.PROFILE_PHOTOS, fileName);
      } catch (deleteError) {
        console.error('Error deleting old profile photo:', deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Update user with new profile photo URL
    user.profilePhoto = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhoto: req.file.path,
      user: {
        id: user._id,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading profile photo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Force password change for first login
// @route   POST /api/auth/force-password-change
// @access  Private
const forcePasswordChange = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    // Validate password strength
    const passwordValidation = User.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet strength requirements',
        errors: passwordValidation.errors
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user actually has a default password
    if (!user.isDefaultPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password change not required. User already has a custom password.'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Ensure new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password'
      });
    }

    // Update password and flags
    user.password = newPassword;
    user.isDefaultPassword = false;
    user.isFirstLogin = false;
    user.lastPasswordChange = new Date();
    
    // Calculate profile completion after password change
    user.profileCompletionPercentage = user.calculateProfileCompletion();
    
    await user.save();

    // Generate new token with updated user info
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password changed successfully. Please complete your profile.',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        isDefaultPassword: user.isDefaultPassword,
        isFirstLogin: user.isFirstLogin,
        profileCompletionPercentage: user.profileCompletionPercentage,
        canAccessDashboard: user.canAccessDashboard
      },
      redirectTo: '/profile'
    });

  } catch (error) {
    console.error('Force password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Validate password strength
// @route   POST /api/auth/validate-password
// @access  Private
const validatePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const validation = User.validatePasswordStrength(password);

    res.json({
      success: true,
      validation: validation
    });

  } catch (error) {
    console.error('Password validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password validation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Check profile completion status
// @route   GET /api/auth/profile-completion
// @access  Private
const checkProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Recalculate profile completion
    const completionPercentage = user.calculateProfileCompletion();
    
    // Update the stored percentage
    user.profileCompletionPercentage = completionPercentage;
    await user.save();

    res.json({
      success: true,
      profileCompletionPercentage: completionPercentage,
      canAccessDashboard: completionPercentage >= 75,
      requiredPercentage: 75
    });

  } catch (error) {
    console.error('Profile completion check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking profile completion',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Send password via email (for admin user creation)
// @route   POST /api/auth/send-password-email
// @access  Private (Admin only)
const sendPasswordEmail = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new default password
    const defaultPassword = User.generateDefaultPassword();
    
    // Update user with new password
    user.password = defaultPassword;
    user.isDefaultPassword = true;
    user.isFirstLogin = true;
    await user.save();

    // Send email with password
    try {
      await emailService.sendNewUserCredentials({
        to: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: defaultPassword,
        employeeId: user.employeeId
      });

      res.json({
        success: true,
        message: 'Password sent to user email successfully'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Password updated but failed to send email. Please share credentials manually.',
        credentials: {
          email: user.email,
          password: defaultPassword
        }
      });
    }

  } catch (error) {
    console.error('Send password email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending password email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
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
};
