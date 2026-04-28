import { useState } from 'react';
import { BookOpen, FileText, DownloadCloud, PlayCircle, ExternalLink } from 'lucide-react';

const RESOURCES = [
  {
    id: 1, type: 'PDF', category: 'Herramientas', title: 'Plantilla DAFO Personal',
    description: 'Matriz en PDF para analizar debilidades, amenazas, fortalezas y oportunidades del cliente.',
    icon: FileText
  },
  {
    id: 2, type: 'Plantilla', category: 'Herramientas', title: 'Rueda de la Vida',
    description: 'Ejercicio clásico de balance vida-trabajo listo para imprimir o enviar digitalmente.',
    icon: FileText
  },
  {
    id: 3, type: 'Documento', category: 'Contratos', title: 'Acuerdo de Coaching 2026',
    description: 'Modelo estándar de contrato de confidencialidad y compromiso para nuevos clientes.',
    icon: BookOpen
  },
  {
    id: 4, type: 'Audio', category: 'Lecturas/Audio', title: 'Visualización: El Yo del Futuro',
    description: 'Audio guiado de 10 minutos para usar en sesiones de establecimiento de objetivos.',
    icon: PlayCircle
  },
  {
    id: 5, type: 'Link', category: 'Lecturas/Audio', title: 'Artículo: Escucha Activa Nivel 3',
    description: 'Referencia externa para enviar como tarea de lectura a líderes de equipo.',
    icon: ExternalLink
  },
  {
    id: 6, type: 'Excel', category: 'Herramientas', title: 'Tracker de Hábitos',
    description: 'Hoja de cálculo para que los clientes hagan seguimiento diario de micro-hábitos.',
    icon: FileText
  }
];

const CATEGORIES = ['Todas', 'Herramientas', 'Contratos', 'Lecturas/Audio'];

export default function Recursos() {
  const [filter, setFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const filtered = RESOURCES.filter(res => {
    const matchCat = filter === 'Todas' || res.category === filter;
    const matchSearch = res.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page-stack">
      <section className="hero-header">
        <div>
          <span className="eyebrow">Materiales</span>
          <h2>Biblioteca de Recursos</h2>
          <p>Tus plantillas, ejercicios y documentos siempre a mano para compartir con clientes.</p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="Buscar recurso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-chip-group">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="resource-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            No se encontraron recursos.
          </div>
        )}
        {filtered.map(resource => (
          <article key={resource.id} className="resource-card" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', boxShadow: '0 4px 12px rgba(33, 95, 70, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="resource-icon" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--surface-alt)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                <resource.icon size={24} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: '999px', background: 'var(--accent)', color: 'var(--primary)' }}>
                {resource.type}
              </span>
            </div>
            
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                {resource.category}
              </span>
              <h3 style={{ margin: '0.2rem 0', fontSize: '1.1rem', fontWeight: 700 }}>{resource.title}</h3>
              <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                {resource.description}
              </p>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="ghost-button" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => alert("Simulando descarga/apertura del recurso...")}>
                <DownloadCloud size={16} /> Abrir recurso
              </button>
            </div>
          </article>
        ))}
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .resource-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(33, 95, 70, 0.12) !important;
        }
      `}} />
    </div>
  );
}
