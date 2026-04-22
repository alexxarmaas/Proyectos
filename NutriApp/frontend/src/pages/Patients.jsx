import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import PatientForm from "../components/PatientForm";
import { useAuth } from "../context/AuthContext";
import { patientsApi } from "../services/api";

function Patients() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPatients() {
    setLoading(true);
    setError("");
    try {
      const data = await patientsApi.list(token, {
        status: statusFilter,
        search
      });
      setPatients(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => a.name.localeCompare(b.name)),
    [patients]
  );

  async function handleCreate(payload) {
    setSubmitting(true);
    try {
      await patientsApi.create(token, payload);
      setShowCreateModal(false);
      await loadPatients();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(payload) {
    setSubmitting(true);
    try {
      await patientsApi.update(token, editingPatient.id, payload);
      setEditingPatient(null);
      await loadPatients();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(patientId) {
    const shouldDelete = window.confirm("Esta accion eliminara el paciente y su historial. Continuar?");
    if (!shouldDelete) {
      return;
    }

    try {
      await patientsApi.remove(token, patientId);
      await loadPatients();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestion centralizada</p>
          <h2>Pacientes</h2>
          <p className="muted">Ficha unica para cada paciente y acceso rapido al historial.</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setShowCreateModal(true)}>
          + Nuevo paciente
        </button>
      </header>

      <div className="panel filters-row">
        <label>
          Buscar
          <input
            placeholder="Nombre, email o telefono"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          Estado
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </label>
        <button type="button" className="secondary-btn" onClick={loadPatients}>
          Aplicar filtros
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <article className="panel">
        {loading ? (
          <p className="muted">Cargando pacientes...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Objetivo principal</th>
                  <th>Estado</th>
                  <th>Consultas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <strong>{patient.name}</strong>
                      <p className="muted compact">{patient.email || "Sin email"}</p>
                    </td>
                    <td>{patient.main_goal}</td>
                    <td>
                      <span className={`pill ${patient.status}`}>{patient.status === "active" ? "Activo" : "Inactivo"}</span>
                    </td>
                    <td>{patient.consultations_count}</td>
                    <td className="actions-cell">
                      <Link className="link-btn" to={`/pacientes/${patient.id}`}>
                        Ver ficha
                      </Link>
                      <button type="button" className="link-btn" onClick={() => setEditingPatient(patient)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="link-btn danger"
                        onClick={() => handleDelete(patient.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedPatients.length === 0 && (
                  <tr>
                    <td colSpan="5" className="muted">
                      No hay pacientes para los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {showCreateModal && (
        <Modal title="Nuevo paciente" onClose={() => setShowCreateModal(false)}>
          <PatientForm onSubmit={handleCreate} submitting={submitting} />
        </Modal>
      )}

      {editingPatient && (
        <Modal title="Editar paciente" onClose={() => setEditingPatient(null)}>
          <PatientForm initialValues={editingPatient} onSubmit={handleUpdate} submitting={submitting} />
        </Modal>
      )}
    </section>
  );
}

export default Patients;
