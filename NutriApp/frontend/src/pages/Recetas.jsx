import { useState } from 'react';
import { X, Clock, Flame, Target, ChevronRight, Check } from 'lucide-react';

const RECIPES = [
  {
    id: 1, name: 'Bowl de Proteína y Quinoa', category: 'Almuerzo', goal: 'Recomposición',
    kcal: 480, time: 20, difficulty: 'Fácil',
    description: 'Plato equilibrado con proteína magra, carbohidrato de calidad y verdura de temporada.',
    ingredients: ['150g pechuga de pollo', '80g quinoa cruda', 'Espinacas baby', '½ aguacate', 'Tomate cherry', 'AOVE, limón, sal'],
    steps: [
      'Cocer la quinoa 15 min en caldo de verduras.',
      'Hacer la pechuga a la plancha con especias al gusto.',
      'Montar el bowl: base de espinacas, quinoa, pollo en tiras.',
      'Añadir aguacate, tomate y aliñar con limón y AOVE.',
    ]
  },
  {
    id: 2, name: 'Batido Verde Energizante', category: 'Desayuno', goal: 'Energía',
    kcal: 290, time: 5, difficulty: 'Fácil',
    description: 'Desayuno rápido y saciante con buena dosis de fibra y micronutrientes.',
    ingredients: ['1 plátano maduro', 'Puñado de espinacas', '200ml leche de avena', '1 cdta mantequilla de cacahuete', 'Hielo'],
    steps: [
      'Poner todos los ingredientes en la batidora.',
      'Triturar hasta obtener textura homogénea.',
      'Servir inmediatamente.',
    ]
  },
  {
    id: 3, name: 'Salmón al Horno con Boniato', category: 'Cena', goal: 'Pérdida de grasa',
    kcal: 420, time: 30, difficulty: 'Media',
    description: 'Cena completa, antiinflamatoria y muy saciante. Ideal para objetivos de recomposición.',
    ingredients: ['200g salmón fresco', '1 boniato mediano', 'Espárragos', 'Limón, tomillo, AOVE', 'Sal y pimienta'],
    steps: [
      'Precalentar horno a 200°C.',
      'Cortar boniato en rodajas y hornear 15 min.',
      'Añadir el salmón con limón y tomillo.',
      'Hornear todo junto 12-15 min más.',
    ]
  },
  {
    id: 4, name: 'Porridge de Avena y Canela', category: 'Desayuno', goal: 'Energía',
    kcal: 320, time: 10, difficulty: 'Fácil',
    description: 'Desayuno clásico y muy adaptable. Alta saciedad y carga glucémica controlada.',
    ingredients: ['60g copos de avena', '250ml leche o bebida vegetal', '1 plátano', 'Canela, miel, frutos secos'],
    steps: [
      'Calentar la leche con la avena a fuego medio.',
      'Remover 5-7 min hasta la textura deseada.',
      'Servir con plátano, canela y frutos secos.',
    ]
  },
  {
    id: 5, name: 'Ensalada de Legumbres Completa', category: 'Almuerzo', goal: 'Peso saludable',
    kcal: 390, time: 10, difficulty: 'Fácil',
    description: 'Alto contenido en fibra y proteína vegetal. Perfecta para preparar con antelación.',
    ingredients: ['200g garbanzos cocidos', 'Pepino, tomate, cebolla morada', 'Perejil, comino', 'AOVE y vinagre'],
    steps: [
      'Escurrir y aclarar los garbanzos.',
      'Picar todas las verduras en dados pequeños.',
      'Mezclar todo y aliñar con AOVE, vinagre y especias.',
    ]
  },
  {
    id: 6, name: 'Tortilla de Verduras al Horno', category: 'Cena', goal: 'Pérdida de grasa',
    kcal: 280, time: 25, difficulty: 'Media',
    description: 'Cena ligera y proteica. Muy versátil para usar vegetales de temporada.',
    ingredients: ['3 huevos', 'Calabacín, pimiento, cebolla', '30g queso fresco light', 'Hierbas provenzales, sal'],
    steps: [
      'Saltear las verduras en sartén apta para horno.',
      'Batir los huevos y volcar sobre las verduras.',
      'Espolvorear queso y hornear 10 min a 180°C.',
    ]
  },
  {
    id: 7, name: 'Snack de Hummus y Crudités', category: 'Snack', goal: 'Peso saludable',
    kcal: 180, time: 5, difficulty: 'Fácil',
    description: 'Snack de media tarde con proteína vegetal, fibra y grasas saludables.',
    ingredients: ['4 cdas hummus', 'Zanahoria baby', 'Pepino en bastones', 'Apio'],
    steps: [
      'Lavar y cortar las verduras en bastones.',
      'Servir con el hummus como dip.',
    ]
  },
  {
    id: 8, name: 'Pollo al Curry con Arroz Basmati', category: 'Almuerzo', goal: 'Recomposición',
    kcal: 510, time: 35, difficulty: 'Media',
    description: 'Plato muy completo, con alta palatabilidad y perfil de macros equilibrado.',
    ingredients: ['180g pechuga de pollo', '80g arroz basmati', '150ml leche de coco light', '1 cdta curry, jengibre', 'Cebolla, ajo, AOVE'],
    steps: [
      'Cocer el arroz basmati según instrucciones.',
      'Sofreír cebolla y ajo, añadir el pollo en dados.',
      'Agregar el curry y la leche de coco.',
      'Cocinar 15 min a fuego medio y servir sobre arroz.',
    ]
  }
];

const CATEGORIES = ['Todas', 'Desayuno', 'Almuerzo', 'Cena', 'Snack'];
const GOALS = ['Todos', 'Pérdida de grasa', 'Recomposición', 'Energía', 'Peso saludable'];

export default function Recetas() {
  const [catFilter, setCatFilter] = useState('Todas');
  const [goalFilter, setGoalFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [added, setAdded] = useState({});

  const filtered = RECIPES.filter((r) => {
    const matchCat = catFilter === 'Todas' || r.category === catFilter;
    const matchGoal = goalFilter === 'Todos' || r.goal === goalFilter;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchGoal && matchSearch;
  });

  const handleAddToPlan = (recipe) => {
    setAdded((prev) => ({ ...prev, [recipe.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [recipe.id]: false })), 2000);
  };

  return (
    <div className="page-stack">
      <section className="hero-header">
        <div>
          <span className="eyebrow">Recursos</span>
          <h2>Biblioteca de Recetas</h2>
          <p>Recetas organizadas por objetivo y categoría para incorporar a los planes de tus pacientes.</p>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {filtered.length} recetas encontradas
        </div>
      </section>

      {/* Filters */}
      <section className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ flex: '1', minWidth: '180px' }}
            placeholder="Buscar receta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-chip-group">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-chip ${catFilter === c ? 'active' : ''}`}
                onClick={() => setCatFilter(c)}
              >{c}</button>
            ))}
          </div>
          <div className="filter-chip-group">
            {GOALS.map((g) => (
              <button
                key={g}
                className={`filter-chip goal ${goalFilter === g ? 'active' : ''}`}
                onClick={() => setGoalFilter(g)}
              >{g}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="recipe-grid">
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            No se encontraron recetas con esos filtros.
          </div>
        )}
        {filtered.map((recipe) => (
          <article key={recipe.id} className="recipe-card" onClick={() => setSelected(recipe)}>
            <div className="recipe-card-top">
              <span className={`recipe-category-badge cat-${recipe.category.toLowerCase()}`}>{recipe.category}</span>
              <span className="recipe-goal-badge">{recipe.goal}</span>
            </div>
            <h3 className="recipe-name">{recipe.name}</h3>
            <p className="recipe-description">{recipe.description}</p>
            <div className="recipe-meta">
              <span><Flame size={14} /> {recipe.kcal} kcal</span>
              <span><Clock size={14} /> {recipe.time} min</span>
              <span><Target size={14} /> {recipe.difficulty}</span>
            </div>
            <div className="recipe-card-footer">
              <button
                className={`recipe-add-btn ${added[recipe.id] ? 'added' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleAddToPlan(recipe); }}
              >
                {added[recipe.id] ? <><Check size={14} /> Añadido</> : <>Añadir al plan <ChevronRight size={14} /></>}
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span className={`recipe-category-badge cat-${selected.category.toLowerCase()}`}>{selected.category}</span>
                  <span className="recipe-goal-badge">{selected.goal}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', color: 'var(--muted)' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'grid', gap: 20 }}>
              <div className="recipe-meta" style={{ justifyContent: 'flex-start', gap: 24 }}>
                <span><Flame size={15} /> {selected.kcal} kcal</span>
                <span><Clock size={15} /> {selected.time} min</span>
                <span><Target size={15} /> {selected.difficulty}</span>
              </div>
              <div>
                <h4 className="recipe-section-title">Ingredientes</h4>
                <ul className="recipe-ingredient-list">
                  {selected.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="recipe-section-title">Preparación</h4>
                <ol className="recipe-steps-list">
                  {selected.steps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
              <button
                className={`recipe-add-btn full ${added[selected.id] ? 'added' : ''}`}
                onClick={() => handleAddToPlan(selected)}
              >
                {added[selected.id] ? <><Check size={16} /> Añadido al plan</> : <>Añadir a plan alimentario <ChevronRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
