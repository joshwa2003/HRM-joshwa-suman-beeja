const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/document-fix/preview/:documentType
// @desc    Fix document preview URL by trying multiple formats
// @access  Private
router.get('/preview/:documentType', auth, async (req, res) => {
  try {
    const { documentType } = req.params;

    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!user || !user.documents || !user.documents[documentType]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = user.documents[documentType];
    const { generateSecureUrl, STORAGE_BUCKETS } = require('../services/supabaseStorageService');
    
    if (document.fileName && document.bucket) {
      // Generate URL for Supabase stored files
      try {
        const previewUrl = generateSecureUrl(document.bucket, document.fileName);
        return res.json({
          success: true,
          previewUrl: previewUrl,
          documentType: documentType,
          fileName: document.originalName || document.fileName
        });
      } catch (error) {
        console.error('Error generating Supabase URL:', error);
      }
    }

    // If no URL works, return the original fileUrl as fallback
    if (document.fileUrl) {
      return res.json({
        success: true,
        previewUrl: document.fileUrl,
        documentType: documentType,
        fileName: document.originalName || document.fileName
      });
    }

    res.status(404).json({
      success: false,
      message: 'Document preview not available'
    });

  } catch (error) {
    console.error('Document fix preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting document preview'
    });
  }
});

module.exports = router;
