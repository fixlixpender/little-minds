import {useEffect,useRef,useState,type CSSProperties,type FormEvent} from 'react';
import{skinTones,hairColours,outfitColours,cleanName,type AvatarProfile,type HairStyle}from './avatar';
import{t,type Language}from './i18n';
export function CharacterEditor({profile,language,onSave,onClose}:{profile:AvatarProfile;language:Language;onSave:(profile:AvatarProfile)=>void;onClose:()=>void}){
 const [draft,setDraft]=useState({...profile});const dialog=useRef<HTMLDialogElement>(null);const tr=(text:string)=>t(text,language);
 useEffect(()=>{const el=dialog.current!;el.showModal();return()=>el.close()},[]);
 const palette=(title:string,field:'skin'|'hair'|'outfit',values:Record<string,string>,labels:Record<string,string>)=><fieldset className="avatar-field"><legend>{tr(title)}</legend><div className="avatar-swatches">{Object.entries(values).map(([id,color])=><button type="button" key={id} aria-label={`${tr(title)}: ${tr(labels[id])}`} aria-pressed={draft[field]===id} className={`avatar-swatch ${draft[field]===id?'chosen':''}`} style={{background:color}} onClick={()=>setDraft({...draft,[field]:id})}>{draft[field]===id?'✓':''}</button>)}</div></fieldset>;
 function submit(e:FormEvent){e.preventDefault();const name=cleanName(draft.name);if(name)onSave({...draft,name});}
 return <dialog ref={dialog} className="character-dialog" aria-labelledby="character-title" onCancel={e=>{e.preventDefault();onClose()}}><form onSubmit={submit}>
 <div className="eyebrow">{tr('UM LUGAR NA ILHA')}</div><h2 id="character-title">{tr('A tua personagem')}</h2><p className="editor-intro">{tr('Escolhe como queres chegar à Aurora. Podes mudar mais tarde.')}</p>
 <div className="avatar-preview" style={{'--avatar-skin':skinTones[draft.skin],'--avatar-hair':hairColours[draft.hair],'--avatar-outfit':outfitColours[draft.outfit]} as CSSProperties}><div className={`avatar-pixel ${draft.style}`}><i className="avatar-head"/><i className="avatar-hair"/><i className="avatar-body"/><i className="avatar-feet"/></div><span>{cleanName(draft.name)||tr('Tu')}</span></div>
 <label className="avatar-name">{tr('Nome')}<input autoFocus required maxLength={40} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder={tr('Como te chamas?')} autoComplete="off"/><small>{tr('Até 20 caracteres. Guardado apenas neste navegador.')}</small></label>
 {palette('Tom de pele','skin',skinTones,{sand:'Areia',peach:'Pêssego',warm:'Quente',brown:'Castanho',deep:'Escuro'})}
 <fieldset className="avatar-field"><legend>{tr('Cabelo')}</legend><div className="hair-styles">{([['short','Curto'],['long','Comprido'],['crest','Crista']]as[HairStyle,string][]).map(([id,label])=><button type="button" key={id} aria-pressed={draft.style===id} className={draft.style===id?'chosen':''} onClick={()=>setDraft({...draft,style:id})}>{tr(label)}</button>)}</div></fieldset>
 {palette('Cor do cabelo','hair',hairColours,{chestnut:'Castanho',night:'Preto',gold:'Dourado',silver:'Grisalho',auburn:'Ruivo'})}
 {palette('Roupa','outfit',outfitColours,{sage:'Sálvia',ocean:'Oceano',ochre:'Ocre',lavender:'Lavanda',rose:'Rosa'})}
 <div className="editor-actions"><button type="button" onClick={onClose}>{tr('Cancelar')}</button><button type="submit" className="editor-save" disabled={!cleanName(draft.name)}>{tr('Guardar e explorar')}</button></div>
 </form></dialog>;
}
