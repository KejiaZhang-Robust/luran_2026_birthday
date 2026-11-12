'use strict';
(() => {
 const gate=document.querySelector('#premiere');
 const target=Date.parse(document.querySelector('#showtime').dateTime);
 const fields=['hours','minutes','seconds'].map(id=>document.getElementById(id));
 const status=document.querySelector('#door-status');
 const retry=document.querySelector('#retry-clock');
 const offlineCopy=location.protocol==='file:';
 let serverTime=offlineCopy?Date.now():null, sampledAt=performance.now();
 let checking=false,admitted=false,lastCount=null;

 function showFilm(){
   // Template contents stay inert, including the cover image, until admission.
   gate.replaceWith(document.querySelector('#film-content').content);
   document.querySelector('#film-content').remove();
   const script=document.createElement('script');
   script.src='film.js?v=mirror-smile';
   script.onerror=()=>{
     const message=document.querySelector('#opening-status'),button=document.querySelector('#retry-opening');
     message.textContent='The opening couldn’t load.';
     button.hidden=false;button.onclick=()=>location.reload();
   };
   document.body.append(script);
 }
 function tick(){
   if(serverTime===null)return;
   const now=serverTime+performance.now()-sampledAt;
   const remaining=Math.max(0,Math.ceil((target-now)/1000));
   if(remaining!==lastCount){
     const parts=[Math.floor(remaining/3600),Math.floor(remaining/60)%60,remaining%60];
     fields.forEach((field,i)=>{field.textContent=String(parts[i]).padStart(2,'0')});
     lastCount=remaining;
   }
   if(remaining || admitted)return;
   admitted=true;
   clearInterval(timer);
   document.removeEventListener('visibilitychange',onVisible);
   window.removeEventListener('pageshow',onVisible);
   retry.hidden=true;
   if(!sawCountdown){showFilm();return}
   status.textContent='It’s midnight. Happy birthday, Luran.';
   gate.classList.add('opening');
   setTimeout(showFilm,matchMedia('(prefers-reduced-motion: reduce)').matches?0:740);
 }
 let sawCountdown=false;
 async function syncClock(){
   if(offlineCopy || checking || admitted)return;
   checking=true;retry.hidden=true;
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),8000);
   try{
     const url=new URL(location.href);
     url.searchParams.set('_clock',Math.random().toString(36).slice(2));
     const response=await fetch(url,{method:'HEAD',cache:'no-store',signal:controller.signal});
     const stamp=Date.parse(response.headers.get('Date'));
     if(!response.ok || !Number.isFinite(stamp))throw Error('Clock unavailable');
     serverTime=stamp;sampledAt=performance.now();lastCount=null;
     if(stamp<target)sawCountdown=true;
     status.textContent='Stay here. The film opens at midnight.';
     tick();
   }catch{
     if(serverTime===null){
       status.textContent='Checking the time. Please reconnect and try again.';retry.hidden=false;
     }
   }finally{clearTimeout(timeout);checking=false}
 }
 function onVisible(){if(!document.hidden)syncClock()}
 const timer=setInterval(tick,200);
 retry.onclick=syncClock;
 document.addEventListener('visibilitychange',onVisible);
 window.addEventListener('pageshow',onVisible);
 // A local file can still be previewed offline; the published entrance uses the server clock.
 if(offlineCopy)sawCountdown=serverTime<target;
 tick();syncClock();
})();
