import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { openDB } from "idb";
import "./login.css";

function Login({ setUser }) {
  const navigate = useNavigate();

  const getDetectionHistory = async (email) => {
    const db = await openDB("DetectionHistory", 1);
    const tx = db.transaction("history", "readonly");
    const store = tx.objectStore("history");
    const data = await store.get(email);
    return data ? data.history : [];
  };

  const handleSuccess = async (response) => {
    const decoded = jwtDecode(response.credential);
    setUser(decoded);
    navigate("/");

    const userHistory = await getDetectionHistory(decoded.email);
    console.log(userHistory);
  };

  return (
    <div className="login-wrapper">
      {/* Tambahkan logo di sini */}
      <img src="images\logo_degroove.png" alt="DEGROOVE Logo" className="login-logo" />

      <div className="login-box">
        <h1 className="login-title">Login with Google</h1>
        <p className="login-description">
          Mangrove Detection using <br /> Multimodel Machine Learning <br /> Algorithm
        </p>
        <div className="google-login-button">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log("Login Failed")}
            theme="outline"
            size="large"
            width="260"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
