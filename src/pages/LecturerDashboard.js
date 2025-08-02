import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  DocumentIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lecturer, setLecturer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_courses: 0,
    total_students: 0,
    total_assignments: 0,
    pending_submissions: 0,
    this_week_submissions: 0
  });
  
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateAssignmentForm, setShowCreateAssignmentForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    max_points: 100,
    assignment_type: 'homework',
    instructions: '',
    file: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Grading state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingData, setGradingData] = useState({
    grade: '',
    feedback: ''
  });

  // Check authentication and get user info
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/check-auth', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.role === 'lecturer') {
            setUser(data);
            fetchLecturerProfile(data.user_id);
            fetchDashboardStats();
          } else {
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch lecturer profile
  const fetchLecturerProfile = async (userId) => {
    try {
      const response = await fetch(`/api/lecturer/profile/${userId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLecturer(data.lecturer);
      }
    } catch (error) {
      console.error('Error fetching lecturer profile:', error);
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch('/api/lecturer/dashboard-stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
    setLoadingStats(false);
  };

  // Fetch lecturer's courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lecturer/courses', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
    setLoading(false);
  };

  // Fetch pending submissions for grading
  const fetchPendingSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lecturer/submissions/pending', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
    setLoading(false);
  };

  // Fetch students enrolled in lecturer's courses
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lecturer/students', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    setLoading(false);
  };

  // Fetch assignments for lecturer's courses
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // We'll get assignments grouped by course
      const response = await fetch('/api/lecturer/courses', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
        
        // For now, we can show course-based assignment management
        // In the future, we can add a dedicated assignments endpoint
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
    setLoading(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  // Handle creating new assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('due_date', newAssignment.due_date);
      formData.append('max_points', newAssignment.max_points);
      formData.append('assignment_type', newAssignment.assignment_type);
      formData.append('instructions', newAssignment.instructions);
      formData.append('course_id', selectedCourse.id);
      
      // Add file if selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/lecturer/assignments', {
        method: 'POST',
        credentials: 'include',
        body: formData // Don't set Content-Type header, let browser set it with boundary
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'Assignment created successfully!');
        setShowCreateAssignmentForm(false);
        setSelectedCourse(null);
        setSelectedFile(null);
        setNewAssignment({
          title: '',
          description: '',
          due_date: '',
          max_points: 100,
          assignment_type: 'homework',
          instructions: '',
          file: null
        });
        fetchDashboardStats();
        // Refresh courses to update assignment counts
        if (activeTab === 'courses') {
          fetchCourses();
        } else if (activeTab === 'assignments') {
          fetchAssignments();
        }
      } else {
        const error = await response.json();
        setMessage(error.message || error.error || 'Failed to create assignment');
      }
    } catch (error) {
      setMessage('Failed to create assignment');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle opening grading modal
  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradingData({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
    setShowGradingModal(true);
  };

  // Handle submitting grade
  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lecturer/submissions/${selectedSubmission.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          grade: parseFloat(gradingData.grade),
          feedback: gradingData.feedback
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'Grade submitted successfully!');
        setShowGradingModal(false);
        setSelectedSubmission(null);
        setGradingData({ grade: '', feedback: '' });
        // Refresh submissions and stats
        fetchPendingSubmissions();
        fetchDashboardStats();
      } else {
        const error = await response.json();
        setMessage(error.message || error.error || 'Failed to submit grade');
      }
    } catch (error) {
      setMessage('Failed to submit grade');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  // Download submission file
  const downloadSubmissionFile = async (submissionId, filename) => {
    try {
      const response = await fetch(`/api/lecturer/submissions/${submissionId}/download`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'submission_file';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
              <BookOpenIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Lecturer Dashboard</h1>
                <p className="text-sm text-gray-500">Course Management & Student Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : user.username}
                </p>
                <p className="text-xs text-gray-500">
                  {lecturer ? lecturer.department : 'Lecturer'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message Display */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`p-4 rounded-lg ${
            message.includes('success') || message.includes('Success') 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome, {lecturer ? `Dr. ${lecturer.last_name}` : 'Lecturer'}
          </h2>
          <p className="text-indigo-100">
            Manage your courses, assignments, and monitor student progress from your dashboard.
          </p>
          {lecturer && lecturer.office_hours && (
            <div className="mt-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">Office Hours: {lecturer.office_hours}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Courses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.total_courses}
                </p>
              </div>
            </div>
          </div>

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
              <DocumentIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.total_assignments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Grades</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.pending_submissions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingStats ? '...' : dashboardStats.this_week_submissions}
                </p>
                <p className="text-xs text-gray-400">New submissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <button 
            onClick={() => {
              setActiveTab('courses');
              fetchCourses();
            }}
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            My Courses
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('assignments');
              fetchAssignments();
            }}
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            My Assignments
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('grading');
              fetchPendingSubmissions();
            }}
            className="flex items-center justify-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Grade Submissions
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('students');
              fetchStudents();
            }}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            My Students
          </button>
          
          <button 
            onClick={() => setActiveTab('schedule')}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Schedule
          </button>
        </div>

        {/* Courses Section */}
        {activeTab === 'courses' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">My Courses</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your assigned courses and create assignments</p>
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Assigned</h3>
                  <p className="text-gray-600">You don't have any courses assigned yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Contact the administrator to get courses assigned to you.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.course_code} - {course.course_name}
                          </h3>
                          <p className="text-gray-600 mt-1">{course.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center">
                              <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                              {course.credits} credits
                            </span>
                            <span className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1" />
                              {course.enrollment_count || 0} students
                            </span>
                            <span className="flex items-center">
                              <DocumentIcon className="h-4 w-4 mr-1" />
                              {course.assignment_count || 0} assignments
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowCreateAssignmentForm(true);
                            }}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            New Assignment
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

        {/* Assignments Section */}
        {activeTab === 'assignments' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">My Assignments</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage assignments across your courses</p>
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
              {loading ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-indigo-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading assignments...</p>
                </div>
              ) : courses.length > 0 ? (
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.course_code}: {course.course_name}
                          </h3>
                          <p className="text-sm text-gray-600">{course.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowCreateAssignmentForm(true);
                          }}
                          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Create Assignment
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Course Assignments</h4>
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {course.assignment_count || 0} assignments
                          </span>
                        </div>
                        
                        {course.assignment_count > 0 ? (
                          <div className="text-center py-4">
                            <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              You have {course.assignment_count} assignment{course.assignment_count !== 1 ? 's' : ''} for this course
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Assignment list view coming soon
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No assignments created yet</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Click "Create Assignment" to get started
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
                  <p className="text-gray-600">You need to have courses assigned to create assignments</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grading Section */}
        {activeTab === 'grading' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Pending Submissions</h2>
                  <p className="text-sm text-gray-600 mt-1">Grade student submissions for your courses</p>
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading submissions...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Submissions</h3>
                  <p className="text-gray-600">All submissions have been graded!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{submission.assignment_title}</h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                            {submission.is_late && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Late
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Student:</p>
                              <p className="font-medium text-gray-900">{submission.student_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Course:</p>
                              <p className="font-medium text-gray-900">{submission.course_code}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Submitted:</p>
                              <p className="font-medium text-gray-900">
                                {new Date(submission.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Max Points:</p>
                              <p className="font-medium text-gray-900">{submission.max_points}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Due Date:</p>
                              <p className="font-medium text-gray-900">
                                {new Date(submission.due_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {submission.submission_text && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">Submission Text:</p>
                              <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                                {submission.submission_text}
                              </div>
                            </div>
                          )}

                          {submission.file_path && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">Submitted File:</p>
                              <button
                                onClick={() => downloadSubmissionFile(submission.id, `submission_${submission.id}`)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download File
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={() => handleGradeSubmission(submission)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                          >
                            Grade
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

        {/* Students Section */}
        {activeTab === 'students' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">My Students</h2>
                  <p className="text-sm text-gray-600 mt-1">Students enrolled in your courses</p>
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
              {loading ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading students...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Showing {students.length} student{students.length !== 1 ? 's' : ''} enrolled in your courses
                  </div>
                  
                  <div className="grid gap-4">
                    {students.map((student) => (
                      <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                ID: {student.student_id}
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </h3>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Email:</span>
                                <span>{student.email}</span>
                              </div>
                              {student.phone && (
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Phone:</span>
                                  <span>{student.phone}</span>
                                </div>
                              )}
                              {student.enrollment_date && (
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Enrolled:</span>
                                  <span>{new Date(student.enrollment_date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Student's Courses */}
                            <div className="mt-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <BookOpenIcon className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  Enrolled Courses ({student.course_count})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {student.courses?.map((course, index) => (
                                  <div key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                    <div className="flex items-center space-x-1">
                                      <span className="font-semibold">{course.course_code}</span>
                                      <span>•</span>
                                      <span>{course.course_name}</span>
                                      {course.grade && (
                                        <>
                                          <span>•</span>
                                          <span className="font-medium">Grade: {course.grade}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                  <p className="text-gray-600">No students are currently enrolled in your courses</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Section */}
        {activeTab === 'schedule' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">My Schedule</h2>
                  <p className="text-sm text-gray-600 mt-1">View your teaching schedule and office hours</p>
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
              {lecturer ? (
                <div className="space-y-6">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-900 mb-2">Office Hours</h3>
                    <p className="text-indigo-700">{lecturer.office_hours || 'Not scheduled'}</p>
                    {lecturer.office_location && (
                      <p className="text-sm text-indigo-600 mt-1">Location: {lecturer.office_location}</p>
                    )}
                  </div>
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Management Coming Soon</h3>
                    <p className="text-gray-600">Detailed schedule and calendar integration is being developed</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Schedule...</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Assignment Modal */}
        {showCreateAssignmentForm && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Create Assignment for {selectedCourse.course_code}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateAssignmentForm(false);
                    setSelectedCourse(null);
                    setNewAssignment({
                      title: '',
                      description: '',
                      due_date: '',
                      max_points: 100,
                      assignment_type: 'homework',
                      instructions: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📎 Assignment File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      id="assignment-file"
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setSelectedFile(file);
                        setNewAssignment({...newAssignment, file: file});
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="assignment-file"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <div className="text-gray-400 mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PDF, DOC, DOCX, TXT, ZIP files up to 10MB
                      </span>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 flex items-center justify-between bg-gray-50 rounded-md p-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setNewAssignment({...newAssignment, file: null});
                          document.getElementById('assignment-file').value = '';
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment Type
                    </label>
                    <select
                      value={newAssignment.assignment_type}
                      onChange={(e) => setNewAssignment({...newAssignment, assignment_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      Total Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={newAssignment.max_points}
                      onChange={(e) => setNewAssignment({...newAssignment, max_points: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAssignmentForm(false);
                      setSelectedCourse(null);
                    }}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
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
                      'Create Assignment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grading Modal */}
        {showGradingModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Grade Submission</h3>
                <button
                  onClick={() => setShowGradingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitGrade} className="space-y-4">
                {/* Submission Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Assignment:</p>
                      <p className="font-medium text-gray-900">{selectedSubmission.assignment_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Student:</p>
                      <p className="font-medium text-gray-900">{selectedSubmission.student_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Course:</p>
                      <p className="font-medium text-gray-900">{selectedSubmission.course_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Max Points:</p>
                      <p className="font-medium text-gray-900">{selectedSubmission.max_points}</p>
                    </div>
                  </div>
                  
                  {selectedSubmission.submission_text && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Submission Text:</p>
                      <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                        {selectedSubmission.submission_text}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grading Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade (out of {selectedSubmission.max_points}) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max={selectedSubmission.max_points}
                      required
                      value={gradingData.grade}
                      onChange={(e) => setGradingData({...gradingData, grade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter grade"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade Percentage
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                      {gradingData.grade ? 
                        `${((parseFloat(gradingData.grade) / selectedSubmission.max_points) * 100).toFixed(1)}%` : 
                        '0%'
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback (Optional)
                  </label>
                  <textarea
                    rows="4"
                    value={gradingData.feedback}
                    onChange={(e) => setGradingData({...gradingData, feedback: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGradingModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Grade'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LecturerDashboard;
