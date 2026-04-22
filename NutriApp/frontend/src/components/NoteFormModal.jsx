export default function NoteFormModal({ open, onClose, onSubmit }) {
  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit({ content: formData.get('content') });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Seguimiento</span>
            <h3>Añadir nota rápida</h3>
          </div>
          <button className="ghost-button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Nota
            <textarea
              name="content"
              rows="5"
              required
              placeholder="Ej: esta semana ha mejorado adherencia al desayuno y compra planificada"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Guardar nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
