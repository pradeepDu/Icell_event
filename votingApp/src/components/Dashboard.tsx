import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Admin-only component
const AdminPanel: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  // This would typically come from a database
  
  useEffect(() => {
    // Mock data - in a real app, you'd fetch this from your backend
    setStudents([
      { id: 1, name: 'Student 1', email: 'student1@student.mes.ac.in', lastLogin: '2025-02-24' },
      { id: 2, name: 'Student 2', email: 'student2@student.mes.ac.in', lastLogin: '2025-02-23' },
      { id: 3, name: 'Student 3', email: 'student3@student.mes.ac.in', lastLogin: '2025-02-22' }
    ]);
  }, []);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Student Management</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.lastLogin}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">System Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h4 className="font-medium">Email Notifications</h4>
            <label className="flex items-center mt-2">
              <input type="checkbox" className="mr-2" />
              Enable weekly reports
            </label>
          </div>
          <div className="p-4 border rounded">
            <h4 className="font-medium">Registration</h4>
            <label className="flex items-center mt-2">
              <input type="checkbox" className="mr-2" />
              Allow new student registrations
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Student-only component
const StudentDashboard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Student Dashboard</h2>
      <p className="mb-4">Welcome to your student portal!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Your Courses</h3>
          <ul className="list-disc pl-5">
            <li>Introduction to Programming</li>
            <li>Data Structures</li>
            <li>Web Development</li>
          </ul>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Upcoming Assignments</h3>
          <ul className="list-disc pl-5">
            <li>Project Proposal - Due Mar 1, 2025</li>
            <li>Midterm Exam - Mar 15, 2025</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { currentUser, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'Student Portal'}
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600">
              {isAdmin ? 'Admin' : currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isAdmin && <AdminPanel />}
        {isStudent && <StudentDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;