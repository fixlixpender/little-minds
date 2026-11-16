import {places,type PersonId,type Point,type World} from './simulation';
export type Facing='front'|'back'|'left'|'right';
export type ActorCue='rest'|'company'|'garden'|'invent'|'stars'|null;
export function facingFromMovement(previous:Point,current:Point,fallback:Facing):Facing{
 const dx=current.x-previous.x,dy=current.y-previous.y;
 if(Math.hypot(dx,dy)<.01)return fallback;
 return Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'back':'front';
}
export function actorCue(world:World,id:PersonId,playerVisible=true):ActorCue{
 const r=world.residents.find(r=>r.id===id);if(!r)return null;
 if(world.sharedActivity&&({garden:'mira',boat:'theo',stars:'luma'}as const)[world.sharedActivity.task]===id)return 'company';
 if(r.activity==='A descansar em casa')return 'rest';
 if(r.activity==='A conversar na praça'&&world.residents.some(other=>other.id!==id&&Math.hypot(other.x-r.x,other.y-r.y)<35))return 'company';
 if(playerVisible&&Math.hypot(r.x-world.player.x,r.y-world.player.y)<45&&world.playerBonds[id].affinity>=9)return 'company';
 const work=places[id==='mira'?'horta':id==='theo'?'theo':'farol'];
 if(Math.hypot(r.x-work.x,r.y-work.y)>35)return null;
 return id==='mira'?'garden':id==='theo'?'invent':'stars';
}
