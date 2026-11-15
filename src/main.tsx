import React,{useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {names,roles,skills,rarity,sprite,pullCost,pullWeights,rarities,missions,stats,level,type Fighter} from './data'
import {SummonReveal} from './SummonReveal'
import {Battle} from './Battle'
import {fresh,begin,finish,load,persist,party,summonBatch,advanceSummon} from './save'
import './style.css'

const destinations=['Missions','Party','Collection','Summoning'] as const
const paths=['M3 10 12 3l9 7v10h-6v-7H9v7H3z','M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z','m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15m6-12v15','m12 2 9 5-9 5-9-5z M3 12l9 5 9-5 M3 17l9 5 9-5','m12 2 7 8-7 12-7-12z M5 10h14 M12 2v20']
function Icon({i}:{i:number}){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d={paths[i]}/></svg>}
const art=sprite
function Card({f,onClick,active=false}:{f:Fighter;onClick:()=>void;active?:boolean}){
 const k=f.kind
 return <button className={'card tint'+k%3+(active?' active':'')} onClick={onClick}><div className="portrait"><small>LV {String(level(f.xp)).padStart(2,'0')}</small><img src={art(k)} alt=""/></div><div className="caption"><strong>{names[k]}</strong><span><b className={rarity(k)}>◆ {rarity(k)}</b> · {roles[k%3]}</span></div></button>
}
function App(){
 const [s,set]=useState(()=>load(localStorage)),[tab,T]=useState(s.pendingSummons?.length?'Summoning':s.run||s.victory?'Missions':'Home'),[selected,S]=useState<string|null>(null),[detail,D]=useState<Fighter|null>(null),[notice,N]=useState(''),[error,E]=useState('')
 const pending=s.pendingSummons??[]
 const pulled=s.fighters.find(f=>f.id===pending[0])
 function pull(count:1|10){
   if(s.coins<count*pullCost||pending.length)return
   const rolls=Array.from({length:count},()=>{
     const [rarityRoll,unitRoll]=crypto.getRandomValues(new Uint32Array(2))
     return {id:crypto.randomUUID(),rarityRoll:rarityRoll/4294967296,unitRoll:unitRoll/4294967296}
   })
   set(prev=>summonBatch(prev,rolls))
 }
 useEffect(()=>{try{persist(s,localStorage)}catch{E('Browser storage is unavailable. Progress lasts for this session.')}},[s])
 const members=party(s),r=s.run,m=missions[r?.mission??Math.min(s.cleared,2)],ready=members.filter(Boolean).length
 function nav(t:string){T(t);S(null);N('');window.scrollTo(0,0)}
 function launch(i:number){if(s.victory){nav('Missions');return}if(ready!==9){nav('Party');N('Fill all nine slots to start an expedition.');return}
 set(begin(s,i,crypto.getRandomValues(new Uint32Array(1))[0]));nav('Missions')}
 function place(index:number){if(r)return;const form=[...s.formation]
 if(!selected){S(form[index]);return}
 const prev=form.indexOf(selected);if(prev>=0)form[prev]=form[index];form[index]=selected;set({...s,formation:form});S(null)}
 function advance(hp:number[],won:boolean){if(!r)return;set(prev=>prev.run===r?finish(prev,hp,won):prev);N(won?'':'Party defeated. Regroup and try again.')}

 const grid=()=><div className="grid">{members.map((f,i)=><button key={i} disabled={!!r} className={'slot '+(selected&&selected===f?.id?'active ':'')} onClick={()=>place(i)}><small>{String(i+1).padStart(2,'0')}</small>{f?<><img src={art(f.kind)} alt=""/><strong>{names[f.kind]}</strong><span className={rarity(f.kind)}>{rarity(f.kind)}</span></>:'Empty'}</button>)}</div>
 return <div className="game-shell"><main>
 <header className="hud"><button className="wordmark" onClick={()=>nav('Home')} aria-label="Vagrant's Flame home">VAGRANT'S FLAME</button><span>Lv. {level(s.xp)}</span><span className="wallet">◆ {s.coins} shards</span></header>
 <section className="game-page">
 {tab!=='Home'&&<div className="page-title"><button onClick={()=>nav('Home')}>‹ Home</button><h1>{tab}</h1></div>}
 {(notice||error)&&<p role="status" className="message">{error||notice}</p>}
 {tab==='Home'&&<>
   <div className="citadel"><h1>Vagrant's Flame</h1><div className="camp-party">{members.slice(0,3).map(f=>f&&<img key={f.id} src={sprite(f.kind)} alt={names[f.kind]}/>)}</div></div>
   <nav className="game-menu" aria-label="Home destinations">{destinations.map((destination,i)=><button key={destination} className={'menu-tile tile-'+i} onClick={()=>nav(destination)}>
   <span className="tile-icon"><Icon i={[2,1,3,4][i]}/></span><span className="tile-copy"><strong>{destination}</strong><small>{[s.victory?'Encounter rewards':r?'Resume '+m.name:m.name,ready+' / 9 in formation',s.fighters.length+' fighters',pullCost+' shards per pull'][i]}</small></span><span aria-hidden="true">›</span>
   </button>)}</nav>
 </>}
 {tab==='Party'&&<><p>{r?'Formation is locked during your expedition.':'Select a fighter or occupied slot, then select its destination.'}</p><div className="actions"><button disabled={!!r} onClick={()=>{set({...s,formation:s.fighters.slice().sort((a,b)=>stats(b).atk-stats(a).atk).slice(0,9).map(f=>f.id)});S(null)}}>Auto-fill formation</button><button disabled={!!r||!selected||!s.formation.includes(selected)} onClick={()=>{set({...s,formation:s.formation.map(id=>id===selected?null:id)});S(null)}}>Remove selected</button></div>{grid()}<h2>Available fighters</h2><div className="cards">{s.fighters.map(f=><Card key={f.id} f={f} active={f.id===selected} onClick={()=>S(f.id)}/>)}</div></>}
 {tab==='Summoning'&&<article className="summoning"><div><div className="label">Shard summoning</div><h2>Summon a fighter</h2><p>One level 1 fighter per pull. Duplicates join as separate fighters.</p><button className="primary" disabled={s.coins<pullCost} onClick={()=>pull(1)}>Summon ×1 · {pullCost} shards</button> <button className="primary" disabled={s.coins<10*pullCost} onClick={()=>pull(10)}>Summon ×10 · {10*pullCost} shards</button><p>{s.coins<pullCost?'Earn shards by clearing missions.':s.coins+' shards available'}</p><details><summary>Summoning pool and odds</summary>{rarities.map((r,i)=><p key={r}><strong className={r}>{r} · {pullWeights[i]}%</strong><br/>{names.filter((_,kind)=>rarity(kind)===r).join(', ')}</p>)}</details></div><div className="altar"><span className="summonGem" aria-hidden="true">◆</span></div></article>}
 {tab==='Collection'&&<><p>{s.fighters.length} owned fighters · Select a fighter to inspect its attributes.</p><div className="cards">{s.fighters.map(f=><Card key={f.id} f={f} onClick={()=>D(f)}/>)}</div></>}
 {tab==='Missions'&&s.victory&&<div className="victory" role="region" aria-label="Victory rewards"><small>{missions[s.victory.mission].name} · Encounter {s.victory.encounter+1} / 3</small><h2>Encounter victory</h2><p>{s.victory.encounter===2?'Mission cleared.':'The enemy formation has fallen.'}</p><dl><div><dt>Account XP</dt><dd>+{s.victory.xp}</dd></div><div><dt>XP per party fighter</dt><dd>+{s.victory.xp}</dd></div>{s.victory.coins>0&&<div><dt>Shards</dt><dd>+{s.victory.coins}</dd></div>}</dl><button className="primary" onClick={()=>set(prev=>({...prev,victory:undefined}))}>{s.victory.encounter===2?'Return to missions':'Next encounter'} →</button></div>}
 {tab==='Missions'&&!s.victory&&!r&&missions.map((a,i)=><article key={a.name}><div className="label">MISSION 0{i+1} · {a.region}</div><h2>{a.name}</h2><p>3 encounters · {a.xp} XP · {a.coins} shards</p><button className="primary" disabled={i>s.cleared} onClick={()=>launch(i)}>{i>s.cleared?'Locked':i<s.cleared?'Replay mission':'Launch expedition'}</button></article>)}
 {tab==='Missions'&&!s.victory&&r&&<Battle key={[r.mission,r.encounter,r.turn??1].join('-')} team={members as Fighter[]} run={r} next={run=>set({...s,run})} finish={advance}/>}
 {tab==='Cheat Menu'&&<article className="cheats"><h2>Grant shards</h2><p>Add shards to your summoning balance.</p><div className="actions">{[40,400,4000].map(amount=><button key={amount} onClick={()=>{set(prev=>({...prev,coins:prev.coins+amount}));N('Added '+amount+' shards.')}}>+{amount.toLocaleString()} shards</button>)}</div><button className="primary" onClick={()=>nav('Summoning')}>Go to Summoning →</button></article>}
 <footer><button onClick={()=>nav('Cheat Menu')}>Cheat Menu</button><span>VAGRANT'S FLAME &nbsp; / &nbsp; v0.1</span><button onClick={()=>{if(confirm("Erase your Vagrant's Flame progress and start again?")){set(fresh());D(null);nav('Home')}}}>Reset save</button></footer></section></main>
 {pulled&&<SummonReveal key={pulled.id} fighter={pulled} total={s.summonCount??pending.length} remaining={pending.length} onAdvance={()=>set(prev=>advanceSummon(prev,pulled.id))}/>}
 {detail&&<dialog open aria-label="Fighter details" onKeyDown={e=>{if(e.key==='Escape')D(null)}}><button autoFocus className="close" onClick={()=>D(null)}>Close ×</button><img src={art(detail.kind)} alt=""/><p className="label">{rarity(detail.kind)} · {roles[detail.kind%3]}</p><h2>{names[detail.kind]}</h2><p>Level {level(detail.xp)} · {detail.xp%40} / 40 XP</p><p>{Object.entries(stats(detail)).map(([k,v])=>k.toUpperCase()+' '+v).join('　')}</p><strong>{skills[detail.kind%3]}</strong><p>25% chance to strike with 155% attack power.</p></dialog>}</div>
}
createRoot(document.getElementById('root')!).render(<App/>)
