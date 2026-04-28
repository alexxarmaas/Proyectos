import React, { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { mockPatients } from '../mockData';
import { useToast } from '../context/ToastContext';
import './Agenda.css';

// Get week start (Monday) from any date
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDateISO = (date) => date.toISOString().slice(0, 10);

// Initial appointments state (can be mutated locally)
const INITIAL_APPOINTMENTS = [
  { id: 1, patientId: 1, patientName: 'Hugo Martín', date: '2023-11-13T10:00:00', type: 'Evaluación', status: 'confirmed' },
  { id: 2, patientId: 3, patientName: 'Carlos Ruiz', date: '2023-11-14T12:00:00', type: 'Terapia', status: 'pending' },
  { id: 3, patientId: 2, patientName: 'Sofía Gómez', date: '2023-11-15T09:00:00', type: 'Terapia', status: 'confirmed' },
  { id: 4, patientId: 5, patientName: 'Mateo Navarro', date: '2023-11-16T17:00:00', type: 'Revisión', status: 'pending' },
  { id: 5, patientId: 1, patientName: 'Hugo Martín', date: '2023-11-17T11:00:00', type: 'Terapia', status: 'confirmed' },
];

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00'];
const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const Agenda = () => {
  const { showToast } = useToast();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date('2023-11-13')));
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [showModal, setShowModal] = useState(false);
  const [newApt, setNewApt] = useState({ patientId: '', date: '', time: '10:00', type: 'Terapia' });

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const getAptForCell = (dayDate, hour) => {
    const dateStr = formatDateISO(dayDate);
    return appointments.find(a => a.date.startsWith(dateStr) && a.date.includes(`T${hour}:`));
  };

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));

  const handleCreate = (e) => {
    e.preventDefault();
    const patient = mockPatients.find(p => p.id === parseInt(newApt.patientId));
    const created = {
      id: appointments.length + 1,
      patientId: parseInt(newApt.patientId),
      patientName: patient?.name || 'Desconocido',
      date: `${newApt.date}T${newApt.time}:00`,
      type: newApt.type,
      status: 'pending',
    };
    setAppointments(prev => [...prev, created]);
    setShowModal(false);
    setNewApt({ patientId: '', date: '', time: '10:00', type: 'Terapia' });
    showToast(`Cita con ${created.patientName} creada correctamente.`, 'success');
  };

  const cancelApt = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast('Cita cancelada.', 'info');
  };

  const weekLabel = `${weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${weekDays[4].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="agenda-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Agenda Semanal</h1>
        <div className="flex items-center gap-3">
          <div className="week-nav">
            <button className="btn-icon" onClick={prevWeek} title="Semana anterior"><ChevronLeft size={18} /></button>
            <span className="week-label">{weekLabel}</span>
            <button className="btn-icon" onClick={nextWeek} title="Siguiente semana"><ChevronRight size={18} /></button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nueva Cita
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="card calendar-card">
        <div className="calendar-grid">
          {/* Header row */}
          <div className="cal-cell cal-header time-header">Hora</div>
          {weekDays.map((day, i) => (
            <div key={i} className={`cal-cell cal-header day-header ${formatDateISO(day) === formatDateISO(new Date('2023-11-13')) ? 'today-header' : ''}`}>
              <span className="day-name">{DAY_NAMES[i]}</span>
              <span className="day-date">{day.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
            </div>
          ))}

          {/* Time rows */}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className="cal-cell time-cell">{hour}</div>
              {weekDays.map((day, di) => {
                const apt = getAptForCell(day, hour);
                return (
                  <div key={di} className={`cal-cell body-cell ${apt ? 'has-apt' : ''}`}>
                    {apt && (
                      <div className={`apt-block status-${apt.status}`} title={`${apt.patientName} — ${apt.type}`}>
                        <span className="apt-name">{apt.patientName}</span>
                        <span className="apt-type-label">{apt.type}</span>
                        <button
                          className="apt-cancel"
                          onClick={() => cancelApt(apt.id)}
                          title="Cancelar cita"
                          aria-label="Cancelar cita"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">Nueva Cita</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="apt-patient">Paciente</label>
                <select
                  id="apt-patient"
                  className="form-control"
                  required
                  value={newApt.patientId}
                  onChange={e => setNewApt(p => ({ ...p, patientId: e.target.value }))}
                >
                  <option value="">Seleccione un paciente...</option>
                  {mockPatients.filter(p => p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="form-group flex-1">
                  <label htmlFor="apt-date">Fecha</label>
                  <input
                    id="apt-date"
                    type="date"
                    className="form-control"
                    required
                    value={newApt.date}
                    onChange={e => setNewApt(p => ({ ...p, date: e.target.value }))}
                  />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="apt-time">Hora</label>
                  <input
                    id="apt-time"
                    type="time"
                    className="form-control"
                    required
                    value={newApt.time}
                    onChange={e => setNewApt(p => ({ ...p, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="apt-type">Tipo de Sesión</label>
                <select
                  id="apt-type"
                  className="form-control"
                  value={newApt.type}
                  onChange={e => setNewApt(p => ({ ...p, type: e.target.value }))}
                >
                  <option value="Terapia">Terapia</option>
                  <option value="Evaluación">Evaluación</option>
                  <option value="Revisión">Revisión</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cita</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
