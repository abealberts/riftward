import React,{useEffect,useRef,useState} from 'react'
import {battle,enemyHP,identifyRoute,lines,routes} from './engine'
import {missions,names,type Fighter} from './data'
import type {Run} from './save'
import './battle.css'

type Props={team:Fighter[];run:Run;next:(run:Run)=>void;finish:(hp:number[],won:boolean)=>void}
const sprite=(kind:number)=>'./art/'+kind+'.png'
const lineNames=['Upper row','Middle row','Lower row','Falling diagonal','Rising diagonal']
export function Battle({team,run,next,finish}:Props){
 const [ids,setIds]=useState<number[]>([]),[trail,setTrail]=useState<number[]>([]),[hint,setHint]=useState('')
 const [result,setResult]=useState<ReturnType<typeof battle>|null>(null),[position,setPosition]=useState(0),[speed,setSpeed]=useState(1)
 const pointer=useRef<{id:number;slots:number[];x:number;y:number}|null>(null)
 const mission=missions[run.mission], max=enemyHP(run.mission,run.encounter)
 const frame=result?.frames[position-1],hp=frame?.hp??run.hp,enemy=frame?.enemy??run.enemy??max
 const index=frame?.line??(result?0:Math.max(0,ids.length-1)),active=routes[ids[index]]??lines[0]
 const done=!!result&&position===result.frames.length
 useEffect(()=>{
   if(!result||done)return
   const timer=setTimeout(()=>setPosition(p=>p+1),650/speed)
   return ()=>clearTimeout(timer)
 },[result,position,speed,done])
 function select(id:number){
   if(result)return
   if(id<0){setHint('Trace one straight row or diagonal through three fighters.');return}
   if(ids.some(i=>i%lines.length===id%lines.length)){setHint('That line is already queued. Choose a different line.');return}
   const selection=[...ids,id]
   setIds(selection);setHint('')
   if(selection.length===3)setResult(battle(team,run.hp,selection,run.mission,run.encounter,run.seed,run.enemy))
 }
 function slotAt(board:HTMLDivElement,x:number,y:number){
   const rect=board.getBoundingClientRect(),col=Math.floor(3*(x-rect.left)/rect.width),row=Math.floor(3*(y-rect.top)/rect.height)
   if(col<0||col>2||row<0||row>2)return -1
   if(Math.abs(3*(x-rect.left)/rect.width-col-.5)>.39||Math.abs(3*(y-rect.top)/rect.height-row-.5)>.39)return -2
   return row*3+col
 }
 function trace(e:React.PointerEvent<HTMLDivElement>){
   const gesture=pointer.current
   if(!gesture||gesture.id!==e.pointerId)return
   const steps=Math.max(1,Math.ceil(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)/8))
   for(let i=1;i<=steps;i++){
     const slot=slotAt(e.currentTarget,gesture.x+(e.clientX-gesture.x)*i/steps,gesture.y+(e.clientY-gesture.y)*i/steps)
     if(slot!==-2&&slot!==gesture.slots.at(-1))gesture.slots.push(slot)
   }
   gesture.x=e.clientX;gesture.y=e.clientY;setTrail([...gesture.slots])
 }
 function advance(){
   if(!result)return
   if(result.won||result.hp.every(n=>!n))finish(result.hp,result.won)
   else next({...run,hp:result.hp,enemy:result.enemy,seed:result.seed,turn:(run.turn??1)+1})
 }
 return <div className="battle">
 <div className="arena"><div className="arenaTop"><div><small>{mission.name} · Encounter {run.encounter+1}/3</small><h2>{mission.foe}</h2></div><span>TURN {run.turn??1}</span></div>
 <div className="enemyHealth"><meter min={0} max={max} value={enemy}/><small>{enemy} / {max} HP</small></div>
 <div className="stage" key={position}><div className="squad">{active.map(slot=><div key={slot} className={'actor '+(!hp[slot]?'fallen ':'')+(frame?.slot===slot?(frame.side==='ally'?'strike':'hurt'):'')}><img src={sprite(team[slot].kind)} alt={names[team[slot].kind]}/><small>{names[team[slot].kind]}</small>{frame?.side==='enemy'&&frame.slot===slot&&<b>−{frame.amount}</b>}</div>)}</div><div className={'foe '+(frame?.side==='enemy'?'counter':frame?'hurt':'')}><img src={sprite([4,7,11][run.mission])} alt={mission.foe}/>{frame?.side==='ally'&&<b>−{frame.amount}</b>}</div></div>
 <div className="ticker"><strong>{result?'LINE '+(index+1):'FORMATION'}</strong>{frame?.text??(result?'First line advancing…':'Ready your attack lines.')}</div></div>
 <div className="tactics"><div><h2>Attack formation</h2><p>Swipe through a row or diagonal in either direction.</p>
 <div className="swipeboard" onPointerDown={e=>{if(result||pointer.current||e.button!==0)return;const slot=slotAt(e.currentTarget,e.clientX,e.clientY);pointer.current={id:e.pointerId,slots:slot===-2?[]:[slot],x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);setTrail([slot])}} onPointerMove={trace} onPointerUp={e=>{if(pointer.current?.id!==e.pointerId)return;trace(e);select(identifyRoute(pointer.current.slots));pointer.current=null;setTrail([])}} onLostPointerCapture={()=>{pointer.current=null;setTrail([])}}>
 {team.map((f,i)=><div key={i} className={'swipeCell '+(trail.includes(i)?'traced':'')}><img draggable={false} src={sprite(f.kind)} alt={names[f.kind]}/><small>{i+1} · {hp[i]} HP</small></div>)}
 <svg viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">{[...ids.map(id=>routes[id]),trail].map((slots,i)=><polyline key={i} points={slots.filter(s=>s>=0).map(s=>(s%3*100+50)+','+(Math.floor(s/3)*100+50)).join(' ')} stroke={['#ccff85','#feb870','#bcacff','#fff'][i]}/>)}</svg></div></div>
 <div className="orders"><h2>Attack sequence</h2><p>Queue three different lines. Shared fighters attack again.</p><ol>{[0,1,2].map(i=><li className={result&&i===index?'playing':''} key={i}><small>0{i+1}</small>{ids[i]===undefined?'Awaiting swipe':lineNames[ids[i]%5]+' · '+routes[ids[i]].map(n=>n+1).join('→')}</li>)}</ol>
 {hint&&<p role="status">{hint}</p>}
 <div className="actions">{!result&&<button disabled={!ids.length} onClick={()=>{setIds(ids.slice(0,-1));setHint('')}}>Undo line</button>}<button onClick={()=>setSpeed(speed===4?1:speed*2)}>Playback {speed}×</button>{result&&!done&&<button onClick={()=>setPosition(result.frames.length)}>Skip playback</button>}</div>
 {!result&&<details><summary>Choose lines with buttons</summary>{lines.map((l,i)=><button key={i} disabled={ids.some(id=>id%5===i)} onClick={()=>select(i)}>{lineNames[i]} · {l.map(s=>s+1).join('→')}</button>)}</details>}
 {done&&<button className="primary" onClick={advance}>{result.won?(run.encounter===2?'Claim rewards':'Next encounter'):result.hp.some(Boolean)?'Choose next turn':'Return to missions'} →</button>}</div></div>
 {!!position&&result&&<details><summary>Battle log · {position} actions</summary><div className="log">{result.frames.slice(0,position).reverse().map((f,i)=><div key={i}>{f.text}</div>)}</div></details>}</div>
}
