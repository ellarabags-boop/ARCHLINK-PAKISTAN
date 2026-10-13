import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MyRequests() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState("");

  // ==========================================
  // FETCH MY REQUESTS
  // ==========================================

  const fetchMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/service-requests/client",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load service requests"
        );
      }

      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ==========================================
  // LOAD REQUESTS
  // ==========================================

  useEffect(() => {
    if (token) {
      fetchMyRequests();
    }
  }, [token, fetchMyRequests]);

  const startPayment = async (requestId) => {
    setPayingId(requestId); setError("");
    try {
      const response = await fetch(`/api/payments/checkout/${requestId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to start checkout.");
      window.location.assign(data.checkoutUrl);
    } catch (err) { setError(err.message); setPayingId(""); }
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    if (status === "accepted") {
      return {
        background: "#e8f7e8",
        color: "#176b17",
      };
    }

    if (status === "rejected") {
      return {
        background: "#ffe8e8",
        color: "#b00020",
      };
    }

    if (status === "completed") {
      return {
        background: "#e8f0ff",
        color: "#174ea6",
      };
    }

    return {
      background: "#fff4d6",
      color: "#8a6500",
    };
  };

  return (
    <main className="section">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="dashboard-header">

        <div>
          <p className="small-label">
            CLIENT AREA
          </p>

          <h1>My Requests</h1>

          <p>
            Track your architecture service
            requests and review completed work.
          </p>
        </div>

        <div className="dashboard-actions">

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/services")
            }
          >
            Browse Services
          </button>

        </div>

      </div>

      <div className="dashboard-divider" />

      {/* =====================================
          LOADING
      ====================================== */}

      {loading && (
        <p>Loading your requests...</p>
      )}

      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <p className="form-message error-message">
          {error}
        </p>
      )}

      {/* =====================================
          NO REQUESTS
      ====================================== */}

      {!loading &&
        !error &&
        requests.length === 0 && (

          <div className="empty-state">

            <h3>No requests yet</h3>

            <p>
              You have not requested any
              architecture services yet.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/services")
              }
            >
              Browse Services
            </button>

          </div>

        )}

      {/* =====================================
          REQUEST LIST
      ====================================== */}

      {!loading &&
        !error &&
        requests.length > 0 && (

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >

            {requests.map((request) => {

              const statusStyle =
                getStatusStyle(
                  request.status
                );

              return (
                <article
                  key={request._id}
                  style={{
                    background: "#fff",
                    border:
                      "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "25px",
                  }}
                >

                  {/* =================================
                      REQUEST HEADER
                  ================================== */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >

                    <div>

                      <p className="small-label">
                        SERVICE REQUEST
                      </p>

                      <h2>
                        {request.service?.title ||
                          "Service"}
                      </h2>

                      <p>
                        <strong>
                          Category:
                        </strong>{" "}
                        {request.service
                          ?.category ||
                          "Not available"}
                      </p>

                      <p>
                        <strong>
                          City:
                        </strong>{" "}
                        {request.service
                          ?.city ||
                          "Not available"}
                      </p>

                      {request.service?.price !==
                        undefined && (
                        <p>
                          <strong>
                            Price:
                          </strong>{" "}
                          Rs.{" "}
                          {Number(
                            request.service.price
                          ).toLocaleString()}
                        </p>
                      )}

                      {request.platformFee !== undefined && (
                        <div className="commission-breakdown">
                          <p><strong>{request.paymentStatus === "paid" ? "Platform Fee" : "Estimated Platform Fee"} ({request.commissionPercent ?? 10}%):</strong> Rs. {Number(request.platformFee || 0).toLocaleString()}</p>
                          <p><strong>{request.paymentStatus === "paid" ? "Provider Share" : "Estimated Provider Amount"}:</strong> Rs. {Number(request.providerAmount ?? request.service?.price ?? 0).toLocaleString()}</p>
                          <small>{request.paymentStatus === "paid" ? "Payment confirmed by the payment gateway." : "Estimate only. Payment is collected only after checkout confirmation."}</small>
                        </div>
                      )}

                    </div>

                    {/* STATUS */}

                    <div>

                      <p>
                        <strong>
                          Status
                        </strong>
                      </p>

                      <span
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "8px 15px",
                          borderRadius:
                            "20px",
                          fontWeight:
                            "bold",
                          textTransform:
                            "capitalize",
                          ...statusStyle,
                        }}
                      >
                        {request.status}
                      </span>

                    </div>

                  </div>

                  {/* =================================
                      PROVIDER
                  ================================== */}

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "18px",
                      background:
                        "#f7f7f7",
                      borderRadius:
                        "10px",
                    }}
                  >

                    <h3>
                      Service Provider
                    </h3>

                    <p>
                      <strong>
                        Name:
                      </strong>{" "}
                      {request.provider
                        ?.name ||
                        "Not available"}
                    </p>

                    <p>
                      <strong>
                        Email:
                      </strong>{" "}
                      {request.provider
                        ?.email ||
                        "Not available"}
                    </p>

                    <p>
                      <strong>
                        City:
                      </strong>{" "}
                      {request.provider
                        ?.city ||
                        "Not specified"}
                    </p>

                  </div>

                  {/* =================================
                      CLIENT MESSAGE
                  ================================== */}

                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >

                    <p>
                      <strong>
                        Your Message:
                      </strong>
                    </p>

                    <p
                      style={{
                        color: "#555",
                        lineHeight: "1.6",
                      }}
                    >
                      {request.message}
                    </p>

                  </div>

                  {/* =================================
                      ACTIONS
                  ================================== */}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "20px",
                    }}
                  >

                    {/* VIEW SERVICE */}

                    {request.service?._id && (
                      <button
                        className="secondary-btn"
                        onClick={() =>
                          navigate(
                            `/services/${request.service._id}`
                          )
                        }
                      >
                        View Service
                      </button>
                    )}

                    {/* VIEW PROVIDER */}

                    {request.provider?._id && (
                      <button
                        className="secondary-btn"
                        onClick={() =>
                          navigate(
                            `/providers/${request.provider._id}`
                          )
                        }
                      >
                        View Provider
                      </button>
                    )}

                    <button className="secondary-btn" onClick={() => navigate(`/chat/${request._id}`)}>
                      Open Chat
                    </button>

                    {request.status === "accepted" && request.paymentStatus !== "paid" && Number(request.service?.price || 0) > 0 && (
                      <button className="primary-btn" disabled={payingId === request._id} onClick={() => startPayment(request._id)}>
                        {payingId === request._id ? "Redirecting..." : "Pay Securely"}
                      </button>
                    )}

                    {request.paymentStatus === "paid" && <span className="status-pill status-completed">Payment Confirmed</span>}

                    {/* LEAVE REVIEW */}

                    {(request.status ===
                      "accepted" ||
                      request.status ===
                        "completed") && (

                      <button
                        className="primary-btn"
                        onClick={() =>
                          navigate(
                            `/write-review/${request._id}`
                          )
                        }
                      >
                        ⭐ Leave Review
                      </button>

                    )}

                  </div>

                </article>
              );
            })}

          </div>

        )}

    </main>
  );
}

export default MyRequests;