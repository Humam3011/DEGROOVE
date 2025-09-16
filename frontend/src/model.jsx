import React, { useState } from "react";
import "./Model.css"; // Pastikan ada file CSS untuk styling
import { useNavigate } from "react-router-dom";

const Model = () => {
  const [hoveredModel, setHoveredModel] = useState(null);
  const navigate = useNavigate();

  const models = [
    {
      id: "yolo",
      name: "YOLO v8",
      description: (
        <>
          <h2 className="popup-title">You Only Look Once v8</h2>
          <p className="popup-text">Model deteksi objek real-time dengan efisiensi tinggi</p>
          <p></p>
          <p className="popup-text2">Kelebihan : Cepat, Akurat</p>
          <p></p>
          <p className="popup-text2">Kekurangan : Performa turun untuk objek kecil dan tumpang tindih </p>
          <img src="/images/ContohYOLO.jpg" alt="Contoh 1" className="sample-img-new" />
        </>
      ),
    },
    {
      id: "rtdetr",
      name: "RT-DETR",
      description: (
        <>
          <h2 className="popup-title">RT-DETR</h2>
          <p className="popup-text">Model berbasis Transformer untuk deteksi objek real-time </p>
          <p></p>
          <p className="popup-text2">Kelebihan : Akurasi tinggi</p>
          <p></p>
          <p className="popup-text2">Kekurangan : Waktu Pemrosesan yang lama</p>
          <img src="/images/ContohRTDETR.jpg" alt="Contoh 1" className="sample-img-new" />
        </>
      ),
    },
    {
      id: "rtmdet",
      name: "RTMDet",
      description: (
        <>
          <h2 className="popup-title">Real-Time Detection Transformer</h2>
          <p className="popup-text">Model lightweight untuk deteksi objek dengan efisiensi tinggi</p>
          <p></p>
          <p className="popup-text2">Kelebihan : Performa tinggi, Cepat</p>
          <p></p>
          <p className="popup-text2">Kekurangan : Kurang presisis dibanding model Transformer-based</p>
          <img src="/images/ContohRTMDET.jpg" alt="Contoh 1" className="sample-img-new" />
        </>
      ),
    },
    {
      id: "efficiendet",
      name: "Efficiendet",
      description: (
        <>
          <h2 className="popup-title">Efficiendet</h2>
          <p className="popup-text">Model deteksi berbasis EfficientNet, mengoptimalkan skala model</p>
          <p></p>
          <p className="popup-text2">Kelebihan : Efisien, akurasi tinggi dengan ukuran model kecil</p>
          <p></p>
          <p className="popup-text2">Kekurangan : Inferensi lebih lambat dibanding YOLO </p>
          <img src="/images/ContohYOLO.jpg" alt="Contoh 1" className="sample-img-new" />
        </>
      ),
    },
    {
      id: "retinanet",
      name: "RetinaNet",
      description: (
        <>
          <h2 className="popup-title">RetinaNet</h2>
          <p className="popup-text">Model deteksi berbasis Focal Loss untuk menangani class imbalance</p>
          <p></p>
          <p className="popup-text2">Kelebihan : Akurat untuk objek kecil dan tidak seimbang</p>
          <p></p>
          <p className="popup-text2">Kekurangan : Lebih lambat dibanding YOLO</p>
          <img src="/images/ContohRetina.jpg" alt="Contoh 1" className="sample-img-new" />
        </>
      ),
    },
    {
      id: "centernet",
      name: "CenterNet",
      description: (
        <>
          <h2 className="popup-title">CenterNet</h2>
          <p className="popup-text">Model yang memprediksi pusat objek tanpa anchor box</p>
          <p></p>
          <p className="popup-text2">Kelebihan : Sederhana, akurat, tidak membutuhkan anchor</p>
          <p></p>
          <p className="popup-text2">Kekurangan : Tidak secepat YOLO, kurang optimal untuk skala besar</p>
          <img src="/images/ContohYOLO.jpg" alt="Contoh 1" className="sample-img-new" />
        </>
      ),
    },
    {
      id: "mobilenet",
      name: "MobileNet",
      description: (
        <>
          <h2 className="popup-title">MobileNet</h2>
          <p className="popup-text">Model ringan untuk visi komputer, sering dipakai pada perangkat mobile</p>
          <p></p>
          <p className="popup-text2">Kelebihan : Cepat, ringan, hemat, daya</p>
          <p></p>
          <p className="popup-text2">Kekurangan : Akurasi lebih rendah dibanding model besar</p>
          <img src="/images/ContohMobile.jpg" alt="Contoh 1" className="sample-img-new" />
        </>
      ),
    },
  ];

return (
  <>
    <div className="model-container">
      {/* Kiri - daftar model */}
      <div className="model-list">
        {models.map((model) => (
          <div
            key={model.id}
            className="model-item"
            onMouseEnter={() => setHoveredModel(model)}
            onMouseLeave={() => setHoveredModel(null)}
          >
            {model.name}
          </div>
        ))}
      </div>

      {/* Kanan - tampilan model */}
      <div className="model-display">
        {hoveredModel ? (
          <div className="model-popup">{hoveredModel.description}</div>
        ) : (
          <img
            src="/images/model.png"
            alt="Gambar Model"
            className="model-image"
          />
        )}
      </div>
    </div>

    {/* Tombol di luar container */}
    <button className="custom-button" onClick={() => navigate("/unggah")}>
      Mulai Deteksi
    </button>
  </>
);

};

export default Model;
