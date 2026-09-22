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
  exercisePrefs:{},
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
    return {...structuredClone(seed), ...parsed, settings:{...seed.settings,...(parsed.settings||{})}, exercisePrefs:{...(parsed.exercisePrefs||{})}};
  }catch{ return structuredClone(seed); }
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid(p='id'){ return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function isoDay(d=new Date()){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function prettyDate(ts){ return new Intl.DateTimeFormat('es-ES',{weekday:'short',day:'numeric',month:'short'}).format(new Date(ts)); }
function mins(ms){ return Math.max(1,Math.round(ms/60000)); }
function fmtTime(ms){ const s=Math.max(0,Math.floor(ms/1000)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function fmtRest(s){ s=Math.max(0,s); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function isWorkingSet(s){ return (s?.type||'normal')!=='warmup'; }
function volume(w){ return w.exercises.flatMap(e=>e.sets).filter(s=>s.done&&isWorkingSet(s)).reduce((a,s)=>a+(Number(s.weight)||0)*(Number(s.reps)||0),0); }
function completedSets(w){ return w.exercises.flatMap(e=>e.sets).filter(s=>s.done).length; }
function workingSetsCount(w){ return w.exercises.flatMap(e=>e.sets).filter(s=>s.done&&isWorkingSet(s)).length; }
function warmupSetsCount(w){ return w.exercises.flatMap(e=>e.sets).filter(s=>s.done&&!isWorkingSet(s)).length; }
function exerciseDone(e){ return e.sets.length>0 && e.sets.every(s=>s.done); }
function groupForExercise(name){ return exerciseCatalog.find(g=>g.exercises.includes(name))?.group || 'Otro'; }
function exercisePref(name){
  return {repMin:8,repMax:12,increment:2.5,note:'',...(state.exercisePrefs?.[name]||{})};
}
function setTypeLabel(type){ return type==='warmup'?'Calent.':type==='top'?'Top':'Trabajo'; }
function setTypeShort(type){ return type==='warmup'?'W':type==='top'?'T':'S'; }
function normalizeSet(s={}){
  return {weight:s.weight??'',reps:s.reps??'',done:!!s.done,type:s.type||'normal',rir:s.rir??null};
}

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

function performanceScore(set){
  const w=Number(set?.weight)||0, r=Number(set?.reps)||0;
  if(!r) return 0;
  return w>0 ? w*(1+r/30) : r;
}
function compareToPrevious(name,setIndex,set){
  const prev=lastExerciseSets(name)?.[setIndex];
  const hasCurrent=(Number(set?.reps)||0)>0;
  if(!prev || !hasCurrent) return {state:'none',label:'',detail:''};
  const a=performanceScore(set), b=performanceScore(prev);
  if(!b) return {state:'none',label:'',detail:''};
  const delta=(a-b)/b;
  const currentText=`${Number(set.weight)||0}×${Number(set.reps)||0}`;
  const prevText=`${Number(prev.weight)||0}×${Number(prev.reps)||0}`;
  if(Math.abs(delta)<0.005) return {state:'same',label:'Igual',detail:`${currentText} = ${prevText}`};
  if(delta>0) return {state:'up',label:'Mejora',detail:`${currentText} vs ${prevText}`};
  return {state:'down',label:'Por debajo',detail:`${currentText} vs ${prevText}`};
}
function progressionTarget(name){
  const sets=(lastExerciseSets(name)||[]).filter(isWorkingSet); if(!sets.length) return null;
  const pref=exercisePref(name), weighted=sets.some(s=>(Number(s.weight)||0)>0);
  if(weighted){
    const maxWeight=Math.max(...sets.map(s=>Number(s.weight)||0));
    const atWeight=sets.filter(s=>(Number(s.weight)||0)===maxWeight);
    const bestReps=Math.max(...atWeight.map(s=>Number(s.reps)||0));
    if(bestReps>=pref.repMax){
      const next=Math.round((maxWeight+Number(pref.increment||2.5))*100)/100;
      return {weighted:true,weight:next,reps:pref.repMin,text:`${next} kg × ${pref.repMin}`,note:`Rango ${pref.repMin}–${pref.repMax}: ya alcanzaste ${bestReps}, toca probar más peso`};
    }
    const nextReps=Math.min(pref.repMax,bestReps+1);
    return {weighted:true,weight:maxWeight,reps:nextReps,text:`${maxWeight} kg × ${nextReps}`,note:`Rango ${pref.repMin}–${pref.repMax}: suma una repetición manteniendo el peso`};
  }
  const bestReps=Math.max(...sets.map(s=>Number(s.reps)||0));
  const nextReps=Math.min(pref.repMax,bestReps+1);
  return {weighted:false,reps:nextReps,text:`${nextReps} reps`,note:`Objetivo ${pref.repMin}–${pref.repMax} reps`};
}
function sessionComparisonStats(w=state.active){
  if(!w) return {up:0,same:0,down:0,compared:0};
  const out={up:0,same:0,down:0,compared:0};
  w.exercises.forEach(e=>e.sets.forEach((s,si)=>{
    if(!s.done) return;
    const c=compareToPrevious(e.name,si,s);
    if(c.state==='none') return;
    out[c.state]++; out.compared++;
  }));
  return out;
}
function trendMarkup(name,si,set){
  const c=compareToPrevious(name,si,set);
  if(c.state==='none') return '<span class="set-trend empty-trend" aria-hidden="true">·</span>';
  const icon=c.state==='up'?'↑':c.state==='same'?'=':'↓';
  return `<span class="set-trend ${c.state}" title="${escapeAttr(c.detail)}" aria-label="${escapeAttr(c.label)}">${icon}</span>`;
}

function exerciseHistory(name){
  return state.workouts.map(w=>{
    const e=w.exercises.find(x=>x.name===name); if(!e) return null;
    const sets=e.sets.filter(s=>s.done&&isWorkingSet(s)); if(!sets.length) return null;
    const weighted=sets.some(s=>(Number(s.weight)||0)>0);
    const maxWeight=Math.max(0,...sets.map(s=>Number(s.weight)||0));
    const repsAtMax=weighted
      ? Math.max(0,...sets.filter(s=>(Number(s.weight)||0)===maxWeight).map(s=>Number(s.reps)||0))
      : Math.max(0,...sets.map(s=>Number(s.reps)||0));
    return {workoutId:w.id,date:w.finishedAt,sets,maxWeight,maxReps:repsAtMax,volume:sets.reduce((a,s)=>a+(Number(s.weight)||0)*(Number(s.reps)||0),0),weighted};
  }).filter(Boolean);
}
function allLoggedExercises(){
  const names=[];
  state.workouts.forEach(w=>w.exercises.forEach(e=>{if(e.sets.some(s=>s.done)&&!names.includes(e.name))names.push(e.name);}));
  return names.sort((a,b)=>a.localeCompare(b,'es'));
}
function previousMaxWeight(name){
  const vals=exerciseHistory(name).flatMap(h=>h.sets.map(s=>Number(s.weight)||0));
  return vals.length?Math.max(...vals):0;
}
function isCurrentPR(e){
  const current=Math.max(0,...e.sets.filter(s=>s.done&&isWorkingSet(s)).map(s=>Number(s.weight)||0));
  return current>0 && current>previousMaxWeight(e.name);
}
function progressSeries(name){
  const h=exerciseHistory(name);
  const weighted=h.some(x=>x.weighted);
  return {weighted,points:h.map(x=>({date:x.date,value:weighted?x.maxWeight:x.maxReps,workoutId:x.workoutId}))};
}
function sparkline(points){
  if(!points.length) return '';
  const W=320,H=112,P=12,vals=points.map(p=>p.value);
  const min=Math.min(...vals),max=Math.max(...vals),range=Math.max(1,max-min);
  const coords=points.map((p,i)=>{
    const x=points.length===1?W/2:P+i*(W-P*2)/(points.length-1);
    const y=H-P-((p.value-min)/range)*(H-P*2);
    return {x,y,value:p.value};
  });
  return `<svg class="progress-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución del ejercicio"><polyline points="${coords.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${coords.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4"/>`).join('')}</svg>`;
}

function render(){
  clearInterval(elapsedInterval); elapsedInterval=null;
  const app=$('#app');
  if(state.active){ app.innerHTML=workoutView(); bindWorkout(); return; }
  app.innerHTML=`<main class="app-shell">${topbar()}${view==='home'?homeView():view==='routines'?routinesView():view==='progress'?progressView():settingsView()}</main>${nav()}`;
  bindCommon();
}
function topbar(){ return `<div class="topbar"><div class="brand">RE<span>P</span></div><span class="pill">local · privado</span></div>`; }
function nav(){
  const items=[['home','⌂','Inicio'],['routines','▦','Rutinas'],['progress','↗','Progreso'],['settings','⚙','Ajustes']];
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
function routineCard(r,manage=false){
  return `<div class="card routine-card"><div class="routine-icon">${r.name.toLowerCase().includes('pierna')?'🦵':'⚡'}</div><div class="routine-main"><h3>${escapeHtml(r.name)}</h3><div class="routine-meta">${r.exercises.length} ejercicios · ${r.exercises.slice(0,2).map(escapeHtml).join(', ')}${r.exercises.length>2?'…':''}</div></div><div class="routine-actions">${manage?`<button class="routine-more" data-routine-menu="${r.id}" aria-label="Opciones">•••</button>`:''}<button class="start-small" data-start="${r.id}">Empezar</button></div></div>`;
}
function routinesView(){return `
  <div class="card-row"><div><div class="eyebrow">Rutinas</div><h1 class="hero-title">Tus sesiones</h1></div><button class="icon-btn" id="new-routine">＋</button></div>
  <p class="subtle">Crea, edita o duplica tus rutinas y adapta el orden real de tu entrenamiento sobre la marcha.</p>
  ${state.routines.map(r=>routineCard(r,true)).join('')}
  <button class="primary mt12" id="free-workout">+ Entrenamiento libre</button>`;
}
function progressView(){
  const exercises=allLoggedExercises();
  let selected=state.settings.progressExercise;
  if(!selected || !exercises.includes(selected)) selected=exercises[0]||'';
  const series=selected?progressSeries(selected):{weighted:true,points:[]};
  const latest=series.points.at(-1),prev=series.points.at(-2);
  const diff=latest&&prev?latest.value-prev.value:null;
  const unit=series.weighted?'kg':'reps';
  const recent=[...state.workouts].reverse().slice(0,6);
  const days30=Date.now()-30*86400000;
  const last30=state.workouts.filter(w=>w.finishedAt>=days30);
  const totalVol=Math.round(last30.reduce((a,w)=>a+volume(w),0));
  return `<div class="eyebrow">Progreso</div><h1 class="hero-title">Lo que estás moviendo</h1>
    <p class="subtle">REP compara tus sesiones sin pedirte métricas extra.</p>
    <div class="grid-2">
      <div class="stat"><strong>${state.workouts.length}</strong><small>sesiones totales</small></div>
      <div class="stat"><strong>${totalVol.toLocaleString('es-ES')}</strong><small>kg de volumen · 30 días</small></div>
    </div>
    ${exercises.length?`<div class="card progress-card">
      <div class="form-group progress-select-wrap"><label>EJERCICIO</label><select class="form-input" id="progress-exercise">${exercises.map(x=>`<option value="${escapeAttr(x)}" ${x===selected?'selected':''}>${escapeHtml(x)}</option>`).join('')}</select></div>
      <div class="progress-head"><div><div class="eyebrow">${series.weighted?'Mejor peso':'Mejores repeticiones'}</div><strong>${latest?latest.value:'—'} ${latest?unit:''}</strong></div>${diff!==null?`<span class="trend ${diff>0?'up':diff<0?'down':'flat'}">${diff>0?'+':''}${diff} ${unit}</span>`:''}</div>
      ${sparkline(series.points.slice(-10))}
      <div class="chart-axis"><span>${series.points.length?prettyDate(series.points[Math.max(0,series.points.length-10)].date):''}</span><span>${latest?prettyDate(latest.date):''}</span></div>
      <div class="progress-history">${exerciseHistory(selected).slice(-4).reverse().map(h=>`<div><span>${prettyDate(h.date)}</span><strong>${h.weighted?`${h.maxWeight} kg × ${h.maxReps}`:`${h.maxReps} reps`}</strong></div>`).join('')}</div>
    </div>`:`<div class="empty">Cuando termines tu primer entrenamiento, aquí aparecerá la evolución de cada ejercicio.</div>`}
    <div class="section-title"><h2>Sesiones recientes</h2></div>
    ${recent.length?recent.map(w=>`<button class="card history-item history-button" data-workout-detail="${w.id}"><div class="datebox"><strong>${new Date(w.finishedAt).getDate()}</strong>${new Intl.DateTimeFormat('es-ES',{month:'short'}).format(new Date(w.finishedAt))}</div><div><h3>${escapeHtml(w.name)}</h3><div class="meta">${completedSets(w)} series · ${mins(w.finishedAt-w.startedAt)} min · ${Math.round(volume(w)).toLocaleString('es-ES')} kg</div></div><span>›</span></button>`).join(''):'<div class="empty">Todavía no hay sesiones guardadas.</div>'}`;
}
function settingsView(){return `
  <div class="eyebrow">Ajustes</div><h1 class="hero-title">A tu manera</h1>
  <div class="card">
    <div class="form-group"><label>OBJETIVO DE ENTRENAMIENTOS / SEMANA</label><input class="form-input" id="goal" type="number" min="1" max="7" value="${state.settings.weeklyGoal}"></div>
    <div class="form-group"><label>DESCANSO POR DEFECTO (SEGUNDOS)</label><input class="form-input" id="rest" type="number" min="15" max="600" step="15" value="${state.settings.restSeconds}"></div>
    <button class="primary" id="save-settings">Guardar ajustes</button>
  </div>
  <div class="card"><h3>Datos</h3><p class="subtle">Todo se guarda en este dispositivo. Puedes exportarlo y restaurarlo en otro móvil.</p><div class="data-actions"><button class="secondary" id="export">Exportar backup</button><button class="secondary" id="import">Importar backup</button><button class="secondary danger" id="reset">Borrar todo</button></div><input id="import-file" type="file" accept="application/json,.json" hidden></div>`;}

function startRoutine(id){
  const r=state.routines.find(x=>x.id===id);
  const ex = r ? r.exercises : [];
  state.active={id:uid('w'),name:r?.name||'Entrenamiento libre',startedAt:Date.now(),exercises:ex.map(name=>({id:uid('e'),name,sets:defaultSets(name)}))};
  save(); render();
}
function defaultSets(name){
  const last=lastExerciseSets(name);
  if(last?.length) return last.map(s=>({weight:s.weight,reps:s.reps,done:false,type:s.type||'normal',rir:null}));
  return [1,2,3].map(()=>({weight:'',reps:'',done:false,type:'normal',rir:null}));
}
function workoutView(){
  const w=state.active, stats=sessionComparisonStats(w);
  return `<main class="app-shell">
    <div class="workout-head"><div class="workout-title"><button class="icon-btn" id="cancel-workout">×</button><h1>${escapeHtml(w.name)}</h1><span class="timer" id="elapsed">00:00</span><button class="finish-btn" id="finish-workout">Terminar</button></div>
      ${stats.compared?`<div class="session-compare"><span>vs última sesión</span><b class="cmp-up">↑ ${stats.up}</b><b class="cmp-same">= ${stats.same}</b><b class="cmp-down">↓ ${stats.down}</b></div>`:''}
    </div>
    ${w.exercises.length?w.exercises.map((e,ei)=>exerciseBlock(e,ei)).join(''):`<div class="empty">Añade tu primer ejercicio.</div>`}
    <button class="primary mt12" id="add-exercise">+ Añadir ejercicio</button>
  </main>${restUntil?restBar():''}`;
}
function exerciseBlock(e,ei){
  const complete=exerciseDone(e), target=progressionTarget(e.name), pref=exercisePref(e.name);
  return `<section class="exercise ${complete?'exercise-complete':''}"><div class="exercise-head"><div class="card-row"><div><div class="exercise-title-row"><h3>${escapeHtml(e.name)}</h3>${complete?'<span class="done-badge">Completado</span>':''}${isCurrentPR(e)?'<span class="pr-badge">PR</span>':''}</div><div class="last">${escapeHtml(groupForExercise(e.name))} · ${pref.repMin}–${pref.repMax} reps · Última vez: ${escapeHtml(bestSetText(e.name))}</div></div><div class="exercise-tools"><button class="mini-icon" data-ex-settings="${ei}" title="Objetivo y nota">⚙</button><button class="mini-icon" data-move-up="${ei}" ${ei===0?'disabled':''}>↑</button><button class="mini-icon" data-move-down="${ei}" ${ei===state.active.exercises.length-1?'disabled':''}>↓</button><button class="mini-icon danger-icon" data-remove-ex="${ei}">×</button></div></div>
    ${pref.note?`<div class="machine-note">📝 ${escapeHtml(pref.note)}</div>`:''}
    ${target?`<div class="progression-target"><span>🎯 Próximo paso</span><strong>${escapeHtml(target.text)}</strong><small>${escapeHtml(target.note)}</small></div>`:''}</div>
    <div class="set-head-v5"><span>Serie</span><span>kg</span><span>reps</span><span>✓</span></div>
    <div class="sets-v5">${e.sets.map((raw,si)=>{const s=normalizeSet(raw);return `<div class="set-card ${s.done?'set-done':''} ${s.type==='warmup'?'warmup-set':''}">
      <div class="set-main-v5"><div class="set-index-v5"><b>${si+1}</b><span data-set-trend="${ei}:${si}">${trendMarkup(e.name,si,s)}</span></div><input class="set-input" inputmode="decimal" type="number" step="0.5" placeholder="kg" value="${s.weight}" data-weight="${ei}:${si}"><input class="set-input" inputmode="numeric" type="number" step="1" placeholder="reps" value="${s.reps}" data-reps="${ei}:${si}"><button class="check ${s.done?'done':''}" data-done="${ei}:${si}">${s.done?'✓':'○'}</button></div>
      <div class="set-meta-v5"><button class="set-type type-${s.type}" data-type="${ei}:${si}"><b>${setTypeShort(s.type)}</b> ${setTypeLabel(s.type)}</button><button class="rir-chip ${s.rir!==null?'has-rir':''}" data-rir="${ei}:${si}">RIR ${s.rir===null?'—':s.rir}</button><button class="set-delete-v5" data-delset="${ei}:${si}">Eliminar</button></div>
    </div>`}).join('')}</div>
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
  $$('[data-routine-menu]').forEach(b=>b.onclick=()=>openRoutineActions(b.dataset.routineMenu));
  $('#progress-exercise')?.addEventListener('change',e=>{state.settings.progressExercise=e.target.value;save();render();});
  $$('[data-workout-detail]').forEach(b=>b.onclick=()=>openWorkoutDetail(b.dataset.workoutDetail));
  $('#free-workout')?.addEventListener('click',()=>startRoutine(null));
  $('#save-settings')?.addEventListener('click',()=>{state.settings.weeklyGoal=clamp(+$('#goal').value,1,7);state.settings.restSeconds=clamp(+$('#rest').value,15,600);save();toast('Ajustes guardados');render();});
  $('#export')?.addEventListener('click',exportData);
  $('#import')?.addEventListener('click',()=>$('#import-file')?.click());
  $('#import-file')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importData(file);});
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
  $$('[data-addset]').forEach(b=>b.onclick=()=>{const e=state.active.exercises[+b.dataset.addset];const prev=normalizeSet(e.sets.at(-1)||{});e.sets.push({weight:prev.weight||'',reps:prev.reps||'',done:false,type:prev.type||'normal',rir:null});save();render();});
  $$('[data-delset]').forEach(b=>b.onclick=()=>deleteSet(b.dataset.delset));
  $$('[data-type]').forEach(b=>b.onclick=()=>cycleSetType(b.dataset.type));
  $$('[data-rir]').forEach(b=>b.onclick=()=>cycleRir(b.dataset.rir));
  $$('[data-prefill]').forEach(b=>b.onclick=()=>{const e=state.active.exercises[+b.dataset.prefill];const last=lastExerciseSets(e.name);if(last?.length)e.sets=last.map(s=>({weight:s.weight,reps:s.reps,done:false,type:s.type||'normal',rir:null}));else toast('Todavía no hay una sesión anterior');save();render();});
  $$('[data-ex-settings]').forEach(b=>b.onclick=()=>openExerciseSettings(+b.dataset.exSettings));
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
function updateSet(key,field,value){
  const [ei,si]=key.split(':').map(Number);
  const e=state.active.exercises[ei], s=e.sets[si];
  s[field]=value; save();
  const host=document.querySelector(`[data-set-trend="${key}"]`);
  if(host) host.innerHTML=trendMarkup(e.name,si,s);
}

function cycleSetType(key){
  const [ei,si]=key.split(':').map(Number), s=state.active.exercises[ei].sets[si];
  const order=['normal','top','warmup']; const cur=s.type||'normal';
  s.type=order[(order.indexOf(cur)+1)%order.length]; save(); render();
}
function cycleRir(key){
  const [ei,si]=key.split(':').map(Number), s=state.active.exercises[ei].sets[si];
  const order=[null,4,3,2,1,0], idx=order.indexOf(s.rir??null);
  s.rir=order[(idx+1)%order.length]; save(); render();
}
function avgRir(w){
  const vals=w.exercises.flatMap(e=>e.sets).filter(s=>s.done&&isWorkingSet(s)&&s.rir!==null&&s.rir!==undefined).map(s=>Number(s.rir));
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
}
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
  const w=state.active, done=completedSets(w);
  if(!done && !confirm('No has marcado ninguna serie como hecha. ¿Terminar igualmente?')) return;
  const prs=w.exercises.filter(isCurrentPR).length, cmp=sessionComparisonStats(w), rir=avgRir(w);
  const best=w.exercises.map(e=>({name:e.name,up:e.sets.filter((s,si)=>s.done&&compareToPrevious(e.name,si,s).state==='up').length})).sort((a,b)=>b.up-a.up)[0];
  modal(`<div class="finish-summary"><div class="finish-hero"><div class="finish-check">✓</div><div><div class="eyebrow">Entrenamiento listo</div><h2>${escapeHtml(w.name)}</h2></div></div>
    <div class="summary-grid"><div><strong>${mins(Date.now()-w.startedAt)}</strong><span>min</span></div><div><strong>${workingSetsCount(w)}</strong><span>series trabajo</span></div><div><strong>${Math.round(volume(w)).toLocaleString('es-ES')}</strong><span>kg volumen</span></div><div><strong>${rir===null?'—':rir.toFixed(1)}</strong><span>RIR medio</span></div></div>
    <div class="summary-highlights">${cmp.up?`<div><span>↑</span><p><b>${cmp.up} series mejoradas</b><small>frente a la sesión anterior</small></p></div>`:''}${prs?`<div><span>🏆</span><p><b>${prs} PR${prs>1?'s':''}</b><small>nuevo máximo de peso</small></p></div>`:''}${best?.up?`<div><span>⚡</span><p><b>${escapeHtml(best.name)}</b><small>tu ejercicio con más mejoras hoy</small></p></div>`:''}${warmupSetsCount(w)?`<div><span>W</span><p><b>${warmupSetsCount(w)} series de calentamiento</b><small>no incluidas en volumen ni PR</small></p></div>`:''}</div>
    <div class="modal-actions"><button class="secondary" data-close>Seguir editando</button><button class="primary" id="confirm-finish">Guardar sesión</button></div></div>`);
  $('#confirm-finish').onclick=()=>commitWorkout();
}
function commitWorkout(){
  const w=state.active; if(!w)return;
  const prs=w.exercises.filter(isCurrentPR).length, cmp=sessionComparisonStats(w);
  w.finishedAt=Date.now(); state.workouts.push(w); state.active=null; restUntil=null; stopRest(); clearInterval(elapsedInterval); elapsedInterval=null; save(); closeModal(); view='home'; render();
  toast(`Guardado${cmp.up?` · ↑ ${cmp.up} mejoradas`:''}${prs?` · 🏆 ${prs} PR${prs>1?'s':''}`:''}`);
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

function openExerciseSettings(ei){
  const e=state.active.exercises[ei], pref=exercisePref(e.name);
  modal(`<div class="eyebrow">${escapeHtml(groupForExercise(e.name))}</div><h2>${escapeHtml(e.name)}</h2>
    <div class="range-grid"><div class="form-group"><label>REPS MÍN.</label><input class="form-input" id="rep-min" type="number" min="1" max="50" value="${pref.repMin}"></div><div class="form-group"><label>REPS MÁX.</label><input class="form-input" id="rep-max" type="number" min="1" max="100" value="${pref.repMax}"></div><div class="form-group"><label>SUBIDA DE PESO</label><input class="form-input" id="weight-inc" type="number" min="0.25" step="0.25" value="${pref.increment}"></div></div>
    <div class="form-group"><label>NOTA / AJUSTE DE MÁQUINA</label><textarea class="form-input exercise-note-input" id="exercise-note" maxlength="180" placeholder="Ej. asiento 4 · agarre neutro · polea altura 7">${escapeHtml(pref.note||'')}</textarea></div>
    <p class="subtle">Cuando alcances el máximo del rango, REP propondrá subir este incremento y volver al mínimo.</p>
    <div class="modal-actions"><button class="secondary" data-close>Cancelar</button><button class="primary" id="save-exercise-settings">Guardar</button></div>`);
  $('#save-exercise-settings').onclick=()=>{
    let min=clamp(+$('#rep-min').value,1,50), max=clamp(+$('#rep-max').value,1,100); if(max<min)[min,max]=[max,min];
    const increment=Math.max(.25,Number($('#weight-inc').value)||2.5), note=$('#exercise-note').value.trim();
    state.exercisePrefs[e.name]={repMin:min,repMax:max,increment,note}; save();closeModal();render();toast('Objetivo actualizado');
  };
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

function openRoutineActions(id){
  const r=state.routines.find(x=>x.id===id); if(!r)return;
  modal(`<h2>${escapeHtml(r.name)}</h2><div class="action-stack"><button class="secondary" id="edit-routine">Editar rutina</button><button class="secondary" id="duplicate-routine">Duplicar rutina</button><button class="secondary danger" id="delete-routine">Eliminar rutina</button></div><div class="modal-actions"><button class="secondary" data-close>Cerrar</button></div>`);
  $('#edit-routine').onclick=()=>{closeModal();openRoutineModal(id);};
  $('#duplicate-routine').onclick=()=>{state.routines.push({id:uid('r'),name:`${r.name} · copia`,exercises:[...r.exercises]});save();closeModal();render();toast('Rutina duplicada');};
  $('#delete-routine').onclick=()=>{if(confirm(`¿Eliminar "${r.name}"?`)){state.routines=state.routines.filter(x=>x.id!==id);save();closeModal();render();toast('Rutina eliminada');}};
}
function openRoutineModal(editId=null){
  const existing=editId?state.routines.find(x=>x.id===editId):null;
  let activeGroup='Todos'; let selected=[...(existing?.exercises||[])];
  modal(`<div class="modal-sticky"><h2>${existing?'Editar rutina':'Nueva rutina'}</h2><div class="form-group"><label>NOMBRE</label><input class="form-input" id="routine-name" placeholder="Ej. Torso rápido" value="${escapeAttr(existing?.name||'')}"></div><div class="selected-summary"><span id="selected-count">${selected.length} ejercicios</span><small>Se mantienen en el orden en que los selecciones.</small></div><input class="form-input" id="routine-search" placeholder="Buscar ejercicio…">${groupFilters(activeGroup)}</div><div id="routine-catalog">${routineCatalogHtml(activeGroup,'',new Set(selected))}</div><div class="modal-actions"><button class="secondary" data-close>Cancelar</button><button class="primary" id="save-routine">${existing?'Guardar cambios':'Guardar'}</button></div>`);
  const updateCount=()=>{const e=$('#selected-count');if(e)e.textContent=`${selected.length} ejercicios`;};
  const bindChoices=()=>$$('[data-rchoice]').forEach(b=>b.onclick=()=>{
    const n=b.dataset.rchoice;
    if(selected.includes(n)) selected=selected.filter(x=>x!==n); else selected.push(n);
    b.classList.toggle('selected',selected.includes(n)); updateCount();
  });
  const redraw=()=>{
    $('#routine-catalog').innerHTML=routineCatalogHtml(activeGroup,$('#routine-search').value,new Set(selected));
    bindChoices(); $$('.group-chip').forEach(b=>b.classList.toggle('selected',b.dataset.group===activeGroup));
  };
  bindChoices(); $('#routine-search').oninput=redraw;
  $$('.group-chip').forEach(b=>b.onclick=()=>{activeGroup=b.dataset.group;redraw();});
  $('#save-routine').onclick=()=>{
    const name=$('#routine-name').value.trim()||'Nueva rutina';
    if(!selected.length){toast('Selecciona al menos un ejercicio');return;}
    if(existing){existing.name=name;existing.exercises=[...selected];}
    else state.routines.push({id:uid('r'),name,exercises:[...selected]});
    save();closeModal();render();toast(existing?'Rutina actualizada':'Rutina creada');
  };
}
function openWorkoutDetail(id){
  const w=state.workouts.find(x=>x.id===id); if(!w)return;
  modal(`<div class="workout-detail-head"><div><div class="eyebrow">${prettyDate(w.finishedAt)}</div><h2>${escapeHtml(w.name)}</h2></div><span class="pill">${mins(w.finishedAt-w.startedAt)} min</span></div>
    <div class="detail-stats"><span><strong>${completedSets(w)}</strong>series</span><span><strong>${Math.round(volume(w)).toLocaleString('es-ES')}</strong>kg volumen</span></div>
    <div class="detail-exercises">${w.exercises.filter(e=>e.sets.some(s=>s.done)).map(e=>`<div class="detail-exercise"><div><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(groupForExercise(e.name))}</small></div><span>${e.sets.filter(s=>s.done).map(s=>`${s.type==='warmup'?'W ':s.type==='top'?'T ':''}${s.weight||0}×${s.reps||0}${s.rir!==null&&s.rir!==undefined?` · RIR ${s.rir}`:''}`).join(' · ')}</span></div>`).join('')}</div>
    <div class="modal-actions"><button class="secondary danger" id="delete-workout">Eliminar</button><button class="secondary" data-close>Cerrar</button></div>`);
  $('#delete-workout').onclick=()=>{if(confirm('¿Eliminar esta sesión del historial?')){state.workouts=state.workouts.filter(x=>x.id!==id);save();closeModal();render();toast('Sesión eliminada');}};
}
function modal(html){const w=document.createElement('div');w.className='modal-wrap';w.id='modal-wrap';w.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(w);w.onclick=e=>{if(e.target===w||e.target.matches('[data-close]'))closeModal();};}
function closeModal(){ $('#modal-wrap')?.remove(); }
function toast(msg){clearTimeout(toastTimer);$('.toast')?.remove();const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);toastTimer=setTimeout(()=>t.remove(),2200);}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`rep-backup-${isoDay()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function importData(file){
  try{
    const parsed=JSON.parse(await file.text());
    if(!parsed || !Array.isArray(parsed.routines) || !Array.isArray(parsed.workouts)) throw new Error('Formato no válido');
    state={...structuredClone(seed),...parsed,settings:{...seed.settings,...(parsed.settings||{})},exercisePrefs:{...(parsed.exercisePrefs||{})},active:null};
    save();toast('Backup restaurado');render();
  }catch{toast('No se pudo importar ese backup');}
}
function clamp(n,a,b){return Math.min(b,Math.max(a,Number.isFinite(n)?n:a));}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function escapeAttr(s=''){return escapeHtml(s);}

window.addEventListener('beforeunload',save);
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
render();
