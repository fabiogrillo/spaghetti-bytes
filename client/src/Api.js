import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const doLogin = async (email, password) => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Importante per inviare i cookie di sessione
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
  } catch (error) {
    throw error;
  }
};

export const doLogout = async () => {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Logout failed");
    }
  } catch (error) {
    throw error;
  }
};

export default api;