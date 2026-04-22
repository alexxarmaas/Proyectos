import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../lib/api';
import ConsultationFormModal from '../components/ConsultationFormModal';
import EmptyState from '../components/EmptyState';

const weekdayFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric' });

export default function Agenda() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekData, setWeekData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);

  useEffect(() => {
    api.get('/patients').then((response) => setPatients(response.data));
  }, []);

  useEffect(() => {
    api
      .get('/agenda/week', {
        params: { start: format(weekStart, 'yyyy-MM-dd') }
      })
      .then((response) => setWeekData(response.data));
  }, [weekStart]);

  const groupedDays = useMemo(() => {
    if (!weekData) return [];

    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(new Date(`${weekData.start}T00:00:00`), index);
      const dayKey = format(day, 'yyyy-MM-dd');
      return {
        label: weekdayFormatter.format(day),
        key: dayKey,
        consultations: weekData.consultations.filter((consultation) => consultation.date === dayKey)
      };
    });
  }, [weekData]);

  const refreshWeek = () => {
    api
      .get('/agenda/week', {
        params: { start: format(weekStart, 'yyyy-MM-dd') }
      })
      .then((response) => setWeekData(response.data));
  };

  const handleSave = async (payload) => {
    if (editingConsultation) {
      await api.put(`/consultations/${editingConsultation.id}`, payload);
    } else {
      await api.post('/consultations', payload);
    }

    setModalOpen(false);
    setEditingConsultation(null);
    refreshWeek();
  };

  return (
    <div className="page-stack">
      <section className="hero-header">
        <div>
          <span className="eyebrow">Agenda</span>
          <h2>Vista semanal de consultas</h2>
          <p>La vista más fácil de enseñar para transmitir orden y control de la semana.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setEditingConsultation(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          Agendar consulta
        </button>
      </section>

      <section className="panel">
        <div className="agenda-toolbar">
          <button className="secondary-button" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft size={16} />
            Semana anterior
          </button>
          <strong>
            {format(weekStart, "d MMM", { locale: es })} - {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
          </strong>
          <button className="secondary-button" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Siguiente semana
            <ChevronRight size={16} />
          </button>
        </div>

        {!weekData || groupedDays.every((day) => day.consultations.length === 0) ? (
          <EmptyState
            title="Semana sin consultas"
            description="Añade una cita para enseñar la agenda en modo realista."
          />
        ) : (
          <div className="agenda-grid">
            {groupedDays.map((day) => (
              <div key={day.key} className="agenda-column">
                <div className="agenda-column-header">
                  <strong>{day.label}</strong>
                  <span>{day.consultations.length} citas</span>
                </div>

                <div className="agenda-column-body">
                  {day.consultations.length === 0 ? (
                    <div className="agenda-empty">Sin citas</div>
                  ) : (
                    day.consultations.map((consultation) => (
                      <button
                        key={consultation.id}
                        className="agenda-card"
                        onClick={() => {
                          setEditingConsultation(consultation);
                          setModalOpen(true);
                        }}
                      >
                        <strong>{consultation.time}</strong>
                        <span>{consultation.patient_name}</span>
                        <small>
                          {consultation.weight ? `${consultation.weight} kg` : 'Peso pendiente'} ·{' '}
                          {consultation.status === 'pending'
                            ? 'Pendiente'
                            : consultation.status === 'completed'
                              ? 'Completada'
                              : 'Cancelada'}
                        </small>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConsultationFormModal
        open={modalOpen}
        consultation={editingConsultation}
        patients={patients}
        onClose={() => {
          setModalOpen(false);
          setEditingConsultation(null);
        }}
        onSubmit={handleSave}
      />
    </div>
  );
}
