import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [services, setServices] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [requests, setRequests] = useState([]);
  

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] =
    useState(true);
  const [portfoliosLoading, setPortfoliosLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [requestsError, setRequestsError] =
    useState("");
  const [portfoliosError, setPortfoliosError] =
    useState("");

    // Reviews & Ratings
const [reviews, setReviews] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(true);
const [reviewsError, setReviewsError] = useState("");

  // ==========================================
  // FETCH MY SERVICES
  // ==========================================

  const fetchMyServices = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/services/my-services",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load services"
        );
      }

      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ==========================================
  // FETCH MY PORTFOLIOS
  // ==========================================

  const fetchMyPortfolios = useCallback(async () => {
    try {
      setPortfoliosError("");

      const response = await fetch(
        "/api/portfolios/my-projects",
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
            "Failed to load portfolio projects"
        );
      }

      setPortfolios(data);
    } catch (err) {
      setPortfoliosError(err.message);
    } finally {
      setPortfoliosLoading(false);
    }
  }, [token]);

  // ==========================================
  // FETCH SERVICE REQUESTS
  // ==========================================

  const fetchRequests = useCallback(async () => {
    try {
      setRequestsError("");

      const response = await fetch(
        "/api/service-requests/provider",
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
            "Failed to load requests"
        );
      }

      setRequests(data);
    } catch (err) {
      setRequestsError(err.message);
    } finally {
      setRequestsLoading(false);
    }
  }, [token]);
        
  // ==========================================
  // FETCH PROVIDER REVIEWS
  // ==========================================

  const fetchProviderReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      setReviewsError("");

      const providerId = user?._id || user?.id;

      if (!providerId) {
        throw new Error(
          "Provider ID not found. Please log in again."
        );
      }

      const response = await fetch(
        `/api/reviews/provider/${providerId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load reviews"
        );
      }

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setReviewsError(err.message);
    } finally {
      setReviewsLoading(false);
    }
  }, [user]);

  // ==========================================
  // LOAD EVERYTHING
  // ==========================================


  useEffect(() => {
    if (token) {
      fetchMyServices();
      fetchMyPortfolios();
      fetchRequests();
      fetchProviderReviews();
    }
  }, [token, fetchMyServices, fetchMyPortfolios, fetchRequests, fetchProviderReviews]);

  // ==========================================
  // DELETE SERVICE
  // ==========================================

  const handleDelete = async (serviceId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this service?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/services/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete service"
        );
      }

      setServices((items) =>
        items.filter(
          (item) => item._id !== serviceId
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // ACCEPT / REJECT REQUEST
  // ==========================================

  const handleRequestStatus = async (
    requestId,
    status
  ) => {
    try {
      const response = await fetch(
        `/api/service-requests/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update request"
        );
      }

      setRequests((items) =>
        items.map((item) =>
          item._id === requestId
            ? {
                ...item,
                status: data.request.status,
              }
            : item
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
 
  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) =>
            total + Number(review.rating || 0),
          0
        ) / reviews.length
      : 0;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="section">

      {/* =====================================
          DASHBOARD HEADER
      ====================================== */}

      <div className="dashboard-header">

        <div>
          <p className="small-label">
            PROVIDER AREA
          </p>

          <h1>Provider Dashboard</h1>

          <p>
            Welcome, {user?.name || "Provider"}.
            Manage your architecture services and
            client requests here.
          </p>
        </div>

        <div className="dashboard-actions">

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/add-service")
            }
          >
            + Add New Service
          </button>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/add-portfolio")
            }
          >
            + Add Portfolio Project
          </button>

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/services")
            }
          >
            View Marketplace
          </button>

          <button
            className="secondary-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      <div className="dashboard-divider" />

      {/* =====================================
          SERVICE REQUESTS
      ====================================== */}

      <div className="section-heading">

        <div>
          <p className="small-label">
            CLIENT ACTIVITY
          </p>

          <h2>Service Requests</h2>
        </div>

      </div>

      {requestsLoading && (
        <p>Loading service requests...</p>
      )}

      {requestsError && (
        <p className="form-message error-message">
          {requestsError}
        </p>
      )}

      {!requestsLoading &&
        !requestsError &&
        requests.length === 0 && (
          <div className="empty-state">

            <h3>No requests yet</h3>

            <p>
              When a client requests one of your
              services, the request will appear here.
            </p>

          </div>
        )}

      {!requestsLoading &&
        requests.length > 0 && (

          <div
            style={{
              display: "grid",
              gap: "20px",
              marginBottom: "50px",
            }}
          >

            {requests.map((request) => (

              <article
                key={request._id}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "25px",
                }}
              >

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

                    <h3>
                      {request.service?.title ||
                        "Service"}
                    </h3>

                    <p>
                      <strong>
                        Client:
                      </strong>{" "}
                      {request.client?.name ||
                        "Unknown"}
                    </p>

                    <p>
                      <strong>
                        Email:
                      </strong>{" "}
                      {request.client?.email ||
                        "Not available"}
                    </p>

                    <p>
                      <strong>
                        City:
                      </strong>{" "}
                      {request.client?.city ||
                        "Not specified"}
                    </p>

                    <p>
                      <strong>
                        Message:
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

                    {request.platformFee !== undefined && (
                      <div className="commission-breakdown">
                        <p><strong>Service Price:</strong> Rs. {Number(request.service?.price || 0).toLocaleString()}</p>
                        <p><strong>Estimated Platform Fee ({request.commissionPercent ?? 10}%):</strong> Rs. {Number(request.platformFee || 0).toLocaleString()}</p>
                        <p><strong>Estimated Provider Amount:</strong> Rs. {Number(request.providerAmount ?? request.service?.price ?? 0).toLocaleString()}</p>
                        <small>Estimate only. No payment has been collected.</small>
                      </div>
                    )}

                  </div>

                  {/* STATUS */}

                  <div
                    style={{
                      minWidth: "150px",
                    }}
                  >

                    <p>
                      <strong>
                        Status
                      </strong>
                    </p>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "8px 14px",
                        borderRadius: "20px",
                        background:
                          request.status ===
                          "accepted"
                            ? "#e8f7e8"
                            : request.status ===
                              "rejected"
                            ? "#ffe8e8"
                            : "#fff4d6",
                        color:
                          request.status ===
                          "accepted"
                            ? "#176b17"
                            : request.status ===
                              "rejected"
                            ? "#b00020"
                            : "#8a6500",
                        fontWeight: "bold",
                        textTransform:
                          "capitalize",
                      }}
                    >
                      {request.status}
                    </span>

                  </div>

                </div>

                {/* ACTION BUTTONS */}

                {request.status ===
                  "pending" && (

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                  >

                    <button
                      className="primary-btn"
                      onClick={() =>
                        handleRequestStatus(
                          request._id,
                          "accepted"
                        )
                      }
                    >
                      Accept Request
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() =>
                        handleRequestStatus(
                          request._id,
                          "rejected"
                        )
                      }
                    >
                      Reject Request
                    </button>

                  </div>

                )}

              </article>

            ))}

          </div>

        )}
         
      {/* =====================================
          REVIEWS & RATINGS
      ====================================== */}

      <section style={{ marginBottom: "50px" }}>
        <div className="section-heading">
          <div>
            <p className="small-label">
              CLIENT FEEDBACK
            </p>

            <h2>Reviews & Ratings</h2>

            <p>
              See what clients say about your services.
            </p>
          </div>
        </div>

        {reviewsLoading && (
          <p>Loading reviews...</p>
        )}

        {reviewsError && (
          <p className="form-message error-message">
            {reviewsError}
          </p>
        )}

        {!reviewsLoading &&
          !reviewsError && (
            <>
              <div
                style={{
                  padding: "24px",
                  marginBottom: "22px",
                  background: "#fffaf2",
                  border: "1px solid #eadbc8",
                  borderRadius: "12px",
                }}
              >
                <h2 style={{ margin: "0 0 8px" }}>
                  ⭐ {averageRating.toFixed(1)} / 5
                </h2>

                <p style={{ margin: 0 }}>
                  Based on {reviews.length}{" "}
                  {reviews.length === 1
                    ? "review"
                    : "reviews"}
                </p>
              </div>

              {reviews.length === 0 ? (
                <div className="empty-state">
                  <h3>No reviews yet</h3>

                  <p>
                    Client reviews will appear here
                    when they review your services.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "18px",
                  }}
                >
                  {reviews.map((review) => (
                    <article
                      key={review._id}
                      style={{
                        padding: "22px",
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <h3 style={{ margin: 0 }}>
                          {review.client?.name || "Client"}
                        </h3>

                        <strong>
                          {"⭐".repeat(
                            Math.max(
                              0,
                              Math.min(
                                5,
                                Number(review.rating) || 0
                              )
                            )
                          )}{" "}
                          ({review.rating}/5)
                        </strong>
                      </div>

                      <p
                        style={{
                          marginTop: "14px",
                          lineHeight: "1.7",
                          color: "#555",
                        }}
                      >
                        {review.comment}
                      </p>

                      {review.service?.title && (
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#777",
                          }}
                        >
                          Service: {review.service.title}
                        </p>
                      )}

                      <p
                        style={{
                          fontSize: "13px",
                          color: "#888",
                          marginBottom: 0,
                        }}
                      >
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString()
                          : ""}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
      </section>
      {/* =====================================
          MY PROJECTS / PORTFOLIO
      ====================================== */}

      <div className="section-heading">

        <div>
          <p className="small-label">
            PORTFOLIO
          </p>

          <h2>My Projects</h2>
        </div>

      </div>

      {portfoliosLoading && (
        <p>
          Loading your portfolio projects...
        </p>
      )}

      {portfoliosError && (
        <p className="form-message error-message">
          {portfoliosError}
        </p>
      )}

      {!portfoliosLoading &&
        !portfoliosError &&
        portfolios.length === 0 && (

          <div className="empty-state">

            <h3>
              You have not added any portfolio
              projects yet.
            </h3>

            <p>
              Add your completed architecture
              projects to show your work to clients.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/add-portfolio")
              }
            >
              + Add Portfolio Project
            </button>

          </div>

        )}

      {!portfoliosLoading &&
        !portfoliosError &&
        portfolios.length > 0 && (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "50px",
            }}
          >

            {portfolios.map((portfolio) => (

              <article
                key={portfolio._id}
                style={{
                  border:
                    "1px solid #e5e5e5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow:
                    "0 2px 10px rgba(0,0,0,0.06)",
                }}
              >

                {portfolio.image ? (

                  <img
                    src={portfolio.image}
                    alt={portfolio.title}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />

                ) : (

                  <div
                    style={{
                      height: "180px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f1f1f1",
                      color: "#777",
                    }}
                  >
                    No Image
                  </div>

                )}

                <div
                  style={{
                    padding: "18px",
                  }}
                >

                  <p className="small-label">
                    {portfolio.category}
                  </p>

                  <h3>
                    {portfolio.title}
                  </h3>

                  <p>
                    📍 {portfolio.city}
                  </p>

                  {portfolio.completionYear && (
                    <p>
                      <strong>
                        Completion Year:
                      </strong>{" "}
                      {portfolio.completionYear}
                    </p>
                  )}

                  <button
                    className="secondary-btn"
                    style={{
                      marginTop: "10px",
                    }}
                    onClick={() =>
                      navigate(
                        `/portfolio/${portfolio._id}`
                      )
                    }
                  >
                    View Project
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      {/* =====================================
          MY SERVICES
      ====================================== */}

      <div className="section-heading">

        <div>
          <p className="small-label">
            YOUR LISTINGS
          </p>

          <h2>My Services</h2>
        </div>

      </div>

      {loading && (
        <p>Loading your services...</p>
      )}

      {error && (
        <p className="form-message error-message">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        services.length === 0 && (

          <div className="empty-state">

            <h3>No services yet</h3>

            <p>
              Create your first architecture
              service to publish it on ArchLink.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/add-service")
              }
            >
              Create First Service
            </button>

          </div>

        )}

      {!loading &&
        !error &&
        services.length > 0 && (

          <div className="service-grid">

            {services.map((service) => (

              <article
                key={service._id}
                className="service-card"
              >

                <img
                  className="service-card-image"
                  src={
                    service.image ||
                    "https://via.placeholder.com/600x400?text=ArchLink"
                  }
                  alt={service.title}
                />

                <p className="small-label">
                  {service.category}
                </p>

                <h3>
                  {service.title}
                </h3>

                <p>
                  {service.description}
                </p>

                <div className="service-meta">

                  <span>
                    📍 {service.city}
                  </span>

                  <strong>
                    Rs.{" "}
                    {Number(
                      service.price
                    ).toLocaleString()}
                  </strong>

                </div>

                <div className="card-actions">

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      navigate(
                        `/edit-service/${service._id}`
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="danger-btn"
                    onClick={() =>
                      handleDelete(
                        service._id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

    </main>
  );
}

export default ProviderDashboard;