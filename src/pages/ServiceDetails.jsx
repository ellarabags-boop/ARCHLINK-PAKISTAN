import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(
          `/api/services/${id}`
        );

        setService(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Service not found or backend error.");
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleRequestService = async (e) => {
    e.preventDefault();

    setRequestMessage("");
    setRequestError("");

    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "client") {
      setRequestError(
        "Only clients can request a service."
      );
      return;
    }

    if (message.trim().length < 10) {
      setRequestError(
        "Please write at least 10 characters in your message."
      );
      return;
    }

    try {
      setRequestLoading(true);

      const response = await axios.post(
        "/api/service-requests",
        {
          serviceId: service._id,
          message: message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestMessage(
        response.data.message ||
          "Service request sent successfully!"
      );

      setMessage("");
      setShowRequestForm(false);
    } catch (err) {
      console.error(err);

      setRequestError(
        err.response?.data?.message ||
          "Failed to send service request."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "80px",
          textAlign: "center",
        }}
      >
        Loading Service Details...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "80px",
          textAlign: "center",
          color: "red",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <main
      className="section"
      style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <Link
        to="/services"
        style={{
          textDecoration: "none",
          color: "#b8793b",
          fontWeight: "bold",
        }}
      >
        ← Back to Services
      </Link>

      <div
        style={{
          marginTop: "20px",
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #ddd",
        }}
      >
        <img
          src={
            service.image ||
            "https://via.placeholder.com/800x400"
          }
          alt={service.title}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />

        <div style={{ marginTop: "20px" }}>
          <p className="small-label">
            {service.category}
          </p>

          <h1
            style={{
              fontSize: "32px",
              margin: "10px 0",
            }}
          >
            {service.title}
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "16px",
              marginBottom: "20px",
            }}
          >
            📍 Location: {service.city}
          </p>

          <h2
            style={{
              color: "#000000",
              marginBottom: "20px",
            }}
          >
            Price: Rs.{" "}
            {service.price?.toLocaleString()}
          </h2>

          <h3>Description</h3>

          <p
            style={{
              lineHeight: "1.7",
              color: "#444",
            }}
          >
            {service.description}
          </p>
          {/* SERVICE PROVIDER */}
{service.provider && (
  <div
    style={{
      marginTop: "25px",
      padding: "20px",
      background: "#f7f7f7",
      borderRadius: "10px",
      border: "1px solid #e5e5e5",
    }}
  >
    <h3>Service Provider</h3>

    <p>
      <strong>{service.provider.name}</strong>
    </p>

    <p>
      📍 {service.provider.city || "Pakistan"}
    </p>

    <Link
      to={`/providers/${service.provider._id}`}
      className="secondary-btn"
      style={{
        textDecoration: "none",
        display: "inline-block",
        marginTop: "10px",
      }}
    >
      View Provider Profile
    </Link>
  </div>
)}
          {/* SUCCESS MESSAGE */}
          {requestMessage && (
            <div
              style={{
                marginTop: "20px",
                padding: "14px",
                background: "#e8f7e8",
                color: "#176b17",
                borderRadius: "8px",
                border: "1px solid #a8d8a8",
              }}
            >
              {requestMessage}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {requestError && (
            <div
              style={{
                marginTop: "20px",
                padding: "14px",
                background: "#ffecec",
                color: "#b00020",
                borderRadius: "8px",
                border: "1px solid #f0aaaa",
              }}
            >
              {requestError}
            </div>
          )}

          {!showRequestForm && (
            <button
              style={{
                marginTop: "30px",
                padding: "14px 28px",
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => {
                setRequestError("");
                setRequestMessage("");

                if (!token || !user) {
                  navigate("/login");
                  return;
                }

                setShowRequestForm(true);
              }}
            >
              Request Service
            </button>
          )}

          {/* REQUEST FORM */}
          {showRequestForm && (
            <div
              style={{
                marginTop: "30px",
                padding: "25px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                background: "#fafafa",
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                Request This Service
              </h3>

              <p
                style={{
                  color: "#666",
                  marginBottom: "15px",
                }}
              >
                Tell the provider what you need.
              </p>

              <form onSubmit={handleRequestService}>
                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Example: I need a complete 5 Marla house design including floor plan, elevation and 3D view."
                  rows="6"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    type="submit"
                    disabled={requestLoading}
                    style={{
                      padding: "12px 22px",
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: requestLoading
                        ? "not-allowed"
                        : "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    {requestLoading
                      ? "Sending..."
                      : "Send Request"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestError("");
                    }}
                    style={{
                      padding: "12px 22px",
                      background: "#ddd",
                      color: "#111",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default ServiceDetails;