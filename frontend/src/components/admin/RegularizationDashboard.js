import React, { useState, useEffect } from 'react';
import { regularizationAPI, regularizationTeamLeaderAPI, regularizationTeamManagerAPI, regularizationHRAPI, regularizationVPAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Material UI imports
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Skeleton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Snackbar,
  Breadcrumbs,
  Link,
  Stack,
  Badge
} from '@mui/material';

// Material UI Icons
import {
  AccessTime,
  Visibility,
  CheckCircle,
  Cancel,
  Person,
  CalendarToday,
  Info,
  History,
  AttachFile,
  Download,
  Preview,
  Shield,
  Assignment,
  PendingActions,
  Approved,
  Dangerous,
  Close,
  Check,
  Clear,
  FilePresent,
  Image,
  PictureAsPdf,
  Description,
  TableChart,
  Home,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

// Custom theme colors for status
const statusColors = {
  pending: '#ff9800',
  approved: '#4caf50',
  rejected: '#f44336',
  underReview: '#2196f3'
};

const priorityColors = {
  Urgent: '#f44336',
  High: '#ff9800',
  Normal: '#2196f3',
  Low: '#9e9e9e'
};

const RegularizationDashboard = () => {
  const { user } = useAuth();
  const [regularizations, setRegularizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedRegularization, setSelectedRegularization] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Get role-specific configuration
  const getRoleConfig = () => {
    switch (user.role) {
      case 'Team Leader':
      case 'Team Lead':
        return {
          api: regularizationTeamLeaderAPI,
          title: 'Team Leader - Regularization Dashboard',
          subtitle: 'Review and approve attendance regularization requests',
          icon: 'bi-clipboard-check',
          approveText: 'Approve & Forward',
          canOverride: false
        };
      
      case 'Team Manager':
      case 'Manager':
        return {
          api: regularizationTeamManagerAPI,
          title: 'Team Manager - Regularization Dashboard',
          subtitle: 'Review and approve attendance regularization requests (Final Approval)',
          icon: 'bi-clipboard-check',
          approveText: 'Final Approve',
          canOverride: false
        };
      
      case 'HR Manager':
      case 'HR BP':
      case 'HR Executive':
        return {
          api: regularizationHRAPI,
          title: 'HR - Regularization Dashboard',
          subtitle: 'Review and approve Team Manager regularization requests',
          icon: 'bi-clipboard-check',
          approveText: 'HR Approve',
          canOverride: false,
          viewOnly: false
        };
      
      case 'VP':
      case 'Vice President':
      case 'Senior VP':
        return {
          api: regularizationVPAPI,
          title: 'VP - Regularization Dashboard',
          subtitle: 'Executive oversight of HR attendance regularization requests',
          icon: 'bi-clipboard-check',
          approveText: 'VP Approve',
          canOverride: true
        };
      
      case 'Admin':
      case 'System Administrator':
      case 'Super Admin':
        return {
          api: regularizationVPAPI,
          title: 'Admin - Regularization Dashboard',
          subtitle: 'System administration and oversight of all attendance regularization requests',
          icon: 'bi-shield-check',
          approveText: 'Admin Approve',
          canOverride: true
        };
      
      default:
        return null;
    }
  };

  const roleConfig = getRoleConfig();

  const fetchRegularizations = async () => {
    if (!roleConfig) return;

    try {
      setLoading(true);
      setError('');
      
      let response;
      if (roleConfig.api === regularizationTeamLeaderAPI) {
        // Team Leader should see all regularizations (pending, approved, rejected) for visibility
        response = await roleConfig.api.getAllRegularizations({ page: 1, limit: 100 });
      } else if (roleConfig.api === regularizationTeamManagerAPI) {
        // Team Manager should see all regularizations (pending, approved, rejected) for visibility
        response = await roleConfig.api.getAllRegularizations({ page: 1, limit: 100 });
      } else if (roleConfig.api === regularizationHRAPI) {
        response = await roleConfig.api.getAllRegularizations({ page: 1, limit: 100 });
      } else if (roleConfig.api === regularizationVPAPI) {
        // VP/Admin should see all regularizations (pending, approved, rejected) for visibility
        response = await roleConfig.api.getAllRegularizations({ page: 1, limit: 100 });
      }

      if (response.data.success) {
        const data = response.data.data;
        setRegularizations(data.docs || data || []);
      } else {
        setRegularizations([]);
      }
    } catch (error) {
      console.error('Error fetching regularizations:', error);
      setError('Failed to load regularizations: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleConfig) {
      setError(`Access denied. Your role (${user.role}) does not have access to the regularization dashboard.`);
      return;
    }
    
    fetchRegularizations();
  }, [user.role]);

  // Handle approval
  const handleApprove = async () => {
    if (!selectedRegularization || !roleConfig) return;

    try {
      setActionLoading(true);
      await roleConfig.api.approveRegularization(selectedRegularization._id, { 
        comments: approvalComments 
      });

      let message = 'Request approved successfully!';
      if (user.role === 'Team Leader' || user.role === 'Team Lead') {
        message = 'Request approved successfully and forwarded to Team Manager!';
      } else if (user.role === 'Team Manager' || user.role === 'Manager') {
        message = 'Request approved successfully! Attendance has been updated.';
      } else {
        message = 'Request approved successfully! Attendance has been updated.';
      }

      alert(message);
      
      setShowApprovalModal(false);
      setSelectedRegularization(null);
      setApprovalComments('');
      fetchRegularizations();
    } catch (error) {
      console.error('Error approving regularization:', error);
      alert('Failed to approve regularization: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle rejection
  const handleReject = async () => {
    if (!selectedRegularization || !rejectionReason.trim() || !roleConfig) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      await roleConfig.api.rejectRegularization(selectedRegularization._id, { 
        reason: rejectionReason 
      });
      
      setShowRejectionModal(false);
      setSelectedRegularization(null);
      setRejectionReason('');
      fetchRegularizations();
      
      alert('Regularization rejected successfully.');
    } catch (error) {
      console.error('Error rejecting regularization:', error);
      alert('Failed to reject regularization: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChipProps = (status, currentLevel) => {
    if (status === 'Approved') {
      if (currentLevel === 'Team Leader') return { color: 'primary', icon: <Check /> };
      if (currentLevel === 'Team Manager') return { color: 'success', icon: <CheckCircle /> };
      return { color: 'success', icon: <CheckCircle /> };
    }
    switch (status) {
      case 'Pending': return { color: 'warning', icon: <AccessTime /> };
      case 'Under Review': return { color: 'primary', icon: <Visibility /> };
      case 'Rejected': return { color: 'error', icon: <Cancel /> };
      default: return { color: 'default', icon: <Info /> };
    }
  };

  const getPriorityChipProps = (priority) => {
    switch (priority) {
      case 'Urgent': return { color: 'error', sx: { backgroundColor: priorityColors.Urgent, color: 'white' } };
      case 'High': return { color: 'warning', sx: { backgroundColor: priorityColors.High, color: 'white' } };
      case 'Normal': return { color: 'primary', sx: { backgroundColor: priorityColors.Normal, color: 'white' } };
      case 'Low': return { color: 'default', sx: { backgroundColor: priorityColors.Low, color: 'white' } };
      default: return { color: 'default' };
    }
  };

  // Helper function to get priority badge class for Bootstrap elements
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-danger';
      case 'High': return 'bg-warning';
      case 'Normal': return 'bg-primary';
      case 'Low': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // Helper function to get status badge class for Bootstrap elements
  const getStatusBadgeClass = (status, currentLevel) => {
    if (status === 'Approved') {
      if (currentLevel === 'Team Leader') return 'bg-primary';
      if (currentLevel === 'Team Manager') return 'bg-success';
      return 'bg-success';
    }
    switch (status) {
      case 'Pending': return 'bg-warning';
      case 'Under Review': return 'bg-info';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  // Helper function to get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <Image />;
    if (mimeType?.includes('pdf')) return <PictureAsPdf />;
    if (mimeType?.includes('word')) return <Description />;
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return <TableChart />;
    return <FilePresent />;
  };

  // Helper function to get file icon class for Bootstrap elements
  const getFileIconClass = (mimeType) => {
    if (mimeType?.startsWith('image/')) return 'bi-image';
    if (mimeType?.includes('pdf')) return 'bi-file-earmark-pdf';
    if (mimeType?.includes('word')) return 'bi-file-earmark-word';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'bi-file-earmark-excel';
    return 'bi-file-earmark';
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to check if file is previewable
  const isPreviewable = (mimeType) => {
    return mimeType?.startsWith('image/') || mimeType?.includes('pdf');
  };

  // Handle file download
  const handleFileDownload = async (document) => {
    try {
      const downloadUrl = `http://localhost:5001${document.fileUrl}`;
      const fileName = document.originalName || document.fileName;
      
      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger download
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Handle file preview
  const handleFilePreview = (document) => {
    setSelectedAttachment(document);
    setShowAttachmentModal(true);
  };

  // Calculate statistics
  const stats = regularizations.reduce((acc, reg) => {
    acc.total++;
    if (reg.status === 'Pending') acc.pending++;
    if (reg.status === 'Under Review') acc.underReview++;
    if (reg.status === 'Approved') acc.approved++;
    if (reg.status === 'Rejected') acc.rejected++;
    return acc;
  }, { total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0 });

  if (!roleConfig) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" icon={<Dangerous />}>
          <Typography variant="h6" component="div">
            Access Denied
          </Typography>
          <Typography variant="body2">
            Your role ({user.role}) does not have access to the regularization dashboard.
            <br />
            Please contact your administrator if you believe this is an error.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" icon={<Dangerous />}>
          <Typography variant="body1">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link color="inherit" href="/admin" sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Admin
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ mr: 0.5 }} fontSize="inherit" />
            Regularization Dashboard
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                {roleConfig.icon === 'bi-shield-check' ? <Shield sx={{ mr: 2, fontSize: 40 }} /> : <Assignment sx={{ mr: 2, fontSize: 40 }} />}
                {roleConfig.title}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {roleConfig.subtitle}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
            color: 'white',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AccessTime sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.pending}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', 
            color: 'white',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Visibility sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.underReview}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Under Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', 
            color: 'white',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.approved}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', 
            color: 'white',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Cancel sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.rejected}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin System Overview */}
      {(user.role === 'Admin' || user.role === 'System Administrator' || user.role === 'Super Admin') && (
        <Box sx={{ mb: 4 }}>
          <Card elevation={2} sx={{ backgroundColor: '#e3f2fd', border: '1px solid #bbdefb' }}>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Info sx={{ mr: 1 }} />
                System Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Requests
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Approval Rate
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Pending Actions
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      {stats.pending + stats.underReview}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Regularizations Table */}
      <Box sx={{ mb: 4 }}>
        <Card elevation={3}>
          <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <Assignment sx={{ mr: 2 }} />
              Regularization Requests
            </Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            {regularizations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PendingActions sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                  No regularization requests found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Try adjusting your filters or check back later.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="regularization requests table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#fafafa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Level</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {regularizations.map((regularization) => (
                      <TableRow 
                        key={regularization._id}
                        sx={{ 
                          '&:hover': { backgroundColor: '#f5f5f5' },
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {regularization.employee?.firstName} {regularization.employee?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {regularization.employee?.employeeId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(regularization.attendanceDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={regularization.requestType}
                            color="info"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            {...getStatusChipProps(regularization.status, regularization.currentLevel)}
                            label={
                              regularization.status === 'Approved' && regularization.currentLevel === 'Team Leader' ? 'TL Approved' :
                              regularization.status === 'Approved' && regularization.currentLevel === 'Team Manager' ? 'TM Approved' :
                              regularization.status
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={regularization.currentLevel || 'HR'}
                            color="default"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            {...getPriorityChipProps(regularization.priority)}
                            label={regularization.priority}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(regularization.submittedDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedRegularization(regularization);
                                  setShowDetailsModal(true);
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            {/* Show action buttons based on role and status */}
                            {((user.role === 'Team Leader' || user.role === 'Team Lead') && regularization.status === 'Pending' && regularization.currentLevel === 'Team Leader') ||
                             ((user.role === 'Team Manager' || user.role === 'Manager') && regularization.status === 'Pending' && regularization.currentLevel === 'Team Manager') ||
                             ((['HR Manager', 'HR BP', 'HR Executive'].includes(user.role)) && regularization.status === 'Pending' && regularization.currentLevel === 'HR') ||
                             ((['VP', 'Vice President', 'Senior VP'].includes(user.role)) && regularization.status === 'Pending' && (regularization.currentLevel === 'VP/Admin' || regularization.currentLevel === 'HR')) ||
                             (roleConfig.canOverride && !['VP', 'Vice President', 'Senior VP'].includes(user.role)) ? (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => {
                                      setSelectedRegularization(regularization);
                                      setApprovalComments('');
                                      setShowApprovalModal(true);
                                    }}
                                    disabled={actionLoading}
                                  >
                                    <Check />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setSelectedRegularization(regularization);
                                      setRejectionReason('');
                                      setShowRejectionModal(true);
                                    }}
                                    disabled={actionLoading}
                                  >
                                    <Clear />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : null}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Approval Modal */}
      <Dialog
        open={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'success.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <CheckCircle sx={{ mr: 2 }} />
          Approve Regularization Request
          <IconButton
            aria-label="close"
            onClick={() => setShowApprovalModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRegularization && (
            <Box>
              <Card elevation={1} sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ mr: 1 }} />
                    Request Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Employee:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedRegularization.employee?.firstName} {selectedRegularization.employee?.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatDate(selectedRegularization.attendanceDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Type:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedRegularization.requestType}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Reason:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedRegularization.reason}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Approval Comments (Optional)"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Add any comments for this approval..."
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowApprovalModal(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={actionLoading}
            variant="contained"
            color="success"
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Check />}
          >
            {actionLoading ? 'Approving...' : roleConfig.approveText}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog
        open={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'error.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Cancel sx={{ mr: 2 }} />
          Reject Regularization Request
          <IconButton
            aria-label="close"
            onClick={() => setShowRejectionModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRegularization && (
            <Box>
              <Card elevation={1} sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ mr: 1 }} />
                    Request Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Employee:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedRegularization.employee?.firstName} {selectedRegularization.employee?.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatDate(selectedRegularization.attendanceDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Type:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedRegularization.requestType}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Reason:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedRegularization.reason}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Rejection Reason *"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejecting this request..."
                variant="outlined"
                required
                error={!rejectionReason.trim()}
                helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowRejectionModal(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReject}
            disabled={actionLoading || !rejectionReason.trim()}
            variant="contained"
            color="error"
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Clear />}
          >
            {actionLoading ? 'Rejecting...' : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Modal */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="xl"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Assignment sx={{ mr: 2 }} />
          Regularization Request Details
          <IconButton
            aria-label="close"
            onClick={() => setShowDetailsModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRegularization && (
            <Grid container spacing={3}>
              {/* Left Column - Basic Details & Approval History */}
              <Grid item xs={12} md={6}>
                {/* Employee Information */}
                <Card elevation={1} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1 }} />
                      Employee Information
                    </Typography>
                  </Box>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Name:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          {selectedRegularization.employee?.firstName} {selectedRegularization.employee?.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Employee ID:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          {selectedRegularization.employee?.employeeId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Department:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          {selectedRegularization.employee?.department || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Role:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          {selectedRegularization.employee?.role}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Request Information */}
                <Card elevation={1} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 1 }} />
                      Request Information
                    </Typography>
                  </Box>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Request ID:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          {selectedRegularization.regularizationId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Date:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          {formatDate(selectedRegularization.attendanceDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Type:</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip label={selectedRegularization.requestType} color="info" size="small" />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Priority:</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            {...getPriorityChipProps(selectedRegularization.priority)}
                            label={selectedRegularization.priority}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Reason:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          {selectedRegularization.reason}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Time Details */}
                {(selectedRegularization.requestedCheckIn || selectedRegularization.requestedCheckOut) && (
                  <Card elevation={1} sx={{ mb: 3 }}>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ mr: 1 }} />
                        Requested Times
                      </Typography>
                    </Box>
                    <CardContent>
                      <Grid container spacing={2}>
                        {selectedRegularization.requestedCheckIn && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Check-In:</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                              {formatDateTime(selectedRegularization.requestedCheckIn)}
                            </Typography>
                          </Grid>
                        )}
                        {selectedRegularization.requestedCheckOut && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Check-Out:</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                              {formatDateTime(selectedRegularization.requestedCheckOut)}
                            </Typography>
                          </Grid>
                        )}
                        {selectedRegularization.requestedStatus && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Requested Status:</Typography>
                            <Box sx={{ mb: 2 }}>
                              <Chip label={selectedRegularization.requestedStatus} color="default" size="small" />
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Approval History */}
                <Card elevation={1} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <History sx={{ mr: 1 }} />
                      Approval History
                    </Typography>
                  </Box>
                  <CardContent>
                    <List>
                      {/* Team Leader Approval */}
                      {selectedRegularization.teamLeaderApproval?.status !== 'Pending' && (
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              backgroundColor: selectedRegularization.teamLeaderApproval?.status === 'Approved' ? 'success.main' : 'error.main' 
                            }}>
                              {selectedRegularization.teamLeaderApproval?.status === 'Approved' ? <Check /> : <Clear />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Team Leader"
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  {selectedRegularization.teamLeaderApproval?.approver?.firstName} {selectedRegularization.teamLeaderApproval?.approver?.lastName}
                                </Typography>
                                {selectedRegularization.teamLeaderApproval?.actionDate && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDateTime(selectedRegularization.teamLeaderApproval.actionDate)}
                                  </Typography>
                                )}
                                {selectedRegularization.teamLeaderApproval?.comments && (
                                  <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                                    "{selectedRegularization.teamLeaderApproval.comments}"
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      )}

                      {/* Team Manager Approval */}
                      {selectedRegularization.teamManagerApproval?.status !== 'Pending' && (
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              backgroundColor: selectedRegularization.teamManagerApproval?.status === 'Approved' ? 'success.main' : 'error.main' 
                            }}>
                              {selectedRegularization.teamManagerApproval?.status === 'Approved' ? <Check /> : <Clear />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Team Manager"
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  {selectedRegularization.teamManagerApproval?.approver?.firstName} {selectedRegularization.teamManagerApproval?.approver?.lastName}
                                </Typography>
                                {selectedRegularization.teamManagerApproval?.actionDate && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDateTime(selectedRegularization.teamManagerApproval.actionDate)}
                                  </Typography>
                                )}
                                {selectedRegularization.teamManagerApproval?.comments && (
                                  <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                                    "{selectedRegularization.teamManagerApproval.comments}"
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      )}

                      {/* HR Approval */}
                      {selectedRegularization.hrApproval?.status !== 'Pending' && (
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              backgroundColor: selectedRegularization.hrApproval?.status === 'Approved' ? 'success.main' : 'error.main' 
                            }}>
                              {selectedRegularization.hrApproval?.status === 'Approved' ? <Check /> : <Clear />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="HR / VP"
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  {selectedRegularization.hrApproval?.approver?.firstName} {selectedRegularization.hrApproval?.approver?.lastName}
                                </Typography>
                                {selectedRegularization.hrApproval?.actionDate && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDateTime(selectedRegularization.hrApproval.actionDate)}
                                  </Typography>
                                )}
                                {selectedRegularization.hrApproval?.comments && (
                                  <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                                    "{selectedRegularization.hrApproval.comments}"
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - Status & Attachments */}
              <Grid item xs={12} md={6}>
                {/* Status Information */}
                <Card elevation={1} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Info sx={{ mr: 1 }} />
                      Status Information
                    </Typography>
                  </Box>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Current Status:</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            {...getStatusChipProps(selectedRegularization.status, selectedRegularization.currentLevel)}
                            label={selectedRegularization.status}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Current Level:</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip label={selectedRegularization.currentLevel} color="default" size="small" variant="outlined" />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Submitted:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          {formatDateTime(selectedRegularization.submittedDate)}
                        </Typography>
                      </Grid>
                      {selectedRegularization.approvedDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Approved:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            {formatDateTime(selectedRegularization.approvedDate)}
                          </Typography>
                        </Grid>
                      )}
                      {selectedRegularization.rejectedDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Rejected:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            {formatDateTime(selectedRegularization.rejectedDate)}
                          </Typography>
                        </Grid>
                      )}
                      {selectedRegularization.rejectionReason && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Rejection Reason:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: 'error.main' }}>
                            {selectedRegularization.rejectionReason}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Attachments Section */}
                <Card elevation={1} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachFile sx={{ mr: 1 }} />
                      Attachments {selectedRegularization.supportingDocuments && selectedRegularization.supportingDocuments.length > 0 && `(${selectedRegularization.supportingDocuments.length})`}
                    </Typography>
                  </Box>
                  <CardContent>
                    {selectedRegularization.supportingDocuments && selectedRegularization.supportingDocuments.length > 0 ? (
                      <List>
                        {selectedRegularization.supportingDocuments.map((document, index) => (
                          <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ backgroundColor: 'primary.light' }}>
                                {getFileIcon(document.mimeType)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={document.originalName}
                              secondary={
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatFileSize(document.fileSize)} • Uploaded {formatDateTime(document.uploadedAt)}
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Preview">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleFilePreview(document)}
                                  >
                                    <Preview />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleFileDownload(document)}
                                  >
                                    <Download />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <FilePresent sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          No attachments
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowDetailsModal(false)}
            variant="outlined"
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attachment Preview Modal */}
      <Dialog
        open={showAttachmentModal}
        onClose={() => {
          setShowAttachmentModal(false);
          setSelectedAttachment(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <FilePresent sx={{ mr: 2 }} />
          Attachment Preview
          <IconButton
            aria-label="close"
            onClick={() => {
              setShowAttachmentModal(false);
              setSelectedAttachment(null);
            }}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedAttachment && (
            <Box>
              <Card elevation={1} sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, backgroundColor: 'primary.light' }}>
                        {getFileIcon(selectedAttachment.mimeType)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {selectedAttachment.originalName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(selectedAttachment.fileSize)} • {selectedAttachment.mimeType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {formatDateTime(selectedAttachment.uploadedAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Download />}
                      onClick={() => handleFileDownload(selectedAttachment)}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Paper elevation={1} sx={{ p: 3, minHeight: '400px' }}>
                {/* Image Preview */}
                {selectedAttachment.mimeType?.startsWith('image/') && (
                  <Box sx={{ textAlign: 'center' }}>
                    <img
                      src={`http://localhost:5001${selectedAttachment.fileUrl}`}
                      alt={selectedAttachment.originalName}
                      style={{ 
                        maxHeight: '500px', 
                        maxWidth: '100%', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  </Box>
                )}

                {/* PDF Preview */}
                {selectedAttachment.mimeType?.includes('pdf') && (
                  <Box sx={{ textAlign: 'center' }}>
                    <iframe
                      src={`http://localhost:5001${selectedAttachment.fileUrl}`}
                      width="100%"
                      height="500px"
                      style={{ border: 'none', borderRadius: '8px' }}
                      title={selectedAttachment.originalName}
                    />
                  </Box>
                )}

                {/* Other file types */}
                {!selectedAttachment.mimeType?.startsWith('image/') && !selectedAttachment.mimeType?.includes('pdf') && (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    {getFileIcon(selectedAttachment.mimeType)}
                    <Typography variant="h5" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                      Preview not available
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      This file type cannot be previewed in the browser.
                      <br />
                      Please download the file to view its contents.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Download />}
                      onClick={() => handleFileDownload(selectedAttachment)}
                    >
                      Download File
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<Download />}
            onClick={() => selectedAttachment && handleFileDownload(selectedAttachment)}
          >
            Download
          </Button>
          <Button 
            onClick={() => {
              setShowAttachmentModal(false);
              setSelectedAttachment(null);
            }}
            variant="outlined"
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegularizationDashboard;
