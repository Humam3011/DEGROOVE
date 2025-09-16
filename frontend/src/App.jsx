import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./Sidebar";
import Beranda from "./Beranda";
import Model from "./model";
import Unggah from "./unggah";
import HasilDeteksi from "./HasilDeteksi";
import Login from "./Login";
import Logout from "./Logout";
import ProtectedRoute from "./ProtectedRoute";
import Riwayat from "./Riwayat";
import "./App.css";

const clientId =
  "308437513320-kqlc39l3b3qck2b1d28tntdnj5hpd8uj.apps.googleusercontent.com";

function App() {
  const [detectionData, setDetectionData] = useState([]);
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        {user && (
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}

        <div className={`content ${isSidebarOpen ? "with-sidebar" : "without-sidebar"}`}>
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/logout" element={<Logout setUser={setUser} />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <Beranda isSidebarOpen={isSidebarOpen} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/model"
              element={
                <ProtectedRoute user={user}>
                  <Model isSidebarOpen={isSidebarOpen} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unggah"
              element={
                <ProtectedRoute user={user}>
                  <Unggah
                    setDetectionData={setDetectionData}
                    isSidebarOpen={isSidebarOpen}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hasilDeteksi"
              element={
                <ProtectedRoute user={user}>
                  <HasilDeteksi
                    detectionData={detectionData}
                    isSidebarOpen={isSidebarOpen}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/riwayat"
              element={
                <ProtectedRoute user={user}>
                  <Riwayat user={user} isSidebarOpen={isSidebarOpen} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
