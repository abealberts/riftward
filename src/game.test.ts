import {describe,it,expect} from 'vitest'
import {battle,damage,validLines,identifyRoute} from './engine'
import {begin,finish,fresh,party,load,persist,summon} from './save'
import {level,stats,encounterEnemies,rollKind,rarityTier,names,type Fighter} from './data'
describe('combat and campaign',()=>{
 it('accepts intersecting lines and rejects the same line in reverse',()=>{
 for(const ids of [[0,1,2],[3,1,4],[8,6,7]])expect(validLines(ids)).toBe(true)
 for(const ids of [[0,5,3],[0,0,0],[19,0,1],[0,1]])expect(validLines(ids)).toBe(false)
 })
 it('sorts the whole turn by speed, preserving repeated actions and stable ties',()=>{
 const s=fresh(),team=party(s) as Fighter[]
 const ids=[[8,4,0],[3,4,5],[6,4,2]].map(identifyRoute)
 const result=battle(team,Array(9).fill(500),ids,0,0,99,[1000])
 expect(result.frames.filter(f=>f.side==='ally').map(f=>f.slot)).toEqual([8,4,0,3,4,5,6,4,2].sort((a,b)=>stats(team[b]).agi-stats(team[a]).agi))
 const speeds=result.frames.map(f=>f.side==='ally'?stats(team[f.slot]).agi:encounterEnemies(0,0)[f.foe].agi)
 expect(speeds).toEqual([...speeds].sort((a,b)=>b-a))
 expect(result.enemies[0]).toBeGreaterThan(0)
 expect(identifyRoute([0,4,5])).toBe(-1)
 })
 it('limits enemies to one action per line and retargets defeated enemies',()=>{
 const team=party(fresh()) as Fighter[]
 const b=battle(team,Array(9).fill(100),[0,1,2],0,1,7,[1,500])
 const enemyLines=b.frames.filter(f=>f.side==='enemy').map(f=>f.line)
 expect(new Set(enemyLines).size).toBe(enemyLines.length)
 const targets=b.frames.filter(f=>f.side==='ally').map(f=>f.foe)
 expect(targets).toEqual([0,...Array(8).fill(1)])
 const win=battle(team,b.hp,[0,1,2],0,1,b.seed,[0,1])
 expect(win.won).toBe(true)

 })
 it('saves victory and credits encounter XP before the next fight',()=>{
 const s=begin(fresh(),0,1),won=finish(s,s.run!.hp,true)
 expect(won.victory?.xp).toBe(15);expect(won.xp).toBe(15);expect(won.fighters[0].xp).toBe(15)
 expect(load({getItem:()=>JSON.stringify(won)})).toEqual(won)
 })
 it('applies defense, bounded variability and a damage floor',()=>{
 expect(damage(20,10,0)).toBe(12);expect(damage(20,10,1)).toBe(16);expect(damage(1,100,0)).toBe(1)
 })
 it('kills the enemy deterministically and preserves HP across encounters',()=>{
 const s=begin(fresh(),0,7),team=party(s) as Fighter[]
 const play=()=>battle(team,s.run!.hp,[0,1,2],0,0,7)
 const b=play();expect(play()).toEqual(b);expect(b.won).toBe(true)
 expect(b.frames.at(-1)?.enemies[0]).toBe(0);expect(finish(s,b.hp,true).run?.hp).toEqual(b.hp)
 })
 it('defeated fighters cannot attack and a wiped party loses',()=>{
 const s=fresh(),b=battle(party(s) as Fighter[],[1,0,0,0,0,0,0,0,0],[0,1,2],2,2,99)
 expect(b.won).toBe(false);expect(b.hp.every(h=>h===0)).toBe(true);expect(b.frames.every(f=>f.slot===0)).toBe(true)
 })
 it('awards the active party, unlocks missions and levels fighters',()=>{
 let s=begin(fresh(),0,1);expect(begin(fresh(),1,1).run).toBeNull()
 for(let i=0;i<3;i++)s=finish(s,s.run!.hp,true)
 expect(s.xp).toBe(45);expect(s.coins).toBe(80);expect(level(s.fighters[0].xp)).toBe(2);expect(s.fighters[9].xp).toBe(0);expect(s.cleared).toBe(1);expect(s.run).toBeNull()
 })
 it('distributes species across the published rarity thresholds',()=>{
 expect([0,1,2,3].map(tier=>names.filter((_,i)=>rarityTier(i)===tier).length)).toEqual([12,8,5,3])
 expect([0,.64999,.65,.89999,.90,.97999,.98,.99999].map(v=>rarityTier(rollKind(v,.5)))).toEqual([0,0,1,1,2,2,3,3])
 })
 it('charges exactly once per summon and keeps duplicate instances through reload',()=>{
 const start={...fresh(),coins:80}
 const first=summon(start,.99,.5,'first'),second=summon(first,.99,.5,'second')
 expect(second.coins).toBe(0);expect(second.fighters).toHaveLength(14)
 expect(second.fighters.slice(-2)).toEqual([{kind:26,id:'first',xp:0},{kind:26,id:'second',xp:0}])
 expect(summon(second,0,0,'third')).toBe(second)
 expect(load({getItem:()=>JSON.stringify(second)})).toEqual(second)
 })
 it('clears a three-encounter mission with speed-based initiative',()=>{
 let save=begin(fresh(),0,7)
 for(let encounter=0;encounter<3;encounter++){
 const run=save.run!,team=party(save) as Fighter[]
 let outcome=battle(team,run.hp,[0,1,2],0,encounter,run.seed)
 while(!outcome.won&&outcome.hp.some(Boolean))outcome=battle(team,outcome.hp,[0,1,2],0,encounter,outcome.seed,outcome.enemies)
 expect(outcome.won).toBe(true);save=finish(save,outcome.hp,true)
 }
 expect(save.cleared).toBe(1)
 })
 it('round trips instance IDs and an active mission through versioned storage',()=>{
 const s=begin(fresh(),0,25);let value=''
 persist(s,{setItem:(_,v)=>{value=v}});expect(load({getItem:()=>value})).toEqual(s)
 expect(load({getItem:()=> 'broken'}).version).toBe(1)
 })
})
