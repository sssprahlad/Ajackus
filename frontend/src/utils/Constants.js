import axios from "axios";

export const API_BASE_URL =
  "https://ajackus-abuh.onrender.com" || "http://localhost:8080";

export const LOGIN_API = `${API_BASE_URL}/login`;
export const REGISTER_API = `${API_BASE_URL}/register`;
export const ADD_USER_API = `${API_BASE_URL}/manageUser`;
export const GET_ALL_USERS_API = `${API_BASE_URL}/manageUser`;
export const GET_USER_API = `${API_BASE_URL}/manageUser`;
export const UPDATE_USER_API = `${API_BASE_URL}/manageUser`;
export const DELETE_USER_API = `${API_BASE_URL}/manageUser`;
export const SEARCH_API = `${API_BASE_URL}/searchQuery`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",

    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
