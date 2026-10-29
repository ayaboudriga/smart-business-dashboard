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
          <span className="time-icon">🕐</span>

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
        <button className="admin-notification">
          🔔
          <span></span>
        </button>

        {/* Admin */}
        <div className="admin-profile">
          <div className="admin-avatar">
            A
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