// import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css"; // Pastikan file CSS digunakan

const Beranda = () => {
  const navigate = useNavigate();

  // Data gambar
  const images = [
    { src: "/images/rhizophora.png", label: "Mangrove Rhizophora", width: "350px", marginTop: "37px" },
    { src: "/images/avicennia.png", label: "Mangrove Avicennia", width: "250px", marginTop: "27px" },
    { src: "/images/nypa.png", label: "Mangrove Nypa", width: "250px" },
  ];

  return (
    <>
      <div className="container text-left mt-5">
        {/* Bagian Atas */}
        <h1 className="text text-custom1">Deteksi Jenis Mangrove</h1>
        <p className="text-muted1">Aplikasi ini merupakan aplikasi berbasis web yang dapat mendeteksi jenis 
          mangrove menggunakan algoritma machine learning multi model.</p>
        {/* <img
          src="/images/mangrove.png"
          alt="Gambar Mangrove"
          style={{
            position: "relative",
            left: "700px",
            top: "00px",
            width: "500px",
            height: "auto",
          }}
        /> */}

        {/* Bagian Tengah */}
        <h1 className="text text-custom2 ">Jenis Mangrove yang dapat dideteksi</h1>

        {/* Bagian Gambar */}
        <div className="container mt-5">
          <div className="row justify-content-center text-center">
            {images.map((item, index) => (
              <div className="col-md-4" key={index}>
                <img src={item.src} alt={item.label} style={{ width: item.width, height: "auto", 
                  marginTop: item.marginTop, borderRadius: "10px" }} />
                <p className="image-caption">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <h1 className="text text-custom3 ">Arsitektur Machine Learning yang Dapat Digunakan</h1>
        <p className="text-muted2">Berikut ini adalah beberapa model machine learning yang dapat 
          digunakan untuk mendeteksi jenis mangrove, anda dapat memilih salah satu dari model ini untuk mendeteksi jenis mangrove</p>
        {/* <img
          src="/images/modelList.png"
          alt="Gambar Mangrove"
          style={{
            position: "relative",
            left: "700px",
            // top: "10px",
            width: "500px",
            height: "auto",
          }}
        /> */}

        <div className="container-button">
          <button className="custom-button-bottom" onClick={() => navigate("/model")}>
            Lihat Model
          </button>
        </div>
      </div>
    </>
  );
};

export default Beranda;
