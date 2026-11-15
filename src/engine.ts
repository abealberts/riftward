import {encounterEnemies,names,skills,stats,type Fighter} from './data'

export const lines=[[0,1,2],[3,4,5],[6,7,8],[0,4,8],[6,4,2]]
export const routes=[...lines,...lines.map(line=>[...line].reverse())]
export function identifyRoute(slots:number[]){
  return routes.findIndex(route=>slots.length===3 && route.every((slot,i)=>slot===slots[i]))
}
export function validLines(ids:number[]) {
  return ids.length===3 && ids.every(i=>Number.isInteger(i)&&!!routes[i]) && new Set(ids.map(i=>i%lines.length)).size===3
}
export const damage=(atk:number,def:number,roll:number)=>Math.max(1,Math.floor(atk*(0.9+roll*0.2)-def*0.55))
export function initialEnemies(mission:number,encounter:number,saved?:number[]|number){
  const maximum=encounterEnemies(mission,encounter).map(foe=>foe.maxHP)
  if(Array.isArray(saved))return [...saved]
  if(saved===undefined)return maximum
  // Older checkpoints stored one combined HP pool. Preserve damage already dealt.
  let missing=Math.max(0,maximum.reduce((sum,n)=>sum+n,0)-saved)
  return maximum.map(full=>{const lost=Math.min(full,missing);missing-=lost;return full-lost})
}
export type Frame={text:string;hp:number[];enemies:number[];foe:number;slot:number;line:number;side:'ally'|'enemy';amount:number}
export function battle(party:Fighter[], initial:number[], ids:number[], mission:number, encounter:number, seed:number, saved?:number[]|number) {
  if(!validLines(ids)||party.length!==9) throw Error('Choose three different attack lines.')
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  const hp=[...initial],frames:Frame[]=[]
  const roster=encounterEnemies(mission,encounter),enemies=initialEnemies(mission,encounter,saved)
  // Stable ties follow queued line order, then swipe direction, then the enemy.
  const actions=ids.flatMap((id,line)=>{
    const actors=routes[id].filter(slot=>hp[slot]>0).map(slot=>({line,slot,foe:-1,speed:stats(party[slot]).agi}))
    const standing=roster.map((_,i)=>i).filter(i=>enemies[i]>0)
    if(standing.length&&actors.length){
      const foe=standing[Math.floor(random()*standing.length)]
      actors.push({line,slot:-1,foe,speed:roster[foe].agi})
    }
    return actors
  }).sort((a,b)=>b.speed-a.speed)
  for(const action of actions){
    if(!enemies.some(Boolean)||!hp.some(Boolean))break
    const {line,slot}=action
    if(action.foe<0){
      const foe=enemies.findIndex(n=>n>0)
      if(foe<0)break
      if(!hp[slot])continue
      const fighter=party[slot],special=random()<0.25
      const amount=damage(stats(fighter).atk*(special?1.55:1),5+mission*3,random())
      enemies[foe]=Math.max(0,enemies[foe]-amount)
      frames.push({side:'ally',amount,line,slot,foe,hp:[...hp],enemies:[...enemies],text:names[fighter.kind]+' · '+(special?skills[fighter.kind%3]:'Strike')+' hits '+roster[foe].name+' for '+amount+'.'})
    }
    else {
    const foe=action.foe
    const targets=routes[ids[line]].filter(i=>hp[i]>0)
    if(!enemies[foe]||!targets.length)continue
    const slot=targets[Math.floor(random()*targets.length)]
    const amount=damage(11+mission*3+encounter,stats(party[slot]).def,random())
    hp[slot]=Math.max(0,hp[slot]-amount)
    frames.push({side:'enemy',amount,line,slot,foe,hp:[...hp],enemies:[...enemies],text:roster[foe].name+' hits '+names[party[slot].kind]+' for '+amount+(hp[slot]?'.':' and defeats it.')})
  }
  }
  return {frames,hp,enemies,seed,won:enemies.every(n=>n===0)}
}
