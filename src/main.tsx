import {Workshop} from './Workshop';
import {ambientMix, createAmbientAudio} from './ambientAudio';
import {ALBUM_LIMIT,loadAlbum,saveAlbum,type IslandPhoto} from './album';
import {discoverLighthouseClue, lighthouseClue, nearLighthouse} from './lighthouse';
import{weatherAt,weatherLabels}from './weather';
import {ActivityPanel,CommunityPanel} from './SharedActivities';import {startActivity,tickActivity,cancelActivity} from './activities';import {activities,type TaskId} from './activityState';import {places,type Place} from './simulation';
import {Conversation} from './Conversation';import {bondLabel,eventText} from './conversations';
import {CharacterEditor} from './CharacterEditor';import {normalizeAvatar,type AvatarProfile} from './avatar';
import React,{useEffect,useRef,useState}from'react';import{createRoot}from'react-dom/client';import Phaser from'phaser';import{Eye,Footprints,Pause,Play,Sun,Moon,CloudSun,CloudRain,CloudFog,Maximize,Minimize,MapPin,Camera,Star,BookOpen,ArrowUpRight,Compass,ChevronRight,MessageCircle,Leaf,Sparkles,Telescope,Volume2,VolumeX,UserRound,Check,ChevronUp,ChevronDown,ChevronLeft}from'lucide-react';import{Island,nearbyBench,type Bridge}from'./Island';import{advance,restore,serialize,toggleFavoriteEntry,SAVE_KEY,profiles,timeLabel,type PersonId}from'./simulation';import {t,readLanguage,LANGUAGE_KEY,type Language} from './i18n';import './style.css';
const placeLabels: Record<Place,string> = {
 praca:'Praça', horta:'Horta comunitária', floresta:'Floresta', lago:'Lago',
 cais:'Cais', farol:'Farol', mira:'Casa da Mira', theo:'Oficina do Theo', luma:'Casa da Luma',
};
const walkingDestinations = ['praca','horta','floresta','lago','cais','farol','theo'] as const satisfies readonly Place[];
type WalkingDestination = (typeof walkingDestinations)[number];

const journalResidents = ['mira','theo','luma'] as const;
function journalSearchKey(text:string){
 return text.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
}

function App(){const[language,setLanguage]=useState<Language>(()=>{try{return readLanguage(localStorage)}catch{return 'en'}});const tr=(text:string)=>t(text,language);const[initialWorld]=useState(()=>{try{return restore(localStorage.getItem(SAVE_KEY))}catch{return restore(null)}});const world=useRef(initialWorld);const[,render]=useState(0);const[mode,setMode]=useState<'observer'|'inhabitant'>('observer');const[selected,select]=useState<PersonId|null>('mira');const[paused,pause]=useState(false);const[walkingDestination,setWalkingDestination]=useState<WalkingDestination>("praca");const[showResidentRoute,setShowResidentRoute]=useState(false);const[wideMap,setWideMap]=useState(()=>{try{return localStorage.getItem('little-minds:expanded-map')==='true'}catch{return false}});const[speed,speedSet]=useState(1);const[tab,setTab]=useState('life');const[journalQuery,setJournalQuery]=useState('');const[journalResident,setJournalResident]=useState<PersonId|''>('');const[saved,setSaved]=useState(true);const[sound,setSound]=useState(false);
 const[ambientVolume,setAmbientVolume]=useState(()=>{
  try{
   const stored=localStorage.getItem('little-minds:ambient-volume');
   if(stored!==null&&Number.isFinite(Number(stored)))return Math.max(0,Math.min(100,Number(stored)));
  }catch{}
  return 100;
 });const[arrival,setArrival]=useState<{label:string}|null>(null);const[notice,setNotice]=useState('');const[workshopOpen,setWorkshopOpen]=useState(false);const[editorOpen,setEditorOpen]=useState(false);const[conversation,setConversation]=useState<PersonId|null>(null);const host=useRef<HTMLDivElement>(null);const[albumOpen,setAlbumOpen]=useState(false);const[photos,setPhotos]=useState(()=>loadAlbum(localStorage));const album=useRef(photos);const gameRef=useRef<Phaser.Game|null>(null);const audio=useRef<AudioContext|null>(null);const ambientAudio=useRef<ReturnType<typeof createAmbientAudio>|null>(null);const bridge=useRef<Bridge>({world:world.current,mode,selected,showResidentRoute,paused,speed,language,inputEnabled:!workshopOpen&&!editorOpen&&!conversation,navigationRequest:null,sitting:false,walkingLabel:null,onArrival:label=>setArrival({label}),cancelNavigation:false,walkingAutomatically:false,direction:{x:0,y:0},onSelect:select,onInteract:()=>{}});
 function persist(){try{localStorage.setItem(SAVE_KEY,serialize(world.current));setSaved(true)}catch{setSaved(false)}}
 function updateAlbum(next:IslandPhoto[]){
  try{
   saveAlbum(localStorage,next);
   album.current=next;
   setPhotos(next);
  }catch{setNotice('Não foi possível guardar no álbum.');}
 }
 function takePhoto(){
  const renderer=gameRef.current?.renderer;
  if(!renderer)return;
  const {day,minute}=world.current;
  const time=timeLabel(minute).replace(':','');
  renderer.snapshot(photo=>{
   if(!(photo instanceof HTMLImageElement)){
    setNotice('Não foi possível tirar a fotografia.');
    return;
   }
   const download=document.createElement('a');
   download.href=photo.src;
   const weather=weatherAt(day,minute);
   if(album.current.length<ALBUM_LIMIT){
    updateAlbum([{id:crypto.randomUUID(),src:photo.src,day,minute,weather},...album.current]);
   }else setNotice('O álbum está cheio. A fotografia foi descarregada.');
   download.download=`aurora-day-${day}-${time}-${weatherAt(day,minute)}.png`;
   document.body.append(download);
   download.click();
   download.remove();
  },'image/png');
 }
 function interact(target?:PersonId){if(editorOpen||conversation)return;const w=world.current;const nearest=target?w.residents.find(r=>r.id===target)!:[...w.residents].sort((a,b)=>Math.hypot(a.x-w.player.x,a.y-w.player.y)-Math.hypot(b.x-w.player.x,b.y-w.player.y))[0];if(Math.hypot(nearest.x-w.player.x,nearest.y-w.player.y)>70){setNotice('Aproxima-te de um habitante para conversar.');return;}select(nearest.id);setNotice('');bridge.current.direction={x:0,y:0};setConversation(nearest.id);}
 Object.assign(bridge.current,{mode,selected,showResidentRoute,paused:paused||workshopOpen||editorOpen||conversation!==null,speed,language,inputEnabled:!workshopOpen&&!editorOpen&&!conversation,onInteract:()=>interact()});
 useEffect(()=>{
  try{localStorage.setItem('little-minds:expanded-map',String(wideMap))}catch{}
 },[wideMap]);
 useEffect(()=>{document.documentElement.lang=language;document.title=language==='en'?'Little Minds · Aurora Island':'Little Minds · Ilha Aurora';try{localStorage.setItem(LANGUAGE_KEY,language)}catch{}},[language]);
 useEffect(()=>{const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,width:960,height:600,pixelArt:true,antialias:false,backgroundColor:'#284a58',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[new Island(bridge.current)],audio:{noAudio:true}});gameRef.current=game;const resize=new ResizeObserver(()=>game.scale.refresh());resize.observe(host.current!);let last=performance.now();const timer=setInterval(()=>{const now=performance.now(),delta=Math.min((now-last)/1000,2);last=now;if(!bridge.current.paused){const minutes=delta*2*bridge.current.speed;advance(world.current,minutes);if(tickActivity(world.current,minutes)){try{localStorage.setItem(SAVE_KEY,serialize(world.current));setSaved(true)}catch{setSaved(false)}}}render(n=>n+1)},300);const save=()=>{try{localStorage.setItem(SAVE_KEY,serialize(world.current));setSaved(true)}catch{setSaved(false)}};const autosave=setInterval(save,3000);window.addEventListener('beforeunload',save);return()=>{gameRef.current=null;resize.disconnect();clearInterval(timer);clearInterval(autosave);window.removeEventListener('beforeunload',save);save();game.destroy(true);audio.current?.close();}},[]);
 useEffect(()=>{
  if(!arrival)return;
  const timeout=setTimeout(()=>setArrival(null),3000);
  return()=>clearTimeout(timeout);
 },[arrival]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),8000);return()=>clearTimeout(t)},[notice]);
 useEffect(()=>{
  try{localStorage.setItem('little-minds:ambient-volume',String(ambientVolume))}catch{}
  const gain=ambientAudio.current?.master;
  if(gain&&audio.current)gain.setTargetAtTime(.18*ambientVolume/100,audio.current.currentTime,.04);
 },[ambientVolume]);
 const mix=ambientMix(world.current.day,world.current.minute);
 useEffect(()=>{
  const tracks=ambientAudio.current;
  if(!tracks||!audio.current||!sound)return;
  tracks.sea.setTargetAtTime(mix.sea,audio.current.currentTime,.25);
  tracks.rain.setTargetAtTime(mix.rain,audio.current.currentTime,.25);
 },[mix.sea,mix.rain,sound]);
 async function toggleSound(){
  if(sound){await audio.current?.suspend();setSound(false);return;}
  if(!audio.current){
   const context=new AudioContext();
   const tracks=createAmbientAudio(context);
   tracks.master.value=.18*ambientVolume/100;
   tracks.sea.value=mix.sea;
   tracks.rain.value=mix.rain;
   audio.current=context;
   ambientAudio.current=tracks;
  }
  await audio.current.resume();
  setSound(true);
 }
 const w=world.current,h=w.minute/60,night=h<6||h>=20;const r=w.residents.find(r=>r.id===selected);const profile=selected?profiles[selected]:null;const query=journalSearchKey(journalQuery.trim());
 const favorites=w.favoriteEntries??[];
 const favoriteIds=new Set(favorites.map(entry=>entry.id));
 const entries=(tab==='favorites'?favorites:w.events).filter(entry=>{
  if(tab==='social'&&entry.kind==='life')return false;
  if(journalResident&&entry.person!==journalResident&&
    !entry.residentTalk?.pair.split('-').includes(journalResident)&&
    !(entry.kind==='social'&&entry.text.includes(profiles[journalResident].name)))return false;
  return !query||journalSearchKey(eventText(entry,language)).includes(query);
 });
 const nearWorkshop=Math.hypot(w.player.x-places.theo.x,w.player.y-places.theo.y)<=35;
 function enterWorkshop(){
  if(mode!=='inhabitant'||!bridge.current.inputEnabled||
     !nearWorkshop)return;
  bridge.current.direction={x:0,y:0};
  bridge.current.cancelNavigation=true;
  bridge.current.sitting=false;
  setWorkshopOpen(true);
 }
 function toggleBench(){
  if(mode!=='inhabitant'||!bridge.current.inputEnabled)return;
  if(!bridge.current.sitting&&!nearbyBench(world.current.player))return;
  bridge.current.sitting=!bridge.current.sitting;
  if(bridge.current.sitting)bridge.current.cancelNavigation=true;
  render(n=>n+1);
 }
 function inspectLighthouse(){
  if(mode!=='inhabitant'||editorOpen||conversation||!nearLighthouse(w))return;
  if(!discoverLighthouseClue(w)){setNotice(lighthouseClue);return;}
  persist();
  setTab('social');
  setNotice('Descobriste uma inscrição no farol. Pergunta à Luma sobre a ilha.');
  render(n=>n+1);
 }
 function changeMode(next:'observer'|'inhabitant'){
  setMode(next);
  bridge.current.direction={x:0,y:0};
  if(next==='inhabitant'&&!world.current.playerProfile.name)setEditorOpen(true);
 }
 function stopWalking(){
  bridge.current.cancelNavigation=true;
 }
 function arrange(task:TaskId){if(startActivity(world.current,task)){persist();setConversation(null);setMode('inhabitant');render(n=>n+1)}}
 function saveCharacter(profile:AvatarProfile){world.current.playerProfile=normalizeAvatar(profile);try{localStorage.setItem(SAVE_KEY,serialize(world.current));setSaved(true)}catch{setSaved(false)}setEditorOpen(false);setMode('inhabitant');setNotice('A tua personagem está pronta. A ilha espera por ti!');render(n=>n+1);}
 return <div className="app"><header><a className="brand" href="#" aria-label={tr("Little Minds início")}><span className="brand-icon">✦</span><span>{tr('little minds')}<small>{tr('PEQUENAS VIDAS. GRANDES HISTÓRIAS.')}</small></span></a><div className="island-name"><span className="live-dot"/>{tr('Ilha Aurora')}<span className="tag">{tr('ALPHA 0.1')}</span></div><div className="header-settings"><button className="character-button" onClick={()=>setEditorOpen(true)} aria-label={tr('Editar personagem')}><UserRound size={16}/><span>{tr('A tua personagem')}</span></button><select className="language-select" aria-label="Language / Idioma" value={language} onChange={e=>{setLanguage(e.target.value as Language);setNotice('')}}><option value="en">English</option><option value="pt-PT">Português (PT)</option></select><button className="icon-button" onClick={toggleSound} aria-label={tr(sound?'Desligar ambiente sonoro':'Ligar ambiente sonoro')}>{sound?<Volume2 size={18}/>:<VolumeX size={18}/>}</button></div></header>
 <main><section className="intro"><div><div className="eyebrow">{tr('UM PEQUENO MUNDO VIVO')}</div><h1>{tr('A vida acontece aqui')}<span>.</span></h1><p>{tr('Sem pressa. Cada encontro pode ser o início de uma história.')}</p></div><div className="world-clock">{night?<Moon size={24}/>:<Sun size={26}/>}<div><strong>{timeLabel(w.minute)}</strong><small>{tr('Dia')} {w.day} <span>·</span> {tr(weatherAt(w.day,w.minute)!=='clear'?weatherLabels[weatherAt(w.day,w.minute)]:night?'Sob as estrelas':h>17?'Fim de tarde':'Céu tranquilo')}</small></div></div></section>
 <div className={wideMap ? "workspace wide-map" : "workspace"}><section className="world-panel"><div className="world-toolbar"><div className="mode-switch"><button className={mode==='observer'?'active':''} onClick={()=>changeMode('observer')}><Eye size={15}/>{tr('Observador')}</button><button className={mode==='inhabitant'?'active':''} onClick={()=>changeMode('inhabitant')}><Footprints size={15}/>{tr('Habitante')}</button></div><div className="simulation-controls"><button type="button" onClick={takePhoto}
  title={tr('Tirar fotografia')} aria-label={tr('Tirar fotografia')}><Camera size={15}/></button><button
   className={wideMap?'chosen':''} aria-pressed={wideMap} aria-label={tr('Mapa ampliado')}
   title={tr(wideMap?'Reduzir mapa':'Ampliar mapa')} onClick={()=>setWideMap(value=>!value)}>
   {wideMap?<Minimize size={15}/>:<Maximize size={15}/>}
 </button><button onClick={()=>pause(!paused)} aria-label={tr(paused?'Retomar':'Pausar')}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>{[1,3,10].map(n=><button key={n} className={speed===n?'chosen':''} onClick={()=>speedSet(n)}>{n}×</button>)}</div></div>
 <div className="game-wrap" tabIndex={0} role="region" aria-label={tr('Mapa interativo')}
 onKeyDown={event=>{
  if(event.target!==event.currentTarget||event.repeat||event.ctrlKey||event.metaKey||event.altKey)return;
  switch(event.key.toLowerCase()){
   case 'o': changeMode('observer'); break;
   case 'h': changeMode('inhabitant'); break;
   case 'b': toggleBench(); break;
   case 'f': inspectLighthouse(); break;
   case 'x': if(mode==='inhabitant')stopWalking(); break;
   case 'p': pause(value=>!value); break;
   case 'm': setWideMap(value=>!value); break;
   case 'c': takePhoto(); break;
   default: return;
  }
  event.preventDefault();
 }} onPointerDown={event=>{
  if(event.target instanceof HTMLCanvasElement)event.currentTarget.focus({preventScroll:true});
 }}><div ref={host} className="game"/>
 {mode==='inhabitant'&&(bridge.current.walkingLabel||arrival)&&<span className="map-walk-status" role="status">
  {bridge.current.walkingLabel
   ?tr('A caminhar para {destino}').replace('{destino}',tr(bridge.current.walkingLabel))
   :tr('Chegaste: {destino}').replace('{destino}',tr(arrival!.label))}
 </span>}<div className="map-caption"><Compass size={14}/><span>{tr('ILHA AURORA')}</span><span className="coordinates">{tr('38° N · 27° W')}</span></div><div className="map-weather">{weatherAt(w.day,w.minute)==='rain'?<CloudRain size={14}/>:weatherAt(w.day,w.minute)==='mist'?<CloudFog size={14}/>:<CloudSun size={14}/>}<span>{tr(weatherLabels[weatherAt(w.day,w.minute)])}</span></div>{notice&&<div role="status" className="speech">{tr(notice)}</div>}{mode==='inhabitant'&&<>{nearWorkshop&&<button type="button" className="talk-button inspect-map" onClick={enterWorkshop}>
  {tr('Entrar na oficina')}
 </button>}{nearLighthouse(w)&&<button className="talk-button inspect-map" onClick={inspectLighthouse}><Sparkles size={14}/>{tr(w.lighthouseClueFound?'Reler a inscrição':'Examinar as marcas')}</button>}<div className="dpad">{[['up',0,-1,ChevronUp],['left',-1,0,ChevronLeft],['down',0,1,ChevronDown],['right',1,0,ChevronRight]].map(([name,x,y,Icon])=>{const I=Icon as typeof ChevronUp;return <button key={String(name)} className={String(name)} aria-label={tr(`Mover ${name}`)} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);bridge.current.direction={x:Number(x),y:Number(y)}}} onPointerUp={()=>bridge.current.direction={x:0,y:0}} onPointerCancel={()=>bridge.current.direction={x:0,y:0}}><I size={18}/></button>})}</div><button className="talk-button" onClick={()=>interact()}><MessageCircle size={16}/>{tr('Conversar')}</button></>}</div>
 {mode==='observer'&&r&&profile&&<div className="map-tracking">
  <MapPin size={15} aria-hidden="true"/>
  <div className="map-tracking-text">
   <strong>{profile.name}</strong>
   <span>{tr(Math.hypot(r.x-places[r.target].x,r.y-places[r.target].y)<=12?'Local':'A caminho de')}: {tr(placeLabels[r.target])}</span>
  </div>
  <span className="map-tracking-activity">{tr(r.activity)}</span>
  <button className="resident-route-toggle" type="button" aria-pressed={showResidentRoute}
   onClick={()=>setShowResidentRoute(value=>!value)}>
   <Footprints size={14} aria-hidden="true"/>{tr(showResidentRoute?'Ocultar percurso':'Mostrar percurso')}
  </button>
 </div>}
 <div className="map-footer"><span><span className="live-dot"/>{tr(paused?'Simulação em pausa':'O mundo segue o seu ritmo')}</span><span>{tr(mode==='observer'?'Seleciona um habitante para o conhecer':'WASD / setas · E conversar · toca para caminhar')}</span></div>
 {mode==='inhabitant'&&<form className="map-tracking map-walk" onSubmit={event=>{
  event.preventDefault();
  if(bridge.current.inputEnabled){
   bridge.current.navigationRequest={target:places[walkingDestination],label:placeLabels[walkingDestination]};
  }
 }}>
  <label htmlFor="walking-destination">{tr('Destino a pé')}</label>
  <select id="walking-destination" className="language-select" value={walkingDestination}
   onKeyDown={event=>event.stopPropagation()}
   onChange={event=>{
    const destination=walkingDestinations.find(place=>place===event.currentTarget.value);
    if(destination)setWalkingDestination(destination);
   }}>
   {walkingDestinations.map(place=><option key={place} value={place}>{tr(placeLabels[place])}</option>)}
  </select>
  <button className="resident-route-toggle" type="submit"><Footprints size={14} aria-hidden="true"/>{tr('Caminhar até lá')}</button>
  {bridge.current.walkingAutomatically&&<button className="resident-route-toggle" type="button"
   onClick={stopWalking}>
   {tr('Parar caminhada')}
  </button>}
 </form>}
 {mode==='inhabitant'&&(bridge.current.sitting||nearbyBench(w.player))&&<div className="map-tracking">
  <button type="button" className="resident-route-toggle" onClick={toggleBench}>{tr(bridge.current.sitting?'Levantar':'Sentar no banco')}</button>
 </div>}
 <details className="keyboard-guide">
  <summary>{tr('Controlos de teclado')}</summary>
  <p>{tr('Clica no mapa ou seleciona-o com Tab para usar os atalhos.')}</p>
  <dl>
   <div><dt><kbd>WASD</kbd> / <kbd>↑ ↓ ← →</kbd></dt><dd>{tr('Mover no modo Habitante')}</dd></div>
   <div><dt><kbd>E</kbd></dt><dd>{tr('Conversar no modo Habitante')}</dd></div>
   <div><dt><kbd>O</kbd></dt><dd>{tr('Observador')}</dd></div>
   <div><dt><kbd>H</kbd></dt><dd>{tr('Habitante')}</dd></div>
   <div><dt><kbd>B</kbd></dt><dd>{tr('Sentar ou levantar junto a um banco')}</dd></div>
   <div><dt><kbd>F</kbd></dt><dd>{tr('Examinar as marcas junto ao farol')}</dd></div>
   <div><dt><kbd>X</kbd></dt><dd>{tr('Parar caminhada')}</dd></div>
   <div><dt><kbd>P</kbd></dt><dd>{tr('Pausar ou retomar')}</dd></div>
   <div><dt><kbd>M</kbd></dt><dd>{tr('Ampliar ou reduzir o mapa')}</dd></div>
   <div><dt><kbd>C</kbd></dt><dd>{tr('Tirar fotografia')}</dd></div>
  </dl>
 </details>
 <details className="keyboard-guide">
  <summary>{tr('Definições de áudio')}</summary>
  <label className="ambient-volume">
   <span>{tr('Volume do som ambiente')}</span>
   <input type="range" min="0" max="100" value={ambientVolume}
    onKeyDown={event=>event.stopPropagation()}
    onChange={event=>setAmbientVolume(event.currentTarget.valueAsNumber)}/>
   <span aria-hidden="true">{ambientVolume}%</span>
  </label>
 </details>
 <section className="map-album">
  <button type="button" className="resident-route-toggle" aria-expanded={albumOpen}
   aria-controls="aurora-album" onClick={()=>setAlbumOpen(open=>!open)}>
   <Camera size={14} aria-hidden="true"/>{tr('Álbum da Aurora')} · {photos.length}/{ALBUM_LIMIT}
  </button>
  <div id="aurora-album" hidden={!albumOpen}>
   {photos.length===0&&<p>{tr('Usa a câmara para guardar a tua primeira fotografia.')}</p>}
   <div className="album-grid">
    {photos.map(photo=><figure key={photo.id}>
     <img src={photo.src} alt={tr('Fotografia da ilha')} loading="lazy"/>
     <figcaption>{tr('Dia')} {photo.day} · {timeLabel(photo.minute)} · {tr(weatherLabels[photo.weather])}</figcaption>
     <button type="button" className="resident-route-toggle"
      onClick={()=>updateAlbum(album.current.filter(item=>item.id!==photo.id))}>
      {tr('Retirar do álbum')}
     </button>
    </figure>)}
   </div>
  </div>
 </section>
 {mode==='inhabitant'&&nearWorkshop&&
  <div className="map-tracking"><button type="button" className="resident-route-toggle" onClick={enterWorkshop}>
   {tr('Entrar na oficina')}
  </button></div>}
 <ActivityPanel world={w} language={language} onGo={()=>{if(w.sharedActivity){setMode('inhabitant');bridge.current.navigationRequest={target:places[activities[w.sharedActivity.task].place],label:placeLabels[activities[w.sharedActivity.task].place]};}}} onCancel={()=>{cancelActivity(w);persist();render(n=>n+1)}}/>
 <div className="residents-heading"><h2>{tr('Os habitantes')}</h2><span>{tr('3 vidas a cruzarem-se')}</span></div><div className="resident-grid">{(Object.keys(profiles)as PersonId[]).map(id=>{const p=profiles[id],resident=w.residents.find(r=>r.id===id)!;return <button className={`resident-card ${selected===id?'selected':''}`} key={id} onClick={()=>select(id)}><span className={`portrait ${id}`}><span className="pixel-person"/></span><span className="resident-info"><strong>{p.name}<span className="status-dot"/></strong><small>{tr(p.role)}</small><span className="activity">{tr(resident.activity)}</span></span><ChevronRight size={15}/></button>})}</div>
 {mode==='inhabitant'&&<section className="shared-activity">
   <div className="shared-heading"><h3>{tr('Marcas no farol')}</h3></div>
   {nearLighthouse(w)?<div className="shared-bottom"><button onClick={inspectLighthouse}><Sparkles size={14}/>{tr(w.lighthouseClueFound?'Reler a inscrição':'Examinar as marcas')}</button></div>:<p>{tr(w.lighthouseClueFound?'Já descobriste a inscrição. Volta ao farol para a reler.':'Há marcas na pedra junto ao farol. Aproxima-te para as examinar.')}</p>}
 </section>}
 <CommunityPanel world={w} language={language}/></section><aside><section className="diary"><div className="section-title"><span><BookOpen size={18}/>{tr('Diário da ilha')}</span><span className="count">{tr('DIA')} {w.day}</span></div><p>{tr('Os pequenos momentos ficam.')}</p><div className="tabs"><button className={tab==='life'?'active':''} onClick={()=>setTab('life')}>{tr('A vida na ilha')}</button><button className={tab==='social'?'active':''} onClick={()=>setTab('social')}>{tr('Encontros')}</button><button className={tab==='favorites'?'active':''} onClick={()=>setTab('favorites')}>{tr('Favoritos')}</button></div><div className="journal-filters" onKeyDown={event=>event.stopPropagation()}>
  <input type="search" aria-label={tr('Pesquisar no diário')} placeholder={tr('Pesquisar no diário')}
   value={journalQuery} onChange={event=>setJournalQuery(event.currentTarget.value)}/>
  <select aria-label={tr('Filtrar por habitante')} value={journalResident}
   onChange={event=>{const value=event.currentTarget.value;setJournalResident(journalResidents.find(id=>id===value)??'')}}>
   <option value="">{tr('Todos os habitantes')}</option>
   {journalResidents.map(id=><option value={id} key={id}>{profiles[id].name}</option>)}
  </select>
 </div><div className="entries">{entries.map(e=><article key={e.id}><div className={`event-dot ${e.person||''}`}/><div><time>{tr('DIA')} {e.day} <span>·</span> {timeLabel(e.minute)}</time><p>{eventText(e,language)}</p>{e.kind==='social'&&<span className="event-tag">{tr('Uma ligação cresce')}</span>}</div><button type="button" className="journal-star" aria-label={tr('Marcar como favorito')} aria-pressed={favoriteIds.has(e.id)}
  onClick={()=>{toggleFavoriteEntry(w,e);persist();render(n=>n+1)}}>
  <Star size={14} fill={favoriteIds.has(e.id)?'currentColor':'none'} aria-hidden="true"/>
 </button></article>)}{entries.length===0&&<div className="empty">{tr(query||journalResident?'Nenhum registo corresponde à pesquisa.':tab==='favorites'?'Carrega na estrela de um registo para o guardar.':'As histórias nascem dos encontros.')}</div>}</div><div className="diary-bottom"><span className="live-dot"/>{tr('Escrito pela vida, em tempo real')}</div></section>
 {profile&&r&&<section className="profile"><div className="profile-top"><span className={`portrait small ${selected}`}><span className="pixel-person"/></span><div><h3>{profile.name}</h3><span>{tr(profile.role)}</span></div>{selected==='mira'?<Leaf size={19}/>:selected==='theo'?<Sparkles size={19}/>:<Telescope size={19}/>}</div><p className="quote">“{tr(profile.quote)}”</p><div className="traits">{tr(profile.traits)}</div><div className="energy-label"><span>{tr('Energia')}</span><span>{Math.round(r.energy)}%</span></div><div className="energy"><i style={{width:`${r.energy}%`,background:profile.color}}/></div><div className="relationships">{w.residents.filter(other=>other.id!==selected).map(other=><span key={other.id}>{profiles[other.id].name}<b>{w.relationships[[selected!,other.id].sort().join('-')]||20}<small>/100</small></b></span>)}</div><div className="player-bond"><div className="bond-heading"><span>{tr('Laço contigo')}</span><strong>{tr(bondLabel(w.playerBonds[selected!].affinity))} · {w.playerBonds[selected!].affinity}/100</strong></div><div className="energy"><i style={{width:`${w.playerBonds[selected!].affinity}%`,background:profile.color}}/></div></div>{mode==='inhabitant'&&<button className="profile-action" onClick={()=>{bridge.current.navigationRequest={target:r.id,label:profile.name}}}>
  {tr('Caminhar até ao habitante')}<Footprints size={14} aria-hidden="true"/>
 </button>}{mode==='inhabitant'&&<button className="profile-action" onClick={()=>interact(selected!)}>{tr('Conversar por perto')}<ArrowUpRight size={14}/></button>}</section>}
 </aside></div><footer><span>✦ <b>{tr('Little Minds')}</b> <span>{tr('Um lugar para simplesmente existir.')}</span></span><span className={saved?'save':'save failed'}><Check size={12}/>{tr(saved?'Progresso guardado neste dispositivo':'Não foi possível guardar neste navegador')}</span></footer></main>{workshopOpen&&<Workshop language={language} onClose={()=>setWorkshopOpen(false)}/>}{editorOpen&&<CharacterEditor profile={w.playerProfile} language={language} onSave={saveCharacter} onClose={()=>setEditorOpen(false)}/>}{conversation&&<Conversation world={w} id={conversation} language={language} onClose={()=>setConversation(null)} onActivity={arrange} onChange={()=>{persist();render(n=>n+1)}}/>}</div>
}
createRoot(document.getElementById('root')!).render(<App/>);
