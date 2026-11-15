import {missions,names,stats,pullCost,rollKind,type Fighter} from './data'
export type Run={mission:number;encounter:number;hp:number[];enemy?:number;enemies?:number[];paidXP?:number;turn?:number;seed:number}
export type Save={version:1;fighters:Fighter[];formation:(string|null)[];xp:number;coins:number;cleared:number;run:Run|null;victory?:{mission:number;encounter:number;xp:number;coins:number}}
export const key='riftward.v1'
export function fresh():Save{
 const fighters=names.slice(0,12).map((_,kind)=>({kind,id:crypto.randomUUID(),xp:0}))
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
 const mission=missions[r.mission],last=r.encounter===2
 const earned=Math.floor(mission.xp*(r.encounter+1)/3)
 const xp=earned-(r.paidXP??0),coins=last?mission.coins:0
 return {...s,xp:s.xp+xp,coins:s.coins+coins,cleared:last?Math.max(s.cleared,r.mission+1):s.cleared,
   fighters:s.fighters.map(f=>s.formation.includes(f.id)?{...f,xp:f.xp+xp}:f),
   victory:{mission:r.mission,encounter:r.encounter,xp,coins},
   run:last?null:{mission:r.mission,encounter:r.encounter+1,seed:(r.seed+1)>>>0,hp,paidXP:earned}}

}
export function load(store:Pick<Storage,'getItem'>):Save{
 try{const s=JSON.parse(store.getItem(key)||'null')
 if(s?.version===1 && Array.isArray(s.fighters)&&s.formation?.length===9)return s}catch{/* No readable save. */}
 return fresh()
}
export const persist=(s:Save,store:Pick<Storage,'setItem'>)=>store.setItem(key,JSON.stringify(s))

export function summon(save:Save,rarityRoll:number,unitRoll:number,id:string):Save{
 if(save.coins<pullCost)return save
 const fighter={id,kind:rollKind(rarityRoll,unitRoll),xp:0}
 return {...save,coins:save.coins-pullCost,fighters:[...save.fighters,fighter]}
}
