import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "/api/services";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80";
const CITIES = ["Islamabad", "Lahore", "Karachi", "Rawalpindi", "Peshawar", "Abbottabad", "Faisalabad", "Multan", "Quetta"];
const SERVICE_TYPES = [
  { icon: "⌂", title: "Architectural Design", description: "Residential and commercial design concepts, plans, and elevations." },
  { icon: "▦", title: "Interior Design", description: "Thoughtful interiors, space planning, and material selections." },
  { icon: "⌗", title: "AutoCAD Drafting", description: "Accurate technical drawings and construction documentation." },
  { icon: "◈", title: "3D Visualization", description: "Photorealistic renders and visual presentations for projects." },
];

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState([]);

  useEffect(() => {
    const loadFeaturedServices = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) return;
        const data = await response.json();
        setServices(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (error) {
        console.error("Featured services request failed:", error);
      }
    };
    loadFeaturedServices();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (city) params.set("city", city);
    navigate(`/services${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">ARCHITECTURE & CONSTRUCTION MARKETPLACE</p>
          <h1>Find Trusted <span>Architecture</span> Professionals</h1>
          <p className="hero-description">Discover architects, interior designers, AutoCAD draftsmen, and construction professionals across Pakistan.</p>
          <form className="search-box" onSubmit={handleSearch}>
            <input aria-label="Search services" type="search" placeholder="What service do you need?" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select aria-label="Select city" value={city} onChange={(event) => setCity(event.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="submit">Search Services</button>
          </form>
          <div className="hero-trust-row"><span>✓ City-based discovery</span><span>✓ Portfolio previews</span><span>✓ Request tracking</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><p className="small-label">EXPLORE OUR MARKETPLACE</p><h2>Services for Every Project</h2><p>Find the right professional for your next design or construction task.</p></div><Link to="/services">Browse All Services →</Link></div>
        <div className="service-grid">
          {SERVICE_TYPES.map((item) => <article className="service-card category-card" key={item.title}><div className="service-icon" aria-hidden="true">{item.icon}</div><h3>{item.title}</h3><p>{item.description}</p><Link className="details-link" to={`/services?search=${encodeURIComponent(item.title)}`}>Explore Service →</Link></article>)}
        </div>
      </section>

      {services.length > 0 && <section className="featured-section"><div className="section"><div className="section-heading"><div><p className="small-label">RECENT LISTINGS</p><h2>Featured Services</h2></div><Link to="/services">View Marketplace →</Link></div><div className="service-grid">
        {services.map((service) => <article className="service-card featured-service-card" key={service._id}><img className="service-card-image" src={service.image || FALLBACK_IMAGE} alt={service.title} loading="lazy" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} /><p className="small-label">{service.category}</p><h3>{service.title}</h3><p>{service.city} · {service.provider?.name || "ArchLink Provider"}</p><div className="service-meta"><span>PKR {Number(service.price || 0).toLocaleString()}</span><Link to={`/services/${service._id}`}>View Details →</Link></div></article>)}
      </div></div></section>}

      <section className="cities-section"><div className="section-heading"><div><p className="small-label">LOCAL EXPERTISE</p><h2>Explore Professionals by City</h2><p>Discover services and portfolio work from across Pakistan.</p></div></div><div className="city-grid">{CITIES.slice(0, 6).map((item) => <button className="city-card city-card-button" type="button" key={item} onClick={() => navigate(`/services?city=${encodeURIComponent(item)}`)}><h3>{item}</h3><p>Browse local services <span aria-hidden="true">→</span></p></button>)}</div></section>

      <section className="section"><div className="section-heading"><div><p className="small-label">THE ARCHLINK ADVANTAGE</p><h2>Built Around Better Decisions</h2></div></div><div className="features-grid"><article className="feature-card"><span>01</span><h3>Explore Portfolios</h3><p>Review professional project examples before reaching out.</p></article><article className="feature-card"><span>02</span><h3>Track Your Requests</h3><p>Follow request updates from your personal account.</p></article><article className="feature-card"><span>03</span><h3>Read Client Reviews</h3><p>Use ratings and written feedback to compare providers.</p></article></div></section>

      <section className="cta-section"><p className="small-label">FOR ARCHITECTURE PROFESSIONALS</p><h2>Put Your Work in Front of More Clients</h2><p>Create a profile, publish services, and showcase your portfolio on ArchLink Pakistan.</p><Link to="/register" className="cta-button">Join as a Service Provider</Link></section>
    </main>
  );
}

export default Home;
