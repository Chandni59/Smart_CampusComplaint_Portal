import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { updateComplaintStatus } from '../services/api';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`https://campus-backend-csf7ffbzg7eedcfm.centralindia-01.azurewebsites.net/api/complaints`);
        const data = await res.json();
        // Match the ID exactly from the database
        const found = data.find(c => c.id == id);
        setComplaint(found);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchDetails();
  }, [id]);

  const handleUpdate = async () => {
    if (!newStatus) return;
    await updateComplaintStatus(complaint.id, newStatus);
    setComplaint({ ...complaint, status: newStatus, updatedAt: new Date().toISOString() });
    setNewStatus("");
    alert("Status Updated ✅");
  };

  if (!complaint) return <div className="page-content">⏳ Loading precise details...</div>;

  return (
    <div className="page-content">
      <div className="details-card">
        <h1>{complaint.title}</h1>
        <div className="status-row">
          <span className="status-badge">{complaint.status}</span>
          <span className={`priority-badge ${complaint.priority}`}>{complaint.priority}</span>
        </div>

        {user?.role === 'admin' && (
          <div className="admin-actions">
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="">Change Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <button onClick={handleUpdate}>Update</button>
          </div>
        )}

        <div className="details-body">
          <p><strong>Description:</strong> {complaint.description}</p>
          <p><strong>Location:</strong> {complaint.location}</p>
          {complaint.imageUrl && <img src={complaint.imageUrl} alt="evidence" className="complaint-img" />}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;