import { useEffect, useState, useCallback } from 'react';
import { Plus, Save, ChevronDown, ChevronUp, Trash2, CheckCircle2 } from 'lucide-react';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../lib/api';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEALS = ['desayuno', 'almuerzo', 'cena', 'snack'];
const MEAL_LABELS = { desayuno: '☀️ Desayuno', almuerzo: '🌿 Almuerzo', cena: '🌙 Cena', snack: '🍎 Snack' };

function getThisMonday() {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

function buildEmptyGrid() {
  const grid = {};
  DAYS.forEach((_, di) => {
    grid[di] = {};
    MEALS.forEach((meal) => { grid[di][meal] = ''; });
  });
  return grid;
}

function slotsToGrid(slots) {
  const grid = buildEmptyGrid();
  slots.forEach((s) => {
    if (grid[s.day_of_week] !== undefined) {
      grid[s.day_of_week][s.meal_type] = s.content;
    }
  });
  return grid;
}

function gridToSlots(grid) {
  const slots = [];
  Object.entries(grid).forEach(([day, meals]) => {
    Object.entries(meals).forEach(([meal_type, content]) => {
      slots.push({ day_of_week: Number(day), meal_type, content });
    });
  });
  return slots;
}

// Toast component
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast-notification">
      <CheckCircle2 size={18} />
      {message}
    </div>
  );
}

export default function PlanesAlimentarios() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [grid, setGrid] = useState(buildEmptyGrid());
  const [planTitle, setPlanTitle] = useState('Plan Semanal');
  const [weekStart, setWeekStart] = useState(getThisMonday());
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/patients').then((r) => {
      setPatients(r.data);
      if (r.data.length > 0) setSelectedPatientId(String(r.data[0].id));
    });
  }, []);

  const fetchPlans = useCallback(() => {
    if (!selectedPatientId) return;
    api.get(`/patients/${selectedPatientId}/meal-plans`).then((r) => {
      setPlans(r.data);
      if (r.data.length > 0) {
        const latest = r.data[0];
        setActivePlanId(latest.id);
        setPlanTitle(latest.title);
        setWeekStart(latest.week_start);
        setGrid(slotsToGrid(latest.slots));
      } else {
        setActivePlanId(null);
        setGrid(buildEmptyGrid());
      }
    });
  }, [selectedPatientId]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const loadPlan = (plan) => {
    setActivePlanId(plan.id);
    setPlanTitle(plan.title);
    setWeekStart(plan.week_start);
    setGrid(slotsToGrid(plan.slots));
    setExpandedHistory(false);
  };

  const newPlan = () => {
    setActivePlanId(null);
    setPlanTitle('Nuevo Plan');
    setWeekStart(getThisMonday());
    setGrid(buildEmptyGrid());
  };

  const handleSave = async () => {
    if (!selectedPatientId) return;
    setSaving(true);
    const payload = { patient_id: Number(selectedPatientId), title: planTitle, week_start: weekStart, slots: gridToSlots(grid) };
    try {
      if (activePlanId) {
        await api.put(`/meal-plans/${activePlanId}`, payload);
      } else {
        const res = await api.post('/meal-plans', payload);
        setActivePlanId(res.data.id);
      }
      setToast('Plan guardado correctamente');
      fetchPlans();
    } catch (e) {
      setToast('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('¿Eliminar este plan?')) return;
    await api.delete(`/meal-plans/${planId}`);
    fetchPlans();
    if (planId === activePlanId) newPlan();
  };

  const updateCell = (day, meal, value) => {
    setGrid((prev) => ({ ...prev, [day]: { ...prev[day], [meal]: value } }));
  };

  const weekLabel = weekStart
    ? `Semana del ${format(parseISO(weekStart), "d 'de' MMMM", { locale: es })}`
    : '';

  return (
    <div className="page-stack">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <section className="hero-header">
        <div>
          <span className="eyebrow">Nutrición</span>
          <h2>Planes Alimentarios</h2>
          <p>Diseña y gestiona la pauta semanal de cada paciente en una sola pantalla.</p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" onClick={newPlan}>
            <Plus size={16} /> Nuevo Plan
          </button>
          <button className="primary-button" onClick={handleSave} disabled={saving || !selectedPatientId}>
            <Save size={16} /> {saving ? 'Guardando…' : 'Guardar Plan'}
          </button>
        </div>
      </section>

      {/* Controls */}
      <section className="panel" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-field">
          <label className="form-label">Paciente</label>
          <select
            className="form-select"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Título del plan</label>
          <input
            className="form-input"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            placeholder="Ej: Plan Mayo – Pérdida de grasa"
          />
        </div>
        <div className="form-field">
          <label className="form-label">Semana del lunes</label>
          <input
            type="date"
            className="form-input"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
          />
        </div>
      </section>

      {/* Weekly Grid */}
      <section className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="meal-plan-header">
          <span className="eyebrow" style={{ padding: '16px 20px' }}>
            {weekLabel}
          </span>
        </div>
        <div className="meal-plan-grid">
          {/* Header row */}
          <div className="mpg-header-row">
            <div className="mpg-meal-label" />
            {DAYS.map((day) => (
              <div key={day} className="mpg-day-header">{day}</div>
            ))}
          </div>
          {/* Meal rows */}
          {MEALS.map((meal) => (
            <div key={meal} className="mpg-row">
              <div className="mpg-meal-label">{MEAL_LABELS[meal]}</div>
              {DAYS.map((_, di) => (
                <div key={di} className="mpg-cell">
                  <textarea
                    className="mpg-textarea"
                    value={grid[di]?.[meal] || ''}
                    onChange={(e) => updateCell(di, meal, e.target.value)}
                    placeholder="—"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      {plans.length > 0 && (
        <section className="panel">
          <button
            className="plan-history-toggle"
            onClick={() => setExpandedHistory(!expandedHistory)}
          >
            <span>Planes anteriores ({plans.length})</span>
            {expandedHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {expandedHistory && (
            <div className="plan-history-list">
              {plans.map((plan) => (
                <div key={plan.id} className={`plan-history-item ${activePlanId === plan.id ? 'active' : ''}`}>
                  <div>
                    <strong>{plan.title}</strong>
                    <span>Semana del {format(parseISO(plan.week_start), "d 'de' MMMM yyyy", { locale: es })}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="chip-link" onClick={() => loadPlan(plan)}>Cargar</button>
                    <button className="icon-button danger" onClick={() => handleDeletePlan(plan.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
