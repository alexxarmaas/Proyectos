import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../lib/api';
import ConsultationFormModal from '../components/ConsultationFormModal';
import EmptyState from '../components/EmptyState';

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);

  const fetchData = () => {
    api.get('/consultations').then((response) => setConsultations(response.data));
    api.get('/patients').then((response) => setPatients(response.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
      const matchesQuery = consultation.patient_name.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [consultations, query, statusFilter]);

  const handleSave = async (payload) => {
    if (editingConsultation) {
      await api.put(`/consultations/${editingConsultation.id}`, payload);
    } else {
      await api.post('/consultations', payload);
    }

    setModalOpen(false);
    setEditingConsultation(null);
    fetchData();
  };

  const handleDelete = async (consultationId) => {
    const confirmed = window.confirm('¿Eliminar esta consulta?');
    if (!confirmed) return;

    await api.delete(`/consultations/${consultationId}`);
    fetchData();
  };

  return (
    <div className="page-stack">
      <section className="hero-header">
        <div>
          <span className="eyebrow">Consultas</span>
          <h2>Registro de consultas</h2>
          <p>Una pantalla clave para enseñar control operativo y rapidez al editar cada seguimiento.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setEditingConsultation(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          Nueva consulta
        </button>
      </section>

      <section className="panel">
        <div className="toolbar spread">
          <div className="search-input">
            <Search size={16} />
            <input
              placeholder="Buscar por paciente"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="filter-select">
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {filteredConsultations.length === 0 ? (
          <EmptyState
            title="No hay consultas que mostrar"
            description="Crea una consulta o cambia el filtro para ver más resultados."
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td>{consultation.patient_name}</td>
                    <td>
                      {format(parseISO(consultation.date), "d MMM yyyy", { locale: es })} · {consultation.time}
                    </td>
                    <td>{consultation.weight ? `${consultation.weight} kg` : '-'}</td>
                    <td>
                      <span className={`status-badge ${consultation.status}`}>
                        {consultation.status === 'pending'
                          ? 'Pendiente'
                          : consultation.status === 'completed'
                            ? 'Completada'
                            : 'Cancelada'}
                      </span>
                    </td>
                    <td>{consultation.observations || 'Sin observaciones'}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          onClick={() => {
                            setEditingConsultation(consultation);
                            setModalOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button className="icon-button danger" onClick={() => handleDelete(consultation.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
