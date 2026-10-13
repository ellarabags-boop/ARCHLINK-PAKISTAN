import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function ProviderProfile() {
  const { id } = useParams();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [portfolios, setPortfolios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        setError("");

        // Provider
        const providerResponse = await fetch(
          `/api/users/providers/${id}`
        );

        const providerData =
          await providerResponse.json();

        if (!providerResponse.ok) {
          throw new Error(
            providerData.message ||
              "Failed to load provider"
          );
        }

        setProvider(providerData);

        // Services
        const servicesResponse = await fetch(
          "/api/services"
        );

        const servicesData =
          await servicesResponse.json();

        if (servicesResponse.ok) {
          const providerServices =
            servicesData.filter(
              (service) =>
                String(service.provider?._id) ===
                String(id)
            );

          setServices(providerServices);
        }

        // Portfolio
        const portfolioResponse = await fetch(
          "/api/portfolios"
        );

        const portfolioData =
          await portfolioResponse.json();

        if (portfolioResponse.ok) {
          const providerPortfolios =
            portfolioData.filter(
              (project) =>
                String(project.provider?._id) ===
                String(id)
            );

          setPortfolios(providerPortfolios);
        }
         
        // Reviews
const reviewsResponse = await fetch(
  `/api/reviews/provider/${id}`
);

const reviewsData = await reviewsResponse.json();

if (reviewsResponse.ok) {
  setReviews(
    Array.isArray(reviewsData) ? reviewsData : []
  );
} else {
  setReviewsError(
    reviewsData.message || "Failed to load reviews"
  );
}
         
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Failed to load provider profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [id]);

 const averageRating =
  reviews.length > 0
    ? reviews.reduce(
        (total, review) =>
          total + Number(review.rating || 0),
        0
      ) / reviews.length
    : 0;

  if (loading) {
    return (
      <main className="section">
        <div className="empty-state">
          <h3>Loading provider profile...</h3>
          <p>Please wait.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section">
        <div className="empty-state">
          <h3>Provider Not Found</h3>

          <p className="form-message error-message">
            {error}
          </p>

          <Link
            to="/services"
            className="primary-btn"
            style={{
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Back to Services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section">

      {/* Back */}
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

      {/* Provider Profile */}
      <div
        style={{
          marginTop: "25px",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "14px",
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "25px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <img
            src={
              provider.profileImage ||
              "https://via.placeholder.com/150?text=Provider"
            }
            alt={provider.name}
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #eee",
            }}
          />

          <div>
            <p className="small-label">
              ARCHLINK SERVICE PROVIDER
            </p>

            <h1 style={{ margin: "8px 0" }}>
              {provider.name}
            </h1>

            {provider.verificationStatus === "approved" && (
              <span className="verification-badge">Platform Verified</span>
            )}

            <p
              style={{
                color: "#555",
                margin: "8px 0",
              }}
            >
              📍 {provider.city || "Pakistan"}
            </p>

            <p
              style={{
                color: "#555",
                margin: "8px 0",
              }}
            >
              ✉️ {provider.email}
            </p>
          </div>
        </div>

        {/* About */}
        <div style={{ marginTop: "30px" }}>
          <h2>About Provider</h2>

          <p
            style={{
              color: "#555",
              lineHeight: "1.7",
            }}
          >
            {provider.bio ||
              "This provider has not added a bio yet."}
          </p>
        </div>
      </div>

      {/* Portfolio */}
      <div style={{ marginTop: "45px" }}>
        <div className="section-heading">
          <div>
            <p className="small-label">
              PORTFOLIO
            </p>

            <h2>
              Projects by {provider.name}
            </h2>
          </div>
        </div>

        {portfolios.length === 0 ? (
          <div className="empty-state">
            <h3>No portfolio projects yet</h3>

            <p>
              This provider has not added any
              portfolio projects.
            </p>
          </div>
        ) : (
          <div className="service-grid">
            {portfolios.map((project) => (
              <article
                key={project._id}
                className="service-card"
              >
                <img
                  className="service-card-image"
                  src={
                    project.image ||
                    "https://via.placeholder.com/600x400?text=Portfolio"
                  }
                  alt={project.title}
                />

                <p className="small-label">
                  {project.category}
                </p>

                <h3>{project.title}</h3>

                <p>
                  {project.description}
                </p>

                <div className="service-meta">
                  <span>
                    📍 {project.city}
                  </span>

                  {project.completionYear && (
                    <strong>
                      {project.completionYear}
                    </strong>
                  )}
                </div>

                <div className="card-actions">
                  <Link
                    to={`/portfolio/${project._id}`}
                    className="secondary-btn"
                    style={{
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    View Project
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Services */}
      <div style={{ marginTop: "50px" }}>
        <div className="section-heading">
          <div>
            <p className="small-label">
              PROVIDER SERVICES
            </p>

            <h2>
              Services by {provider.name}
            </h2>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <h3>No services available</h3>

            <p>
              This provider has not published any
              services yet.
            </p>
          </div>
        ) : (
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

                <h3>{service.title}</h3>

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
                      service.price || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <div className="card-actions">
                  <Link
                    to={`/services/${service._id}`}
                    className="secondary-btn"
                    style={{
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    View Service
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      
      {/* Reviews & Ratings */}
      <section style={{ marginTop: "50px" }}>
        <div className="section-heading">
          <div>
            <p className="small-label">CLIENT FEEDBACK</p>
            <h2>Reviews & Ratings</h2>
            <p>
              Feedback shared by clients who have worked with this provider.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "22px",
            marginBottom: "24px",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            background: "#fafafa",
          }}
        >
          <h3 style={{ margin: "0 0 8px" }}>
            ⭐ {averageRating.toFixed(1)} / 5
          </h3>

          <p style={{ margin: 0, color: "#555" }}>
            Based on {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {reviewsError ? (
          <div className="empty-state">
            <p>{reviewsError}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <h3>No reviews yet</h3>
            <p>
              This provider has not received any reviews yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            {reviews.map((review) => (
              <article
                key={review._id}
                style={{
                  padding: "22px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  background: "#fff",
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

                  <span>
                    {"⭐".repeat(
                      Math.max(
                        0,
                        Math.min(5, Number(review.rating) || 0)
                      )
                    )}
                    {" "}
                    ({review.rating}/5)
                  </span>
                </div>

                <p
                  style={{
                    color: "#555",
                    lineHeight: "1.7",
                    marginTop: "14px",
                  }}
                >
                  {review.comment}
                </p>

                {review.service?.title && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#777",
                      marginBottom: 0,
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
                    ? new Date(review.createdAt).toLocaleDateString()
                    : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ProviderProfile;