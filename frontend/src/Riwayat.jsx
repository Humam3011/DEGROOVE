import React, { useEffect, useState } from "react";
import { openDB } from "idb";
import "./riwayat.css";

function Riwayat({ user }) {
  const [history, setHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fungsi mengambil riwayat dari IndexedDB berdasarkan email pengguna
  const getDetectionHistory = async (email) => {
    const db = await openDB("DetectionHistory", 1);
    const tx = db.transaction("history", "readonly");
    const store = tx.objectStore("history");

    const data = await store.get(email);
    return data ? data.history : [];
  };

  // Memuat riwayat deteksi saat pengguna login
  useEffect(() => {
    if (user) {
      getDetectionHistory(user.email).then(setHistory);
    }
  }, [user]);

  return (
    <div className="riwayat-wrapper">
      <h2>Riwayat Deteksi</h2>

      {history.length > 0 ? (
        <div className="image-grid">
          {history.map((data, index) => (
            <div key={index} className="image-card" onClick={() => setSelectedImage(data)}>
              <img 
                src={data.image.startsWith("http") ? data.image : `http://127.0.0.1:8000${data.image}`} 
                alt={`Detected ${index}`} 
              />
              <div className="detected-info">
                <h4>Hasil Deteksi</h4>
                <ul>
                  {Object.entries(data.detectionResult).map(([label, count]) => (
                    <li key={label}>{label}: {count}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Belum ada riwayat deteksi</p>
      )}

      {/* Popup detail gambar */}
      {selectedImage && (
        <div className="popup" onClick={() => setSelectedImage(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.image.startsWith("http") ? selectedImage.image : `http://127.0.0.1:8000${selectedImage.image}`} 
              alt="Detail" 
            />
            <h3>Jenis yang Terdeteksi</h3>
            <div className="popup-scroll">
              <ul>
                {Object.entries(selectedImage.detectionResult).map(([label, count]) => (
                  <li key={label}>{label}: {count}</li>
                ))}
              </ul>
            </div>
            <button className="close-btn" onClick={() => setSelectedImage(null)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Riwayat;
