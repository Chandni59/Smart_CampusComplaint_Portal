import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // 🔥 FETCH COMPLAINT - Corrected Endpoint to /api/complaints
  useEffect(() => {
    fetch("https://campus-backend-csf7ffbzg7eedcfm.centralindia-01.azurewebsites.net/api/complaints")
      .then(res => res.json())
      .then(data => {
        // Find the specific complaint by ID
        const found = data.find(c => c.id == id);
        setComplaint(found);
      })
      .catch(err => console.error("Error fetching complaint:", err));
  }, [id]);

  // 🔥 UPDATE STATUS - Corrected Endpoint
  const updateStatus = async () => {
    if (!newStatus) return alert("Select status");

    try {
      const response = await fetch(`https://campus-backend-csf7ffbzg7eedcfm.centralindia-01.azurewebsites.net/api/complaints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error("Update failed");

      const now = new Date().toISOString();

      // Update UI locally so it reflects immediately
      setComplaint(prev => ({
        ...prev,
        status: newStatus,
        updatedAt: now,
        resolvedAt: newStatus === "Resolved" ? now : prev.resolvedAt
      }));

      setNewStatus("");
      alert("Status updated successfully! ✅");
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  if (!complaint) return (
    <div className="page-content">
      <div className="loading-spinner">⏳ Loading complaint details...</div>
    </div>
  );

  const statusColor =
    complaint.status === "Resolved" ? "#22c55e" :
    complaint.status === "In Progress" ? "#f59e0b" : "#6b7280";

  const isInProgress = complaint.status === "In Progress" || complaint.status === "Resolved";
  const isResolved = complaint.status === "Resolved";

  return (
    <div className="page-content">
      <div className="details-card">

        {/* HEADER */}
        <div className="details-header">
          <h1>{complaint.title}</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="status-badge" style={{ background: statusColor }}>
              {complaint.status}
            </span>
            <span className={`priority-badge ${complaint.priority || 'Low'}`}>
              {complaint.priority || 'Low'}
            </span>
          </div>
        </div>

        {/* ADMIN UPDATE SECTION */}
        {user?.role === "admin" && (
          <div className="admin-update-box">
            <h3>Update Status</h3>
            <div className="update-row">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Select status</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <button className="update-btn" onClick={updateStatus}>🚀 Update</button>
            </div>
          </div>
        )}

        {/* COMPLAINT INFO */}
        <div className="details-grid">
          <p><b>Description:</b> {complaint.description}</p>
          <p><b>Category:</b> {complaint.category}</p>
          <p><b>Location:</b> {complaint.location}</p>
        </div>

        {/* VISUAL TIMELINE */}
        <div className="timeline">
          <div className="step active">
            Submitted
            <small>{new Date(complaint.date).toLocaleString()}</small>
          </div>

          <div className={`step ${isInProgress ? "active" : ""}`}>
            In Progress
            <small>
              {complaint.updatedAt 
                ? new Date(complaint.updatedAt).toLocaleString() 
                : isInProgress ? "Started" : "Pending"}
            </small>
          </div>

          <div className={`step ${isResolved ? "active" : ""}`}>
            Resolved
            <small>
              {complaint.resolvedAt 
                ? new Date(complaint.resolvedAt).toLocaleString() 
                : isResolved ? "Completed" : "Pending"}
            </small>
          </div>
        </div>

        {/* IMAGE ATTACHMENT */}
        {complaint.imageUrl && (
          <div className="image-box">
            <h3>📸 Attached Image</h3>
            <img 
              src={complaint.imageUrl} 
              alt="complaint" 
              onError={(e) => e.target.style.display='none'} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetails;