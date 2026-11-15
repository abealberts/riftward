import {names,skills,stats,type Fighter} from './data'
export const lines = [0,1,2].flatMap(slope=>[0,1,2].map(start=>[0,1,2].map(col=>((start+slope*col)%3)*3+col)))
export function validLines(ids:number[]) {
  return ids.length===3 && ids.every(i=>Number.isInteger(i)&&!!lines[i]) && new Set(ids.flatMap(i=>lines[i])).size===9
}
export const damage=(atk:number,def:number,roll:number)=>Math.max(1,Math.floor(atk*(0.9+roll*0.2)-def*0.55))
export type Frame={text:string;hp:number[];enemy:number;slot:number}
export function battle(party:Fighter[], initial:number[], ids:number[], mission:number, encounter:number, seed:number) {
  if(!validLines(ids)||party.length!==9) throw Error('Choose three disjoint attack lines.')
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  const hp=[...initial], order=ids.flatMap(i=>[...lines[i]].sort((a,b)=>stats(party[b]).agi-stats(party[a]).agi))
  let enemy=enemyHP(mission,encounter)
  const frames:Frame[]=[]
  const log=(text:string,slot:number)=>frames.push({text,hp:[...hp],enemy,slot})
  while(enemy>0 && hp.some(v=>v>0)){
    for(const i of order){
      if(!hp[i]) continue
      const f=party[i], special=random()<0.25
      const hit=damage(stats(f).atk*(special?1.55:1),5+mission*3,random())
      enemy=Math.max(0,enemy-hit)
      log(names[f.kind]+' · '+(special?skills[f.kind%3]:'Strike')+' deals '+hit+'.',i)
      if(!enemy) break
      const live=order.filter(j=>hp[j]>0),target=live[Math.floor(random()*live.length)]
      const taken=damage(11+mission*3+encounter,stats(party[target]).def,random())
      hp[target]=Math.max(0,hp[target]-taken)
      log(names[party[target].kind]+' takes '+taken+(hp[target]?' damage.':' damage and falls.'),target)
      if(!hp.some(v=>v>0)) break
    }
  }
  return {frames,hp,won:enemy===0}
}
export const enemyHP=(mission:number,encounter:number)=>90+mission*48+encounter*22
