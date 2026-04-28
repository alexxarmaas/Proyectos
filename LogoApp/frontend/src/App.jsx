import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Agenda from './pages/Agenda';
import Exercises from './pages/Exercises';
import Billing from './pages/Billing';
import PatientPortal from './pages/PatientPortal';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              <TopBar />
              <div className="page-wrapper">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pacientes" element={<Patients />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/ejercicios" element={<Exercises />} />
                  <Route path="/facturacion" element={<Billing />} />
                  <Route path="/portal" element={<PatientPortal />} />
                </Routes>
              </div>
            </div>
          </div>
          <Toast />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
