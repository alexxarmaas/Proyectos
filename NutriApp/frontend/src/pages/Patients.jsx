import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api from '../lib/api';
import PatientFormModal from '../components/PatientFormModal';
import EmptyState from '../components/EmptyState';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const fetchPatients = () => {
    api.get('/patients').then((response) => setPatients(response.data));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const search = query.toLowerCase();
    return patients.filter((patient) => {
      return (
        patient.name.toLowerCase().includes(search) ||
        (patient.goal || '').toLowerCase().includes(search) ||
        (patient.email || '').toLowerCase().includes(search)
      );
    });
  }, [patients, query]);

  const handleSave = async (payload) => {
    if (editingPatient) {
      await api.put(`/patients/${editingPatient.id}`, payload);
    } else {
      await api.post('/patients', payload);
    }

    setModalOpen(false);
    setEditingPatient(null);
    fetchPatients();
  };

  const handleDelete = async (patientId) => {
    const confirmed = window.confirm('¿Quieres eliminar este paciente y su historial?');
    if (!confirmed) return;

    await api.delete(`/patients/${patientId}`);
    fetchPatients();
  };

  return (
    <div className="page-stack">
      <section className="hero-header">
        <div>
          <span className="eyebrow">Pacientes</span>
          <h2>Directorio de pacientes</h2>
          <p>Una lista limpia que permite entrar al historial de cada caso en segundos.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setEditingPatient(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          Nuevo paciente
        </button>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div className="search-input">
            <Search size={16} />
            <input
              placeholder="Buscar por nombre, objetivo o email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="toolbar-summary">{filteredPatients.length} pacientes visibles</div>
        </div>

        {filteredPatients.length === 0 ? (
          <EmptyState
            title="No hay pacientes con ese criterio"
            description="Prueba otra búsqueda o crea un nuevo paciente para la demo."
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Contacto</th>
                  <th>Objetivo principal</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <Link to={`/patients/${patient.id}`} className="strong-link">
                        {patient.name}
                      </Link>
                    </td>
                    <td>
                      <div className="stacked-copy">
                        <span>{patient.email || 'Sin email'}</span>
                        <small>{patient.phone || 'Sin teléfono'}</small>
                      </div>
                    </td>
                    <td>{patient.goal || 'Sin objetivo definido'}</td>
                    <td>
                      <span className={`status-badge ${patient.status}`}>{patient.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          onClick={() => {
                            setEditingPatient(patient);
                            setModalOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button className="icon-button danger" onClick={() => handleDelete(patient.id)}>
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

      <PatientFormModal
        open={modalOpen}
        patient={editingPatient}
        onClose={() => {
          setModalOpen(false);
          setEditingPatient(null);
        }}
        onSubmit={handleSave}
      />
    </div>
  );
}
