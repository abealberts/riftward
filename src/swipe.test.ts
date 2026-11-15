import {describe,it,expect} from 'vitest'
import {swipeRoute} from './swipe'
import {routes} from './engine'

describe('board swipes',()=>{
 it('recognizes every row and diagonal in either direction with only down and up samples',()=>{
   for(const [id,line] of routes.entries()){
     const point=(slot:number)=>({x:slot%3+.08,y:Math.floor(slot/3)+.93})
     expect(swipeRoute([point(line[0]),point(line[2])])).toBe(id)
   }
 })
 it('accepts diagonal corner jitter, off-center starts and an edge release',()=>{
   expect(swipeRoute([{x:.02,y:.06},{x:1.06,y:.91},{x:1.91,y:2.12},{x:3,y:2.85}])).toBe(3)
 })
 it('rejects taps, partial rows, vertical swipes, right angles and backtracking',()=>{
   const p=(x:number,y:number)=>({x,y})
   for(const path of [[p(.5,.5),p(.5,.5)],[p(.4,.5),p(1.7,.5)],[p(.5,.5),p(.5,2.5)],[p(.5,.5),p(.5,2.5),p(2.5,2.5)],[p(.5,.5),p(2,.5),p(.7,.5),p(2.5,.5)]])
     expect(swipeRoute(path)).toBe(-1)
 })
})
