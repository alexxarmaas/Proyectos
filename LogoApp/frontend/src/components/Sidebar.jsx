import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Receipt, Dumbbell, UserCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

const Sidebar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [logoError, setLogoError] = useState(false);

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
    { path: '/pacientes', icon: <Users size={20} />, label: 'Pacientes' },
    { path: '/agenda', icon: <Calendar size={20} />, label: 'Agenda' },
    { path: '/ejercicios', icon: <Dumbbell size={20} />, label: 'Ejercicios' },
    { path: '/facturacion', icon: <Receipt size={20} />, label: 'Facturación' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        {logoError ? (
          <div className="logo-fallback">LG</div>
        ) : (
          <img
            src="/logo.png"
            alt="LogoGest"
            className="logo-img"
            onError={() => setLogoError(true)}
          />
        )}
        <h2>LogoGest</h2>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <NavLink
          to="/portal"
          className={({ isActive }) => `nav-item portal-link ${isActive ? 'active' : ''}`}
        >
          <UserCircle size={20} />
          <span>Vista Paciente</span>
        </NavLink>

        {/* Dark mode toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
