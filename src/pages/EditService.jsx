import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({ title: "", description: "", category: "Architectural Design", city: "", price: "", image: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadService = async () => {
      try {
        const response = await fetch(`/api/services/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Service not found");
        setFormData({ title: data.title, description: data.description, category: data.category, city: data.city, price: data.price, image: data.image || "" });
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  const handleChange = (e) => setFormData((previous) => ({ ...previous, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, price: Number(formData.price) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update service");
      setMessage("Service updated successfully!");
      setTimeout(() => navigate("/provider-dashboard"), 800);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="section"><p>Loading service...</p></main>;

  return (
    <main className="section">
      <div className="form-card">
        <p className="small-label">MANAGE LISTING</p>
        <h1>Edit Service</h1>
        <form onSubmit={handleSubmit} className="service-form">
          <label>Service Title</label>
          <input name="title" value={formData.title} onChange={handleChange} required />
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option>Architectural Design</option><option>3D Rendering</option><option>AutoCAD</option><option>Interior Design</option><option>Landscape Design</option><option>Structural Design</option>
          </select>
          <label>City</label>
          <input name="city" value={formData.city} onChange={handleChange} required />
          <label>Price (PKR)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required />
          <label>Image URL</label>
          <input name="image" value={formData.image} onChange={handleChange} />
          <div className="card-actions">
            <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Update Service"}</button>
            <button className="secondary-btn" type="button" onClick={() => navigate("/provider-dashboard")}>Cancel</button>
          </div>
        </form>
        {message && <p className="form-message">{message}</p>}
      </div>
    </main>
  );
}

export default EditService;
