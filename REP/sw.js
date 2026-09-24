const CACHE='rep-gym-v1-2-beta-1';
const ASSETS=['./','./index.html','./style.css?v=1.2.0-beta.1','./cloud.js?v=1.2.0-beta.1','./app.js?v=1.2.0-beta.1','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url); if(url.origin!==self.location.origin)return;
  const networkFirst=e.request.mode==='navigate'||['script','style','worker'].includes(e.request.destination);
  if(networkFirst){
    e.respondWith(fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(async()=>await caches.match(e.request)||(e.request.mode==='navigate'?await caches.match('./'):Response.error())));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;})));
});
