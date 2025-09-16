import React, { useState } from "react";
import "./detection_result.css";
import "bootstrap/dist/css/bootstrap.min.css";

function DetectionResult({ data }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedObjects, setSelectedObjects] = useState([]);

  const handleImageClick = (imageUrl, detectedObjects) => {
    setSelectedImage(imageUrl);
    setSelectedObjects(detectedObjects);
  };

  return (
    <div className="result-container">
      <h2>Detection Results</h2>
      <div className="image-grid">
        {data.map((result, index) => (
          <div key={index} className="image-item" onClick={() => handleImageClick(result.image_url, result.detected_objects)}>
            <img src={`http://127.0.0.1:8000${result.image_url}`} alt={`Detected Image ${index + 1}`} />
          </div>
        ))}
      </div>

      {/* Bootstrap Modal untuk menampilkan gambar yang diklik */}
      {selectedImage && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detection Details</h5>
                <button type="button" className="close" onClick={() => setSelectedImage(null)}>
                  &times;
                </button>
              </div>
              <div className="modal-body text-center">
                <img src={`http://127.0.0.1:8000${selectedImage}`} alt="Selected" className="modal-image" />
                <h4 className="mt-3">Detected Objects</h4>
                <ul className="list-group">
                  {Object.entries(selectedObjects).map(([label, count]) => (
                    <li key={label} className="list-group-item">
                      {label}: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetectionResult;
