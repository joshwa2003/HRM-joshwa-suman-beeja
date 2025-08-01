import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import {
  Person,
  Work,
  Description,
  ContactEmergency,
  AccountBalance,
  CheckCircle,
  RadioButtonUnchecked,
  Warning,
  Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const ProfileCompletionGuard = ({ children }) => {
  const navigate = useNavigate();
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      setLoading(true);
      const response = await authAPI.checkProfileCompletion();
      setProfileCompletion(response.data);
      
      // If profile is complete, render children
      if (response.data.canAccessDashboard) {
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Profile completion check error:', error);
      setError('Failed to check profile completion status');
    } finally {
      setLoading(false);
    }
  };

  const profileSections = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: <Person />,
      description: 'Basic personal details, contact information, and address',
      fields: ['Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Address'],
      weight: 20
    },
    {
      id: 'work',
      title: 'Work Information',
      icon: <Work />,
      description: 'Employment details and organizational information',
      fields: ['Employee ID', 'Department', 'Designation', 'Joining Date', 'Reporting Manager'],
      weight: 20
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: <Description />,
      description: 'Required documents and certificates',
      fields: ['Resume', 'PAN Card', 'Aadhar Card', 'Passport', 'Offer Letter'],
      weight: 20
    },
    {
      id: 'emergency',
      title: 'Emergency Contact',
      icon: <ContactEmergency />,
      description: 'Emergency contact person details',
      fields: ['Contact Name', 'Relationship', 'Phone Number', 'Address'],
      weight: 20
    },
    {
      id: 'bank',
      title: 'Bank & Salary Details',
      icon: <AccountBalance />,
      description: 'Banking information for salary processing',
      fields: ['Account Number', 'Bank Name', 'IFSC Code', 'Account Holder Name'],
      weight: 20
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <LinearProgress sx={{ width: 200, mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Checking profile completion...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={checkProfileCompletion}>
          Retry
        </Button>
      </Container>
    );
  }

  // If profile is complete (75% or more), render the protected content
  if (profileCompletion?.canAccessDashboard) {
    return children;
  }

  // Profile is incomplete, show completion requirement
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="primary">
            Profile Completion Required
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Complete your profile to access all system features
          </Typography>
          
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} sx={{ mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={profileCompletion?.profileCompletionPercentage || 0}
              sx={{ 
                width: 200, 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: profileCompletion?.profileCompletionPercentage >= 70 ? 'success.main' : 
                                 profileCompletion?.profileCompletionPercentage >= 50 ? 'warning.main' : 
                                 'error.main'
                }
              }}
            />
            <Typography variant="h6" fontWeight="bold" color="primary">
              {profileCompletion?.profileCompletionPercentage || 0}%
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Access Restricted:</strong> You need to complete at least{' '}
              <strong>{profileCompletion?.requiredPercentage || 70}%</strong> of your profile 
              to access the dashboard and other system features.
            </Typography>
          </Alert>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Profile Sections
        </Typography>

        <Box sx={{ mb: 4 }}>
          {profileSections.map((section, index) => (
            <Card 
              key={section.id} 
              variant="outlined" 
              sx={{ 
                mb: 2,
                border: '2px solid',
                borderColor: 'grey.200',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {section.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {section.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {section.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Chip
                      label={`${section.weight}% Weight`}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Required for access
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Required Fields:
                </Typography>
                <List dense>
                  {section.fields.map((field, fieldIndex) => (
                    <ListItem key={fieldIndex} sx={{ py: 0.5, pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <RadioButtonUnchecked fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={field}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<Edit />}
            onClick={() => navigate('/profile')}
            sx={{ px: 4, py: 1.5 }}
          >
            Complete My Profile
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Click above to go to your profile page and complete the required information
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileCompletionGuard;
