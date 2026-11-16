import{describe,it,expect}from'vitest';
import{actorCue,facingFromMovement}from'./actorVisual';
import{createWorld,places}from'./simulation';
describe('actor visual state',()=>{
 it('faces movement along the dominant axis and keeps direction while standing',()=>{const p={x:10,y:10};expect(facingFromMovement(p,{x:14,y:11},'front')).toBe('right');expect(facingFromMovement(p,{x:6,y:11},'front')).toBe('left');expect(facingFromMovement(p,{x:11,y:5},'front')).toBe('back');expect(facingFromMovement(p,{x:11,y:15},'back')).toBe('front');expect(facingFromMovement(p,p,'left')).toBe('left')});
 it('shows rest and gives a shared activity priority',()=>{const w=createWorld();w.residents[0].activity='A descansar em casa';expect(actorCue(w,'mira')).toBe('rest');w.sharedActivity={task:'garden',startedAt:0,progress:0};expect(actorCue(w,'mira')).toBe('company');expect(actorCue(w,'theo')).not.toBe('company')});
 it('shows company for nearby friends and social routines',()=>{const w=createWorld();Object.assign(w.residents[0],w.player);w.playerBonds.mira.affinity=9;expect(actorCue(w,'mira')).toBe('company');w.player={x:0,y:0};w.residents[0].activity='A conversar na praça';Object.assign(w.residents[1],w.residents[0],{id:'theo'});expect(actorCue(w,'mira')).toBe('company')});
 it('shows role cues at work and removes them while away',()=>{const w=createWorld();for(const r of w.residents){Object.assign(r,places[r.id==='mira'?'horta':r.id==='luma'?'farol':'theo']);r.activity='A trabalhar';}expect(actorCue(w,'mira')).toBe('garden');expect(actorCue(w,'theo')).toBe('invent');expect(actorCue(w,'luma')).toBe('stars');w.residents[0].x=450;expect(actorCue(w,'mira')).toBeNull()});
});
