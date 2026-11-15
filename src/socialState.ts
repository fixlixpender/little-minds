import type {PersonId} from './simulation';
export type Topic='day'|'island'|'company';
export type ConversationMemory={topic:Topic;reply:string;day:number;minute:number};
export type PlayerBond={affinity:number;talkCount:number;lastTalkAt:number|null;lastRewardAt:number|null;memories:ConversationMemory[]};
export type PlayerBonds=Record<PersonId,PlayerBond>;
const fresh=():PlayerBond=>({affinity:0,talkCount:0,lastTalkAt:null,lastRewardAt:null,memories:[]});
export function createBonds():PlayerBonds{return{mira:fresh(),theo:fresh(),luma:fresh()};}
export function normalizeBonds(value:unknown):PlayerBonds{
 const result=createBonds();if(!value||typeof value!=='object')return result;
 for(const id of ['mira','theo','luma'] as PersonId[]){const source=(value as Record<string,unknown>)[id];if(!source||typeof source!=='object')continue;const p=source as Partial<PlayerBond>,bond=result[id];
 bond.affinity=typeof p.affinity==='number'&&Number.isFinite(p.affinity)?Math.min(100,Math.max(0,Math.floor(p.affinity))):0;
 bond.talkCount=typeof p.talkCount==='number'&&Number.isFinite(p.talkCount)?Math.max(0,Math.floor(p.talkCount)):0;
 for(const field of ['lastTalkAt','lastRewardAt'] as const){const timestamp=p[field];bond[field]=typeof timestamp==='number'&&Number.isFinite(timestamp)&&timestamp>=0?timestamp:null;}
 bond.memories=Array.isArray(p.memories)?p.memories.filter(m=>m&&['day','island','company'].includes(m.topic)&&typeof m.reply==='string'&&m.reply.length<100&&Number.isInteger(m.day)&&m.day>0&&Number.isFinite(m.minute)&&m.minute>=0&&m.minute<1440).slice(0,6):[];
 }
 return result;
}
