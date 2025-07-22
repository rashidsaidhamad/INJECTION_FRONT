import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  DocumentIcon,
  PlusIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_courses: 0,
    total_students: 0,
    total_assignments: 0,
    total_enrollments: 0,
    pending_submissions: 0,
    recent_enrollments: 0
  });
  const [activeTab, setActiveTab] = useState(''); // courses, students, grading
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [submissionsByCourse, setSubmissionsByCourse] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingFilter, setGradingFilter] = useState('all'); // all, pending, graded
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    instructor: ''
  });
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    points: 100,
    assignment_type: 'homework',
    instructions: ''
  });
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        navigate('/student/dashboard');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all courses
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      console.log('Fetching courses...');
      const response = await fetch('/api/admin/courses', {
        credentials: 'include'
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Courses data:', data);
        setCourses(data);
      } else {
        console.error('Failed to fetch courses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
    setLoadingCourses(false);
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      console.log('Fetching students...');
      const response = await fetch('/api/admin/students', {
        credentials: 'include'
      });
      console.log('Students response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Students data:', data);
        setStudents(data);
      } else {
        console.error('Failed to fetch students:', response.status);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    setLoadingStudents(false);
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      console.log('Fetching dashboard stats...');
      const response = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include'
      });
      console.log('Stats response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard stats:', data);
        setDashboardStats(data);
      } else {
        console.error('Failed to fetch dashboard stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
    setLoadingStats(false);
  };

  useEffect(() => {
    if (user) {
      // Fetch dashboard stats when component loads
      fetchDashboardStats();
    }
  }, [user]);

  // Create new course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newCourse)
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Course created successfully! Enrollment key: ${data.course.enrollment_key}`);
        setNewCourse({ code: '', name: '', description: '', credits: 3, instructor: '' });
        setShowCreateForm(false);
        fetchCourses();
        fetchDashboardStats(); // Refresh stats
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to create course');
      }
    } catch (error) {
      setMessage('Failed to create course');
    }
    setLoading(false);
  };

  // Copy enrollment key to clipboard
  const copyEnrollmentKey = (key) => {
    navigator.clipboard.writeText(key);
    setMessage(`Enrollment key ${key} copied to clipboard!`);
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle deleting a student
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage('Student deleted successfully!');
        fetchStudents(); // Refresh the students list
        fetchDashboardStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setMessage('Error deleting student');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle deleting a course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage('Course deleted successfully!');
        fetchCourses(); // Refresh the courses list
        fetchDashboardStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setMessage('Error deleting course');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle uploading assignment
  const handleUploadAssignment = (course) => {
    setSelectedCourse(course);
    setShowAssignmentForm(true);
    setNewAssignment({
      title: '',
      description: '',
      due_date: '',
      points: 100,
      assignment_type: 'homework',
      instructions: ''
    });
    setAssignmentFile(null);
  };

  // Handle creating assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('due_date', newAssignment.due_date);
      formData.append('points', newAssignment.points);
      formData.append('assignment_type', newAssignment.assignment_type);
      formData.append('instructions', newAssignment.instructions);
      
      if (assignmentFile) {
        formData.append('assignment_file', assignmentFile);
      }

      const response = await fetch(`/api/admin/courses/${selectedCourse.id}/assignments`, {
        method: 'POST',
        credentials: 'include',
        body: formData  // Don't set Content-Type header, let browser set it with boundary
      });

      if (response.ok) {
        const data = await response.json();
        const enrolledCount = data.assignment.enrolled_students_count || 0;
        const fileMessage = data.assignment.has_file ? ` (with file: ${data.assignment.filename})` : '';
        setMessage(
          `Assignment "${newAssignment.title}" created successfully${fileMessage}! ` +
          `${enrolledCount} enrolled student${enrolledCount !== 1 ? 's' : ''} will be notified.`
        );
        setShowAssignmentForm(false);
        setSelectedCourse(null);
        setNewAssignment({
          title: '',
          description: '',
          due_date: '',
          points: 100,
          assignment_type: 'homework',
          instructions: ''
        });
        setAssignmentFile(null);
        fetchDashboardStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setMessage('Error creating assignment');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 5000);
  };

  // Handle drag and drop for file upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                           'text/plain', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                           'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                           'application/zip', 'application/x-rar-compressed', 'image/png', 'image/jpeg', 'image/gif'];
      
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'rar', 'png', 'jpg', 'jpeg', 'gif'];
      
      if (allowedExtensions.includes(fileExtension)) {
        if (file.size <= 16 * 1024 * 1024) { // 16MB limit
          setAssignmentFile(file);
        } else {
          alert('File size must be less than 16MB');
        }
      } else {
        alert('File type not allowed. Please use PDF, DOC, PPT, images, ZIP, or text files.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">SQL Injection Detection System Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome, Administrator
          </h2>
          <p className="text-red-100">
            Monitor and manage the SQL injection detection system and student activities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.total_students}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.total_courses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <DocumentIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.total_assignments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.total_enrollments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.pending_submissions}
                </p>
                <p className="text-xs text-gray-400">Awaiting grading</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.recent_enrollments}
                </p>
                <p className="text-xs text-gray-400">Last 7 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm text-gray-900">Random Forest Model</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm text-gray-900">SVM Model</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm text-gray-900">BERT Model</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm text-gray-900">Student Monitoring</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Security Events</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-900">SQL injection attempt blocked</p>
                    <p className="text-xs text-gray-500">Student ID: STU001 - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-900">New student registered</p>
                    <p className="text-xs text-gray-500">john.doe@test.com - 5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-900">System health check completed</p>
                    <p className="text-xs text-gray-500">All models operational - 1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => {
              setActiveTab('students');
              fetchStudents(); // Always fetch students when tab is clicked
            }}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Students
          </button>
          <button 
            onClick={() => {
              setActiveTab('courses');
              fetchCourses(); // Always fetch courses when tab is clicked
            }}
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Manage Courses
          </button>
          <button className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Security Logs
          </button>
          <button className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            <CogIcon className="h-5 w-5 mr-2" />
            System Settings
          </button>
        </div>

        {/* Student Management Modal/Section */}
        {activeTab === 'students' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Student Management</h2>
                  <p className="text-sm text-gray-600 mt-1">View and manage all registered students</p>
                </div>
                <button
                  onClick={() => setActiveTab('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingStudents ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No students registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Password
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrollments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.first_name} {student.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-mono">{student.username}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.student_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {student.password ? '••••••••' : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {student.enrollment_count} courses
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {student.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                              title="Delete Student"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course Management Modal/Section */}
        {activeTab === 'courses' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Course Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage courses and enrollment keys</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Course
                  </button>
                  <button
                    onClick={() => setActiveTab('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Create Course Form */}
            {showCreateForm && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., CS101"
                        value={newCourse.code}
                        onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Introduction to Computer Science"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credits
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={newCourse.credits}
                        onChange={(e) => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructor
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Dr. Smith"
                        value={newCourse.instructor}
                        onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Course description..."
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Courses List */}
            <div className="p-6">
              {loadingCourses ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No courses created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.code} - {course.name}
                          </h3>
                          <p className="text-gray-600 mt-1">{course.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{course.credits} credits</span>
                            {course.instructor && <span>Instructor: {course.instructor}</span>}
                            <span>{course.enrollment_count || 0} enrolled</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => copyEnrollmentKey(course.enrollment_key)}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
                            title="Copy enrollment key"
                          >
                            <KeyIcon className="h-4 w-4 mr-1" />
                            {course.enrollment_key}
                          </button>
                          <button
                            onClick={() => handleUploadAssignment(course)}
                            className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                            title="Upload Assignment"
                          >
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            Assignment
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
                            title="Delete Course"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignment Upload Modal */}
        {showAssignmentForm && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col p-6 my-4">
              <div className="flex-shrink-0 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create Assignment for {selectedCourse.code} - {selectedCourse.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAssignmentForm(false);
                      setSelectedCourse(null);
                      setAssignmentFile(null);
                      setDragActive(false);
                      setNewAssignment({
                        title: '',
                        description: '',
                        due_date: '',
                        points: 100,
                        assignment_type: 'homework',
                        instructions: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <form onSubmit={handleCreateAssignment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Programming Assignment 1"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Brief assignment description..."
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detailed Instructions
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Detailed instructions for the assignment..."
                    value={newAssignment.instructions}
                    onChange={(e) => setNewAssignment({...newAssignment, instructions: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Type
                  </label>
                  <select
                    value={newAssignment.assignment_type}
                    onChange={(e) => setNewAssignment({...newAssignment, assignment_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="homework">📝 Homework</option>
                    <option value="quiz">❓ Quiz</option>
                    <option value="exam">📊 Exam</option>
                    <option value="project">🚀 Project</option>
                    <option value="lab">🔬 Lab Assignment</option>
                    <option value="reading">📖 Reading Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment File (Optional)
                  </label>
                  <div 
                    className={
                      dragActive 
                        ? "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors border-blue-500 bg-blue-50" 
                        : "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors border-gray-300 hover:border-gray-400"
                    }
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-1 text-center w-full">
                      <DocumentIcon className={dragActive ? "mx-auto h-12 w-12 text-blue-500" : "mx-auto h-12 w-12 text-gray-400"} />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg,.gif"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file && file.size <= 16 * 1024 * 1024) {
                                setAssignmentFile(file);
                              } else if (file) {
                                alert('File size must be less than 16MB');
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, PPT, images, ZIP up to 16MB
                      </p>
                      {assignmentFile && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-blue-700 font-medium">
                              📎 {assignmentFile.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => setAssignmentFile(null)}
                              className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            Size: {(assignmentFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newAssignment.due_date}
                      onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={newAssignment.points}
                      onChange={(e) => setNewAssignment({...newAssignment, points: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="100"
                    />
                  </div>
                </div>

                  <div className="flex-shrink-0 border-t border-gray-200 pt-4 mt-4">
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAssignmentForm(false);
                          setSelectedCourse(null);
                          setAssignmentFile(null);
                          setDragActive(false);
                          setNewAssignment({
                            title: '',
                            description: '',
                            due_date: '',
                            points: 100,
                            assignment_type: 'homework',
                            instructions: ''
                          });
                        }}
                        className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          '✅ Create Assignment'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
