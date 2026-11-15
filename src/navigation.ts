import type {Point} from './simulation';

export function isLand(x:number,y:number):boolean {
  return ((x-465)/398)**2+((y-305)/238)**2<1 || ((x-785)/105)**2+((y-190)/100)**2<1;
}

export function isWalkable(x:number,y:number):boolean {
  const pier=x>=494&&x<=526&&y>=480&&y<=571;
  if(!isLand(x,y)&&!pier)return false;
  // Match the rotated lake artwork, including a little space at the shore.
  const dx=x-664,dy=y-260,c=Math.cos(.3),s=Math.sin(.3);
  if(((dx*c-dy*s)/68)**2+((dx*s+dy*c)/44)**2<1)return false;
  return ![[310,395],[565,387],[593,168]].some(([hx,hy])=>x>hx-44&&x<hx+44&&y>hy-74&&y<hy+13);
}

export function clearSegment(a:Point,b:Point):boolean {
  const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/2));
  for(let i=0;i<=steps;i++)if(!isWalkable(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;
  return true;
}

const CELL=8;
const key=(x:number,y:number)=>`${x},${y}`;
function gridAnchor(point:Point):Point|null {
  const cx=Math.round(point.x/CELL)*CELL,cy=Math.round(point.y/CELL)*CELL;
  const candidates:Point[]=[];
  for(let x=cx-CELL*2;x<=cx+CELL*2;x+=CELL)for(let y=cy-CELL*2;y<=cy+CELL*2;y+=CELL)candidates.push({x,y});
  candidates.sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));
  return candidates.find(p=>clearSegment(point,p))??null;
}

// Recover old saves that left someone inside an obstacle. Keep valid positions.
export function recoverPosition(point:Point):Point {
  if(isWalkable(point.x,point.y))return {...point};
  for(let radius=4;radius<=100;radius+=4)for(let angle=0;angle<32;angle++){
    const p={x:point.x+Math.cos(angle*Math.PI/16)*radius,y:point.y+Math.sin(angle*Math.PI/16)*radius};
    if(isWalkable(p.x,p.y))return p;
  }
  return {x:460,y:400};
}

export function findRoute(start:Point,end:Point):Point[] {
  if(!isWalkable(start.x,start.y)||!isWalkable(end.x,end.y))return [];
  if(clearSegment(start,end))return [{...end}];
  const first=gridAnchor(start),last=gridAnchor(end);
  if(!first||!last)return [];
  const queue=[first],seen=new Set([key(first.x,first.y)]),previous=new Map<string,Point>();
  let found=false;
  for(let index=0;index<queue.length;index++){
    const current=queue[index];
    if(current.x===last.x&&current.y===last.y){found=true;break;}
    for(const [dx,dy] of [[CELL,0],[-CELL,0],[0,CELL],[0,-CELL]]){
      const next={x:current.x+dx,y:current.y+dy},id=key(next.x,next.y);
      if(!seen.has(id)&&clearSegment(current,next)){
        seen.add(id);previous.set(id,current);queue.push(next);
      }
    }
  }
  if(!found)return [];
  const path:Point[]=[{...end}];let current=last;
  while(current.x!==first.x||current.y!==first.y){path.unshift(current);current=previous.get(key(current.x,current.y))!;}
  path.unshift(first);
  // Remove the staircase where a safe direct segment exists.
  const result:Point[]=[];let origin=start,index=0;
  while(index<path.length){let furthest=index;for(let i=index+1;i<path.length;i++)if(clearSegment(origin,path[i]))furthest=i;const point=path[furthest];result.push(point);origin=point;index=furthest+1;}
  return result;
}

export function followRoute(position:Point,points:Point[],distance:number):boolean {
  let moved=false;
  while(points.length&&distance>0){
    const dest=points[0],dx=dest.x-position.x,dy=dest.y-position.y,d=Math.hypot(dx,dy);
    if(d<.001){points.shift();continue;}
    const step=Math.min(distance,d),next={x:position.x+dx/d*step,y:position.y+dy/d*step};
    if(!clearSegment(position,next)){points.length=0;break;}
    position.x=next.x;position.y=next.y;moved=true;distance-=step;
    if(step>=d)points.shift();
  }
  return moved;
}
