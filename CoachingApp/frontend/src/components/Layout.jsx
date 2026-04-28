import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, LogOut, Activity, Moon, Sun, Menu, X, BarChart, BookOpen } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isSidebarOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="app-container">
      {isSidebarOpen && <button className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-label="Cerrar menú" />}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="CoachCRM Logo" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', backgroundColor: '#fff', border: '2px solid rgba(255,255,255,0.1)' }} />
          CoachCRM
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/clients" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={20} />
            Mis Clientes
          </NavLink>
          <NavLink to="/agenda" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <CalendarDays size={20} />
            Agenda
          </NavLink>
          <NavLink to="/finanzas" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <BarChart size={20} />
            Finanzas
          </NavLink>
          <NavLink to="/recursos" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <BookOpen size={20} />
            Recursos
          </NavLink>
        </nav>

        <div className="sidebar-footer" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú">
              <Menu size={20} />
            </button>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
              Panel de Administración
            </div>
          </div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setIsDark(!isDark)}
              style={{ background: 'transparent', color: 'var(--text-main)' }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              CM
            </div>
            <span className="topbar-user" style={{ fontWeight: 500 }}>Coach M. Demo</span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
