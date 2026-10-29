import { useEffect, useState } from "react";
import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";
import "../../styles/ManagerNavbar.css";

function ManagerNavbar() {

  const [user, setUser] = useState(null);

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

  }, []);

  return (
    <header className="dashboard-navbar">

      <div className="navbar-search">

        <FaSearch />

        <input
          type="text"
          placeholder="Search..."
        />

      </div>


      <div className="navbar-right">

        <button className="notification-btn">

          <FaBell />

        </button>


        <div className="navbar-profile">

          <FaUserCircle className="profile-icon" />

          <div className="profile-info">

            <strong>
              {user?.name || "Manager"}
            </strong>

            <span>
              Manager
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}

export default ManagerNavbar;