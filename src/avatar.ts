export const skinTones={sand:'#e7c6a1',peach:'#f2d9c0',warm:'#c58e68',brown:'#926046',deep:'#593e35'};
export const hairColours={chestnut:'#76513b',night:'#343336',gold:'#d3b369',silver:'#b8b9ac',auburn:'#9b5841'};
export const outfitColours={sage:'#a9bf89',ocean:'#80aeb5',ochre:'#d7ac6d',lavender:'#b3a4d0',rose:'#cd9597'};
export type HairStyle='short'|'long'|'crest';
export type AvatarProfile={name:string;skin:keyof typeof skinTones;hair:keyof typeof hairColours;outfit:keyof typeof outfitColours;style:HairStyle};
export const defaultAvatar:AvatarProfile={name:'',skin:'sand',hair:'chestnut',outfit:'sage',style:'short'};
export function cleanName(value:string):string{return [...value.replace(/[\p{Cc}\p{Cf}]/gu,'').replace(/\s+/g,' ').trim()].slice(0,20).join('');}
export function normalizeAvatar(value:unknown):AvatarProfile{
 const p=(value&&typeof value==='object'?value:{}) as Record<string,unknown>;
 const member=<T extends Record<string,string>>(options:T,value:unknown,fallback:keyof T):keyof T=>typeof value==='string'&&Object.hasOwn(options,value)?value:fallback;
 return {name:typeof p.name==='string'?cleanName(p.name):'',skin:member(skinTones,p.skin,defaultAvatar.skin),hair:member(hairColours,p.hair,defaultAvatar.hair),outfit:member(outfitColours,p.outfit,defaultAvatar.outfit),style:['short','long','crest'].includes(String(p.style))?p.style as HairStyle:'short'};
}
