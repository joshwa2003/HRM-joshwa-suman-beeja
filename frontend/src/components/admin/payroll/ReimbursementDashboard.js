import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import ReimbursementDetailModal from './ReimbursementDetailModal';

const ReimbursementDashboard = () => {
  const navigate = useNavigate();
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 0,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0
  });
  const [config, setConfig] = useState({
    categories: [],
    priorities: []
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchReimbursements();
    fetchConfig();
    fetchPendingApprovals();
  }, [filters]);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: filters.page + 1
      });
      
      const response = await fetch(`/api/reimbursements?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReimbursements(data.data.docs || []);
        setPagination({
          total: data.data.totalDocs || 0,
          totalPages: data.data.totalPages || 0
        });
      } else {
        throw new Error('Failed to fetch reimbursements');
      }
    } catch (error) {
      console.error('Error fetching reimbursements:', error);
      setError('Failed to load reimbursements');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/reimbursements/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch('/api/reimbursements/pending-approvals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const handleApprove = async (reimbursementId, comments = '') => {
    try {
      const response = await fetch(`/api/reimbursements/${reimbursementId}/approve-with-comments`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ comments })
      });

      if (response.ok) {
        fetchReimbursements();
        fetchPendingApprovals();
        setShowDetailModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve reimbursement');
      }
    } catch (error) {
      console.error('Error approving reimbursement:', error);
      setError(error.message);
    }
  };

  const handleReject = async (reimbursementId, reason) => {
    try {
      const response = await fetch(`/api/reimbursements/${reimbursementId}/reject-with-comments`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        fetchReimbursements();
        fetchPendingApprovals();
        setShowDetailModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject reimbursement');
      }
    } catch (error) {
      console.error('Error rejecting reimbursement:', error);
      setError(error.message);
    }
  };

  const handleMarkAsPaid = async (reimbursementId) => {
    const transactionId = prompt('Enter transaction ID (optional):');
    
    try {
      const response = await fetch(`/api/reimbursements/${reimbursementId}/mark-paid`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          method: 'Bank Transfer',
          transactionId 
        })
      });

      if (response.ok) {
        fetchReimbursements();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      setError(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'Submitted': return 'info';
      case 'Team Lead Review': return 'warning';
      case 'Team Manager Review': return 'warning';
      case 'HR Review': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Paid': return 'success';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'default';
      case 'Normal': return 'info';
      case 'High': return 'warning';
      case 'Urgent': return 'error';
      default: return 'info';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleViewDetails = async (reimbursementId) => {
    try {
      const response = await fetch(`/api/reimbursements/${reimbursementId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedReimbursement(data.data);
        setShowDetailModal(true);
      } else {
        throw new Error('Failed to fetch reimbursement details');
      }
    } catch (error) {
      console.error('Error fetching reimbursement details:', error);
      setError(error.message);
    }
  };

  const handleChangePage = (event, newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setFilters(prev => ({ 
      ...prev, 
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  if (loading && reimbursements.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon color="primary" />
              Reimbursement Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage employee reimbursement requests and approvals
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/payroll/reimbursements/new')}
            size="large"
          >
            New Request
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon />
              Pending Your Approval ({pendingApprovals.length})
            </Typography>
          </CardContent>
          <CardContent>
            <Grid container spacing={3}>
              {pendingApprovals.slice(0, 3).map((reimbursement) => (
                <Grid item xs={12} md={4} key={reimbursement._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="subtitle2">
                          {reimbursement.employee?.firstName} {reimbursement.employee?.lastName}
                        </Typography>
                        <Chip 
                          label={reimbursement.priority} 
                          color={getPriorityColor(reimbursement.priority)}
                          size="small"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {reimbursement.category} • {formatCurrency(reimbursement.amount)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {reimbursement.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewDetails(reimbursement._id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Approve">
                          <IconButton 
                            size="small"
                            color="success"
                            onClick={() => handleViewDetails(reimbursement._id)}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => handleViewDetails(reimbursement._id)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {pendingApprovals.length > 3 && (
              <Box textAlign="center" mt={3}>
                <Button 
                  variant="outlined"
                  color="warning"
                  onClick={() => setFilters(prev => ({ ...prev, status: 'Under Review' }))}
                >
                  View All Pending ({pendingApprovals.length})
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="end">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 0 }))}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Submitted">Submitted</MenuItem>
                  <MenuItem value="Team Lead Review">Team Lead Review</MenuItem>
                  <MenuItem value="Team Manager Review">Team Manager Review</MenuItem>
                  <MenuItem value="HR Review">HR Review</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 0 }))}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {config.categories.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 0 }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 0 }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setFilters({ status: '', category: '', startDate: '', endDate: '', page: 0, limit: 10 })}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reimbursements List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {reimbursements.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reimbursements.map((reimbursement) => (
                      <TableRow key={reimbursement._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {reimbursement.employee?.firstName} {reimbursement.employee?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {reimbursement.employee?.employeeId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">{reimbursement.category}</Typography>
                            {reimbursement.subcategory && (
                              <Typography variant="body2" color="text.secondary">
                                {reimbursement.subcategory}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight="bold">
                            {formatCurrency(reimbursement.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(reimbursement.expenseDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reimbursement.status}
                            color={getStatusColor(reimbursement.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reimbursement.priority}
                            color={getPriorityColor(reimbursement.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(reimbursement._id)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {(reimbursement.status === 'Team Lead Review' || 
                              reimbursement.status === 'Team Manager Review' || 
                              reimbursement.status === 'HR Review') && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleViewDetails(reimbursement._id)}
                                  >
                                    <CheckIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleViewDetails(reimbursement._id)}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            
                            {reimbursement.status === 'Approved' && (
                              <Tooltip title="Mark as Paid">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleMarkAsPaid(reimbursement._id)}
                                >
                                  <CreditCardIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={pagination.total}
                page={filters.page}
                onPageChange={handleChangePage}
                rowsPerPage={filters.limit}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          ) : (
            <Box textAlign="center" py={8}>
              <ReceiptIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Reimbursements Found
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                No reimbursement requests match your current filters.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/payroll/reimbursements/new')}
              >
                Create New Request
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <ReimbursementDetailModal
        reimbursement={selectedReimbursement}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReimbursement(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Container>
  );
};

export default ReimbursementDashboard;
