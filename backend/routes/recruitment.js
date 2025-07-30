const express = require('express');
const router = express.Router();
const { auth, roleAccess } = require('../middleware/auth');
const { resumeUpload } = require('../middleware/upload');
const recruitmentController = require('../controllers/recruitmentController');

// ==================== JOB MANAGEMENT ROUTES ====================

// Get all jobs (HR roles only)
router.get('/jobs', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getJobs
);

// Get single job (HR roles only)
router.get('/jobs/:id', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getJob
);

// Create new job (HR roles only)
router.post('/jobs', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.createJob
);

// Update job (HR roles only)
router.put('/jobs/:id', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.updateJob
);

// Publish job (HR roles only)
router.patch('/jobs/:id/publish', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.publishJob
);

// Close job (HR roles only)
router.patch('/jobs/:id/close', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.closeJob
);

// ==================== PUBLIC JOB ROUTES ====================

// Get public job details (no auth required)
router.get('/public/jobs/:id', 
  recruitmentController.getPublicJob
);

// Submit job application (no auth required)
router.post('/public/jobs/:jobId/apply', 
  resumeUpload.single('resume'),
  recruitmentController.submitApplication
);

// ==================== APPLICATION MANAGEMENT ROUTES ====================

// Get all applications (HR roles only)
router.get('/applications', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getAllApplications
);

// Get applications for a job (HR roles only)
router.get('/jobs/:jobId/applications', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getApplications
);

// Get single application (HR roles only)
router.get('/applications/:id', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getApplication
);

// Update application status (HR roles only)
router.patch('/applications/:id/status', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.updateApplicationStatus
);

// Send rejection email with reason (HR roles only)
router.post('/applications/:id/reject', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.sendRejectionEmail
);

// Download resume (HR roles only)
router.get('/applications/:applicationId/resume', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.downloadResume
);

// ==================== INTERVIEW MANAGEMENT ROUTES ====================

// Schedule interview (HR roles only)
router.post('/applications/:applicationId/interviews', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.scheduleInterview
);

// Get all interviews (HR roles only)
router.get('/interviews', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getInterviews
);

// Get interviewer's interviews (Interviewer access)
router.get('/interviews/my-interviews', 
  auth, 
  recruitmentController.getInterviewerInterviews
);

// Update interview status (HR roles and Interviewer)
router.patch('/interviews/:id/status', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']),
  recruitmentController.updateInterviewStatus
);

// Reschedule interview (HR roles only)
router.patch('/interviews/:id/reschedule', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.rescheduleInterview
);

// ==================== INTERVIEW FEEDBACK ROUTES ====================

// Submit interview feedback (Interviewer only)
router.post('/interviews/:interviewId/feedback', 
  auth, 
  recruitmentController.submitFeedback
);

// Get feedback for application (HR roles only)
router.get('/applications/:applicationId/feedback', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getApplicationFeedback
);

// Get interviewer's feedback (Interviewer access)
router.get('/feedback/my-feedback', 
  auth, 
  recruitmentController.getInterviewerFeedback
);

// ==================== OFFER MANAGEMENT ROUTES ====================

// Generate offer letter (HR roles only)
router.post('/applications/:applicationId/offers', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.generateOffer
);

// Get all offers (HR roles only)
router.get('/offers', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getOffers
);

// Send offer (HR roles only)
router.patch('/offers/:id/send', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.sendOffer
);

// ==================== PUBLIC OFFER ROUTES ====================

// Get public offer (no auth required)
router.get('/public/offers/:token', 
  recruitmentController.getPublicOffer
);

// Respond to offer (no auth required)
router.post('/public/offers/:token/respond', 
  recruitmentController.respondToOffer
);

// ==================== USER MANAGEMENT INTEGRATION ====================

// Add candidate to user management (HR roles only)
router.post('/offers/:offerId/add-to-users', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.addToUserManagement
);

// ==================== DASHBOARD & ANALYTICS ROUTES ====================

// Get recruitment dashboard (HR roles only)
router.get('/dashboard', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getDashboard
);

// Get recruitment analytics (HR roles only)
router.get('/analytics', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getAnalytics
);

// ==================== UTILITY ROUTES ====================

// Get all interviewers (HR roles only)
router.get('/interviewers', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getInterviewers
);

// Get departments for job creation (HR roles only)
router.get('/departments', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getDepartments
);

// Get teams by department (HR roles only)
router.get('/teams/:departmentId', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getTeamsByDepartment
);

// Get hiring managers for job creation (HR roles only)
router.get('/hiring-managers', 
  auth, 
  roleAccess(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']),
  recruitmentController.getHiringManagers
);

module.exports = router;
