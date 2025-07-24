import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Google One Tap Login Hook (called at component level)
  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => {
      handleGoogleLogin(credentialResponse);
    },
    onError: () => {
      toast.error('Google Login Failed');
    },
  });

  // Handle Google Login (both regular and one-tap)
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      
      // Decode the JWT token from Google
      const user = jwtDecode(credentialResponse.credential);
      console.log('Google user info:', user);
      
      // Send to your backend
      const res = await fetch(`${API_BASE_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokenId: credentialResponse.credential,
          // or credential: credentialResponse.credential for newer versions
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      // Store token and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
      toast.success('Google login successful!');

    } catch (error) {
      console.error('Google login error:', error);
      toast.error(`Google login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  // Regular login handler
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      navigate('/dashboard');
      toast.success('Login successful!');
      console.log('Login response:', data);

    } catch (error) {
      console.error('Login error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Student Task Manager
            </h1>
          </div>

          {/* Login Form Container */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">SIGN IN</h2>
              <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-6">
              {/* Email Input Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Password Input Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="mt-6 mb-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Login Button - Fixed centering */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.log('Login Failed');
                }}
                size="large"
                width="100%"
                theme="outline"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-2">Don't have account?</p>
              <button 
                onClick={() => navigate('/register')}
                className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Register here
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-blue-100 text-sm">
            Manage your academic tasks efficiently
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;