import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, PlayCircle, Mic, FileText, Check, RotateCcw } from 'lucide-react';
import { mockExercises } from '../mockData';
import { useToast } from '../context/ToastContext';
import './PatientPortal.css';

const ICONS = {
  video: <PlayCircle size={22} color="var(--primary)" />,
  audio: <Mic size={22} color="var(--accent)" />,
  text: <FileText size={22} color="var(--text-muted)" />,
};

const PatientPortal = () => {
  const { showToast } = useToast();
  const [aptStatus, setAptStatus] = useState('pending');
  const [completed, setCompleted] = useState([]);

  const toggleExercise = (id) => {
    if (completed.includes(id)) {
      setCompleted(prev => prev.filter(e => e !== id));
    } else {
      setCompleted(prev => [...prev, id]);
      showToast('¡Ejercicio marcado como completado! Buen trabajo 💪', 'success');
    }
  };

  const confirmApt = () => {
    setAptStatus('confirmed');
    showToast('Asistencia confirmada. ¡Te esperamos!', 'success');
  };

  const cancelApt = () => {
    setAptStatus('cancelled');
    showToast('Cita cancelada. Contacta con tu terapeuta para reprogramar.', 'info');
  };

  const completedCount = completed.length;
  const totalExercises = mockExercises.length;

  return (
    <div className="portal-page">
      {/* Patient Header */}
      <div className="portal-header card mb-4">
        <div className="flex items-center gap-4">
          <div className="profile-avatar" style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}>H</div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Hola, Hugo 👋</h1>
            <p className="text-muted">Bienvenido a tu portal de LogoGest</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="portal-progress">
          <div className="flex justify-between mb-1">
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Ejercicios completados</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>{completedCount}/{totalExercises}</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${(completedCount / totalExercises) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Appointment */}
      <div className="card mb-4" style={{ borderTop: `4px solid ${aptStatus === 'confirmed' ? 'var(--success)' : aptStatus === 'cancelled' ? 'var(--danger)' : 'var(--primary)'}` }}>
        <div className="card-header">
          <h2 className="card-title flex items-center gap-2"><Calendar size={20} color="var(--primary)" /> Tu Próxima Cita</h2>
        </div>

        {aptStatus !== 'cancelled' ? (
          <div className="flex flex-col gap-3">
            <div className="apt-info-box">
              <div>
                <p className="fw-600" style={{ fontSize: '1.1rem' }}>Miércoles, 15 de Noviembre de 2023</p>
                <p className="text-muted">10:00 AM · Terapia de Lenguaje · Dra. Terapeuta</p>
              </div>
              <span className={`badge ${aptStatus === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                {aptStatus === 'confirmed' ? '✓ Confirmada' : 'Pendiente'}
              </span>
            </div>

            {aptStatus === 'pending' && (
              <div className="flex gap-3">
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmApt}>
                  <CheckCircle size={18} /> Confirmar Asistencia
                </button>
                <button className="btn btn-secondary" style={{ color: 'var(--danger)', flex: 1, justifyContent: 'center' }} onClick={cancelApt}>
                  <XCircle size={18} /> Cancelar Cita
                </button>
              </div>
            )}
            {aptStatus === 'confirmed' && (
              <p style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 500, textAlign: 'center' }}>
                ¡Perfecto! Te esperamos. Recuerda practicar tus ejercicios antes de la sesión.
              </p>
            )}
          </div>
        ) : (
          <div className="empty-state py-4">
            <XCircle size={40} />
            <p>Has cancelado esta cita.</p>
            <p style={{ fontSize: '0.875rem' }}>Contacta con tu terapeuta para reprogramar.</p>
          </div>
        )}
      </div>

      {/* Exercises */}
      <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ejercicios para Casa</h2>
      <div className="flex flex-col gap-3">
        {mockExercises.map(exercise => {
          const isDone = completed.includes(exercise.id);
          return (
            <div key={exercise.id} className={`card exercise-card ${isDone ? 'done' : ''}`}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
                {ICONS[exercise.type]}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-main)' }}>
                  {exercise.title}
                </h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{exercise.description}</p>
                {exercise.link && (
                  <a href={exercise.link} className="link-primary" style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'inline-block', color: 'var(--primary)', fontWeight: 500 }}>
                    Ver material →
                  </a>
                )}
              </div>
              <button
                className={`btn ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-full)', flexShrink: 0 }}
                onClick={() => toggleExercise(exercise.id)}
                title={isDone ? 'Desmarcar' : 'Marcar como completado'}
              >
                {isDone ? <RotateCcw size={16} /> : <Check size={16} />}
                <span style={{ fontSize: '0.8rem' }}>{isDone ? 'Deshacer' : 'Hecho'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientPortal;
