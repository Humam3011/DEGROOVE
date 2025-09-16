import React, { useState } from "react";
import "./hasilDeteksi.css";

function HasilDeteksi({ detectionData, isSidebarOpen }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className={`hasil-deteksi-wrapper ${isSidebarOpen ? "with-sidebar" : "without-sidebar"}`}>
      <div className="hasil-detect-container">
        <h2>Hasil Deteksi</h2>

        {detectionData.length > 0 ? (
          <div className="image-grid">
            {detectionData.map((data, index) => (
              <div key={index} className="image-card" onClick={() => setSelectedImage(data)}>
                <img src={data.image_url.startsWith("http") ? data.image_url : `http://127.0.0.1:8000${data.image_url}`} alt={`Detected ${index}`} />
                <div className="detected-info">
                  <ul>
                    {Object.entries(data.detected_objects).map(([label, count]) => (
                      <li key={label}>
                        {label}: {count}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Total objek:</strong> {data.total_objects}
                  </p>
                  <p>
                    <strong>Estimasi karbon:</strong> {data.carbon_estimate_kg != null ? data.carbon_estimate_kg.toFixed(2) : "N/A"} kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Tidak ada hasil deteksi</p>
        )}
      </div>

      {/* Preview popup untuk gambar yang dipilih */}
      {selectedImage && (
        <div className="popup" onClick={() => setSelectedImage(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.image_url.startsWith("http") ? selectedImage.image_url : `http://127.0.0.1:8000${selectedImage.image_url}`} alt="Detail" />
            <h3>Detected Species</h3>
            <div className="popup-scroll">
              <ul>
                {Object.entries(selectedImage.detected_objects).map(([label, count]) => (
                  <li key={label}>
                    {label}: {count}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Total objek:</strong> {selectedImage.total_objects}
              </p>
              <p>
                <strong>Estimasi karbon:</strong> {selectedImage.carbon_estimate_kg != null ? selectedImage.carbon_estimate_kg.toFixed(2) : "N/A"} kg
              </p>
            </div>
            <button className="close-btn" onClick={() => setSelectedImage(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HasilDeteksi;
