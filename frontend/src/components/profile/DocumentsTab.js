import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Delete,
  Visibility,
  CheckCircle,
  Warning,
  Description,
  PersonPin,
  School,
  Work,
  CreditCard
} from '@mui/icons-material';
import api from '../../utils/api';

const DocumentsTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewDialog, setPreviewDialog] = useState({ open: false, url: '', title: '' });

  // Document types configuration
  const documentTypes = [
    {
      key: 'resume',
      name: 'Resume/CV',
      icon: <Description />,
      required: true,
      description: 'Upload your latest resume or CV',
      acceptedFormats: '.pdf,.doc,.docx',
      maxSize: '5MB'
    },
    {
      key: 'offerLetter',
      name: 'Offer Letter',
      icon: <Work />,
      required: true,
      description: 'Company offer letter',
      acceptedFormats: '.pdf,.doc,.docx',
      maxSize: '5MB'
    },
    {
      key: 'joiningLetter',
      name: 'Joining Letter',
      icon: <Work />,
      required: false,
      description: 'Joining confirmation letter',
      acceptedFormats: '.pdf,.doc,.docx',
      maxSize: '5MB'
    },
    {
      key: 'panCard',
      name: 'PAN Card',
      icon: <CreditCard />,
      required: true,
      description: 'PAN card copy with number',
      acceptedFormats: '.pdf,.jpg,.jpeg,.png',
      maxSize: '2MB'
    },
    {
      key: 'aadharCard',
      name: 'Aadhar Card',
      icon: <PersonPin />,
      required: true,
      description: 'Aadhar card copy',
      acceptedFormats: '.pdf,.jpg,.jpeg,.png',
      maxSize: '2MB'
    },
    {
      key: 'passport',
      name: 'Passport',
      icon: <PersonPin />,
      required: false,
      description: 'Passport copy (if available)',
      acceptedFormats: '.pdf,.jpg,.jpeg,.png',
      maxSize: '2MB'
    },
    {
      key: 'experienceCertificates',
      name: 'Experience Certificates',
      icon: <Work />,
      required: false,
      description: 'Previous employment certificates',
      acceptedFormats: '.pdf,.doc,.docx',
      maxSize: '5MB',
      multiple: true
    },
    {
      key: 'educationalCertificates',
      name: 'Educational Certificates',
      icon: <School />,
      required: true,
      description: 'Degree and educational certificates',
      acceptedFormats: '.pdf,.jpg,.jpeg,.png',
      maxSize: '5MB',
      multiple: true
    },
    {
      key: 'idBadge',
      name: 'ID Badge/Org Card',
      icon: <PersonPin />,
      required: false,
      description: 'Company ID badge or card',
      acceptedFormats: '.jpg,.jpeg,.png,.pdf',
      maxSize: '2MB'
    }
  ];

  useEffect(() => {
    if (profileData?.documents) {
      setDocuments(profileData.documents);
    }
  }, [profileData]);

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    // Validate file size
    const maxSizeMap = {
      '2MB': 2 * 1024 * 1024,
      '5MB': 5 * 1024 * 1024
    };
    
    const docConfig = documentTypes.find(doc => doc.key === documentType);
    const maxSize = maxSizeMap[docConfig?.maxSize] || 5 * 1024 * 1024;

    if (file.size > maxSize) {
      onNotification(`File size should be less than ${docConfig?.maxSize}`, 'error');
      return;
    }

    // Validate file type
    const allowedTypes = docConfig?.acceptedFormats.split(',').map(format => format.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      onNotification(`Please upload files in ${docConfig?.acceptedFormats} format`, 'error');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await api.post('/auth/profile/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        const updatedDocuments = {
          ...documents,
          [documentType]: response.data.document
        };
        
        setDocuments(updatedDocuments);
        onNotification(`${docConfig?.name} uploaded successfully!`, 'success');
        onUpdate({ documents: updatedDocuments });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      onNotification(error.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileDelete = async (documentType) => {
    try {
      const response = await api.delete(`/auth/profile/documents/${documentType}`);
      
      if (response.data.success) {
        const updatedDocuments = { ...documents };
        delete updatedDocuments[documentType];
        
        setDocuments(updatedDocuments);
        onNotification('Document deleted successfully!', 'success');
        onUpdate({ documents: updatedDocuments });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      onNotification('Failed to delete document', 'error');
    }
  };

  const handleFileDownload = async (documentType) => {
    try {
      const documentData = documents[documentType];
      if (!documentData?.fileUrl) {
        onNotification('Document not available for download', 'error');
        return;
      }

      const response = await fetch(documentData.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = documentData.originalName || `${documentType}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      onNotification('Failed to download document', 'error');
    }
  };

  const handleFilePreview = async (documentType) => {
    try {
      const response = await api.get(`/auth/profile/documents/${documentType}/preview`);
      
      if (response.data.success) {
        setPreviewDialog({
          open: true,
          url: response.data.previewUrl,
          title: documentTypes.find(doc => doc.key === documentType)?.name || documentType
        });
      } else {
        onNotification('Preview not available for this document. Please re-upload the document.', 'error');
      }
    } catch (error) {
      console.error('Error getting document preview:', error);
      if (error.response?.status === 404) {
        onNotification('Document file not found. Please re-upload the document.', 'error');
      } else {
        onNotification('Failed to load document preview', 'error');
      }
    }
  };

  const calculateCompletionPercentage = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => documents[doc.key]?.fileName);
    return Math.round((uploadedRequiredDocs.length / requiredDocs.length) * 100);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Documents
        </Typography>
        <Box textAlign="right">
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Document Completion
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <LinearProgress
              variant="determinate"
              value={calculateCompletionPercentage()}
              sx={{ 
                width: 120, 
                height: 8, 
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: calculateCompletionPercentage() >= 80 ? theme.palette.success.main : 
                                 calculateCompletionPercentage() >= 50 ? theme.palette.warning.main : 
                                 theme.palette.error.main
                }
              }}
            />
            <Typography variant="body2" fontWeight="bold">
              {calculateCompletionPercentage()}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Upload Progress */}
      {uploading && (
        <Box mb={3}>
          <Alert severity="info">
            <Typography variant="body2" gutterBottom>
              Uploading document... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Alert>
        </Box>
      )}

      {/* Document Categories */}
      <Grid container spacing={3}>
        {/* Required Documents */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Required Documents
              </Typography>
              <List>
                {documentTypes.filter(doc => doc.required).map((docType) => {
                  const document = documents[docType.key];
                  const isUploaded = document?.fileName;

                  return (
                    <ListItem key={docType.key} divider>
                      <ListItemIcon>
                        {docType.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight="bold">
                              {docType.name}
                            </Typography>
                            <Chip
                              label={isUploaded ? 'Uploaded' : 'Required'}
                              color={isUploaded ? 'success' : 'error'}
                              size="small"
                              icon={isUploaded ? <CheckCircle /> : <Warning />}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {docType.description}
                            </Typography>
                            {isUploaded && (
                              <Typography variant="caption" color="text.secondary">
                                Uploaded: {formatDate(document.uploadedAt)} | 
                                Size: {formatFileSize(document.fileSize)}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                              Formats: {docType.acceptedFormats} | Max: {docType.maxSize}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={1}>
                          {isUploaded ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleFilePreview(docType.key)}
                                title="Preview"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleFileDownload(docType.key)}
                                title="Download"
                              >
                                <Download />
                              </IconButton>
                              {isEditable && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleFileDelete(docType.key)}
                                  title="Delete"
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              )}
                            </>
                          ) : (
                            isEditable && (
                              <Button
                                component="label"
                                variant="contained"
                                startIcon={<CloudUpload />}
                                size="small"
                                disabled={uploading}
                              >
                                Upload
                                <input
                                  type="file"
                                  hidden
                                  accept={docType.acceptedFormats}
                                  onChange={(e) => handleFileUpload(docType.key, e.target.files[0])}
                                />
                              </Button>
                            )
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Optional Documents */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Optional Documents
              </Typography>
              <List>
                {documentTypes.filter(doc => !doc.required).map((docType) => {
                  const document = documents[docType.key];
                  const isUploaded = document?.fileName;

                  return (
                    <ListItem key={docType.key} divider>
                      <ListItemIcon>
                        {docType.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight="bold">
                              {docType.name}
                            </Typography>
                            <Chip
                              label={isUploaded ? 'Uploaded' : 'Optional'}
                              color={isUploaded ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {docType.description}
                            </Typography>
                            {isUploaded && (
                              <Typography variant="caption" color="text.secondary">
                                Uploaded: {formatDate(document.uploadedAt)} | 
                                Size: {formatFileSize(document.fileSize)}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                              Formats: {docType.acceptedFormats} | Max: {docType.maxSize}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={1}>
                          {isUploaded ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleFilePreview(docType.key)}
                                title="Preview"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleFileDownload(docType.key)}
                                title="Download"
                              >
                                <Download />
                              </IconButton>
                              {isEditable && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleFileDelete(docType.key)}
                                  title="Delete"
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              )}
                            </>
                          ) : (
                            isEditable && (
                              <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                size="small"
                                disabled={uploading}
                              >
                                Upload
                                <input
                                  type="file"
                                  hidden
                                  accept={docType.acceptedFormats}
                                  onChange={(e) => handleFileUpload(docType.key, e.target.files[0])}
                                />
                              </Button>
                            )
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, url: '', title: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{previewDialog.title}</DialogTitle>
        <DialogContent>
          {previewDialog.url && (
            <Box sx={{ textAlign: 'center' }}>
              {previewDialog.url.includes('.pdf') || previewDialog.title.toLowerCase().includes('pdf') ? (
                // For PDF files, show in iframe
                <iframe
                  src={previewDialog.url}
                  width="100%"
                  height="500px"
                  style={{ border: 'none' }}
                  title="Document Preview"
                />
              ) : (
                // For images, show as img
                <img
                  src={previewDialog.url}
                  alt="Document Preview"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '500px', 
                    objectFit: 'contain' 
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, url: '', title: '' })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsTab;
