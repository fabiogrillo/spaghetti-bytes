// client/src/Api.js
import axios from "axios";

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // In production, use the same domain with /api prefix
  if (process.env.NODE_ENV === 'production') {
    // This will use the same domain as the frontend
    return '/api';
  }

  // In development, use the proxy or direct localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,  // Important for cookies/session
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('With baseURL:', config.baseURL);
    console.log('Full URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);

      if (error.response.status === 401) {
        // Handle unauthorized access
        console.log('Unauthorized access - user may need to login');
        // You might want to redirect to login page here
        // window.location.href = '/login';
      } else if (error.response.status === 500) {
        console.error('Server error - check server logs');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      console.error('This could be a network error or CORS issue');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

// Login function
export const doLogin = async (email, password) => {
  try {
    const response = await api.post("/login", { email, password });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Logout function
export const doLogout = async () => {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Health check function
export const checkHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;