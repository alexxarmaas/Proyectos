const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const STORAGE_KEY = 'rep-gym-mvp-v1';
const APP_VERSION = '1.1.0-beta.1';
const APP_NAME = 'REP';
let deferredInstallPrompt = null;
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
  settings:{weeklyGoal:4, restSeconds:90, onboardingComplete:false},
  routines:[
    {id:'r-back', name:'Espalda + bíceps', exercises:['Jalón al pecho','Remo sentado en polea','Remo en máquina','Pullover en polea','Curl de bíceps en polea','Curl martillo','Elevaciones laterales en máquina']},
    {id:'r-push', name:'Pecho + tríceps', exercises:['Press de pecho en máquina','Press inclinado con mancuernas','Aperturas en máquina (pec deck)','Extensión de tríceps en polea con cuerda','Press de hombro en máquina']},
    {id:'r-leg', name:'Pierna', exercises:['Prensa de piernas','Sentadilla','Extensión de cuádriceps','Curl femoral sentado','Hip thrust en máquina','Gemelos en prensa','Abductores en máquina']}
  ],
  workouts:[],
  exercisePrefs:{},
  meta:{schemaVersion:2,updatedAt:0,lastSyncedAt:0},
  active:null
};

let state = load();
let view = 'home';
let restInterval = null;
let restUntil = null;
let toastTimer = null;
let elapsedInterval = null;


const SHADOW_DB='rep-gym-v1';
const SHADOW_STORE='snapshots';
let syncTimer=null;
let cloudReady=false;
let suppressCloud=false;
let historyQuery='';
let historyRange='all';

function migrateState(input){
  const parsed=input&&typeof input==='object'?structuredClone(input):{};
  const next={...structuredClone(seed),...parsed};
  next.settings={...seed.settings,...(parsed.settings||{})};
  if(parsed.settings?.onboardingComplete===undefined && parsed.meta?.schemaVersion) next.settings.onboardingComplete=true;
  next.exercisePrefs={...(parsed.exercisePrefs||{})};
  next.meta={...seed.meta,...(parsed.meta||{})};
  next.routines=Array.isArray(parsed.routines)?parsed.routines:structuredClone(seed.routines);
  next.workouts=Array.isArray(parsed.workouts)?parsed.workouts:[];
  next.workouts=next.workouts.map(w=>({...w,exercises:Array.isArray(w.exercises)?w.exercises.map(e=>({...e,sets:Array.isArray(e.sets)?e.sets.map(normalizeSet):[]})):[]}));
  if(next.active?.exercises) next.active={...next.active,exercises:next.active.exercises.map(e=>({...e,sets:(e.sets||[]).map(normalizeSet)}))};
  next.meta.schemaVersion=2;
  return next;
}
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    return raw?migrateState(JSON.parse(raw)):structuredClone(seed);
  }catch{return structuredClone(seed);}
}
function openShadowDb(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){resolve(null);return;}
    const r=indexedDB.open(SHADOW_DB,1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(SHADOW_STORE))r.result.createObjectStore(SHADOW_STORE);};
    r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
  });
}
async function persistShadow(){
  try{
    const db=await openShadowDb(); if(!db)return;
    const tx=db.transaction(SHADOW_STORE,'readwrite');
    tx.objectStore(SHADOW_STORE).put(structuredClone(state),'latest');
  }catch{}
}
async function readShadow(){
  try{
    const db=await openShadowDb(); if(!db)return null;
    return await new Promise((resolve)=>{
      const tx=db.transaction(SHADOW_STORE,'readonly');
      const r=tx.objectStore(SHADOW_STORE).get('latest');
      r.onsuccess=()=>resolve(r.result||null); r.onerror=()=>resolve(null);
    });
  }catch{return null;}
}
function save(touch=true){
  if(touch){
    state.meta={...seed.meta,...(state.meta||{}),schemaVersion:2,updatedAt:Date.now()};
  }
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}
  persistShadow();
  if(touch&&cloudReady&&!suppressCloud) scheduleCloudSync();
}
function scheduleCloudSync(){
  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>syncCloud(false),1400);
}
async function syncCloud(showFeedback=true){
  if(!window.REPCloud?.isSignedIn?.()) return;
  try{
    const result=await window.REPCloud.syncState(state);
    if(result?.direction==='pull'&&result.state){
      suppressCloud=true;
      state=migrateState(result.state);
      state.meta.lastSyncedAt=Date.now();
      save(false);
      suppressCloud=false;
      render();
      if(showFeedback)toast('Datos sincronizados desde la nube');
      return;
    }
    state.meta.lastSyncedAt=Date.now(); save(false);
    if(showFeedback)toast('Sincronización completada');
  }catch(e){
    if(showFeedback)toast('No se pudo sincronizar ahora');
  }
}

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
  const last=[...state.workouts].reverse().find(w=>w.exercises?.some(e=>e.name===name&&e.sets?.some(s=>s.done)));
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


function icon(name,size=20){
  const paths={
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-7h6v7"/>',
    routines:'<path d="M6 3v18M18 3v18M3 8h6M15 8h6M3 16h6M15 16h6"/>',
    progress:'<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="m3 7 6-4 6 6 6-5"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05-2.78 2.78-.05-.05A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1.1 1.65V21h-3.8v-.05A1.8 1.8 0 0 0 9 19.4a1.8 1.8 0 0 0-1.98.36l-.05.05-2.78-2.78.05-.05A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.1H3v-3.8h.05A1.8 1.8 0 0 0 4.6 9a1.8 1.8 0 0 0-.36-1.98l-.05-.05 2.78-2.78.05.05A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1.1-1.65V3h3.8v.05A1.8 1.8 0 0 0 15 4.6a1.8 1.8 0 0 0 1.98-.36l.05-.05 2.78 2.78-.05.05A1.8 1.8 0 0 0 19.4 9a1.8 1.8 0 0 0 1.65 1.1H21v3.8h-.05A1.8 1.8 0 0 0 19.4 15Z"/>',
    play:'<path d="m9 7 8 5-8 5V7Z"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    flame:'<path d="M12 22c4 0 7-3 7-7 0-5-4-7-3-12-4 2-7 6-7 10-1-1-2-3-2-5-2 2-3 4-3 7 0 4 4 7 8 7Z"/><path d="M10 18c0-2 2-3 2-5 2 1 3 3 3 5a2.5 2.5 0 0 1-5 0Z"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M18 6l3-3M18 3h3v3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
  };
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`;
}
function routineVisual(r){
  const n=r.name.toLowerCase();
  if(n.includes('pierna'))return {glyph:'L',className:'legs'};
  if(n.includes('pecho')||n.includes('tríceps')||n.includes('triceps'))return {glyph:'P',className:'push'};
  if(n.includes('espalda')||n.includes('bíceps')||n.includes('biceps'))return {glyph:'B',className:'pull'};
  return {glyph:r.name.trim().slice(0,1).toUpperCase()||'R',className:'default'};
}

function render(){
  clearInterval(elapsedInterval); elapsedInterval=null;
  const app=$('#app');
  if(state.active){ app.innerHTML=workoutView(); bindWorkout(); return; }
  app.innerHTML=`<main class="app-shell">${topbar()}${view==='home'?homeView():view==='routines'?routinesView():view==='progress'?progressView():settingsView()}</main>${nav()}`;
  bindCommon();
}
function topbar(){
  const cloud=window.REPCloud;
  const online=cloud?.isSignedIn?.();
  const label=online?'Cloud activo':cloud?.isConfigured?.()?'Cloud disponible':'Solo en este dispositivo';
  return `<header class="topbar">
    <div class="brand-lockup"><div class="brand-mark">R</div><div><div class="brand-row"><div class="brand-word">REP</div><span class="beta-badge">BETA</span></div><div class="brand-caption">TRAINING LOG</div></div></div>
    <div class="sync-chip ${online?'online':''}"><span></span>${label}</div>
  </header>`;
}
function nav(){
  const items=[['home','home','Inicio'],['routines','routines','Rutinas'],['progress','progress','Progreso'],['settings','settings','Ajustes']];
  return `<nav class="nav-shell"><div class="nav">${items.map(([id,ic,t])=>`<button data-view="${id}" class="${view===id?'active':''}">${icon(ic,21)}<span>${t}</span></button>`).join('')}</div></nav>`;
}
function homeView(){
  const wk=workoutsThisWeek().length, goal=state.settings.weeklyGoal;
  const days=['L','M','X','J','V','S','D'], today=isoDay(), streak=activeWeekStreak();
  const last=state.workouts.at(-1), featured=state.routines[0], pct=Math.min(100,Math.round(wk/goal*100));
  return `
    <section class="home-hero">
      <div class="hero-kicker">TU SEMANA · ${wk}/${goal}</div>
      <h1>Haz que cada<br><span>serie cuente.</span></h1>
      <p>Entra, supera tu última sesión y sal. REP se encarga del resto.</p>
      ${featured?`<button class="hero-cta" data-start="${featured.id}"><span class="hero-play">${icon('play',19)}</span><span><b>Empezar ahora</b><small>${escapeHtml(featured.name)} · ${featured.exercises.length} ejercicios</small></span><span class="hero-arrow">${icon('chevron',18)}</span></button>`:''}
      <div class="hero-metrics">
        <div><span class="metric-icon">${icon('flame',18)}</span><b>${streak}</b><small>semanas activo</small></div>
        <div><span class="metric-icon">${icon('target',18)}</span><b>${pct}%</b><small>objetivo semanal</small></div>
      </div>
    </section>

    <section class="week-card">
      <div class="week-card-head"><div><span>ESTA SEMANA</span><strong>${wk>=goal?'Objetivo completado':'Sigue construyendo'}</strong></div><b>${wk}/${goal}</b></div>
      <div class="week-v2">${weekDays().map((d,i)=>`<div class="${hasWorkoutOn(d)?'done':''} ${isoDay(d)===today?'today':''}"><span>${days[i]}</span><b>${hasWorkoutOn(d)?'✓':new Date(d).getDate()}</b></div>`).join('')}</div>
      <div class="progress-line"><span style="width:${pct}%"></span></div>
    </section>

    ${todayGoalsHtml()}

    <div class="section-title premium-title"><div><span>RUTINAS</span><h2>Listo para entrenar</h2></div><button class="link-btn" data-view="routines">Ver todas ${icon('chevron',14)}</button></div>
    <div class="routine-stack">${state.routines.slice(0,3).map(r=>routineCard(r)).join('')}</div>

    ${last?`<div class="section-title premium-title"><div><span>ÚLTIMA ACTIVIDAD</span><h2>Tu sesión anterior</h2></div></div>
      <button class="last-session-card" data-view="progress"><div class="last-session-date"><b>${new Date(last.finishedAt).getDate()}</b><span>${new Intl.DateTimeFormat('es-ES',{month:'short'}).format(new Date(last.finishedAt))}</span></div><div class="last-session-main"><b>${escapeHtml(last.name)}</b><span>${workingSetsCount(last)} series · ${mins(last.finishedAt-last.startedAt)} min · ${Math.round(volume(last)).toLocaleString('es-ES')} kg</span></div><div class="last-session-arrow">${icon('chevron',18)}</div></button>`:''}
  `;
}
function todayGoalsHtml(){
  const candidates=[];
  state.routines.flatMap(r=>r.exercises).forEach(name=>{
    if(candidates.some(x=>x.name===name))return;
    const t=progressionTarget(name); if(t)candidates.push({name,target:t.text});
  });
  if(!candidates.length)return '';
  return `<div class="section-title premium-title"><div><span>OBJETIVOS</span><h2>Hoy toca superar</h2></div></div>
    <div class="goals-grid">${candidates.slice(0,3).map((g,i)=>`<div class="goal-tile"><div class="goal-num">0${i+1}</div><div><b>${escapeHtml(g.name)}</b><span>${escapeHtml(g.target)}</span></div></div>`).join('')}</div>`;
}
function routineCard(r,manage=false){
  const v=routineVisual(r);
  return `<article class="routine-card-v2 ${v.className}">
    <div class="routine-glyph">${v.glyph}</div>
    <div class="routine-copy"><span>${r.exercises.length} EJERCICIOS</span><h3>${escapeHtml(r.name)}</h3><p>${r.exercises.slice(0,3).map(escapeHtml).join(' · ')}${r.exercises.length>3?'…':''}</p></div>
    <div class="routine-actions-v2">${manage?`<button class="routine-more" data-routine-menu="${r.id}" aria-label="Opciones">${icon('more',18)}</button>`:''}<button class="routine-start" data-start="${r.id}" aria-label="Empezar">${icon('play',18)}</button></div>
  </article>`;
}
function routinesView(){return `
  <header class="page-head"><div><span class="eyebrow">ENTRENAMIENTO</span><h1>Tus rutinas.</h1><p>Menos decisiones. Más series buenas.</p></div><button class="floating-add" id="new-routine">${icon('plus',22)}</button></header>
  <div class="routine-stack routines-page">${state.routines.map(r=>routineCard(r,true)).join('')}</div>
  <button class="free-workout-card" id="free-workout"><span class="free-icon">${icon('plus',22)}</span><span><b>Entrenamiento libre</b><small>Empieza desde cero y añade ejercicios sobre la marcha</small></span><span>${icon('chevron',18)}</span></button>`;
}
function filteredWorkouts(){
  let arr=[...state.workouts].reverse();
  if(historyRange!=='all'){
    const days=Number(historyRange), cutoff=Date.now()-days*86400000;
    arr=arr.filter(w=>w.finishedAt>=cutoff);
  }
  const q=historyQuery.trim().toLowerCase();
  if(q)arr=arr.filter(w=>w.name?.toLowerCase().includes(q)||w.exercises?.some(e=>e.name?.toLowerCase().includes(q)));
  return arr;
}
function progressView(){
  const exercises=allLoggedExercises();
  let selected=state.settings.progressExercise;
  if(!selected||!exercises.includes(selected))selected=exercises[0]||'';
  const series=selected?progressSeries(selected):{weighted:true,points:[]};
  const latest=series.points.at(-1),prev=series.points.at(-2);
  const diff=latest&&prev?latest.value-prev.value:null;
  const unit=series.weighted?'kg':'reps';
  const recent=filteredWorkouts();
  const days30=Date.now()-30*86400000;
  const last30=state.workouts.filter(w=>w.finishedAt>=days30);
  const totalVol=Math.round(last30.reduce((a,w)=>a+volume(w),0));
  const totalSets=last30.reduce((a,w)=>a+workingSetsCount(w),0);
  return `<div class="eyebrow">Progreso</div><h1 class="hero-title">Tu evolución</h1>
    <p class="subtle">Carga, sesiones y rendimiento sin convertir el entrenamiento en una hoja de cálculo.</p>
    <div class="stats-3">
      <div class="stat"><strong>${state.workouts.length}</strong><small>sesiones</small></div>
      <div class="stat"><strong>${totalVol.toLocaleString('es-ES')}</strong><small>kg · 30 días</small></div>
      <div class="stat"><strong>${totalSets}</strong><small>series · 30 días</small></div>
    </div>
    ${exercises.length?`<div class="card progress-card">
      <div class="form-group progress-select-wrap"><label>EJERCICIO</label><select class="form-input" id="progress-exercise">${exercises.map(x=>`<option value="${escapeAttr(x)}" ${x===selected?'selected':''}>${escapeHtml(x)}</option>`).join('')}</select></div>
      <div class="progress-head"><div><div class="eyebrow">${series.weighted?'Mejor peso':'Mejores repeticiones'}</div><strong>${latest?latest.value:'—'} ${latest?unit:''}</strong></div>${diff!==null?`<span class="trend ${diff>0?'up':diff<0?'down':'flat'}">${diff>0?'+':''}${diff} ${unit}</span>`:''}</div>
      ${sparkline(series.points.slice(-12))}
      <div class="chart-axis"><span>${series.points.length?prettyDate(series.points[Math.max(0,series.points.length-12)].date):''}</span><span>${latest?prettyDate(latest.date):''}</span></div>
      <div class="progress-history">${exerciseHistory(selected).slice(-5).reverse().map(h=>`<div><span>${prettyDate(h.date)}</span><strong>${h.weighted?`${h.maxWeight} kg × ${h.maxReps}`:`${h.maxReps} reps`}</strong></div>`).join('')}</div>
    </div>`:`<div class="empty">Termina una sesión y aquí aparecerá tu evolución.</div>`}
    <div class="section-title"><h2>Historial</h2><span class="subtle small">${recent.length} sesiones</span></div>
    <div class="history-filters"><input class="form-input" id="history-search" placeholder="Buscar rutina o ejercicio…" value="${escapeAttr(historyQuery)}"><select class="form-input" id="history-range"><option value="all" ${historyRange==='all'?'selected':''}>Todo</option><option value="30" ${historyRange==='30'?'selected':''}>30 días</option><option value="90" ${historyRange==='90'?'selected':''}>90 días</option><option value="365" ${historyRange==='365'?'selected':''}>1 año</option></select></div>
    ${recent.length?recent.map(w=>`<button class="card history-item history-button" data-workout-detail="${w.id}"><div class="datebox"><strong>${new Date(w.finishedAt).getDate()}</strong>${new Intl.DateTimeFormat('es-ES',{month:'short'}).format(new Date(w.finishedAt))}</div><div><h3>${escapeHtml(w.name)}</h3><div class="meta">${workingSetsCount(w)} trabajo · ${mins(w.finishedAt-w.startedAt)} min · ${Math.round(volume(w)).toLocaleString('es-ES')} kg</div></div><span>›</span></button>`).join(''):'<div class="empty">No hay sesiones que coincidan.</div>'}`;
}

function cloudSettingsHtml(){
  const cloud=window.REPCloud;
  if(!cloud?.isConfigured?.())return `<div class="card"><div class="card-row"><div><h3>Nube REP</h3><p class="subtle mb0">La app está preparada para cuenta y sincronización. Falta activar el proyecto cloud.</p></div><span class="pill">local</span></div></div>`;
  if(!cloud.isSignedIn())return `<div class="card"><h3>Cuenta REP</h3><p class="subtle">Sincroniza rutinas, historial y ajustes entre dispositivos.</p><div class="form-group"><label>EMAIL</label><input class="form-input" id="cloud-email" type="email" autocomplete="email"></div><div class="form-group"><label>CONTRASEÑA</label><input class="form-input" id="cloud-password" type="password" autocomplete="current-password"></div><div class="data-actions"><button class="primary" id="cloud-login">Entrar</button><button class="secondary" id="cloud-signup">Crear cuenta</button></div></div>`;
  const email=cloud.getSession()?.user?.email||'Cuenta conectada';
  return `<div class="card"><div class="card-row"><div><h3>${escapeHtml(email)}</h3><p class="subtle mb0">Tus datos pueden sincronizarse automáticamente.</p></div><span class="pill accent">cloud</span></div><div class="data-actions mt12"><button class="primary" id="cloud-sync">Sincronizar ahora</button><button class="secondary" id="cloud-logout">Cerrar sesión</button></div></div>`;
}
function settingsView(){return `
  <div class="eyebrow">Ajustes</div><h1 class="hero-title">A tu manera</h1>
  <div class="card">
    <div class="form-group"><label>OBJETIVO DE ENTRENAMIENTOS / SEMANA</label><input class="form-input" id="goal" type="number" min="1" max="7" value="${state.settings.weeklyGoal}"></div>
    <div class="form-group"><label>DESCANSO POR DEFECTO (SEGUNDOS)</label><input class="form-input" id="rest" type="number" min="15" max="600" step="15" value="${state.settings.restSeconds}"></div>
    <button class="primary" id="save-settings">Guardar ajustes</button>
  </div>
  ${cloudSettingsHtml()}
  <section class="beta-center">
    <div class="beta-center-head"><div><span>REP PRIVATE BETA</span><h3>Ayúdanos a pulirla.</h3><p>Instálala, úsala en el gym y mándanos cualquier cosa rara que veas.</p></div><div class="beta-version">${APP_VERSION}</div></div>
    <div class="beta-actions">
      <button id="beta-install"><span class="beta-action-icon">↓</span><span><b>${isStandalone()?'REP instalada':'Instalar REP'}</b><small>${isStandalone()?'Abierta como app':'Añadir a la pantalla de inicio'}</small></span></button>
      <button id="beta-share"><span class="beta-action-icon">↗</span><span><b>Compartir REP</b><small>Enviar el enlace a otro tester</small></span></button>
      <button id="beta-feedback"><span class="beta-action-icon">!</span><span><b>Enviar feedback</b><small>Bug, idea o detalle visual</small></span></button>
      <button id="beta-guide"><span class="beta-action-icon">?</span><span><b>Ver guía rápida</b><small>Cómo funciona en 30 segundos</small></span></button>
    </div>
  </section>
  <div class="card"><h3>Datos y seguridad</h3><p class="subtle">REP mantiene una copia local y otra de recuperación en el navegador. Puedes exportar un backup portable cuando quieras.</p><div class="data-actions"><button class="secondary" id="export">Exportar backup</button><button class="secondary" id="import">Importar backup</button><button class="secondary" id="diagnostics">Diagnóstico</button><button class="secondary danger" id="reset">Borrar todo</button></div><input id="import-file" type="file" accept="application/json,.json" hidden></div>
  <div class="version-line">REP ${APP_VERSION} · beta privada</div>`;
}
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
  return `<main class="app-shell workout-shell">
    <header class="workout-head-v2">
      <div class="workout-topline"><button class="workout-close" id="cancel-workout">×</button><div class="live-dot"><span></span> EN CURSO</div><button class="finish-btn" id="finish-workout">Terminar</button></div>
      <div class="workout-name-row"><div><span>ENTRENAMIENTO</span><h1>${escapeHtml(w.name)}</h1></div><div class="workout-clock">${icon('clock',17)}<strong id="elapsed">00:00</strong></div></div>
      ${stats.compared?`<div class="session-compare-v2"><span>VS ÚLTIMA SESIÓN</span><div><b class="cmp-up">↑ ${stats.up}</b><b class="cmp-same">= ${stats.same}</b><b class="cmp-down">↓ ${stats.down}</b></div></div>`:''}
    </header>
    <div class="exercise-list">${w.exercises.length?w.exercises.map((e,ei)=>exerciseBlock(e,ei)).join(''):`<div class="empty-state"><div>${icon('routines',28)}</div><b>Entrenamiento vacío</b><span>Añade un ejercicio para empezar.</span></div>`}</div>
    <button class="add-exercise-cta" id="add-exercise">${icon('plus',20)} Añadir ejercicio</button>
  </main>${restUntil?restBar():''}`;
}
function exerciseBlock(e,ei){
  const complete=exerciseDone(e), target=progressionTarget(e.name), pref=exercisePref(e.name);
  const doneCount=e.sets.filter(s=>s.done).length;
  return `<section class="exercise-v2 ${complete?'exercise-complete':''}">
    <div class="exercise-top">
      <div class="exercise-number">0${ei+1}</div>
      <div class="exercise-name-block"><span>${escapeHtml(groupForExercise(e.name))} · ${pref.repMin}–${pref.repMax} REPS</span><h3>${escapeHtml(e.name)}</h3><small>${doneCount}/${e.sets.length} series completadas</small></div>
      <div class="exercise-tools compact"><button data-ex-settings="${ei}" title="Ajustes">⚙</button><button data-replace-ex="${ei}" title="Sustituir">⇄</button><button class="danger-icon" data-remove-ex="${ei}" title="Quitar">×</button></div>
    </div>
    ${pref.note?`<div class="machine-note-v2"><span>NOTA</span>${escapeHtml(pref.note)}</div>`:''}
    ${target?`<div class="target-card"><div class="target-icon">${icon('target',18)}</div><div><span>OBJETIVO DE HOY</span><b>${escapeHtml(target.text)}</b><small>${escapeHtml(target.note)}</small></div></div>`:''}
    <div class="set-table">
      <div class="set-head-v2"><span>SERIE</span><span>PESO</span><span>REPS</span><span></span></div>
      ${e.sets.map((raw,si)=>{const s=normalizeSet(raw);return `<div class="set-line ${s.done?'done':''} ${s.type==='warmup'?'warmup':''}">
        <div class="set-id"><b>${si+1}</b><span data-set-trend="${ei}:${si}">${trendMarkup(e.name,si,s)}</span></div>
        <div class="metric-input"><input inputmode="decimal" type="number" step="0.5" placeholder="0" value="${s.weight}" data-weight="${ei}:${si}"><span>kg</span></div>
        <div class="metric-input"><input inputmode="numeric" type="number" step="1" placeholder="0" value="${s.reps}" data-reps="${ei}:${si}"><span>rep</span></div>
        <button class="set-check-v2 ${s.done?'done':''}" data-done="${ei}:${si}">${s.done?'✓':''}</button>
        <div class="set-tags"><button class="set-type type-${s.type}" data-type="${ei}:${si}">${setTypeLabel(s.type)}</button><button class="rir-chip ${s.rir!==null?'has-rir':''}" data-rir="${ei}:${si}">RIR ${s.rir===null?'—':s.rir}</button><button class="delete-set-link" data-delset="${ei}:${si}">Eliminar</button></div>
      </div>`}).join('')}
    </div>
    <div class="exercise-footer"><button data-addset="${ei}">${icon('plus',15)} Añadir serie</button><button data-prefill="${ei}">Repetir anterior</button><div class="reorder"><button data-move-up="${ei}" ${ei===0?'disabled':''}>↑</button><button data-move-down="${ei}" ${ei===state.active.exercises.length-1?'disabled':''}>↓</button></div></div>
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
  $('#history-search')?.addEventListener('change',e=>{historyQuery=e.target.value;render();});
  $('#history-range')?.addEventListener('change',e=>{historyRange=e.target.value;render();});
  $$('[data-workout-detail]').forEach(b=>b.onclick=()=>openWorkoutDetail(b.dataset.workoutDetail));
  $('#free-workout')?.addEventListener('click',()=>startRoutine(null));
  $('#save-settings')?.addEventListener('click',()=>{state.settings.weeklyGoal=clamp(+$('#goal').value,1,7);state.settings.restSeconds=clamp(+$('#rest').value,15,600);save();toast('Ajustes guardados');render();});
  $('#export')?.addEventListener('click',exportData);
  $('#import')?.addEventListener('click',()=>$('#import-file')?.click());
  $('#import-file')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importData(file);});
  $('#diagnostics')?.addEventListener('click',openDiagnostics);
  $('#beta-install')?.addEventListener('click',installRep);
  $('#beta-share')?.addEventListener('click',shareRep);
  $('#beta-feedback')?.addEventListener('click',openBetaFeedback);
  $('#beta-guide')?.addEventListener('click',()=>openOnboarding(true));
  $('#cloud-login')?.addEventListener('click',()=>cloudAuth('login'));
  $('#cloud-signup')?.addEventListener('click',()=>cloudAuth('signup'));
  $('#cloud-sync')?.addEventListener('click',()=>syncCloud(true));
  $('#cloud-logout')?.addEventListener('click',async()=>{await window.REPCloud.signOut();render();toast('Sesión cerrada');});
  $('#reset')?.addEventListener('click',()=>{if(confirm('¿Borrar entrenamientos, rutinas y ajustes de este dispositivo?')){localStorage.removeItem(STORAGE_KEY);state=structuredClone(seed);save();render();}});
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
  $$('[data-replace-ex]').forEach(b=>b.onclick=()=>openExerciseModal(+b.dataset.replaceEx));
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
    <button class="finish-feedback-link" id="finish-feedback">¿Has visto algo raro? Enviar feedback</button>
    <div class="modal-actions"><button class="secondary" data-close>Seguir editando</button><button class="primary" id="confirm-finish">Guardar sesión</button></div></div>`);
  $('#confirm-finish').onclick=()=>commitWorkout();
  $('#finish-feedback').onclick=()=>openBetaFeedback('Entrenamiento / resumen final');
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

function recentExerciseNames(){
  const names=[];
  [...state.workouts].reverse().forEach(w=>w.exercises?.forEach(e=>{if(!names.includes(e.name))names.push(e.name);}));
  return names.slice(0,8);
}
function openExerciseModal(replaceIndex=null){
  let activeGroup='Todos';
  const title=replaceIndex===null?'Añadir ejercicio':'Sustituir ejercicio';
  const recent=recentExerciseNames();
  modal(`<div class="modal-sticky"><h2>${title}</h2><input class="form-input" id="exercise-search" placeholder="Buscar ejercicio…">${recent.length?`<div class="quick-recent"><small>RECIENTES</small><div>${recent.map(x=>`<button class="chip" data-exchoice="${escapeAttr(x)}">${escapeHtml(x)}</button>`).join('')}</div></div>`:''}${groupFilters(activeGroup)}</div><div id="catalog-list">${catalogHtml(activeGroup)}</div><div class="custom-add"><div class="eyebrow">¿No aparece?</div><p class="subtle mb0">Escribe el nombre y añádelo igualmente.</p></div><div class="modal-actions"><button class="secondary" data-close>Cerrar</button><button class="primary" id="add-custom">Usar escrito</button></div>`);
  const choose=(name)=>replaceIndex===null?addExercise(name):replaceExercise(replaceIndex,name);
  const bindChoices=()=>$$('[data-exchoice]').forEach(b=>b.onclick=()=>choose(b.dataset.exchoice));
  const redraw=()=>{$('#catalog-list').innerHTML=catalogHtml(activeGroup,$('#exercise-search').value);bindChoices();$$('.group-chip').forEach(b=>b.classList.toggle('selected',b.dataset.group===activeGroup));};
  bindChoices(); $('#exercise-search').oninput=redraw;
  $$('.group-chip').forEach(b=>b.onclick=()=>{activeGroup=b.dataset.group;redraw();});
  $('#add-custom').onclick=()=>{const v=$('#exercise-search').value.trim();if(v)choose(v);};
}
function addExercise(name){state.active.exercises.push({id:uid('e'),name,sets:defaultSets(name)});save();closeModal();render();}
function replaceExercise(index,name){
  const current=state.active.exercises[index];
  state.active.exercises[index]={id:current.id||uid('e'),name,sets:defaultSets(name)};
  save();closeModal();render();toast('Ejercicio sustituido');
}

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
function repeatWorkout(id){
  const w=state.workouts.find(x=>x.id===id); if(!w)return;
  state.active={id:uid('w'),name:w.name,startedAt:Date.now(),exercises:w.exercises.map(e=>({id:uid('e'),name:e.name,sets:e.sets.filter(isWorkingSet).map(s=>({weight:s.weight,reps:s.reps,done:false,type:s.type||'normal',rir:null}))}))};
  closeModal();save();render();toast('Sesión preparada');
}
function editWorkout(id){
  const w=state.workouts.find(x=>x.id===id); if(!w)return;
  modal(`<div class="eyebrow">Editar sesión</div><h2>${escapeHtml(w.name)}</h2><div class="edit-workout-list">${w.exercises.map((e,ei)=>`<section><strong>${escapeHtml(e.name)}</strong>${e.sets.map((s,si)=>`<div class="edit-set"><span>${si+1}</span><input class="form-input" type="number" step=".5" value="${s.weight??''}" data-ew="${ei}:${si}"><input class="form-input" type="number" value="${s.reps??''}" data-er="${ei}:${si}"><label><input type="checkbox" data-ed="${ei}:${si}" ${s.done?'checked':''}> ✓</label></div>`).join('')}</section>`).join('')}</div><div class="modal-actions"><button class="secondary" data-close>Cancelar</button><button class="primary" id="save-workout-edit">Guardar cambios</button></div>`);
  $('#save-workout-edit').onclick=()=>{
    $$('[data-ew]').forEach(i=>{const [ei,si]=i.dataset.ew.split(':').map(Number);w.exercises[ei].sets[si].weight=i.value;});
    $$('[data-er]').forEach(i=>{const [ei,si]=i.dataset.er.split(':').map(Number);w.exercises[ei].sets[si].reps=i.value;});
    $$('[data-ed]').forEach(i=>{const [ei,si]=i.dataset.ed.split(':').map(Number);w.exercises[ei].sets[si].done=i.checked;});
    save();closeModal();render();toast('Sesión actualizada');
  };
}
function openWorkoutDetail(id){
  const w=state.workouts.find(x=>x.id===id); if(!w)return;
  modal(`<div class="workout-detail-head"><div><div class="eyebrow">${prettyDate(w.finishedAt)}</div><h2>${escapeHtml(w.name)}</h2></div><span class="pill">${mins(w.finishedAt-w.startedAt)} min</span></div>
    <div class="detail-stats"><span><strong>${workingSetsCount(w)}</strong>series trabajo</span><span><strong>${Math.round(volume(w)).toLocaleString('es-ES')}</strong>kg volumen</span></div>
    <div class="detail-exercises">${w.exercises.filter(e=>e.sets.some(s=>s.done)).map(e=>`<div class="detail-exercise"><div><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(groupForExercise(e.name))}</small></div><span>${e.sets.filter(s=>s.done).map(s=>`${s.type==='warmup'?'W ':s.type==='top'?'T ':''}${s.weight||0}×${s.reps||0}${s.rir!==null&&s.rir!==undefined?` · RIR ${s.rir}`:''}`).join(' · ')}</span></div>`).join('')}</div>
    <div class="detail-actions"><button class="secondary" id="repeat-workout">Repetir</button><button class="secondary" id="edit-workout">Editar</button><button class="secondary danger" id="delete-workout">Eliminar</button></div><div class="modal-actions"><button class="secondary" data-close>Cerrar</button></div>`);
  $('#repeat-workout').onclick=()=>repeatWorkout(id);
  $('#edit-workout').onclick=()=>editWorkout(id);
  $('#delete-workout').onclick=()=>{if(confirm('¿Eliminar esta sesión del historial?')){state.workouts=state.workouts.filter(x=>x.id!==id);save();closeModal();render();toast('Sesión eliminada');}};
}

function modal(html){const w=document.createElement('div');w.className='modal-wrap';w.id='modal-wrap';w.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(w);w.onclick=e=>{if(e.target===w||e.target.matches('[data-close]'))closeModal();};}
function closeModal(){ $('#modal-wrap')?.remove(); }
function toast(msg){clearTimeout(toastTimer);$('.toast')?.remove();const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);toastTimer=setTimeout(()=>t.remove(),2200);}
function exportData(){
  const payload={format:'rep-backup',version:1,exportedAt:new Date().toISOString(),payload:state};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`rep-backup-${isoDay()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
async function importData(file){
  try{
    const raw=JSON.parse(await file.text()), parsed=raw?.format==='rep-backup'?raw.payload:raw;
    if(!parsed||!Array.isArray(parsed.routines)||!Array.isArray(parsed.workouts))throw new Error('Formato no válido');
    state=migrateState({...parsed,active:null});save();toast('Backup restaurado');render();
  }catch{toast('No se pudo importar ese backup');}
}
async function openDiagnostics(){
  const shadow=await readShadow();
  const info={
    version:APP_VERSION,
    schema:state.meta?.schemaVersion,
    workouts:state.workouts.length,
    routines:state.routines.length,
    activeWorkout:!!state.active,
    localBytes:new Blob([JSON.stringify(state)]).size,
    recoveryCopy:!!shadow,
    cloudConfigured:!!window.REPCloud?.isConfigured?.(),
    cloudSignedIn:!!window.REPCloud?.isSignedIn?.(),
    lastSyncedAt:state.meta?.lastSyncedAt?new Date(state.meta.lastSyncedAt).toLocaleString('es-ES'):'—'
  };
  modal(`<div class="eyebrow">Diagnóstico</div><h2>Estado de REP</h2><div class="diagnostics">${Object.entries(info).map(([k,v])=>`<div><span>${escapeHtml(k)}</span><strong>${escapeHtml(String(v))}</strong></div>`).join('')}</div><div class="modal-actions"><button class="secondary" data-close>Cerrar</button></div>`);
}
async function cloudAuth(mode){
  const email=$('#cloud-email')?.value.trim(), password=$('#cloud-password')?.value;
  if(!email||!password){toast('Introduce email y contraseña');return;}
  try{
    if(mode==='signup')await window.REPCloud.signUp(email,password); else await window.REPCloud.signIn(email,password);
    await syncCloud(false);render();toast(mode==='signup'?'Cuenta creada':'Sesión iniciada');
  }catch(e){toast(e?.message||'No se pudo iniciar sesión');}
}


function isStandalone(){
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone===true;
}
function canonicalAppUrl(){
  return location.origin + location.pathname;
}
async function shareRep(){
  const data={title:'REP — Gym Tracker',text:'Estoy probando REP, un tracker de gimnasio centrado en progresar sin perder tiempo registrando.',url:canonicalAppUrl()};
  try{
    if(navigator.share){await navigator.share(data);return;}
    await navigator.clipboard.writeText(data.url); toast('Enlace copiado');
  }catch(e){if(e?.name!=='AbortError')toast('No se pudo compartir');}
}
async function installRep(){
  if(isStandalone()){toast('REP ya está instalada');return;}
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    try{await deferredInstallPrompt.userChoice;}catch{}
    deferredInstallPrompt=null; render(); return;
  }
  const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  modal(`<div class="install-guide"><div class="onboarding-logo">R</div><div class="eyebrow">INSTALAR REP</div><h2>${isiOS?'Añádela a tu inicio':'Instálala como una app'}</h2><p>${isiOS?'En Safari pulsa Compartir y después “Añadir a pantalla de inicio”.':'Abre el menú del navegador y busca “Instalar aplicación” o “Añadir a pantalla de inicio”.'}</p><div class="install-steps"><div><b>1</b><span>${isiOS?'Pulsa Compartir':'Abre el menú del navegador'}</span></div><div><b>2</b><span>${isiOS?'Añadir a pantalla de inicio':'Instalar / Añadir a inicio'}</span></div><div><b>3</b><span>Abre REP desde su icono</span></div></div><button class="primary" data-close>Entendido</button></div>`);
}
function onboardingStepHtml(step){
  if(step===1)return `<div class="onboarding"><div class="onboarding-logo">R</div><span class="onboarding-beta">PRIVATE BETA</span><h2>Tu entrenamiento,<br><em>sin ruido.</em></h2><p>REP guarda tus series, recuerda lo que hiciste y te dice qué intentar superar la próxima vez.</p><div class="onboarding-points"><div><b>01</b><span><strong>Entrena rápido</strong><small>peso, reps y check. Nada más si no quieres.</small></span></div><div><b>02</b><span><strong>Progresa</strong><small>objetivos, PRs y comparación con tu sesión anterior.</small></span></div><div><b>03</b><span><strong>No pierdas tu sesión</strong><small>si cierras la app, vuelves donde estabas.</small></span></div></div><button class="primary" id="onboarding-next">Configurar REP</button><button class="onboarding-skip" id="onboarding-skip">Usar valores recomendados</button></div>`;
  return `<div class="onboarding"><div class="onboarding-step">2 / 2</div><span class="eyebrow">DOS AJUSTES Y LISTO</span><h2>Hazla tuya.</h2><p>Puedes cambiar esto después en Ajustes.</p><div class="onboarding-settings"><div><label>Entrenamientos por semana</label><div class="number-stepper"><button data-goal-delta="-1">−</button><strong id="onboard-goal">${state.settings.weeklyGoal}</strong><button data-goal-delta="1">+</button></div></div><div><label>Descanso entre series</label><div class="rest-options">${[60,90,120,180].map(v=>`<button data-onboard-rest="${v}" class="${state.settings.restSeconds===v?'active':''}">${v<120?`${v}s`:`${v/60} min`}</button>`).join('')}</div></div></div><div class="onboarding-ready"><span>✓</span><p><b>3 rutinas ya preparadas</b><small>Puedes editarlas, duplicarlas o empezar un entrenamiento libre.</small></p></div><button class="primary" id="onboarding-done">Entrar en REP</button></div>`;
}
function openOnboarding(force=false){
  if(!force && state.settings.onboardingComplete)return;
  closeModal();
  modal(onboardingStepHtml(1));
  const bindStep1=()=>{
    $('#onboarding-next').onclick=()=>{closeModal();modal(onboardingStepHtml(2));bindStep2();};
    $('#onboarding-skip').onclick=()=>finishOnboarding();
  };
  const bindStep2=()=>{
    $$('[data-goal-delta]').forEach(b=>b.onclick=()=>{state.settings.weeklyGoal=clamp(state.settings.weeklyGoal+Number(b.dataset.goalDelta),1,7);$('#onboard-goal').textContent=state.settings.weeklyGoal;});
    $$('[data-onboard-rest]').forEach(b=>b.onclick=()=>{state.settings.restSeconds=Number(b.dataset.onboardRest);$$('[data-onboard-rest]').forEach(x=>x.classList.toggle('active',x===b));});
    $('#onboarding-done').onclick=finishOnboarding;
  };
  bindStep1();
}
function finishOnboarding(){
  state.settings.onboardingComplete=true; save(); closeModal(); render(); toast('REP lista para entrenar');
}
function feedbackText(kind,message,context=''){
  const mode=isStandalone()?'PWA instalada':'navegador';
  return [
    'REP PRIVATE BETA — Feedback',
    `Versión: ${APP_VERSION}`,
    `Tipo: ${kind}`,
    context?`Contexto: ${context}`:'',
    `Modo: ${mode}`,
    `Sesiones guardadas: ${state.workouts.length}`,
    '',
    message.trim()
  ].filter(Boolean).join('\n');
}
function openBetaFeedback(context=''){
  modal(`<div class="feedback-modal"><span class="eyebrow">REP PRIVATE BETA</span><h2>Cuéntanos qué has visto.</h2><p class="subtle">No hace falta escribir un informe. Con una frase clara nos vale.</p><div class="form-group"><label>TIPO</label><select class="form-input" id="feedback-kind"><option>Bug</option><option>Idea</option><option>Diseño / UX</option><option>Dato incorrecto</option><option>Otro</option></select></div><div class="form-group"><label>¿QUÉ HA PASADO?</label><textarea class="form-input feedback-text" id="feedback-message" maxlength="1200" placeholder="Ej. Al marcar la tercera serie, el temporizador tapa el botón…"></textarea></div><div class="feedback-meta">Se añadirá automáticamente la versión y un diagnóstico básico, nunca tus pesos ni ejercicios.</div><div class="modal-actions"><button class="secondary" data-close>Cancelar</button><button class="primary" id="share-feedback">Compartir feedback</button></div></div>`);
  $('#share-feedback').onclick=async()=>{
    const msg=$('#feedback-message').value.trim();
    if(!msg){toast('Escribe qué ha pasado');return;}
    const text=feedbackText($('#feedback-kind').value,msg,context);
    try{
      if(navigator.share){await navigator.share({title:'Feedback REP Beta',text});closeModal();return;}
      await navigator.clipboard.writeText(text);closeModal();toast('Feedback copiado. Pégalo en WhatsApp');
    }catch(e){if(e?.name!=='AbortError')toast('No se pudo compartir');}
  };
}

function clamp(n,a,b){return Math.min(b,Math.max(a,Number.isFinite(n)?n:a));}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function escapeAttr(s=''){return escapeHtml(s);}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;if(view==='settings')render();});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;toast('REP instalada');if(view==='settings')render();});
window.addEventListener('beforeunload',()=>save(false));
window.addEventListener('error',()=>{try{save(false)}catch{}});
window.addEventListener('unhandledrejection',()=>{try{save(false)}catch{}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save(false);});

async function registerServiceWorker(){
  if(!('serviceWorker' in navigator)||!location.protocol.startsWith('http'))return;
  try{
    const reg=await navigator.serviceWorker.register('sw.js');
    reg.addEventListener('updatefound',()=>{
      const worker=reg.installing;
      worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)toast('REP actualizado');});
    });
  }catch{}
}
async function boot(){
  const hasPrimary=!!localStorage.getItem(STORAGE_KEY);
  let restored=false;
  if(!hasPrimary){
    const shadow=await readShadow();
    if(shadow){state=migrateState(shadow);save(false);restored=true;}
  }
  render();
  await registerServiceWorker();
  try{
    if(window.REPCloud){
      await window.REPCloud.init();
      cloudReady=true;
      if(window.REPCloud.isSignedIn())await syncCloud(false);
      render();
    }
  }catch{cloudReady=false;}
  if(!hasPrimary&&!restored&&!state.settings.onboardingComplete){
    setTimeout(()=>openOnboarding(false),120);
  }
}
boot();
