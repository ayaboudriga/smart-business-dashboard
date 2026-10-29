
import { useEffect, useState } from "react";
import "../../styles/AdminNavbar.css";

function AdminNavbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="admin-navbar">
      {/* Left */}
      <div className="admin-navbar-left">
        <div className="admin-navbar-title">
          <span>NovaTech</span>
          <small>Administration</small>
        </div>
      </div>

      {/* Right */}
      <div className="admin-navbar-right">
        {/* Time */}
        <div className="admin-navbar-time">
          <svg
            className="navbar-icon time-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>

          <div>
            <strong>
              {currentTime.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </strong>

            <small>
              {currentTime.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </small>
          </div>
        </div>

        {/* Notification */}
        <button
          type="button"
          className="admin-notification"
          aria-label="Notifications"
        >
          <svg
            className="navbar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          <span aria-hidden="true"></span>
        </button>

        {/* Admin */}
        <div className="admin-profile">
          <div className="admin-avatar">
            <svg
              className="navbar-icon avatar-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
          </div>

          <div className="admin-profile-info">
            <strong>Administrator</strong>
            <small>Admin</small>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
