import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const ReimbursementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    amount: '',
    currency: 'INR',
    description: '',
    expenseDate: '',
    businessPurpose: '',
    priority: 'Normal'
  });

  const [files, setFiles] = useState([]);
  const [config, setConfig] = useState({
    categories: [
      { value: 'Travel', label: 'Travel' },
      { value: 'Food', label: 'Food' },
      { value: 'Internet', label: 'Internet' },
      { value: 'Office Supplies', label: 'Office Supplies' },
      { value: 'Medical', label: 'Medical' },
      { value: 'Communication', label: 'Communication' },
      { value: 'Training', label: 'Training' },
      { value: 'Fuel', label: 'Fuel' },
      { value: 'Accommodation', label: 'Accommodation' },
      { value: 'Other', label: 'Other' }
    ],
    priorities: [
      { value: 'Low', label: 'Low' },
      { value: 'Normal', label: 'Normal' },
      { value: 'High', label: 'High' },
      { value: 'Urgent', label: 'Urgent' }
    ]
  });

  useEffect(() => {
    if (isEdit) {
      fetchReimbursement();
    }
    // Set default expense date to today
    if (!isEdit) {
      setFormData(prev => ({
        ...prev,
        expenseDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [id, isEdit]);

  const fetchReimbursement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reimbursements/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const reimbursement = data.data;
        
        setFormData({
          category: reimbursement.category || '',
          subcategory: reimbursement.subcategory || '',
          amount: reimbursement.amount?.toString() || '',
          currency: reimbursement.currency || 'INR',
          description: reimbursement.description || '',
          expenseDate: reimbursement.expenseDate ? new Date(reimbursement.expenseDate).toISOString().split('T')[0] : '',
          businessPurpose: reimbursement.businessPurpose || '',
          priority: reimbursement.priority || 'Normal'
        });

        // Set existing files
        if (reimbursement.receipts && reimbursement.receipts.length > 0) {
          setFiles(reimbursement.receipts.map(receipt => ({
            name: receipt.originalName,
            url: receipt.fileUrl,
            existing: true
          })));
        }
      } else {
        throw new Error('Failed to fetch reimbursement');
      }
    } catch (error) {
      console.error('Error fetching reimbursement:', error);
      setError('Failed to load reimbursement details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPEG, PNG, and PDF files are allowed.`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles.map(file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type
      }))]);
      setError('');
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validation
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Valid amount is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.expenseDate) {
        throw new Error('Expense date is required');
      }
      if (!formData.businessPurpose.trim()) {
        throw new Error('Business purpose is required');
      }

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add files
      files.forEach(fileObj => {
        if (fileObj.file) {
          submitData.append('receipts', fileObj.file);
        }
      });

      const url = isEdit ? `/api/reimbursements/${id}` : '/api/reimbursements';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(isEdit ? 'Reimbursement updated successfully' : 'Reimbursement created successfully');
        
        // If not draft and not edit, submit for approval
        if (!isDraft && !isEdit) {
          try {
            await fetch(`/api/reimbursements/${data.data._id}/submit`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            setSuccess('Reimbursement submitted for approval successfully');
          } catch (submitError) {
            console.error('Error submitting for approval:', submitError);
          }
        }

        setTimeout(() => {
          navigate('/admin/payroll/reimbursements');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save reimbursement');
      }
    } catch (error) {
      console.error('Error saving reimbursement:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && isEdit) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <IconButton onClick={() => navigate('/admin/payroll/reimbursements')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon color="primary" />
            {isEdit ? 'Edit Reimbursement' : 'New Reimbursement Request'}
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {isEdit ? 'Update reimbursement details' : 'Submit a new reimbursement request for approval'}
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {config.categories.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subcategory"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="e.g., Flight tickets, Hotel booking"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Expense Date"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: new Date().toISOString().split('T')[0] }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  {config.priorities.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  label="Currency"
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of the expense..."
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.description.length}/500 characters`}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="Business Purpose"
                value={formData.businessPurpose}
                onChange={(e) => handleInputChange('businessPurpose', e.target.value)}
                placeholder="Explain the business purpose of this expense..."
                inputProps={{ maxLength: 300 }}
                helperText={`${formData.businessPurpose.length}/300 characters`}
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Supporting Documents
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }}
              >
                <AttachFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Receipts
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload receipts, invoices, or other supporting documents
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  disabled={uploading}
                >
                  Choose Files
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Supported formats: JPEG, PNG, PDF (Max 5MB each)
                </Typography>
              </Paper>
            </Grid>

            {/* File List */}
            {files.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Uploaded Files ({files.length})
                </Typography>
                <List>
                  {files.map((file, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={file.name}
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            {file.size && (
                              <Chip label={formatFileSize(file.size)} size="small" />
                            )}
                            {file.existing && (
                              <Chip label="Existing" color="info" size="small" />
                            )}
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => removeFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/payroll/reimbursements')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                {!isEdit && (
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                  >
                    Save as Draft
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={isEdit ? <SaveIcon /> : <SendIcon />}
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : isEdit ? (
                    'Update'
                  ) : (
                    'Submit for Approval'
                  )}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReimbursementForm;
