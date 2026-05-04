import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Edit, Plus, X, Wand2 } from 'lucide-react';
import { API_BASE_URL } from '../lib/apiBase';

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

  const [activeTab, setActiveTab] = useState('sessions');
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', category: 'General', target_date: '' });

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/clients/${id}`);
      setClient(res.data);
      
      try {
        const goalsRes = await axios.get(`${API_BASE_URL}/api/goals?client_id=${id}`);
        setGoals(goalsRes.data);
      } catch (err) {
        console.warn("Goals endpoints might not be available yet", err);
        setGoals([]);
      }
      
    } catch (err) {
      console.error(err);
      alert('Error fetching client details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/goals`, { ...goalForm, client_id: id });
      setShowGoalModal(false);
      setGoalForm({ title: '', category: 'General', target_date: '' });
      fetchClient();
    } catch (err) {
      alert('Error al crear hito');
    }
  };

  const markGoalStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/goals/${id}`, { status });
      fetchClient();
    } catch (err) {
      alert('Error al actualizar hito');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/sessions`, { ...sessionForm, client_id: id });
      setShowSessionModal(false);
      setSessionForm({ date: '', time: '', duration: 60, topic: '', notes: '', status: 'pending' });
      fetchClient();
    } catch (err) {
      alert('Error al crear sesión');
    }
  };

  const markSessionStatus = async (sessionId, currentSess, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/sessions/${sessionId}`, { ...currentSess, status });
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
        <div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {client.name}
              <span className={`badge ${client.status}`}>{getStatusLabel(client.status)}</span>
            </h1>
            <p className="page-description">Objetivo: <strong>{client.objective || 'Sin definir'}</strong></p>
          </div>
          <div className="profile-header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={generateMagicSummary} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
              <Wand2 size={16} /> Resumen Mágico
            </button>
            <button className="btn btn-primary" onClick={() => setShowSessionModal(true)}>
              <Plus size={16} /> Programar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Col: Sessions & Goals */}
        <div>
          <div className="panel" style={{ marginBottom: '24px' }}>
            <div className="panel-header" style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
              <button 
                style={{ padding: '16px 8px', background: 'transparent', border: 'none', borderBottom: activeTab === 'sessions' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'sessions' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'sessions' ? 600 : 500, cursor: 'pointer', fontSize: '1rem' }}
                onClick={() => setActiveTab('sessions')}
              >
                Historial de Sesiones
              </button>
              <button 
                style={{ padding: '16px 8px', background: 'transparent', border: 'none', borderBottom: activeTab === 'goals' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'goals' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'goals' ? 600 : 500, cursor: 'pointer', fontSize: '1rem' }}
                onClick={() => setActiveTab('goals')}
              >
                Hitos y Progreso
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              {activeTab === 'sessions' ? (
                <>
                  {client.sessions.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                      No hay sesiones registradas.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {client.sessions.map((sess) => (
                        <div key={sess.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: sess.status === 'completed' ? 'var(--table-hover)' : 'var(--card-bg)' }}>
                          <div className="session-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
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
                            <div className="session-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => markSessionStatus(sess.id, sess, 'completed')}>
                                Marcar como Completada
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span>Progreso Global</span>
                        <span>{goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--primary)', width: `${goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%`, transition: 'width 0.5s ease-out' }}></div>
                      </div>
                    </div>
                    <button className="btn btn-secondary" style={{ marginLeft: '24px', padding: '6px 14px' }} onClick={() => setShowGoalModal(true)}>
                      <Plus size={16} /> Nuevo Hito
                    </button>
                  </div>
                  
                  {goals.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No hay hitos definidos para este cliente.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {goals.map(goal => (
                        <div key={goal.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: goal.status === 'completed' ? 'var(--table-hover)' : 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <input 
                              type="checkbox" 
                              checked={goal.status === 'completed'}
                              onChange={(e) => markGoalStatus(goal.id, e.target.checked ? 'completed' : 'in_progress')}
                              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, textDecoration: goal.status === 'completed' ? 'line-through' : 'none', color: goal.status === 'completed' ? 'var(--text-muted)' : 'var(--text-main)' }}>{goal.title}</h4>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--surface-alt)', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>{goal.category} • Objetivo: {goal.target_date ? format(parseISO(goal.target_date), 'd MMM yyyy', { locale: es }) : 'Sin fecha'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                <div className="form-grid-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

      {/* New Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Añadir Nuevo Hito</h3>
              <button onClick={() => setShowGoalModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateGoal}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título del Hito *</label>
                  <input type="text" className="form-input" required value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="Ej: Mejorar asertividad en reuniones" />
                </div>
                <div className="form-grid-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <select className="form-input" value={goalForm.category} onChange={e => setGoalForm({ ...goalForm, category: e.target.value })}>
                      <option value="General">General</option>
                      <option value="Liderazgo">Liderazgo</option>
                      <option value="Desarrollo">Desarrollo Profesional</option>
                      <option value="Bienestar">Bienestar</option>
                      <option value="Carrera">Carrera</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha Objetivo</label>
                    <input type="date" className="form-input" value={goalForm.target_date} onChange={e => setGoalForm({ ...goalForm, target_date: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGoalModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Hito</button>
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
