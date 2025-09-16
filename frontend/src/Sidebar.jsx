import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    toggleSidebar();
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button onClick={toggleSidebar} className="toggle-btn">
        ☰
      </button>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/" onClick={() => handleNavigation("/")}>
              Beranda
            </NavLink>
          </li>
          <li>
            <NavLink to="/model" onClick={() => handleNavigation("/model")}>
              Model
            </NavLink>
          </li>
          <li>
            <NavLink to="/unggah" onClick={() => handleNavigation("/unggah")}>
              Deteksi
            </NavLink>
          </li>
          <li>
            <NavLink to="/hasilDeteksi" onClick={() => handleNavigation("/hasilDeteksi")}>
              Hasil Deteksi
            </NavLink>
          </li>
        </ul>

        {/* Logout ditempatkan di luar <ul> dan akan berada di bawah */}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
