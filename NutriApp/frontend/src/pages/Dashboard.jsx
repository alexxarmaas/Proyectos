import { useEffect, useState } from "react";
import { dashboardApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        const summary = await dashboardApi.summary(token);
        setData(summary);
      } catch (loadError) {
        setError(loadError.message);
      }
    }
    loadSummary();
  }, [token]);

  if (!data && !error) {
    return <div className="page-shell">Cargando dashboard...</div>;
  }

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Vista general</p>
          <h2>Dashboard</h2>
          <p className="muted">Control rapido de pacientes, agenda y seguimiento.</p>
        </div>
      </header>

      {error && <p className="error-text">{error}</p>}
      {data && (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <p>Pacientes activos</p>
              <h3>{data.activePatients}</h3>
            </article>
            <article className="stat-card">
              <p>Consultas pendientes</p>
              <h3>{data.upcomingCount}</h3>
            </article>
            <article className="stat-card">
              <p>Seguimientos recientes</p>
              <h3>{data.latestFollowups.length}</h3>
            </article>
          </div>

          <div className="two-columns">
            <article className="panel">
              <div className="panel-head">
                <h3>Proximas consultas</h3>
              </div>
              <ul className="clean-list">
                {data.upcomingConsultations.length === 0 && (
                  <li className="muted">No hay consultas pendientes.</li>
                )}
                {data.upcomingConsultations.map((consultation) => (
                  <li key={consultation.id} className="list-row">
                    <div>
                      <strong>{consultation.patient_name}</strong>
                      <p className="muted">
                        {consultation.date} - {consultation.hour}
                      </p>
                    </div>
                    <span className="pill pending">Pendiente</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <div className="panel-head">
                <h3>Ultimos seguimientos</h3>
              </div>
              <ul className="clean-list">
                {data.latestFollowups.length === 0 && (
                  <li className="muted">Aun no hay seguimientos registrados.</li>
                )}
                {data.latestFollowups.map((item, index) => (
                  <li key={`${item.created_at}-${index}`} className="list-row align-start">
                    <div>
                      <strong>{item.patient_name}</strong>
                      <p>{item.content}</p>
                      <p className="muted">{item.created_at.slice(0, 10)}</p>
                    </div>
                    <span className={`pill ${item.source === "consulta" ? "completed" : "active"}`}>
                      {item.source === "consulta" ? "Consulta" : "Nota"}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
