import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
}

// Enhanced protected route component with role-based access
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, isAdmin, isStudent, loading } = useAuth();
    
    console.log("Protected Route - currentUser:", currentUser);
    console.log("Protected Route - isAdmin:", isAdmin);
    console.log("Protected Route - isStudent:", isStudent);
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    // Allow either admin or student access (both are authenticated users)
    if (!currentUser && !isAdmin && !isStudent) {
      console.log("Not authenticated, redirecting to login");
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

export default ProtectedRoute;