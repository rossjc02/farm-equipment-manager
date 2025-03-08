import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { username: string; password: string }) => Promise<void>;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('Using API URL:', API_BASE_URL); // Debug log

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url); // Debug log
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error); // Debug log
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error details:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response,
    });
    return Promise.reject(error);
  }
);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }): React.ReactElement => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/profile')
        .then(response => {
          setIsAuthenticated(true);
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  const handleAuthError = (error: unknown) => {
    if (error instanceof AxiosError) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      if (error.response?.status === 409) {
        throw new Error('Username already exists');
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to the server. Please check if the server is running.');
      }
      throw new Error(`Server error: ${error.message}`);
    }
    throw new Error('An unexpected error occurred. Please try again.');
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login with:', { username }); // Debug log
      const response = await api.post('/auth/login', {
        email: username,
        password,
      });
      console.log('Login response:', response.data); // Debug log
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(user);
    } catch (error) {
      console.error('Login error full details:', error); // Debug log
      handleAuthError(error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (userData: { username: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(user);
    } catch (error) {
      handleAuthError(error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}; 