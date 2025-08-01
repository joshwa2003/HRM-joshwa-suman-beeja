import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person,
  Work,
  Description,
  ContactEmergency,
  AccountBalance,
  EventAvailable,
  Schedule,
  Receipt,
  TrendingUp,
  Settings,
  Edit,
  PhotoCamera
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// Import tab components
import PersonalInfoTab from './profile/PersonalInfoTab';
import WorkInfoTab from './profile/WorkInfoTab';
import DocumentsTab from './profile/DocumentsTab';
import EmergencyContactTab from './profile/EmergencyContactTab';
import BankSalaryTab from './profile/BankSalaryTab';
import LeaveSummaryTab from './profile/LeaveSummaryTab';
import AttendanceTab from './profile/AttendanceTab';
import PayslipsTab from './profile/PayslipsTab';
import PerformanceTab from './profile/PerformanceTab';
import SettingsTab from './profile/SettingsTab';

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Tab configuration
  const tabs = [
    { 
      id: 'personal', 
      label: 'Personal Info', 
      icon: <Person />, 
      component: PersonalInfoTab,
      requiredFields: ['firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth']
    },
    { 
      id: 'work', 
      label: 'Work Info', 
      icon: <Work />, 
      component: WorkInfoTab,
      requiredFields: ['employeeId', 'department', 'designation', 'joiningDate']
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: <Description />, 
      component: DocumentsTab,
      requiredFields: ['resume', 'panCard', 'aadharCard']
    },
    { 
      id: 'emergency', 
      label: 'Emergency Contact', 
      icon: <ContactEmergency />, 
      component: EmergencyContactTab,
      requiredFields: ['emergencyContact.name', 'emergencyContact.phone', 'emergencyContact.relationship']
    },
    { 
      id: 'bank', 
      label: 'Bank & Salary', 
      icon: <AccountBalance />, 
      component: BankSalaryTab,
      requiredFields: ['bankDetails.accountNumber', 'bankDetails.bankName', 'bankDetails.ifscCode']
    },
    { 
      id: 'leave', 
      label: 'Leave Summary', 
      icon: <EventAvailable />, 
      component: LeaveSummaryTab,
      requiredFields: []
    },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      icon: <Schedule />, 
      component: AttendanceTab,
      requiredFields: []
    },
    { 
      id: 'payslips', 
      label: 'Payslips', 
      icon: <Receipt />, 
      component: PayslipsTab,
      requiredFields: []
    },
    { 
      id: 'performance', 
      label: 'Performance', 
      icon: <TrendingUp />, 
      component: PerformanceTab,
      requiredFields: []
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings />, 
      component: SettingsTab,
      requiredFields: []
    }
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profileData) {
      calculateProfileCompletion();
    }
  }, [profileData]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      setProfileData(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!profileData) return;

    // Define the 5 main sections with equal weighting (20% each)
    const sections = {
      personal: {
        weight: 20,
        fields: ['firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth', 'gender', 'nationality', 'maritalStatus']
      },
      work: {
        weight: 20,
        fields: ['employeeId', 'department', 'designation', 'joiningDate', 'reportingManager', 'workLocation']
      },
      documents: {
        weight: 20,
        fields: ['resume', 'panCard', 'aadharCard', 'passport', 'offerLetter']
      },
      emergency: {
        weight: 20,
        fields: ['emergencyContact.name', 'emergencyContact.phone', 'emergencyContact.relationship', 'emergencyContact.address']
      },
      bank: {
        weight: 20,
        fields: ['bankDetails.accountNumber', 'bankDetails.bankName', 'bankDetails.ifscCode', 'bankDetails.accountHolderName']
      }
    };

    let totalCompletion = 0;

    Object.keys(sections).forEach(sectionKey => {
      const section = sections[sectionKey];
      let sectionCompletedFields = 0;
      let sectionTotalFields = section.fields.length;

      section.fields.forEach(field => {
        let fieldValue;
        
        // Handle document fields differently
        if (sectionKey === 'documents') {
          fieldValue = profileData.documents && profileData.documents[field] && profileData.documents[field].fileName;
        } else {
          fieldValue = getNestedValue(profileData, field);
        }

        // Check if field is completed
        if (fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined) {
          sectionCompletedFields++;
        }
      });

      // Calculate section completion percentage
      const sectionCompletion = sectionTotalFields > 0 ? (sectionCompletedFields / sectionTotalFields) : 0;
      
      // Add weighted section completion to total
      totalCompletion += (sectionCompletion * section.weight);
    });

    const completion = Math.round(totalCompletion);
    setProfileCompletion(completion);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
    showNotification('Profile updated successfully!');
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      // Use the correct upload endpoint
      const response = await api.post('/auth/upload-profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update profile data with the new photo URL
      setProfileData(prev => ({
        ...prev,
        profilePhoto: response.data.profilePhoto
      }));
      
      // Notify other components about the profile photo update
      if (window.profilePhotoUpdated) {
        window.profilePhotoUpdated(response.data.profilePhoto);
      }
      
      // Also trigger a custom event for components that might not be using the global callback
      window.dispatchEvent(new CustomEvent('profilePhotoUpdated', {
        detail: { profilePhoto: response.data.profilePhoto }
      }));
      
      showNotification('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload profile photo';
      showNotification(errorMessage, 'error');
    }
  };

  const getCurrentTabComponent = () => {
    const currentTab = tabs[activeTab];
    const TabComponent = currentTab.component;
    
    return (
      <TabComponent
        profileData={profileData}
        onUpdate={handleProfileUpdate}
        onNotification={showNotification}
        isEditable={canEditSection(currentTab.id)}
      />
    );
  };

  const canEditSection = (sectionId) => {
    const userRole = user?.role?.toLowerCase();
    
    // Admin and HR can edit everything
    if (['admin', 'hr manager', 'hr bp', 'hr executive'].includes(userRole)) {
      return true;
    }

    // Employees can edit personal info, documents, emergency contact
    if (['employee', 'team leader', 'team manager'].includes(userRole)) {
      return ['personal', 'documents', 'emergency', 'settings'].includes(sectionId);
    }

    return false;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <LinearProgress sx={{ width: 200, mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading profile...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={3}>
            <Box position="relative">
              <Avatar
                src={profileData?.profilePhoto}
                sx={{ 
                  width: 80, 
                  height: 80,
                  border: `3px solid ${theme.palette.primary.main}`,
                  fontSize: '2rem'
                }}
              >
                {!profileData?.profilePhoto && (
                  `${profileData?.firstName?.[0] || ''}${profileData?.lastName?.[0] || ''}`
                )}
              </Avatar>
              <Box
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                <PhotoCamera sx={{ fontSize: 16, color: 'white' }} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {profileData?.firstName} {profileData?.lastName}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {profileData?.role === 'Admin' ? 'System Administrator' : (profileData?.designation || 'Employee')}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={profileData?.department || 'No Department'} 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  label={profileData?.employeeId || 'No ID'} 
                  color="secondary" 
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  label={profileData?.role === 'Admin' ? 'Admin' : (profileData?.role || 'Employee')} 
                  color="info" 
                  variant="outlined" 
                  size="small" 
                />
              </Box>
            </Box>
          </Box>

          <Box textAlign={isMobile ? 'center' : 'right'}>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate('/profile/edit')}
              sx={{ mb: 2 }}
            >
              Edit Profile
            </Button>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Profile Completion
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LinearProgress
                  variant="determinate"
                  value={profileCompletion}
                  sx={{ 
                    width: 120, 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: profileCompletion >= 70 ? theme.palette.success.main : 
                                     profileCompletion >= 50 ? theme.palette.warning.main : 
                                     theme.palette.error.main
                    }
                  }}
                />
                <Typography variant="body2" fontWeight="bold">
                  {profileCompletion}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Completion Alert */}
      {profileCompletion < 70 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Your profile is {profileCompletion}% complete. Please complete at least 70% to access the dashboard and other system features.
          </Typography>
        </Alert>
      )}

      {/* Main Profile Content */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: theme.palette.grey[50] }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{ 
                  gap: 1,
                  px: isMobile ? 1 : 2,
                  minWidth: isMobile ? 'auto' : 140
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {getCurrentTabComponent()}
        </Box>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyProfile;
