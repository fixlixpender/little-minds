import {describe,it,expect} from 'vitest';
import {clearSegment,findRoute,followRoute,isWalkable,recoverPosition} from './navigation';
import {places,type Point} from './simulation';
function verifyRoute(start:Point,end:Point){const route=findRoute(start,end);expect(route.length).toBeGreaterThan(0);let current=start;for(const p of route){expect(clearSegment(current,p)).toBe(true);current=p;}expect(current).toEqual(end);return route;}
describe('island navigation',()=>{
 it('routes the player around a house instead of stopping at its wall',()=>{const start={x:240,y:380},end={x:390,y:380};expect(clearSegment(start,end)).toBe(false);verifyRoute(start,end)});
 it('routes around the lake with every segment on safe ground',()=>{const start={x:580,y:260},end={x:745,y:260};expect(clearSegment(start,end)).toBe(false);verifyRoute(start,end)});
 it('refuses clicks in water, houses, or off the island',()=>{for(const p of [{x:664,y:260},{x:310,y:370},{x:0,y:0}]){expect(isWalkable(p.x,p.y)).toBe(false);expect(findRoute(places.praca,p)).toEqual([])}});
 it('connects every routine destination from every home',()=>{for(const start of [places.mira,places.theo,places.luma])for(const end of Object.values(places))verifyRoute(start,end)});
 it('lets visitors walk to the end of the visible pier',()=>{expect(isWalkable(510,568)).toBe(true);verifyRoute(places.praca,{x:510,y:568})});
 it('recovers legacy positions inside obstacles without moving valid saves',()=>{expect(recoverPosition(places.praca)).toEqual(places.praca);const recovered=recoverPosition({x:310,y:380});expect(isWalkable(recovered.x,recovered.y)).toBe(true)});
 it('follows a complete detour without overshooting or entering obstacles',()=>{const position={x:240,y:380},end={x:390,y:380},route=findRoute(position,end);for(let i=0;i<500&&route.length;i++){followRoute(position,route,4);expect(isWalkable(position.x,position.y)).toBe(true);}expect(route).toHaveLength(0);expect(position.x).toBeCloseTo(end.x);expect(position.y).toBeCloseTo(end.y)});
 it('cancels stale routes safely when the next segment is blocked',()=>{const position={x:240,y:380},route=[{x:390,y:380}];followRoute(position,route,150);expect(route).toHaveLength(0);expect(position).toEqual({x:240,y:380})});
});
