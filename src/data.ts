export const names = ['Cinderhorn','Mossmaw','Duskwisp','Glintwing','Ironhide','Riftclaw','Ashmantle','Thornling','Frostveil','Emberfin','Nightcrest','Stonecoil']
export const roles = ['Striker','Guardian','Mystic']
export const skills = ['Sundering blow','Bulwark strike','Arc flare']
export const rarities = ['Rare','Common','Epic']
export const missions = [
  {name:'The Hollow Spire',region:'Ashfall Reach',foe:'Spire sentinel',xp:45,coins:80},
  {name:'Glassfen Crossing',region:'The Viridian Marsh',foe:'Glassfen stalker',xp:65,coins:120},
  {name:'The Obsidian Gate',region:'Blackglass Ridge',foe:'Gate warden',xp:95,coins:180}
]
export type Fighter = {id:string; kind:number; xp:number}
export const level = (xp:number) => 1 + Math.floor(xp/40)
export function stats(f:Fighter) {
  const k=f.kind, l=level(f.xp)-1
  return {hp:57+k*2+(k%3===1?18:0)+l*7,atk:14+k%5+(k%3===0?3:0)+l*2,def:4+k%4+l,agi:8+(k*7)%11+l}
}

const reinforcements = [
  [{name:'Ashwing',kind:3},{name:'Cinder beetle',kind:6}],
  [{name:'Fen lurker',kind:1},{name:'Marsh wisp',kind:2}],
  [{name:'Basalt claw',kind:5},{name:'Obsidian fin',kind:9}]
]
export function encounterEnemies(mission:number,encounter:number){
  const roster=[{name:missions[mission].foe,kind:[4,7,11][mission]},...reinforcements[mission].slice(0,encounter)]
  const total=90+mission*48+encounter*22
  const base=Math.floor(total/roster.length)
  return roster.map((foe,index)=>({...foe,maxHP:base+(index===0?total%roster.length:0)}))
}
