import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatShortcutProvider } from './context/ChatShortcutContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import MyProfile from './components/MyProfile';
import EditProfile from './components/EditProfile';
import Dashboard from './components/Dashboard';
import DepartmentManagement from './components/admin/DepartmentManagement';
import LeaveApproval from './components/admin/LeaveApproval';
import LeavePolicy from './components/admin/LeavePolicy';
import LeaveRequest from './components/employee/LeaveRequest';
import LeaveHistory from './components/employee/LeaveHistory';
import UserManagement from './components/admin/UserManagement';
import AddUser from './components/admin/AddUser';
import UserRoles from './components/admin/UserRoles';
import TeamManagement from './components/admin/TeamManagement';
import OrganizationChart from './components/admin/OrganizationChart';
import HolidayCalendar from './components/admin/HolidayCalendar';
import MyTeamDashboard from './components/MyTeamDashboard';
import MyManagedTeamsDashboard from './components/MyManagedTeamsDashboard';
import MyAttendance from './components/MyAttendance';
import ChangePassword from './components/ChangePassword';
import LeaveAttendanceManagement from './components/admin/LeaveAttendanceManagement';
import AttendanceReports from './components/admin/AttendanceReports';
import WorkHoursSettings from './components/admin/WorkHoursSettings';
import LiveEmployeeStatus from './components/admin/LiveEmployeeStatus';
import Permissions from './components/admin/Permissions';

// Chat Components
import ChatInterface from './components/chat/ChatInterface';

// Helpdesk Components
import TicketDashboard from './components/helpdesk/TicketDashboard';
import CreateTicket from './components/helpdesk/CreateTicket';
import MyTickets from './components/helpdesk/MyTickets';
import TicketDetails from './components/helpdesk/TicketDetails';
import FAQManagement from './components/helpdesk/FAQManagement';

// Recruitment Components
import RecruitmentDashboard from './components/recruitment/RecruitmentDashboard';
import JobPostings from './components/recruitment/JobPostings';
import Applications from './components/recruitment/Applications';
import Interviews from './components/admin/Interviews';
import OfferLetters from './components/admin/OfferLetters';
import InterviewSchedule from './components/recruitment/InterviewSchedule';
import PublicJobApplication from './components/public/PublicJobApplication';
import OfferResponse from './components/public/OfferResponse';

// Payroll Components
import PayrollDashboard from './components/admin/payroll/PayrollDashboard';
import SalaryStructureList from './components/admin/payroll/SalaryStructureList';
import SalaryStructureForm from './components/admin/payroll/SalaryStructureForm';
import SalaryStructureDetails from './components/admin/payroll/SalaryStructureDetails';
import EmployeePayslip from './components/employee/payroll/EmployeePayslip';
import EmployeeReimbursements from './components/employee/payroll/EmployeeReimbursements';
import ProcessPayroll from './components/admin/payroll/ProcessPayroll';
import ReimbursementDashboard from './components/admin/payroll/ReimbursementDashboard';
import ReimbursementForm from './components/admin/payroll/ReimbursementForm';

// Regularization Components
import RegularizationRequest from './components/employee/RegularizationRequest';
import RegularizationDashboard from './components/admin/RegularizationDashboard';
import MyRegularizationRequests from './components/employee/MyRegularizationRequests';

// Employee Permission Components
import EmployeePermissions from './components/employee/EmployeePermissions';

// Notification Components
import NotificationsPage from './components/NotificationsPage';

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // All users go to dashboard
  const getDefaultRoute = (user) => {
    return '/dashboard';
  };
  
  return <Navigate to={getDefaultRoute(user)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <ChatShortcutProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyProfile />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EditProfile />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/departments" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']}>
                    <Layout>
                      <DepartmentManagement />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* User Management Routes */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']}>
                    <Layout>
                      <UserManagement />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users/add" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR Manager']}>
                    <Layout>
                      <AddUser />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users/roles" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <UserRoles />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Leave Management Routes */}
              <Route 
                path="/admin/leave/requests" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <LeaveApproval />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Leave Policy Route */}
              <Route 
                path="/admin/leave/policies" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']}>
                    <Layout>
                      <LeavePolicy />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Holiday Calendar Route */}
              <Route 
                path="/admin/leave/holidays" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <HolidayCalendar />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Employee Leave Routes */}
              <Route 
                path="/employee/leave/apply" 
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <LeaveRequest />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/employee/leave/history" 
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <LeaveHistory />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Team Management Routes */}
              <Route
                path="/admin/teams"
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <TeamManagement />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Organization Chart Route */}
              <Route
                path="/admin/org-chart"
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']}>
                    <Layout>
                      <OrganizationChart />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* My Team Dashboard for Team Leaders */}
              <Route
                path="/my-team"
                element={
                  <ProtectedRoute requiredRoles={['Team Leader']}>
                    <Layout>
                      <MyTeamDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* My Teams Dashboard for Team Managers */}
              <Route
                path="/my-teams"
                element={
                  <ProtectedRoute requiredRoles={['Team Manager']}>
                    <Layout>
                      <MyManagedTeamsDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Chat Route */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <ChatInterface />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Helpdesk Routes */}
              <Route
                path="/helpdesk"
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <TicketDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/helpdesk/create"
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <CreateTicket />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/helpdesk/tickets/:id"
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <TicketDetails />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/helpdesk/my-tickets"
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <MyTickets />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/helpdesk/all-tickets"
                element={
                  <ProtectedRoute requiredRoles={['HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <TicketDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/helpdesk/manage-faq"
                element={
                  <ProtectedRoute requiredRoles={['HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <FAQManagement />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/helpdesk/faq"
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-info">
                          <h4><i className="bi bi-question-circle me-2"></i>FAQ & Knowledge Base</h4>
                          <p>This section will include:</p>
                          <ul>
                            <li>Searchable FAQ database</li>
                            <li>Category-wise FAQ browsing</li>
                            <li>Popular and recent FAQs</li>
                            <li>FAQ feedback and ratings</li>
                            <li>Related FAQ suggestions</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">In Development</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/helpdesk/reports"
                element={
                  <ProtectedRoute requiredRoles={['HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-success">
                          <h4><i className="bi bi-graph-up me-2"></i>Helpdesk Reports & Analytics</h4>
                          <p>This section will include:</p>
                          <ul>
                            <li>Ticket volume and trends</li>
                            <li>Response and resolution time metrics</li>
                            <li>Category-wise ticket analysis</li>
                            <li>Agent performance reports</li>
                            <li>Customer satisfaction scores</li>
                            <li>SLA compliance reports</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">In Development</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Leave & Attendance Routes */}
              <Route 
                path="/admin/leave/*" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-success">
                          <h4><i className="bi bi-calendar3 me-2"></i>Leave & Attendance Management</h4>
                          <p>This module will include:</p>
                          <ul>
                            <li>Leave request approval workflow</li>
                            <li>Attendance tracking and reports</li>
                            <li>Holiday calendar management</li>
                            <li>Leave policy configuration</li>
                            <li>Attendance regularization</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">In Development</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Payroll Routes */}
              <Route 
                path="/admin/payroll/structure" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']}>
                    <Layout>
                      <SalaryStructureList />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payroll/structure/new" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager']}>
                    <Layout>
                      <SalaryStructureForm />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payroll/structure/:id" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']}>
                    <Layout>
                      <SalaryStructureDetails />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payroll/structure/:id/edit" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager']}>
                    <Layout>
                      <SalaryStructureForm />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payroll/process" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']}>
                    <Layout>
                      <ProcessPayroll />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payroll/reimbursements" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <ReimbursementDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payroll/reimbursements/new" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader', 'Employee']}>
                    <Layout>
                      <ReimbursementForm />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payroll/reimbursements/:id/edit" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader', 'Employee']}>
                    <Layout>
                      <ReimbursementForm />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payroll/payslips" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']}>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-info">
                          <h4><i className="bi bi-file-earmark-text me-2"></i>Payslip Management</h4>
                          <p>This section will include:</p>
                          <ul>
                            <li>Generate individual and bulk payslips</li>
                            <li>PDF download and email distribution</li>
                            <li>Payslip templates and customization</li>
                            <li>Employee self-service access</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">Coming Soon</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Performance Routes */}
              <Route 
                path="/admin/performance/*" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-warning">
                          <h4><i className="bi bi-graph-up-arrow me-2"></i>Performance Management</h4>
                          <p>This module will include:</p>
                          <ul>
                            <li>Goal setting and tracking</li>
                            <li>Performance review cycles</li>
                            <li>360-degree feedback</li>
                            <li>Appraisal management</li>
                            <li>Performance analytics</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">In Development</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Training Routes */}
              <Route 
                path="/admin/training/*" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-info">
                          <h4><i className="bi bi-book me-2"></i>Training Management</h4>
                          <p>This module will include:</p>
                          <ul>
                            <li>Training program creation</li>
                            <li>Employee enrollment</li>
                            <li>Training calendar and scheduling</li>
                            <li>Certification tracking</li>
                            <li>Training effectiveness reports</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">In Development</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* HR Manager Recruitment Routes */}
              <Route 
                path="/hr/recruitment" 
                element={
                  <ProtectedRoute requiredRoles={['HR Manager']}>
                    <Layout>
                      <RecruitmentDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/recruitment/jobs" 
                element={
                  <ProtectedRoute requiredRoles={['HR Manager']}>
                    <Layout>
                      <JobPostings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/recruitment/applications" 
                element={
                  <ProtectedRoute requiredRoles={['HR Manager']}>
                    <Layout>
                      <Applications />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/recruitment/interviews" 
                element={
                  <ProtectedRoute requiredRoles={['HR Manager']}>
                    <Layout>
                      <Interviews />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/recruitment/offers" 
                element={
                  <ProtectedRoute requiredRoles={['HR Manager']}>
                    <Layout>
                      <OfferLetters />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Work Hours Settings Routes */}
              <Route 
                path="/admin/leave/work-hours" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Executive']}>
                    <Layout>
                      <WorkHoursSettings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/leave/work-hours" 
                element={
                  <ProtectedRoute requiredRoles={['HR Manager']}>
                    <Layout>
                      <WorkHoursSettings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Reports Routes */}
              <Route 
                path="/admin/reports/attendance" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <AttendanceReports />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* My Attendance Route */}
              <Route 
                path="/employee/attendance" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyAttendance />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Interviewer Routes */}
              <Route 
                path="/interviewer/schedule" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <InterviewSchedule />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Change Password Route */}
              <Route 
                path="/change-password" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChangePassword />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Admin Recruitment Routes */}
              <Route 
                path="/admin/recruitment" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Executive']}>
                    <Layout>
                      <RecruitmentDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/recruitment/jobs" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Executive']}>
                    <Layout>
                      <JobPostings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Notifications Route */}
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NotificationsPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Employee Payroll Routes */}
              <Route 
                path="/employee/payroll/payslip" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EmployeePayslip />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employee/payroll/reimbursements" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EmployeeReimbursements />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/recruitment/applications" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Executive']}>
                    <Layout>
                      <Applications />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Employee Permission Routes */}
              <Route 
                path="/employee/permissions" 
                element={
                  <ProtectedRoute requiredRoles={['Employee']}>
                    <Layout>
                      <EmployeePermissions />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/recruitment/interviews" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <Interviews />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Regularization Routes */}
              <Route 
                path="/employee/regularization/request" 
                element={
                  <ProtectedRoute requiredRoles={['Employee', 'Team Leader', 'Team Manager', 'HR Executive', 'HR Manager', 'HR BP', 'Vice President', 'Admin']}>
                    <Layout>
                      <RegularizationRequest />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/recruitment/offer-letters" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Executive']}>
                    <Layout>
                      <OfferLetters />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Public Recruitment Routes */}
              <Route 
                path="/jobs/:jobId/apply" 
                element={<PublicJobApplication />} 
              />
              <Route 
                path="/apply/:jobId" 
                element={<PublicJobApplication />} 
              />
              <Route 
                path="/offer-response/:offerId" 
                element={<OfferResponse />} 
              />

              <Route 
                path="/admin/regularization" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <RegularizationDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/regularization/:id" 
                element={
                  <ProtectedRoute requiredRoles={['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive', 'Team Manager', 'Team Leader']}>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-info">
                          <h4><i className="bi bi-eye me-2"></i>Regularization Details</h4>
                          <p>This page will show detailed view of a regularization request including:</p>
                          <ul>
                            <li>Request details and supporting documents</li>
                            <li>Approval workflow and history</li>
                            <li>Comments and feedback</li>
                            <li>Approve/Reject actions</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">Coming Soon</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employee/regularization/:id" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-info">
                          <h4><i className="bi bi-eye me-2"></i>My Regularization Request</h4>
                          <p>This page will show your regularization request details including:</p>
                          <ul>
                            <li>Request status and progress</li>
                            <li>Approval workflow</li>
                            <li>Comments from approvers</li>
                            <li>Supporting documents</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">Coming Soon</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employee/regularization" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyRegularizationRequests />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Employee Self-Service Routes */}
              <Route 
                path="/employee/*" 
                element={
                  <ProtectedRoute requiredRoles={['Employee']}>
                    <Layout>
                      <div className="container-fluid">
                        <div className="alert alert-light border">
                          <h4><i className="bi bi-person-circle me-2"></i>Employee Self-Service</h4>
                          <p>This section will include:</p>
                          <ul>
                            <li>Personal profile management</li>
                            <li>Leave application and history</li>
                            <li>Attendance tracking</li>
                            <li>Payslip downloads</li>
                            <li>Training enrollment</li>
                            <li>Performance goals</li>
                          </ul>
                          <p className="mb-0"><strong>Status:</strong> <span className="badge bg-warning">In Development</span></p>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect based on user role */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* 404 Page */}
              <Route 
                path="*" 
                element={
                  <Layout>
                    <div className="container-fluid">
                      <div className="row justify-content-center">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body text-center">
                              <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
                              <h2 className="card-title mt-3">Page Not Found</h2>
                              <p className="card-text text-muted">
                                The page you're looking for doesn't exist.
                              </p>
                              <button 
                                className="btn btn-primary"
                                onClick={() => window.location.href = '/dashboard'}
                              >
                                <i className="bi bi-house me-2"></i>
                                Go to Dashboard
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Layout>
                } 
              />
            </Routes>
          </div>
        </Router>
      </ChatShortcutProvider>
    </AuthProvider>
  );
}

export default App;
