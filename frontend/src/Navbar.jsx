// import React from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Pastikan ada CSS untuk underline animasi

const Navbar = () => {
  const location = useLocation(); // Ambil URL saat ini

  // Tentukan halaman yang aktif berdasarkan URL
  const getActivePage = () => {
    if (location.pathname === "/model") return "model";
    if (location.pathname === "/unggah") return "unggah";
    return "beranda"; // Default halaman
  };

  const active = getActivePage();

  // Posisi underline dinamis berdasarkan halaman aktif
  const getUnderlinePosition = () => {
    switch (active) {
      case "beranda":
        return "36.7%";
      case "model":
        return "46.8%";
      case "unggah":
        return "56.9%";
      default:
        return "36.7%";
    }
  };

  return (
    <nav className="navbar navbar-expand-lg ">
      <div className="container">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav">
            {[
              { id: "beranda", label: "Beranda", path: "/" },
              { id: "model", label: "Model", path: "/model" },
              { id: "unggah", label: "Unggah", path: "/unggah" },
            ].map((item) => (
              <li className="nav-item" key={item.id}>
                <Link to={item.path} className={`nav-link fs-5 ${active === item.id ? "active" : ""}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Underline dengan posisi dinamis */}
          <div className="nav-underline" style={{ left: getUnderlinePosition() }}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
