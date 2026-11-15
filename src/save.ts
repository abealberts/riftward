import {missions,names,stats,type Fighter} from './data'
export type Run={mission:number;encounter:number;hp:number[];enemy?:number;turn?:number;seed:number}
export type Save={version:1;fighters:Fighter[];formation:(string|null)[];xp:number;coins:number;cleared:number;run:Run|null}
export const key='riftward.v1'
export function fresh():Save{
 const fighters=names.map((_,kind)=>({kind,id:crypto.randomUUID(),xp:0}))
 return {version:1,fighters,formation:fighters.slice(0,9).map(f=>f.id),xp:0,coins:0,cleared:0,run:null}
}
export const party=(s:Save)=>s.formation.map(id=>s.fighters.find(f=>f.id===id))
export function begin(s:Save,mission:number,seed:number):Save{
 const members=party(s)
 if(s.run||mission>s.cleared||!missions[mission]||members.some(f=>!f))return s
 return {...s,run:{mission,seed,encounter:0,hp:members.map(f=>stats(f!).hp)}}
}
export function finish(s:Save,hp:number[],won:boolean):Save{
 const r=s.run
 if(!r)return s
 if(!won)return {...s,run:null}
 if(r.encounter<2)return {...s,run:{...r,hp,enemy:undefined,turn:1,encounter:r.encounter+1,seed:(r.seed+1)>>>0}}
 const m=missions[r.mission]
 return {...s,run:null,cleared:Math.max(s.cleared,r.mission+1),xp:s.xp+m.xp,coins:s.coins+m.coins,fighters:s.fighters.map(f=>s.formation.includes(f.id)?{...f,xp:f.xp+m.xp}:f)}
}
export function load(store:Pick<Storage,'getItem'>):Save{
 try{const s=JSON.parse(store.getItem(key)||'null')
 if(s?.version===1 && Array.isArray(s.fighters)&&s.formation?.length===9)return s}catch{/* No readable save. */}
 return fresh()
}
export const persist=(s:Save,store:Pick<Storage,'setItem'>)=>store.setItem(key,JSON.stringify(s))
