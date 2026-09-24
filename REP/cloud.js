(() => {
  const CONFIG_URL='https://raw.githubusercontent.com/alexxarmaas/Proyectos/main/.rep-cloud-config.json';
  const SESSION_KEY='rep-cloud-session-v1';
  let config={enabled:false}, session=null;

  async function init(){
    try{
      const r=await fetch(CONFIG_URL+'?t='+Date.now(),{cache:'no-store'});
      if(r.ok)config={enabled:false,...await r.json()};
    }catch{}
    try{session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{session=null;}
    if(session?.refresh_token&&config.enabled){
      try{await refreshSession();}catch{}
    }
    return {configured:isConfigured(),signedIn:isSignedIn()};
  }
  function isConfigured(){return !!(config.enabled&&config.url&&config.publishableKey);}
  function isSignedIn(){return !!session?.access_token;}
  function getSession(){return session;}
  function headers(auth=false){
    const h={'apikey':config.publishableKey,'Content-Type':'application/json'};
    if(auth&&session?.access_token)h.Authorization='Bearer '+session.access_token;
    return h;
  }
  async function authRequest(path,body){
    if(!isConfigured())throw new Error('Cloud no configurado');
    const r=await fetch(config.url+'/auth/v1/'+path,{method:'POST',headers:headers(false),body:JSON.stringify(body)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.msg||data.message||data.error_description||'Error de autenticación');
    return data;
  }
  function storeSession(data){
    session={access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:Date.now()+(Number(data.expires_in||3600)*1000)};
    localStorage.setItem(SESSION_KEY,JSON.stringify(session));
    return session;
  }
  async function signIn(email,password){return storeSession(await authRequest('token?grant_type=password',{email,password}));}
  async function signUp(email,password){
    const data=await authRequest('signup',{email,password});
    if(data.access_token)return storeSession(data);
    throw new Error('Revisa tu email para confirmar la cuenta');
  }
  async function refreshSession(){
    if(!session?.refresh_token)return null;
    const data=await authRequest('token?grant_type=refresh_token',{refresh_token:session.refresh_token});
    return storeSession(data);
  }
  async function ensureSession(){
    if(session?.expires_at&&session.expires_at-Date.now()<60000)await refreshSession();
    if(!isSignedIn())throw new Error('No hay sesión');
  }
  async function signOut(){
    if(isConfigured()&&session?.access_token){
      try{await fetch(config.url+'/auth/v1/logout',{method:'POST',headers:headers(true)});}catch{}
    }
    session=null; localStorage.removeItem(SESSION_KEY);
  }
  async function remoteRow(){
    await ensureSession();
    const uid=session.user?.id;
    const r=await fetch(config.url+`/rest/v1/rep_state?user_id=eq.${encodeURIComponent(uid)}&select=payload,client_updated_at,updated_at`,{headers:headers(true)});
    if(!r.ok)throw new Error('No se pudo leer la nube');
    const rows=await r.json(); return rows[0]||null;
  }
  async function pushState(state){
    await ensureSession();
    const body={user_id:session.user.id,payload:state,client_updated_at:Number(state.meta?.updatedAt||Date.now())};
    const r=await fetch(config.url+'/rest/v1/rep_state?on_conflict=user_id',{method:'POST',headers:{...headers(true),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(body)});
    if(!r.ok)throw new Error('No se pudo guardar en la nube');
  }
  async function syncState(localState){
    if(!isConfigured()||!isSignedIn())return {direction:'none'};
    const remote=await remoteRow();
    const localUpdated=Number(localState.meta?.updatedAt||0), remoteUpdated=Number(remote?.client_updated_at||0);
    if(remote?.payload&&remoteUpdated>localUpdated)return {direction:'pull',state:remote.payload};
    await pushState(localState); return {direction:'push'};
  }
  window.REPCloud={init,isConfigured,isSignedIn,getSession,signIn,signUp,signOut,syncState};
})();