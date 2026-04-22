import { useEffect, useState } from "react";

const initialState = {
  name: "",
  email: "",
  phone: "",
  mainGoal: "",
  status: "active",
  generalNotes: ""
};

function PatientForm({ initialValues, onSubmit, submitting = false }) {
  const [values, setValues] = useState(initialState);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name || "",
        email: initialValues.email || "",
        phone: initialValues.phone || "",
        mainGoal: initialValues.main_goal || initialValues.mainGoal || "",
        status: initialValues.status || "active",
        generalNotes: initialValues.general_notes || initialValues.generalNotes || ""
      });
      return;
    }
    setValues(initialState);
  }, [initialValues]);

  function handleChange(event) {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form className="grid-form" onSubmit={handleSubmit}>
      <label>
        Nombre
        <input name="name" value={values.name} onChange={handleChange} required />
      </label>
      <label>
        Email
        <input name="email" type="email" value={values.email} onChange={handleChange} />
      </label>
      <label>
        Telefono
        <input name="phone" value={values.phone} onChange={handleChange} />
      </label>
      <label>
        Estado
        <select name="status" value={values.status} onChange={handleChange}>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </label>
      <label className="full-width">
        Objetivo principal
        <input name="mainGoal" value={values.mainGoal} onChange={handleChange} required />
      </label>
      <label className="full-width">
        Notas generales
        <textarea name="generalNotes" rows="3" value={values.generalNotes} onChange={handleChange} />
      </label>
      <button type="submit" className="primary-btn" disabled={submitting}>
        {submitting ? "Guardando..." : "Guardar paciente"}
      </button>
    </form>
  );
}

export default PatientForm;
