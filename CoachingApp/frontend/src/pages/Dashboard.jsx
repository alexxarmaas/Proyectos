import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, CalendarDays, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard, FileText, Plus, UserPlus, Play } from 'lucide-react';

const chartData = [
  { name: 'Ene', sesiones: 4 },
  { name: 'Feb', sesiones: 7 },
  { name: 'Mar', sesiones: 5 },
  { name: 'Abr', sesiones: 11 },
  { name: 'May', sesiones: 9 },
  { name: 'Jun', sesiones: 15 },
];

export default function Dashboard() {
  const [data, setData] = useState({
    activeClientsCount: 0,
    upcomingSessionsCount: 0,
    recentSessions: [],
    totalRevenue: 0,
    pendingInvoicesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando dashboard...</div>;

  return (
    <div>
      <h1 className="page-title">Resumen General</h1>
      <p className="page-description">Bienvenido de vuelta. Aquí tienes un vistazo a tu actividad reciente.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Clientes Activos</h3>
            <p>{data.activeClientsCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <CalendarDays size={24} />
          </div>
          <div className="stat-content">
            <h3>Sesiones Pendientes</h3>
            <p>{data.upcomingSessionsCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h3>Estado</h3>
            <p>Saludable</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#5b21b6' }}>
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <h3>Ingresos del Mes</h3>
            <p>€{data.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--amber-soft)', color: '#9a6207' }}>
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>Facturas Pend.</h3>
            <p>{data.pendingInvoicesCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="panel quick-actions-panel" style={{ marginBottom: '24px' }}>
        <div className="panel-heading">
          <h2 className="panel-title">Acciones Rápidas</h2>
        </div>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/clients')}>
            <div className="qa-icon blue"><UserPlus size={24} /></div>
            Nuevo Cliente
          </button>
          <button className="quick-action-card" onClick={() => navigate('/agenda')}>
            <div className="qa-icon green"><Play size={24} /></div>
            Programar Sesión
          </button>
          <button className="quick-action-card" onClick={() => navigate('/finanzas')}>
            <div className="qa-icon yellow"><CreditCard size={24} /></div>
            Emitir Factura
          </button>
          <button className="quick-action-card" onClick={() => navigate('/recursos')}>
            <div className="qa-icon" style={{ background: '#ede9fe', color: '#5b21b6' }}><FileText size={24} /></div>
            Compartir Recurso
          </button>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <h2 className="panel-title" style={{ marginBottom: '24px' }}>Evolución de Sesiones</h2>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px' }} 
              />
              <Area type="monotone" dataKey="sesiones" stroke="var(--primary)" fillOpacity={1} fill="url(#colorSesiones)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Próximas Sesiones</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/agenda')}>Ver Agenda</button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th>Tema</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSessions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No hay sesiones recientes.
                  </td>
                </tr>
              ) : (
                data.recentSessions.map(session => (
                  <tr key={session.id}>
                    <td style={{ fontWeight: 500 }}>{session.clientName}</td>
                    <td>
                      {format(parseISO(session.date), "d 'de' MMMM, yyyy", { locale: es })} - {session.time}
                    </td>
                    <td>{session.topic || 'Sin definir'}</td>
                    <td>
                      <span className={`badge ${session.status}`}>
                        {session.status === 'pending' ? 'Pendiente' : session.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/clients/${session.client_id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Ver Ficha
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
