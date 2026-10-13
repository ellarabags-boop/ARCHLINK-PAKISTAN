import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "/api/meetings";
const REQUESTS_URL = "/api/service-requests";

function Meetings() {
  const { token, user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [eligibleRequests, setEligibleRequests] = useState([]);
  const [serviceRequestId, setServiceRequestId] = useState("");
  const [proposedAt, setProposedAt] = useState("");
  const [mode, setMode] = useState("online");
  const [meetingDetails, setMeetingDetails] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Authentication required. Please log in.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const headers = { Authorization: `Bearer ${token}` };
      const meetingResponse = await fetch(`${API_URL}/mine`, { headers });
      const meetingData = await meetingResponse.json();
      if (!meetingResponse.ok) throw new Error(meetingData.message || "Failed to load meetings.");
      setMeetings(Array.isArray(meetingData) ? meetingData : []);

      if (user?.role === "client") {
        const requestResponse = await fetch(`${REQUESTS_URL}/client`, { headers });
        const requestData = await requestResponse.json();
        if (!requestResponse.ok) throw new Error(requestData.message || "Failed to load eligible service requests.");
        setEligibleRequests(Array.isArray(requestData) ? requestData.filter((item) => ["accepted", "completed"].includes(item.status)) : []);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitMeeting = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceRequestId, proposedAt, mode, meetingDetails, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit meeting request.");
      setNotice("Meeting request submitted successfully.");
      setServiceRequestId("");
      setProposedAt("");
      setMeetingDetails("");
      setMessage("");
      await loadData();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (meetingId, status) => {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/${meetingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update meeting request.");
      setNotice(data.message || "Meeting status updated.");
      await loadData();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const cancelMeeting = async (meetingId) => {
    if (!window.confirm("Cancel this pending meeting request?")) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/${meetingId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to cancel meeting request.");
      setNotice(data.message || "Meeting request cancelled.");
      await loadData();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const modeLabel = (value) => ({ online: "Online Meeting", public_place: "Public Place", provider_office: "Provider Office" }[value] || value);

  if (loading) return <main className="section"><div className="empty-state"><h1>Meeting Requests</h1><p>Loading meeting requests...</p></div></main>;

  return (
    <main className="section">
      <div className="page-intro"><p className="small-label">COORDINATE THE NEXT STEP</p><h1>Meeting Requests</h1><p>Propose and manage meetings related to accepted service requests. Keep initial coordination inside the platform.</p></div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {notice && <p className="success-message" role="status">{notice}</p>}

      {user?.role === "client" && <section className="form-card meeting-form-card">
        <h2>Request a Meeting</h2>
        <p className="form-help">Meeting requests are available for accepted or completed service requests.</p>
        {eligibleRequests.length === 0 ? <p>No eligible service requests are available yet.</p> : <form className="service-form" onSubmit={submitMeeting}>
          <label htmlFor="meeting-service-request">Service Request</label>
          <select id="meeting-service-request" value={serviceRequestId} onChange={(event) => setServiceRequestId(event.target.value)} required>
            <option value="">Select a service request</option>
            {eligibleRequests.map((request) => <option key={request._id} value={request._id}>{request.service?.title || "Service"} — {request.provider?.name || "Provider"} ({request.status})</option>)}
          </select>
          <label htmlFor="meeting-time">Proposed Date and Time</label>
          <input id="meeting-time" type="datetime-local" value={proposedAt} onChange={(event) => setProposedAt(event.target.value)} required />
          <label htmlFor="meeting-mode">Meeting Type</label>
          <select id="meeting-mode" value={mode} onChange={(event) => setMode(event.target.value)} required>
            <option value="online">Online Meeting</option>
            <option value="public_place">Public Place</option>
            <option value="provider_office">Provider Office</option>
          </select>
          <label htmlFor="meeting-details">Meeting Details</label>
          <input id="meeting-details" value={meetingDetails} onChange={(event) => setMeetingDetails(event.target.value)} maxLength={250} placeholder="Online platform or suggested public location" />
          <label htmlFor="meeting-message">Message (Optional)</label>
          <textarea id="meeting-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} rows={3} placeholder="Add a short agenda or context" />
          <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit Meeting Request"}</button>
        </form>}
      </section>}

      <section className="meetings-list-section">
        <div className="section-heading"><div><p className="small-label">YOUR MEETING ACTIVITY</p><h2>{user?.role === "provider" ? "Received Meeting Requests" : "My Meeting Requests"}</h2></div><button type="button" className="secondary-btn" onClick={loadData}>Refresh</button></div>
        {meetings.length === 0 ? <div className="empty-state"><h3>No Meeting Requests Yet</h3><p>New meeting proposals will appear here.</p></div> : <div className="meeting-card-list">{meetings.map((meeting) => {
          const service = meeting.serviceRequest?.service;
          const otherParty = user?.role === "provider" ? meeting.client : meeting.provider;
          return <article className="meeting-card" key={meeting._id}>
            <div className="meeting-card-top"><div><p className="small-label">{service?.category || "SERVICE MEETING"}</p><h3>{service?.title || "Service Request"}</h3><p>{user?.role === "provider" ? "Client" : "Provider"}: {otherParty?.name || "Account unavailable"}</p></div><span className={`status-pill status-${meeting.status}`}>{meeting.status}</span></div>
            <div className="meeting-details-grid"><div><span>Proposed Time</span><strong>{new Date(meeting.proposedAt).toLocaleString()}</strong></div><div><span>Meeting Type</span><strong>{modeLabel(meeting.mode)}</strong></div><div><span>Location / Platform</span><strong>{meeting.meetingDetails || "To be confirmed"}</strong></div></div>
            {meeting.message && <p>{meeting.message}</p>}
            {user?.role === "provider" && meeting.status === "pending" && <div className="dashboard-actions"><button className="primary-btn" type="button" onClick={() => updateStatus(meeting._id, "accepted")}>Accept Meeting</button><button className="danger-btn" type="button" onClick={() => updateStatus(meeting._id, "rejected")}>Decline Meeting</button></div>}
            {user?.role === "client" && meeting.status === "pending" && <button className="secondary-btn" type="button" onClick={() => cancelMeeting(meeting._id)}>Cancel Request</button>}
          </article>;
        })}</div>}
      </section>
    </main>
  );
}

export default Meetings;
