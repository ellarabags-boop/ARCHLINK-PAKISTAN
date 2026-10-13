import { Link } from "react-router-dom";

const values = [
  { number: "01", title: "Discover Talent", text: "Browse architecture, drafting, interior design, and visualization services from professionals across Pakistan." },
  { number: "02", title: "Review Real Work", text: "Explore provider profiles, portfolio projects, service details, and client reviews before sending a request." },
  { number: "03", title: "Manage Requests", text: "Track service inquiries and request status through your ArchLink account." },
];

function About() {
  return (
    <main>
      <section className="about-hero">
        <p className="small-label">ABOUT ARCHLINK</p>
        <h1>Connecting Ideas with the People Who Build Them</h1>
        <p>ArchLink Pakistan is an architecture and construction services marketplace designed to help clients discover professionals, compare services, and explore project portfolios in one place.</p>
        <div className="about-actions"><Link className="primary-btn button-link" to="/services">Explore Services</Link><Link className="secondary-btn button-link" to="/providers">Meet Providers</Link></div>
      </section>
      <section className="section">
        <div className="section-heading"><div><p className="small-label">HOW IT WORKS</p><h2>A Clearer Way to Find Expertise</h2></div></div>
        <div className="features-grid">
          {values.map((value) => <article className="feature-card" key={value.number}><span>{value.number}</span><h3>{value.title}</h3><p>{value.text}</p></article>)}
        </div>
      </section>
      <section className="about-trust">
        <div><p className="small-label">BUILT FOR TRANSPARENCY</p><h2>Professional Work. Clear Information.</h2><p>Provider profiles, service descriptions, portfolio entries, request statuses, and reviews help clients make more informed decisions. Platform verification labels should only be shown after the submitted information has actually been reviewed.</p></div>
        <div className="trust-points"><p>✓ Search by city and category</p><p>✓ View professional portfolios</p><p>✓ Send and track service requests</p><p>✓ Review eligible completed engagements</p></div>
      </section>
    </main>
  );
}

export default About;
