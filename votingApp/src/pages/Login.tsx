import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'student'>('student');
  
  const { loginAdmin, loginWithGoogle, isAdmin, isStudent, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Effect to handle redirects after successful login
  useEffect(() => {
    if (currentUser) {
      console.log("User is logged in:", currentUser);
      console.log("Is admin:", isAdmin, "Is student:", isStudent);
      
      if (isAdmin) {
        console.log("Redirecting to admin dashboard");
        navigate('/admin');
      } else if (isStudent) {
        console.log("Redirecting to student dashboard");
        navigate('/student');
      }
    }
  }, [currentUser, isAdmin, isStudent, navigate]);
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      console.log("Attempting admin login");
      await loginAdmin(email, password);
      console.log("Admin login successful, admin status:", isAdmin);
    } catch (error) {
      console.error("Login error:", error);
      setError('Failed to sign in: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (error) {
      setError('Failed to sign in with Google: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Innovation Cell Election System</h2>
        
        {/* Login Type Toggle */}
        <div className="flex mb-6 border rounded-md overflow-hidden">
          <button
            onClick={() => setLoginType('student')}
            className={`flex-1 py-2 text-center ${
              loginType === 'student' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Student Login
          </button>
          <button
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-2 text-center ${
              loginType === 'admin' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Admin Login
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loginType === 'admin' ? (
          <form onSubmit={handleAdminLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In as Admin'}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-gray-600 mb-6 text-center">
              Please use your MES student email (@student.mes.ac.in) to login
            </p>
            
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center hover:bg-gray-50 transition duration-300 disabled:opacity-50"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="mr-2">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              {loading ? 'Signing In...' : 'Sign In with Google'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;