const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../engine.js');
const {load}=require('../scripts/validate-config.cjs');
const C=load(path.join(__dirname,'./fixtures/english-demo-config.js'));
const store=()=>({data:{},getItem(k){return this.data[k]??null},setItem(k,v){this.data[k]=String(v)}});

function oldLocale(state){
  const old=structuredClone(state);
  old.fingerprint='8g5lcs';old.contentFingerprint='w430xq';
  for(const key of ['books','junk','materials','collectibles','buyback','lastRewards'])
    for(const item of old[key]){
      item.name='Previous locale name';
      if(item.type==='book') {item.subtitle='Previous subtitle';item.clue='Previous clue';item.hint='Previous hint';}
    }
  return old;
}

function completed(){
  let s=E.initial(C);
  for(const code of C.codes.filter(x=>!x.final)){
    s=E.redeem(C,s,code.code).state;s=E.buyKey(C,s).state;s=E.open(C,s).state;
  }
  s=E.sellJunk(C,s,s.junk[0].id).state;
  s=E.deposit(C,s).state;
  return s;
}

test('English demo upgrades the preceding local save without losing earned progress',()=>{
  const expected=completed(),storage=store();
  storage.setItem(C.storageKey,JSON.stringify(oldLocale(expected)));
  assert.deepEqual(E.read(C,storage),expected);
  assert.deepEqual(JSON.parse(storage.getItem(C.storageKey)),expected);
  assert.deepEqual(E.read(C,storage),expected,'upgrade is idempotent');
});

test('English demo imports previous-locale backups and still rejects edited quests and invalid data',()=>{
  const expected=completed(),storage=store();
  const backup={format:'gw2-black-lion-quest-save',version:1,configFingerprint:'8g5lcs',contentFingerprint:'w430xq',state:oldLocale(expected)};
  assert.deepEqual(E.importSave(C,storage,backup),expected);
  const prior=storage.getItem(C.storageKey);
  const edited=structuredClone(C);edited.gifts[0].clue='A different physical gift location';
  assert.throws(()=>E.importSave(edited,storage,backup),/different quest/);
  const damaged=structuredClone(backup);damaged.state.gems=-1;
  assert.throws(()=>E.importSave(C,storage,damaged),/Invalid number/);
  const wrong=structuredClone(backup);wrong.state.fingerprint='another-quest';
  assert.throws(()=>E.importSave(C,storage,wrong),/different quest/);
  assert.equal(storage.getItem(C.storageKey),prior);
});

test('English migration also relabels final rewards without reopening the final chest',()=>{
  let expected=E.initial(C);
  for(const code of C.codes){expected=E.redeem(C,expected,code.code).state;}
  for(let i=0;i<C.gifts.length;i++){expected=E.buyKey(C,expected).state;expected=E.open(C,expected).state;}
  expected=E.sellJunk(C,expected).state;expected=E.exchange(C,expected,90).state;
  expected=E.buyKey(C,expected).state;expected=E.open(C,expected).state;
  const storage=store();storage.setItem(C.storageKey,JSON.stringify(oldLocale(expected)));
  assert.deepEqual(E.read(C,storage),expected);
  assert.equal(E.read(C,storage).bonusOpened,true);
});

test('project text uses English except the configured personal clues, without em dashes',()=>{
  const root=path.join(__dirname,'..');
  const quest=load(path.join(root,'config.js'));
  const personalClues=[...quest.gifts.map(gift=>gift.clue),quest.bonus.clue];
  function check(dir){
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      if(['.git','node_modules','__pycache__','.venv'].includes(entry.name))continue;
      const file=path.join(dir,entry.name);
      if(entry.isDirectory())check(file);
      else if(/\.(md|html|js|cjs|py|json|svg|css|bat|sh)$/.test(file)) {
        let text=fs.readFileSync(file,'utf8');
        for(const clue of personalClues) text=text.split(clue).join('');
        assert.doesNotMatch(text,/[\u0400-\u04ff\u2014]/u,file);
      }
    }
  }
  check(root);
});
