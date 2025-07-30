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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as CalculatorIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const SalaryStructureList = () => {
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    isActive: 'true',
    role: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, structure: null });

  useEffect(() => {
    fetchSalaryStructures();
  }, [filters, pagination.page]);

  const fetchSalaryStructures = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page + 1,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/salary-structures?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStructures(data.data.docs || []);
        setPagination(prev => ({
          ...prev,
          total: data.data.totalDocs || 0,
          totalPages: data.data.totalPages || 0
        }));
      } else {
        throw new Error('Failed to fetch salary structures');
      }
    } catch (error) {
      console.error('Error fetching salary structures:', error);
      setError('Failed to load salary structures');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleSetDefault = async (structureId) => {
    try {
      const response = await fetch(`/api/salary-structures/${structureId}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchSalaryStructures();
      } else {
        throw new Error('Failed to set default structure');
      }
    } catch (error) {
      console.error('Error setting default structure:', error);
      setError('Failed to set default structure');
    }
  };

  const handleClone = async (structureId, currentName) => {
    const newName = prompt(`Enter name for cloned structure:`, `${currentName} - Copy`);
    if (!newName) return;

    try {
      const response = await fetch(`/api/salary-structures/${structureId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newName })
      });

      if (response.ok) {
        fetchSalaryStructures();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clone structure');
      }
    } catch (error) {
      console.error('Error cloning structure:', error);
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/salary-structures/${deleteDialog.structure._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchSalaryStructures();
        setDeleteDialog({ open: false, structure: null });
      } else {
        throw new Error('Failed to delete structure');
      }
    } catch (error) {
      console.error('Error deleting structure:', error);
      setError('Failed to delete structure');
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

  const calculateGrossSalary = (structure) => {
    const basic = structure.basicSalary || 0;
    const allowances = Object.values(structure.allowances || {}).reduce((sum, allowance) => {
      if (allowance.type === 'percentage') {
        return sum + (basic * allowance.value / 100);
      }
      return sum + (allowance.value || 0);
    }, 0);
    return basic + allowances;
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  if (loading && structures.length === 0) {
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
              <CalculatorIcon color="primary" />
              Salary Structures
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage salary templates and structures
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/payroll/structure/new')}
            size="large"
          >
            Create Structure
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

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="end">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.isActive}
                  label="Status"
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  label="Role"
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Team Leader">Team Leader</MenuItem>
                  <MenuItem value="Team Manager">Team Manager</MenuItem>
                  <MenuItem value="HR Executive">HR Executive</MenuItem>
                  <MenuItem value="HR Manager">HR Manager</MenuItem>
                  <MenuItem value="HR BP">HR BP</MenuItem>
                  <MenuItem value="Vice President">Vice President</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search by name or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setFilters({ isActive: 'true', role: '', search: '' });
                  setPagination(prev => ({ ...prev, page: 0 }));
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Salary Structures Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {structures.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Structure Name</TableCell>
                      <TableCell align="right">Basic Salary</TableCell>
                      <TableCell align="right">Gross Salary</TableCell>
                      <TableCell>Applicable For</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {structures.map((structure) => (
                      <TableRow key={structure._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {structure.name}
                              {structure.isDefault && (
                                <Chip label="Default" color="primary" size="small" />
                              )}
                            </Typography>
                            {structure.description && (
                              <Typography variant="body2" color="text.secondary">
                                {structure.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight="bold">
                            {formatCurrency(structure.basicSalary)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                            {formatCurrency(calculateGrossSalary(structure))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {structure.applicableFor?.roles?.length > 0 && (
                              <Box mb={0.5}>
                                <Typography variant="caption" color="text.secondary">Roles: </Typography>
                                <Typography variant="body2" component="span">
                                  {structure.applicableFor.roles.join(', ')}
                                </Typography>
                              </Box>
                            )}
                            {structure.applicableFor?.departments?.length > 0 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">Departments: </Typography>
                                <Typography variant="body2" component="span">
                                  {structure.applicableFor.departments.map(dept => dept.name).join(', ')}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={structure.isActive ? 'Active' : 'Inactive'}
                            color={structure.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/payroll/structure/${structure._id}`)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/payroll/structure/${structure._id}/edit`)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Clone">
                              <IconButton
                                size="small"
                                onClick={() => handleClone(structure._id, structure.name)}
                              >
                                <FileCopyIcon />
                              </IconButton>
                            </Tooltip>
                            {!structure.isDefault && (
                              <Tooltip title="Set as Default">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSetDefault(structure._id)}
                                >
                                  <StarIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteDialog({ open: true, structure })}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
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
                page={pagination.page}
                onPageChange={handleChangePage}
                rowsPerPage={pagination.limit}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          ) : (
            <Box textAlign="center" py={8}>
              <CalculatorIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Salary Structures Found
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Create your first salary structure to get started.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/payroll/structure/new')}
              >
                Create Structure
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, structure: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.structure?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, structure: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SalaryStructureList;
