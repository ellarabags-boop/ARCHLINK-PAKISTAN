import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function PortfolioDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(
          `/api/portfolios/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load project"
          );
        }

        setProject(data);
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Failed to load project"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <main className="section">
        <div className="empty-state">
          <h3>Loading project...</h3>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="section">
        <div className="empty-state">
          <h3>Project Not Found</h3>

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
            Back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="section"
      style={{
        maxWidth: "950px",
        margin: "0 auto",
      }}
    >
      <Link
        to={`/providers/${project.provider?._id}`}
        style={{
          textDecoration: "none",
          color: "#b8793b",
          fontWeight: "bold",
        }}
      >
        ← Back to Provider Profile
      </Link>

      <div
        style={{
          marginTop: "25px",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "14px",
          padding: "30px",
        }}
      >
        <img
          src={
            project.image ||
            "https://via.placeholder.com/900x500?text=Portfolio"
          }
          alt={project.title}
          style={{
            width: "100%",
            maxHeight: "550px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />

        <div style={{ marginTop: "30px" }}>
          <p className="small-label">
            {project.category}
          </p>

          <h1>{project.title}</h1>

          <div
            style={{
              display: "flex",
              gap: "25px",
              flexWrap: "wrap",
              color: "#555",
              marginBottom: "25px",
            }}
          >
            <span>
              📍 {project.city}
            </span>

            {project.completionYear && (
              <span>
                📅 {project.completionYear}
              </span>
            )}
          </div>

          <h2>Project Description</h2>

          <p
            style={{
              lineHeight: "1.8",
              color: "#555",
            }}
          >
            {project.description}
          </p>

          {project.provider && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                background: "#f7f7f7",
                borderRadius: "10px",
              }}
            >
              <h3>Project Provider</h3>

              <p>
                <strong>
                  {project.provider.name}
                </strong>
              </p>

              <p>
                📍{" "}
                {project.provider.city ||
                  "Pakistan"}
              </p>

              <Link
                to={`/providers/${project.provider._id}`}
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
        </div>
      </div>
    </main>
  );
}

export default PortfolioDetails;