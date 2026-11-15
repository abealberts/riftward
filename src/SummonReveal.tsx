import {useEffect,useRef,useState} from 'react'
import {names,rarity,rarityTier,roles,sprite,stats,type Fighter} from './data'
import './summon.css'

type Props={fighter:Fighter;remaining:number;total:number;onAdvance:()=>void}

export function SummonReveal({fighter,remaining,total,onAdvance}:Props){
  const modal=useRef<HTMLDialogElement>(null)
  const [ready,setReady]=useState(false)
  const tier=rarityTier(fighter.kind)
  useEffect(()=>{
    const dialog=modal.current!
    dialog.showModal()
    return ()=>dialog.close()
  },[])
  function continueReveal(){
    if(ready)onAdvance()
    else setReady(true)
  }
  return <dialog ref={modal} className={'summon-screen tier-'+tier} aria-label="Summon reveal"
    onCancel={event=>{event.preventDefault();continueReveal()}} onClick={continueReveal}>
    <div className={'summon-panel '+(ready?'unveiled':'')}>
      <small>Summon {total-remaining+1} of {total}</small>
      <div className="apparition">
        {Array.from({length:tier},(_,i)=><i key={i} className={'sigil sigil-'+i}/>)}
        <img src={sprite(fighter.kind)} alt="" onAnimationEnd={()=>setReady(true)}/>
      </div>
      <div className="summon-info" aria-live="polite">{ready&&<>
        <small className={rarity(fighter.kind)}>{rarity(fighter.kind)} · {roles[fighter.kind%3]}</small>
        <h2>{names[fighter.kind]}</h2>
        <dl>{Object.entries(stats({...fighter,xp:0})).map(([label,value])=><div key={label}><dt>{label.toUpperCase()}</dt><dd>{value}</dd></div>)}</dl>
      </>}</div>
      <button autoFocus>{!ready?'Reveal now':remaining===1?'Tap to finish':'Tap to continue'}</button>
    </div>
  </dialog>
}
