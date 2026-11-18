import type {Weather} from './weather';

export type IslandPhoto = {id:string; src:string; day:number; minute:number; weather:Weather};
export const ALBUM_LIMIT = 8;
const albumKey = 'little-minds:album:v1';

export function loadAlbum(storage:Pick<Storage,'getItem'>):IslandPhoto[]{
 try{
  const photos:unknown=JSON.parse(storage.getItem(albumKey)??'[]');
  if(!Array.isArray(photos))return [];
  return photos.filter(photo=>photo&&typeof photo.id==='string'&&
   typeof photo.src==='string'&&photo.src.startsWith('data:image/png;base64,')&&
   Number.isInteger(photo.day)&&Number.isFinite(photo.minute)&&
   ['clear','rain','mist'].includes(photo.weather)).slice(0,ALBUM_LIMIT);
 }catch{return []}
}

export function saveAlbum(storage:Pick<Storage,'setItem'>,photos:IslandPhoto[]){
 storage.setItem(albumKey,JSON.stringify(photos));
}
