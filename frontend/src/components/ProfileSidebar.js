import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Chip,
  useTheme,
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
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import api from '../utils/api';

const ProfileSidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State variables
  const [profileData, setProfileData] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Fetch profile data to get profile photo
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/auth/profile');
        setProfileData(response.data.user);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();

    // Listen for profile photo updates from other components
    const handleProfilePhotoUpdate = (newProfilePhoto) => {
      setProfileData(prev => ({
        ...prev,
        profilePhoto: newProfilePhoto
      }));
    };

    window.profilePhotoUpdated = handleProfilePhotoUpdate;

    return () => {
      delete window.profilePhotoUpdated;
    };
  }, []);

  // Listen for active section changes from MyProfile
  useEffect(() => {
    const handleActiveTabChange = (section) => {
      setActiveSection(section);
    };

    // Set up global listener
    window.profileActiveTabChange = handleActiveTabChange;

    // Check URL hash for initial section
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
    }

    return () => {
      delete window.profileActiveTabChange;
    };
  }, []);

  const profileMenuItems = [
    {
      key: 'personal-info',
      title: 'Personal Info',
      icon: Person,
      path: '/profile',
      section: 'personal'
    },
    {
      key: 'work-info',
      title: 'Work Info',
      icon: Work,
      path: '/profile',
      section: 'work'
    },
    {
      key: 'documents',
      title: 'Documents',
      icon: Description,
      path: '/profile',
      section: 'documents'
    },
    {
      key: 'emergency-contact',
      title: 'Emergency Contact',
      icon: ContactEmergency,
      path: '/profile',
      section: 'emergency'
    },
    {
      key: 'bank-salary',
      title: 'Bank & Salary',
      icon: AccountBalance,
      path: '/profile',
      section: 'bank'
    },
    {
      key: 'leave-summary',
      title: 'Leave Summary',
      icon: EventAvailable,
      path: '/profile',
      section: 'leave'
    },
    {
      key: 'attendance',
      title: 'Attendance',
      icon: Schedule,
      path: '/profile',
      section: 'attendance'
    },
    {
      key: 'payslips',
      title: 'Payslips',
      icon: Receipt,
      path: '/profile',
      section: 'payslips'
    },
    {
      key: 'performance',
      title: 'Performance',
      icon: TrendingUp,
      path: '/profile',
      section: 'performance'
    },
    {
      key: 'settings',
      title: 'Settings',
      icon: Settings,
      path: '/profile',
      section: 'settings'
    }
  ];

  const handleSectionClick = (section) => {
    // Update local state immediately
    setActiveSection(section);
    
    // Navigate to profile with section hash
    navigate(`/profile#${section}`);
    
    // Communicate with MyProfile component to change the active section
    if (window.profileSectionChange) {
      window.profileSectionChange(section);
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  const renderMenuItem = (item) => {
    const IconComponent = item.icon;
    const isActive = activeSection === item.section;
    
    return (
      <ListItem key={item.key} disablePadding>
        <ListItemButton
          onClick={() => handleSectionClick(item.section)}
          selected={isActive}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            py: 1.5,
            transition: 'all 0.2s ease-in-out',
            '&.Mui-selected': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transform: 'translateX(4px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              transform: 'translateX(2px)',
            },
          }}
        >
          <ListItemIcon 
            sx={{ 
              color: 'inherit', 
              minWidth: 40,
              '& .MuiSvgIcon-root': {
                fontSize: '1.3rem',
                filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none',
              }
            }}
          >
            <IconComponent />
          </ListItemIcon>
          <ListItemText 
            primary={item.title}
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
              color: 'white',
              textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      }}
    >
      {/* User Info Section */}
      <Box 
        sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={profileData?.profilePhoto}
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              mr: 2,
              fontWeight: 700,
              fontSize: '1.2rem',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {!profileData?.profilePhoto && getInitials(user?.firstName, user?.lastName)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                color: 'white',
                fontSize: '0.95rem',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.75rem',
                display: 'block',
                mt: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              sx={{ 
                height: 22, 
                fontSize: '0.7rem',
                fontWeight: 600,
                mt: 1,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '& .MuiChip-label': {
                  px: 1.5,
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Profile Sections Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          Profile Sections
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(255,255,255,0.4)',
            },
          },
        }}
      >
        <List sx={{ py: 2, px: 1 }}>
          {profileMenuItems.map(renderMenuItem)}
        </List>
      </Box>

      {/* Quick Actions */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 2,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          Quick Actions
        </Typography>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: 2,
                py: 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(2px)',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: 'inherit', 
                  minWidth: 36,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.1rem',
                  }
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Go to Dashboard"
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'white',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default ProfileSidebar;
