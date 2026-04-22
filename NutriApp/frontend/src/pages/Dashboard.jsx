import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CalendarClock, HeartPulse, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../lib/api';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'short' });

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((response) => setDashboard(response.data));
  }, []);

  if (!dashboard) {
    return <div className="loading-card">Cargando dashboard...</div>;
  }

  const chartData = dashboard.monthlyActivity.map((item) => ({
    month: monthFormatter.format(new Date(`${item.month}-01T00:00:00`)),
    consultas: item.total
  }));

  return (
    <div className="page-stack">
      <section className="hero-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h2>Resumen del estado de la consulta</h2>
          <p>Los datos clave que ayudan a demostrar control, seguimiento y organización.</p>
        </div>
        <div className="hero-actions">
          <Link to="/patients" className="secondary-button">
            Ver pacientes
          </Link>
          <Link to="/agenda" className="primary-button">
            Abrir agenda
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          title="Pacientes activos"
          value={dashboard.activePatients}
          hint="Base de pacientes actualmente en seguimiento."
          icon={<Users size={20} />}
          tone="green"
        />
        <StatCard
          title="Próximas consultas"
          value={dashboard.upcomingConsultations}
          hint="Citas pendientes con fecha ya programada."
          icon={<CalendarClock size={20} />}
          tone="amber"
        />
        <StatCard
          title="Últimos seguimientos"
          value={dashboard.recentFollowUps.length}
          hint="Consultas completadas recientemente."
          icon={<HeartPulse size={20} />}
          tone="blue"
        />
      </section>

      <section className="content-grid">
        <article className="panel soft-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Actividad</span>
              <h3>Evolución de consultas registradas</h3>
            </div>
          </div>

          <div className="chart-shell">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="consultationsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3aa57c" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3aa57c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d8e4dc" />
                <XAxis dataKey="month" stroke="#61746a" />
                <YAxis stroke="#61746a" allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="consultas" stroke="#215f46" fill="url(#consultationsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Próximo</span>
              <h3>Consultas programadas</h3>
            </div>
            <Link className="panel-link" to="/consultations">
              Ver todas
            </Link>
          </div>

          <div className="list-stack">
            {dashboard.nextConsultations.length === 0 ? (
              <EmptyState title="Sin citas pendientes" description="Cuando agendes una consulta aparecerá aquí." />
            ) : (
              dashboard.nextConsultations.map((item) => (
                <div key={item.id} className="list-row">
                  <div>
                    <strong>{item.patient_name}</strong>
                    <p>
                      {format(parseISO(item.date), "d MMM yyyy", { locale: es })} · {item.time}
                    </p>
                  </div>
                  <Link to={`/patients/${item.patient_id}`} className="chip-link">
                    Ver ficha
                  </Link>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Seguimiento</span>
            <h3>Últimos seguimientos registrados</h3>
          </div>
        </div>

        {dashboard.recentFollowUps.length === 0 ? (
          <EmptyState
            title="Sin seguimientos todavía"
            description="Las consultas completadas con observaciones aparecerán aquí."
          />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentFollowUps.map((item) => (
                  <tr key={item.id}>
                    <td>{item.patient_name}</td>
                    <td>{format(parseISO(item.date), "d 'de' MMMM", { locale: es })}</td>
                    <td>{item.weight ? `${item.weight} kg` : '-'}</td>
                    <td>{item.observations || 'Sin observaciones'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
