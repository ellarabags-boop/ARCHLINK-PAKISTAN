
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "/api/notifications";

function Notifications() {
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications."
        );
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update notification."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setError("");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setLoading(false);
      setError("Please log in to view your notifications.");
    }
  }, [token, fetchNotifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return (
      <main className="section notifications-page">
        <h1>Notifications</h1>
        <p>Loading notifications...</p>
      </main>
    );
  }

  return (
    <main className="section notifications-page">
      <h1>Notifications</h1>

      <p>
        Unread notifications: <strong>{unreadCount}</strong>
      </p>

      <button
        type="button"
        className="primary-btn"
        onClick={fetchNotifications}
      >
        Refresh
      </button>

      {error && <p role="alert">{error}</p>}

      {!error && notifications.length === 0 && (
        <p>You have no notifications yet.</p>
      )}

      <div className="notifications-list">
        {notifications.map((notification) => (
          <article
            key={notification._id}
            className="notification-card"
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "12px",
              background: notification.isRead
                ? "transparent"
                : "#f0f6ff",
            }}
          >
            <h2>{notification.title}</h2>
            <p>{notification.message}</p>

            <p>
              {new Date(notification.createdAt).toLocaleString()}
            </p>

            <p>
              Status: {notification.isRead ? "Read" : "Unread"}
            </p>

            {!notification.isRead && (
              <button
                type="button"
                className="primary-btn"
                onClick={() => markAsRead(notification._id)}
              >
                Mark as Read
              </button>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

export default Notifications;
