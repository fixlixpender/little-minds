import type {PersonId,Place} from './simulation';
export type TaskId='garden'|'boat'|'stars';
export const activities:Record<TaskId,{resident:PersonId;place:Place;title:string;description:string;activity:string;duration:number;from:number;until:number}>={
 garden:{resident:'mira',place:'horta',title:'Cuidar da horta',description:'Rega as sementes com a Mira. Fiquem juntos junto aos canteiros durante alguns instantes.',activity:'A cuidar da horta contigo',duration:10,from:6,until:19},
 boat:{resident:'theo',place:'cais',title:'Testar o pequeno barco',description:'Junta-te ao Theo no cais e ajuda-o a testar a sua invenção. Desta vez, talvez flutue mais tempo.',activity:'A testar o barco contigo',duration:10,from:6,until:20},
 stars:{resident:'luma',place:'farol',title:'Desenhar uma constelação',description:'Encontra-te com a Luma junto ao farol e observa as estrelas. Há um céu inteiro para descobrir.',activity:'A observar o céu contigo',duration:10,from:19,until:5},
};
export const taskForResident:Record<PersonId,TaskId>={mira:'garden',theo:'boat',luma:'stars'};
export type SharedActivity={task:TaskId;startedAt:number;progress:number};
export type Community={garden:number;boat:number;stars:number;lastCompletedDay:Partial<Record<TaskId,number>>};
export type ActivityPhase='started'|'completed'|'cancelled'|'expired';
export const freshCommunity=():Community=>({garden:0,boat:0,stars:0,lastCompletedDay:{}});
export function normalizeCommunity(value:unknown):Community{
 const result=freshCommunity();if(!value||typeof value!=='object')return result;
 const p=value as Partial<Community>;
 for(const id of Object.keys(activities)as TaskId[]){const count=p[id];if(typeof count==='number'&&Number.isFinite(count))result[id]=Math.max(0,Math.min(9999,Math.floor(count)));const day=p.lastCompletedDay?.[id];if(typeof day==='number'&&Number.isInteger(day)&&day>0)result.lastCompletedDay[id]=day;}
 return result;
}
export function normalizeActivity(value:unknown):SharedActivity|null{
 if(!value||typeof value!=='object')return null;
 const p=value as SharedActivity;
 if(!Object.hasOwn(activities,p.task)||!Number.isFinite(p.startedAt)||p.startedAt<0||!Number.isFinite(p.progress)||p.progress<0||p.progress>=activities[p.task].duration)return null;
 return{task:p.task,startedAt:p.startedAt,progress:p.progress};
}
