import { useState } from "react";
import "./upload_form.css";

// eslint-disable-next-line react/prop-types
function UploadForm({ onDetectionComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setSelectedModel(null); // Reset model saat gambar dipilih ulang
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const handleDetect = async () => {
    if (!selectedModel) {
      alert("Pilih model terlebih dahulu!");
      return;
    }
    if (selectedFiles.length === 0) {
      alert("Pilih gambar terlebih dahulu!");
      return;
    }

    setIsDetecting(true);
    const allResults = [];

    const labelOrderRetinaNet = ["Nypa", "Rhizophora", "Avicennia"];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model_type", selectedModel.toLowerCase());

      const response = await fetch("http://127.0.0.1:8000/detect/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        alert(`Error: ${result.error}`);
        setIsDetecting(false);
        return;
      }

      let validResults = {};

      if (selectedModel === "retinanet") {
        // Buat object hasil dengan urutan label sesuai labelOrderRetinaNet
        validResults = {};
        labelOrderRetinaNet.forEach((label) => {
          // Jika label ada di hasil detected_objects, masukkan count-nya, jika tidak 0
          validResults[label] = result.detected_objects[label] || 0;
        });
      } else {
        // Untuk model lain, filter hasil deteksi sesuai daftar valid yang sudah ada
        validResults = Object.entries(result.detected_objects)
          .filter(([label]) =>
            [
              "Avicennia tree",
              "Avicennia sapling",
              "Avicennia seed",
              "Rhizophora tree",
              "Rhizophora sapling",
              "Rhizophora seed",
              "Nypa",
              "avicennia tree",
              "avicennia sapling",
              "avicennia seed",
              "rhizophora tree",
              "rhizophora sapling",
              "rhizophora seed",
              "nypa",
              "Avicennia Tree",
              "Nyppa",
              "Rhizophora Tree",
            ].includes(label)
          )
          .reduce((acc, [label, count]) => ({ ...acc, [label]: count }), {});
      }

      const carbonData = result.carbon_estimation;
      let totalObjects = 0;
      let totalCarbon = 0;
      let allAreas = [];

      if (carbonData) {
        for (const label in carbonData) {
          const entry = carbonData[label];
          totalObjects += entry.count || 0;
          totalCarbon += entry.carbon || 0;
          allAreas = allAreas.concat(entry.areas || []);
        }
      }

      const averageArea = allAreas.length > 0 ? allAreas.reduce((a, b) => a + b, 0) / allAreas.length : null;

      const averageBoxSize = averageArea ? [Math.sqrt(averageArea), Math.sqrt(averageArea)] : null;

      allResults.push({
        original_file: file.name,
        image_url: `http://127.0.0.1:8000${result.image_url}`,
        detected_objects: validResults,
        total_objects: totalObjects || 0,
        carbon_estimate_kg: totalCarbon || null,
        average_bbox_size: averageBoxSize || null,
      });
    }

    setIsDetecting(false);
    onDetectionComplete(allResults);
  };

  return (
    <div className="upload-container">
      <label className="btn btn-custom">
        Choose Files
        <input type="file" className="d-none" accept="image/*" multiple onChange={handleFileChange} />
      </label>

      {selectedFiles.length > 0 && (
        <div className="image-preview-container">
          {selectedFiles.map((file, index) => (
            <img key={index} src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="preview-image" />
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="model-selection">
          <button className={`btn ${selectedModel === "yolo" ? "btn-selected" : ""}`} onClick={() => handleModelSelect("yolo")}>
            YOLO
          </button>
          <button className={`btn ${selectedModel === "rtdetr" ? "btn-selected" : ""}`} onClick={() => handleModelSelect("rtdetr")}>
            RTDETR
          </button>
          <button className={`btn ${selectedModel === "rtmdet" ? "btn-selected" : ""}`} onClick={() => handleModelSelect("rtmdet")}>
            RTMDet
          </button>
          <button className={`btn ${selectedModel === "mobilenet" ? "btn-selected" : ""}`} onClick={() => handleModelSelect("mobilenet")}>
            Mobilenet
          </button>
          <button className={`btn ${selectedModel === "retinanet" ? "btn-selected" : ""}`} onClick={() => handleModelSelect("retinanet")}>
            Retinanet
          </button>
          <button className={`btn ${selectedModel === "centernet" ? "btn-selected" : ""}`} onClick={() => handleModelSelect("centernet")}>
            CenterNet
          </button>
          <button className={`btn ${selectedModel === "efficiendet" ? "btn-selected" : ""}`} onClick={() => handleModelSelect("efficiendet")}>
            EfficientDet
          </button>
        </div>
      )}
<p></p>
      {selectedModel && (
        <button className="btn btn-detect" onClick={handleDetect} disabled={isDetecting}>
          {isDetecting ? "Detecting..." : "Start Detection"}
        </button>
      )}
    </div>
  );
}

export default UploadForm;
