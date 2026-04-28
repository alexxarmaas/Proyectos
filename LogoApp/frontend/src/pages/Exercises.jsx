import React, { useState } from 'react';
import { Dumbbell, Plus, PlayCircle, FileText, Mic, X } from 'lucide-react';
import { mockExercises, mockPatients } from '../mockData';
import { useToast } from '../context/ToastContext';

const TYPE_ICONS = {
  video: <PlayCircle size={24} color="var(--primary)" />,
  audio: <Mic size={24} color="var(--accent)" />,
  text: <FileText size={24} color="var(--text-muted)" />,
};

const TYPE_COLORS = {
  video: { bg: '#E0F2FE', text: '#0369A1' },
  audio: { bg: '#FEF3C7', text: '#92400E' },
  text: { bg: 'var(--bg-hover)', text: 'var(--text-muted)' },
};

const Exercises = () => {
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', exerciseId: '' });

  const handleAssign = (e) => {
    e.preventDefault();
    const patient = mockPatients.find(p => p.id === parseInt(form.patientId));
    const exercise = mockExercises.find(ex => ex.id === parseInt(form.exerciseId));
    setShowModal(false);
    setForm({ patientId: '', exerciseId: '' });
    showToast(`Ejercicio "${exercise?.title}" asignado a ${patient?.name} correctamente.`, 'success');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Biblioteca de Ejercicios</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Asignar Ejercicio
        </button>
      </div>

      <div className="grid-auto">
        {mockExercises.map(exercise => {
          const colors = TYPE_COLORS[exercise.type] || TYPE_COLORS.text;
          return (
            <div key={exercise.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex items-center gap-3">
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: colors.bg,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {TYPE_ICONS[exercise.type]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem' }}>{exercise.title}</h3>
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>{exercise.type}</span>
                </div>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>{exercise.description}</p>
              <div className="flex gap-2">
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}
                  onClick={() => { setForm(f => ({ ...f, exerciseId: exercise.id })); setShowModal(true); }}>
                  Asignar a paciente
                </button>
                {exercise.link && (
                  <a href={exercise.link} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                    Ver
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">Asignar Ejercicio</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label htmlFor="ex-patient">Paciente</label>
                <select id="ex-patient" className="form-control" required value={form.patientId}
                  onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
                  <option value="">Seleccionar paciente...</option>
                  {mockPatients.filter(p => p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ex-exercise">Ejercicio</label>
                <select id="ex-exercise" className="form-control" required value={form.exerciseId}
                  onChange={e => setForm(f => ({ ...f, exerciseId: e.target.value }))}>
                  <option value="">Seleccionar ejercicio...</option>
                  {mockExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Asignar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercises;
