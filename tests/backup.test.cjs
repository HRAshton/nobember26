const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../engine.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../config.js'),'utf8'),sandbox);
const C=JSON.parse(JSON.stringify(sandbox.window.QUEST_CONFIG));
const store=()=>({db:{},getItem(key){return this.db[key]||null},setItem(key,value){this.db[key]=value}});
const advance=s=>{
  let state=s;
  for(const code of ['START-LION','GIFT-ONE']){
    state=E.redeem(C,state,code).state;
    state=E.buyKey(C,state).state;
    state=E.open(C,state).state;
  }
  state=E.sellJunk(C,state).state;
  return state;
};
test('JSON backup roundtrip faithfully restores earned books, codes and currency',()=>{
  const source=advance(E.initial(C));
  const backup=E.exportSave(C,source,'2026-10-31T12:00:00.000Z');
  const storage=store();
  const imported=E.importSave(C,storage,JSON.stringify(backup));
  assert.deepEqual(imported,source);
  assert.deepEqual(E.read(C,storage),source);
  assert.equal(backup.exportedAt,'2026-10-31T12:00:00.000Z');
});
test('an invalid or damaged save cannot replace existing local progress',()=>{
  const storage=store();const current=advance(E.initial(C));E.write(C,storage,current);
  const original=storage.getItem(C.storageKey);
  const v=E.exportSave(C,current);
  assert.throws(()=>E.importSave(C,storage,'{no-json'),/JSON/);
  assert.throws(()=>E.importSave(C,storage,{}),/формат/);
  const invalid=structuredClone(v);invalid.state.opened=999;
  assert.throws(()=>E.importSave(C,storage,invalid),/больше сундуков/);
  const malformed=structuredClone(v);malformed.state.books=[];
  assert.throws(()=>E.importSave(C,storage,malformed),/Количество/);
  assert.equal(storage.getItem(C.storageKey),original);
});
test('cannot import a save from another gift configuration',()=>{
  const s=E.initial(C);const storage=store();
  const backup=E.exportSave(C,s);
  const edited=structuredClone(C);edited.gifts[1].clue='Новая тайная подсказка';
  assert.throws(()=>E.importSave(edited,storage,backup),/другой версии/);
  assert.equal(storage.getItem(C.storageKey),null);
});
test('old v0.5 save continues to load without migration or loss',()=>{
  const storage=store();let s=advance(E.initial(C));
  E.write(C,storage,s);
  assert.equal(E.read(C,storage).opened,2);
  assert.equal(E.read(C,storage).books.length,2);
});
