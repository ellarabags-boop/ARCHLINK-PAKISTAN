import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "/api/users";

function ProviderVerification() {
  const { token, user } = useAuth();
  const [authority, setAuthority] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [status, setStatus] = useState("not_submitted");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadStatus = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/verification/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load verification status.");
      setAuthority(data.verificationAuthority || "");
      setRegistrationNumber(data.registrationNumber || "");
      setStatus(data.verificationStatus || "not_submitted");
      setNotes(data.verificationNotes || "");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ authority, registrationNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit verification details.");
      setStatus(data.provider?.verificationStatus || "pending");
      setNotes("");
      setMessage("Verification details submitted. Your information is awaiting administrative review.");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const statusLabels = {
    not_submitted: "Not Submitted",
    pending: "Pending Review",
    approved: "Approved by ArchLink",
    rejected: "Changes Required",
  };

  if (loading) return <main className="section"><div className="empty-state"><h2>Loading verification status...</h2></div></main>;

  return (
    <main className="section">
      <div className="page-intro">
        <p className="small-label">PROVIDER ACCOUNT</p>
        <h1>Professional Verification</h1>
        <p>Submit your professional registration details for review by the ArchLink administration team.</p>
      </div>

      <div className="verification-layout">
        <section className="form-card">
          <div className="verification-status-row"><span>Current Status</span><strong className={`status-pill status-${status}`}>{statusLabels[status] || status}</strong></div>
          {status === "approved" && <p className="success-message">Your submitted details have been reviewed and approved by ArchLink administration.</p>}
          {status === "pending" && <p className="form-help">Your submission is in the review queue. You can update and resubmit details if needed.</p>}
          {status === "rejected" && notes && <div className="verification-notes"><strong>Review Notes</strong><p>{notes}</p></div>}

          <form className="service-form" onSubmit={handleSubmit}>
            <label htmlFor="authority">Registration Authority</label>
            <select id="authority" value={authority} onChange={(event) => setAuthority(event.target.value)} required>
              <option value="">Select an authority</option>
              <option value="Pakistan Council of Architects and Town Planners (PCATP)">Pakistan Council of Architects and Town Planners (PCATP)</option>
              <option value="Pakistan Engineering Council (PEC)">Pakistan Engineering Council (PEC)</option>
              <option value="Capital Development Authority (CDA)">Capital Development Authority (CDA)</option>
              <option value="Tehsil Municipal Administration (TMA)">Tehsil Municipal Administration (TMA)</option>
              <option value="Cantonment Board">Cantonment Board</option>
              <option value="Other Authority">Other Authority</option>
            </select>

            <label htmlFor="registrationNumber">Registration or License Number</label>
            <input id="registrationNumber" value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} maxLength={120} required placeholder="Enter your registration number" />

            <p className="form-help">Submit only accurate details. ArchLink approval is a platform review and does not replace official confirmation from the relevant authority.</p>
            {error && <p className="error-message" role="alert">{error}</p>}
            {message && <p className="success-message" role="status">{message}</p>}
            <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Submitting..." : status === "pending" ? "Update Submission" : "Submit for Review"}</button>
          </form>
        </section>

        <aside className="verification-info">
          <h2>Review Process</h2>
          <ol>
            <li>Provide the relevant authority and registration number.</li>
            <li>ArchLink administration reviews the submitted information.</li>
            <li>Your profile status is updated after the review decision.</li>
          </ol>
          <p>Do not submit passwords, identity account credentials, or unrelated personal information. Document upload and direct government database integration are not included in this version.</p>
        </aside>
      </div>
    </main>
  );
}

export default ProviderVerification;
