import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CreditCard, Download, FileText, Plus, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { API_BASE_URL } from '../lib/apiBase';

export default function Finanzas() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Mock fetching invoices from the API
    // Replace with real fetch: api.get('/invoices') when lib/api.js is available in this app
    fetch(`${API_BASE_URL}/api/invoices`)
      .then(res => res.json())
      .then(data => setInvoices(data))
      .catch(console.error);

    fetch(`${API_BASE_URL}/api/clients`)
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(console.error);
  }, []);

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const pendingAmount = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  // Group by month for chart
  const months = {};
  invoices.filter(i => i.status === 'paid').forEach(inv => {
    const month = format(parseISO(inv.issue_date), 'MMM', { locale: es });
    months[month] = (months[month] || 0) + inv.amount;
  });
  const chartData = Object.keys(months).map(k => ({ name: k, total: months[k] })).reverse();

  const handleStatusChange = (id, newStatus) => {
    fetch(`${API_BASE_URL}/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(() => {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
      setToast('Estado actualizado');
      setTimeout(() => setToast(null), 2500);
    });
  };

  return (
    <div className="page-stack">
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      <section className="hero-header">
        <div>
          <span className="eyebrow">Gestión</span>
          <h2>Finanzas y Facturación</h2>
          <p>Controla tus ingresos y haz seguimiento de las facturas de tus sesiones de coaching.</p>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => alert("Simulación: Modal Nueva Factura")}>
            <Plus size={16} /> Nueva Factura
          </button>
        </div>
      </section>

      <div className="content-grid profile-grid">
        <section className="panel" style={{ padding: '24px' }}>
          <div className="panel-heading" style={{ padding: '0 0 20px 0', border: 'none' }}>
            <h3>Ingresos (Últimos meses)</h3>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 12, textTransform: 'capitalize' }} />
                <YAxis stroke="var(--muted)" tick={{ fontSize: 12 }} tickFormatter={(val) => `€${val}`} />
                <Tooltip cursor={{ fill: 'var(--surface-alt)' }} contentStyle={{ borderRadius: 12, border: '1px solid var(--line)' }} formatter={(v) => [`€${v}`, 'Ingresos']} />
                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel summary-cards-grid" style={{ display: 'grid', gap: '1rem', padding: '20px', background: 'var(--surface-alt)' }}>
          <div className="stat-card" style={{ background: 'var(--surface)', margin: 0 }}>
            <div className="stat-icon" style={{ background: 'var(--accent)', color: 'var(--primary)' }}><CreditCard size={24} /></div>
            <div>
              <span className="stat-title">Ingresos Totales (Cobrados)</span>
              <span className="stat-value">€{totalRevenue.toFixed(2)}</span>
            </div>
          </div>
          <div className="stat-card" style={{ background: 'var(--surface)', margin: 0 }}>
            <div className="stat-icon" style={{ background: 'var(--amber-soft)', color: '#9a6207' }}><FileText size={24} /></div>
            <div>
              <span className="stat-title">Pendiente de Cobro</span>
              <span className="stat-value">€{pendingAmount.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h3>Historial de Facturas</h3>
        </div>
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha Emisión</th>
                <th>Cliente</th>
                <th>Concepto</th>
                <th>Importe</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                    No hay facturas registradas.
                  </td>
                </tr>
              )}
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 500 }}>{format(parseISO(inv.issue_date), "d MMM yyyy", { locale: es })}</td>
                  <td>{inv.clientName}</td>
                  <td>{inv.concept}</td>
                  <td style={{ fontWeight: 600 }}>€{inv.amount.toFixed(2)}</td>
                  <td>
                    <select
                      className={`status-badge fw-bold status-select ${inv.status}`}
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                      style={{ border: 'none', appearance: 'none', cursor: 'pointer', paddingRight: '1rem' }}
                    >
                      <option value="paid" style={{ color: 'black' }}>Cobrada</option>
                      <option value="pending" style={{ color: 'black' }}>Pendiente</option>
                      <option value="overdue" style={{ color: 'black' }}>Vencida</option>
                    </select>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-button" title="Descargar PDF (Simulado)">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
