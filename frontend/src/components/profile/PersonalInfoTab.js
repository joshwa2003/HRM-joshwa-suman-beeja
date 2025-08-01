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
  Avatar,
  Divider,
  FormControlLabel,
  Checkbox,
  useTheme,
  Chip,
  Autocomplete
} from '@mui/material';
import { Save, Edit, Cancel } from '@mui/icons-material';
import api from '../../utils/api';

const PersonalInfoTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    maritalStatus: '',
    bloodGroup: '',
    phoneNumber: '',
    alternatePhone: '',
    personalEmail: '',
    officialEmail: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    permanentAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    sameAsCurrent: false,
    // Identity Details
    aadharNumber: '',
    panNumber: '',
    passportNumber: '',
    drivingLicenseNumber: '',
    voterIdNumber: '',
    // Family Details
    fatherName: '',
    motherName: '',
    spouseName: '',
    numberOfDependents: 0,
    nomineeForBenefits: '',
    // Other Details
    languagesKnown: [],
    hobbies: [],
    religion: '',
    casteCategory: '',
    disability: '',
    allergies: '',
    // Security & Compliance
    consentToShareInfo: false
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        gender: profileData.gender || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        nationality: profileData.nationality || '',
        maritalStatus: profileData.maritalStatus || '',
        bloodGroup: profileData.bloodGroup || '',
        phoneNumber: profileData.phoneNumber || '',
        alternatePhone: profileData.alternatePhone || '',
        personalEmail: profileData.personalEmail || '',
        officialEmail: profileData.email || '',
        address: {
          street: profileData.address?.street || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          zipCode: profileData.address?.zipCode || '',
          country: profileData.address?.country || ''
        },
        permanentAddress: {
          street: profileData.permanentAddress?.street || '',
          city: profileData.permanentAddress?.city || '',
          state: profileData.permanentAddress?.state || '',
          zipCode: profileData.permanentAddress?.zipCode || '',
          country: profileData.permanentAddress?.country || ''
        },
        sameAsCurrent: false,
        // Identity Details
        aadharNumber: profileData.aadharNumber || '',
        panNumber: profileData.panNumber || '',
        passportNumber: profileData.passportNumber || '',
        drivingLicenseNumber: profileData.drivingLicenseNumber || '',
        voterIdNumber: profileData.voterIdNumber || '',
        // Family Details
        fatherName: profileData.fatherName || '',
        motherName: profileData.motherName || '',
        spouseName: profileData.spouseName || '',
        numberOfDependents: profileData.numberOfDependents || 0,
        nomineeForBenefits: profileData.nomineeForBenefits || '',
        // Other Details
        languagesKnown: profileData.languagesKnown || [],
        hobbies: profileData.hobbies || [],
        religion: profileData.religion || '',
        casteCategory: profileData.casteCategory || '',
        disability: profileData.disability || '',
        allergies: profileData.allergies || '',
        // Security & Compliance
        consentToShareInfo: profileData.consentToShareInfo || false
      });
    }
  }, [profileData]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSameAsCurrentChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      sameAsCurrent: checked,
      permanentAddress: checked ? { ...prev.address } : {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        phoneNumber: 'Phone Number'
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!formData[field] || formData[field].trim() === '') {
          missingFields.push(label);
        }
      });

      if (missingFields.length > 0) {
        onNotification(`Please fill in the following required fields: ${missingFields.join(', ')}`, 'error');
        return;
      }

      // Validate email format if provided
      if (formData.personalEmail && formData.personalEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.personalEmail.trim())) {
          onNotification('Please enter a valid personal email address', 'error');
          return;
        }
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
        onNotification('Please enter a valid phone number', 'error');
        return;
      }

      if (formData.alternatePhone && formData.alternatePhone.trim() && !phoneRegex.test(formData.alternatePhone)) {
        onNotification('Please enter a valid alternate phone number', 'error');
        return;
      }

      // Prepare update data with proper formatting
      const updateData = {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
        nationality: formData.nationality?.trim() || null,
        maritalStatus: formData.maritalStatus || null,
        bloodGroup: formData.bloodGroup || null,
        phoneNumber: formData.phoneNumber?.trim(),
        alternatePhone: formData.alternatePhone?.trim() || null,
        personalEmail: formData.personalEmail?.trim().toLowerCase() || null,
        address: {
          street: formData.address?.street?.trim() || '',
          city: formData.address?.city?.trim() || '',
          state: formData.address?.state?.trim() || '',
          zipCode: formData.address?.zipCode?.trim() || '',
          country: formData.address?.country?.trim() || ''
        },
        permanentAddress: {
          street: formData.permanentAddress?.street?.trim() || '',
          city: formData.permanentAddress?.city?.trim() || '',
          state: formData.permanentAddress?.state?.trim() || '',
          zipCode: formData.permanentAddress?.zipCode?.trim() || '',
          country: formData.permanentAddress?.country?.trim() || ''
        },
        // Identity Details
        aadharNumber: formData.aadharNumber?.trim() || null,
        panNumber: formData.panNumber?.trim() || null,
        passportNumber: formData.passportNumber?.trim() || null,
        drivingLicenseNumber: formData.drivingLicenseNumber?.trim() || null,
        voterIdNumber: formData.voterIdNumber?.trim() || null,
        // Family Details
        fatherName: formData.fatherName?.trim() || null,
        motherName: formData.motherName?.trim() || null,
        spouseName: formData.spouseName?.trim() || null,
        numberOfDependents: formData.numberOfDependents || 0,
        nomineeForBenefits: formData.nomineeForBenefits?.trim() || null,
        // Other Details
        languagesKnown: formData.languagesKnown || [],
        hobbies: formData.hobbies || [],
        religion: formData.religion?.trim() || null,
        casteCategory: formData.casteCategory || null,
        disability: formData.disability?.trim() || null,
        allergies: formData.allergies?.trim() || null,
        // Security & Compliance
        consentToShareInfo: formData.consentToShareInfo || false
      };

      console.log('Sending update data:', updateData);

      const response = await api.put('/auth/profile', updateData);
      
      if (response.data.success) {
        onUpdate(response.data.user);
        onNotification('Personal information updated successfully!', 'success');
        setIsEditing(false);
      } else {
        onNotification(response.data.message || 'Failed to update personal information', 'error');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      
      let errorMessage = 'Failed to update personal information';
      
      if (error.response?.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          // Handle validation errors
          const errorMessages = error.response.data.errors.map(err => err.msg || err.message || err).join(', ');
          errorMessage = `Validation errors: ${errorMessages}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        gender: profileData.gender || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        nationality: profileData.nationality || '',
        maritalStatus: profileData.maritalStatus || '',
        bloodGroup: profileData.bloodGroup || '',
        phoneNumber: profileData.phoneNumber || '',
        alternatePhone: profileData.alternatePhone || '',
        personalEmail: profileData.personalEmail || '',
        officialEmail: profileData.email || '',
        address: {
          street: profileData.address?.street || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          zipCode: profileData.address?.zipCode || '',
          country: profileData.address?.country || ''
        },
        permanentAddress: {
          street: profileData.permanentAddress?.street || '',
          city: profileData.permanentAddress?.city || '',
          state: profileData.permanentAddress?.state || '',
          zipCode: profileData.permanentAddress?.zipCode || '',
          country: profileData.permanentAddress?.country || ''
        },
        sameAsCurrent: false,
        // Identity Details
        aadharNumber: profileData.aadharNumber || '',
        panNumber: profileData.panNumber || '',
        passportNumber: profileData.passportNumber || '',
        drivingLicenseNumber: profileData.drivingLicenseNumber || '',
        voterIdNumber: profileData.voterIdNumber || '',
        // Family Details
        fatherName: profileData.fatherName || '',
        motherName: profileData.motherName || '',
        spouseName: profileData.spouseName || '',
        numberOfDependents: profileData.numberOfDependents || 0,
        nomineeForBenefits: profileData.nomineeForBenefits || '',
        // Other Details
        languagesKnown: profileData.languagesKnown || [],
        hobbies: profileData.hobbies || [],
        religion: profileData.religion || '',
        casteCategory: profileData.casteCategory || '',
        disability: profileData.disability || '',
        allergies: profileData.allergies || '',
        // Security & Compliance
        consentToShareInfo: profileData.consentToShareInfo || false
      });
    }
    setIsEditing(false);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const genderOptions = ['Male', 'Female', 'Other'];
  const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const casteCategoryOptions = ['General', 'OBC', 'SC', 'ST', 'Other'];
  const languageOptions = [
    'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 
    'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Odia', 'Assamese', 'Sanskrit'
  ];
  const hobbyOptions = [
    'Reading', 'Writing', 'Sports', 'Music', 'Dancing', 'Cooking', 'Traveling', 
    'Photography', 'Painting', 'Gaming', 'Gardening', 'Swimming', 'Cycling', 
    'Yoga', 'Meditation', 'Movies', 'Technology', 'Fitness'
  ];

  // Helper function to handle array changes for Autocomplete
  const handleArrayChange = (field, newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  // Helper function to mask sensitive data
  const maskSensitiveData = (value, visibleChars = 4) => {
    if (!value) return '';
    if (value.length <= visibleChars) return value;
    return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Personal Information
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

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Gender"
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                    helperText={formData.dateOfBirth ? `Age: ${calculateAge(formData.dateOfBirth)} years` : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Marital Status</InputLabel>
                    <Select
                      value={formData.maritalStatus}
                      label="Marital Status"
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    >
                      {maritalStatusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={formData.bloodGroup}
                      label="Blood Group"
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                    >
                      {bloodGroupOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Alternate Phone"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Personal Email"
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Official Email"
                    type="email"
                    value={formData.officialEmail}
                    disabled={true}
                    helperText="Official email cannot be changed"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Address */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Current Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Permanent Address */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="primary">
                  Permanent Address
                </Typography>
                {isEditing && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.sameAsCurrent}
                        onChange={(e) => handleSameAsCurrentChange(e.target.checked)}
                      />
                    }
                    label="Same as current address"
                  />
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={formData.permanentAddress.street}
                    onChange={(e) => handleInputChange('permanentAddress.street', e.target.value)}
                    disabled={!isEditing || formData.sameAsCurrent}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.permanentAddress.city}
                    onChange={(e) => handleInputChange('permanentAddress.city', e.target.value)}
                    disabled={!isEditing || formData.sameAsCurrent}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={formData.permanentAddress.state}
                    onChange={(e) => handleInputChange('permanentAddress.state', e.target.value)}
                    disabled={!isEditing || formData.sameAsCurrent}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={formData.permanentAddress.zipCode}
                    onChange={(e) => handleInputChange('permanentAddress.zipCode', e.target.value)}
                    disabled={!isEditing || formData.sameAsCurrent}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={formData.permanentAddress.country}
                    onChange={(e) => handleInputChange('permanentAddress.country', e.target.value)}
                    disabled={!isEditing || formData.sameAsCurrent}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Identity Details */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Identity Details
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                For compliance and verification purposes (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Aadhar Number"
                    value={isEditing ? formData.aadharNumber : maskSensitiveData(formData.aadharNumber)}
                    onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                    disabled={!isEditing}
                    helperText="12-digit Aadhar number"
                    inputProps={{ maxLength: 12 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    value={isEditing ? formData.panNumber : maskSensitiveData(formData.panNumber, 3)}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    disabled={!isEditing}
                    helperText="10-character PAN number"
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Passport Number"
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value.toUpperCase())}
                    disabled={!isEditing}
                    helperText="For international travel (Optional)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driving License Number"
                    value={formData.drivingLicenseNumber}
                    onChange={(e) => handleInputChange('drivingLicenseNumber', e.target.value)}
                    disabled={!isEditing}
                    helperText="Optional"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Voter ID Number"
                    value={formData.voterIdNumber}
                    onChange={(e) => handleInputChange('voterIdNumber', e.target.value)}
                    disabled={!isEditing}
                    helperText="Optional"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Family Details */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Family Details
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                For emergency contacts, insurance, and benefits
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mother's Name"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Spouse Name"
                    value={formData.spouseName}
                    onChange={(e) => handleInputChange('spouseName', e.target.value)}
                    disabled={!isEditing}
                    helperText="If married"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Dependents"
                    type="number"
                    value={formData.numberOfDependents}
                    onChange={(e) => handleInputChange('numberOfDependents', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    inputProps={{ min: 0, max: 20 }}
                    helperText="For insurance and benefits"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nominee for Benefits"
                    value={formData.nomineeForBenefits}
                    onChange={(e) => handleInputChange('nomineeForBenefits', e.target.value)}
                    disabled={!isEditing}
                    helperText="For PF, Insurance nominations"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Other Details */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Other Details
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Additional information for organizational needs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    multiple
                    options={languageOptions}
                    value={formData.languagesKnown}
                    onChange={(event, newValue) => handleArrayChange('languagesKnown', newValue)}
                    disabled={!isEditing}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Languages Known"
                        helperText="Select multiple languages"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    multiple
                    options={hobbyOptions}
                    value={formData.hobbies}
                    onChange={(event, newValue) => handleArrayChange('hobbies', newValue)}
                    disabled={!isEditing}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hobbies/Interests"
                        helperText="Optional - for team-building insights"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Religion"
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    disabled={!isEditing}
                    helperText="Optional - for DEI compliance and holidays"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Caste Category</InputLabel>
                    <Select
                      value={formData.casteCategory}
                      label="Caste Category"
                      onChange={(e) => handleInputChange('casteCategory', e.target.value)}
                    >
                      {casteCategoryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, ml: 1.5 }}>
                      Optional - for diversity reports
                    </Typography>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Disability (if any)"
                    value={formData.disability}
                    onChange={(e) => handleInputChange('disability', e.target.value)}
                    disabled={!isEditing}
                    helperText="For inclusion initiatives (Optional)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Allergies / Medical Conditions"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                    helperText="Helps HR manage emergencies (Optional)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security & Compliance */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Security & Compliance
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.consentToShareInfo}
                        onChange={(e) => handleInputChange('consentToShareInfo', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="I consent to share my information for organizational purposes and compliance requirements"
                  />
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ ml: 4 }}>
                    For data privacy/GDPR compliance
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalInfoTab;
