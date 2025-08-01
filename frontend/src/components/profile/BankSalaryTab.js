import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Chip,
  useTheme,
  Alert
} from '@mui/material';
import { 
  Save, 
  Edit, 
  Cancel, 
  AccountBalance, 
  CreditCard, 
  Visibility, 
  VisibilityOff,
  Security 
} from '@mui/icons-material';
import api from '../../utils/api';

const BankSalaryTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState({
    accountNumber: false,
    panNumber: false
  });
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankBranch: '',
    panNumber: '',
    uanNumber: '',
    pfAccountNumber: '',
    salaryType: '',
    salaryCycle: ''
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        bankName: profileData.bankDetails?.bankName || '',
        accountHolderName: profileData.bankDetails?.accountHolderName || `${profileData.firstName} ${profileData.lastName}`,
        accountNumber: profileData.bankDetails?.accountNumber || '',
        ifscCode: profileData.bankDetails?.ifscCode || '',
        bankBranch: profileData.bankDetails?.bankBranch || '',
        panNumber: profileData.bankDetails?.panNumber || '',
        uanNumber: profileData.bankDetails?.uanNumber || '',
        pfAccountNumber: profileData.bankDetails?.pfAccountNumber || '',
        salaryType: profileData.salaryType || '',
        salaryCycle: profileData.salaryCycle || ''
      });
    }
  }, [profileData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        bankDetails: {
          bankName: formData.bankName,
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankBranch: formData.bankBranch,
          panNumber: formData.panNumber,
          uanNumber: formData.uanNumber,
          pfAccountNumber: formData.pfAccountNumber
        },
        salaryType: formData.salaryType,
        salaryCycle: formData.salaryCycle
      };

      const response = await api.put('/auth/profile', updateData);
      
      if (response.data.success) {
        onUpdate(response.data.user);
        onNotification('Bank and salary information updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating bank details:', error);
      onNotification(error.response?.data?.message || 'Failed to update bank information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        bankName: profileData.bankDetails?.bankName || '',
        accountHolderName: profileData.bankDetails?.accountHolderName || `${profileData.firstName} ${profileData.lastName}`,
        accountNumber: profileData.bankDetails?.accountNumber || '',
        ifscCode: profileData.bankDetails?.ifscCode || '',
        bankBranch: profileData.bankDetails?.bankBranch || '',
        panNumber: profileData.bankDetails?.panNumber || '',
        uanNumber: profileData.bankDetails?.uanNumber || '',
        pfAccountNumber: profileData.bankDetails?.pfAccountNumber || '',
        salaryType: profileData.salaryType || '',
        salaryCycle: profileData.salaryCycle || ''
      });
    }
    setIsEditing(false);
  };

  const toggleSensitiveDataVisibility = (field) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const maskSensitiveData = (data, field) => {
    if (!data) return '';
    if (showSensitiveData[field]) return data;
    
    if (field === 'accountNumber') {
      return '*'.repeat(data.length - 4) + data.slice(-4);
    } else if (field === 'panNumber') {
      return data.slice(0, 3) + '*'.repeat(data.length - 6) + data.slice(-3);
    }
    return data;
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateIFSC = (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  };

  const salaryTypes = ['Monthly', 'Hourly', 'Daily', 'Weekly'];
  const salaryCycles = [
    '1st to 31st',
    '26th to 25th',
    '21st to 20th',
    '16th to 15th',
    'Custom'
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Bank & Salary Information
        </Typography>
        {isEditable && (
          <Box>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Security Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
          Your financial information is encrypted and secure. Sensitive data is masked for your protection.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Bank Account Details */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <AccountBalance color="primary" />
                <Typography variant="h6" color="primary">
                  Bank Account Details
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    disabled={!isEditing}
                    required
                    placeholder="e.g., State Bank of India"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    value={formData.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    disabled={!isEditing}
                    required
                    helperText="Name as per bank records"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={isEditing ? formData.accountNumber : maskSensitiveData(formData.accountNumber, 'accountNumber')}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    disabled={!isEditing}
                    required
                    InputProps={{
                      endAdornment: !isEditing && formData.accountNumber && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => toggleSensitiveDataVisibility('accountNumber')}
                            edge="end"
                            size="small"
                          >
                            {showSensitiveData.accountNumber ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    disabled={!isEditing}
                    required
                    error={isEditing && formData.ifscCode && !validateIFSC(formData.ifscCode)}
                    helperText={
                      isEditing && formData.ifscCode && !validateIFSC(formData.ifscCode)
                        ? 'Invalid IFSC code format'
                        : 'e.g., SBIN0001234'
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bank Branch"
                    value={formData.bankBranch}
                    onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Branch name and location"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Government IDs & PF Details */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <CreditCard color="primary" />
                <Typography variant="h6" color="primary">
                  Government IDs & PF Details
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    value={isEditing ? formData.panNumber : maskSensitiveData(formData.panNumber, 'panNumber')}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    disabled={!isEditing}
                    required
                    error={isEditing && formData.panNumber && !validatePAN(formData.panNumber)}
                    helperText={
                      isEditing && formData.panNumber && !validatePAN(formData.panNumber)
                        ? 'Invalid PAN format (e.g., ABCDE1234F)'
                        : 'Permanent Account Number'
                    }
                    InputProps={{
                      endAdornment: !isEditing && formData.panNumber && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => toggleSensitiveDataVisibility('panNumber')}
                            edge="end"
                            size="small"
                          >
                            {showSensitiveData.panNumber ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="UAN Number"
                    value={formData.uanNumber}
                    onChange={(e) => handleInputChange('uanNumber', e.target.value)}
                    disabled={!isEditing}
                    helperText="Universal Account Number (EPFO)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="PF Account Number"
                    value={formData.pfAccountNumber}
                    onChange={(e) => handleInputChange('pfAccountNumber', e.target.value)}
                    disabled={!isEditing}
                    helperText="Provident Fund Account Number"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Salary Information */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Salary Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Salary Type</InputLabel>
                    <Select
                      value={formData.salaryType}
                      label="Salary Type"
                      onChange={(e) => handleInputChange('salaryType', e.target.value)}
                    >
                      {salaryTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Salary Cycle</InputLabel>
                    <Select
                      value={formData.salaryCycle}
                      label="Salary Cycle"
                      onChange={(e) => handleInputChange('salaryCycle', e.target.value)}
                    >
                      {salaryCycles.map((cycle) => (
                        <MenuItem key={cycle} value={cycle}>
                          {cycle}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Note:</strong> Salary structure details are managed by the HR department. 
                  Contact HR for any changes to your salary structure or components.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Summary */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ backgroundColor: theme.palette.grey[50] }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Account Summary
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip 
                  label={formData.bankName || 'Bank not specified'}
                  color={formData.bankName ? 'primary' : 'default'}
                  variant="outlined"
                />
                <Chip 
                  label={formData.ifscCode || 'IFSC not provided'}
                  color={formData.ifscCode ? 'secondary' : 'default'}
                  variant="outlined"
                />
                <Chip 
                  label={formData.panNumber ? 'PAN Provided' : 'PAN Missing'}
                  color={formData.panNumber ? 'success' : 'error'}
                  variant="outlined"
                />
                <Chip 
                  label={formData.salaryType || 'Salary type not set'}
                  color={formData.salaryType ? 'info' : 'default'}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BankSalaryTab;
