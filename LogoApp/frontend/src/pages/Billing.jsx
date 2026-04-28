import React, { useState } from 'react';
import { Receipt, Download, FileText, CheckCircle } from 'lucide-react';
import { mockInvoices } from '../mockData';
import { useToast } from '../context/ToastContext';

const Billing = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState(mockInvoices);
  const [selected, setSelected] = useState(null);

  const markPaid = (id) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv));
    setSelected(prev => prev ? { ...prev, status: 'paid' } : prev);
    showToast('Factura marcada como pagada.', 'success');
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <h1 className="page-title">Facturación</h1>

      {/* Summary */}
      <div className="grid-2 mb-4">
        <div className="card flex items-center gap-4">
          <div style={{ padding: '0.875rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-lg)' }}>
            <CheckCircle size={26} color="var(--success)" />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Cobrado</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{totalPaid} €</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '0.875rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-lg)' }}>
            <Receipt size={26} color="var(--warning)" />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Pendiente</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>{totalPending} €</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Registro de Sesiones</h2>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} onClick={() => setSelected(inv)} className="clickable-row">
                    <td className="text-muted">{new Date(inv.date).toLocaleDateString('es-ES')}</td>
                    <td className="fw-600">{inv.patientName}</td>
                    <td className="fw-600">{inv.amount} {inv.currency}</td>
                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {inv.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={e => { e.stopPropagation(); setSelected(inv); }}>
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Preview */}
        <div>
          {selected ? (
            <div className="card" style={{ position: 'sticky', top: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Receipt color="var(--primary)" size={20} />
                  <h2 className="card-title" style={{ margin: 0 }}>Factura #{String(selected.id).padStart(4, '0')}</h2>
                </div>
                <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>EMITIDO PARA</p>
                  <p className="fw-600">{selected.patientName}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {[
                  ['Fecha', new Date(selected.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Servicio', 'Sesión de logopedia'],
                  ['Estado', selected.status === 'paid' ? 'Pagado ✓' : 'Pendiente'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted">{label}:</span>
                    <span className="fw-500">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 mt-1" style={{ borderTop: '1px dashed var(--border)' }}>
                  <span className="fw-600">Total:</span>
                  <span className="fw-600" style={{ fontSize: '1.375rem', color: 'var(--primary)' }}>{selected.amount} {selected.currency}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {selected.status === 'pending' && (
                  <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => markPaid(selected.id)}>
                    <CheckCircle size={16} /> Marcar como Pagada
                  </button>
                )}
                <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                  <Download size={16} /> Descargar PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="card empty-state">
              <Receipt size={48} />
              <p>Selecciona una factura para ver el detalle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
