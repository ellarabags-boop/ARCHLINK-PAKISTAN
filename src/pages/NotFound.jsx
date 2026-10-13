import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="section">
      <div className="empty-state not-found-state">
        <p className="small-label">404 ERROR</p>
        <h1>Page Not Found</h1>
        <p>The page you are looking for may have moved or no longer exists.</p>
        <Link className="primary-btn button-link" to="/">Return to Home</Link>
      </div>
    </main>
  );
}

export default NotFound;
