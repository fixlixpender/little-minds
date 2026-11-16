import{activities,taskForResident,type TaskId,type ActivityPhase}from './activityState';
import{localDecisions,log,places,profiles,type World}from './simulation';
import{t,type Language}from './i18n';
export function activityReason(world:World,task:TaskId):string|null{
 if(world.sharedActivity)return 'Já tens uma atividade combinada.';
 if(world.community.lastCompletedDay[task]===world.day)return 'Já partilharam este momento hoje. Volta amanhã.';
 const a=activities[task],h=world.minute/60;
 if(a.from<a.until?(h<a.from||h>=a.until):(h<a.from&&h>=a.until))return task==='stars'?'Podem observar o céu entre as 19:00 e as 05:00.':'Esta atividade está disponível durante o dia.';
 return null;
}
export function activityEventText(task:TaskId,phase:ActivityPhase,language:Language):string{
 const a=activities[task],name=profiles[a.resident].name,title=t(a.title,language).toLowerCase();
 const messages:Record<ActivityPhase,[string,string]>={
 started:[`Combinaste ${title} com ${name}.`,`You arranged to ${title} with ${name}.`],
 completed:[task==='garden'?'A horta ganhou novas flores. A Mira guarda este momento contigo.':task==='boat'?'O barco flutuou! O Theo deixa a sua invenção navegar junto ao cais.':'Uma nova constelação ficou no caderno da Luma. O céu parece agora mais próximo.',task==='garden'?'New flowers brighten the garden. Mira will remember this moment with you.':task==='boat'?'The boat floated! Theo lets his invention sail beside the pier.':'A new constellation fills Luma’s notebook. The sky feels a little closer now.'],
 cancelled:[`Cancelaste a atividade com ${name}. Podem combinar outro momento.`,`You cancelled your activity with ${name}. You can arrange another time.`],
 expired:[`${name} voltou à sua rotina. Podem combinar a atividade noutra altura.`,`${name} returned to their routine. You can arrange the activity another time.`],
 };
 return messages[phase][language==='en'?1:0];
}
function record(world:World,task:TaskId,phase:ActivityPhase){log(world,activityEventText(task,phase,'pt-PT'),activities[task].resident,'discovery');world.events[0].shared={task,phase};}
function release(world:World,task:TaskId){const resident=world.residents.find(r=>r.id===activities[task].resident)!;Object.assign(resident,localDecisions.decide(resident,world));}
export function startActivity(world:World,task:TaskId):boolean{
 if(activityReason(world,task))return false;
 const a=activities[task],resident=world.residents.find(r=>r.id===a.resident)!;
 if(Math.hypot(resident.x-world.player.x,resident.y-world.player.y)>70)return false;
 world.sharedActivity={task,startedAt:world.day*1440+world.minute,progress:0};
 resident.target=a.place;resident.activity=a.activity;record(world,task,'started');return true;
}
export function cancelActivity(world:World):void{
 if(!world.sharedActivity)return;const task=world.sharedActivity.task;world.sharedActivity=null;release(world,task);record(world,task,'cancelled');
}
export function activityStage(world:World):'walking'|'waiting'|'together'|null{
 const current=world.sharedActivity;if(!current)return null;
 const a=activities[current.task],destination=places[a.place],resident=world.residents.find(r=>r.id===a.resident)!;
 if(Math.hypot(world.player.x-destination.x,world.player.y-destination.y)>48)return 'walking';
 if(Math.hypot(resident.x-destination.x,resident.y-destination.y)>24)return 'waiting';
 return 'together';
}
// This clock is measured in game minutes and called only while the world runs.
export function tickActivity(world:World,minutes:number):boolean{
 const current=world.sharedActivity;if(!current)return false;
 const now=world.day*1440+world.minute;
 if(now-current.startedAt>=180){const task=current.task;world.sharedActivity=null;release(world,task);record(world,task,'expired');return true;}
 if(activityStage(world)!=='together')return false;
 current.progress=Math.min(activities[current.task].duration,current.progress+Math.max(0,minutes));
 if(current.progress<activities[current.task].duration)return false;
 const task=current.task,a=activities[task],bond=world.playerBonds[a.resident];
 world.community[task]=Math.min(9999,world.community[task]+1);world.community.lastCompletedDay[task]=world.day;
 bond.affinity=Math.min(100,bond.affinity+4);bond.talkCount++;bond.lastTalkAt=now;
 world.sharedActivity=null;record(world,task,'completed');release(world,task);return true;
}
export function activityMemory(world:World,resident:keyof typeof taskForResident,language:Language):string|null{
 const task=taskForResident[resident];if(world.community[task]===0)return null;
 const memories:Record<TaskId,[string,string]>={garden:['Gostei de cuidar das sementes contigo. Já viste as flores novas?','I enjoyed tending the seedlings with you. Have you seen the new flowers?'],boat:['Ainda estou a pensar no nosso teste do barco. Afinal, flutua mesmo!','I’m still thinking about our boat test. It really does float!'],stars:['Guardei no caderno a constelação que desenhámos. O céu sabe melhor com companhia.','I kept our constellation in my notebook. The sky is better with company.']};
 return memories[task][language==='en'?1:0];
}
