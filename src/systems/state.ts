import type { GameSave } from './save';
export function addItem(state:GameSave,id:string,quantity=1):void {
  if(!id.trim()||!Number.isInteger(quantity)||quantity<=0)throw new Error('Item and positive integer quantity required.');
  state.inventory[id]=(state.inventory[id]??0)+quantity;
}
export function removeItem(state:GameSave,id:string,quantity=1):boolean {
  if(!Number.isInteger(quantity)||quantity<=0)return false;
  const current=state.inventory[id]??0; if(current<quantity)return false;
  if(current===quantity)delete state.inventory[id]; else state.inventory[id]=current-quantity;
  return true;
}
export function getInventoryCount(state:GameSave):number {
  return Object.values(state.inventory).reduce((total,count)=>total+count,0);
}
export function advanceMinute(state:GameSave):void {
  state.minuteOfDay+=1; if(state.minuteOfDay>=1440){state.minuteOfDay=0;state.day+=1;}
}
