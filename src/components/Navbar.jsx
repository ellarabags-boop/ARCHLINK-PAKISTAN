import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          ArchLink <span>Pakistan</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/providers">Providers</Link>
          <Link to="/about">About</Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              {user?.role === "provider" && (
                <>
                  <Link to="/provider-dashboard">Dashboard</Link>
                  <Link to="/provider-verification">Verification</Link>
                  <Link to="/meetings">Meetings</Link>
                </>
              )}
               {user?.role === "client" && (
  <>
    <Link to="/my-requests">My Requests</Link>
    <Link to="/meetings">Meetings</Link>
  </>
)}
              {user && (
                <>
                  <Link to="/notifications">Notifications</Link>
                  <Link to="/chat-inbox">Messages</Link>
                  <Link to="/payments">Payments</Link>
                </>
)}
     {user?.role === "admin" && (
  <Link to="/admin">
    Admin Dashboard
  </Link>
)}
              <button className="nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
