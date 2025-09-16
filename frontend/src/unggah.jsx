import React from "react";
import { useNavigate } from "react-router-dom";
import UploadForm from "./UploadForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "./unggah.css";

function Unggah({ setDetectionData, isSidebarOpen }) {
  const navigate = useNavigate();

  const handleDetectionComplete = (data) => {
    setDetectionData(data);
    navigate("/hasilDeteksi");
  };

  return (
    <div className={`unggah-wrapper ${isSidebarOpen ? "with-sidebar" : "without-sidebar"}`}>
      <div className="unggah-container d-flex justify-content-center align-items-start gap-5">
        {/* KIRI: Contoh gambar */}
        <div className="unggah-sample">
          <p className="sample-text">Contoh gambar yang dapat digunakan:</p>
          <div className="sample-images">
            <img src="/images/Decor1.jpg" alt="Contoh 1" className="sample-img" />
            <img src="/images/Decor2.jpg" alt="Contoh 2" className="sample-img" />
          </div>
        </div>

        {/* TENGAH: Kotak Unggah */}
        <div className="unggah-box text-center">
          <h1 className="unggah-title">Unggah Gambar</h1>
          <p className="unggah-description">
            Silahkan unggah gambar mangrove yang diambil menggunakan drone dengan minimal resolusi 657 x 657 px
          </p>
          <UploadForm onDetectionComplete={handleDetectionComplete} />
        </div>
      </div>
    </div>
  );
}

export default Unggah;
