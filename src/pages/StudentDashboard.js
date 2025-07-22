import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  UserIcon,
  DocumentIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const [enrollmentMessage, setEnrollmentMessage] = useState('');
  
  // Assignment-related state
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'student') {
        navigate('/admin/dashboard');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch student enrollments with statistics
  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/student/enrollments/with-stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  // Fetch student notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/student/notifications', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch recent assignments
  const fetchRecentAssignments = async () => {
    try {
      const response = await fetch('/api/student/recent_assignments', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRecentAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching recent assignments:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEnrollments();
      fetchNotifications();
      fetchRecentAssignments();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  // Handle course enrollment
  const handleEnrollment = async (e) => {
    e.preventDefault();
    if (!enrollmentKey.trim()) {
      setEnrollmentMessage('Please enter an enrollment key');
      return;
    }

    try {
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ enrollment_key: enrollmentKey })
      });

      const data = await response.json();
      
      if (response.ok) {
        setEnrollmentMessage('Successfully enrolled in course!');
        setEnrollmentKey('');
        setShowEnrollModal(false);
        // Refresh enrollments and assignments
        fetchEnrollments();
        fetchRecentAssignments();
        fetchNotifications();
      } else {
        setEnrollmentMessage(data.message || 'Enrollment failed');
      }
    } catch (error) {
      setEnrollmentMessage('Error enrolling in course');
      console.error('Enrollment error:', error);
    }
  };

  // Handle assignment submission
  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText('');
    setSubmissionFile(null);
    setSubmissionMessage('');
    setShowSubmissionModal(true);
  };

  // Submit assignment
  const handleAssignmentSubmission = async (e) => {
    e.preventDefault();
    
    if (!submissionText.trim() && !submissionFile) {
      setSubmissionMessage('Please provide either text submission or upload a file');
      return;
    }

    const formData = new FormData();
    formData.append('assignment_id', selectedAssignment.id);
    formData.append('submission_text', submissionText);
    if (submissionFile) {
      formData.append('file', submissionFile);
    }

    try {
      const response = await fetch('/api/student/submit_assignment', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubmissionMessage('Assignment submitted successfully!');
        setSubmissionText('');
        setSubmissionFile(null);
        // Refresh assignments to update submission status
        fetchRecentAssignments();
        fetchNotifications();
        setTimeout(() => {
          setShowSubmissionModal(false);
          setSubmissionMessage('');
        }, 2000);
      } else {
        setSubmissionMessage(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setSubmissionMessage('Submission failed. Please try again.');
    }
  };

  // Profile management functions

  // Fetch student profile data
  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/student/profile', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        // Initialize form with current profile data
        setProfileForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
        setShowProfileModal(true);
      } else {
        console.error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Handle starting profile edit
  const handleEditProfile = () => {
    setEditingProfile(true);
    setProfileMessage('');
  };

  // Handle canceling profile edit
  const handleCancelEdit = () => {
    setEditingProfile(false);
    // Reset form to original data
    setProfileForm({
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      address: profileData.address || ''
    });
    setProfileMessage('');
  };

  // Handle saving profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        setEditingProfile(false);
        setProfileMessage('Profile updated successfully!');
        
        // Update user data in localStorage if email changed
        if (profileForm.email !== profileData.email) {
          const userData = JSON.parse(localStorage.getItem('user'));
          userData.email = profileForm.email;
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
      } else {
        const errorData = await response.json();
        setProfileMessage(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage('Error updating profile');
    }
  };

  // Handle form input changes
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch assignments for a specific course
  const fetchCourseAssignments = async (courseId) => {
    try {
      const response = await fetch(`/api/student/courses/${courseId}/assignments`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCourseAssignments(data.assignments);
        setSelectedCourse(data.course);
        setShowCourseDetails(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to fetch course assignments');
      }
    } catch (error) {
      console.error('Error fetching course assignments:', error);
      alert('Error fetching course assignments');
    }
  };

  // Handle viewing course details and assignments
  const handleViewCourse = (enrollment) => {
    fetchCourseAssignments(enrollment.course.id);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-500">SQL Injection Detection & Learning Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.profile?.first_name} {user.profile?.last_name}
                </p>
                <p className="text-xs text-gray-500">ID: {user.profile?.student_id}</p>
              </div>
              <UserIcon className="h-8 w-8 text-gray-400" />
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user.profile?.first_name}!
          </h2>
          <p className="text-blue-100">
            Ready to continue your learning journey? All your activities are monitored by our advanced ML security system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Courses Enrolled</p>
                <p className="text-2xl font-semibold text-gray-900">{enrollments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">New Notifications</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notifications.length}
                </p>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setShowNotifications(true)}
                    className="text-xs text-orange-600 hover:text-orange-700 mt-1"
                  >
                    View all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8">

          {/* My Courses */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
            </div>
            <div className="p-6">
              {enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div 
                      key={enrollment.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => handleViewCourse(enrollment)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {enrollment.course?.code} - {enrollment.course?.name || 'Untitled Course'}
                        </h4>
                        <p className="text-sm text-gray-500">{enrollment.course?.description || 'No description available'}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                          {enrollment.course?.credits && <span>{enrollment.course.credits} credits</span>}
                          {enrollment.course?.instructor && <span>Instructor: {enrollment.course.instructor}</span>}
                        </div>
                        {enrollment.assignment_stats && (
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              📚 {enrollment.assignment_stats.total} Total
                            </span>
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              ✅ {enrollment.assignment_stats.submitted} Done
                            </span>
                            {enrollment.assignment_stats.pending > 0 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                ⏳ {enrollment.assignment_stats.pending} Pending
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          Click to view assignments →
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Enrolled
                        </span>
                        <DocumentIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Courses Yet</h4>
                  <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet. Get started by browsing available courses.</p>
                  <button 
                    onClick={() => setShowEnrollModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Enroll in Course
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <BookOpenIcon className="h-5 w-5 mr-2" />
            Enroll in Course
          </button>
          <button 
            onClick={fetchProfileData}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <UserIcon className="h-5 w-5 mr-2" />
            View Profile
          </button>
        </div>

        {/* Enrollment Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enroll in Course</h3>
              <form onSubmit={handleEnrollment}>
                <div className="mb-4">
                  <label htmlFor="enrollmentKey" className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Key
                  </label>
                  <input
                    type="text"
                    id="enrollmentKey"
                    value={enrollmentKey}
                    onChange={(e) => setEnrollmentKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter enrollment key provided by your instructor"
                    required
                  />
                </div>
                {enrollmentMessage && (
                  <div className={`mb-4 p-3 rounded-md ${
                    enrollmentMessage.includes('Successfully') 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {enrollmentMessage}
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnrollModal(false);
                      setEnrollmentKey('');
                      setEnrollmentMessage('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Enroll
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && profileData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                {!editingProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {profileMessage && (
                <div className={`mb-4 p-3 rounded-md ${
                  profileMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {profileMessage}
                </div>
              )}

              {editingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={profileForm.first_name}
                        onChange={handleProfileFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={profileForm.last_name}
                        onChange={handleProfileFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={profileForm.address}
                      onChange={handleProfileFormChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-gray-900">
                      {profileData.first_name} {profileData.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Username</p>
                    <p className="text-gray-900">{profileData.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Student ID</p>
                    <p className="text-gray-900">{profileData.student_id}</p>
                  </div>
                  {profileData.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-900">{profileData.phone}</p>
                    </div>
                  )}
                  {profileData.address && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-gray-900">{profileData.address}</p>
                    </div>
                  )}
                  {profileData.enrollment_date && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Enrollment Date</p>
                      <p className="text-gray-900">
                        {new Date(profileData.enrollment_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Enrolled Courses</p>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {profileData.courses && profileData.courses.length > 0 ? (
                        <ul className="space-y-2">
                          {profileData.courses.map((course) => (
                            <li key={course.id} className="border rounded-md p-2 bg-gray-50">
                              <div className="font-medium">{course.code} - {course.name}</div>
                              <div className="text-sm text-gray-600">{course.description}</div>
                              <div className="text-xs text-gray-500">
                                {course.credits} credits • Enrolled: {new Date(course.enrollment_date).toLocaleDateString()}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No courses enrolled</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        setEditingProfile(false);
                        setProfileMessage('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignment Details Modal */}
        {showAssignmentModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assignment Details</h3>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedAssignment.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedAssignment.course_code} - {selectedAssignment.course_name}</p>
                </div>
                
                {selectedAssignment.description && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Description:</h5>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedAssignment.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAssignment.due_date && (
                    <div>
                      <h5 className="font-medium text-gray-700">Due Date:</h5>
                      <p className="text-gray-600">{new Date(selectedAssignment.due_date).toLocaleString()}</p>
                    </div>
                  )}
                  
                  {selectedAssignment.points && (
                    <div>
                      <h5 className="font-medium text-gray-700">Points:</h5>
                      <p className="text-gray-600">{selectedAssignment.points}</p>
                    </div>
                  )}
                </div>
                
                {selectedAssignment.submitted && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">Submission Status:</h5>
                    <p className="text-green-700">
                      Submitted on {new Date(selectedAssignment.submission_date).toLocaleString()}
                    </p>
                    {selectedAssignment.grade && (
                      <p className="text-green-700 mt-1">Grade: {selectedAssignment.grade}</p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  {!selectedAssignment.submitted && (
                    <button
                      onClick={() => {
                        setShowAssignmentModal(false);
                        handleSubmitAssignment(selectedAssignment);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                    >
                      Submit Assignment
                    </button>
                  )}
                  <button
                    onClick={() => setShowAssignmentModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Submission Modal */}
        {showSubmissionModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Submit Assignment</h3>
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{selectedAssignment.title}</h4>
                <p className="text-sm text-gray-600">{selectedAssignment.course_code} - {selectedAssignment.course_name}</p>
                {selectedAssignment.due_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {new Date(selectedAssignment.due_date).toLocaleString()}
                  </p>
                )}
              </div>

              {submissionMessage && (
                <div className={`mb-4 p-3 rounded-md ${
                  submissionMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {submissionMessage}
                </div>
              )}

              <form onSubmit={handleAssignmentSubmission} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Submission
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your submission text here..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Upload (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSubmissionFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.txt,.zip"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: PDF, DOC, DOCX, TXT, ZIP
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmissionModal(false);
                      setSubmissionMessage('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Submit Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notifications Modal */}
        {showNotifications && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <BellIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Details Modal with Assignments */}
        {showCourseDetails && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedCourse.code} - {selectedCourse.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedCourse.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{selectedCourse.credits} credits</span>
                    {selectedCourse.instructor && <span>Instructor: {selectedCourse.instructor}</span>}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCourseDetails(false);
                    setSelectedCourse(null);
                    setCourseAssignments([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Course Assignments ({courseAssignments.length})
                </h3>
                
                {courseAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {courseAssignments.map((assignment) => {
                      const isRecentAssignment = recentAssignments.some(recent => recent.id === assignment.id);
                      const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
                      const isOverdue = dueDate && dueDate < new Date() && !assignment.submitted;
                      
                      return (
                        <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                                {isRecentAssignment && (
                                  <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                                    NEW
                                  </span>
                                )}
                                {assignment.submitted ? (
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    ✓ Submitted
                                  </span>
                                ) : isOverdue ? (
                                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                    ⚠ Overdue
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                    📝 Pending
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                              
                              {assignment.instructions && (
                                <div className="bg-gray-50 p-3 rounded-md mb-3">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Instructions:</p>
                                  <p className="text-sm text-gray-600">{assignment.instructions}</p>
                                </div>
                              )}
                              
                              {assignment.has_file && (
                                <div className="bg-blue-50 p-3 rounded-md mb-3">
                                  <div className="flex items-center space-x-2">
                                    <DocumentIcon className="h-4 w-4 text-blue-600" />
                                    <p className="text-xs font-medium text-blue-700">Assignment File:</p>
                                  </div>
                                  <div className="mt-1 flex items-center space-x-2">
                                    <span className="text-sm text-blue-600">{assignment.filename}</span>
                                    <a
                                      href={assignment.download_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                                    >
                                      📥 Download
                                    </a>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Type: {assignment.assignment_type || 'Assignment'}</span>
                                <span>Points: {assignment.points}</span>
                                {assignment.due_date && (
                                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                  </span>
                                )}
                                <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
                              </div>
                              
                              {assignment.submitted && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                  <div className="flex items-center space-x-4 text-xs">
                                    <span className="text-blue-700">
                                      Submitted: {new Date(assignment.submission_date).toLocaleDateString()}
                                    </span>
                                    {assignment.grade && (
                                      <span className="text-blue-700 font-medium">
                                        Grade: {assignment.grade}
                                      </span>
                                    )}
                                    {assignment.is_late && (
                                      <span className="text-orange-600">Late Submission</span>
                                    )}
                                  </div>
                                  {assignment.feedback && (
                                    <div className="mt-2">
                                      <p className="text-xs font-medium text-blue-700">Feedback:</p>
                                      <p className="text-sm text-blue-600">{assignment.feedback}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <button
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setShowAssignmentModal(true);
                                }}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
                              >
                                View Details
                              </button>
                              {!assignment.submitted && (
                                <button
                                  onClick={() => {
                                    setSelectedAssignment(assignment);
                                    setShowSubmissionModal(true);
                                  }}
                                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
                                >
                                  Submit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h4>
                    <p className="text-gray-500">No assignments have been created for this course yet.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCourseDetails(false);
                    setSelectedCourse(null);
                    setCourseAssignments([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
