import {useEffect, useRef, useState} from 'react';
import {t, type Language} from './i18n';

const exitTile = {x:4,y:4};

const workshopStations = [
  {x:2,y:1,style:'bench',label:'Bancada',detail:'Limas, alicates e parafusos, todos separados por tamanho.'},
  {x:6,y:1,style:'model',label:'Maquete do barco',detail:'O casco é de madeira e a vela é um retalho de pano azul.'},
  {x:4,y:0,style:'machine',label:'Ventoinha de bancada',detail:'A pequena hélice começa a rodar.'},
] as const;
const nurseryStations = [
  {x:2,y:1,style:'pots',label:'Vasos da Mira',detail:'As etiquetas dizem hortelã, tomilho e alecrim.'},
  {x:6,y:1,style:'plant',label:'Vaso de muda',detail:'A Mira deixou um pequeno regador ao lado do vaso.'},
] as const;
const inspectionMessages = ['A hélice parou.','Regaste a muda. Volta noutro dia para veres como cresceu.',
 'Esta muda já foi regada hoje.','A planta já floresceu.'] as const;

export function Workshop({language,onClose,nursery}:{language:Language;onClose:()=>void;
 nursery?:{stage:number;water:()=>string}}){
  const stations=nursery?nurseryStations:workshopStations;
  const [machineOn,setMachineOn]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const [position,setPosition]=useState(exitTile);
  const [detail,setDetail]=useState('');
  const tr=(label:string)=>t(label,language);
  const nearExit=position.x===exitTile.x&&(position.y===exitTile.y||position.y===exitTile.y-1);
  const station=stations.find(item=>Math.abs(item.x-position.x)+Math.abs(item.y-position.y)===1);

  useEffect(()=>{
    const element=dialog.current!;
    element.showModal();
    return()=>element.close();
  },[]);

  function interact(item: (typeof stations)[number]){
    if(item.style==='machine'){
      setMachineOn(!machineOn);
      setDetail(machineOn?'A hélice parou.':item.detail);
    }else if(item.style==='plant'&&nursery){
      setDetail(nursery.water());
    }else setDetail(item.detail);
  }

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
      if(event.ctrlKey||event.metaKey||event.altKey)return;
      if(event.key.toLowerCase()==='i'){
        if(!event.repeat){
          if(nearExit)onClose();
          else if(station)interact(station);
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const direction:Record<string,[number,number]>={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
      const step=direction[event.key.toLowerCase()];
      if(!step)return;
      event.preventDefault();
      event.stopPropagation();
      move(...step);
    }}>
    <h2 id="workshop-title">{tr(nursery?'Viveiro da Mira':'Oficina do Theo')}</h2>
    <div className={nursery?"workshop-room nursery-room":"workshop-room"} aria-hidden="true">
      {stations.map(item=><div key={item.style} className={`workshop-prop ${item.style}${item.style==='machine'&&machineOn?' running':''}`} style={{gridColumn:item.x+1,gridRow:item.y+1}} data-stage={item.style==='plant'?nursery?.stage:undefined}/>)}
      <div className="workshop-door" style={{gridColumn:exitTile.x+1,gridRow:exitTile.y+1}}/>
      <div className="workshop-player" style={{gridColumn:position.x+1,gridRow:position.y+1}}/>
    </div>
    <p>{tr('Usa WASD, as setas ou os botões para explorar. Junto à porta, prime I para sair.')}</p>
    <div className="workshop-actions">
      {([['Mover up','↑',0,-1],['Mover left','←',-1,0],['Mover down','↓',0,1],['Mover right','→',1,0]] as const).map(([label,arrow,x,y])=>
        <button key={label} type="button" className="resident-route-toggle" aria-label={tr(label)} onClick={()=>move(x,y)}>{arrow}</button>)}
      <button type="button" className="resident-route-toggle" onClick={onClose}>{tr(nursery?'Sair do viveiro':'Sair da oficina')}</button>
    </div>
    <div className="workshop-inspection">
      {stations.map(item=><button key={item.style} type="button"
        className="resident-route-toggle" disabled={station!==item}
        style={{visibility:station===item?'visible':'hidden'}}
        onClick={()=>interact(item)}>
        {item.style==='machine'?tr(machineOn?'Desligar ventoinha':'Ligar ventoinha'):item.style==='plant'?tr('Regar a muda'):`${tr('Examinar')}: ${tr(item.label)}`}
      </button>)}
    </div>
    <div className="workshop-inspection">
      {[...stations.map(item=>item.detail),...inspectionMessages].map(message=><p key={message} aria-hidden="true" className="workshop-detail-placeholder">{tr(message)}</p>)}
      <p role="status">{detail&&tr(detail)}</p>
    </div>
  </dialog>;
}
