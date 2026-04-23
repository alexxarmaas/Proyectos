import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, X, LayoutGrid, List } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    objective: '',
    status: 'lead',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/clients');
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/clients', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', objective: '', status: 'lead', notes: '' });
      fetchClients();
    } catch (err) {
      console.error(err);
      alert('Error al crear cliente');
    }
  };

  const getStatusLabel = (status) => {
    const map = { lead: 'Prospecto', active: 'Activo', paused: 'En Pausa', completed: 'Finalizado', inactive: 'Inactivo' };
    return map[status] || status;
  };

  const columns = ['lead', 'active', 'paused', 'completed'];

  if (loading) return <div>Cargando clientes...</div>;

  return (
    <div>
      <div className="clients-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Directorio de Clientes</h1>
          <p className="page-description">Gestiona la información y pipeline de tus clientes</p>
        </div>
        <div className="clients-actions" style={{ display: 'flex', gap: '12px' }}>
          <div className="view-toggle" style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <button
              style={{ padding: '8px 12px', background: viewMode === 'table' ? 'var(--table-hover)' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)' }}
              onClick={() => setViewMode('table')}
            ><List size={18} /></button>
            <button
              style={{ padding: '8px 12px', background: viewMode === 'kanban' ? 'var(--table-hover)' : 'transparent', color: viewMode === 'kanban' ? 'var(--primary)' : 'var(--text-muted)' }}
              onClick={() => setViewMode('kanban')}
            ><LayoutGrid size={18} /></button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="panel">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Objetivo Principal</th>
                  <th>Fase</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{client.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{client.email || '-'}</td>
                    <td>{client.objective || 'Sin definir'}</td>
                    <td>
                      <span className={`badge ${client.status}`}>
                        {getStatusLabel(client.status)}
                      </span>
                    </td>
                    <td>
                      <Link to={`/clients/${client.id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        Ver Perfil
                      </Link>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Aún no tienes clientes. Crea el primero.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="kanban-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'start' }}>
          {columns.map(col => (
            <div key={col} style={{ background: 'var(--table-hover)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{getStatusLabel(col)}</h3>
                <span style={{ background: 'var(--card-bg)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {clients.filter(c => c.status === col || (col === 'active' && !['lead', 'paused', 'completed'].includes(c.status))).length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {clients.filter(c => c.status === col || (col === 'active' && !['lead', 'paused', 'completed'].includes(c.status))).map(client => (
                  <Link to={`/clients/${client.id}`} key={client.id} style={{ display: 'block', background: 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{client.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.objective || 'Sin objetivo definido'}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Añadir Nuevo Cliente</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Laura Gómez" />
                </div>
                <div className="form-grid-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="laura@ejemplo.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fase del cliente</label>
                    <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="lead">Prospecto</option>
                      <option value="active">Activo</option>
                      <option value="paused">En Pausa</option>
                      <option value="completed">Finalizado</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Objetivo Principal</label>
                  <input type="text" className="form-input" value={formData.objective} onChange={e => setFormData({ ...formData, objective: e.target.value })} placeholder="Ej: Mejorar liderazgo" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
