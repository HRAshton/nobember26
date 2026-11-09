const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const E=require('../engine.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'./fixtures/personal-single-secret-config.js'),'utf8'),sandbox);
const C=JSON.parse(JSON.stringify(sandbox.window.QUEST_CONFIG));
const mainCodes=C.codes.filter(code=>!code.final).map(code=>code.code);
const finalCode=C.codes.find(code=>code.final).code;
const doAction=(fn,s)=>fn.state;
test('new player sees exactly N identical regular chests and no bonus',()=>{
  const s=E.initial(C);assert.equal(C.gifts.length,5);assert.equal(s.opened,0);assert.equal(s.bonusGranted,false);assert.equal(s.keys,0);
});
test('ordinary promo codes can be entered in any order, but only once',()=>{
  let s=E.initial(C);s=doAction(E.redeem(C,s,('  '+mainCodes[2].toLowerCase()+' ')));assert.equal(s.gems,100);
  assert.throws(()=>E.redeem(C,s,mainCodes[2]),/already been redeemed/);
  assert.throws(()=>E.redeem(C,s,'FAKE'),/not found/);
});
test('main storyline, 4 rewards per chest, exact 90 silver, and secret chest',()=>{
  let s=E.initial(C);
  for(let i=0;i<C.gifts.length;i++){
    s=doAction(E.redeem(C,s,mainCodes[i]));
    s=doAction(E.buyKey(C,s));
    assert.equal(s.gems,0);
    const opened=E.open(C,s);s=opened.state;
    assert.equal(opened.rewards.length,4);
    assert.equal(opened.rewards[0].type,'book');
    assert.equal(opened.rewards[0].name,C.gifts[i].bookTitle);
    assert.equal(s.opened,i+1);
    assert.equal(s.bonusGranted,false);
  }
  assert.equal(s.books.length,C.gifts.length);
  assert.equal(s.junk.reduce((total,x)=>total+x.qty*x.unitCopper,0),9000);
  s=doAction(E.sellJunk(C,s));assert.equal(s.goldCopper,9000);
  s=doAction(E.exchange(C,s,90));assert.equal(s.gems,90);
  assert.throws(()=>E.buyKey(C,s),/Not enough gems/);
  s=doAction(E.redeem(C,s,finalCode));assert.equal(s.gems,100);
  const last=E.buyKey(C,s);s=last.state;
  assert.equal(s.bonusGranted,true);assert.equal(s.keys,1);
  assert.equal(last.bonusGranted,true);
  const bonus=E.open(C,s);s=bonus.state;
  assert.equal(bonus.bonus,true);assert.equal(s.bonusOpened,true);assert.equal(s.books.length,C.gifts.length+1);
  assert.equal(s.books.at(-1).rarity,'legendary');
  assert.equal(s.keys,0);
  assert.throws(()=>E.open(C,s),/required|no chests/);
});
test('bonus cannot appear without final code; buying final code early cannot softlock',()=>{
  let s=E.initial(C);
  s=doAction(E.redeem(C,s,finalCode));
  assert.equal(s.bonusGranted,false);
  for(const code of mainCodes) s=doAction(E.redeem(C,s,code));
  for(let i=0;i<C.gifts.length;i++){s=doAction(E.buyKey(C,s));s=doAction(E.open(C,s));}
  assert.equal(s.bonusGranted,false);
  s=doAction(E.sellJunk(C,s));s=doAction(E.exchange(C,s,90));
  assert.equal(s.gems,100);
  const granted=E.buyKey(C,s);assert.equal(granted.bonusGranted,true);
});
test('buyback decreases exactly as much gold as selling earned, without duplication',()=>{
  let s=E.initial(C);s=doAction(E.redeem(C,s,mainCodes[0]));s=doAction(E.buyKey(C,s));s=doAction(E.open(C,s));
  const originalValue=s.junk[0].qty*s.junk[0].unitCopper;
  s=doAction(E.sellJunk(C,s));assert.equal(s.goldCopper,originalValue);
  const id=s.buyback[0].id;
  s=doAction(E.buyBack(C,s,id));assert.equal(s.goldCopper,0);
  assert.equal(s.junk.length,1);
  assert.equal(s.junk[0].qty*s.junk[0].unitCopper,originalValue);
  s=doAction(E.sellJunk(C,s));assert.equal(s.goldCopper,originalValue);
});
test('junk allocation works for arbitrary gift count and totals exactly 9000 copper',()=>{
  for(const n of [1,2,3,4,7,11,30]){
    const c={...C,gifts:Array.from({length:n},(_,i)=>({...C.gifts[i%3],id:`gift-${i}`}))};
    const coins=E.junkAllocations(c);
    assert.equal(coins.length,n);assert.equal(coins.reduce((a,b)=>a+b,0),9000);
  }
});
test('no rewards can be opened without a key; no gems can be exchanged without coins',()=>{
  const s=E.initial(C);assert.throws(()=>E.open(C,s),/required/);assert.throws(()=>E.exchange(C,s,100),/Not enough/);
});
test('materials can be deposited while books remain accessible',()=>{
  let s=E.initial(C);s=doAction(E.redeem(C,s,mainCodes[0]));s=doAction(E.buyKey(C,s));s=doAction(E.open(C,s));
  s=doAction(E.deposit(C,s));assert.equal(s.materials[0].deposited,true);assert.equal(s.books.length,1);
});
test('bonus remains hidden until a NEW key purchase, even when the secret code is known',()=>{
  let s=E.initial(C);
  for(const code of [...mainCodes,finalCode]) s=doAction(E.redeem(C,s,code));
  for(let i=0;i<C.gifts.length;i++) {s=doAction(E.buyKey(C,s));s=doAction(E.open(C,s));}
  assert.equal(s.bonusGranted,false);
  s=doAction(E.sellJunk(C,s));s=doAction(E.exchange(C,s,90));
  assert.equal(s.gems,100);
  const r=E.buyKey(C,s);assert.equal(r.bonusGranted,true);
});
test('individual material deposit does not change the books, junk, or the economics',()=>{
  let s=E.initial(C);s=doAction(E.redeem(C,s,mainCodes[0]));s=doAction(E.buyKey(C,s));s=doAction(E.open(C,s));
  const beforeValue=s.junk.reduce((x,j)=>x+j.qty*j.unitCopper,0);
  const id=s.materials[0].id;
  s=doAction(E.depositOne(C,s,id));
  assert.equal(s.materials[0].deposited,true);assert.equal(s.books.length,1);
  assert.equal(s.junk.reduce((x,j)=>x+j.qty*j.unitCopper,0),beforeValue);
  assert.throws(()=>E.depositOne(C,s,id),/already in storage/);
});
test('legacy v0.3 localStorage save can be read in v0.4 without loss',()=>{
  const s=E.initial(C);s.gems=42;
  const data={};const storage={getItem(k){return data[k]??null},setItem(k,v){data[k]=v}};
  E.write(C,storage,s);
  assert.equal(E.read(C,storage).gems,42);
  assert.equal(E.read(C,storage).fingerprint,E.fingerprint(C));
});

test('text edits invalidate v0.4 progress without changing gift count',()=>{
  const original=E.initial(C);original.gems=80;
  const data={};const storage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=v}};
  E.write(C,storage,original);
  const updated=structuredClone(C);updated.gifts[0].clue='A new clue after editing';
  const restored=E.read(updated,storage);
  assert.equal(restored.gems,0);
  assert.notEqual(E.contentFingerprint(updated),original.contentFingerprint);
});
test('v0.3 save without content checksum migrates safely',()=>{
  const original=E.initial(C);original.gems=47;delete original.contentFingerprint;
  const data={};const storage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=v}};
  E.write(C,storage,original);
  assert.equal(E.read(C,storage).gems,47);
  assert.equal(JSON.parse(data[C.storageKey]).contentFingerprint,E.contentFingerprint(C));
});


test('early secret code and pre-purchased spare key produce exactly one hidden chest at the last main opening',()=>{
  let s=E.initial(C);
  // Emulates a restored older save with a purchased spare key: unusual but valid
  // and must not prevent the unique bonus chest from appearing.
  for(const code of [...mainCodes,finalCode])s=doAction(E.redeem(C,s,code));
  s.keys=C.gifts.length+1; s.gems=0;
  for(let i=0;i<C.gifts.length-1;i++){
    const result=E.open(C,s);s=result.state;
    assert.equal(result.bonusGranted,false);
  }
  const last=E.open(C,s);s=last.state;
  assert.equal(last.bonusGranted,true);
  assert.equal(s.bonusGranted,true);
  assert.equal(s.keys,1);
  assert.equal(E.open(C,s).bonus,true);
});

test('normal path does not expose a bonus chest before the bonus-key purchase',()=>{
  let s=E.initial(C);
  for(const code of [...mainCodes,finalCode])s=doAction(E.redeem(C,s,code));
  for(let i=0;i<C.gifts.length;i++) {s=doAction(E.buyKey(C,s)); const r=E.open(C,s);s=r.state;assert.equal(r.bonusGranted,false);}
  assert.equal(s.keys,0);
  assert.equal(s.bonusGranted,false);
});
