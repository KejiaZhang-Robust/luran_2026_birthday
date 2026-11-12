'use strict';
// Older invitations included a private fragment. The public edition uses the same path.
if (/^#[A-Za-z0-9_-]{43}$/.test(location.hash)) {
 history.replaceState(null,'',location.pathname+location.search);
}
const $ = selector => document.querySelector(selector);
// Each spread begins on the album clock. Focus points preserve faces in the paired crops.
const pages = [
 [1.1,'Betty Boop’s Birthday Party','solo',['toon-cake'],'Happy birthday, Luran.','#272329'],
 [5.25,'The Little Princess','solo',['screen-wish'],'','#35292b'],
 [16,'After dark','solo',['lamp'],'Where would we be when your birthday came around again?','#283747'],
 [22,'On the road','solo',['drive'],'','#373a32'],
 [25,'A little detour','solo',['cat'],'','#373a32'],
 [28,'A little detour','prints',['little-bear','bear'],'','#45303d'],
 [33,'In the frame','solo',['sign'],'','#273c32'],
 [36,'In the frame','solo',['star'],'','#273c32'],
 [39,'Graduation day','solo',['graduation'],'','#273c32'],
 [43,'In the blue','solo',['pool'],'','#233d45'],
 [46.5,'An afternoon out','solo',['park'],'','#233d45'],
 [50,'Just us','solo',['mirror'],'','#493937'],
 [53.5,'By the window','prints',['roses','flowers'],'','#493937'],
 [58,'A table for two','solo',['lunch'],'','#413630'],
 [61,'Afternoon tea','prints',['tea','cake-table'],'','#413630'],
 [66,'An evening walk','solo',['river'],'I love walking with you when neither of us has anywhere to be.','#473a35'],
 [73,'After dark','solo',['night-drinks'],'','#37283f'],
 [76,'Carousel lights','solo',['carousel'],'','#4c3025'],
 [81,'Castle lights','film',['show-blue','show-gold','show-fountains'],'','#302b47'],
 [85,'Fireworks','solo',['fireworks'],'','#302b47'],
 [89,'On film','solo',['prints'],'I keep coming back to this one.','#32313b'],
 [94,'About Time','solo',['streetlight'],'I hope this year is kind to you.','#25262a'],
 [97.5,'Hand in hand','solo',['hands'],'','#372f32'],
 [101.5,'This birthday','solo',['sunset'],'And on the days it isn’t, I’ll walk you home.','#42322a']
];
const duration=108;
const details={
 fireworks:['Golden fireworks above the castle'],streetlight:['Mary smiles at Tim on a quiet London street'],hands:['Our hands resting together, wearing matching rings'],
 'toon-cake':['Candles on Betty Boop’s birthday cake'],'screen-wish':['A birthday gift in The Little Princess'],
 lamp:['Reading by the window at night'],drive:['Taking a photo from the passenger seat','72% 50%'],cat:['Stopping to photograph an orange cat'],
 'little-bear':['A tiny bear in our hands'],bear:['A portrait beside a much bigger bear','32% 50%'],
 sign:['Pointing to a sign beneath the leaves','46% 48%'],star:['A chalk star above her hand','50% 34%'],graduation:['Graduation day','50% 42%'],
 pool:['Together by the blue water'],park:['A selfie at the park'],mirror:['Together in the mirror','50% 48%'],
 roses:['A bouquet by the window','50% 72%'],flowers:['Holding the bouquet','50% 45%'],
 tea:['Afternoon tea by the window','50% 65%'],lunch:['Lunch for two','50% 58%'],'cake-table':['Two cakes and drinks','50% 65%'],
 river:['Together by the riverside at dusk'],'night-drinks':['Two glasses beneath violet lights','52% 58%'],
 carousel:['The carousel at night'],'show-blue':['The castle bathed in blue light'],'show-gold':['Golden lights spreading across the castle'],'show-fountains':['The illuminated fountains rising beside the castle'],
 prints:['A table of instant photos'],rings:['Two rings in amber light'],sunset:['Together at an open window at sunset']
};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const balloons=$('#balloons'),shapes=[...balloons.children],spread=$('#spread');
const counter=t=>String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');
const greetings=$('#greetings'),streetlight=$('#streetlight'),poolLive=$('#pool-live'),handsLive=$('#hands-live'),castleLive=$('#castle-live');
let excerpt=null,excerptStart=0;
function playExcerpt(clip){
 const attempt=clip.play();
 if(attempt)attempt.catch(()=>{clip.style.visibility='hidden'});
}
function selectExcerpt(clip,startTime){
 if(excerpt===clip)return;
 if(excerpt){excerpt.pause();excerpt.style.visibility='hidden'}
 excerpt=clip;excerptStart=startTime;
 if(clip){clip.currentTime=Math.max(0,elapsed-startTime);playExcerpt(clip)}
}
const frames=new Map();
for(const name of pages.flatMap(page=>page[3])){
 const image=new Image();image.src='stills/'+name+'.jpg';image.alt=details[name][0];
 image.style.setProperty('--focus',details[name][1] || '50% 50%');frames.set(name,image);
}
const song=$('#song');
const songCue=pages.find(page=>page[3][0]==='lamp')[0];
let elapsed=0,running=false,last=0,sound=true,pageIndex=-1;
let inCredits=false,songStarted=false,frameRequest=0;

let musicUnavailable=false;

function showMusicRetry(){
 musicUnavailable=true;
 if(songStarted && sound)$('#sound').textContent='Retry music';
}

song.addEventListener('error',showMusicRetry);

function playSong(){
 song.play().catch(error=>{
   if(error.name!=='AbortError')showMusicRetry();
 });
}

function cueSong(){
 if(songStarted)return;
 songStarted=true;
 playSong();
}

function setPaused(stop){
 running=!stop;last=performance.now();$('#pause').textContent=stop?'Resume':'Pause';
 $('#screen').classList.toggle('paused',stop);
 if(songStarted){if(stop)song.pause();else playSong()}
 if(excerpt){if(stop)excerpt.pause();else playExcerpt(excerpt)}
 cancelAnimationFrame(frameRequest);
 if(running && !inCredits)frameRequest=requestAnimationFrame(frame);
}

function start(){
 // Unlock this media element with the candle tap for its later musical cue.
 song.muted=!sound;
 playSong();
 song.pause();
 $('#screen').classList.add('playing');$('.flame').disabled=true;$('#reel').hidden=false;
 $('#pause').hidden=$('#skip').hidden=false;$('#pause').focus({preventScroll:true});
 greetings.muted=!sound;selectExcerpt(greetings,0);
 running=true;last=performance.now();frameRequest=requestAnimationFrame(frame);
}

function showCredits(){
 inCredits=true;
 selectExcerpt(null,0);$('#reel').hidden=true;$('.cover').style.visibility='hidden';
 $('#caption').textContent='';balloons.hidden=true;$('#skip').hidden=true;
 // Start on the sunset that closes the film, then wind back through the year.
 const photos=['sunset','drive','cat','little-bear','graduation','pool','mirror','flowers','tea','river','carousel','fireworks','hands','birthday'];
 const strip=$('.film-frames');
 for(const name of photos){
   const photo=new Image();
   photo.src='stills/'+name+'.jpg';
   photo.alt=details[name]?.[0] || 'Luran beside her birthday cake';
   strip.append(photo);
 }
 const copy=strip.cloneNode(true);
 copy.setAttribute('aria-hidden','true');
 strip.after(copy);
 $('.film-track').style.setProperty('--frames',photos.length);
 $('.end').hidden=false;$('#scene').textContent='On film';
 $('#line').style.width='100%';$('#clock').textContent='∞';
 $('#replay').focus({preventScroll:true});
 if(!running)setPaused(false);
 cueSong();
}

function frame(now){
 if(!running || inCredits)return;
 elapsed+=Math.max(0,now-last)/1000;last=now;
 if(elapsed>=duration){showCredits();return}
 if(elapsed>=songCue)cueSong();
 const cover=$('.cover');
 if(elapsed<1.1){
   cover.style.setProperty('--intro-visibility','visible');
   cover.style.setProperty('--intro-opacity',Math.max(0,Math.min(1,(1.05-elapsed)/.72)));
   cover.style.setProperty('--ring-size',1+Math.min(1,elapsed/.55));
   cover.style.setProperty('--ring-opacity',Math.max(0,1-elapsed/.65));
 }else{cover.style.visibility='hidden'}
 balloons.hidden=reduced||elapsed>2.75;
 if(!balloons.hidden)shapes.forEach((shape,k)=>{
   const progress=Math.min(1,Math.max(0,(elapsed-.075*k)/2.4));
   shape.style.transform='translateY(calc('+((1-progress)*104)+'% - '+(progress*149)+'svh)) rotate('+(-11+k*5)+'deg)';
 });
 const i=pages.findLastIndex(page=>page[0]<=elapsed);
 if(i>=0){
   const [at,scene,layout,images,caption,wash]=pages[i];
   if(i!==pageIndex){
     const clip=({streetlight,hands:handsLive,fireworks:castleLive,pool:poolLive,'toon-cake':greetings,'screen-wish':greetings})[images[0]] ?? null;
     selectExcerpt(clip,clip===greetings?0:at);
     spread.dataset.layout=layout;spread.replaceChildren(...images.map(name=>frames.get(name)));
     $('#reel').style.setProperty('--wash',wash);$('#scene').textContent=scene;$('#caption').textContent=caption;pageIndex=i;
   }
   const opacity=Math.min(1,(elapsed-at)/.48,((pages[i+1]?.[0]??duration)-elapsed)/.48);
   const moving=excerpt && excerpt.readyState>=2 && (!excerpt.paused || excerpt.ended);
   if(moving){
     const target=elapsed-excerptStart;
     if(!excerpt.seeking && target<excerpt.duration-.2 && Math.abs(excerpt.currentTime-target)>.45)excerpt.currentTime=target;
     excerpt.style.visibility='visible';excerpt.style.opacity=opacity;
   }
   spread.style.opacity=moving?0:opacity;$('#caption').style.opacity=opacity;
 }
 $('#clock').textContent=counter(Math.floor(elapsed))+' / '+counter(duration);$('#line').style.width=elapsed/duration*100+'%';
 frameRequest=requestAnimationFrame(frame);
}
$('.flame').onclick=start;$('#skip').onclick=showCredits;$('#replay').onclick=()=>location.reload();
$('#pause').onclick=()=>setPaused(running);
$('#sound').onclick=()=>{
 if(musicUnavailable && songStarted && sound){
   musicUnavailable=false;
   if(song.error)song.load();
   if(running)playSong();
 }else{sound=!sound}
 greetings.muted=song.muted=!sound;
 $('#sound').textContent='Sound '+(sound?'on':'off');
 $('#sound').setAttribute('aria-pressed',sound);
};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)setPaused(true)});
