import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  KeyIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch available courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/student/courses', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch student enrollments
  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/student/enrollments', {
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

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  // Check if student is already enrolled in a course
  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.course.id === courseId);
  };

  // Handle enrollment
  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ enrollment_key: enrollmentKey })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Successfully enrolled in ${data.course.code} - ${data.course.name}!`);
        setShowEnrollModal(false);
        setEnrollmentKey('');
        setSelectedCourse(null);
        fetchEnrollments(); // Refresh enrollments
      } else {
        const error = await response.json();
        setMessage(error.error || 'Enrollment failed');
      }
    } catch (error) {
      setMessage('Enrollment failed');
    }
    setLoading(false);
  };

  const openEnrollModal = (course) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
          <p className="text-gray-600 mt-2">Browse available courses and enroll using enrollment keys</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* My Enrollments */}
        {enrollments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {enrollment.course.code} - {enrollment.course.name}
                      </h3>
                      <p className="text-gray-600 mt-1">{enrollment.course.credits} credits</p>
                      {enrollment.course.instructor && (
                        <p className="text-sm text-gray-500 mt-1">Instructor: {enrollment.course.instructor}</p>
                      )}
                      <div className="flex items-center mt-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm text-green-600">Enrolled</span>
                      </div>
                    </div>
                  </div>
                  {enrollment.grade && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Grade: {enrollment.grade}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Courses</h2>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No courses available at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {course.code} - {course.name}
                      </h3>
                      <p className="text-gray-600 mt-2">{course.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{course.credits} credits</span>
                        </div>
                        {course.instructor && (
                          <span>Instructor: {course.instructor}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {isEnrolled(course.id) ? (
                      <div className="flex items-center justify-center py-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-700 font-medium">Already Enrolled</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => openEnrollModal(course)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      >
                        <KeyIcon className="h-5 w-5 mr-2" />
                        Enroll with Key
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollment Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Enroll in {selectedCourse?.code} - {selectedCourse?.name}
              </h3>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> You need an enrollment key from your administrator to enroll in this course.
                </p>
              </div>

              <form onSubmit={handleEnroll}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Key
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter enrollment key (e.g., ABC12345)"
                    value={enrollmentKey}
                    onChange={(e) => setEnrollmentKey(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnrollModal(false);
                      setEnrollmentKey('');
                      setSelectedCourse(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Enrolling...' : 'Enroll'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
