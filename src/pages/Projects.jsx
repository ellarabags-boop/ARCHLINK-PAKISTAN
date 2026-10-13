import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "/api/portfolios";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load projects.");
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const cities = useMemo(() => [...new Set(projects.map((item) => item.city).filter(Boolean))].sort(), [projects]);
  const categories = useMemo(() => [...new Set(projects.map((item) => item.category).filter(Boolean))].sort(), [projects]);
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !query || [project.title, project.description, project.category, project.city, project.provider?.name]
        .some((value) => value?.toLowerCase().includes(query));
      return matchesSearch && (!city || project.city === city) && (!category || project.category === category);
    });
  }, [projects, search, city, category]);

  return (
    <main className="section">
      <header className="page-intro">
        <p className="small-label">DESIGN INSPIRATION</p>
        <h1>Architecture Portfolio Projects</h1>
        <p>Explore completed work and design concepts shared by ArchLink professionals.</p>
      </header>

      <div className="marketplace-filters" aria-label="Filter portfolio projects">
        <input aria-label="Search projects" placeholder="Search projects, categories, or cities..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter projects by city" value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">All Cities</option>
          {cities.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select aria-label="Filter projects by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All Categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="secondary-btn" type="button" onClick={() => { setSearch(""); setCity(""); setCategory(""); }}>Clear Filters</button>
      </div>

      {loading && <div className="empty-state"><h2>Loading portfolio projects...</h2></div>}
      {error && <div className="empty-state error-message" role="alert"><h2>Unable to Load Projects</h2><p>{error}</p><button className="primary-btn" onClick={() => window.location.reload()}>Try Again</button></div>}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="empty-state"><h2>No Portfolio Projects Yet</h2><p>Published projects from service providers will appear here.</p><Link to="/providers" className="primary-btn button-link">Explore Providers</Link></div>
      )}

      <div className="portfolio-grid">
        {filteredProjects.map((project) => (
          <article className="portfolio-card" key={project._id}>
            <Link to={`/portfolio/${project._id}`} className="portfolio-image-link" aria-label={`View ${project.title}`}>
              <img src={project.image || FALLBACK_IMAGE} alt={project.title} loading="lazy" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
            </Link>
            <div className="portfolio-card-body">
              <div className="portfolio-meta"><span>{project.category}</span><span>{project.city}</span></div>
              <h2><Link to={`/portfolio/${project._id}`}>{project.title}</Link></h2>
              <p>{project.description?.length > 145 ? `${project.description.slice(0, 145)}...` : project.description}</p>
              <p className="portfolio-author">By {project.provider?.name || "ArchLink Professional"}</p>
              <Link className="details-link" to={`/portfolio/${project._id}`}>Explore Project →</Link>
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && <p className="results-count">Showing {filteredProjects.length} of {projects.length} projects</p>}
    </main>
  );
}

export default Projects;
