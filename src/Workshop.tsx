import {useEffect, useRef, useState} from 'react';
import {t, type Language} from './i18n';

const stations = [
  {x:2,y:1,style:'bench',label:'Bancada',detail:'Limas, alicates e parafusos, todos separados por tamanho.'},
  {x:6,y:1,style:'model',label:'Maquete do barco',detail:'O casco é de madeira e a vela é um retalho de pano azul.'},
] as const;

export function Workshop({language,onClose}:{language:Language;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [position,setPosition]=useState({x:4,y:4});
  const [detail,setDetail]=useState('');
  const tr=(label:string)=>t(label,language);
  const station=stations.find(item=>Math.abs(item.x-position.x)+Math.abs(item.y-position.y)===1);

  useEffect(()=>{
    const element=dialog.current!;
    element.showModal();
    return()=>element.close();
  },[]);

  function move(dx:number,dy:number){
    setPosition(current=>{
      const x=current.x+dx,y=current.y+dy;
      if(x<0||x>8||y<0||y>4||stations.some(item=>item.x===x&&item.y===y))return current;
      return {x,y};
    });
  }

  return <dialog ref={dialog} className="character-dialog workshop" aria-labelledby="workshop-title"
    onCancel={event=>{event.preventDefault();onClose()}}
    onKeyDown={event=>{
      const direction:Record<string,[number,number]>={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
      const step=direction[event.key.toLowerCase()];
      if(!step)return;
      event.preventDefault();
      event.stopPropagation();
      move(...step);
    }}>
    <h2 id="workshop-title">{tr('Oficina do Theo')}</h2>
    <div className="workshop-room" aria-hidden="true">
      {stations.map(item=><div key={item.style} className={`workshop-prop ${item.style}`} style={{gridColumn:item.x+1,gridRow:item.y+1}}/>)}
      <div className="workshop-door"/>
      <div className="workshop-player" style={{gridColumn:position.x+1,gridRow:position.y+1}}/>
    </div>
    <p>{tr('Usa WASD, as setas ou os botões para explorar. Aproxima-te de um objeto para o examinar.')}</p>
    <div className="workshop-actions">
      {([['Mover up','↑',0,-1],['Mover left','←',-1,0],['Mover down','↓',0,1],['Mover right','→',1,0]] as const).map(([label,arrow,x,y])=>
        <button key={label} type="button" className="resident-route-toggle" aria-label={tr(label)} onClick={()=>move(x,y)}>{arrow}</button>)}
      <button type="button" className="resident-route-toggle" onClick={onClose}>{tr('Sair da oficina')}</button>
    </div>
    <div className="workshop-inspection">
      {stations.map(item=><button key={item.style} type="button"
        className="resident-route-toggle" disabled={station!==item}
        style={{visibility:station===item?'visible':'hidden'}}
        onClick={()=>setDetail(item.detail)}>
        {tr('Examinar')}: {tr(item.label)}
      </button>)}
    </div>
    <div className="workshop-inspection">
      {stations.map(item=><p key={item.style} aria-hidden="true" className="workshop-detail-placeholder">{tr(item.detail)}</p>)}
      <p role="status">{detail&&tr(detail)}</p>
    </div>
  </dialog>;
}
