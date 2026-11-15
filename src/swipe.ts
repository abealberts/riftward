import {identifyRoute,routes} from './engine'

/** Coordinates are measured in cells. The top-left cell covers [0,1) on both axes. */
export type Point = {x:number;y:number}
export function touchCell({x,y}:Point){
  const clamp=(value:number)=>Math.max(0,Math.min(2,Math.floor(value)))
  return clamp(y)*3+clamp(x)
}

export function swipeRoute(points:Point[]):number{
  if(points.length<2)return -1
  const first=points[0],last=points[points.length-1]
  const start=touchCell(first),end=touchCell(last)
  const route=routes.find(line=>line[0]===start&&line[2]===end)
  if(!route)return -1

  // Capture allows a finger to lift just beyond the outside edge of the board.
  const dx=last.x-first.x,dy=last.y-first.y,length=Math.hypot(dx,dy)
  if(Math.abs(dx)<1.1)return -1
  let furthest=0
  for(const point of points){
    const x=point.x-first.x,y=point.y-first.y
    const lateral=Math.abs(x*dy-y*dx)/length
    const along=(x*dx+y*dy)/length
    if(lateral>0.62||along<furthest-0.55)return -1
    furthest=Math.max(along,furthest)
  }
  return identifyRoute(route)
}
