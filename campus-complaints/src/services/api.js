import axios from 'axios';

const BASE_URL = 'https://campus-backend-csf7ffbzg7eedcfm.centralindia-01.azurewebsites.net/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const loginUser = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const registerUser = async (name, email, password, role) => {
  const res = await api.post('/auth/register', { name, email, password, role });
  return res.data;
};

export const submitComplaint = async (data) => {
  const res = await api.post('/complaints', data);
  return res.data;
};

export const getComplaints = async (userId = null) => {
  const url = userId ? `/complaints?userId=${userId}` : '/complaints';
  const res = await api.get(url);
  return res.data;
};

export const updateComplaintStatus = async (id, status) => {
  const res = await api.put(`/complaints/${id}`, { status });
  return res.data;
};

export const sendChatMessage = async (message, history, userId) => {
  const res = await api.post('/chat', { message, history, userId });
  return res.data;
};