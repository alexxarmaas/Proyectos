import { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  CalendarDays,
  LayoutDashboard,
  Menu,
  NotebookText,
  Users,
  X,
  Leaf,
  LogOut
} from 'lucide-react';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Pacientes', icon: Users },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/consultations', label: 'Consultas', icon: NotebookText }
];

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useMemo(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: 'Nutri Demo' };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-badge">
            <Leaf size={18} />
          </div>
          <div>
            <strong>NutriApp</strong>
            <span>Demo MVP para consulta</span>
          </div>
          <button className="mobile-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <p>Ordena pacientes, seguimiento y agenda en un solo vistazo.</p>
        </div>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <div>
              <span className="eyebrow">Panel profesional</span>
              <h1>Gestión de pacientes y seguimiento</h1>
            </div>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">{user.name?.slice(0, 2)?.toUpperCase() || 'NU'}</div>
            <div>
              <strong>{user.name}</strong>
              <span>Nutricionista</span>
            </div>
          </div>
        </header>

        <main className="page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
