export type Weather='clear'|'rain'|'mist';
// A repeatable four-day coastal pattern. No wall clock or paid service is used.
// Rain clears before Luma's evening activities become available.
export function weatherAt(day:number,minute:number):Weather{
 const cycle=((Math.floor(day)-1)%4+4)%4,h=minute/60;
 if(cycle===1&&h>=9&&h<17)return 'rain';
 if(cycle===2&&h>=5&&h<11)return 'mist';
 return 'clear';
}
export function weatherStrength(day:number,minute:number):number{
 const weather=weatherAt(day,minute);if(weather==='clear')return 0;
 const [from,until]=weather==='rain'?[540,1020]:[300,660];
 return Math.max(0,Math.min(1,(minute-from)/30,(until-minute)/30));
}
export const weatherLabels:Record<Weather,string>={clear:'Brisa do mar',rain:'Chuva costeira',mist:'Neblina da manhã'};
