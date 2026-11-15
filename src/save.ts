import {missions,names,stats,pullCost,rollKind,rarityTier,maxStars,type Fighter} from './data'
export type Run={mission:number;encounter:number;hp:number[];enemy?:number;enemies?:number[];paidXP?:number;turn?:number;seed:number}
export type Save={pendingSummons?:string[];summonCount?:number;version:1;fighters:Fighter[];formation:(string|null)[];xp:number;coins:number;cleared:number;run:Run|null;victory?:{mission:number;encounter:number;xp:number;coins:number}}
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

export type SummonRoll={rarityRoll:number;unitRoll:number;id:string}
export function summonBatch(save:Save,rolls:SummonRoll[]):Save{
 const cost=rolls.length*pullCost
 if((rolls.length!==1&&rolls.length!==10)||save.coins<cost||save.pendingSummons?.length)return save
 const fighters=rolls.map(({id,rarityRoll,unitRoll})=>({id,kind:rollKind(rarityRoll,unitRoll),xp:0}))
 return {...save,coins:save.coins-cost,fighters:[...save.fighters,...fighters],summonCount:rolls.length,pendingSummons:fighters.map(f=>f.id)}
}
export function advanceSummon(save:Save,id:string):Save{
 if(save.pendingSummons?.[0]!==id)return save
 return {...save,pendingSummons:save.pendingSummons.slice(1)}
}

export function fuse(save:Save,recipientId:string,donorIds:string[]):Save{
 const recipient=save.fighters.find(f=>f.id===recipientId)
 const ids=new Set(donorIds)
 if(!recipient||!ids.size||ids.has(recipientId)||save.pendingSummons?.length)return save
 if(save.run&&save.formation.some(id=>id!==null&&(id===recipientId||ids.has(id))))return save
 const donors=save.fighters.filter(f=>ids.has(f.id))
 if(donors.length!==ids.size)return save
 const extraXP=donors.reduce((sum,f)=>sum+20*(1+rarityTier(f.kind))+f.xp,0)
 const matches=donors.filter(f=>f.kind===recipient.kind).length
 const stars=Math.min(maxStars(recipient.kind),(recipient.stars??1)+matches)
 return {...save,formation:save.formation.map(id=>id&&ids.has(id)?null:id),
   fighters:save.fighters.filter(f=>!ids.has(f.id)).map(f=>f.id===recipientId?{...f,xp:f.xp+extraXP,stars}:f)}
}
