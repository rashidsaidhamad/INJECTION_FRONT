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
  CogIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_courses: 0,
    total_students: 0,
    total_assignments: 0,
    total_enrollments: 0
  });
  const [activeTab, setActiveTab] = useState(''); // courses, students, securityLogs, lecturers
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    instructor: '',
    lecturer_id: '',
    enrollment_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  
  // Lecturer management state
  const [lecturers, setLecturers] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [showLecturerForm, setShowLecturerForm] = useState(false);
  const [lecturerSearchQuery, setLecturerSearchQuery] = useState('');
  
  // Security logs filters
  const [logTimeFilter, setLogTimeFilter] = useState('all'); // day, week, month, all
  const [logTypeFilter, setLogTypeFilter] = useState('all'); // malicious, safe, all
  
  const [newLecturer, setNewLecturer] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    employee_id: '',
    department: '',
    qualification: '',
    specialization: '',
    office_hours: '',
    bio: ''
  });
  
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

  // Fetch security logs from backend
  const fetchSecurityLogs = async () => {
    setLoadingLogs(true);
    try {
      console.log('Fetching security logs...');
      const response = await fetch('/api/admin/security/logs', {
        credentials: 'include'
      });
      console.log('Security logs response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Security logs data:', data);
        setSecurityLogs(data.logs || []);
      } else {
        console.error('Failed to fetch security logs:', response.status);
        setSecurityLogs([]);
      }
    } catch (error) {
      console.error('Error fetching security logs:', error);
      setSecurityLogs([]);
    }
    setLoadingLogs(false);
  };

  // Fetch pending submissions for grading
 

  useEffect(() => {
    if (user) {
      // Fetch dashboard stats and lecturers when component loads
      fetchDashboardStats();
      fetchLecturers(); // Fetch lecturers for course assignment
    }
  }, [user]);

  // Refetch security logs when filters change
  useEffect(() => {
    if (activeTab === 'securityLogs') {
      fetchFilteredSecurityLogs();
    }
  }, [logTimeFilter, logTypeFilter, activeTab]);

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
        setNewCourse({ code: '', name: '', description: '', credits: 3, instructor: '', lecturer_id: '', enrollment_key: '' });
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

  // Lecturer Management Functions
  
  // Fetch all lecturers
  const fetchLecturers = async () => {
    setLoadingLecturers(true);
    try {
      const response = await fetch('/api/admin/lecturers', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLecturers(data.lecturers || []);
      } else {
        console.error('Failed to fetch lecturers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching lecturers:', error);
    }
    setLoadingLecturers(false);
  };

  // Handle creating a new lecturer
  const handleCreateLecturer = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/lecturers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newLecturer)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Lecturer registered successfully!');
        setNewLecturer({
          username: '',
          password: '',
          email: '',
          first_name: '',
          last_name: '',
          phone: '',
          employee_id: '',
          department: '',
          qualification: '',
          specialization: '',
          office_hours: '',
          bio: ''
        });
        setShowLecturerForm(false);
        fetchLecturers();
        fetchDashboardStats();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to register lecturer');
      }
    } catch (error) {
      setMessage('Failed to register lecturer');
    }
    setLoading(false);
  };

  // Handle deleting a lecturer
  const handleDeleteLecturer = async (lecturerId) => {
    if (!window.confirm('Are you sure you want to delete this lecturer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lecturers/${lecturerId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage('Lecturer deleted successfully!');
        fetchLecturers();
        fetchDashboardStats();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to delete lecturer');
      }
    } catch (error) {
      console.error('Error deleting lecturer:', error);
      setMessage('Error deleting lecturer');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Clear lecturer search
  const clearLecturerSearch = () => {
    setLecturerSearchQuery('');
  };

  // Download security logs
  const downloadSecurityLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/security/logs/download?time_filter=${logTimeFilter}&type_filter=${logTypeFilter}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with current date and filters
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeFilterStr = logTimeFilter !== 'all' ? `_${logTimeFilter}` : '';
        const typeFilterStr = logTypeFilter !== 'all' ? `_${logTypeFilter}` : '';
        link.download = `security_logs_${dateStr}${timeFilterStr}${typeFilterStr}.csv`;
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        setMessage('Security logs downloaded successfully!');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to download logs');
      }
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Failed to download logs');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  // Update fetchSecurityLogs to include filters
  const fetchFilteredSecurityLogs = async () => {
    setLoadingLogs(true);
    try {
      console.log('Fetching security logs with filters...');
      const response = await fetch(`/api/admin/security/logs?time_filter=${logTimeFilter}&type_filter=${logTypeFilter}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log('Security logs response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Security logs data:', data);
        setSecurityLogs(data.logs || []);
      } else {
        console.error('Failed to fetch security logs:', response.status);
        setSecurityLogs([]);
      }
    } catch (error) {
      console.error('Error fetching security logs:', error);
      setSecurityLogs([]);
    }
    setLoadingLogs(false);
  };

  // Handle uploading assignment
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    if (!studentSearchQuery.trim()) return true;
    
    const query = studentSearchQuery.toLowerCase();
    return (
      (student.first_name && student.first_name.toLowerCase().includes(query)) ||
      (student.last_name && student.last_name.toLowerCase().includes(query)) ||
      (student.username && student.username.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.student_id && student.student_id.toLowerCase().includes(query)) ||
      (student.phone && student.phone.toLowerCase().includes(query))
    );
  });

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) => {
    if (!courseSearchQuery.trim()) return true;
    
    const query = courseSearchQuery.toLowerCase();
    return (
      (course.code && course.code.toLowerCase().includes(query)) ||
      (course.name && course.name.toLowerCase().includes(query)) ||
      (course.description && course.description.toLowerCase().includes(query)) ||
      (course.instructor && course.instructor.toLowerCase().includes(query))
    );
  });

  // Filter lecturers based on search query
  const filteredLecturers = lecturers.filter((lecturer) => {
    if (!lecturerSearchQuery.trim()) return true;
    
    const query = lecturerSearchQuery.toLowerCase();
    return (
      (lecturer.first_name && lecturer.first_name.toLowerCase().includes(query)) ||
      (lecturer.last_name && lecturer.last_name.toLowerCase().includes(query)) ||
      (lecturer.username && lecturer.username.toLowerCase().includes(query)) ||
      (lecturer.email && lecturer.email.toLowerCase().includes(query)) ||
      (lecturer.employee_id && lecturer.employee_id.toLowerCase().includes(query)) ||
      (lecturer.department && lecturer.department.toLowerCase().includes(query)) ||
      (lecturer.specialization && lecturer.specialization.toLowerCase().includes(query))
    );
  });

  // Handle search input changes
  const handleStudentSearchChange = (e) => {
    setStudentSearchQuery(e.target.value);
  };

  const handleCourseSearchChange = (e) => {
    setCourseSearchQuery(e.target.value);
  };

  const handleLecturerSearchChange = (e) => {
    setLecturerSearchQuery(e.target.value);
  };

  // Clear search functions
  const clearStudentSearch = () => {
    setStudentSearchQuery('');
  };

  const clearCourseSearch = () => {
    setCourseSearchQuery('');
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
          <button 
            onClick={() => {
              setActiveTab('securityLogs');
              fetchFilteredSecurityLogs();
            }}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Security Logs
          </button>
          <button 
            onClick={() => {
              setActiveTab('lecturers');
              fetchLecturers();
            }}
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Manage Lecturers
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
                <div className="flex items-center space-x-4">
                  {students.length > 0 && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={studentSearchQuery}
                        onChange={handleStudentSearchChange}
                        className="w-64 px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      {studentSearchQuery && (
                        <button
                          onClick={clearStudentSearch}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => setActiveTab('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              {studentSearchQuery && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing {filteredStudents.length} of {students.length} students
                  {studentSearchQuery && ` matching "${studentSearchQuery}"`}
                </p>
              )}
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
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No students found matching your search</p>
                  <button
                    onClick={clearStudentSearch}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Clear Search
                  </button>
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
                      {filteredStudents.map((student) => (
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Course Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage courses and enrollment keys</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      className="block w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {courseSearchQuery && (
                      <button
                        onClick={clearCourseSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
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
                        Assign Lecturer
                      </label>
                      <select
                        value={newCourse.lecturer_id}
                        onChange={(e) => {
                          const selectedLecturerId = e.target.value;
                          const selectedLecturer = lecturers.find(l => l.id.toString() === selectedLecturerId);
                          setNewCourse({
                            ...newCourse, 
                            lecturer_id: selectedLecturerId,
                            instructor: selectedLecturer ? `${selectedLecturer.first_name} ${selectedLecturer.last_name}` : ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a lecturer (optional)</option>
                        {lecturers.map((lecturer) => (
                          <option key={lecturer.id} value={lecturer.id}>
                            {lecturer.first_name} {lecturer.last_name} - {lecturer.department}
                          </option>
                        ))}
                      </select>
                      {lecturers.length === 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          No lecturers available. Create lecturers first to assign them to courses.
                        </p>
                      )}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enrollment Key (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave empty for auto-generation (e.g., CS101_2024)"
                      value={newCourse.enrollment_key || ''}
                      onChange={(e) => setNewCourse({...newCourse, enrollment_key: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Students will use this key to enroll in the course. If left empty, it will be auto-generated.
                    </p>
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
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No courses found matching your search</p>
                  <button
                    onClick={clearCourseSearch}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.code} - {course.name}
                          </h3>
                          <p className="text-gray-600 mt-1">{course.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{course.credits} credits</span>
                            {course.lecturer ? (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Lecturer: {course.lecturer.name}
                              </span>
                            ) : course.instructor ? (
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                Instructor: {course.instructor}
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                No Instructor Assigned
                              </span>
                            )}
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

        {/* Security Logs Section */}
        {activeTab === 'securityLogs' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Security Logs</h2>
                  <p className="text-sm text-gray-600 mt-1">View all detected SQL injection attempts and security events</p>
                </div>
                <button
                  onClick={() => setActiveTab('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Time Filter */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Time Period</label>
                    <select
                      value={logTimeFilter}
                      onChange={(e) => setLogTimeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="all">All Time</option>
                      <option value="day">Last 24 Hours</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                    </select>
                  </div>
                  
                  {/* Type Filter */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Event Type</label>
                    <select
                      value={logTypeFilter}
                      onChange={(e) => setLogTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="all">All Events</option>
                      <option value="malicious">Malicious Only</option>
                      <option value="safe">Safe Events Only</option>
                    </select>
                  </div>
                </div>
                
                {/* Download Button */}
                <button
                  onClick={downloadSecurityLogs}
                  disabled={loading || securityLogs.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Logs
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingLogs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading security logs...</p>
                </div>
              ) : securityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-500">No security logs available yet.</p>
                  <p className="text-xs text-gray-400 mt-2">No detected security events found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Query/Input
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {securityLogs.map((log, index) => (
                        <tr key={log.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.severity === 'critical' || log.severity === 'high'
                                ? 'bg-red-100 text-red-800' 
                                : log.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {log.event_type || 'security_event'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.user_name || log.username || (log.user_id ? `User ${log.user_id}` : 'Unknown')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.ip_address || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {log.request_data || log.message || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.severity === 'critical' || log.severity === 'high'
                                ? 'bg-red-100 text-red-800' 
                                : log.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {log.severity || 'monitored'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {log.detection_details || log.user_agent || 'N/A'}
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

        {/* Lecturers Section */}
        {activeTab === 'lecturers' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Lecturer Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Register and manage lecturer accounts</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {lecturers.length > 0 && (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search lecturers..."
                        value={lecturerSearchQuery}
                        onChange={handleLecturerSearchChange}
                        className="block w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {lecturerSearchQuery && (
                        <button
                          onClick={clearLecturerSearch}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowLecturerForm(!showLecturerForm)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Register Lecturer
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
              
              {lecturerSearchQuery && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing {filteredLecturers.length} of {lecturers.length} lecturers
                  {lecturerSearchQuery && ` matching "${lecturerSearchQuery}"`}
                </p>
              )}
            </div>

            {/* Lecturer Registration Form */}
            {showLecturerForm && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <form onSubmit={handleCreateLecturer} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">Account Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., jsmith"
                          value={newLecturer.username}
                          onChange={(e) => setNewLecturer({...newLecturer, username: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Temporary password"
                          value={newLecturer.password}
                          onChange={(e) => setNewLecturer({...newLecturer, password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="john.smith@university.edu"
                          value={newLecturer.email}
                          onChange={(e) => setNewLecturer({...newLecturer, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="John"
                            value={newLecturer.first_name}
                            onChange={(e) => setNewLecturer({...newLecturer, first_name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Smith"
                            value={newLecturer.last_name}
                            onChange={(e) => setNewLecturer({...newLecturer, last_name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="+1234567890"
                          value={newLecturer.phone}
                          onChange={(e) => setNewLecturer({...newLecturer, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">Professional Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employee ID *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="EMP001"
                          value={newLecturer.employee_id}
                          onChange={(e) => setNewLecturer({...newLecturer, employee_id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department *
                        </label>
                        <select
                          required
                          value={newLecturer.department}
                          onChange={(e) => setNewLecturer({...newLecturer, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Department</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                          <option value="Business">Business</option>
                          <option value="Economics">Economics</option>
                          <option value="Psychology">Psychology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Qualification
                        </label>
                        <select
                          value={newLecturer.qualification}
                          onChange={(e) => setNewLecturer({...newLecturer, qualification: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Qualification</option>
                          <option value="PhD">PhD</option>
                          <option value="Masters">Masters</option>
                          <option value="Bachelors">Bachelors</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specialization
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Machine Learning, Database Systems"
                          value={newLecturer.specialization}
                          onChange={(e) => setNewLecturer({...newLecturer, specialization: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Office Hours
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Mon-Wed 10:00-12:00"
                          value={newLecturer.office_hours}
                          onChange={(e) => setNewLecturer({...newLecturer, office_hours: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Brief professional biography..."
                      value={newLecturer.bio}
                      onChange={(e) => setNewLecturer({...newLecturer, bio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowLecturerForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Registering...' : 'Register Lecturer'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lecturers List */}
            <div className="p-6">
              {loadingLecturers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading lecturers...</p>
                </div>
              ) : lecturers.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Lecturers Registered</h3>
                  <p className="text-gray-600">Start by registering your first lecturer using the form above.</p>
                </div>
              ) : filteredLecturers.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No lecturers found matching your search</p>
                  <button
                    onClick={clearLecturerSearch}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lecturer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qualification
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Office Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLecturers.map((lecturer) => (
                        <tr key={lecturer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {lecturer.first_name} {lecturer.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                              @{lecturer.username}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-mono">{lecturer.employee_id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lecturer.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lecturer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lecturer.qualification || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lecturer.office_hours || 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteLecturer(lecturer.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                              title="Delete Lecturer"
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
      </main>
    </div>
  );
};

export default AdminDashboard;
