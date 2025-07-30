import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Stack,
  OutlinedInput,
  FormHelperText,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Remove as RemoveIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const SalaryStructureForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basicSalary: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    applicableFor: {
      roles: [],
      departments: [],
      designations: [],
      experienceRange: { min: 0, max: 50 }
    },
    allowances: {
      hra: { type: 'percentage', value: 40, maxLimit: null },
      da: { type: 'percentage', value: 0, maxLimit: null },
      ta: { type: 'fixed', value: 1600, maxLimit: null },
      medical: { type: 'fixed', value: 1250, maxLimit: null },
      special: { type: 'percentage', value: 10, maxLimit: null },
      other: { type: 'fixed', value: 0, maxLimit: null }
    },
    customAllowances: [],
    deductions: {
      epf: { type: 'percentage', value: 12, maxLimit: 1800 },
      esi: { type: 'percentage', value: 0.75, applicableUpTo: 21000, maxLimit: null },
      professionalTax: { type: 'fixed', value: 200, maxLimit: null },
      incomeTax: { type: 'percentage', value: 0, maxLimit: null }
    },
    customDeductions: [],
    bonusRules: {
      annual: { type: 'percentage', value: 8.33, maxLimit: 7000 },
      performance: { type: 'percentage', value: 0, maxLimit: null }
    },
    overtimeRules: {
      enabled: true,
      rate: 2,
      calculation: 'hourly'
    },
    isActive: true,
    isDefault: false,
    status: 'Draft'
  });

  const roles = [
    'Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive',
    'Team Manager', 'Team Leader', 'Employee'
  ];

  useEffect(() => {
    fetchDepartments();
    if (isEdit) {
      fetchSalaryStructure();
    }
  }, [id, isEdit]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSalaryStructure = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/salary-structures/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...data.data,
          effectiveFrom: data.data.effectiveFrom ? 
            new Date(data.data.effectiveFrom).toISOString().split('T')[0] : '',
          effectiveTo: data.data.effectiveTo ? 
            new Date(data.data.effectiveTo).toISOString().split('T')[0] : ''
        });
      } else {
        throw new Error('Failed to fetch salary structure');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAllowanceChange = (key, field, value) => {
    setFormData(prev => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        [key]: {
          ...prev.allowances[key],
          [field]: value
        }
      }
    }));
  };

  const handleDeductionChange = (key, field, value) => {
    setFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [key]: {
          ...prev.deductions[key],
          [field]: value
        }
      }
    }));
  };

  const addCustomAllowance = () => {
    const newAllowance = {
      name: '',
      type: 'fixed',
      value: 0,
      maxLimit: null,
      description: '',
      isActive: true
    };
    setFormData(prev => ({
      ...prev,
      customAllowances: [...prev.customAllowances, newAllowance]
    }));
  };

  const removeCustomAllowance = (index) => {
    setFormData(prev => ({
      ...prev,
      customAllowances: prev.customAllowances.filter((_, i) => i !== index)
    }));
  };

  const updateCustomAllowance = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      customAllowances: prev.customAllowances.map((allowance, i) => 
        i === index ? { ...allowance, [field]: value } : allowance
      )
    }));
  };

  const addCustomDeduction = () => {
    const newDeduction = {
      name: '',
      type: 'fixed',
      value: 0,
      maxLimit: null,
      description: '',
      isActive: true
    };
    setFormData(prev => ({
      ...prev,
      customDeductions: [...prev.customDeductions, newDeduction]
    }));
  };

  const removeCustomDeduction = (index) => {
    setFormData(prev => ({
      ...prev,
      customDeductions: prev.customDeductions.filter((_, i) => i !== index)
    }));
  };

  const updateCustomDeduction = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      customDeductions: prev.customDeductions.map((deduction, i) => 
        i === index ? { ...deduction, [field]: value } : deduction
      )
    }));
  };

  const handlePreview = async () => {
    if (!formData.basicSalary) {
      setError('Basic salary is required for preview');
      return;
    }

    try {
      const response = await fetch('/api/salary-structures/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          structureData: formData,
          basicSalary: parseFloat(formData.basicSalary)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.data);
        setShowPreview(true);
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.basicSalary) {
      setError('Name and basic salary are required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const url = isEdit ? `/api/salary-structures/${id}` : '/api/salary-structures';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/admin/payroll/structure');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save salary structure');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <AttachMoneyIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
              {isEdit ? 'Edit Salary Structure' : 'Create Salary Structure'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              {isEdit ? 'Update salary structure details' : 'Create a new salary structure template'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/payroll/structure')}
              sx={{ borderRadius: 3, px: 3 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={handlePreview}
              disabled={!formData.basicSalary}
              color="info"
              sx={{ borderRadius: 3, px: 3 }}
            >
              Preview
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} lg={8}>
            {/* Basic Information */}
            <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 3, '&:before': { display: 'none' }, boxShadow: 3 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '12px 12px 0 0' }}
              >
                <Box display="flex" alignItems="center">
                  <InfoIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Basic Information</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Structure Name"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Basic Salary"
                      type="number"
                      required
                      value={formData.basicSalary}
                      onChange={(e) => handleInputChange('basicSalary', parseFloat(e.target.value) || '')}
                      variant="outlined"
                      InputProps={{ inputProps: { min: 0 } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Effective From"
                      type="date"
                      value={formData.effectiveFrom}
                      onChange={(e) => handleInputChange('effectiveFrom', e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Effective To"
                      type="date"
                      value={formData.effectiveTo}
                      onChange={(e) => handleInputChange('effectiveTo', e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Applicable For */}
            <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 3, '&:before': { display: 'none' }, boxShadow: 3 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: '12px 12px 0 0' }}
              >
                <Box display="flex" alignItems="center">
                  <PeopleIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Applicable For</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Roles</InputLabel>
                      <Select
                        multiple
                        value={formData.applicableFor.roles}
                        onChange={(e) => handleNestedInputChange('applicableFor', 'roles', e.target.value)}
                        input={<OutlinedInput label="Roles" sx={{ borderRadius: 2 }} />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" color="primary" variant="outlined" />
                            ))}
                          </Box>
                        )}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Select applicable roles</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Departments</InputLabel>
                      <Select
                        multiple
                        value={formData.applicableFor.departments}
                        onChange={(e) => handleNestedInputChange('applicableFor', 'departments', e.target.value)}
                        input={<OutlinedInput label="Departments" sx={{ borderRadius: 2 }} />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const dept = departments.find(d => d._id === value);
                              return <Chip key={value} label={dept?.name || value} size="small" color="secondary" variant="outlined" />;
                            })}
                          </Box>
                        )}
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Select applicable departments</FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Standard Allowances */}
            <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 3, '&:before': { display: 'none' }, boxShadow: 3 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'success.main', color: 'success.contrastText', borderRadius: '12px 12px 0 0' }}
              >
                <Box display="flex" alignItems="center">
                  <AddIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Standard Allowances</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {Object.entries(formData.allowances).map(([key, allowance]) => (
                    <Card key={key} variant="outlined" sx={{ borderRadius: 2, border: '2px solid', borderColor: 'success.light', boxShadow: 2 }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'success.main' }}>
                              {key.replace(/([A-Z])/g, ' $1')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type</InputLabel>
                              <Select
                                value={allowance.type}
                                onChange={(e) => handleAllowanceChange(key, 'type', e.target.value)}
                                label="Type"
                                sx={{ borderRadius: 2 }}
                              >
                                <MenuItem value="percentage">Percentage</MenuItem>
                                <MenuItem value="fixed">Fixed Amount</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label={allowance.type === 'percentage' ? 'Percentage' : 'Amount'}
                              value={allowance.value}
                              onChange={(e) => handleAllowanceChange(key, 'value', parseFloat(e.target.value) || 0)}
                              InputProps={{ inputProps: { min: 0 } }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Max Limit (Optional)"
                              value={allowance.maxLimit || ''}
                              onChange={(e) => handleAllowanceChange(key, 'maxLimit', parseFloat(e.target.value) || null)}
                              InputProps={{ inputProps: { min: 0 } }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Custom Allowances */}
            <Accordion sx={{ mb: 2, borderRadius: 3, '&:before': { display: 'none' }, boxShadow: 3 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'info.main', color: 'info.contrastText', borderRadius: '12px 12px 0 0' }}
              >
                <Box display="flex" alignItems="center">
                  <AddIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Custom Allowances</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {formData.customAllowances.length === 0 ? (
                    <Box textAlign="center" py={3}>
                      <Typography variant="body2" color="text.secondary">
                        No custom allowances added. Click "Add Custom Allowance" to create one.
                      </Typography>
                    </Box>
                  ) : (
                    formData.customAllowances.map((allowance, index) => (
                      <Card key={index} variant="outlined" sx={{ borderRadius: 2, border: '2px solid', borderColor: 'info.light', boxShadow: 2 }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Name"
                                value={allowance.name}
                                onChange={(e) => updateCustomAllowance(index, 'name', e.target.value)}
                                placeholder="e.g., Performance Bonus"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select
                                  value={allowance.type}
                                  onChange={(e) => updateCustomAllowance(index, 'type', e.target.value)}
                                  label="Type"
                                  sx={{ borderRadius: 2 }}
                                >
                                  <MenuItem value="percentage">Percentage</MenuItem>
                                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Value"
                                value={allowance.value}
                                onChange={(e) => updateCustomAllowance(index, 'value', parseFloat(e.target.value) || 0)}
                                InputProps={{ inputProps: { min: 0 } }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Max Limit"
                                value={allowance.maxLimit || ''}
                                onChange={(e) => updateCustomAllowance(index, 'maxLimit', parseFloat(e.target.value) || null)}
                                InputProps={{ inputProps: { min: 0 } }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={allowance.isActive}
                                    onChange={(e) => updateCustomAllowance(index, 'isActive', e.target.checked)}
                                    color="success"
                                  />
                                }
                                label="Active"
                              />
                            </Grid>
                            <Grid item xs={12} md={1}>
                              <IconButton
                                color="error"
                                onClick={() => removeCustomAllowance(index)}
                                size="small"
                                sx={{ mt: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Description"
                                value={allowance.description}
                                onChange={(e) => updateCustomAllowance(index, 'description', e.target.value)}
                                placeholder="Optional description"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addCustomAllowance}
                      color="info"
                      sx={{ borderRadius: 2 }}
                    >
                      Add Custom Allowance
                    </Button>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Standard Deductions */}
            <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 3, '&:before': { display: 'none' }, boxShadow: 3 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'error.main', color: 'error.contrastText', borderRadius: '12px 12px 0 0' }}
              >
                <Box display="flex" alignItems="center">
                  <RemoveIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Standard Deductions</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {Object.entries(formData.deductions).map(([key, deduction]) => (
                    <Card key={key} variant="outlined" sx={{ borderRadius: 2, border: '2px solid', borderColor: 'error.light', boxShadow: 2 }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <Typography variant="subtitle1" sx={{ textTransform: 'uppercase', fontWeight: 'bold', color: 'error.main' }}>
                              {key.replace(/([A-Z])/g, ' $1')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type</InputLabel>
                              <Select
                                value={deduction.type}
                                onChange={(e) => handleDeductionChange(key, 'type', e.target.value)}
                                label="Type"
                                sx={{ borderRadius: 2 }}
                              >
                                <MenuItem value="percentage">Percentage</MenuItem>
                                <MenuItem value="fixed">Fixed Amount</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label={deduction.type === 'percentage' ? 'Percentage' : 'Amount'}
                              value={deduction.value}
                              onChange={(e) => handleDeductionChange(key, 'value', parseFloat(e.target.value) || 0)}
                              InputProps={{ inputProps: { min: 0 } }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Max Limit (Optional)"
                              value={deduction.maxLimit || ''}
                              onChange={(e) => handleDeductionChange(key, 'maxLimit', parseFloat(e.target.value) || null)}
                              InputProps={{ inputProps: { min: 0 } }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Custom Deductions */}
            <Accordion sx={{ mb: 2, borderRadius: 3, '&:before': { display: 'none' }, boxShadow: 3 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', borderRadius: '12px 12px 0 0' }}
              >
                <Box display="flex" alignItems="center">
                  <RemoveIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Custom Deductions</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {formData.customDeductions.length === 0 ? (
                    <Box textAlign="center" py={3}>
                      <Typography variant="body2" color="text.secondary">
                        No custom deductions added. Click "Add Custom Deduction" to create one.
                      </Typography>
                    </Box>
                  ) : (
                    formData.customDeductions.map((deduction, index) => (
                      <Card key={index} variant="outlined" sx={{ borderRadius: 2, border: '2px solid', borderColor: 'warning.light', boxShadow: 2 }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Name"
                                value={deduction.name}
                                onChange={(e) => updateCustomDeduction(index, 'name', e.target.value)}
                                placeholder="e.g., Loan Deduction"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select
                                  value={deduction.type}
                                  onChange={(e) => updateCustomDeduction(index, 'type', e.target.value)}
                                  label="Type"
                                  sx={{ borderRadius: 2 }}
                                >
                                  <MenuItem value="percentage">Percentage</MenuItem>
                                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Value"
                                value={deduction.value}
                                onChange={(e) => updateCustomDeduction(index, 'value', parseFloat(e.target.value) || 0)}
                                InputProps={{ inputProps: { min: 0 } }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Max Limit"
                                value={deduction.maxLimit || ''}
                                onChange={(e) => updateCustomDeduction(index, 'maxLimit', parseFloat(e.target.value) || null)}
                                InputProps={{ inputProps: { min: 0 } }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={deduction.isActive}
                                    onChange={(e) => updateCustomDeduction(index, 'isActive', e.target.checked)}
                                    color="warning"
                                  />
                                }
                                label="Active"
                              />
                            </Grid>
                            <Grid item xs={12} md={1}>
                              <IconButton
                                color="error"
                                onClick={() => removeCustomDeduction(index)}
                                size="small"
                                sx={{ mt: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Description"
                                value={deduction.description}
                                onChange={(e) => updateCustomDeduction(index, 'description', e.target.value)}
                                placeholder="Optional description"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addCustomDeduction}
                      color="warning"
                      sx={{ borderRadius: 2 }}
                    >
                      Add Custom Deduction
                    </Button>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Settings */}
            <Accordion sx={{ mb: 2, borderRadius: 3, '&:before': { display: 'none' }, boxShadow: 3 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'grey.600', color: 'white', borderRadius: '12px 12px 0 0' }}
              >
                <Box display="flex" alignItems="center">
                  <SettingsIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Settings</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          color="success"
                        />
                      }
                      label={
                        <Typography variant="body1" fontWeight="medium">
                          Active Structure
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isDefault}
                          onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body1" fontWeight="medium">
                          Default Structure
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Preview Sidebar */}
          <Grid item xs={12} lg={4}>
            {showPreview && previewData && (
              <Paper elevation={3} sx={{ position: 'sticky', top: 20, borderRadius: 3 }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, borderRadius: '12px 12px 0 0' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                    <VisibilityIcon sx={{ mr: 2 }} />
                    Salary Preview
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Basic Salary
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {formatCurrency(previewData.basic)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" color="success.main" gutterBottom fontWeight="bold">
                      Allowances
                    </Typography>
                    {Object.entries(previewData.allowances).map(([key, value]) => (
                      <Box key={key} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {key}:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(value)}
                        </Typography>
                      </Box>
                    ))}
                    {Object.entries(previewData.customAllowances || {}).map(([key, value]) => (
                      <Box key={key} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">{key}:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" color="error.main" gutterBottom fontWeight="bold">
                      Deductions
                    </Typography>
                    {Object.entries(previewData.deductions).map(([key, value]) => (
                      <Box key={key} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                          {key}:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(value)}
                        </Typography>
                      </Box>
                    ))}
                    {Object.entries(previewData.customDeductions || {}).map(([key, value]) => (
                      <Box key={key} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">{key}:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" color="info.main" fontWeight="bold">
                        Gross Salary:
                      </Typography>
                      <Typography variant="subtitle1" color="info.main" fontWeight="bold">
                        {formatCurrency(previewData.gross)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" color="error.main" fontWeight="bold">
                        Total Deductions:
                      </Typography>
                      <Typography variant="subtitle1" color="error.main" fontWeight="bold">
                        {formatCurrency(previewData.totalDeductions)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box textAlign="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" color="success.main" gutterBottom fontWeight="bold">
                      Net Salary
                    </Typography>
                    <Typography variant="h3" color="success.main" fontWeight="bold">
                      {formatCurrency(previewData.net)}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowPreview(false)}
                    startIcon={<CloseIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Close Preview
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Action Buttons */}
            <Paper elevation={3} sx={{ borderRadius: 3, mt: showPreview ? 2 : 0 }}>
              <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    {saving ? 'Saving...' : (isEdit ? 'Update Structure' : 'Create Structure')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/admin/payroll/structure')}
                    startIcon={<CancelIcon />}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" fontWeight="bold">
            Salary Structure Preview
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {/* Preview content is handled in the sidebar */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SalaryStructureForm;
