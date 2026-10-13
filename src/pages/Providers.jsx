import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "/api/users/providers";

function Providers() {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load providers.");
        }
        setProviders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    loadProviders();
  }, []);

  const cities = useMemo(
    () => [...new Set(providers.map((provider) => provider.city).filter(Boolean))].sort(),
    [providers]
  );

  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return providers.filter((provider) => {
      const matchesSearch = !query ||
        provider.name?.toLowerCase().includes(query) ||
        provider.city?.toLowerCase().includes(query) ||
        provider.bio?.toLowerCase().includes(query);
      return matchesSearch && (!city || provider.city === city);
    });
  }, [providers, search, city]);

  return (
    <main className="section">
      <header className="page-intro">
        <p className="small-label">MEET THE EXPERTS</p>
        <h1>Architecture Professionals</h1>
        <p>Explore service providers across Pakistan and view their work, services, and client reviews.</p>
      </header>

      <div className="marketplace-filters" aria-label="Filter providers">
        <input
          aria-label="Search providers"
          placeholder="Search by name, city, or expertise..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Filter by city" value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">All Cities</option>
          {cities.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="secondary-btn" type="button" onClick={() => { setSearch(""); setCity(""); }}>
          Clear Filters
        </button>
      </div>

      {loading && <div className="empty-state"><h2>Loading professionals...</h2></div>}
      {error && <div className="empty-state error-message" role="alert"><h2>Unable to Load Providers</h2><p>{error}</p><button className="primary-btn" onClick={() => window.location.reload()}>Try Again</button></div>}
      {!loading && !error && filteredProviders.length === 0 && (
        <div className="empty-state"><h2>No Providers Found</h2><p>Try changing your search or city filter.</p><Link className="primary-btn button-link" to="/register">Join as a Provider</Link></div>
      )}

      <div className="provider-grid">
        {filteredProviders.map((provider) => (
          <article className="provider-card" key={provider._id}>
            <div className="provider-avatar">
              {provider.profileImage ? <img src={provider.profileImage} alt={`${provider.name} profile`} /> : <span>{provider.name?.trim()?.charAt(0)?.toUpperCase() || "A"}</span>}
            </div>
            <div className="provider-card-content">
              <p className="small-label">SERVICE PROVIDER</p>
              <h2>{provider.name}</h2>
              <p className="provider-location">{provider.city || "Pakistan"}</p>
              <p className="provider-bio">{provider.bio || "Architecture and construction professional available for service inquiries."}</p>
              {provider.verificationStatus === "approved" && <span className="verification-badge">Platform Verified</span>}
              <Link className="details-link" to={`/providers/${provider._id}`}>View Profile →</Link>
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && <p className="results-count">Showing {filteredProviders.length} of {providers.length} providers</p>}
    </main>
  );
}

export default Providers;
