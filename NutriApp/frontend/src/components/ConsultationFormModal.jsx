export default function ConsultationFormModal({
  open,
  onClose,
  onSubmit,
  consultation,
  patients = [],
  fixedPatientId
}) {
  if (!open) return null;

  const values = consultation || {
    patient_id: fixedPatientId || '',
    date: '',
    time: '',
    weight: '',
    observations: '',
    habits: '',
    recommendations: '',
    status: 'pending'
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onSubmit({
      patient_id: Number(formData.get('patient_id')),
      date: formData.get('date'),
      time: formData.get('time'),
      weight: formData.get('weight'),
      observations: formData.get('observations'),
      habits: formData.get('habits'),
      recommendations: formData.get('recommendations'),
      status: formData.get('status')
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-wide">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Consulta</span>
            <h3>{consultation ? 'Editar consulta' : 'Nueva consulta'}</h3>
          </div>
          <button className="ghost-button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-grid three-columns">
            <label>
              Paciente
              {fixedPatientId ? <input type="hidden" name="patient_id" value={values.patient_id} /> : null}
              <select
                name="patient_id"
                defaultValue={String(values.patient_id)}
                disabled={Boolean(fixedPatientId)}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha
              <input name="date" type="date" defaultValue={values.date} required />
            </label>
            <label>
              Hora
              <input name="time" type="time" defaultValue={values.time} required />
            </label>
          </div>

          <div className="form-grid two-columns">
            <label>
              Peso
              <input name="weight" type="number" step="0.1" defaultValue={values.weight || ''} />
            </label>
            <label>
              Estado
              <select name="status" defaultValue={values.status}>
                <option value="pending">Pendiente</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </label>
          </div>

          <label>
            Observaciones
            <textarea name="observations" defaultValue={values.observations} rows="3" />
          </label>

          <label>
            Hábitos
            <textarea name="habits" defaultValue={values.habits} rows="3" />
          </label>

          <label>
            Recomendaciones
            <textarea name="recommendations" defaultValue={values.recommendations} rows="3" />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              {consultation ? 'Actualizar consulta' : 'Guardar consulta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
