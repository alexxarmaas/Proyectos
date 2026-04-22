import { useEffect, useState } from "react";

const defaultState = {
  patientId: "",
  date: "",
  hour: "",
  weight: "",
  observations: "",
  habits: "",
  recommendations: "",
  status: "pending"
};

function ConsultationForm({
  patients,
  initialValues,
  onSubmit,
  submitting = false,
  fixedPatientId = null
}) {
  const [values, setValues] = useState(defaultState);

  useEffect(() => {
    if (initialValues) {
      setValues({
        patientId: String(initialValues.patient_id ?? initialValues.patientId ?? ""),
        date: initialValues.date || "",
        hour: initialValues.hour || "",
        weight:
          initialValues.weight === null || initialValues.weight === undefined
            ? ""
            : String(initialValues.weight),
        observations: initialValues.observations || "",
        habits: initialValues.habits || "",
        recommendations: initialValues.recommendations || "",
        status: initialValues.status || "pending"
      });
      return;
    }
    setValues((prev) => ({
      ...defaultState,
      patientId: fixedPatientId ? String(fixedPatientId) : prev.patientId
    }));
  }, [initialValues, fixedPatientId]);

  useEffect(() => {
    if (fixedPatientId) {
      setValues((prev) => ({ ...prev, patientId: String(fixedPatientId) }));
    }
  }, [fixedPatientId]);

  function handleChange(event) {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...values,
      patientId: Number(values.patientId)
    });
  }

  return (
    <form className="grid-form" onSubmit={handleSubmit}>
      <label>
        Paciente
        <select
          name="patientId"
          value={values.patientId}
          onChange={handleChange}
          disabled={Boolean(fixedPatientId)}
          required
        >
          <option value="">Seleccionar paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Fecha
        <input type="date" name="date" value={values.date} onChange={handleChange} required />
      </label>
      <label>
        Hora
        <input type="time" name="hour" value={values.hour} onChange={handleChange} required />
      </label>
      <label>
        Peso (kg)
        <input type="number" step="0.1" name="weight" value={values.weight} onChange={handleChange} />
      </label>
      <label className="full-width">
        Observaciones
        <textarea name="observations" rows="2" value={values.observations} onChange={handleChange} />
      </label>
      <label className="full-width">
        Habitos
        <textarea name="habits" rows="2" value={values.habits} onChange={handleChange} />
      </label>
      <label className="full-width">
        Recomendaciones
        <textarea
          name="recommendations"
          rows="2"
          value={values.recommendations}
          onChange={handleChange}
        />
      </label>
      <label>
        Estado
        <select name="status" value={values.status} onChange={handleChange}>
          <option value="pending">Pendiente</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </label>
      <button type="submit" className="primary-btn" disabled={submitting}>
        {submitting ? "Guardando..." : "Guardar consulta"}
      </button>
    </form>
  );
}

export default ConsultationForm;
