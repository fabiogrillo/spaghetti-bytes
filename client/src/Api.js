import axios from "axios";

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? '/api'  // In production, use relative path
    : 'http://localhost:5000/api',  // In development, use full URL
  withCredentials: true,  // Important for cookies/session
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - redirecting to login');
      // You might want to redirect to login page here
      // window.location.href = '/login';
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

export default api;