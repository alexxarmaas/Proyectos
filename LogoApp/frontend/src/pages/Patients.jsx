import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, UserPlus, AlertCircle, FileText, ChevronRight, ArrowLeft, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { mockPatients } from '../mockData';
import './Patients.css';

const Patients = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Handle navigation from global search
  useEffect(() => {
    if (location.state?.selectedPatientId) {
      const patient = mockPatients.find(p => p.id === location.state.selectedPatientId);
      if (patient) setSelectedPatient(patient);
    }
  }, [location.state]);

  const filtered = mockPatients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (selectedPatient) {
    return <PatientProfile patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Pacientes</h1>
        <button className="btn btn-primary">
          <UserPlus size={18} /> Nuevo Paciente
        </button>
      </div>

      <div className="card">
        <div className="patients-toolbar">
          <div className="search-wrapper" style={{ maxWidth: '360px' }}>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-left" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre o diagnóstico..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-tabs">
            {['all', 'active', 'inactive'].map(s => (
              <button
                key={s}
                className={`filter-tab ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {{ all: 'Todos', active: 'Activos', inactive: 'Inactivos' }[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Diagnóstico</th>
                <th>Estado</th>
                <th>Próxima Sesión</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(patient => (
                <tr key={patient.id} onClick={() => setSelectedPatient(patient)} className="clickable-row">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="profile-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                        {patient.name.charAt(0)}
                      </div>
                      <span className="fw-600">{patient.name}</span>
                    </div>
                  </td>
                  <td>{patient.age} años</td>
                  <td>{patient.diagnosis}</td>
                  <td>
                    <span className={`badge ${patient.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-muted">
                    {patient.nextSession
                      ? new Date(patient.nextSession).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                  <td><ChevronRight size={18} color="var(--text-muted)" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <Search size={36} />
                      <p>No se encontraron pacientes.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ===== PATIENT PROFILE ===== */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.5rem 0.875rem',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.875rem',
      }}>
        <p style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{payload[0].value}% progreso</p>
      </div>
    );
  }
  return null;
};

const PatientProfile = ({ patient, onBack }) => {
  const latestScore = patient.progressHistory?.at(-1)?.score ?? 0;
  const firstScore = patient.progressHistory?.[0]?.score ?? 0;
  const improvement = latestScore - firstScore;

  return (
    <div className="patient-profile">
      <button className="btn btn-secondary mb-4" onClick={onBack}>
        <ArrowLeft size={18} /> Volver a Pacientes
      </button>

      {/* Header */}
      <div className="profile-header card mb-4">
        <div className="flex items-center gap-4">
          <div className="profile-avatar" style={{ width: '72px', height: '72px', fontSize: '2rem' }}>
            {patient.name.charAt(0)}
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>{patient.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted">{patient.age} años</span>
              <span className="text-muted">·</span>
              <span className="text-muted">{patient.diagnosis}</span>
              {patient.guardianName && (
                <>
                  <span className="text-muted">·</span>
                  <span className="text-muted">Tutor: {patient.guardianName}</span>
                </>
              )}
              <span className={`badge ${patient.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                {patient.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div className="profile-score-badge">
            <TrendingUp size={18} />
            <span>+{improvement} pts</span>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Progress Chart — Feature B */}
        {patient.progressHistory && patient.progressHistory.length > 0 && (
          <div className="card profile-chart-card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2"><TrendingUp size={20} color="var(--primary)" /> Evolución del Progreso</h2>
              <span className="badge badge-primary">Puntuación: {latestScore}/100</span>
            </div>
            <div style={{ height: '200px', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patient.progressHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#progressGradient)"
                    dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Medical Alerts */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2"><AlertCircle size={20} color="var(--warning)" /> Alertas Médicas</h2>
            </div>
            <ul className="alerts-list">
              {patient.alerts.map((a, i) => (
                <li key={i} className="alert-item">
                  <span className="alert-dot" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><FileText size={20} /> Notas del Terapeuta</h2>
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>Editar</button>
          </div>
          <p className="notes-text">{patient.notes}</p>
        </div>

        {/* Session History */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h2 className="card-title">Historial de Sesiones</h2>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {patient.sessionHistory?.map((session, i) => (
                  <tr key={i}>
                    <td className="fw-600 text-muted" style={{ whiteSpace: 'nowrap' }}>{session.date}</td>
                    <td><span className="badge badge-neutral">{session.type}</span></td>
                    <td>{session.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
