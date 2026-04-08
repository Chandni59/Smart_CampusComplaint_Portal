import axios from 'axios';

const BASE_URL = 'https://campus-backend-csf7ffbzg7eedcfm.centralindia-01.azurewebsites.net';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Dummy in-memory data ─────────────────────────────────────────
const DUMMY_USERS = [
  { id: 1, name: 'Alex Johnson', email: 'student@campus.edu', password: 'student123', role: 'student' },
  { id: 2, name: 'Dr. Sarah Admin', email: 'admin@campus.edu', password: 'admin123', role: 'admin' },
];

let DUMMY_COMPLAINTS = [
  { id: 1, userId: 1, title: 'Wi-Fi not working in Block C', description: 'Internet has been down since Monday morning. Students cannot access online resources or submit assignments.', category: 'WiFi', location: 'Block C, Floor 2', status: 'In Progress', date: '2024-03-10', imageUrl: null },
  { id: 2, userId: 1, title: 'Broken projector in CS Lab 3', description: 'The projector bulb is blown out. Lectures cannot be conducted properly without it.', category: 'Equipment', location: 'CS Lab 3', status: 'Submitted', date: '2024-03-12', imageUrl: null },
  { id: 3, userId: 1, title: 'Hostel water supply issue', description: 'No hot water available in the morning between 6–8 AM. This is affecting all residents in Hostel B.', category: 'Hostel', location: 'Hostel B', status: 'Resolved', date: '2024-03-08', imageUrl: null },
  { id: 4, userId: 1, title: 'Library AC not functioning', description: 'Air conditioning system is broken in the main reading hall. Very uncomfortable during peak hours.', category: 'Library', location: 'Main Library', status: 'In Progress', date: '2024-03-14', imageUrl: null },
  { id: 5, userId: 2, title: 'Parking lot lights out', description: 'Street lights in Parking Area D are not working after 7 PM. Safety concern for evening students.', category: 'Equipment', location: 'Parking D', status: 'Submitted', date: '2024-03-15', imageUrl: null },
  { id: 6, userId: 2, title: 'Cafeteria Wi-Fi dead zone', description: 'No Wi-Fi signal in the entire cafeteria area. Students cannot work during lunch breaks.', category: 'WiFi', location: 'Cafeteria Block', status: 'Resolved', date: '2024-03-05', imageUrl: null },
];

let nextId = 7;
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// ── Auth ─────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    console.log('[API] Login response:', res.data);
    return res.data;
  } catch {
    console.warn('[API] Backend unavailable — using dummy data');
    await delay(600);
    const user = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token: `dummy-token-${user.id}` };
  }
};

export const registerUser = async (name, email, password, role) => {
  try {
    const res = await api.post('/auth/register', { name, email, password, role });
    console.log('[API] Register response:', res.data);
    return res.data;
  } catch {
    console.warn('[API] Backend unavailable — using dummy data');
    await delay(600);
    if (DUMMY_USERS.find(u => u.email === email)) throw new Error('A user with this email already exists');
    DUMMY_USERS.push({ id: DUMMY_USERS.length + 1, name, email, password, role });
    return { message: 'Registration successful' };
  }
};

// ── Complaints ───────────────────────────────────────────────────
export const submitComplaint = async (data) => {
  try {
    const res = await api.post('/complaints', data);
    console.log('[API] Submit complaint response:', res.data);
    return res.data;
  } catch {
    console.warn('[API] Backend unavailable — using dummy data');
    await delay(700);
    const c = {
      id: nextId++,
      userId: data.userId || 1,
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      status: 'Submitted',
      date: new Date().toISOString().split('T')[0],
      imageUrl: data.imageUrl || null,
    };
    DUMMY_COMPLAINTS.push(c);
    return c;
  }
};

export const getComplaints = async (userId = null) => {
  try {
    const url = userId ? `/complaints?userId=${userId}` : '/complaints';
    const res = await api.get(url);
    console.log('[API] Get complaints response:', res.data);
    return res.data;
  } catch {
    console.warn('[API] Backend unavailable — using dummy data');
    await delay(500);
    return userId ? DUMMY_COMPLAINTS.filter(c => c.userId === userId) : [...DUMMY_COMPLAINTS];
  }
};

export const updateComplaintStatus = async (id, status) => {
  try {
    const res = await api.put(`/complaints/${id}`, { status });
    console.log('[API] Update status response:', res.data);
    return res.data;
  } catch {
    console.warn('[API] Backend unavailable — using dummy data');
    await delay(400);
    const c = DUMMY_COMPLAINTS.find(c => c.id === id);
    if (!c) throw new Error('Complaint not found');
    c.status = status;
    return { ...c };
  }
};
