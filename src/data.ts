export const names = ['Tallow Pilgrim', 'Cairn Keeper', 'Veiled Mourner', 'Gallows Raven', 'Bellwatch Guard', 'Shroud Leech', 'Charcoal Squire', 'Barrow Sexton', 'Wick Widow', 'Rustbound Hound', 'Cowl of Thorns', 'Crypt Bearer', 'Votive Knight', 'Ossuary Monk', 'Pallid Cantor', 'Red Tollman', 'Chapel Harrier', 'Frostbound Nun', 'Pyre Falconer', 'Grave Mastiff', 'Knight of Nails', 'Reliquary Bride', 'Saint of Briars', 'Pale Inquisitor', 'The Weeping Abbot', 'The Cinder Regent', 'Keeper of the Last Bell', 'The Ashen Hart']
export const roles = ['Striker','Guardian','Mystic']
export const skills = ['Sundering blow','Bulwark strike','Arc flare']
export const rarities = ['Common','Rare','Epic','Legendary'] as const
export const rarityTier=(kind:number)=>kind<12?0:kind<20?1:kind<25?2:3
export const rarity=(kind:number)=>rarities[rarityTier(kind)]
export const sprite=(kind:number)=>'./art/vagrants/'+kind+'.svg'
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
  {name:'The Hollow Spire',region:'Ashfall Reach',foe:'Bell-tower penitent',xp:45,coins:80},
  {name:'The Drowned Chantry',region:'Widowfen',foe:'Drowned sacristan',xp:65,coins:120},
  {name:'The Obsidian Gate',region:'Blackglass Ridge',foe:'Gate warden',xp:95,coins:180}
]
export type Fighter = {id:string; kind:number; xp:number; stars?:number}
export const level = (xp:number) => 1 + Math.floor(xp/40)
export function stats(f:Fighter) {
  const k=f.kind%12, l=level(f.xp)-1, tier=rarityTier(f.kind)
  const bonus=1+0.1*((f.stars??1)-1)
  return {
    hp:Math.ceil((57+k*2+(k%3===1?18:0)+tier*4)*bonus)+l*7,
    atk:Math.ceil((14+k%5+(k%3===0?3:0)+tier)*bonus)+l*2,
    def:Math.ceil((4+k%4+Math.ceil(tier/2))*bonus)+l,
    agi:Math.ceil((8+(k*7)%11+Math.ceil(tier/2))*bonus)+l
  }
}

const reinforcements = [
  [{name:'Gallows fledgling',kind:3},{name:'Tarnished squire',kind:6}],
  [{name:'Fen lurker',kind:1},{name:'Widow of the mire',kind:2}],
  [{name:'Basalt claw',kind:5},{name:'Charred mastiff',kind:9}]
]
export function encounterEnemies(mission:number,encounter:number){
  const roster=[{name:missions[mission].foe,kind:[4,7,11][mission]},...reinforcements[mission].slice(0,encounter)]
  const total=90+mission*48+encounter*22
  const base=Math.floor(total/roster.length)
  return roster.map((foe,index)=>({...foe,agi:9+(foe.kind*7)%11+mission,maxHP:base+(index===0?total%roster.length:0)}))
}

export const maxStars=(kind:number)=>[4,5,6,6][rarityTier(kind)]
export const power=(f:Fighter)=>Object.values(stats(f)).reduce((total,value)=>total+value,0)
