const V='imgtools-v1';
self.addEventListener('install',e=>{self.skipWaiting();
  e.waitUntil(caches.open(V).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'].map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==V&&k!=='shared')await caches.delete(k);
  await clients.claim()})()));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method==='POST'&&new URL(r.url).pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      const fs=(await r.formData()).getAll('images'),c=await caches.open('shared');
      for(const k of await c.keys())await c.delete(k);
      let i=0;
      for(const f of fs)if(f&&f.size)await c.put('shared-'+String(i++).padStart(3,'0'),new Response(f,{headers:{'Content-Type':f.type,'X-Name':encodeURIComponent(f.name||'image')}}));
      return Response.redirect(new URL('./?shared='+i,self.registration.scope).href,303);
    })());return;
  }
  if(r.method!=='GET')return;
  e.respondWith(fetch(r.url,{cache:'no-cache'}).then(res=>{
    if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}
    return res}).catch(()=>caches.match(r,{ignoreSearch:true})));
});
