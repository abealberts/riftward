import React,{useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {names,roles,skills,rarities,missions,stats,level,type Fighter} from './data'
import {Battle} from './Battle'
import {fresh,begin,finish,load,persist,party} from './save'
import './style.css'

const tabs=['Home','Party','Missions','Collection']
const paths=['M3 10 12 3l9 7v10h-6v-7H9v7H3z','M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z','m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15m6-12v15','m12 2 9 5-9 5-9-5z M3 12l9 5 9-5 M3 17l9 5 9-5']
function Icon({i}:{i:number}){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d={paths[i]}/></svg>}
const art=(n:number)=>'./art/'+n+'.png'
function Card({f,onClick,active=false}:{f:Fighter;onClick:()=>void;active?:boolean}){
 const k=f.kind
 return <button className={'card tint'+k%3+(active?' active':'')} onClick={onClick}><div className="portrait"><small>LV {String(level(f.xp)).padStart(2,'0')}</small><img src={art(k)} alt=""/></div><div className="caption"><strong>{names[k]}</strong><span><b>◆</b> {roles[k%3]}</span></div></button>
}
function App(){
 const [s,set]=useState(()=>load(localStorage)),[tab,T]=useState(s.run||s.victory?'Missions':'Home'),[selected,S]=useState<string|null>(null),[detail,D]=useState<Fighter|null>(null),[notice,N]=useState(''),[error,E]=useState('')
 useEffect(()=>{try{persist(s,localStorage)}catch{E('Browser storage is unavailable. Progress lasts for this session.')}},[s])
 const members=party(s),r=s.run,m=missions[r?.mission??Math.min(s.cleared,2)],ready=members.filter(Boolean).length
 function nav(t:string){T(t);S(null);N('')}
 function launch(i:number){if(s.victory){nav('Missions');return}if(ready!==9){nav('Party');N('Fill all nine slots to start an expedition.');return}
 set(begin(s,i,crypto.getRandomValues(new Uint32Array(1))[0]));nav('Missions')}
 function place(index:number){if(r)return;const form=[...s.formation]
 if(!selected){S(form[index]);return}
 const prev=form.indexOf(selected);if(prev>=0)form[prev]=form[index];form[index]=selected;set({...s,formation:form});S(null)}
 function advance(hp:number[],won:boolean){if(!r)return;set(prev=>prev.run===r?finish(prev,hp,won):prev);N(won?'':'Party defeated. Regroup and try again.')}

 const grid=()=><div className="grid">{members.map((f,i)=><button key={i} disabled={!!r} className={'slot '+(selected&&selected===f?.id?'active ':'')} onClick={()=>place(i)}><small>{String(i+1).padStart(2,'0')}</small>{f?<><img src={art(f.kind)} alt=""/><strong>{names[f.kind]}</strong></>:'Empty'}</button>)}</div>
 return <div className="shell"><aside><a className="brand" href="#home" onClick={()=>nav('Home')}><svg viewBox="0 0 42 42" width="35" fill="currentColor"><path d="M3 5l15 7 3 10 3-10 15-7-6 14-7 3-5 15-5-15-7-3z"/></svg>RIFTWARD</a><p className="label navlabel">COMMAND</p><nav>{tabs.map((t,i)=><button key={t} className={tab===t?'current':''} onClick={()=>nav(t)}><Icon i={i}/>{t}</button>)}</nav><div className="profile"><div className="avatar">◇</div><div><strong>Commander</strong><small>LEVEL {level(s.xp)}</small></div></div></aside>
 <main><header><span>Command center <em>/</em> <b>{tab}</b></span><span className="shards">◆ &nbsp;{s.coins} shards</span></header>
 <section><div className="label eyebrow"><i/> {tab==='Home'?'COMMAND OVERVIEW':tab.toUpperCase()+' MANAGEMENT'}</div><h1>{tab==='Home'?'Command deck':tab==='Party'?'Party formation':tab==='Missions'?'Expeditions':'Fighter collection'}</h1>
 {(notice||error)&&<p role="status" className="message">{error||notice}</p>}
 {tab==='Home'&&<><div className="hero"><div className="heroCopy"><span className="tag">◆ &nbsp; {r?'ACTIVE EXPEDITION':'CAMPAIGN MISSION'} &nbsp; / &nbsp; 0{(r?.mission??Math.min(s.cleared,2))+1}</span><h2>{m.name}</h2><p>{m.region} <em>•</em> 3 encounters</p><button className="primary" onClick={()=>r?nav('Missions'):launch(Math.min(s.cleared,2))}>{r?'Resume expedition':'Launch expedition'} &nbsp; →</button></div></div>
 <div className="metrics">{[['Party strength',members.reduce((a,f)=>a+(f?stats(f).atk:0),0),'Combined ATK'],['Campaign',s.cleared+' / 3','Missions cleared'],['Collection',s.fighters.length,'Fighters owned']].map(([title,value,desc],i)=><div key={title}><Icon i={i+1}/><div><span>{title}</span><strong>{value}</strong><small>{desc}</small></div></div>)}</div>
 <div className="sectionhead"><h2>Active party <small>{ready} / 9</small></h2><button onClick={()=>nav('Party')}>Manage party →</button></div><div className="cards">{members.filter((f):f is Fighter=>!!f).map(f=><Card key={f.id} f={f} onClick={()=>D(f)}/>)}</div></>}
 {tab==='Party'&&<><p>{r?'Formation is locked during your expedition.':'Select a fighter or occupied slot, then select its destination.'}</p><div className="actions"><button disabled={!!r} onClick={()=>{set({...s,formation:s.fighters.slice().sort((a,b)=>stats(b).atk-stats(a).atk).slice(0,9).map(f=>f.id)});S(null)}}>Auto-fill formation</button><button disabled={!!r||!selected||!s.formation.includes(selected)} onClick={()=>{set({...s,formation:s.formation.map(id=>id===selected?null:id)});S(null)}}>Remove selected</button></div>{grid()}<h2>Available fighters</h2><div className="cards">{s.fighters.map(f=><Card key={f.id} f={f} active={f.id===selected} onClick={()=>S(f.id)}/>)}</div></>}
 {tab==='Collection'&&<><p>{s.fighters.length} owned fighters · Select a fighter to inspect its attributes.</p><div className="cards">{s.fighters.map(f=><Card key={f.id} f={f} onClick={()=>D(f)}/>)}</div></>}
 {tab==='Missions'&&s.victory&&<div className="victory" role="region" aria-label="Victory rewards"><small>{missions[s.victory.mission].name} · Encounter {s.victory.encounter+1} / 3</small><h2>Encounter victory</h2><p>{s.victory.encounter===2?'Mission cleared.':'The enemy formation has fallen.'}</p><dl><div><dt>Account XP</dt><dd>+{s.victory.xp}</dd></div><div><dt>XP per party fighter</dt><dd>+{s.victory.xp}</dd></div>{s.victory.coins>0&&<div><dt>Shards</dt><dd>+{s.victory.coins}</dd></div>}</dl><button className="primary" onClick={()=>set(prev=>({...prev,victory:undefined}))}>{s.victory.encounter===2?'Return to missions':'Next encounter'} →</button></div>}
 {tab==='Missions'&&!s.victory&&!r&&missions.map((a,i)=><article key={a.name}><div className="label">MISSION 0{i+1} · {a.region}</div><h2>{a.name}</h2><p>3 encounters · {a.xp} XP · {a.coins} shards</p><button className="primary" disabled={i>s.cleared} onClick={()=>launch(i)}>{i>s.cleared?'Locked':i<s.cleared?'Replay mission':'Launch expedition'}</button></article>)}
 {tab==='Missions'&&!s.victory&&r&&<Battle key={[r.mission,r.encounter,r.turn??1].join('-')} team={members as Fighter[]} run={r} next={run=>set({...s,run})} finish={advance}/>}
 <footer><span>RIFTWARD &nbsp; / &nbsp; v0.1</span><button onClick={()=>{if(confirm('Erase your Riftward progress and start again?')){set(fresh());D(null);nav('Home')}}}>Reset save</button></footer></section></main>
 {detail&&<dialog open aria-label="Fighter details" onKeyDown={e=>{if(e.key==='Escape')D(null)}}><button autoFocus className="close" onClick={()=>D(null)}>Close ×</button><img src={art(detail.kind)} alt=""/><p className="label">{rarities[detail.kind%3]} · {roles[detail.kind%3]}</p><h2>{names[detail.kind]}</h2><p>Level {level(detail.xp)} · {detail.xp%40} / 40 XP</p><p>{Object.entries(stats(detail)).map(([k,v])=>k.toUpperCase()+' '+v).join('　')}</p><strong>{skills[detail.kind%3]}</strong><p>25% chance to strike with 155% attack power.</p></dialog>}</div>
}
createRoot(document.getElementById('root')!).render(<App/>)
