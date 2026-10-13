import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AddService() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Architectural Design",
    city: "Abbottabad",
    price: "",
    image: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please login as a provider first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create service");
      }

      setMessage("Service created successfully!");

      setTimeout(() => navigate("/provider-dashboard"), 800);
    } catch (error) {
      console.error("Create service error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section">
      <div className="form-card">
        <p className="small-label">PROVIDER MARKETPLACE</p>
        <h1>Add New Service</h1>
        <p className="form-help">Publish an architecture service for clients across Pakistan.</p>

        <form onSubmit={handleSubmit} className="service-form">
          <label>Service Title</label>
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Modern House Design" required />

          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your service..." required />

          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option>Architectural Design</option>
            <option>3D Rendering</option>
            <option>AutoCAD</option>
            <option>Interior Design</option>
            <option>Landscape Design</option>
            <option>Structural Design</option>
          </select>

          <label>City</label>
          <input name="city" value={formData.city} onChange={handleChange} placeholder="Abbottabad" required />

          <label>Price (PKR)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" placeholder="150000" required />

          <label>Image URL</label>
          <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Service"}
          </button>
        </form>

        {message && <p className="form-message">{message}</p>}
      </div>
    </main>
  );
}

export default AddService;
