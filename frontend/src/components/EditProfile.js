import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  AppBar,
  Toolbar,
  IconButton,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Refresh,
  Person,
  Work,
  Description,
  ContactEmergency,
  AccountBalance
} from '@mui/icons-material';
import { authAPI } from '../utils/api';
import PersonalInfoTab from './profile/PersonalInfoTab';
import WorkInfoTab from './profile/WorkInfoTab';
import DocumentsTab from './profile/DocumentsTab';
import EmergencyContactTab from './profile/EmergencyContactTab';
import BankSalaryTab from './profile/BankSalaryTab';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfileData(response.data.user);
      setFormData(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load profile data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFormUpdate = (section, data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await authAPI.updateProfile(formData);
      
      if (response.data && response.data.user) {
        setProfileData(response.data.user);
        setFormData(response.data.user);
        setHasChanges(false);
        
        setNotification({
          type: 'success',
          message: response.data.message || 'Profile updated successfully!'
        });
        
        // Dispatch event to notify MyProfile component to refresh
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.map(err => err.message || err.msg || err).join(', ');
        }
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormData(profileData);
    setHasChanges(false);
    setNotification({
      type: 'info',
      message: 'Changes discarded'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const tabs = [
    { 
      label: 'Personal Info', 
      icon: <Person />, 
      component: PersonalInfoTab 
    },
    { 
      label: 'Work Info', 
      icon: <Work />, 
      component: WorkInfoTab 
    },
    { 
      label: 'Documents', 
      icon: <Description />, 
      component: DocumentsTab 
    },
    { 
      label: 'Emergency Contact', 
      icon: <ContactEmergency />, 
      component: EmergencyContactTab 
    },
    { 
      label: 'Bank & Salary', 
      icon: <AccountBalance />, 
      component: BankSalaryTab 
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`edit-tabpanel-${index}`}
      aria-labelledby={`edit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.dark}08 100%)` }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading profile data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.dark}08 100%)`
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={2}
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          mb: 3,
          zIndex: 1000
        }}
      >
        <Toolbar sx={{ minHeight: '80px', py: 2 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/profile')}
            sx={{ 
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
              Edit Profile
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
              Update your profile information
            </Typography>
          </Box>
          <Chip
            label={user?.role}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {/* Notification */}
        {notification && (
          <Alert 
            severity={notification.type === 'success' ? 'success' : notification.type === 'info' ? 'info' : 'error'}
            onClose={() => setNotification(null)}
            sx={{ mb: 3 }}
          >
            {notification.message}
          </Alert>
        )}

        {/* Main Content */}
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 72,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    fontWeight: 600,
                  }
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                  sx={{ 
                    gap: 1,
                    px: 3,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.2rem'
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <CardContent sx={{ p: 0 }}>
            {tabs.map((tab, index) => {
              const TabComponent = tab.component;
              return (
                <TabPanel key={index} value={activeTab} index={index}>
                  <Box sx={{ px: 3 }}>
                    <TabComponent
                      profileData={formData}
                      onUpdate={(data) => handleFormUpdate(tab.label.toLowerCase().replace(' ', ''), data)}
                      onNotification={(message, type) => setNotification({ message, type })}
                      isEditable={true}
                    />
                  </Box>
                </TabPanel>
              );
            })}
          </CardContent>

          {/* Action Buttons */}
          <Box 
            sx={{ 
              p: 3, 
              borderTop: 1, 
              borderColor: 'divider',
              background: theme.palette.grey[50],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              bottom: 0,
              zIndex: 10,
              minHeight: '80px'
            }}
          >
            <Box>
              {hasChanges && (
                <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: 'warning.main'
                    }} 
                  />
                  You have unsaved changes
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleDiscard}
                disabled={!hasChanges || saving}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1.5,
                  minWidth: '140px'
                }}
              >
                Discard Changes
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={!hasChanges || saving}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  minWidth: '160px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                  },
                  '&:disabled': {
                    background: theme.palette.grey[300],
                    color: theme.palette.grey[500]
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default EditProfile;
