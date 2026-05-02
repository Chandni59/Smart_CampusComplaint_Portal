import React from 'react'
import ComplaintDetails from './pages/ComplaintDetails';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SubmitComplaint from './pages/SubmitComplaint'
import MyComplaints from './pages/MyComplaints'
import AdminDashboard from './pages/AdminDashboard'
import Chatbot from './components/Chatbot'

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role)
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

const Layout = () => {
  const { user } = useAuth()
  return (
    <div className="app-shell">
      {user && <Navbar />}
      <Routes>
        <Route path="/"              element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"      element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard"     element={<PrivateRoute role="student"><Dashboard /></PrivateRoute>} />
        <Route path="/submit"        element={<PrivateRoute role="student"><SubmitComplaint /></PrivateRoute>} />
        <Route path="/my-complaints" element={<PrivateRoute role="student"><MyComplaints /></PrivateRoute>} />
        <Route path="/admin"         element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/complaint/:id" element={<ComplaintDetails />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
        
      </Routes>
      <Chatbot />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}
