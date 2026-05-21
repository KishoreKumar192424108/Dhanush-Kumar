import React, { createContext, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadDataset from './pages/UploadDataset';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import './App.css';

export const ThemeContext = createContext({ darkMode: false, setDarkMode: () => {} });

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={darkMode ? 'app dark' : 'app'}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadDataset />} />
            <Route path="/dashboard/:filename" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
