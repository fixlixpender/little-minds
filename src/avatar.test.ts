import{describe,it,expect}from'vitest';
import{cleanName,defaultAvatar,normalizeAvatar}from'./avatar';
import{createWorld,restore,serialize}from'./simulation';
describe('visitor identity and save compatibility',()=>{
 it('upgrades a legacy save without losing position, time or diary',()=>{const world=createWorld();world.day=12;world.player={x:520,y:510};const legacy=JSON.parse(serialize(world));delete legacy.playerProfile;const saved=restore(JSON.stringify(legacy));expect(saved.playerProfile).toEqual(defaultAvatar);expect(saved.player).toEqual(world.player);expect(saved.events).toEqual(world.events);expect(saved.day).toBe(12)});
 it('round trips a customised visitor with the world',()=>{const world=createWorld();world.playerProfile={name:'Fil',skin:'warm',hair:'silver',outfit:'ocean',style:'crest'};expect(restore(serialize(world))).toEqual(world)});
 it('repairs malformed appearance independently from valid world progress',()=>{const world=createWorld();const saved=JSON.parse(serialize(world));saved.playerProfile={name:35,skin:'<bad>',hair:'toString',style:'invalid',outfit:'#fake'};expect(restore(JSON.stringify(saved)).playerProfile).toEqual(defaultAvatar);expect(restore(JSON.stringify(saved)).events).toEqual(world.events)});
 it('keeps Unicode names readable, bounded and free of hidden controls',()=>{expect(cleanName('  João   da Ilha  ')).toBe('João da Ilha');expect(cleanName('F\u202eil\u0000')).toBe('Fil');expect([...cleanName('🌿'.repeat(30))]).toHaveLength(20);expect(normalizeAvatar(null)).toEqual(defaultAvatar)});
});
