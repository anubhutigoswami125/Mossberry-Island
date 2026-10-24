export interface GameSave {
  version: 1; day: number; minuteOfDay: number;
  player: { x: number; y: number };
  inventory: Record<string, number>; discoveries: string[];
  memories: string[]; friendship: Record<string, number>;
}
export function createDefaultSave(): GameSave {
  return {version:1,day:1,minuteOfDay:480,player:{x:480,y:500},inventory:{},discoveries:[],memories:[],friendship:{}};
}
export function isValidSave(value: unknown): value is GameSave {
  if (!value || typeof value !== 'object') return false;
  const v=value as Partial<GameSave>;
  return v.version===1 && Number.isInteger(v.day) && (v.day as number)>=1 &&
    Number.isInteger(v.minuteOfDay) && (v.minuteOfDay as number)>=0 && (v.minuteOfDay as number)<1440 &&
    !!v.player && Number.isFinite(v.player.x) && Number.isFinite(v.player.y) &&
    !!v.inventory && typeof v.inventory==='object' && Object.values(v.inventory).every(n=>Number.isInteger(n)&&n>=0) &&
    Array.isArray(v.discoveries) && Array.isArray(v.memories) && !!v.friendship && typeof v.friendship==='object';
}
export function loadSave(key:string): GameSave | null {
  try {
    const raw=localStorage.getItem(key); if(!raw)return null;
    const parsed:unknown=JSON.parse(raw);
    if(isValidSave(parsed))return parsed;
    localStorage.setItem(key+'-recovery',raw); localStorage.removeItem(key); return null;
  } catch { return null; }
}
export function saveGame(key:string,state:GameSave):void {
  if(!isValidSave(state))throw new Error('Refusing to save invalid game state.');
  localStorage.setItem(key,JSON.stringify(state));
}
