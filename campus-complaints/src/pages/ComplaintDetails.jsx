import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // 🔥 FETCH COMPLAINT
  useEffect(() => {
    fetch("http://localhost:5000/api/complaints")
      .then(res => res.json())
      .then(data => {
        const found = data.find(c => c.id == id);
        setComplaint(found);
      });
  }, [id]);

  // 🔥 UPDATE STATUS (REAL-TIME FIX)
  const updateStatus = async () => {
    if (!newStatus) return alert("Select status");

    await fetch(`http://localhost:5000/api/complaints/${complaint.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    const now = new Date().toISOString();

    // 🔥 UPDATE UI WITHOUT RELOAD
    setComplaint(prev => ({
      ...prev,
      status: newStatus,
      updatedAt:
        newStatus === "In Progress" || newStatus === "Resolved"
          ? now
          : prev.updatedAt,
      resolvedAt:
        newStatus === "Resolved"
          ? now
          : prev.resolvedAt
    }));

    setNewStatus("");
  };

  if (!complaint) return <p>Loading...</p>;

  // 🔥 STATUS COLOR
  const statusColor =
    complaint.status === "Resolved" ? "#22c55e" :
    complaint.status === "In Progress" ? "#f59e0b" : "#6b7280";

  // 🔥 TIMELINE LOGIC
  const isInProgress =
    complaint.status === "In Progress" || complaint.status === "Resolved";

  const isResolved =
    complaint.status === "Resolved";

  return (
    <div className="page-content">
      <div className="details-card">

        {/* 🔥 HEADER */}
        <div className="details-header">
          <h1>{complaint.title}</h1>

          <div style={{ display: "flex", gap: "10px" }}>
            {/* STATUS */}
            <span className="status-badge" style={{ background: statusColor }}>
              {complaint.status}
            </span>

            {/* 🔥 PRIORITY */}
            <span className={`priority-badge ${complaint.priority || 'Low'}`}>
              {complaint.priority || 'Low'}
            </span>
          </div>
        </div>

        {/* 🔥 ADMIN UPDATE */}
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

              <button onClick={updateStatus}>🚀 Update</button>
            </div>
          </div>
        )}

        {/* 🔥 DETAILS */}
        <div className="details-grid">
          <p><b>Description:</b> {complaint.description}</p>
          <p><b>Category:</b> {complaint.category}</p>
          <p><b>Location:</b> {complaint.location}</p>
        </div>

        {/* 🔥 TIMELINE */}
        <div className="timeline">

          {/* Submitted */}
          <div className="step active">
            Submitted
            <small>{new Date(complaint.date).toLocaleString()}</small>
          </div>

          {/* In Progress */}
          <div className={`step ${isInProgress ? "active" : ""}`}>
            In Progress
            <small>
              {complaint.updatedAt
                ? new Date(complaint.updatedAt).toLocaleString()
                : isInProgress ? "Started" : "Pending"}
            </small>
          </div>

          {/* Resolved */}
          <div className={`step ${isResolved ? "active" : ""}`}>
            Resolved
            <small>
              {complaint.resolvedAt
                ? new Date(complaint.resolvedAt).toLocaleString()
                : isResolved ? "Completed" : "Pending"}
            </small>
          </div>

        </div>

        {/* 🔥 IMAGE */}
        {complaint.imageUrl && (
          <div className="image-box">
            <h3>📸 Attached Image</h3>
            <img src={complaint.imageUrl} alt="complaint" />
          </div>
        )}

      </div>
    </div>
  );
};

export default ComplaintDetails;