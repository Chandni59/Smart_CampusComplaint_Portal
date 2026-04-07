import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints, updateComplaintStatus } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = [
  'WiFi',
  'Hostel',
  'Equipment',
  'Library',
  'Electricity',
  'Water',
  'Cleanliness'
];

const STATUSES = ['Submitted', 'In Progress', 'Resolved'];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [catFilter, setCatFilter] = useState('All');
  const [statFilter, setStatFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [updating, setUpdating] = useState(null);

  // 🔥 LOAD DATA
  useEffect(() => {
    (async () => {
      try {
        const data = await getComplaints();
        console.log("DATA:", data); // DEBUG
        setComplaints(data);
      } catch {
        alert("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔥 STATUS UPDATE
  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);

    try {
      await updateComplaintStatus(id, newStatus);

      setComplaints(prev =>
        prev.map(c => {
          if (c.id !== id) return c;

          const now = new Date().toISOString();

          return {
            ...c,
            status: newStatus,
            updatedAt:
              newStatus === "In Progress" || newStatus === "Resolved"
                ? now
                : c.updatedAt,
            resolvedAt:
              newStatus === "Resolved"
                ? now
                : c.resolvedAt
          };
        })
      );

    } catch (err) {
      alert("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  // 🔥 FINAL FILTER (BULLETPROOF)
  const filtered = complaints.filter(c => {
    const cat = catFilter === 'All' || c.category === catFilter;
    const stat = statFilter === 'All' || c.status === statFilter;

    // 🔥 FORCE STRING + CLEAN
    const priorityValue = String(c.priority || 'Low')
      .trim()
      .toLowerCase();

    const selectedPriority = priorityFilter.toLowerCase();

    const prio =
      priorityFilter === 'All' ||
      priorityValue.includes(selectedPriority);

    return cat && stat && prio;
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page-content wide page-animate">

      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      {/* 🔥 FILTERS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>

        <select onChange={(e) => setCatFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <select onChange={(e) => setStatFilter(e.target.value)}>
          <option value="All">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <select onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

      </div>

      {/* 🔥 TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Location</th>
              <th>Date</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/complaint/${c.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{i + 1}</td>

                <td>
                  <div>{c.title}</div>
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>
                    {c.description}
                  </div>
                </td>

                <td>{c.category}</td>

                {/* 🔥 PRIORITY */}
                <td>
                  <span className={`priority-badge ${String(c.priority || 'Low').trim()}`}>
                    {String(c.priority || 'Low').trim()}
                  </span>
                </td>

                <td>{c.location}</td>

                <td>{new Date(c.date).toLocaleString()}</td>

                <td>
                  <StatusBadge status={c.status} />
                </td>

                {/* 🔥 UPDATE */}
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    value={c.status}
                    disabled={updating === c.id}
                    onChange={(e) =>
                      handleStatusChange(c.id, e.target.value)
                    }
                  >
                    {STATUSES.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminDashboard;