import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function Services() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [city, setCity] = useState(() => searchParams.get("city") || "");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/services"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load services"
          );
        }

        setServices(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Get unique cities
  const cities = useMemo(() => {
    return [
      ...new Set(
        services
          .map((service) => service.city)
          .filter(Boolean)
      ),
    ].sort();
  }, [services]);

  // Get unique categories
  const categories = useMemo(() => {
    return [
      ...new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [services]);

  // Search + filters
  const filteredServices = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return services.filter((service) => {
      const matchesSearch =
        !searchText ||
        service.title?.toLowerCase().includes(searchText) ||
        service.description
          ?.toLowerCase()
          .includes(searchText) ||
        service.category
          ?.toLowerCase()
          .includes(searchText) ||
        service.city?.toLowerCase().includes(searchText);

      const matchesCity =
        !city || service.city === city;

      const matchesCategory =
        !category || service.category === category;

      return (
        matchesSearch &&
        matchesCity &&
        matchesCategory
      );
    });
  }, [services, search, city, category]);

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setCategory("");
  };

  return (
    <main className="section">

      {/* Page Header */}
      <div className="section-heading">
        <div>
          <p className="small-label">
            ARCHLINK MARKETPLACE
          </p>

          <h1>Architecture Services</h1>

          <p>
            Find professional architecture services
            across Pakistan.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <div className="marketplace-filter-controls">

          {/* Search */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Search
            </label>

            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />
          </div>

          {/* City */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              City
            </label>

            <select
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "15px",
                background: "#fff",
              }}
            >
              <option value="">All Cities</option>

              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "15px",
                background: "#fff",
              }}
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Clear */}
          <button
            onClick={clearFilters}
            className="secondary-btn"
            style={{
              height: "45px",
              whiteSpace: "nowrap",
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Result Count */}
      {!loading && !error && (
        <div
          style={{
            marginBottom: "20px",
            color: "#555",
          }}
        >
          <strong>
            {filteredServices.length}
          </strong>{" "}
          service
          {filteredServices.length !== 1
            ? "s"
            : ""}{" "}
          found
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="empty-state">
          <h3>Loading services...</h3>
          <p>
            Please wait while we load the marketplace.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="empty-state">
          <h3>Unable to load services</h3>

          <p
            className="form-message error-message"
          >
            {error}
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading &&
        !error &&
        filteredServices.length === 0 && (
          <div className="empty-state">
            <h3>No services found</h3>

            <p>
              Try changing your search or filters.
            </p>

            <button
              className="primary-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

      {/* Services */}
      {!loading &&
        !error &&
        filteredServices.length > 0 && (
          <div className="service-grid">
            {filteredServices.map((service) => (
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
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
    </main>
  );
}

export default Services;