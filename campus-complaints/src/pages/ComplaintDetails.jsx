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
    <div className="details-card page-animate">
      <div className="details-card-inner">
        
        {/* --- HEADER --- */}
        <header className="details-header">
          <div className="header-top">
            <span className={`badge category`}>{complaint.category}</span>
            <div className={`priority-badge ${complaint.priority}`}>
              {complaint.priority} Priority
            </div>
          </div>
          <h1 className="details-title">{complaint.title}</h1>
          <p className="meta-info">Reported on {new Date(complaint.date).toLocaleDateString()} • ID: #{complaint.id}</p>
        </header>

        {/* --- DYNAMIC TIMELINE --- */}
        <div className="timeline">
          {[
            { label: "Submitted", icon: "📩" },
            { label: "In Progress", icon: "⚙️" },
            { label: "Resolved", icon: "✅" }
          ].map((step, index) => (
            <div key={index} className={`step ${getStatusStep() > index ? "active" : "pending"}`}>
              <div className="step-node">{step.icon}</div>
              <p>{step.label}</p>
              {index < 2 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        {/* --- MAIN CONTENT --- */}
        <main className="details-grid">
          <section className="text-section">
            <h3>Issue Description</h3>
            <p className="description-p">{complaint.description}</p>
            
            <div className="info-box">
              <p>📍 <strong>Location:</strong> {complaint.location}</p>
              <p>👤 <strong>Reporting Status:</strong> <span className={`status-badge ${complaint.status.toLowerCase().replace(' ', '-')}`}>{complaint.status}</span></p>
            </div>

            {user?.role === "admin" && (
              <div className="admin-update-box">
                <h4>Management Controls</h4>
                <div className="update-row">
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

          <section className="image-box">
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