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
 [94,'Rilakkuma','solo',['rilakkuma'],'I hope this year is kind to you.','#25262a'],
 [97.5,'Hand in hand','solo',['hands'],'','#372f32'],
 [101.5,'This birthday','solo',['sunset'],'And on the days it isn’t, I’ll walk you home.','#42322a']
];
const duration=108;
const details={
 fireworks:['Golden fireworks above the castle'],'rilakkuma':['Korilakkuma nestles against Rilakkuma'],hands:['Our hands resting together, wearing matching rings'],
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
const greetings=$('#greetings'),rilakkuma=$('#rilakkuma'),poolLive=$('#pool-live'),handsLive=$('#hands-live'),castleLive=$('#castle-live');
let excerpt=null,excerptStart=0;
function playExcerpt(clip){
 const attempt=clip.play();
 if(attempt)attempt.catch(()=>{clip.style.visibility='hidden'});
}
function selectExcerpt(clip,startTime){
 if(excerpt===clip)return;
 if(excerpt){excerpt.pause();excerpt.style.visibility='hidden'}
 excerpt=clip;excerptStart=startTime;
 if(clip){prepareClip(clip);clip.currentTime=Math.max(0,elapsed-startTime);playExcerpt(clip)}
}
function prepareClip(clip){
 if(!clip.hasAttribute('src')){
   clip.preload='auto';
   clip.src=clip.dataset.src;
 }
}
const sceneClips={rilakkuma,hands:handsLive,fireworks:castleLive,pool:poolLive,'toon-cake':greetings,'screen-wish':greetings};
const frames=new Map();
function photo(name){
 if(!frames.has(name)){
   const image=new Image();image.src='stills/'+name+'.jpg';image.alt=details[name][0];
   image.style.setProperty('--focus',details[name][1] || '50% 50%');frames.set(name,image);
 }
 return frames.get(name);
}
async function prepareScenes(){
 for(const page of pages){
   if(inCredits)return;
   const names=page[3];
   await Promise.all(names.map(name=>photo(name).decode().catch(()=>{})));
   const clip=sceneClips[names[0]];
   if(clip)prepareClip(clip);
 }
}
let elapsed=0,running=false,last=0,sound=true,audio,master,nextNote=0,pageIndex=-1;
const chords=[[50,57,61,64],[47,54,57,62],[43,50,54,59],[45,52,57,61],[50,57,61,66],[43,50,54,62],[45,52,59,61],[50,57,62,66]];
const melody=[69,73,76,74,71,69,73,74];
const notes=[];
// Leave room for the dialogue, then let the score follow the photographs.
const walkAt=pages.find(page=>page[3][0]==='river')[0];
const carouselAt=pages.find(page=>page[3][0]==='carousel')[0];
const wishAt=pages.find(page=>page[3][0]==='rilakkuma')[0];
const scoreStart=16,barDuration=2.85;
for(let i=0;scoreStart+i*barDuration<wishAt;i++){
 const beat=scoreStart+i*barDuration, chord=chords[i%chords.length];
 const quietWalk=beat>=walkAt && beat<carouselAt;
 const playingChord=quietWalk?[chord[0],chord[2]]:chord;
 playingChord.forEach((n,j)=>notes.push([beat+.08+j*.12,n,j===0?.084:.037,2.7]));
 notes.push([beat+1.05,melody[i%8],quietWalk?.052:.078,2.5]);
 if(!quietWalk && i%2===0)notes.push([beat+2.04,chord[2]+12,.043,1.85]);
 if(beat>=carouselAt)notes.push([beat,chord[0],.032,2.8,'bow']);
}
// Resolve the last phrase once, with a little silence after the last note.
for(const [delay,pitch,level] of [[0,50,.071],[.18,57,.046],[1.3,69,.081],[3.5,66,.064],[5.2,64,.058],[7.45,50,.07],[7.7,57,.042],[8.05,62,.072]]){
 notes.push([wishAt+delay,pitch,level,3.6]);
}
notes.sort((left,right)=>left[0]-right[0]);
function bowedNote(at,note,level,length){
 const oscillator=audio.createOscillator(), envelope=audio.createGain();
 oscillator.type='triangle';oscillator.frequency.value=440*2**((note-69)/12);
 envelope.gain.setValueAtTime(.0001,at);
 envelope.gain.linearRampToValueAtTime(level,at+.75);
 envelope.gain.exponentialRampToValueAtTime(.0001,at+length);
 oscillator.connect(envelope).connect(master);
 oscillator.start(at);oscillator.stop(at+length+.02);
 oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect()};
}
function tone(at,note,level,length){
 const freq=440*Math.pow(2,(note-69)/12);
 for(const [multiple,amp,decay] of [[1,1,1],[2,.37,.65],[3,.12,.4]]){
 const osc=audio.createOscillator(),gain=audio.createGain();osc.frequency.value=freq*multiple;
 gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(level*amp,at+.019);gain.gain.exponentialRampToValueAtTime(.0001,at+length*decay);
 osc.connect(gain).connect(master);osc.start(at);osc.stop(at+length*decay+.03);osc.onended=()=>{osc.disconnect();gain.disconnect()};
 }}

// Repeat the opening eight bars on the audio clock while the filmstrip runs.
const creditBars=chords.map((_,i)=>{
 const start=scoreStart+i*barDuration;
 return notes.filter(([time])=>time>=start && time<start+barDuration)
   .map(([time,pitch,level,length])=>[time-start,pitch,level,length]);
});
let creditBar=0,nextBarAt=0,creditTimer;
function queueCreditBar(){
 if(!audio)return;
 const now=audio.currentTime;
 if(nextBarAt<=now+.2){
   const at=Math.max(nextBarAt,now+.005);
   for(const [offset,pitch,level,length] of creditBars[creditBar]){
     tone(at+offset,pitch,level,length);
   }
   creditBar=(creditBar+1)%creditBars.length;
   nextBarAt=at+barDuration;
 }
 creditTimer=setTimeout(queueCreditBar,Math.max(20,(nextBarAt-now-.18)*1000));
}

let inCredits=false,frameRequest=0;
function setPaused(stop){
 running=!stop;last=performance.now();$('#pause').textContent=stop?'Resume':'Pause';
 $('#screen').classList.toggle('paused',stop);
 if(audio){if(stop)audio.suspend();else audio.resume()}
 if(excerpt){if(stop)excerpt.pause();else if(!excerpt.ended)playExcerpt(excerpt)}
 cancelAnimationFrame(frameRequest);
 clearTimeout(creditTimer);
 if(running){
   if(inCredits)queueCreditBar();
   else frameRequest=requestAnimationFrame(frame);
 }
}

const candle=$('.flame'),openingStatus=$('#opening-status'),retryOpening=$('#retry-opening');
const portrait=$('.portrait img');
let openingRequest,openingUrl,slowTimer;
function openingFailed(){
 clearTimeout(slowTimer);
 candle.hidden=candle.disabled=true;
 openingStatus.textContent='The opening couldn’t load.';
 retryOpening.hidden=false;
}
async function prepareOpening(){
 const cache=openingRequest?'reload':'default';
 openingRequest?.abort();
 const request=new AbortController();openingRequest=request;
 clearTimeout(slowTimer);
 candle.hidden=candle.disabled=true;retryOpening.hidden=true;
 openingStatus.textContent='Getting your film ready…';
 // Allow a manual retry on a stalled connection without interrupting a slow download.
 slowTimer=setTimeout(()=>{retryOpening.hidden=false},20000);
 try{
   if(portrait.complete && !portrait.naturalWidth)portrait.src='stills/birthday.jpg';
   if(location.protocol==='file:'){
     prepareClip(greetings);
     if(greetings.error)greetings.load();
   }else{
     const response=await fetch(greetings.dataset.src,{signal:request.signal,cache});
     if(!response.ok)throw Error('Opening download failed');
     const blob=await response.blob();
     if(request.signal.aborted)return;
     if(openingUrl)URL.revokeObjectURL(openingUrl);
     openingUrl=URL.createObjectURL(blob);
     greetings.preload='auto';greetings.src=openingUrl;
   }
   await portrait.decode();
   if(request.signal.aborted)return;
   if(greetings.error)throw Error('Opening unavailable');
   clearTimeout(slowTimer);
   openingStatus.textContent='Touch the candlelight to begin.';
   candle.hidden=candle.disabled=false;
   retryOpening.hidden=true;
 }catch{
   if(!request.signal.aborted)openingFailed();
 }
}
async function start(){
 candle.disabled=true;
 openingStatus.textContent='Starting your film…';
 const Engine=window.AudioContext||window.webkitAudioContext;
 if(Engine && !audio){audio=new Engine();master=audio.createGain();master.connect(audio.destination);master.gain.value=sound?.8:0}
 if(audio)audio.resume();
 greetings.muted=!sound;$('#reel').hidden=false;
 try{
   greetings.currentTime=0;
   await greetings.play();
 }catch{
   $('#reel').hidden=true;openingFailed();return;
 }
 excerpt=greetings;excerptStart=0;
 $('#screen').classList.add('playing');
 $('#pause').hidden=$('#skip').hidden=false;$('#pause').focus({preventScroll:true});
 running=true;last=performance.now();frameRequest=requestAnimationFrame(frame);
 prepareScenes();
 if(document.hidden)setPaused(true);
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
 if(running)queueCreditBar();
 else setPaused(false);
}

function frame(now){
 if(!running || inCredits)return;
 if(excerpt===greetings && !greetings.ended)elapsed=greetings.currentTime;
 else elapsed+=Math.max(0,now-last)/1000;
 last=now;
 if(elapsed>=duration){showCredits();return}
 if(audio)while(nextNote<notes.length&&notes[nextNote][0]<=elapsed+.09){
   const [time,n,l,d,voice]=notes[nextNote++];
   const playNote=voice==='bow'?bowedNote:tone;
   playNote(audio.currentTime+Math.max(.005,time-elapsed),n,l,d)
 }
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
     const clip=sceneClips[images[0]] ?? null;
     selectExcerpt(clip,clip===greetings?0:at);
     spread.dataset.layout=layout;spread.replaceChildren(...images.map(photo));
     $('#reel').style.setProperty('--wash',wash);$('#scene').textContent=scene;$('#caption').textContent=caption;pageIndex=i;
   }
   const fadeIn=(elapsed-at)/.48,fadeOut=((pages[i+1]?.[0]??duration)-elapsed)/.48;
   const opacity=Math.min(1,fadeIn,fadeOut);
   // Cut directly from the resting bears to the rings.
   const pictureOpacity=images[0]==='rilakkuma'?Math.min(1,fadeIn):images[0]==='hands'?Math.min(1,fadeOut):opacity;
   const moving=excerpt && excerpt.readyState>=2 && (!excerpt.paused || excerpt.ended);
   if(moving){
     const target=elapsed-excerptStart;
     if(!excerpt.seeking && target<excerpt.duration-.2 && Math.abs(excerpt.currentTime-target)>.45)excerpt.currentTime=target;
     excerpt.style.visibility='visible';excerpt.style.opacity=pictureOpacity;
   }
   spread.style.opacity=moving?0:pictureOpacity;$('#caption').style.opacity=opacity;
 }
 $('#clock').textContent=counter(Math.floor(elapsed))+' / '+counter(duration);$('#line').style.width=elapsed/duration*100+'%';
 frameRequest=requestAnimationFrame(frame);
}
retryOpening.onclick=prepareOpening;
greetings.addEventListener('error',()=>{if(!$('#screen').classList.contains('playing'))openingFailed()});
prepareOpening();
candle.onclick=start;$('#skip').onclick=showCredits;$('#replay').onclick=()=>location.reload();
$('#pause').onclick=()=>setPaused(running);
$('#sound').onclick=()=>{sound=!sound;greetings.muted=!sound;$('#sound').textContent='Sound '+(sound?'on':'off');$('#sound').setAttribute('aria-pressed',sound);if(audio)master.gain.setTargetAtTime(sound?.8:0,audio.currentTime,.05)};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)setPaused(true)});
