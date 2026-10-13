import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "/api/admin";

const statItems = [
  { key: "totalUsers", label: "Total Users" },
  { key: "totalProviders", label: "Providers" },
  { key: "totalClients", label: "Clients" },
  { key: "totalServices", label: "Services" },
  { key: "totalPortfolios", label: "Portfolio Projects" },
  { key: "totalRequests", label: "Service Requests" },
  { key: "pendingRequests", label: "Pending Requests" },
  { key: "totalReviews", label: "Reviews" },
  { key: "pendingVerifications", label: "Pending Verifications" },
];

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchDashboard = useCallback(async () => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const headers = { Authorization: `Bearer ${token}` };
      const [statsResponse, usersResponse, verificationResponse, settlementResponse] = await Promise.all([
        fetch(`${API_URL}/stats`, { headers }),
        fetch(`${API_URL}/users`, { headers }),
        fetch(`${API_URL}/verifications/pending`, { headers }),
        fetch(`${API_URL}/settlements`, { headers }),
      ]);
      const [statsData, usersData, verificationData, settlementData] = await Promise.all([
        statsResponse.json(), usersResponse.json(), verificationResponse.json(), settlementResponse.json(),
      ]);

      if (!statsResponse.ok) throw new Error(statsData.message || "Failed to load dashboard statistics.");
      if (!usersResponse.ok) throw new Error(usersData.message || "Failed to load user accounts.");
      if (!verificationResponse.ok) throw new Error(verificationData.message || "Failed to load verification requests.");
      if (!settlementResponse.ok) throw new Error(settlementData.message || "Failed to load settlement requests.");

      setStats(statsData.stats);
      setUsers(Array.isArray(usersData.users) ? usersData.users : []);
      setVerifications(Array.isArray(verificationData.providers) ? verificationData.providers : []);
      setSettlements(Array.isArray(settlementData.settlements) ? settlementData.settlements : []);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const reviewVerification = async (provider, status) => {
    let notes = "";
    if (status === "rejected") {
      const enteredNotes = window.prompt("Enter the review notes for the provider:", "");
      if (enteredNotes === null) return;
      notes = enteredNotes;
    }

    setActionLoading(provider._id);
    setError("");
    setActionMessage("");
    try {
      const response = await fetch(`${API_URL}/users/${provider._id}/verification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update verification status.");
      setActionMessage(data.message || "Verification status updated.");
      await fetchDashboard();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setActionLoading("");
    }
  };


  const processSettlement = async (settlement, status) => {
    let transferReference = "";
    let adminNotes = "";
    if (status === "paid") {
      const enteredReference = window.prompt("Enter the bank transfer reference after sending the provider payment:", "");
      if (!enteredReference || !enteredReference.trim()) return;
      transferReference = enteredReference.trim();
    } else {
      const enteredNotes = window.prompt("Enter the reason for rejecting this settlement request:", "");
      if (enteredNotes === null) return;
      adminNotes = enteredNotes;
    }
    setActionLoading(settlement._id); setError(""); setActionMessage("");
    try {
      const response = await fetch(`${API_URL}/settlements/${settlement._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, transferReference, adminNotes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update settlement.");
      setActionMessage(data.message || "Settlement updated.");
      await fetchDashboard();
    } catch (err) { setError(err.message || "An unexpected error occurred."); }
    finally { setActionLoading(""); }
  };

  if (loading) return <main className="section"><div className="empty-state"><h1>Admin Dashboard</h1><p>Loading dashboard...</p></div></main>;

  return (
    <main className="section">
      <div className="dashboard-header admin-page-header">
        <div><p className="small-label">PLATFORM MANAGEMENT</p><h1>Admin Dashboard</h1><p>Monitor platform activity and review provider verification submissions.</p></div>
        <button type="button" className="primary-btn" onClick={fetchDashboard}>Refresh Dashboard</button>
      </div>

      {error && <div role="alert" className="error-message admin-alert">{error}</div>}
      {actionMessage && <div role="status" className="success-message admin-alert">{actionMessage}</div>}

      {stats && <section className="admin-stats-grid" aria-label="Platform statistics">{statItems.map((item) => <article className="admin-stat-card" key={item.key}><p>{item.label}</p><h2>{stats[item.key] ?? 0}</h2></article>)}</section>}

      <section className="admin-section-block">
        <div className="section-heading"><div><p className="small-label">REVIEW QUEUE</p><h2>Provider Verification Requests</h2><p>Review submitted registration details before changing a provider's platform status.</p></div></div>
        {verifications.length === 0 ? <div className="empty-state"><h3>No Pending Verification Requests</h3><p>New provider submissions will appear here.</p></div> : <div className="verification-review-grid">{verifications.map((provider) => <article className="verification-review-card" key={provider._id}><div className="verification-review-header"><div><h3>{provider.name}</h3><p>{provider.email}</p></div><span className="status-pill status-pending">Pending Review</span></div><dl><div><dt>City</dt><dd>{provider.city || "Not provided"}</dd></div><div><dt>Authority</dt><dd>{provider.verificationAuthority || "Not provided"}</dd></div><div><dt>Registration Number</dt><dd>{provider.registrationNumber || "Not provided"}</dd></div></dl><p className="verification-disclaimer">Confirm submitted details before approving. This action records an ArchLink review, not a live government database check.</p><div className="dashboard-actions"><button type="button" className="primary-btn" disabled={actionLoading === provider._id} onClick={() => reviewVerification(provider, "approved")}>{actionLoading === provider._id ? "Updating..." : "Approve"}</button><button type="button" className="danger-btn" disabled={actionLoading === provider._id} onClick={() => reviewVerification(provider, "rejected")}>Request Changes</button></div></article>)}</div>}
      </section>

      <section className="admin-section-block">
        <div className="section-heading"><div><p className="small-label">PAYMENT OPERATIONS</p><h2>Provider Settlements</h2><p>Record settlements only after the provider has actually been paid outside the app.</p></div></div>
        {settlements.length === 0 ? <div className="empty-state"><p>No settlement requests found.</p></div> : <div className="verification-review-grid">{settlements.map((item) => <article className="verification-review-card" key={item._id}><div className="verification-review-header"><div><h3>{item.provider?.name || "Provider"}</h3><p>{item.provider?.email || ""}</p></div><span className={`status-pill ${item.status === "paid" ? "status-completed" : item.status === "rejected" ? "status-rejected" : "status-pending"}`}>{item.status}</span></div><dl><div><dt>Requested Amount</dt><dd>Rs. {Number(item.amount || 0).toLocaleString()}</dd></div><div><dt>Service Request</dt><dd>{item.serviceRequest?._id || "—"}</dd></div><div><dt>Transfer Reference</dt><dd>{item.transferReference || "Not recorded"}</dd></div></dl>{item.status === "requested" && <div className="dashboard-actions"><button type="button" className="primary-btn" disabled={actionLoading === item._id} onClick={() => processSettlement(item, "paid")}>Record Paid</button><button type="button" className="danger-btn" disabled={actionLoading === item._id} onClick={() => processSettlement(item, "rejected")}>Reject</button></div>}</article>)}</div>}
      </section>

      <section className="admin-section-block">
        <div className="section-heading"><div><p className="small-label">ACCOUNT DIRECTORY</p><h2>Registered Users</h2><p>Showing up to 100 recently registered accounts.</p></div></div>
        {users.length === 0 ? <div className="empty-state"><p>No user accounts found.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>City</th><th>Role</th><th>Verification</th><th>Registered</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td>{user.name || "—"}</td><td>{user.email || "—"}</td><td>{user.city || "—"}</td><td><span className="role-pill">{user.role || "—"}</span></td><td>{user.role === "provider" ? (user.verificationStatus || "not_submitted") : "Not applicable"}</td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>}
      </section>
    </main>
  );
}

export default AdminDashboard;
