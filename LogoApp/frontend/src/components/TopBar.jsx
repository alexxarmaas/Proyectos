import React from 'react';
import SearchBar from './SearchBar';
import { Bell } from 'lucide-react';
import './TopBar.css';

const TopBar = () => {
  return (
    <div className="top-bar">
      <SearchBar />
      <div className="top-bar-actions">
        <button className="btn-icon" aria-label="Notificaciones" title="Notificaciones">
          <Bell size={18} />
          <span className="notif-dot" aria-hidden="true" />
        </button>
        <div className="top-bar-user">
          <div className="user-avatar">DT</div>
          <div className="user-info">
            <p className="user-name">Dr. Terapeuta</p>
            <span className="user-role">Logopeda</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
