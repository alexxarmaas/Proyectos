const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const STORAGE_KEY = 'rep-gym-mvp-v1';
const catalog = [
  'Press banca','Press inclinado','Press sentado','Aperturas máquina','Fondos','Extensión tríceps polea',
  'Jalón al pecho','Remo sentado','Remo máquina','Pullover polea','Curl bíceps polea','Curl martillo',
  'Press hombro','Elevaciones laterales','Pájaros máquina',
  'Sentadilla','Prensa','Extensión cuádriceps','Curl femoral sentado','Curl femoral tumbado','Gemelos','Aductores','Abductores','Patada de glúteo'
];

const seed = {
  settings:{weeklyGoal:4, restSeconds:90},
  routines:[
    {id:'r-back', name:'Espalda + bíceps', exercises:['Jalón al pecho','Remo sentado','Remo máquina','Curl bíceps polea','Curl martillo','Elevaciones laterales']},
    {id:'r-push', name:'Pecho + tríceps', exercises:['Press banca','Press inclinado','Aperturas máquina','Extensión tríceps polea','Press hombro']},
    {id:'r-leg', name:'Pierna', exercises:['Prensa','Sentadilla','Extensión cuádriceps','Curl femoral sentado','Gemelos','Abductores']}
  ],
  workouts:[],
  active:null
};

let state = load();
let view = 'home';
let restInterval = null;
let restUntil = null;
let toastTimer = null;

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
function volume(w){ return w.exercises.flatMap(e=>e.sets).filter(s=>s.done).reduce((a,s)=>a+(Number(s.weight)||0)*(Number(s.reps)||0),0); }
function completedSets(w){ return w.exercises.flatMap(e=>e.sets).filter(s=>s.done).length; }

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
  return `<section class="exercise"><div class="exercise-head"><div class="card-row"><div><h3>${escapeHtml(e.name)}</h3><div class="last">Última vez: ${escapeHtml(bestSetText(e.name))}</div></div><button class="icon-btn" data-remove-ex="${ei}">⋯</button></div></div>
    <div class="set-head"><span>Set</span><span>kg</span><span>reps</span><span>✓</span></div>
    ${e.sets.map((s,si)=>`<div class="set-row"><div class="set-num">${si+1}</div><input class="set-input" inputmode="decimal" type="number" step="0.5" placeholder="kg" value="${s.weight}" data-weight="${ei}:${si}"><input class="set-input" inputmode="numeric" type="number" step="1" placeholder="reps" value="${s.reps}" data-reps="${ei}:${si}"><button class="check ${s.done?'done':''}" data-done="${ei}:${si}">${s.done?'✓':'○'}</button></div>`).join('')}
    <div class="exercise-actions"><button class="secondary" data-addset="${ei}">+ Serie</button><button class="secondary" data-prefill="${ei}">Copiar anterior</button></div>
  </section>`;
}
function restBar(){return `<div class="restbar"><span>⏱</span><div class="grow"><div class="small">Descanso</div><strong id="rest-left">${restSecondsLeft()}s</strong></div><button id="rest-plus">+30</button><button id="rest-skip">Saltar</button></div>`;}
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
  const timer=setInterval(()=>{if(!state.active){clearInterval(timer);return;} if(elapsed) elapsed.textContent=fmtTime(Date.now()-started);},1000);
  $$('[data-weight]').forEach(i=>i.oninput=()=>updateSet(i.dataset.weight,'weight',i.value));
  $$('[data-reps]').forEach(i=>i.oninput=()=>updateSet(i.dataset.reps,'reps',i.value));
  $$('[data-done]').forEach(b=>b.onclick=()=>toggleDone(b.dataset.done));
  $$('[data-addset]').forEach(b=>b.onclick=()=>{const e=state.active.exercises[+b.dataset.addset];const prev=e.sets.at(-1)||{};e.sets.push({weight:prev.weight||'',reps:prev.reps||'',done:false});save();render();});
  $$('[data-prefill]').forEach(b=>b.onclick=()=>{const e=state.active.exercises[+b.dataset.prefill];const last=lastExerciseSets(e.name);if(last?.length)e.sets=last.map(s=>({weight:s.weight,reps:s.reps,done:false}));save();render();});
  $$('[data-remove-ex]').forEach(b=>b.onclick=()=>removeExercise(+b.dataset.removeEx));
  $('#add-exercise').onclick=()=>openExerciseModal();
  $('#finish-workout').onclick=finishWorkout;
  $('#cancel-workout').onclick=()=>{if(confirm('¿Descartar este entrenamiento?')){state.active=null;save();render();}};
  $('#rest-plus')?.addEventListener('click',()=>{restUntil+=30000;startRestTick();});
  $('#rest-skip')?.addEventListener('click',()=>{stopRest();render();});
  startRestTick();
}
function updateSet(key,field,value){const [ei,si]=key.split(':').map(Number);state.active.exercises[ei].sets[si][field]=value;save();}
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
  w.finishedAt=Date.now(); state.workouts.push(w); state.active=null; restUntil=null; stopRest(); save(); view='home'; render(); toast(`Entrenamiento guardado · ${done} series`);
}
function startRestTick(){
  clearInterval(restInterval); if(!restUntil)return;
  restInterval=setInterval(()=>{
    const el=$('#rest-left'); const left=restSecondsLeft();
    if(el) el.textContent=`${left}s`;
    if(left<=0){stopRest(); if(navigator.vibrate) navigator.vibrate([80,60,80]); render();}
  },500);
}
function stopRest(){clearInterval(restInterval);restInterval=null;restUntil=null;}

function openExerciseModal(){
  const choices=[...catalog, ...state.routines.flatMap(r=>r.exercises)].filter((x,i,a)=>a.indexOf(x)===i);
  modal(`<h2>Añadir ejercicio</h2><input class="form-input" id="exercise-search" placeholder="Buscar o escribir ejercicio…"><div class="exercise-picker mt12" id="exercise-list">${choices.map(x=>`<button class="chip" data-exchoice="${escapeAttr(x)}">${escapeHtml(x)}</button>`).join('')}</div><div class="modal-actions"><button class="secondary" data-close>Cerrar</button><button class="primary" id="add-custom">Añadir escrito</button></div>`);
  const filter=()=>{const q=$('#exercise-search').value.toLowerCase();$$('[data-exchoice]').forEach(b=>b.style.display=b.dataset.exchoice.toLowerCase().includes(q)?'':'none');};
  $('#exercise-search').oninput=filter;
  $$('[data-exchoice]').forEach(b=>b.onclick=()=>addExercise(b.dataset.exchoice));
  $('#add-custom').onclick=()=>{const v=$('#exercise-search').value.trim();if(v)addExercise(v);};
}
function addExercise(name){state.active.exercises.push({id:uid('e'),name,sets:defaultSets(name)});save();closeModal();render();}
function openRoutineModal(){
  modal(`<h2>Nueva rutina</h2><div class="form-group"><label>NOMBRE</label><input class="form-input" id="routine-name" placeholder="Ej. Torso rápido"></div><div class="form-group"><label>EJERCICIOS</label><div class="exercise-picker">${catalog.map(x=>`<button class="chip" data-rchoice="${escapeAttr(x)}">${escapeHtml(x)}</button>`).join('')}</div></div><div class="modal-actions"><button class="secondary" data-close>Cancelar</button><button class="primary" id="save-routine">Guardar</button></div>`);
  $$('[data-rchoice]').forEach(b=>b.onclick=()=>b.classList.toggle('selected'));
  $('#save-routine').onclick=()=>{const name=$('#routine-name').value.trim()||'Nueva rutina';const exercises=$$('.chip.selected').map(b=>b.dataset.rchoice);if(!exercises.length){toast('Selecciona al menos un ejercicio');return;}state.routines.push({id:uid('r'),name,exercises});save();closeModal();render();};
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
