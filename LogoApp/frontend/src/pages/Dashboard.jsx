import React, { useState } from 'react';
import { Users, Calendar, Receipt, Bell, CheckCircle, TrendingUp } from 'lucide-react';
import { mockPatients, mockAppointments, mockInvoices } from '../mockData';
import './Dashboard.css';

// Mock today = 2023-11-15 to match data
const MOCK_TODAY = new Date('2023-11-15T00:00:00');

const Dashboard = () => {
  const [notifications] = useState([
    { id: 1, text: 'Sofía Gómez ha confirmado su cita para mañana.', type: 'success', time: 'hace 5 min' },
    { id: 2, text: 'Recordatorio enviado a Carlos Ruiz (Terapia 12:00).', type: 'info', time: 'hace 1 h' },
    { id: 3, text: 'Mateo Navarro tiene pago pendiente desde el 12 Nov.', type: 'warning', time: 'hace 2 h' },
  ]);

  const todayAppointments = mockAppointments.filter(
    a => new Date(a.date).toDateString() === MOCK_TODAY.toDateString()
  );
  const activePatients = mockPatients.filter(p => p.status === 'active').length;
  const pendingPayments = mockInvoices.filter(inv => inv.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="dashboard">
      <h1 className="page-title">Bienvenido, Dr. Terapeuta 👋</h1>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="card summary-card">
          <div className="summary-icon-wrap" style={{ background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)' }}>
            <Calendar size={26} color="var(--primary)" />
          </div>
          <div>
            <p className="summary-label">Citas Hoy</p>
            <p className="summary-value">{todayAppointments.length}</p>
          </div>
          <span className="summary-trend trend-up"><TrendingUp size={14} /> +2 esta semana</span>
        </div>

        <div className="card summary-card">
          <div className="summary-icon-wrap" style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' }}>
            <Users size={26} color="var(--success)" />
          </div>
          <div>
            <p className="summary-label">Pacientes Activos</p>
            <p className="summary-value">{activePatients}</p>
          </div>
          <span className="summary-trend trend-up"><TrendingUp size={14} /> +1 este mes</span>
        </div>

        <div className="card summary-card">
          <div className="summary-icon-wrap" style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
            <Receipt size={26} color="var(--warning)" />
          </div>
          <div>
            <p className="summary-label">Pagos Pendientes</p>
            <p className="summary-value">{pendingPayments} €</p>
          </div>
          <span className="summary-trend trend-warn">2 facturas</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Agenda de Hoy · {MOCK_TODAY.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
          </div>
          <ul className="schedule-list">
            {todayAppointments.map(app => (
              <li key={app.id} className="schedule-item">
                <div className="schedule-time">
                  {new Date(app.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="schedule-details">
                  <p className="fw-600">{app.patientName}</p>
                  <span className="badge badge-neutral">{app.type}</span>
                </div>
                <span className={`badge ${app.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                  {app.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </span>
              </li>
            ))}
            {todayAppointments.length === 0 && (
              <div className="empty-state py-4">
                <Calendar size={36} />
                <p>No hay citas programadas para hoy.</p>
              </div>
            )}
          </ul>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Notificaciones</h2>
            <Bell size={18} color="var(--text-muted)" />
          </div>
          <ul className="notification-list">
            {notifications.map(notif => (
              <li key={notif.id} className={`notification-item notif-${notif.type}`}>
                <div className="notif-dot-indicator" />
                <div className="notif-body">
                  <p>{notif.text}</p>
                  <span className="text-muted">{notif.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
