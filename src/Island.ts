import {isLand,clearSegment,findRoute,followRoute,recoverPosition} from './navigation';
import {t,type Language} from './i18n';
import Phaser from 'phaser';import {places,profiles,type World,type PersonId,type Point} from './simulation';
export type Bridge={world:World;mode:'observer'|'inhabitant';selected:PersonId|null;paused:boolean;speed:number;language:Language;direction:Point;onSelect:(id:PersonId)=>void;onInteract:()=>void};
export const land=isLand;
export class Island extends Phaser.Scene{
 b:Bridge; mapLabels:{label:Phaser.GameObjects.Text;source:string}[]=[];lastLanguage:Language|null=null; actors:Record<string,Phaser.GameObjects.Container>={};shade!:Phaser.GameObjects.Rectangle; glow!:Phaser.GameObjects.Graphics;water!:Phaser.GameObjects.Graphics; keys!:Record<string,Phaser.Input.Keyboard.Key>; destination:Point|null=null; playerRoute:Point[]=[]; trail!:Phaser.GameObjects.Graphics; previousMode:Bridge['mode']='observer'; routes:Record<string,{target:string;points:Point[]}>={}; constructor(b:Bridge){super('aurora');this.b=b;}
 create(){this.cameras.main.setBackgroundColor('#284a58');this.water=this.add.graphics();this.drawMap();this.trail=this.add.graphics().setDepth(3);for(const person of [...this.b.world.residents,this.b.world.player])Object.assign(person,recoverPosition(person));this.glow=this.add.graphics().setDepth(800);for(const r of this.b.world.residents)this.actor(r.id,r.x,r.y,profiles[r.id].color);this.actor('player',this.b.world.player.x,this.b.world.player.y,'#e7d7bd');this.shade=this.add.rectangle(480,300,960,600,0x101b39,1).setDepth(700).setAlpha(0);this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E') as typeof this.keys;this.input.keyboard!.on('keydown-E',()=>{if(this.b.mode==='inhabitant')this.b.onInteract()});this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(this.b.mode==='inhabitant'){const dest={x:p.worldX,y:p.worldY};const route=findRoute(this.b.world.player,dest);if(route.length){this.destination=dest;this.playerRoute=route;}else{this.destination=null;this.playerRoute=[];}}});}
 drawMap(){const c=document.createElement('canvas');c.width=960;c.height=600;const g=c.getContext('2d')!;g.imageSmoothingEnabled=false;let seed=124;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const rect=(x:number,y:number,w:number,h:number,color:string)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);};
 for(let y=20;y<580;y+=4)for(let x=20;x<940;x+=4){if(land(x,y)){const coast=!land(x+12,y)||!land(x-12,y)||!land(x,y+12)||!land(x,y-12);rect(x,y,4,4,coast?'#bba77a':['#71875b','#788d5e','#7c915f','#829563'][Math.floor(rand()*4)]);if(rand()<.09&&!coast)rect(x,y,2,2,'#a0aa70');}else if(land(x-12,y)||land(x+12,y)||land(x,y-12)||land(x,y+12))rect(x,y,4,4,'#648581');}
 const path=(a:Point,b:Point,width=16)=>{g.strokeStyle='#b5aa83';g.lineWidth=width;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();};for(const p of Object.values(places))path(places.praca,p);for(let i=0;i<1100;i++){const x=180+rand()*620,y=120+rand()*380;if(land(x,y)&&rand()<.15)rect(x,y,2,2,'#bac08a');}
 // Lake, stepping stones and reeds.
 g.fillStyle='#487b80';g.beginPath();g.ellipse(664,260,62,38,-.3,0,7);g.fill();g.strokeStyle='#9bb19a';g.lineWidth=5;g.stroke();for(let i=0;i<32;i++)rect(615+rand()*95,238+rand()*40,8,1,'#76a3a1');for(let i=0;i<17;i++){const x=615+rand()*100,y=287+rand()*8;rect(x,y,2,7,'#526c4a');}
 const tree=(x:number,y:number,s=1)=>{g.fillStyle='#314c3c66';g.beginPath();g.ellipse(x+5,y+9,18*s,8*s,0,0,7);g.fill();rect(x-3,y-10,6,22,'#665a42');const colors=['#334f42','#416349','#567b50','#668857'];for(let k=0;k<4;k++){g.fillStyle=colors[k];g.beginPath();g.moveTo(x,y-55*s+k*8);g.lineTo(x-21*s+k*2,y-15*s+k*5);g.lineTo(x+21*s-k*2,y-15*s+k*5);g.fill();}rect(x-9,y-27*s,5,3,'#88a16a');};
 for(let i=0;i<105;i++){const x=140+rand()*605,y=85+rand()*370;if(land(x,y)&&((x<270&&y<330)||(y<143&&x<560)||(x>705&&y>265)||(x<230&&y>310)))tree(x,y,.7+rand()*.35);}
 const house=(x:number,y:number,roof:string)=>{rect(x-34,y-10,82,47,'#34473855');rect(x-37,y-41,74,54,'#d3c6a0');rect(x-37,y-41,10,54,'#9d9b79');rect(x-40,y-49,80,13,'#695e4a');for(let row=0;row<6;row++){const width=88-row*5;rect(x-width/2,y-82+row*7,width,7,roof);for(let xx=x-width/2;xx<x+width/2;xx+=13)rect(xx+row%2*4,y-81+row*7,10,1,'#ffffff22');}rect(x-5,y-18,14,31,'#60513e');rect(x-25,y-23,13,15,'#e7ce85');rect(x+18,y-23,13,15,'#e7ce85');rect(x-25,y-16,13,2,'#817c61');rect(x+23,y-23,2,15,'#817c61');rect(x+20,y-86,9,25,'#8c806b');for(let i=0;i<4;i++)rect(x-32+i*22,y+19,15,4,'#bdad8a');};house(310,395,'#8f665d');house(565,387,'#b08558');house(593,168,'#7b7990');
 // Garden beds and tiny vegetables.
 for(let row=0;row<3;row++)for(let col=0;col<2;col++){const x=265+col*40,y=266+row*20;rect(x,y,33,14,'#655840');rect(x,y,33,2,'#aa9165');for(let n=0;n<4;n++){rect(x+4+n*7,y+5,4,5,'#83ab63');rect(x+5+n*7,y+8,2,3,row===1?'#cf985d':'#b7c27b');}}
 for(let i=0;i<7;i++){rect(256+i*15,260,3,70,'#baa888');rect(256+i*15,265,12,2,'#baa888');}
 // Central circular plaza and fountain.
 g.fillStyle='#c0b391';g.beginPath();g.ellipse(460,350,55,33,0,0,7);g.fill();for(let i=0;i<90;i++){const a=rand()*7,r=rand()*45;rect(460+Math.cos(a)*r,350+Math.sin(a)*r*.55,7,2,'#a3997e');}g.fillStyle='#827f70';g.beginPath();g.ellipse(460,346,16,10,0,0,7);g.fill();g.fillStyle='#739e9a';g.beginPath();g.ellipse(460,343,12,6,0,0,7);g.fill();rect(457,329,6,14,'#d3c8a6');rect(454,328,12,4,'#d3c8a6');
 // Jetty.
 rect(490,485,40,91,'#514f43');for(let i=0;i<15;i++)rect(491,485+i*6,38,4,i%2?'#99866b':'#ac9677');for(const x of [487,529])for(const y of [490,525,565]){rect(x,y,4,13,'#615c48');rect(x-1,y,6,3,'#c1ad84');}rect(540,525,12,34,'#c4b58e');rect(543,528,6,26,'#736b55');
 // Lighthouse on the eastern headland.
 rect(797,161,43,14,'#5a6558');rect(805,100,28,62,'#c4c4aa');rect(805,126,28,12,'#8c7970');rect(801,96,36,6,'#565b56');rect(807,80,24,17,'#b9af80');rect(817,83,4,13,'#f4d693');g.fillStyle='#5c6661';g.beginPath();g.moveTo(798,80);g.lineTo(819,65);g.lineTo(840,80);g.fill();rect(815,145,9,16,'#505851');
 const bench=(x:number,y:number)=>{rect(x,y,24,5,'#ac8964');rect(x,y-6,24,4,'#b39772');rect(x+3,y+5,3,5,'#5b5e49');rect(x+19,y+5,3,5,'#5b5e49');};bench(405,363);bench(493,330);bench(639,305);
 for(const [x,y]of [[386,315],[533,348],[565,217],[356,431]]){rect(x,y-18,3,22,'#5b6554');rect(x-3,y-22,9,8,'#e3c487');rect(x-4,y-24,11,3,'#5c6557');}
 for(let i=0;i<100;i++){const x=240+rand()*450,y=150+rand()*300;if(land(x,y)&&rand()<.5){rect(x,y,2,4,'#4d7347');rect(x-1,y,4,2,rand()>.5?'#e3c689':'#ba96a4');}}
 this.textures.addCanvas('island',c);this.add.image(0,0,'island').setOrigin(0).setDepth(1);
 for(const [text,x,y] of [['FLORESTA',250,132],['HORTA',300,247],['PRAÇA',460,392],['LAGO',664,218],['CAIS',510,587],['FAROL ABANDONADO',815,188]] as [string,number,number][]){const label=this.add.text(x,y,t(text,this.b.language),{fontFamily:'monospace',fontSize:'9px',color:'#e4dfbd',stroke:'#334d40',strokeThickness:3,letterSpacing:2}).setOrigin(.5).setDepth(2).setAlpha(.8);this.mapLabels.push({label,source:text});}}
 actor(id:string,x:number,y:number,color:string){const body=this.add.graphics();body.fillStyle(0x182e2d,.25).fillEllipse(0,5,15,6);body.fillStyle(Phaser.Display.Color.HexStringToColor(color).color).fillRect(-4,-6,8,10);body.fillStyle(0xe7c6a1).fillRect(-4,-13,8,7);body.fillStyle(id==='mira'?0x4e5940:id==='theo'?0x775440:0x5e596d).fillRect(-5,-15,10,4);const label=this.add.text(0,-27,id==='player'?t('Tu',this.b.language):profiles[id as PersonId].name,{fontFamily:'monospace',fontSize:'10px',color:'#fff4cf',backgroundColor:'#263d37cc',padding:{x:4,y:2}}).setOrigin(.5);const actor=this.add.container(x,y,[body,label]).setDepth(y+10);actor.setSize(26,38).setInteractive();actor.on('pointerdown',(_:unknown,__:unknown,___:unknown,event:Phaser.Types.Input.EventData)=>{event.stopPropagation();if(id!=='player')this.b.onSelect(id as PersonId)});const legs=this.add.graphics().setName('legs');actor.add(legs);this.actors[id]=actor;}
 update(tick:number,dt:number){const t=tick;this.updateLanguage();const seconds=Math.min(dt/1000,.1);this.water.clear();this.water.lineStyle(1,0x8cb1b3,.18);for(let i=0;i<85;i++){const x=(i*137+t*.008)%960,y=(i*67)%600;if(!land(x,y)){this.water.beginPath().moveTo(x,y).lineTo(x+10+Math.sin(i+t*.001)*5,y).strokePath();}}
 for(const r of this.b.world.residents){
 if(!this.routes[r.id]||this.routes[r.id].target!==r.target)this.routes[r.id]={target:r.target,points:findRoute(r,places[r.target])};
 const moving=!this.b.paused&&followRoute(r,this.routes[r.id].points,seconds*15*Math.sqrt(this.b.speed));
 this.animateActor(r.id,r,moving,t);
 this.actors[r.id].setAlpha(this.b.selected&&this.b.selected!==r.id?.65:1);
 }
 const p=this.b.world.player,a=this.actors.player;a.setVisible(this.b.mode==='inhabitant');
 this.trail.clear();
 if(this.b.mode!==this.previousMode){this.destination=null;this.playerRoute=[];this.previousMode=this.b.mode;}
 if(this.b.mode==='inhabitant'){
 const dx=Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown)+this.b.direction.x;
 const dy=Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown)+this.b.direction.y;
 let moving=false;
 if(dx||dy){
 this.destination=null;this.playerRoute=[];
 const d=Math.hypot(dx,dy),nx=p.x+dx/d*seconds*72,ny=p.y+dy/d*seconds*72;
 if(clearSegment(p,{x:nx,y:ny})){p.x=nx;p.y=ny;moving=true;}
 else if(dx&&clearSegment(p,{x:nx,y:p.y})){p.x=nx;moving=true;}
 else if(dy&&clearSegment(p,{x:p.x,y:ny})){p.y=ny;moving=true;}
 }else moving=followRoute(p,this.playerRoute,seconds*72);
 if(!this.playerRoute.length)this.destination=null;
 if(this.destination){
 this.trail.lineStyle(1,0xf1dfab,.45).beginPath().moveTo(p.x,p.y);
 for(const point of this.playerRoute)this.trail.lineTo(point.x,point.y);
 this.trail.strokePath();
 const radius=5+Math.sin(t*.004);this.trail.lineStyle(1,0xffebbb,.85).strokeCircle(this.destination.x,this.destination.y,radius);
 this.trail.fillStyle(0xffebbb,.7).fillRect(this.destination.x-1,this.destination.y-1,2,2);
 }
 this.animateActor('player',p,moving,t);
 }
 const h=this.b.world.minute/60,night=h<5||h>21?.56:h<7?.56*(7-h)/2:h>17?.56*(h-17)/4:0;this.shade.setAlpha(night);this.glow.clear();if(night>0){for(const [x,y]of [[386,299],[533,332],[565,201],[356,415],[285,379],[335,379],[540,371],[590,371],[568,152],[618,152],[819,88]])for(let radius=22;radius>0;radius-=3)this.glow.fillStyle(0xffd38a,.009*night/.56).fillCircle(x,y,radius);for(let i=0;i<20;i++){const x=230+i*23,y=230+Math.sin(i*9+t*.0003)*90;this.glow.fillStyle(0xe6edab,.4+.3*Math.sin(t*.003+i)).fillRect(x,y,2,2);}}
 }
 updateLanguage(){if(this.lastLanguage===this.b.language)return;this.lastLanguage=this.b.language;for(const item of this.mapLabels)item.label.setText(t(item.source,this.b.language));const label=this.actors.player?.list[1] as Phaser.GameObjects.Text|undefined;label?.setText(t('Tu',this.b.language));}
 animateActor(id:string,position:Point,moving:boolean,time:number){
 const actor=this.actors[id],phase=moving?Math.sin(time*.016):0;
 actor.setPosition(Math.round(position.x),Math.round(position.y)).setDepth(position.y+10);
 const body=actor.list[0] as Phaser.GameObjects.Graphics;body.y=moving?-Math.abs(phase):0;
 const legs=actor.getByName('legs') as Phaser.GameObjects.Graphics;
 legs.clear().fillStyle(0x354243).fillRect(-4,4+phase*2,3,4).fillRect(1,4-phase*2,3,4);
 }
}
