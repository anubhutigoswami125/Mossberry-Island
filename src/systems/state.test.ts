import {describe,expect,it} from 'vitest';
import {addItem,advanceMinute,getInventoryCount,removeItem} from './state';
import {createDefaultSave,isValidSave} from './save';
describe('inventory rules',()=>{
 it('adds and removes without allowing negative inventory',()=>{const s=createDefaultSave();addItem(s,'berry',2);expect(getInventoryCount(s)).toBe(2);expect(removeItem(s,'berry')).toBe(true);expect(s.inventory.berry).toBe(1);expect(removeItem(s,'berry',2)).toBe(false);expect(s.inventory.berry).toBe(1);});
 it('rejects invalid quantities',()=>{const s=createDefaultSave();expect(()=>addItem(s,'berry',0)).toThrow();expect(removeItem(s,'berry',-1)).toBe(false);});
});
describe('world clock',()=>{it('rolls into the next day',()=>{const s=createDefaultSave();s.minuteOfDay=1439;advanceMinute(s);expect(s.minuteOfDay).toBe(0);expect(s.day).toBe(2);});});
describe('save validation',()=>{it('accepts a new save and rejects malformed values',()=>{expect(isValidSave(createDefaultSave())).toBe(true);expect(isValidSave({version:1,minuteOfDay:2000})).toBe(false);});});
