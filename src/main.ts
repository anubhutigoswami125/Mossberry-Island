import Phaser from 'phaser';
import './style.css';
import { createDefaultSave, loadSave, saveGame, type GameSave } from './systems/save';
import { addItem, advanceMinute, getInventoryCount, removeItem } from './systems/state';

const SAVE_KEY = 'mossberry-island-save-v1';
let state: GameSave = loadSave(SAVE_KEY) ?? createDefaultSave();
const names: Record<string,string> = {berry:'Wild berry',mushroom:'Button mushroom',flower:'Bluebell'};
let toastTimer = 0;
function toast(message:string) {
  const node=document.querySelector<HTMLElement>('#toast')!;
  node.textContent=message; node.classList.add('is-visible'); window.clearTimeout(toastTimer);
  toastTimer=window.setTimeout(()=>node.classList.remove('is-visible'),2300);
}
function updateHud() {
  const h24=Math.floor(state.minuteOfDay/60),m=state.minuteOfDay%60;
  document.querySelector('#clock-label')!.textContent=(h24%12||12)+':'+String(m).padStart(2,'0')+' '+(h24>=12?'PM':'AM');
  document.querySelector('#day-label')!.textContent='Day '+String(state.day).padStart(2,'0');
  const total=getInventoryCount(state);
  document.querySelector('#inventory-count')!.textContent=total+' thing'+(total===1?'':'s');
  const inventory=document.querySelector<HTMLElement>('#inventory-list')!;
  const entries=Object.entries(state.inventory).filter(([,n])=>n>0);
  inventory.innerHTML=entries.length?entries.map(([id,n])=>'<div class="inventory-item"><span class="item-mark">✿</span><span>'+(names[id]??id)+'</span><b>×'+n+'</b></div>').join(''):'<p class="empty-inventory">A little room for discoveries.</p>';
}
function persist(showMessage=false) {
  try { saveGame(SAVE_KEY,state); if(showMessage)toast('Your little world is safely tucked away.'); }
  catch { toast('Could not save in this browser. Check storage settings.'); }
}
function openDialogue(name:string,role:string,text:string,choices:{label:string;action:()=>void}[]=[]) {
  const panel=document.querySelector<HTMLElement>('#dialogue')!;
  document.querySelector('#dialogue-name')!.textContent=name;
  document.querySelector('#dialogue-role')!.textContent=role.toUpperCase();
  document.querySelector('#dialogue-text')!.textContent=text;
  const actions=document.querySelector<HTMLElement>('#dialogue-actions')!; actions.replaceChildren();
  for(const choice of choices){const b=document.createElement('button');b.className='dialogue-choice';b.type='button';b.textContent=choice.label;b.addEventListener('click',choice.action);actions.append(b);}
  const close=document.createElement('button');close.className='dialogue-choice dialogue-choice-muted';close.type='button';close.textContent='That is all for now';close.addEventListener('click',()=>{panel.hidden=true;});actions.append(close);panel.hidden=false;
}
type Thing={id:string;x:number;y:number;label:string;kind:'item'|'npc'|'door';found:boolean};
class MeadowScene extends Phaser.Scene {
  private player!:Phaser.GameObjects.Arc;
  private keys!:Record<string,Phaser.Input.Keyboard.Key>;
  private things:Thing[]=[];
  private prompt!:Phaser.GameObjects.Text;
  private elapsed=0;
  private lastInteract=0;
  constructor(){super('meadow');}
  create(){
    const g=this.add.graphics();g.fillStyle(0x9cb88c,1);g.fillRect(0,0,960,600);
    g.fillStyle(0xadc69b,.7);g.fillEllipse(170,140,330,180);g.fillEllipse(750,420,430,240);
    g.fillStyle(0xd7cba1,1);g.fillPoints([{x:410,y:600},{x:480,y:600},{x:550,y:330},{x:480,y:280}],true);g.fillPoints([{x:0,y:400},{x:280,y:360},{x:430,y:415},{x:0,y:470}],true);
    g.fillStyle(0xf2dfbd,1);g.fillRoundedRect(82,100,155,116,7);g.fillStyle(0x9b6255,1);g.fillTriangle(65,116,159,42,254,116);g.fillStyle(0x68483c,1);g.fillRect(145,158,34,58);g.fillStyle(0xb7d5d0,1);g.fillRect(100,137,26,28);g.fillRect(192,137,26,28);
    g.fillStyle(0x729eaa,1);g.fillEllipse(770,170,190,104);g.lineStyle(4,0xc1d7c4,.9);g.strokeEllipse(770,170,190,104);
    this.tree(g,350,115,1.15);this.tree(g,432,92,1.35);this.tree(g,850,335,1.25);this.tree(g,80,320,.8);this.tree(g,905,100,.8);
    for(let i=0;i<46;i++){const x=25+(i*137)%900,y=30+(i*79)%535;if((x<270&&y<230)||(x>660&&x<870&&y<235))continue;g.fillStyle(i%3===0?0xd58ca2:i%3===1?0xf1e5b8:0xf4f0de,.85);g.fillCircle(x,y,1.8+(i%3)*.5);}
    this.add.text(158,234,'YOUR COTTAGE',{fontFamily:'Georgia,serif',fontSize:'12px',color:'#38523c'}).setOrigin(.5);
    this.add.text(770,242,'MOONPOND',{fontFamily:'Georgia,serif',fontSize:'12px',color:'#38523c'}).setOrigin(.5);
    this.things=[
      {id:'berry',x:285,y:385,label:'Wild berries',kind:'item',found:state.discoveries.includes('berry')},
      {id:'mushroom',x:565,y:435,label:'Button mushroom',kind:'item',found:state.discoveries.includes('mushroom')},
      {id:'flower',x:680,y:365,label:'Bluebell',kind:'item',found:state.discoveries.includes('flower')},
      {id:'rowan',x:450,y:330,label:'Rowan Thistle',kind:'npc',found:false},
      {id:'cottage',x:160,y:190,label:'Your cottage',kind:'door',found:false}
    ];
    for(const t of this.things){if(t.kind==='npc')this.rowan(g,t.x,t.y);else if(t.kind==='item'&&!t.found)this.item(g,t.x,t.y,t.id);}
    this.player=this.add.circle(state.player.x,state.player.y,12,0x694e45).setStrokeStyle(3,0xf5e6ca).setDepth(20);
    this.prompt=this.add.text(0,0,'',{fontFamily:'Arial',fontSize:'13px',color:'#fff9eb',backgroundColor:'#304b38',padding:{x:10,y:7}}).setOrigin(.5,1).setDepth(30).setVisible(false);
    this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as unknown as Record<string,Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on('keydown-E',()=>this.interact());
    this.input.keyboard!.on('keydown-ESC',()=>{document.querySelector<HTMLElement>('#dialogue')!.hidden=true;});
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{const t=this.nearest(p.worldX,p.worldY,46);if(t)this.use(t);});
    this.cameras.main.setBounds(0,0,960,600);
  }
  private tree(g:Phaser.GameObjects.Graphics,x:number,y:number,s:number){g.fillStyle(0x6b6044,1);g.fillRoundedRect(x-7*s,y+10*s,14*s,48*s,4);g.fillStyle(0x4d7451,1);g.fillCircle(x,y,36*s);g.fillCircle(x-22*s,y+12*s,25*s);g.fillCircle(x+22*s,y+14*s,25*s);g.fillStyle(0x789366,.8);g.fillCircle(x-10*s,y-9*s,17*s);}
  private rowan(g:Phaser.GameObjects.Graphics,x:number,y:number){g.fillStyle(0x39543d,.25);g.fillEllipse(x,y+15,30,10);g.fillStyle(0x8b6652,1);g.fillRoundedRect(x-12,y-3,24,24,7);g.fillStyle(0xe7c7a6,1);g.fillCircle(x,y-14,11);g.fillStyle(0x6a5146,1);g.fillCircle(x-1,y-22,11);g.fillStyle(0xc6d7a8,1);g.fillRect(x-8,y+1,16,7);}
  private item(g:Phaser.GameObjects.Graphics,x:number,y:number,id:string){g.fillStyle(0x3f6943,1);g.fillEllipse(x,y+8,20,8);if(id==='mushroom'){g.fillStyle(0xf1e2c8,1);g.fillRoundedRect(x-4,y-1,8,10,3);g.fillStyle(0xe7d3b1,1);g.fillEllipse(x,y-4,22,13);}else if(id==='flower'){g.fillStyle(0x49754c,1);g.fillRect(x-1,y-2,2,12);g.fillStyle(0x7691b6,1);for(let a=0;a<5;a++){const t=a*Math.PI*2/5;g.fillCircle(x+Math.cos(t)*5,y-5+Math.sin(t)*5,4);}g.fillStyle(0xe9d9a3,1);g.fillCircle(x,y-5,3);}else{g.fillStyle(0xb95775,1);g.fillCircle(x-4,y-2,6);g.fillCircle(x+4,y-3,6);g.fillCircle(x,y+3,6);}}
  private nearest(x:number,y:number,max=46):Thing|undefined{let best:Thing|undefined,distance=max;for(const t of this.things){if(t.kind==='item'&&t.found)continue;const d=Phaser.Math.Distance.Between(x,y,t.x,t.y);if(d<distance){distance=d;best=t;}}return best;}
  private interact(){const now=performance.now();if(now-this.lastInteract<250)return;this.lastInteract=now;const t=this.nearest(this.player.x,this.player.y,58);if(!t){toast('Nothing nearby just yet.');return;}this.use(t);}
  private use(t:Thing){
    if(t.kind==='item'){if(t.found)return;t.found=true;state.discoveries.push(t.id);addItem(state,t.id,1);this.scene.restart();persist();updateHud();toast('Found: '+names[t.id]);return;}
    if(t.kind==='npc'){const greeting=state.memories.includes('rowan_met')?'Back again? The oak has been whispering all morning. I think it likes the rain, even when there is none.':'Oh! Hello, little wanderer. I’m Rowan. I look after the herbs and the stubborn things that grow between the stones. You look like someone who notices small things.';if(!state.memories.includes('rowan_met'))state.memories.push('rowan_met');openDialogue('Rowan Thistle','Herbalist of the North Meadow',greeting,[{label:'Ask about the island',action:()=>openDialogue('Rowan Thistle','A small island secret','The old paths were here long before the cottages. Some mornings, the stones hum so softly you can mistake them for bees. If you ever hear it, follow the sound slowly.')},{label:'Give Rowan a wild berry',action:()=>{if(!removeItem(state,'berry')){openDialogue('Rowan Thistle','A small kindness','You don’t have a berry to spare yet. The meadow has a few, though — look near the path.');return;}state.friendship.rowan=(state.friendship.rowan??0)+2;persist();updateHud();openDialogue('Rowan Thistle','A small kindness','For me? That’s thoughtful. The first berries of spring always taste a little like remembering. I’ll keep this one for tea.');}}]);persist();}
    else openDialogue('Your cottage','Home, at last','The windows are still a little dusty, and there is a list of repairs tucked beneath the door. It feels like a beginning, not a problem.',[{label:'Leave a note in your journal',action:()=>{state.memories.push('cottage_visited');persist();document.querySelector('#journal-note')!.textContent='You stood at the cottage door and imagined the rooms as they might become.';toast('Added a note to your field journal.');}}]);
  }
  update(_time:number,delta:number){const speed=190*delta/1000;let dx=0,dy=0;if(this.keys.A.isDown||this.keys.LEFT.isDown)dx-=speed;if(this.keys.D.isDown||this.keys.RIGHT.isDown)dx+=speed;if(this.keys.W.isDown||this.keys.UP.isDown)dy-=speed;if(this.keys.S.isDown||this.keys.DOWN.isDown)dy+=speed;if(dx&&dy){dx*=.7071;dy*=.7071;}const nx=Phaser.Math.Clamp(this.player.x+dx,18,942),ny=Phaser.Math.Clamp(this.player.y+dy,22,578);const blockers=[{x:350,y:115,r:46},{x:432,y:92,r:52},{x:850,y:335,r:47},{x:770,y:170,r:70},{x:160,y:160,r:45},{x:80,y:320,r:33},{x:905,y:100,r:33}];if(!blockers.some(b=>Phaser.Math.Distance.Between(nx,ny,b.x,b.y)<b.r)){this.player.setPosition(nx,ny);state.player.x=nx;state.player.y=ny;}const t=this.nearest(this.player.x,this.player.y,70);if(t)this.prompt.setText('E · '+t.label).setPosition(t.x,t.y-35).setVisible(true);else this.prompt.setVisible(false);this.elapsed+=delta;while(this.elapsed>=1000){this.elapsed-=1000;advanceMinute(state);updateHud();if(state.minuteOfDay===0)persist();}}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game-container',width:960,height:600,backgroundColor:'#9cb88c',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[MeadowScene],render:{antialias:true,pixelArt:false},input:{activePointers:2}});
document.querySelector('#save-button')!.addEventListener('click',()=>persist(true));
document.querySelector('#dialogue-close')!.addEventListener('click',()=>document.querySelector<HTMLElement>('#dialogue')!.hidden=true);
document.querySelector('#journal-button')!.addEventListener('click',()=>openDialogue('Field notes','Day '+String(state.day).padStart(2,'0'),'The island is quiet in the kind way. Rowan says the old stones sometimes hum. You have a feeling that the island has been waiting for someone to notice.'));
window.addEventListener('beforeunload',()=>persist());window.setInterval(()=>persist(),15000);updateHud();
