import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint } from '../services/api';
import { useAuth } from '../components/AuthContext';

const CATEGORIES = ['WiFi', 'Hostel', 'Equipment', 'Library', 'Electricity', 'Water', 'Cleanliness'];

const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'WiFi',
    priority: '',
    location: ''
  });

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => {
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

  // 🔥 ANALYZE FUNCTION
  const analyzeText = async (text) => {
    if (!text) return;

    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ description: text })
      });

      const data = await res.json();

      console.log("API RESULT:", data);

      // 🔥 update only category & priority safely
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

      // 🔥 Upload file
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        imageUrl = data.url;
      }

      // 🔥 Save complaint
      await submitComplaint({
        ...form,
        userId: user?.id,
        imageUrl
      });

      setSuccess('Complaint submitted successfully!');

      setForm({
        title: '',
        description: '',
        category: 'WiFi',
        priority: '',
        location: ''
      });

      setFile(null);
      setFileName('');

      setTimeout(() => navigate('/my-complaints'), 1500);

    } catch (err) {
      setError(err.message || 'Failed to submit.');
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
              onChange={handle}
              placeholder="Enter issue title"
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

                // update description
                setForm(prev => ({
                  ...prev,
                  description: text
                }));

                // 🔥 analyze live
                analyzeText(text);
              }}
              placeholder="Describe the issue clearly..."
            />
          </div>

          {/* CATEGORY + PRIORITY */}
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <input
                value={form.priority}
                readOnly
                placeholder="Auto-detected"
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
              onChange={handle}
              placeholder="Block / Room"
            />
          </div>

          {/* FILE UPLOAD */}
          <div className="form-group">
            <label>Attach Image</label>

            <label className="upload-box">
              <input type="file" onChange={handleFile} hidden />
              <div className="upload-content">
                📎 Click to upload image
              </div>
            </label>

            {fileName && <p className="file-name">✅ {fileName}</p>}
          </div>

          {/* SUBMIT */}
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "🚀 Submit Complaint"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;