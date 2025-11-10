import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('AuthContext mount - checking localStorage:', { token: !!token, userData: !!userData });

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user from localStorage:', parsedUser);
        // Verify token is not expired (basic check)
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (tokenData.exp > currentTime) {
          // Ensure user has role
          const userWithRole = {
            ...parsedUser,
            role: parsedUser?.role || 'admin'
          };
          setUser(userWithRole);
          console.log('Token valid, user set:', userWithRole);
        } else {
          // Token expired
          console.log('Token expired');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);

      // Verify OTP and login
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, user: userData } = data;

      console.log('Login response - userData:', userData);
      console.log('User role:', userData?.role);

      // Ensure user has role (fallback to admin if not provided)
      const userWithRole = {
        ...userData,
        role: userData?.role || 'admin'
      };

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithRole));

      setUser(userWithRole);

      console.log('After setUser - user data stored:', {
        user: userWithRole,
        isAdmin: userWithRole?.role === 'admin'
      });

      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  }, [navigate, location]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
