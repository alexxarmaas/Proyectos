const initialState = {
  name: '',
  email: '',
  phone: '',
  goal: '',
  status: 'active',
  general_notes: ''
};

export default function PatientFormModal({ open, onClose, onSubmit, patient }) {
  const values = patient || initialState;

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onSubmit({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      goal: formData.get('goal'),
      status: formData.get('status'),
      general_notes: formData.get('general_notes')
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Paciente</span>
            <h3>{patient ? 'Editar paciente' : 'Nuevo paciente'}</h3>
          </div>
          <button className="ghost-button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-grid two-columns">
            <label>
              Nombre
              <input name="name" defaultValue={values.name} required />
            </label>
            <label>
              Estado
              <select name="status" defaultValue={values.status}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </label>
          </div>

          <div className="form-grid two-columns">
            <label>
              Email
              <input name="email" type="email" defaultValue={values.email} />
            </label>
            <label>
              Teléfono
              <input name="phone" defaultValue={values.phone} />
            </label>
          </div>

          <label>
            Objetivo principal
            <input name="goal" defaultValue={values.goal} placeholder="Ej: perder grasa sin rigidez" />
          </label>

          <label>
            Notas generales
            <textarea
              name="general_notes"
              defaultValue={values.general_notes}
              rows="4"
              placeholder="Contexto, estilo de vida, motivaciones o detalles importantes"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              {patient ? 'Guardar cambios' : 'Crear paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
