import {describe,it,expect} from 'vitest'
import {battle,damage,validLines} from './engine'
import {begin,finish,fresh,party,load,persist} from './save'
import {level,type Fighter} from './data'
describe('combat and campaign',()=>{
 it('accepts horizontal and wrapped diagonal partitions',()=>{
 for(const ids of [[0,1,2],[3,5,4],[8,6,7]])expect(validLines(ids)).toBe(true)
 for(const ids of [[0,1,3],[0,0,0],[19,0,1],[0,1]])expect(validLines(ids)).toBe(false)
 })
 it('applies defense, bounded variability and a damage floor',()=>{
 expect(damage(20,10,0)).toBe(12);expect(damage(20,10,1)).toBe(16);expect(damage(1,100,0)).toBe(1)
 })
 it('kills the enemy deterministically and preserves HP across encounters',()=>{
 const s=begin(fresh(),0,7),team=party(s) as Fighter[]
 const play=()=>battle(team,s.run!.hp,[0,1,2],0,0,7)
 const b=play();expect(play()).toEqual(b);expect(b.won).toBe(true)
 expect(b.frames.at(-1)?.enemy).toBe(0);expect(finish(s,b.hp,true).run?.hp).toEqual(b.hp)
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
 it('round trips instance IDs and an active mission through versioned storage',()=>{
 const s=begin(fresh(),0,25);let value=''
 persist(s,{setItem:(_,v)=>{value=v}});expect(load({getItem:()=>value})).toEqual(s)
 expect(load({getItem:()=> 'broken'}).version).toBe(1)
 })
})
