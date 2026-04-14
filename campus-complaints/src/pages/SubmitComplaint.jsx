import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint } from '../services/api';
import { useAuth } from '../components/AuthContext';

const CATEGORIES = ['WiFi', 'Hostel', 'Equipment', 'Library', 'Electricity', 'Water', 'Cleanliness', 'Other'];

const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔥 State for the form
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other', // Default to Other
    priority: 'Low',   // Default to Low
    location: ''
  });

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Your real Azure Backend URL
  const BACKEND_BASE = "https://campus-backend-csf7ffbzg7eedcfm.centralindia-01.azurewebsites.net";

  const handleInput = e => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setFileName(f.name);
    }
  };

  // 🔥 AI ANALYZE FUNCTION
  const analyzeText = async (text) => {
    if (text.length < 5) return; // Don't call API for very short text

    try {
      const res = await fetch(`${BACKEND_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text })
      });

      if (!res.ok) throw new Error("AI Analysis failed");
      
      const data = await res.json();

      // Automatically update the UI with detected category/priority
      setForm(prev => ({
        ...prev,
        category: data.category,
        priority: data.priority
      }));

    } catch (err) {
      console.error("Analyze error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim()) return setError('Title is required');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.location.trim()) return setError('Location is required');

    setLoading(true);

    try {
      let imageUrl = null;

      // 1. 🔥 Handle Image Upload if file exists
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`${BACKEND_BASE}/api/upload`, {
          method: "POST",
          body: formData
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // 2. 🔥 Submit Complaint to SQL Database
      await submitComplaint({
        ...form,
        userId: user?.id,
        imageUrl: imageUrl
      });

      setSuccess('Complaint submitted successfully! Redirecting...');
      
      // Clear form
      setForm({ title: '', description: '', category: 'Other', priority: 'Low', location: '' });
      setFile(null);
      setFileName('');

      setTimeout(() => navigate('/my-complaints'), 2000);

    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content page-animate">
      <div className="page-header">
        <h1>Submit a Complaint</h1>
        <p>Report a campus issue and we'll address it promptly</p>
      </div>

      <div className="form-card modern-form">
        {error && <div className="alert error">⚠️ {error}</div>}
        {success && <div className="alert success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <div className="form-group">
            <label>Complaint Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInput}
              placeholder="E.g., WiFi disconnected in Block B"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => {
                const text = e.target.value;
                setForm(prev => ({ ...prev, description: text }));
                analyzeText(text); // Call AI analysis live
              }}
              placeholder="Describe the issue clearly. Our AI will detect category and priority."
              required
            />
          </div>

          {/* CATEGORY + PRIORITY */}
          <div className="form-row">
            <div className="form-group">
              <label>Detected Category</label>
              <select name="category" value={form.category} onChange={handleInput}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Priority Level</label>
              <input
                value={form.priority}
                readOnly
                className={`priority-input ${form.priority}`}
                style={{ 
                    fontWeight: 'bold', 
                    color: form.priority === 'High' ? '#ef4444' : (form.priority === 'Medium' ? '#f59e0b' : '#10b981') 
                }}
              />
            </div>
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleInput}
              placeholder="Block / Room / Department"
              required
            />
          </div>

          {/* FILE UPLOAD */}
          <div className="form-group">
            <label>Attach Evidence (Image)</label>
            <label className="upload-box">
              <input type="file" accept="image/*" onChange={handleFile} hidden />
              <div className="upload-content">
                {fileName ? `✅ ${fileName}` : "📎 Click to upload a photo"}
              </div>
            </label>
          </div>

          {/* SUBMIT */}
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Processing..." : "🚀 Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;