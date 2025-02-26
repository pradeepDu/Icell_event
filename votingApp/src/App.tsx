import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Unauthorized from './pages/Unauthorized';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';
import ProtectedRoute from './pages/ProtectedRoute';

// Set axios defaults
axios.defaults.baseURL = `${import.meta.env.VITE_BACKEND_URL}`;

// NavBar component extracted to avoid using hooks outside of AuthProvider
const NavBar = () => {
  const { currentUser, isAdmin, isStudent, logout } = useAuth();
  
  if (!currentUser) return null;
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Innovation Cell PCE
        </Link>
        <div className="flex items-center space-x-4">
          {isAdmin && <Link to="/admin" className="hover:text-gray-300">Admin Dashboard</Link>}
          {isStudent && <Link to="/student" className="hover:text-gray-300">Student Dashboard</Link>}
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

// Separate component to use hooks within AuthProvider
const AppContent: React.FC = () => {
  return (
    <>
      <NavBar />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

// Import useAuth here to use in the NavBar component
import { useAuth } from './context/AuthContext';

export default App;