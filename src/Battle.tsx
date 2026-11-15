import React,{useEffect,useRef,useState} from 'react'
import {battle,initialEnemies,lines,routes} from './engine'
import {encounterEnemies,missions,names,sprite,stats,type Fighter} from './data'
import type {Run} from './save'
import {swipeRoute,touchCell,type Point} from './swipe'
import './battle.css'

type Props={team:Fighter[];run:Run;next:(run:Run)=>void;finish:(hp:number[],won:boolean)=>void}
const lineNames=['Upper row','Middle row','Lower row','Falling diagonal','Rising diagonal']
export function Battle({team,run,next,finish}:Props){
 const [ids,setIds]=useState<number[]>([]),[trail,setTrail]=useState<number[]>([]),[hint,setHint]=useState('')
 const [result,setResult]=useState<ReturnType<typeof battle>|null>(null),[position,setPosition]=useState(0),[speed,setSpeed]=useState(1)
 const pointer=useRef<{id:number;points:Point[]}|null>(null)
 const mission=missions[run.mission], roster=encounterEnemies(run.mission,run.encounter)
 const frame=result?.frames[position-1],hp=frame?.hp??run.hp,enemies=frame?.enemies??initialEnemies(run.mission,run.encounter,run.enemies??run.enemy)
 const index=frame?.line??(result?0:Math.max(0,ids.length-1)),active=routes[ids[index]]??lines[0]
 const done=!!result&&position===result.frames.length
 useEffect(()=>{
   if(!result||done)return
   const timer=setTimeout(()=>setPosition(p=>p+1),650/speed)
   return ()=>clearTimeout(timer)
 },[result,position,speed,done])
 useEffect(()=>{
   if(done&&result?.won)finish(result.hp,true)
 },[done,result,finish])
 function select(id:number){
   if(result)return
   if(id<0){setHint('Trace one straight row or diagonal through three fighters.');return}
   if(ids.some(i=>i%lines.length===id%lines.length)){setHint('That line is already queued. Choose a different line.');return}
   const selection=[...ids,id]
   setIds(selection);setHint('')
   if(selection.length===3)setResult(battle(team,run.hp,selection,run.mission,run.encounter,run.seed,run.enemies??run.enemy))
 }
 function boardPoint(e:React.PointerEvent<HTMLDivElement>):Point{
   const rect=e.currentTarget.getBoundingClientRect()
   // Clamp edge overshoot so releasing outside a corner still finishes that line.
   const coordinate=(offset:number,size:number)=>Math.max(0,Math.min(3,3*offset/size))
   return {x:coordinate(e.clientX-rect.left,rect.width),y:coordinate(e.clientY-rect.top,rect.height)}
 }
 function startSwipe(e:React.PointerEvent<HTMLDivElement>){
   if(result||pointer.current||e.button!==0)return
   const point=boardPoint(e)
   pointer.current={id:e.pointerId,points:[point]}
   e.currentTarget.setPointerCapture(e.pointerId)
   setTrail([touchCell(point)])
 }
 function trace(e:React.PointerEvent<HTMLDivElement>){
   const gesture=pointer.current
   if(gesture?.id!==e.pointerId)return
   const point=boardPoint(e)
   gesture.points.push(point)
   const route=swipeRoute(gesture.points)
   setTrail(route>=0?routes[route]:[touchCell(gesture.points[0]),touchCell(point)])
 }
 function cancelSwipe(e:React.PointerEvent<HTMLDivElement>){
   if(pointer.current?.id!==e.pointerId)return
   pointer.current=null
   setTrail([])
 }
 function endSwipe(e:React.PointerEvent<HTMLDivElement>){
   const gesture=pointer.current
   if(gesture?.id!==e.pointerId)return
   gesture.points.push(boardPoint(e))
   select(swipeRoute(gesture.points))
   cancelSwipe(e)
 }
 function advance(){
   if(!result)return
   if(result.won||result.hp.every(n=>!n))finish(result.hp,result.won)
   else next({...run,hp:result.hp,enemies:result.enemies,seed:result.seed,turn:(run.turn??1)+1})
 }
 return <div className="battle">
 <div className="arena"><div className="arenaTop"><div><small>{mission.name} · Encounter {run.encounter+1}/3</small><h2>{roster.length===1?mission.foe:'Enemy formation'}</h2></div><span>TURN {run.turn??1}</span></div>
 <div className="stage" key={position}><div className="squad">{active.map(slot=><div key={slot} className={'actor '+(!hp[slot]?'fallen ':'')+(frame?.slot===slot?(frame.side==='ally'?'strike':'hurt'):'')}><img src={sprite(team[slot].kind)} alt={names[team[slot].kind]}/><small>{names[team[slot].kind]}</small>{frame?.side==='enemy'&&frame.slot===slot&&<b>−{frame.amount}</b>}</div>)}</div><div className="enemySquad">{roster.map((foe,i)=><div key={foe.name} className={'foe '+(!enemies[i]?'fallen ':'')+(frame?.foe===i?(frame.side==='enemy'?'counter':'hurt'):'')}><img src={sprite(foe.kind)} alt=""/><small>{foe.name}</small><meter aria-label={foe.name+' health'} min={0} max={foe.maxHP} value={enemies[i]}/><small>{enemies[i]} / {foe.maxHP} HP</small>{frame?.side==='ally'&&frame.foe===i&&<b>−{frame.amount}</b>}</div>)}</div></div>
 <div className="ticker"><strong>{result?'LINE '+(index+1):'FORMATION'}</strong>{frame?.text??(result?'Resolving initiative…':'Ready your attack lines.')}</div></div>
 <div className="tactics"><div><h2>Attack formation</h2><p>Swipe through a row or diagonal in either direction.</p>
 <div className="swipeboard" onPointerDown={startSwipe} onPointerMove={trace} onPointerUp={endSwipe} onPointerCancel={cancelSwipe} onLostPointerCapture={cancelSwipe}>
 {team.map((f,i)=><div key={i} className={'swipeCell '+(trail.includes(i)?'traced':'')}><img draggable={false} src={sprite(f.kind)} alt={names[f.kind]}/><small>{i+1} · {hp[i]} HP</small></div>)}
 <svg viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">{[...ids.map(id=>routes[id]),trail].map((slots,i)=><polyline key={i} points={slots.filter(s=>s>=0).map(s=>(s%3*100+50)+','+(Math.floor(s/3)*100+50)).join(' ')} stroke={['#ccff85','#feb870','#bcacff','#fff'][i]}/>)}</svg></div></div>
 <div className="orders"><h2>Attack sequence</h2><p>Queue three lines. Higher AGI acts first across the turn. Ties follow swipe order.</p><ol>{[0,1,2].map(i=><li className={result&&i===index?'playing':''} key={i}><small>0{i+1}</small>{ids[i]===undefined?'Awaiting swipe':lineNames[ids[i]%5]+' · '+routes[ids[i]].map(n=>n+1).join('→')}</li>)}</ol>
 {hint&&<p role="status">{hint}</p>}
 <div className="actions">{!result&&<button disabled={!ids.length} onClick={()=>{setIds(ids.slice(0,-1));setHint('')}}>Undo line</button>}<button onClick={()=>setSpeed(speed===4?1:speed*2)}>Playback {speed}×</button>{result&&!done&&<button onClick={()=>setPosition(result.frames.length)}>Skip playback</button>}</div>
 {!result&&<details><summary>Choose lines with buttons</summary>{lines.map((l,i)=><button key={i} disabled={ids.some(id=>id%5===i)} onClick={()=>select(i)}>{lineNames[i]} · {l.map(s=>s+1).join('→')}</button>)}</details>}
 {done&&!result.won&&<button className="primary" onClick={advance}>{result.won?(run.encounter===2?'Claim rewards':'Next encounter'):result.hp.some(Boolean)?'Choose next turn':'Return to missions'} →</button>}</div></div>
 {!!position&&result&&<details><summary>Battle log · {position} actions</summary><div className="log">{result.frames.slice(0,position).reverse().map((f,i)=><div key={i}>{f.side==='ally'?stats(team[f.slot]).agi:roster[f.foe].agi} AGI · {f.text}</div>)}</div></details>}</div>
}
