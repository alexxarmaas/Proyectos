import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO, isFuture, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Agenda() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando agenda...</div>;

  // Simple grouping Logic for MVP (Upcoming vs Past)
  const upcomingSessions = sessions.filter(s => s.status === 'pending');
  const pastSessions = sessions.filter(s => s.status !== 'pending');

  return (
    <div>
      <h1 className="page-title">Agenda Semanal</h1>
      <p className="page-description">Revisa tus próximas sesiones programadas y el historial de sesiones completadas.</p>

      <div style={{ display: 'grid', gap: '32px' }}>
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Sesiones Pendientes (Próximamente)</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Tema</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {upcomingSessions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No tienes sesiones pendientes.</td>
                </tr>
              ) : (
                upcomingSessions.map(session => (
                  <tr key={session.id}>
                    <td style={{ fontWeight: 500, color: 'var(--primary)' }}>
                      {format(parseISO(session.date), "EEEE, d 'de' MMMM", { locale: es })} a las {session.time}
                    </td>
                    <td style={{ fontWeight: 500 }}>{session.clientName}</td>
                    <td>{session.topic}</td>
                    <td>
                      <Link to={`/clients/${session.client_id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        Ver Ficha
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Historial (Completadas/Canceladas)</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pastSessions.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No hay historial.</td>
                </tr>
              ) : (
                pastSessions.map(session => (
                  <tr key={session.id}>
                    <td>
                      {format(parseISO(session.date), "dd/MM/yyyy", { locale: es })} - {session.time}
                    </td>
                    <td>{session.clientName}</td>
                    <td>
                      <span className={`badge ${session.status}`}>
                        {session.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}
