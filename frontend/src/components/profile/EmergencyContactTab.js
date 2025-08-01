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
  useTheme
} from '@mui/material';
import { Save, Edit, Cancel, ContactEmergency } from '@mui/icons-material';
import api from '../../utils/api';

const EmergencyContactTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    alternatePhone: '',
    address: ''
  });

  useEffect(() => {
    if (profileData?.emergencyContact) {
      setFormData({
        name: profileData.emergencyContact.name || '',
        relationship: profileData.emergencyContact.relationship || '',
        phone: profileData.emergencyContact.phone || '',
        alternatePhone: profileData.emergencyContact.alternatePhone || '',
        address: profileData.emergencyContact.address || ''
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
        emergencyContact: formData
      };

      const response = await api.put('/auth/profile', updateData);
      
      if (response.data.success) {
        onUpdate(response.data.user);
        onNotification('Emergency contact updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      onNotification(error.response?.data?.message || 'Failed to update emergency contact', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData?.emergencyContact) {
      setFormData({
        name: profileData.emergencyContact.name || '',
        relationship: profileData.emergencyContact.relationship || '',
        phone: profileData.emergencyContact.phone || '',
        alternatePhone: profileData.emergencyContact.alternatePhone || '',
        address: profileData.emergencyContact.address || ''
      });
    }
    setIsEditing(false);
  };

  const relationshipOptions = [
    'Spouse',
    'Parent',
    'Father',
    'Mother',
    'Son',
    'Daughter',
    'Brother',
    'Sister',
    'Friend',
    'Guardian',
    'Other'
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Emergency Contact
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
        {/* Emergency Contact Information */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <ContactEmergency color="primary" />
                <Typography variant="h6" color="primary">
                  Emergency Contact Information
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Please provide details of a person who can be contacted in case of emergency. 
                This information will be kept confidential and used only when necessary.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    required
                    placeholder="Enter full name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing} required>
                    <InputLabel>Relationship</InputLabel>
                    <Select
                      value={formData.relationship}
                      label="Relationship"
                      onChange={(e) => handleInputChange('relationship', e.target.value)}
                    >
                      {relationshipOptions.map((option) => (
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
                    label="Primary Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    required
                    placeholder="+91 XXXXX XXXXX"
                    helperText="Include country code if international"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Alternate Phone Number"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+91 XXXXX XXXXX"
                    helperText="Optional backup contact number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                    placeholder="Enter complete address with city, state, and PIN code"
                    helperText="Complete address for emergency contact"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Important Notes */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ backgroundColor: theme.palette.info.main + '08' }}>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Important Notes
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Emergency contact will be notified only in case of medical emergencies or urgent situations</li>
                  <li>Please ensure the contact person is aware they are listed as your emergency contact</li>
                  <li>Keep this information updated, especially if contact details change</li>
                  <li>Multiple emergency contacts can be added by contacting HR</li>
                  <li>This information is confidential and will not be shared outside the organization</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Verification Status */}
        {formData.name && formData.phone && (
          <Grid item xs={12}>
            <Card elevation={1} sx={{ backgroundColor: theme.palette.success.main + '08' }}>
              <CardContent>
                <Typography variant="h6" color="success.main" gutterBottom>
                  Contact Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Name:</strong> {formData.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Relationship:</strong> {formData.relationship}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Primary Phone:</strong> {formData.phone}
                    </Typography>
                    {formData.alternatePhone && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Alternate Phone:</strong> {formData.alternatePhone}
                      </Typography>
                    )}
                  </Grid>
                  {formData.address && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Address:</strong> {formData.address}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EmergencyContactTab;
