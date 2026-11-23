export const nurseryDoor = {x:364,y:304};

export type Nursery = {waterings:number; lastWateredDay:number};

export function waterNursery(day:number, plant?:Nursery):Nursery|undefined {
  if (plant && (plant.lastWateredDay >= day || plant.waterings >= 3)) return;
  return {waterings:(plant?.waterings ?? 0)+1,lastWateredDay:day};
}

export function nurseryStage(day:number, plant?:Nursery):number {
  if (!plant) return 0;
  return Math.max(0,plant.waterings-Number(plant.lastWateredDay>=day));
}
