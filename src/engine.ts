import {names,skills,stats,type Fighter} from './data'

export const lines=[[0,1,2],[3,4,5],[6,7,8],[0,4,8],[6,4,2]]
export const routes=[...lines,...lines.map(line=>[...line].reverse())]
export function identifyRoute(slots:number[]){
  return routes.findIndex(route=>slots.length===3 && route.every((slot,i)=>slot===slots[i]))
}
export function validLines(ids:number[]) {
  return ids.length===3 && ids.every(i=>Number.isInteger(i)&&!!routes[i]) && new Set(ids.map(i=>i%lines.length)).size===3
}
export const damage=(atk:number,def:number,roll:number)=>Math.max(1,Math.floor(atk*(0.9+roll*0.2)-def*0.55))
export const enemyHP=(mission:number,encounter:number)=>90+mission*48+encounter*22
export type Frame={text:string;hp:number[];enemy:number;slot:number;line:number;side:'ally'|'enemy';amount:number}
export function battle(party:Fighter[], initial:number[], ids:number[], mission:number, encounter:number, seed:number, enemy=enemyHP(mission,encounter)) {
  if(!validLines(ids)||party.length!==9) throw Error('Choose three different attack lines.')
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  const hp=[...initial],frames:Frame[]=[]
  for(const [line,id] of ids.entries()){
    const active=routes[id]
    for(const slot of active){
      if(!enemy||!hp[slot])continue
      const fighter=party[slot],special=random()<0.25
      const amount=damage(stats(fighter).atk*(special?1.55:1),5+mission*3,random())
      enemy=Math.max(0,enemy-amount)
      frames.push({side:'ally',amount,line,slot,hp:[...hp],enemy,text:names[fighter.kind]+' · '+(special?skills[fighter.kind%3]:'Strike')+' deals '+amount+'.'})
      if(!enemy)break
      const live=active.filter(i=>hp[i]>0)
      const target=live[Math.floor(random()*live.length)]
      const taken=damage(11+mission*3+encounter,stats(party[target]).def,random())
      hp[target]=Math.max(0,hp[target]-taken)
      frames.push({side:'enemy',amount:taken,line,slot:target,hp:[...hp],enemy,text:names[party[target].kind]+' takes '+taken+(hp[target]?' damage.':' damage and falls.')})
    }
  }
  return {frames,hp,enemy,seed,won:enemy===0}
}
