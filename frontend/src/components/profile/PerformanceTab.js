import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  Star,
  Assignment,
  EmojiEvents,
  Timeline,
  Assessment
} from '@mui/icons-material';
import api from '../../utils/api';

const PerformanceTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [performanceData, setPerformanceData] = useState({});
  const [goals, setGoals] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch performance overview
      const performanceResponse = await api.get('/performance/overview');
      setPerformanceData(performanceResponse.data.performance || {});

      // Fetch goals
      const goalsResponse = await api.get('/performance/goals');
      setGoals(goalsResponse.data.goals || []);

      // Fetch appraisals
      const appraisalsResponse = await api.get('/performance/appraisals');
      setAppraisals(appraisalsResponse.data.appraisals || []);

      // Fetch achievements
      const achievementsResponse = await api.get('/performance/achievements');
      setAchievements(achievementsResponse.data.achievements || []);

    } catch (error) {
      console.error('Error fetching performance data:', error);
      onNotification('Failed to load performance information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'info';
    if (rating >= 2.5) return 'warning';
    return 'error';
  };

  const getGoalStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'info';
      case 'overdue':
        return 'error';
      case 'not started':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} sx={{ color: theme.palette.warning.main, fontSize: 20 }} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} sx={{ color: theme.palette.warning.main, fontSize: 20, opacity: 0.5 }} />);
      } else {
        stars.push(<Star key={i} sx={{ color: theme.palette.grey[300], fontSize: 20 }} />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="body1">Loading performance information...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Performance & Goals
        </Typography>
        <Chip
          icon={<Assessment />}
          label={`Overall Rating: ${performanceData.overallRating || 'N/A'}/5`}
          color={getPerformanceColor(performanceData.overallRating)}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Performance Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {performanceData.overallRating || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Rating
                  </Typography>
                  <Box display="flex" justifyContent="center" mt={1}>
                    {renderStarRating(performanceData.overallRating || 0)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {goals.filter(g => g.status === 'Completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Goals Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {achievements.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Achievements
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Timeline sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {appraisals.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Appraisals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Current Goals */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Current Goals & KPIs
              </Typography>
              {goals.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Goal Title</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Target Date</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {goals.map((goal, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {goal.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                              {goal.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(goal.targetDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ width: 100 }}>
                              <LinearProgress
                                variant="determinate"
                                value={goal.progress || 0}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {goal.progress || 0}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={goal.status}
                              size="small"
                              color={getGoalStatusColor(goal.status)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No goals assigned yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Appraisal History */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Appraisal History
              </Typography>
              {appraisals.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Review Period</TableCell>
                        <TableCell>Overall Rating</TableCell>
                        <TableCell>Reviewer</TableCell>
                        <TableCell>Key Strengths</TableCell>
                        <TableCell>Areas for Improvement</TableCell>
                        <TableCell>Review Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appraisals.map((appraisal, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {appraisal.reviewPeriod}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontWeight="bold">
                                {appraisal.overallRating}/5
                              </Typography>
                              <Box display="flex">
                                {renderStarRating(appraisal.overallRating)}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {appraisal.reviewerName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap>
                              {appraisal.strengths}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap>
                              {appraisal.improvements}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(appraisal.reviewDate)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No appraisal history available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements & Recognition */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Achievements & Recognition
              </Typography>
              {achievements.length > 0 ? (
                <Grid container spacing={2}>
                  {achievements.map((achievement, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <EmojiEvents sx={{ color: theme.palette.warning.main }} />
                            <Typography variant="h6" color="warning.main">
                              {achievement.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {achievement.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Awarded on: {formatDate(achievement.awardedDate)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No achievements recorded yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Guidelines */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ backgroundColor: theme.palette.info.main + '08' }}>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Performance Guidelines
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Performance reviews are conducted annually</li>
                      <li>Goals are set at the beginning of each quarter</li>
                      <li>Regular feedback sessions with your manager</li>
                      <li>Self-assessment forms are due before review meetings</li>
                    </ul>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Rating scale: 1 (Needs Improvement) to 5 (Outstanding)</li>
                      <li>Career development plans are discussed during reviews</li>
                      <li>Training recommendations based on performance gaps</li>
                      <li>Recognition programs for exceptional performance</li>
                    </ul>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceTab;
