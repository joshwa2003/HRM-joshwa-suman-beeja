const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://etvdufporvnfpgdzpcrr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0dmR1ZnBvcnZuZnBnZHpwY3JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEzODI0MSwiZXhwIjoyMDY3NzE0MjQxfQ.ij-v-aNRdKuAOfReghfw_usAwlG8PFXdthre0_a8278'
);

// Storage buckets configuration
const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  DOCUMENTS: 'documents',
  RESUMES: 'resumes',
  LEAVE_DOCUMENTS: 'leave-documents',
  TICKET_ATTACHMENTS: 'ticket-attachments',
  CHAT_ATTACHMENTS: 'chat-attachments',
  OFFER_LETTERS: 'offer-letters',
  HOLIDAY_EXCEL: 'holiday-excel'
};

// File upload utility function
const uploadFileToSupabase = async (file, bucket, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      path: urlData.publicUrl,
      fileName: fileName,
      bucket: bucket,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
};

// Delete file from Supabase
const deleteFromSupabase = async (bucket, fileName) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    throw error;
  }
};

// Generate file name with timestamp and user info
const generateFileName = (originalName, userId, prefix = '') => {
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${prefix}${userId}_${timestamp}_${sanitizedBaseName}${extension}`;
};

// File filter functions
const createFileFilter = (allowedTypes, errorMessage) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(errorMessage), false);
    }
  };
};

// File filters for different types
const profilePhotoFilter = createFileFilter(
  ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  'Invalid file type. Only JPEG, PNG, and GIF images are allowed for profile photos.'
);

const documentFilter = createFileFilter(
  [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  'Invalid file type. Only PDF, images, DOC, and DOCX files are allowed.'
);

const resumeFilter = createFileFilter(
  [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  'Invalid file type. Only PDF, DOC, and DOCX files are allowed for resumes.'
);

const leaveDocumentFilter = createFileFilter(
  ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  'Invalid file type. Only PDF and image files are allowed for leave documents.'
);

const ticketAttachmentFilter = createFileFilter(
  [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  'Invalid file type. Only PDF, images, DOC, DOCX, and TXT files are allowed.'
);

const chatAttachmentFilter = createFileFilter(
  [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed'
  ],
  'Invalid file type. Only common document and image formats are allowed.'
);

const offerLetterFilter = createFileFilter(
  ['application/pdf'],
  'Invalid file type. Only PDF files are allowed for offer letters.'
);

const holidayExcelFilter = createFileFilter(
  [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ],
  'Invalid file type. Only Excel and CSV files are allowed.'
);

// Custom storage engine for Supabase
class SupabaseStorage {
  constructor(options) {
    this.bucket = options.bucket;
    this.getFileName = options.getFileName;
  }

  _handleFile(req, file, cb) {
    const fileName = this.getFileName(req, file);
    
    // Collect file buffer
    const chunks = [];
    file.stream.on('data', chunk => chunks.push(chunk));
    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const fileObj = {
          buffer,
          mimetype: file.mimetype,
          size: buffer.length
        };

        const result = await uploadFileToSupabase(fileObj, this.bucket, fileName);
        
        cb(null, {
          path: result.path,
          filename: fileName,
          bucket: this.bucket,
          size: result.size,
          mimetype: result.mimetype
        });
      } catch (error) {
        cb(error);
      }
    });
    file.stream.on('error', cb);
  }

  _removeFile(req, file, cb) {
    deleteFromSupabase(file.bucket, file.filename)
      .then(() => cb(null))
      .catch(cb);
  }
}

// Storage configurations
const profilePhotoStorage = new SupabaseStorage({
  bucket: STORAGE_BUCKETS.PROFILE_PHOTOS,
  getFileName: (req, file) => {
    const userId = req.user?.id || req.user?._id || 'unknown';
    return generateFileName(file.originalname, userId, 'profile_');
  }
});

const documentStorage = new SupabaseStorage({
  bucket: STORAGE_BUCKETS.DOCUMENTS,
  getFileName: (req, file) => {
    const userId = req.user?.id || req.user?._id || 'unknown';
    return generateFileName(file.originalname, userId, 'doc_');
  }
});

const resumeStorage = new SupabaseStorage({
  bucket: STORAGE_BUCKETS.RESUMES,
  getFileName: (req, file) => {
    return generateFileName(file.originalname, 'applicant', 'resume_');
  }
});

const leaveDocumentStorage = new SupabaseStorage({
  bucket: STORAGE_BUCKETS.LEAVE_DOCUMENTS,
  getFileName: (req, file) => {
    const userId = req.user?.id || req.user?._id || 'unknown';
    return generateFileName(file.originalname, userId, 'leave_');
  }
});

const ticketAttachmentStorage = new SupabaseStorage({
  bucket: STORAGE_BUCKETS.TICKET_ATTACHMENTS,
  getFileName: (req, file) => {
    const userId = req.user?.id || req.user?._id || 'unknown';
    return generateFileName(file.originalname, userId, 'ticket_');
  }
});

const chatAttachmentStorage = new SupabaseStorage({
  bucket: STORAGE_BUCKETS.CHAT_ATTACHMENTS,
  getFileName: (req, file) => {
    const userId = req.user?.id || req.user?._id || 'unknown';
    return generateFileName(file.originalname, userId, 'chat_');
  }
});

const offerLetterStorage = new SupabaseStorage({
  bucket: STORAGE_BUCKETS.OFFER_LETTERS,
  getFileName: (req, file) => {
    return generateFileName(file.originalname, 'offer', 'offer_');
  }
});

const holidayExcelStorage = new SupabaseStorage({
  bucket: STORAGE_BUCKETS.HOLIDAY_EXCEL,
  getFileName: (req, file) => {
    const userId = req.user?.id || req.user?._id || 'unknown';
    return generateFileName(file.originalname, userId, 'holidays_');
  }
});

// Multer configurations
const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: profilePhotoFilter
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: documentFilter
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: resumeFilter
});

const uploadLeaveDocument = multer({
  storage: leaveDocumentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: leaveDocumentFilter
});

const uploadTicketAttachment = multer({
  storage: ticketAttachmentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: ticketAttachmentFilter
});

const uploadChatAttachment = multer({
  storage: chatAttachmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: chatAttachmentFilter
});

const uploadOfferLetter = multer({
  storage: offerLetterStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: offerLetterFilter
});

const uploadHolidayExcel = multer({
  storage: holidayExcelStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: holidayExcelFilter
});

// Utility functions
const getSupabaseFileInfo = async (bucket, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        search: fileName
      });

    if (error) throw error;
    return data.find(file => file.name === fileName);
  } catch (error) {
    console.error('Error getting file info from Supabase:', error);
    throw error;
  }
};

const generateSecureUrl = (bucket, fileName, options = {}) => {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error generating secure URL:', error);
    throw error;
  }
};

const generatePreviewUrl = (bucket, fileName, options = {}) => {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error generating preview URL:', error);
    throw error;
  }
};

// Error handling middleware for Supabase uploads
const handleSupabaseUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Please check the file size limits.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Please check the file count limits.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  // Supabase specific errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message || 'Supabase upload error'
    });
  }
  
  next(error);
};

module.exports = {
  supabase,
  STORAGE_BUCKETS,
  uploadProfilePhoto,
  uploadDocument,
  uploadResume,
  uploadLeaveDocument,
  uploadTicketAttachment,
  uploadChatAttachment,
  uploadOfferLetter,
  uploadHolidayExcel,
  deleteFromSupabase,
  getSupabaseFileInfo,
  generateSecureUrl,
  generatePreviewUrl,
  handleSupabaseUploadError,
  uploadFileToSupabase,
  generateFileName
};
