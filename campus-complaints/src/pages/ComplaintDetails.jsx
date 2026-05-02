import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { updateComplaintStatus } from '../services/api';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`https://campus-backend-csf7ffbzg7eedcfm.centralindia-01.azurewebsites.net/api/complaints`);
        const data = await res.json();
        const found = data.find(c => c.id == id);
        setComplaint(found);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleUpdate = async () => {
    if (!newStatus) return alert("Select a status");
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      setComplaint(prev => ({ ...prev, status: newStatus }));
      setNewStatus("");
      alert("Status updated! ✅");
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading) return <div className="loading-state">⏳ Loading...</div>;
  if (!complaint) return <div className="error-state">Complaint not found.</div>;

  const getStatusStep = () => {
    if (complaint.status === "Resolved") return 3;
    if (complaint.status === "In Progress") return 2;
    return 1;
  };

  return (
    <div className="modern-details-wrapper page-animate">
      <div className="modern-container">
        
        {/* --- HEADER --- */}
        <header className="complaint-header">
          <div className="header-top">
            <span className={`cat-tag`}>{complaint.category}</span>
            <div className={`priority-pill ${complaint.priority}`}>
              {complaint.priority} Priority
            </div>
          </div>
          <h1>{complaint.title}</h1>
          <p className="meta-info">Reported on {new Date(complaint.date).toLocaleDateString()} • ID: #{complaint.id}</p>
        </header>

        {/* --- DYNAMIC TIMELINE --- */}
        <div className="stepper-wrapper">
          {[
            { label: "Submitted", icon: "📩" },
            { label: "In Progress", icon: "⚙️" },
            { label: "Resolved", icon: "✅" }
          ].map((step, index) => (
            <div key={index} className={`step-item ${getStatusStep() > index ? "active" : ""}`}>
              <div className="step-node">{step.icon}</div>
              <p>{step.label}</p>
              {index < 2 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        {/* --- MAIN CONTENT --- */}
        <main className="content-grid">
          <section className="text-section">
            <h3>Issue Description</h3>
            <p className="description-p">{complaint.description}</p>
            
            <div className="info-box">
              <span>📍 <strong>Location:</strong> {complaint.location}</span>
              <span>👤 <strong>Reporting Status:</strong> {complaint.status}</span>
            </div>

            {user?.role === "admin" && (
              <div className="admin-action-card">
                <h4>Management Controls</h4>
                <div className="action-row">
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="">Update Current Status</option>
                    <option value="In Progress">Move to In Progress</option>
                    <option value="Resolved">Mark as Resolved</option>
                  </select>
                  <button onClick={handleUpdate}>Update</button>
                </div>
              </div>
            )}
          </section>

          <section className="image-section">
            <h3>Evidence</h3>
            {complaint.imageUrl ? (
              <div className="image-frame">
                <img src={complaint.imageUrl} alt="Proof" />
              </div>
            ) : (
              <div className="no-image">No attachment provided</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ComplaintDetails;