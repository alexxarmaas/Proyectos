import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Edit, Plus, X, Wand2 } from 'lucide-react';

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [magicSummary, setMagicSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    date: '', time: '', duration: 60, topic: '', notes: '', status: 'pending'
  });

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/clients/${id}`);
      setClient(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching client details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/sessions', { ...sessionForm, client_id: id });
      setShowSessionModal(false);
      setSessionForm({ date: '', time: '', duration: 60, topic: '', notes: '', status: 'pending' });
      fetchClient();
    } catch (err) {
      alert('Error al crear sesión');
    }
  };

  const markSessionStatus = async (sessionId, currentSess, status) => {
    try {
      await axios.put(`http://localhost:3001/api/sessions/${sessionId}`, { ...currentSess, status });
      fetchClient();
    } catch (err) {
      alert('Error');
    }
  }

  const generateMagicSummary = () => {
    setIsGenerating(true);
    setShowSummaryModal(true);

    // Simulate AI generation delay
    setTimeout(() => {
      const completedSessions = client.sessions.filter(s => s.status === 'completed');
      const lastSessionTopic = completedSessions.length > 0 ? completedSessions[0]?.topic : 'General';
      const text = `Resumen Ejecutivo del Proceso de ${client.name}

Objetivo Principal: ${client.objective || 'No definido'}
Sesiones completadas: ${completedSessions.length}

Progreso Observado:
- El cliente ha avanzado consistentemente en su meta de ${client.objective || 'su objetivo principal'}.
- Se nota una mejora en los puntos tratados en sesiones anteriores.
- Durante la última sesión ("${lastSessionTopic}"), se destacó el compromiso en las acciones asignadas.

Siguientes pasos recomendados:
1. Mantener el seguimiento en el próximo hito.
2. Profundizar en las áreas de fricción emocional detectadas.
3. Consolidar los hábitos trabajados.

Generado automáticamente por CoachCRM AI.`;
      setMagicSummary(text);
      setIsGenerating(false);
    }, 1500);
  }

  const getStatusLabel = (status) => {
    const map = { lead: 'Prospecto', active: 'Activo', paused: 'En Pausa', completed: 'Finalizado', inactive: 'Inactivo' };
    return map[status] || status;
  };

  if (loading) return <div>Cargando perfil...</div>;
  if (!client) return <div>Cliente no encontrado.</div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', marginBottom: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {client.name}
              <span className={`badge ${client.status}`}>{getStatusLabel(client.status)}</span>
            </h1>
            <p className="page-description">Objetivo: <strong>{client.objective || 'Sin definir'}</strong></p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={generateMagicSummary} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
              <Wand2 size={16} /> Resumen Mágico
            </button>
            <button className="btn btn-primary" onClick={() => setShowSessionModal(true)}>
              <Plus size={16} /> Programar Sesión
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Col: Sessions History */}
        <div>
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Historial de Sesiones</h2>
            </div>
            <div style={{ padding: '24px' }}>
              {client.sessions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                  No hay sesiones registradas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {client.sessions.map((sess) => (
                    <div key={sess.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: sess.status === 'completed' ? 'var(--table-hover)' : 'var(--card-bg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>
                            {sess.topic || 'Sesión General'}
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {format(parseISO(sess.date), "EEEE, d 'de' MMMM", { locale: es })} a las {sess.time} ({sess.duration} min)
                          </span>
                        </div>
                        <div>
                          <span className={`badge ${sess.status}`}>
                            {sess.status === 'pending' ? 'Pendiente' : sess.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </span>
                        </div>
                      </div>

                      {sess.notes && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', backgroundColor: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                          <strong>Notas guardadas:</strong><br />
                          {sess.notes}
                        </div>
                      )}

                      {sess.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                          <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => markSessionStatus(sess.id, sess, 'completed')}>
                            Marcar como Completada
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aside: Info & Notes */}
        <div>
          <div className="panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Contacto</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <strong>Email:</strong><br />
              <span style={{ color: 'var(--text-main)' }}>{client.email || 'N/A'}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <strong>Teléfono:</strong><br />
              <span style={{ color: 'var(--text-main)' }}>{client.phone || 'N/A'}</span>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Notas Generales</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
              {client.notes || 'Sin anotaciones.'}
            </p>
          </div>
        </div>
      </div >

      {/* New Session Modal */}
      {showSessionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Programar Nueva Sesión</h3>
              <button onClick={() => setShowSessionModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateSession}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Fecha *</label>
                    <input type="date" className="form-input" required value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora *</label>
                    <input type="time" className="form-input" required value={sessionForm.time} onChange={e => setSessionForm({ ...sessionForm, time: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tema de la Sesión</label>
                  <input type="text" className="form-input" required value={sessionForm.topic} onChange={e => setSessionForm({ ...sessionForm, topic: e.target.value })} placeholder="Ej: Revisión de avance, técnicas de resiliencia..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSessionModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Sesión</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Magic Summary Modal */}
      {showSummaryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand2 size={24} color="var(--primary)" /> Resumen de IA
              </h3>
              <button onClick={() => setShowSummaryModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {isGenerating ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Wand2 size={48} className="spin-animation" style={{ marginBottom: '16px', color: 'var(--primary)' }} />
                  <p>Analizando sesiones y generando resumen ejecutivo...</p>
                </div>
              ) : (
                <div className="summary-display">
                  {magicSummary.split('\n').map((line, idx) => {
                    // Títulos en negrita
                    if (line.includes('Resumen Ejecutivo') || line.includes('Objetivo Principal') || line.includes('Progreso Observado') || line.includes('Siguientes pasos')) {
                      return <h4 key={idx} className="summary-section-title">{line}</h4>;
                    }
                    // Líneas vacías
                    if (line.trim() === '') {
                      return <div key={idx} style={{ height: '8px' }} />;
                    }
                    // Bullets
                    if (line.trim().startsWith('-') || /^\d+\./.test(line.trim())) {
                      return <p key={idx} className="summary-bullet">{line}</p>;
                    }
                    // Texto normal
                    return <p key={idx} className="summary-text">{line}</p>;
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setShowSummaryModal(false)} disabled={isGenerating}>Listo</button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
