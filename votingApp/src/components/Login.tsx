import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'none' | 'admin' | 'student'>('none');
  
  const { loginAdmin, loginStudent, loginWithGoogle, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();

  // Handler for admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await loginAdmin(email, password);
      // The isAdmin state should be updated in AuthContext
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for student login via Firebase popup
  const handleStudentLogin = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Student login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to admin login form
  const showAdminLogin = () => {
    setLoginMode('admin');
    setError('');
  };

  // Switch to student login (which triggers Firebase popup)
  const showStudentLogin = () => {
    setLoginMode('student');
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Login
          </h2>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loginMode === 'none' && (
          <div className="flex flex-col space-y-4 mt-8">
            <button 
              onClick={showAdminLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-medium"
            >
              Login as Admin
            </button>
            <button 
              onClick={showStudentLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded font-medium"
            >
              Login as Student
            </button>
          </div>
        )}

        {loginMode === 'admin' && (
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-medium disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <button 
                type="button" 
                onClick={() => setLoginMode('none')} 
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded font-medium"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {loginMode === 'student' && (
          <div className="mt-8 space-y-6">
            <p className="text-center text-gray-700">
              Sign in with your student email (@student.mes.ac.in).
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={handleStudentLogin} 
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded font-medium disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Continue with Google'}
              </button>
              <button 
                onClick={() => setLoginMode('none')} 
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 p-3 rounded font-medium"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;