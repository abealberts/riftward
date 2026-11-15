import {useEffect,useRef,useState} from 'react'
import {names,roles,level,maxStars,power,rarity,rarityTier,skills,sprite,stats,type Fighter} from './data'
import {fuse,type Save} from './save'
import './collection.css'

type Props={save:Save;onFuse:(recipient:string,donors:string[])=>void}
export function Collection({save,onFuse}:Props){
 const [sort,setSort]=useState('Rarity'),[selected,select]=useState<string|null>(null)
 const fighters=[...save.fighters].sort((a,b)=>{
   let order=0
   if(sort==='Rarity')order=rarityTier(b.kind)-rarityTier(a.kind)
   if(sort==='Level')order=level(b.xp)-level(a.xp)
   if(sort==='Class')order=roles[a.kind%3].localeCompare(roles[b.kind%3])
   if(sort==='Power')order=power(b)-power(a)
   return order||names[a.kind].localeCompare(names[b.kind])
 })
 const fighter=save.fighters.find(f=>f.id===selected)
 return <><div className="roster-tools"><span>{fighters.length} fighters</span><label>Sort by <select value={sort} onChange={e=>setSort(e.target.value)}>{['Rarity','Level','Class','Power'].map(option=><option key={option}>{option}</option>)}</select></label></div>
 <div className="roster-list">{fighters.map(f=><button key={f.id} onClick={()=>select(f.id)} className="roster-row">
 <img src={sprite(f.kind)} alt=""/><span><strong>{names[f.kind]}</strong><small><b className={rarity(f.kind)}>{rarity(f.kind)}</b> · {roles[f.kind%3]}</small><small>Lv. {level(f.xp)} · ★ {f.stars??1} · Power {power(f)}</small></span></button>)}</div>
 {fighter&&<FighterDetails key={fighter.id} fighter={fighter} save={save} onFuse={onFuse} close={()=>select(null)}/>}</>
}

function FighterDetails({save,onFuse,fighter,close}:Props&{fighter:Fighter;close:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null)
 const [selecting,setSelecting]=useState(false),[ids,setIds]=useState<string[]>([]),[message,setMessage]=useState('')
 useEffect(()=>{const el=dialog.current!;el.showModal();return ()=>el.close()},[])
 const projected=fuse(save,fighter.id,ids).fighters.find(f=>f.id===fighter.id)!
 const before=stats(fighter),after=stats(projected),xp=projected.xp-fighter.xp
 const locked=!!save.run&&save.formation.includes(fighter.id)
 return <dialog ref={dialog} className="fighter-sheet" aria-label="Fighter details" onCancel={close}>
 <button className="close" onClick={close}>Close ×</button><img src={sprite(fighter.kind)} alt=""/>
 <p className="label">{rarity(fighter.kind)} · {roles[fighter.kind%3]}</p><h2>{names[fighter.kind]}</h2>
 <p>Lv. {level(fighter.xp)}{xp>0&&' → '+level(projected.xp)} · ★ {fighter.stars??1}{(projected.stars??1)!==(fighter.stars??1)&&' → '+projected.stars} / {maxStars(fighter.kind)} · {fighter.xp%40}/40 XP</p>
 <dl>{(Object.keys(before) as (keyof typeof before)[]).map(k=><div key={k}><dt>{k.toUpperCase()}</dt><dd>{before[k]}{before[k]!==after[k]&&' → '+after[k]}</dd></div>)}</dl>
 <strong>{skills[fighter.kind%3]}</strong><p>25% chance to strike with 155% attack power.</p>
 {message&&<p role="status">{message}</p>}
 {selecting?<><h3>Choose fighters to consume</h3><p>Each matching fighter adds one star up to the cap. Each extra star adds 10% to base stats. Selected party members leave their slots.</p>
 <div className="donors">{save.fighters.filter(f=>f.id!==fighter.id).map(f=><label key={f.id}><input type="checkbox" checked={ids.includes(f.id)} disabled={!!save.run&&save.formation.includes(f.id)} onChange={e=>setIds(e.target.checked?[...ids,f.id]:ids.filter(id=>id!==f.id))}/><span>{names[f.kind]} · Lv. {level(f.xp)} · ★ {f.stars??1}{save.formation.includes(f.id)?' · Party':''}</span></label>)}</div>
 <div className="actions"><button onClick={()=>{setIds([]);setSelecting(false)}}>Cancel</button><button className="primary" disabled={!xp} onClick={()=>{onFuse(fighter.id,ids);setMessage('Fusion complete · +'+xp+' XP');setIds([]);setSelecting(false)}}>Consume {ids.length} · Gain {xp} XP</button></div></>:<><button className="primary" disabled={locked} onClick={()=>{setMessage('');setSelecting(true)}}>Fuse fighters</button>{locked&&<p>This fighter is on an active expedition.</p>}</>}
 </dialog>
}
