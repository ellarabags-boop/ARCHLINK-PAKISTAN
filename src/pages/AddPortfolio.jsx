import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AddPortfolio() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    city: "",
    image: "",
    completionYear: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.city
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/portfolios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            completionYear:
              formData.completionYear
                ? Number(
                    formData.completionYear
                  )
                : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create portfolio project"
        );
      }

      setMessage(
        "Portfolio project created successfully!"
      );

      setTimeout(() => {
        navigate("/provider-dashboard");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section">
      <div
        style={{
          maxWidth: "750px",
          margin: "0 auto",
        }}
      >
        <p className="small-label">
          PROVIDER AREA
        </p>

        <h1>Add Portfolio Project</h1>

        <p>
          Showcase one of your completed
          architecture projects.
        </p>

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: "#e8f7e8",
              color: "#176b17",
              borderRadius: "8px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: "#ffecec",
              color: "#b00020",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "25px",
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            border: "1px solid #ddd",
          }}
        >
          <label>
            <strong>Project Title *</strong>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Modern House Design"
              required
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                marginBottom: "20px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label>
            <strong>Description *</strong>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the architecture project..."
              rows="6"
              required
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                marginBottom: "20px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </label>

          <label>
            <strong>Category *</strong>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                marginBottom: "20px",
              }}
            >
              <option value="">
                Select Category
              </option>

              <option value="Architectural Design">
                Architectural Design
              </option>

              <option value="Interior Design">
                Interior Design
              </option>

              <option value="3D Visualization">
                3D Visualization
              </option>

              <option value="Floor Plans">
                Floor Plans
              </option>

              <option value="Elevation Design">
                Elevation Design
              </option>

              <option value="Renovation">
                Renovation
              </option>
            </select>
          </label>

          <label>
            <strong>City *</strong>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Abbottabad"
              required
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                marginBottom: "20px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label>
            <strong>Project Image URL</strong>

            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/project.jpg"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                marginBottom: "20px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label>
            <strong>Completion Year</strong>

            <input
              type="number"
              name="completionYear"
              value={formData.completionYear}
              onChange={handleChange}
              placeholder="2026"
              min="1900"
              max="2100"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                marginBottom: "25px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Add Portfolio Project"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                navigate("/provider-dashboard")
              }
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddPortfolio;