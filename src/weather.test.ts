import{describe,it,expect}from'vitest';
import{weatherAt,weatherStrength}from'./weather';
import{createWorld,restore,serialize}from'./simulation';
import{chooseReply,replyText}from'./conversations';
describe('local coastal weather',()=>{
 it('follows a repeatable four-day pattern',()=>{expect(weatherAt(1,720)).toBe('clear');expect(weatherAt(2,720)).toBe('rain');expect(weatherAt(3,420)).toBe('mist');expect(weatherAt(4,720)).toBe('clear');for(let day=1;day<20;day++)expect(weatherAt(day,600)).toBe(weatherAt(day+4,600))});
 it('keeps night clear for astronomy and respects weather boundaries',()=>{expect(weatherAt(2,539)).toBe('clear');expect(weatherAt(2,540)).toBe('rain');expect(weatherAt(2,1020)).toBe('clear');expect(weatherAt(3,299)).toBe('clear');expect(weatherAt(3,300)).toBe('mist');expect(weatherAt(3,660)).toBe('clear');for(let d=1;d<=4;d++){expect(weatherAt(d,1200)).toBe('clear');expect(weatherAt(d,120)).toBe('clear')}});
 it('fades in and out without exceeding the visual strength range',()=>{expect(weatherStrength(2,540)).toBe(0);expect(weatherStrength(2,555)).toBe(.5);expect(weatherStrength(2,720)).toBe(1);expect(weatherStrength(2,1005)).toBe(.5);expect(weatherStrength(2,1020)).toBe(0);expect(weatherStrength(3,315)).toBe(.5)});
 it('keeps the same weather after reloading existing saves',()=>{const w=createWorld();w.day=6;w.minute=600;const loaded=restore(serialize(w));expect(weatherAt(loaded.day,loaded.minute)).toBe('rain');expect(loaded.events).toEqual(w.events)});
 it('gives all three residents distinct bilingual weather comments without replacing other topics or rest',()=>{const w=createWorld();for(const weather of ['rain','mist']as const){w.day=weather==='rain'?2:3;w.minute=600;const seen=[];for(const r of w.residents){r.activity='A começar o dia';const key=chooseReply(w,r.id,'day');expect(key).toBe(`${r.id}.${weather}`);expect(replyText(key,'en')).not.toBe(replyText(key,'pt-PT'));seen.push(replyText(key,'en'));expect(chooseReply(w,r.id,'island')).toBe(`${r.id}.island`);r.activity='A descansar em casa';expect(chooseReply(w,r.id,'day')).toBe(`${r.id}.rest`)}expect(new Set(seen).size).toBe(3)}});
});
