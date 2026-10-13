import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand"><Link to="/" className="logo">ArchLink <span>Pakistan</span></Link><p>An architecture and construction services marketplace connecting clients with professional talent.</p></div>
        <div><h2>Explore</h2><Link to="/services">Services</Link><Link to="/projects">Portfolio Projects</Link><Link to="/providers">Providers</Link></div>
        <div><h2>Account</h2><Link to="/login">Login</Link><Link to="/register">Create Account</Link><Link to="/about">About ArchLink</Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} ArchLink Pakistan</span><span>Built for architecture and construction professionals.</span></div>
    </footer>
  );
}

export default Footer;
