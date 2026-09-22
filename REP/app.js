const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const STORAGE_KEY = 'rep-gym-mvp-v1';
const exerciseCatalog = [
  {group:'Pecho', icon:'◒', exercises:['Press banca con barra','Press banca con mancuernas','Press inclinado con barra','Press inclinado con mancuernas','Press de pecho en máquina','Press inclinado en máquina','Aperturas en máquina (pec deck)','Aperturas en polea','Flexiones','Fondos para pecho']},
  {group:'Espalda', icon:'▤', exercises:['Jalón al pecho','Jalón al pecho agarre neutro','Dominadas','Dominadas asistidas','Remo sentado en polea','Remo en máquina','Remo con mancuerna','Remo con barra','Remo T-Bar','Pullover en polea','Hiperextensiones']},
  {group:'Hombro', icon:'◆', exercises:['Press militar con mancuernas','Press de hombro en máquina','Press militar con barra','Elevaciones laterales con mancuernas','Elevaciones laterales en polea','Elevaciones laterales en máquina','Pájaros en máquina','Pájaros con mancuernas','Face pull']},
  {group:'Bíceps', icon:'⌁', exercises:['Curl de bíceps con barra Z','Curl de bíceps con mancuernas','Curl alterno con mancuernas','Curl martillo','Curl de bíceps en polea','Curl predicador','Curl predicador en máquina','Curl inclinado con mancuernas']},
  {group:'Tríceps', icon:'⌇', exercises:['Extensión de tríceps en polea con cuerda','Extensión de tríceps en polea con barra','Extensión de tríceps por encima de la cabeza en polea','Press francés con barra Z','Press francés con mancuernas','Fondos asistidos','Fondos en paralelas','Press cerrado']},
  {group:'Cuádriceps', icon:'△', exercises:['Sentadilla','Sentadilla en multipower','Hack squat','Prensa de piernas','Extensión de cuádriceps','Sentadilla búlgara','Zancadas','Step-up']},
  {group:'Isquios', icon:'▽', exercises:['Curl femoral sentado','Curl femoral tumbado','Peso muerto rumano con barra','Peso muerto rumano con mancuernas','Buenos días']},
  {group:'Glúteo', icon:'●', exercises:['Hip thrust con barra','Hip thrust en máquina','Puente de glúteo','Patada de glúteo en polea','Patada de glúteo en máquina','Abductores en máquina','Sentadilla sumo','Step-up']},
  {group:'Gemelo', icon:'│', exercises:['Elevación de gemelos de pie','Elevación de gemelos sentado','Gemelos en prensa','Gemelos en máquina']},
  {group:'Core', icon:'◎', exercises:['Crunch en máquina','Crunch en polea','Elevación de rodillas colgado','Elevación de piernas','Plancha','Rueda abdominal','Rotación de torso en máquina']},
  {group:'Aductores', icon:'◇', exercises:['Aductores en máquina','Sentadilla sumo']}
];
const catalog = exerciseCatalog.flatMap(g=>g.exercises);

const seed = {
  settings:{weeklyGoal:4, restSeconds:90},
  routines:[
    {id:'r-back', name:'Espalda + bíceps', exercises:['Jalón al pecho','Remo sentado en polea','Remo en máquina','Pullover en polea','Curl de bíceps en polea','Curl martillo','Elevaciones laterales en máquina']},
    {id:'r-push', name:'Pecho + tríceps', exercises:['Press de pecho en máquina','Press inclinado con mancuernas','Aperturas en máquina (pec deck)','Extensión de tríceps en polea con cuerda','Press de hombro en máquina']},
    {id:'r-leg', name:'Pierna', exercises:['Prensa de piernas','Sentadilla','Extensión de cuádriceps','Curl femoral sentado','Hip thrust en máquina','Gemelos en prensa','Abductores en máquina']}
  ],
  workouts:[],
  active:null
};

let state = load();
let view = 'home';
let restInterval = null;
let restUntil = null;
let toastTimer = null;
let elapsedInterval = null;

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(seed);
    const parsed = JSON.parse(raw);
    return {...structuredClone(seed), ...parsed, settings:{...seed.settings,...(parsed.settings||{})}};
  }catch{ return structuredClone(seed); }
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid(p='id'){ return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function isoDay(d=new Date()){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function prettyDate(ts){ return new Intl.DateTimeFormat('es-ES',{weekday:'short',day:'numeric',month:'short'}).format(new Date(ts)); }
function mins(ms){ return Math.max(1,Math.round(ms/60000)); }
function fmtTime(ms){ const s=Math.max(0,Math.floor(ms/1000)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function fmtRest(s){ s=Math.max(0,s); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function volume(w){ return w.exercises.flatMap(e=>e.sets).filter(s=>s.done).reduce((a,s)=>a+(Number(s.weight)||0)*(Number(s.reps)||0),0); }
function completedSets(w){ return w.exercises.flatMap(e=>e.sets).filter(s=>s.done).length; }
function exerciseDone(e){ return e.sets.length>0 && e.sets.every(s=>s.done); }
function groupForExercise(name){ return exerciseCatalog.find(g=>g.exercises.includes(name))?.group || 'Otro'; }

function weekStart(date=new Date()){
  const d=new Date(date); const day=(d.getDay()+6)%7; d.setHours(0,0,0,0); d.setDate(d.getDate()-day); return d;
}
function workoutsThisWeek(){ const s=weekStart(); return state.workouts.filter(w=>new Date(w.finishedAt)>=s); }
function activeWeekStreak(){
  if(!state.workouts.length) return 0;
  const occupied = new Set(state.workouts.map(w=>isoDay(weekStart(new Date(w.finishedAt)))));
  let cur=weekStart(); let streak=0;
  if(!occupied.has(isoDay(cur))){ cur.setDate(cur.getDate()-7); }
  while(occupied.has(isoDay(cur))){ streak++; cur.setDate(cur.getDate()-7); }
  return streak;
}
function weekDays(){
  const start=weekStart();
  return [...Array(7)].map((_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
}
function hasWorkoutOn(d){ const target=isoDay(d); return state.workouts.some(w=>isoDay(new Date(w.finishedAt))===target); }
function lastExerciseSets(name){
  const last=[...state.workouts].reverse().find(w=>w.exercises.some(e=>e.name===name));
  if(!last) return null;
  return last.exercises.find(e=>e.name===name).sets.filter(s=>s.done);
}
function bestSetText(name){
  const sets=lastExerciseSets(name); if(!sets?.length) return 'Sin registro previo';
  return sets.map(s=>`${s.weight||0}×${s.reps||0}`).join(' · ');
}

function render(){
  clearInterval(elapsedInterval); elapsedInterval=null;
  const app=$('#app');
  if(state.active){ app.innerHTML=workoutView(); bindWorkout(); return; }
  app.innerHTML=`<main class="app-shell">${topbar()}${view==='home'?homeView():view==='routines'?routinesView():view==='history'?historyView():settingsView()}</main>${nav()}`;
  bindCommon();
}
function topbar(){ return `<div class="topbar"><div class="brand">RE<span>P</span></div><span class="pill">local · privado</span></div>`; }
function nav(){
  const items=[['home','⌂','Inicio'],['routines','▦','Rutinas'],['history','↺','Historial'],['settings','⚙','Ajustes']];
  return `<nav class="nav">${items.map(([id,ic,t])=>`<button data-view="${id}" class="${view===id?'active':''}"><span class="nicon">${ic}</span>${t}</button>`).join('')}</nav>`;
}

function homeView(){
  const wk=workoutsThisWeek().length, goal=state.settings.weeklyGoal;
  const days=['L','M','X','J','V','S','D']; const today=isoDay();
  const last=state.workouts.at(-1);
  return `
    <div class="eyebrow">Tu entrenamiento</div>
    <h1 class="hero-title">Entrena. Apunta.<br>Progresa.</h1>
    <p class="subtle">Lo justo para registrar el gym sin convertir cada serie en una tarea.</p>
    <div class="grid-2">
      <div class="stat"><strong>🔥 ${activeWeekStreak()}</strong><small>semanas activo</small></div>
      <div class="stat"><strong>${wk}/${goal}</strong><small>objetivo semanal</small></div>
    </div>
    <div class="card">
      <div class="card-row"><div><div class="eyebrow">Esta semana</div><h3 class="mb0">${wk>=goal?'Objetivo cumplido':'Sigue sumando'}</h3></div><span class="pill ${wk>=goal?'accent':''}">${Math.min(100,Math.round(wk/goal*100))}%</span></div>
      <div class="progress-line"><span style="width:${Math.min(100,wk/goal*100)}%"></span></div>
      <div class="week mt12">${weekDays().map((d,i)=>`<div class="day ${hasWorkoutOn(d)?'done':''} ${isoDay(d)===today?'today':''}"><b>${days[i]}</b><div class="dot">${hasWorkoutOn(d)?'✓':'·'}</div></div>`).join('')}</div>
    </div>
    <div class="section-title"><h2>Empezar entrenamiento</h2><button class="link-btn" data-view="routines">Ver rutinas</button></div>
    ${state.routines.slice(0,2).map(r=>routineCard(r)).join('')}
    ${last?`<div class="section-title"><h2>Última sesión</h2></div><div class="card history-item"><div class="datebox"><strong>${new Date(last.finishedAt).getDate()}</strong>${new Intl.DateTimeFormat('es-ES',{month:'short'}).format(new Date(last.finishedAt))}</div><div><h3>${last.name}</h3><div class="meta">${completedSets(last)} series · ${mins(last.finishedAt-last.startedAt)} min · ${Math.round(volume(last))} kg</div></div><span>›</span></div>`:''}
  `;
}
function routineCard(r){return `<div class="card routine-card"><div class="routine-icon">${r.name.toLowerCase().includes('pierna')?'🦵':'⚡'}</div><div class="routine-main"><h3>${escapeHtml(r.name)}</h3><div class="routine-meta">${r.exercises.length} ejercicios · ${r.exercises.slice(0,2).join(', ')}${r.exercises.length>2?'…':''}</div></div><button class="start-small" data-start="${r.id}">Empezar</button></div>`;}
function routinesView(){return `
  <div class="card-row"><div><div class="eyebrow">Rutinas</div><h1 class="hero-title">Tus sesiones</h1></div><button class="icon-btn" id="new-routine">＋</button></div>
  <p class="subtle">Puedes usar una de base y editarla después. Para hoy, toca “Empezar” y listo.</p>
  ${state.routines.map(r=>routineCard(r)).join('')}
  <button class="primary mt12" id="free-workout">+ Entrenamiento libre</button>`;}
function historyView(){
  const arr=[...state.workouts].reverse();
  return `<div class="eyebrow">Historial</div><h1 class="hero-title">Lo que ya hiciste</h1><p class="subtle">Tus entrenamientos quedan guardados en este dispositivo.</p>${arr.length?arr.map(w=>`<div class="card history-item"><div class="datebox"><strong>${new Date(w.finishedAt).getDate()}</strong>${new Intl.DateTimeFormat('es-ES',{month:'short'}).format(new Date(w.finishedAt))}</div><div><h3>${escapeHtml(w.name)}</h3><div class="meta">${completedSets(w)} series · ${mins(w.finishedAt-w.startedAt)} min<br>${Math.round(volume(w))} kg de volumen</div></div><span>✓</span></div>`).join(''):`<div class="empty">Todavía no hay entrenamientos.<br>El primero empieza hoy.</div>`}`;
}
function settingsView(){return `
  <div class="eyebrow">Ajustes</div><h1 class="hero-title">A tu manera</h1>
  <div class="card">
    <div class="form-group"><label>OBJETIVO DE ENTRENAMIENTOS / SEMANA</label><input class="form-input" id="goal" type="number" min="1" max="7" value="${state.settings.weeklyGoal}"></div>
    <div class="form-group"><label>DESCANSO POR DEFECTO (SEGUNDOS)</label><input class="form-input" id="rest" type="number" min="15" max="600" step="15" value="${state.settings.restSeconds}"></div>
    <button class="primary" id="save-settings">Guardar ajustes</button>
  </div>
  <div class="card"><h3>Datos</h3><p class="subtle">Este MVP guarda todo únicamente en el navegador de este dispositivo.</p><div class="card-row"><button class="secondary" id="export">Exportar JSON</button><button class="secondary danger" id="reset">Borrar todo</button></div></div>`;}

function startRoutine(id){
  const r=state.routines.find(x=>x.id===id);
  const ex = r ? r.exercises : [];
  state.active={id:uid('w'),name:r?.name||'Entrenamiento libre',startedAt:Date.now(),exercises:ex.map(name=>({id:uid('e'),name,sets:defaultSets(name)}))};
  save(); render();
}
function defaultSets(name){
  const last=lastExerciseSets(name);
  if(last?.length) return last.map(s=>({weight:s.weight,reps:s.reps,done:false}));
  return [1,2,3].map(()=>({weight:'',reps:'',done:false}));
}
function workoutView(){
  const w=state.active;
  return `<main class="app-shell">
    <div class="workout-head"><div class="workout-title"><button class="icon-btn" id="cancel-workout">×</button><h1>${escapeHtml(w.name)}</h1><span class="timer" id="elapsed">00:00</span><button class="finish-btn" id="finish-workout">Terminar</button></div></div>
    ${w.exercises.length?w.exercises.map((e,ei)=>exerciseBlock(e,ei)).join(''):`<div class="empty">Añade tu primer ejercicio.</div>`}
    <button class="primary mt12" id="add-exercise">+ Añadir ejercicio</button>
  </main>${restUntil?restBar():''}`;
}
function exerciseBlock(e,ei){
  const complete=exerciseDone(e);
  return `<section class="exercise ${complete?'exercise-complete':''}"><div class="exercise-head"><div class="card-row"><div><div class="exercise-title-row"><h3>${escapeHtml(e.name)}</h3>${complete?'<span class="done-badge">Completado</span>':''}</div><div class="last">${escapeHtml(groupForExercise(e.name))} · Última vez: ${escapeHtml(bestSetText(e.name))}</div></div><div class="exercise-tools"><button class="mini-icon" data-move-up="${ei}" ${ei===0?'disabled':''}>↑</button><button class="mini-icon" data-move-down="${ei}" ${ei===state.active.exercises.length-1?'disabled':''}>↓</button><button class="mini-icon danger-icon" data-remove-ex="${ei}">×</button></div></div></div>
    <div class="set-head"><span>Set</span><span>kg</span><span>reps</span><span></span><span>✓</span></div>
    ${e.sets.map((s,si)=>`<div class="set-row ${s.done?'set-done':''}"><div class="set-num">${si+1}</div><input class="set-input" inputmode="decimal" type="number" step="0.5" placeholder="kg" value="${s.weight}" data-weight="${ei}:${si}"><input class="set-input" inputmode="numeric" type="number" step="1" placeholder="reps" value="${s.reps}" data-reps="${ei}:${si}"><button class="set-delete" data-delset="${ei}:${si}" aria-label="Borrar serie">−</button><button class="check ${s.done?'done':''}" data-done="${ei}:${si}">${s.done?'✓':'○'}</button></div>`).join('')}
    <div class="exercise-actions"><button class="secondary" data-addset="${ei}">+ Serie</button><button class="secondary" data-prefill="${ei}">Copiar anterior</button></div>
  </section>`;
}
function restBar(){
  const left=restSecondsLeft();
  const pct=Math.max(0,Math.min(100,left/Math.max(1,state.settings.restSeconds)*100));
  return `<div class="restbar"><span class="rest-icon">⏱</span><div class="grow"><div class="rest-top"><span>Descanso</span><strong id="rest-left">${fmtRest(left)}</strong></div><div class="rest-progress"><span id="rest-progress" style="width:${pct}%"></span></div></div><button id="rest-plus">+30</button><button id="rest-skip">Saltar</button></div>`;
}
function restSecondsLeft(){ return Math.max(0,Math.ceil((restUntil-Date.now())/1000)); }

function bindCommon(){
  $$('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});
  $$('[data-start]').forEach(b=>b.onclick=()=>startRoutine(b.dataset.start));
  $('#new-routine')?.addEventListener('click',()=>openRoutineModal());
  $('#free-workout')?.addEventListener('click',()=>startRoutine(null));
  $('#save-settings')?.addEventListener('click',()=>{state.settings.weeklyGoal=clamp(+$('#goal').value,1,7);state.settings.restSeconds=clamp(+$('#rest').value,15,600);save();toast('Ajustes guardados');render();});
  $('#export')?.addEventListener('click',exportData);
  $('#reset')?.addEventListener('click',()=>{if(confirm('¿Borrar entrenamientos, rutinas y ajustes de este dispositivo?')){localStorage.removeItem(STORAGE_KEY);state=structuredClone(seed);render();}});
}
function bindWorkout(){
  const started=state.active.startedAt;
  const elapsed=$('#elapsed');
  clearInterval(elapsedInterval);
  elapsedInterval=setInterval(()=>{if(!state.active){clearInterval(elapsedInterval);return;} if(elapsed) elapsed.textContent=fmtTime(Date.now()-started);},1000);
  $$('[data-weight]').forEach(i=>i.oninput=()=>updateSet(i.dataset.weight,'weight',i.value));
  $$('[data-reps]').forEach(i=>i.oninput=()=>updateSet(i.dataset.reps,'reps',i.value));
  $$('[data-done]').forEach(b=>b.onclick=()=>toggleDone(b.dataset.done));
  $$('[data-addset]').forEach(b=>b.onclick=()=>{const e=state.active.exercises[+b.dataset.addset];const prev=e.sets.at(-1)||{};e.sets.push({weight:prev.weight||'',reps:prev.reps||'',done:false});save();render();});
  $$('[data-delset]').forEach(b=>b.onclick=()=>deleteSet(b.dataset.delset));
  $$('[data-prefill]').forEach(b=>b.onclick=()=>{const e=state.active.exercises[+b.dataset.prefill];const last=lastExerciseSets(e.name);if(last?.length)e.sets=last.map(s=>({weight:s.weight,reps:s.reps,done:false}));else toast('Todavía no hay una sesión anterior');save();render();});
  $$('[data-remove-ex]').forEach(b=>b.onclick=()=>removeExercise(+b.dataset.removeEx));
  $$('[data-move-up]').forEach(b=>b.onclick=()=>moveExercise(+b.dataset.moveUp,-1));
  $$('[data-move-down]').forEach(b=>b.onclick=()=>moveExercise(+b.dataset.moveDown,1));
  $('#add-exercise').onclick=()=>openExerciseModal();
  $('#finish-workout').onclick=finishWorkout;
  $('#cancel-workout').onclick=()=>{if(confirm('¿Descartar este entrenamiento?')){state.active=null;stopRest();save();render();}};
  $('#rest-plus')?.addEventListener('click',()=>{restUntil+=30000;startRestTick();updateRestUi();});
  $('#rest-skip')?.addEventListener('click',()=>{stopRest();render();});
  startRestTick();
}
function updateSet(key,field,value){const [ei,si]=key.split(':').map(Number);state.active.exercises[ei].sets[si][field]=value;save();}
function deleteSet(key){
  const [ei,si]=key.split(':').map(Number); const e=state.active.exercises[ei];
  if(e.sets.length===1){toast('Un ejercicio debe tener al menos una serie');return;}
  e.sets.splice(si,1); save(); render();
}
function moveExercise(ei,dir){
  const ni=ei+dir; if(ni<0||ni>=state.active.exercises.length)return;
  const [e]=state.active.exercises.splice(ei,1); state.active.exercises.splice(ni,0,e); save(); render();
}
function toggleDone(key){
  const [ei,si]=key.split(':').map(Number); const s=state.active.exercises[ei].sets[si];
  s.done=!s.done; save();
  if(s.done){restUntil=Date.now()+state.settings.restSeconds*1000; if(navigator.vibrate) navigator.vibrate(30);} else restUntil=null;
  render();
}
function removeExercise(ei){if(confirm(`¿Quitar ${state.active.exercises[ei].name}?`)){state.active.exercises.splice(ei,1);save();render();}}
function finishWorkout(){
  const w=state.active; const done=completedSets(w);
  if(!done && !confirm('No has marcado ninguna serie como hecha. ¿Terminar igualmente?')) return;
  w.finishedAt=Date.now(); state.workouts.push(w); state.active=null; restUntil=null; stopRest(); clearInterval(elapsedInterval); elapsedInterval=null; save(); view='home'; render(); toast(`Entrenamiento guardado · ${done} series`);
}
function updateRestUi(){
  const left=restSecondsLeft();
  const el=$('#rest-left'); if(el) el.textContent=fmtRest(left);
  const p=$('#rest-progress'); if(p){const total=Math.max(1,state.settings.restSeconds);p.style.width=`${Math.max(0,Math.min(100,left/total*100))}%`;}
}
function startRestTick(){
  clearInterval(restInterval); if(!restUntil)return;
  updateRestUi();
  restInterval=setInterval(()=>{
    const left=restSecondsLeft(); updateRestUi();
    if(left<=0){stopRest(); if(navigator.vibrate) navigator.vibrate([80,60,80]); render();}
  },250);
}
function stopRest(){clearInterval(restInterval);restInterval=null;restUntil=null;}


function catalogHtml(selectedGroup='Todos',query=''){
  const q=query.trim().toLowerCase();
  return exerciseCatalog.filter(g=>selectedGroup==='Todos'||g.group===selectedGroup).map(g=>{
    const items=g.exercises.filter(x=>!q||x.toLowerCase().includes(q)); if(!items.length)return '';
    return `<section class="catalog-group"><div class="catalog-title"><span>${g.icon}</span><strong>${g.group}</strong><small>${items.length}</small></div><div class="exercise-picker">${items.map(x=>`<button class="chip" data-exchoice="${escapeAttr(x)}">${escapeHtml(x)}</button>`).join('')}</div></section>`;
  }).join('');
}
function groupFilters(active='Todos'){
  return `<div class="group-filters">${['Todos',...exerciseCatalog.map(g=>g.group)].map(g=>`<button class="group-chip ${g===active?'selected':''}" data-group="${escapeAttr(g)}">${escapeHtml(g)}</button>`).join('')}</div>`;
}
function routineCatalogHtml(selectedGroup='Todos',query='',selected=new Set()){
  const q=query.trim().toLowerCase();
  return exerciseCatalog.filter(g=>selectedGroup==='Todos'||g.group===selectedGroup).map(g=>{
    const items=g.exercises.filter(x=>!q||x.toLowerCase().includes(q)); if(!items.length)return '';
    return `<section class="catalog-group"><div class="catalog-title"><span>${g.icon}</span><strong>${g.group}</strong></div><div class="exercise-picker">${items.map(x=>`<button class="chip ${selected.has(x)?'selected':''}" data-rchoice="${escapeAttr(x)}">${escapeHtml(x)}</button>`).join('')}</div></section>`;
  }).join('');
}

function openExerciseModal(){
  let activeGroup='Todos';
  modal(`<div class="modal-sticky"><h2>Añadir ejercicio</h2><input class="form-input" id="exercise-search" placeholder="Buscar ejercicio…">${groupFilters(activeGroup)}</div><div id="catalog-list">${catalogHtml(activeGroup)}</div><div class="custom-add"><div class="eyebrow">¿No aparece?</div><p class="subtle mb0">Escribe el nombre arriba y añádelo igualmente.</p></div><div class="modal-actions"><button class="secondary" data-close>Cerrar</button><button class="primary" id="add-custom">Añadir escrito</button></div>`);
  const bindChoices=()=>$$('[data-exchoice]').forEach(b=>b.onclick=()=>addExercise(b.dataset.exchoice));
  const redraw=()=>{
    $('#catalog-list').innerHTML=catalogHtml(activeGroup,$('#exercise-search').value);
    bindChoices();
    $$('.group-chip').forEach(b=>b.classList.toggle('selected',b.dataset.group===activeGroup));
  };
  bindChoices();
  $('#exercise-search').oninput=redraw;
  $$('.group-chip').forEach(b=>b.onclick=()=>{activeGroup=b.dataset.group;redraw();});
  $('#add-custom').onclick=()=>{const v=$('#exercise-search').value.trim();if(v)addExercise(v);};
}
function addExercise(name){state.active.exercises.push({id:uid('e'),name,sets:defaultSets(name)});save();closeModal();render();}
function openRoutineModal(){
  let activeGroup='Todos'; const selected=new Set();
  modal(`<div class="modal-sticky"><h2>Nueva rutina</h2><div class="form-group"><label>NOMBRE</label><input class="form-input" id="routine-name" placeholder="Ej. Torso rápido"></div><input class="form-input" id="routine-search" placeholder="Buscar ejercicio…">${groupFilters(activeGroup)}</div><div id="routine-catalog">${routineCatalogHtml(activeGroup,'',selected)}</div><div class="modal-actions"><button class="secondary" data-close>Cancelar</button><button class="primary" id="save-routine">Guardar</button></div>`);
  const bindChoices=()=>$$('[data-rchoice]').forEach(b=>b.onclick=()=>{const n=b.dataset.rchoice;selected.has(n)?selected.delete(n):selected.add(n);b.classList.toggle('selected',selected.has(n));});
  const redraw=()=>{
    $('#routine-catalog').innerHTML=routineCatalogHtml(activeGroup,$('#routine-search').value,selected);
    bindChoices();
    $$('.group-chip').forEach(b=>b.classList.toggle('selected',b.dataset.group===activeGroup));
  };
  bindChoices();
  $('#routine-search').oninput=redraw;
  $$('.group-chip').forEach(b=>b.onclick=()=>{activeGroup=b.dataset.group;redraw();});
  $('#save-routine').onclick=()=>{const name=$('#routine-name').value.trim()||'Nueva rutina';const exercises=[...selected];if(!exercises.length){toast('Selecciona al menos un ejercicio');return;}state.routines.push({id:uid('r'),name,exercises});save();closeModal();render();};
}
function modal(html){const w=document.createElement('div');w.className='modal-wrap';w.id='modal-wrap';w.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(w);w.onclick=e=>{if(e.target===w||e.target.matches('[data-close]'))closeModal();};}
function closeModal(){ $('#modal-wrap')?.remove(); }
function toast(msg){clearTimeout(toastTimer);$('.toast')?.remove();const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);toastTimer=setTimeout(()=>t.remove(),2200);}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`rep-backup-${isoDay()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function clamp(n,a,b){return Math.min(b,Math.max(a,Number.isFinite(n)?n:a));}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function escapeAttr(s=''){return escapeHtml(s);}

window.addEventListener('beforeunload',save);
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
render();
