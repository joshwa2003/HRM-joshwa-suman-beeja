const {
  uploadProfilePhoto,
  uploadDocument,
  uploadResume,
  uploadLeaveDocument,
  uploadTicketAttachment,
  uploadChatAttachment,
  uploadOfferLetter,
  uploadHolidayExcel,
  handleSupabaseUploadError
} = require('../services/supabaseStorageService');

// Export all upload middlewares
module.exports = {
  // Profile photo upload
  profilePhoto: uploadProfilePhoto.single('profilePhoto'),
  
  // Document uploads (for general documents)
  documents: uploadDocument.array('documents', 5),
  singleDocument: uploadDocument.single('document'),
  
  // Resume upload
  resume: uploadResume.single('resume'),
  
  // Leave document uploads
  leaveDocuments: uploadLeaveDocument.array('documents', 5),
  
  // Ticket attachment uploads
  ticketAttachments: uploadTicketAttachment.array('attachments', 5),
  
  // Chat attachment uploads
  chatAttachments: uploadChatAttachment.array('attachments', 5),
  
  // Offer letter upload
  offerLetter: uploadOfferLetter.single('offerLetter'),
  
  // Holiday excel upload
  holidayExcel: uploadHolidayExcel.single('excelFile'),
  
  // Error handler
  handleError: handleSupabaseUploadError
};
