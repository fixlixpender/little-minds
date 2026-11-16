import{storyText}from './stories';
import {Leaf,Sailboat,Telescope,MapPin,X} from 'lucide-react';
import{activities,type TaskId}from './activityState';
import{activityStage}from './activities';
import{profiles,type World}from './simulation';
import{t,type Language}from './i18n';
export function ActivityPanel({world,language,onGo,onCancel}:{world:World;language:Language;onGo:()=>void;onCancel:()=>void}){
 const current=world.sharedActivity;if(!current)return null;
 const a=activities[current.task],tr=(s:string)=>t(s,language),stage=activityStage(world),story=storyText(current.task,world.community[current.task],language);
 const labels={walking:'Vai até ao local combinado.',waiting:'O habitante está a caminho. Espera um bocadinho.',together:'Estão a partilhar este momento. Fica por perto.'};
 return <section className="shared-activity" aria-label={tr('Atividade em curso')}><div className="shared-heading"><div><span className="eyebrow">{tr('UM MOMENTO JUNTOS')} · {profiles[a.resident].name}</span><h3>{story.done<3?story.chapter:tr(a.title)}</h3></div><button onClick={onCancel} aria-label={tr('Cancelar atividade')} title={tr('Cancelar atividade')}><X size={16}/></button></div><p role="status">{tr(labels[stage!])}</p><div className="shared-bottom"><div className="activity-progress" role="progressbar" aria-label={tr('Progresso da atividade')} aria-valuenow={Math.floor(current.progress/a.duration*100)} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${current.progress/a.duration*100}%`}}/></div><span>{Math.floor(current.progress/a.duration*100)}%</span><button onClick={onGo}><MapPin size={13}/>{tr('Ir para o local')}</button></div><small>{tr('Têm três horas da ilha para se encontrarem. Podes cancelar sem perder amizade.')}</small></section>;
}
export function CommunityPanel({world,language}:{world:World;language:Language}){
 const tr=(s:string)=>t(s,language),icons={garden:Leaf,boat:Sailboat,stars:Telescope};
 const labels={garden:'Cuidados com a horta',boat:'Testes do barco',stars:'Mapas do céu'};
 return <section className="community"><div className="residents-heading"><h2>{tr('A ilha que construímos')}</h2><span>{tr('Os teus pequenos gestos ficam.')}</span></div><div className="community-grid">{(Object.keys(activities)as TaskId[]).map(id=>{const Icon=icons[id];return <div className="community-card" key={id}><Icon size={18}/><strong>{world.community[id]}</strong><span>{tr(labels[id])}</span><StoryCard task={id} count={world.community[id]} language={language}/></div>})}</div><p>{tr('Aproxima-te de um habitante e conversa para combinar uma atividade.')}</p></section>;
}

function StoryCard({task,count,language}:{task:TaskId;count:number;language:Language}){
 const story=storyText(task,count,language),tr=(s:string)=>t(s,language);
 return <div className="story-card"><h3>{story.title}</h3><span className="story-progress">{story.done}/3 · {tr(story.done===3?'História concluída':'História em curso')}</span><ol>{story.chapters.map((title,index)=><li key={title} className={index<story.done?'done':index===story.done?'next':''}><span aria-hidden="true">{index<story.done?'✓':index+1}</span>{title}{index===story.done&&<small>{tr('Próximo encontro')}</small>}</li>)}</ol>{story.outcome&&<p>{story.outcome}</p>}<small>{tr(story.done===3?'Podem continuar a partilhar esta atividade.':'Cada encontro concluído num novo dia faz a história avançar.')}</small></div>;
}
