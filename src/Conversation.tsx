import{storyText}from './stories';
import {activities,taskForResident,type TaskId} from './activityState';import {activityReason} from './activities';
import {ChevronRight} from 'lucide-react';
import{useEffect,useRef,useState}from'react';
import{profiles,timeLabel,type PersonId,type World}from'./simulation';
import{bondLabel,greeting,replyText,talk}from'./conversations';
import{t,type Language}from'./i18n';
import type{Topic}from'./socialState';
export function Conversation({world,id,language,onClose,onChange,onActivity}:{world:World;id:PersonId;language:Language;onClose:()=>void;onChange:()=>void;onActivity:(task:TaskId)=>void}){
 const task=taskForResident[id],offer=activities[task],story=storyText(task,world.community[task],language),unavailable=activityReason(world,task);
 const dialog=useRef<HTMLDialogElement>(null),tr=(s:string)=>t(s,language),person=profiles[id];
 const [welcome]=useState(()=>greeting(world,id,language));
 const [answer,setAnswer]=useState<{reply:string;gain:number}|null>(null);
 const [chosen,setChosen]=useState<Topic|null>(null);const bond=world.playerBonds[id];const topicNames:Record<Topic,string>={day:'o seu dia',island:'a ilha',company:'companhia'};
 useEffect(()=>{const el=dialog.current!;el.showModal();return()=>el.close()},[]);
 function choose(topic:Topic){const result=talk(world,id,topic);if(!result){onClose();return;}setChosen(topic);setAnswer(result);onChange();}
 return <dialog ref={dialog} className="character-dialog conversation-dialog" aria-labelledby="conversation-title" onCancel={e=>{e.preventDefault();onClose()}}>
 <div className="conversation-person"><span className={`portrait ${id}`}><span className="pixel-person"/></span><div><div className="eyebrow">{tr('UM ENCONTRO NA ILHA')}</div><h2 id="conversation-title">{person.name}</h2><small>{tr(person.role)}</small></div></div>
 <div className="conversation-greeting">{world.playerProfile.name&&<strong>{world.playerProfile.name}, </strong>}{welcome}</div>
 <div className="dialogue-response" role="status" aria-live="polite">{answer?<><span>{person.name}</span><p>“{replyText(answer.reply,language)}”</p></>:<p>{tr('O que gostavas de dizer?')}</p>}</div>
 <div className="conversation-options">{([['day','Como está a correr o teu dia?'],['island','Conta-me algo sobre a ilha.'],['company','Posso fazer-te companhia?']]as[Topic,string][]).map(([topic,text])=><button key={topic} className={chosen===topic?'chosen':''} onClick={()=>choose(topic)} aria-pressed={chosen===topic}><span>{tr(text)}</span><ChevronRight size={14} aria-hidden="true"/></button>)}</div>
 <div className="bond-heading"><span>{tr('Laço contigo')}</span><strong>{tr(bondLabel(bond.affinity))} · {bond.affinity}/100</strong></div><div className="energy"><i style={{width:`${bond.affinity}%`,background:person.color}}/></div>
 {answer&&<p className="bond-note">{answer.gain>0?tr('Um pequeno laço cresceu.'):tr('A amizade cresce com tempo, não com pressa.')}</p>}
 {bond.memories[0]&&<p className="conversation-memory">{tr('Último encontro')}: {tr('Dia')} {bond.memories[0].day} · {timeLabel(bond.memories[0].minute)} · {tr(topicNames[bond.memories[0].topic])}</p>}
 <section className="activity-offer"><span className="eyebrow">{tr('UM MOMENTO JUNTOS')}</span><h3>{story.done<3?story.chapter:tr(offer.title)}</h3><p>{story.done<3?story.invitation:tr(offer.description)}</p><small>{story.title} · {story.done}/3 {tr('encontros')}</small><button disabled={unavailable!==null} onClick={()=>onActivity(task)}>{tr('Combinar atividade')} <ChevronRight size={14}/></button>{unavailable&&<small>{tr(unavailable)}</small>}</section>
 <div className="editor-actions"><button className="editor-save" onClick={onClose}>{tr('Até já')}</button></div>
 </dialog>;
}
