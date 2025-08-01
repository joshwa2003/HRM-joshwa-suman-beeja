import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ProfileAccessGuard = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      checkProfileCompletion();
    }
  }, [isAuthenticated]);

  const checkProfileCompletion = async () => {
    try {
      const response = await api.get('/auth/profile');
      const userData = response.data.user;
      
      // Calculate profile completion percentage
      const completion = calculateProfileCompletion(userData);
      setProfileCompletion(completion);
    } catch (error) {
      console.error('Error fetching profile completion:', error);
      setProfileCompletion(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (userData) => {
    if (!userData) return 0;

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
          fieldValue = userData.documents && userData.documents[field] && userData.documents[field].fileName;
        } else {
          fieldValue = getNestedValue(userData, field);
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

    return Math.round(totalCompletion);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  };

  // If not authenticated, let the ProtectedRoute handle it
  if (!isAuthenticated) {
    return children;
  }

  // If still loading profile completion data
  if (loading) {
    return children; // Let it load, the backend will handle the restriction
  }

  // Define allowed routes for users with incomplete profiles
  const allowedRoutes = ['/profile', '/profile/edit', '/login', '/change-password'];
  const currentPath = location.pathname;

  // PRIORITY 1: If user has default password, they MUST change it first
  // Only allow login route (which will show password change screen)
  if (user?.isDefaultPassword) {
    if (currentPath === '/login') {
      return children; // Allow login route to show password change screen
    }
    // For any other route, redirect to login to force password change
    return <Navigate to="/login" replace />;
  }

  // PRIORITY 2: If user doesn't have default password but profile completion is below 75%
  // Only allow profile-related routes
  if (profileCompletion < 75 && !allowedRoutes.includes(currentPath)) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProfileAccessGuard;
