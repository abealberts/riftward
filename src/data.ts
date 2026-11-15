export const names = ['Cinderhorn','Mossmaw','Duskwisp','Glintwing','Ironhide','Riftclaw','Ashmantle','Thornling','Frostveil','Emberfin','Nightcrest','Stonecoil','Lanternray','Briarjack','Tidebell','Coppersnap','Moonquill','Sleetcap','Gloamkite','Amberjaw','Vesperlynx','Prismveil','Runebloom','Stormrook','Gravepearl','Auroroc','Crownshell','Starhart']
export const roles = ['Striker','Guardian','Mystic']
export const skills = ['Sundering blow','Bulwark strike','Arc flare']
export const rarities = ['Common','Rare','Epic','Legendary'] as const
export const rarityTier=(kind:number)=>kind<12?0:kind<20?1:kind<25?2:3
export const rarity=(kind:number)=>rarities[rarityTier(kind)]
export const sprite=(kind:number)=>'./art/'+kind+(kind<12?'.png':'.svg')
export const pullCost=40
export const pullWeights=[65,25,8,2]
export function rollKind(rarityRoll:number,unitRoll:number){
  let remaining=rarityRoll*100
  for(const [tier,weight] of pullWeights.entries()){
    if(remaining<weight){
      const pool=names.map((_,i)=>i).filter(i=>rarityTier(i)===tier)
      return pool[Math.floor(unitRoll*pool.length)]
    }
    remaining-=weight
  }
  throw Error('Pull roll outside expected range.')
}
export const missions = [
  {name:'The Hollow Spire',region:'Ashfall Reach',foe:'Spire sentinel',xp:45,coins:80},
  {name:'Glassfen Crossing',region:'The Viridian Marsh',foe:'Glassfen stalker',xp:65,coins:120},
  {name:'The Obsidian Gate',region:'Blackglass Ridge',foe:'Gate warden',xp:95,coins:180}
]
export type Fighter = {id:string; kind:number; xp:number}
export const level = (xp:number) => 1 + Math.floor(xp/40)
export function stats(f:Fighter) {
  const k=f.kind%12, l=level(f.xp)-1, tier=rarityTier(f.kind)
  return {hp:57+k*2+(k%3===1?18:0)+tier*4+l*7,atk:14+k%5+(k%3===0?3:0)+tier+l*2,def:4+k%4+Math.ceil(tier/2)+l,agi:8+(k*7)%11+Math.ceil(tier/2)+l}
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
  return roster.map((foe,index)=>({...foe,agi:9+(foe.kind*7)%11+mission,maxHP:base+(index===0?total%roster.length:0)}))
}
