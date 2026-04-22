import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarPlus, ChevronLeft, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../lib/api';
import PatientFormModal from '../components/PatientFormModal';
import ConsultationFormModal from '../components/ConsultationFormModal';
import NoteFormModal from '../components/NoteFormModal';
import EmptyState from '../components/EmptyState';

export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);

  const fetchPatient = () => {
    api.get(`/patients/${id}`).then((response) => setPatient(response.data));
  };

  useEffect(() => {
    fetchPatient();
    api.get('/patients').then((response) => setPatients(response.data));
  }, [id]);

  if (!patient) {
    return <div className="loading-card">Cargando ficha del paciente...</div>;
  }

  const handlePatientSave = async (payload) => {
    await api.put(`/patients/${id}`, payload);
    setEditPatientOpen(false);
    fetchPatient();
  };

  const handleNoteSave = async (payload) => {
    await api.post(`/patients/${id}/notes`, payload);
    setNoteModalOpen(false);
    fetchPatient();
  };

  const handleConsultationSave = async (payload) => {
    if (editingConsultation) {
      await api.put(`/consultations/${editingConsultation.id}`, payload);
    } else {
      await api.post('/consultations', payload);
    }

    setConsultationModalOpen(false);
    setEditingConsultation(null);
    fetchPatient();
  };

  const handleDeleteConsultation = async (consultationId) => {
    const confirmed = window.confirm('¿Eliminar esta consulta del historial?');
    if (!confirmed) return;

    await api.delete(`/consultations/${consultationId}`);
    fetchPatient();
  };

  const handleDeleteNote = async (noteId) => {
    await api.delete(`/patients/${id}/notes/${noteId}`);
    fetchPatient();
  };

  return (
    <div className="page-stack">
      <Link to="/patients" className="back-link">
        <ChevronLeft size={16} />
        Volver a pacientes
      </Link>

      <section className="profile-header">
        <div className="profile-summary">
          <span className="eyebrow">Ficha de paciente</span>
          <h2>{patient.name}</h2>
          <p>{patient.goal || 'Sin objetivo definido aún.'}</p>
          <div className="profile-meta">
            <span>{patient.email || 'Sin email'}</span>
            <span>{patient.phone || 'Sin teléfono'}</span>
            <span className={`status-badge ${patient.status}`}>{patient.status === 'active' ? 'Activo' : 'Inactivo'}</span>
          </div>
        </div>

        <div className="hero-actions">
          <button className="secondary-button" onClick={() => setEditPatientOpen(true)}>
            <Pencil size={16} />
            Editar ficha
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setNoteModalOpen(true);
            }}
          >
            <FilePlus2 size={16} />
            Añadir nota
          </button>
          <button
            className="primary-button"
            onClick={() => {
              setEditingConsultation(null);
              setConsultationModalOpen(true);
            }}
          >
            <CalendarPlus size={16} />
            Añadir consulta
          </button>
        </div>
      </section>

      <section className="content-grid profile-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Datos personales</span>
              <h3>Contexto general</h3>
            </div>
          </div>
          <div className="copy-block">
            <p>{patient.general_notes || 'Sin notas generales por ahora.'}</p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Seguimiento</span>
              <h3>Notas rápidas</h3>
            </div>
          </div>

          <div className="notes-stack">
            {patient.notes.length === 0 ? (
              <EmptyState title="Aún no hay notas" description="Las notas de seguimiento ayudan a vender continuidad y criterio profesional." />
            ) : (
              patient.notes.map((note) => (
                <div key={note.id} className="note-card">
                  <div>
                    <strong>
                      {format(new Date(note.created_at.replace(' ', 'T')), "d MMM yyyy, HH:mm", { locale: es })}
                    </strong>
                    <p>{note.content}</p>
                  </div>
                  <button className="icon-button danger" onClick={() => handleDeleteNote(note.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Consultas</span>
            <h3>Historial de consultas y evolución</h3>
          </div>
        </div>

        {patient.consultations.length === 0 ? (
          <EmptyState
            title="Sin consultas registradas"
            description="Empieza creando la primera consulta para enseñar el seguimiento dentro de la ficha."
          />
        ) : (
          <div className="timeline">
            {patient.consultations.map((consultation) => (
              <article key={consultation.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-card">
                  <div className="timeline-header">
                    <div>
                      <strong>
                        {format(parseISO(consultation.date), "EEEE, d 'de' MMMM", { locale: es })} · {consultation.time}
                      </strong>
                      <p>{consultation.weight ? `${consultation.weight} kg` : 'Peso no registrado'}</p>
                    </div>
                    <div className="table-actions">
                      <span className={`status-badge ${consultation.status}`}>
                        {consultation.status === 'pending'
                          ? 'Pendiente'
                          : consultation.status === 'completed'
                            ? 'Completada'
                            : 'Cancelada'}
                      </span>
                      <button
                        className="icon-button"
                        onClick={() => {
                          setEditingConsultation(consultation);
                          setConsultationModalOpen(true);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button className="icon-button danger" onClick={() => handleDeleteConsultation(consultation.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="timeline-grid">
                    <div>
                      <span>Observaciones</span>
                      <p>{consultation.observations || 'Sin observaciones.'}</p>
                    </div>
                    <div>
                      <span>Hábitos</span>
                      <p>{consultation.habits || 'Sin hábitos registrados.'}</p>
                    </div>
                    <div>
                      <span>Recomendaciones</span>
                      <p>{consultation.recommendations || 'Sin recomendaciones.'}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <PatientFormModal
        open={editPatientOpen}
        patient={patient}
        onClose={() => setEditPatientOpen(false)}
        onSubmit={handlePatientSave}
      />

      <ConsultationFormModal
        open={consultationModalOpen}
        consultation={editingConsultation}
        fixedPatientId={patient.id}
        patients={patients}
        onClose={() => {
          setConsultationModalOpen(false);
          setEditingConsultation(null);
        }}
        onSubmit={handleConsultationSave}
      />

      <NoteFormModal open={noteModalOpen} onClose={() => setNoteModalOpen(false)} onSubmit={handleNoteSave} />
    </div>
  );
}
