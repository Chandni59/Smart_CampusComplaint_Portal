import axios from 'axios';

// 🔥 Your actual live Azure Backend URL
const BASE_URL = 'https://campus-backend-csf7ffbzg7eedcfm.centralindia-01.azurewebsites.net/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ─────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // Returns { user, token } from your Azure SQL
  } catch (error) {
    const message = error.response?.data || "Login failed";
    throw new Error(message);
  }
};

export const registerUser = async (name, email, password, role) => {
  try {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  } catch (error) {
    const message = error.response?.data || "Registration failed";
    throw new Error(message);
  }
};

// ── Complaints ───────────────────────────────────────────────────
export const submitComplaint = async (data) => {
  try {
    const res = await api.post('/complaints', data);
    return res.data;
  } catch (error) {
    throw new Error("Failed to submit complaint to database");
  }
};

export const getComplaints = async (userId = null) => {
  try {
    const url = userId ? `/complaints?userId=${userId}` : '/complaints';
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    throw new Error("Could not fetch complaints from database");
  }
};

export const updateComplaintStatus = async (id, status) => {
  try {
    const res = await api.put(`/complaints/${id}`, { status });
    return res.data;
  } catch (error) {
    throw new Error("Failed to update status");
  }
};