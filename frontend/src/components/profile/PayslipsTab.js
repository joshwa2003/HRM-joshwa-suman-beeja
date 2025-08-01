import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  Receipt,
  Download,
  Visibility,
  AttachMoney,
  TrendingUp,
  AccountBalance
} from '@mui/icons-material';
import api from '../../utils/api';

const PayslipsTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      // Use mock data for now since the endpoint might not exist
      const mockPayslips = [
        {
          id: '1',
          payPeriod: '2024-12-01',
          grossSalary: 50000,
          netSalary: 42000,
          totalDeductions: 8000,
          basicSalary: 30000,
          hra: 12000,
          specialAllowance: 5000,
          otherAllowances: 3000,
          pfDeduction: 3600,
          esiDeduction: 750,
          incomeTax: 3650,
          otherDeductions: 0,
          status: 'Processed',
          generatedDate: '2024-12-31'
        }
      ];
      setPayslips(mockPayslips);
    } catch (error) {
      console.error('Error fetching payslips:', error);
      onNotification('Failed to load payslip information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (payslipId) => {
    try {
      const response = await api.get(`/payroll/payslips/${payslipId}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payslipId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      onNotification('Payslip downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading payslip:', error);
      onNotification('Failed to download payslip', 'error');
    }
  };

  const handlePreview = (payslip) => {
    setSelectedPayslip(payslip);
    setPreviewDialog(true);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="body1">Loading payslip information...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Payslips & Salary Details
        </Typography>
        <Chip
          icon={<Receipt />}
          label={`${payslips.length} Payslips Available`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Current Salary Summary */}
        {payslips.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Latest Salary Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(payslips[0]?.grossSalary)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gross Salary
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {formatCurrency(payslips[0]?.netSalary)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Net Salary
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AccountBalance sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {formatCurrency(payslips[0]?.totalDeductions)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Deductions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Receipt sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold" color="info.main">
                      {formatCurrency(payslips[0]?.basicSalary)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Basic Salary
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Payslips List */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Payslip History
              </Typography>
              {payslips.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month/Year</TableCell>
                        <TableCell>Gross Salary</TableCell>
                        <TableCell>Deductions</TableCell>
                        <TableCell>Net Salary</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Generated On</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payslips.map((payslip, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {formatDate(payslip.payPeriod)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {formatCurrency(payslip.grossSalary)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="warning.main">
                              {formatCurrency(payslip.totalDeductions)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              {formatCurrency(payslip.netSalary)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payslip.status}
                              size="small"
                              color={getStatusColor(payslip.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(payslip.generatedDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handlePreview(payslip)}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Download />}
                                onClick={() => handleDownload(payslip.id)}
                              >
                                Download
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No payslips available yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Salary Information */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ backgroundColor: theme.palette.info.main + '08' }}>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Salary Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Payslips are generated on the last working day of each month</li>
                      <li>Salary is credited to your bank account by the 1st of next month</li>
                      <li>All statutory deductions are as per government regulations</li>
                    </ul>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Download payslips for income tax filing and loan applications</li>
                      <li>Contact HR for any discrepancies in salary calculation</li>
                      <li>Form 16 will be available after the financial year ends</li>
                    </ul>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payslip Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Payslip Details - {selectedPayslip && formatDate(selectedPayslip.payPeriod)}
        </DialogTitle>
        <DialogContent>
          {selectedPayslip && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom color="success.main">
                  Earnings
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Basic Salary</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.basicSalary)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HRA</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.hra)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Special Allowance</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.specialAllowance)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Other Allowances</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.otherAllowances)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: theme.palette.success.main + '20' }}>
                      <TableCell><strong>Gross Salary</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedPayslip.grossSalary)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom color="error.main">
                  Deductions
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>PF Contribution</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.pfDeduction)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ESI Contribution</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.esiDeduction)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Income Tax</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.incomeTax)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Other Deductions</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.otherDeductions)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: theme.palette.error.main + '20' }}>
                      <TableCell><strong>Total Deductions</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedPayslip.totalDeductions)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ backgroundColor: theme.palette.primary.main + '20', p: 2, borderRadius: 1, mt: 2 }}>
                  <Typography variant="h5" textAlign="center" color="primary.main" fontWeight="bold">
                    Net Salary: {formatCurrency(selectedPayslip.netSalary)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          {selectedPayslip && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                handleDownload(selectedPayslip.id);
                setPreviewDialog(false);
              }}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayslipsTab;
