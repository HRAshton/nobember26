const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const E=require('../engine.js');
const {validate,load}=require('../scripts/validate-config.cjs');
const {htmlFor,generate}=require('../scripts/print-code-cards.cjs');
const base=load(path.join(__dirname,'../config.js'));
const act=(result)=>result.state;
function scalable(n){
 const c=structuredClone(base);
 c.gifts=Array.from({length:n},(_,i)=>({...c.gifts[i%c.gifts.length],id:`gift-${i+1}`}));
 c.codes=Array.from({length:n},(_,i)=>({code:`STEP-${i+1}`,gems:c.economy.keyPriceGems}));
 c.codes.push({code:'LAST-SECRET',gems:10,final:true});
 return c;
}
test('1, 2, 5, 10 and 30 gift quests all support exact one bonus key after the secret code',()=>{
 for(const n of [1,2,5,10,30]){
  const c=scalable(n), result=validate(c);
  assert.deepEqual(result.errors,[],`n=${n}`);
  let s=E.initial(c);
  for(let i=0;i<n;i++){
   s=act(E.redeem(c,s,`STEP-${i+1}`));
   s=act(E.buyKey(c,s));
   assert.equal(s.keys,1,`n=${n},i=${i}`);
   const opened=E.open(c,s);s=opened.state;
   assert.equal(opened.rewards.length,4);
   assert.equal(opened.rewards[0].id,`book-gift-${i+1}`);
   assert.equal(s.bonusGranted,false);
   assert.equal(s.keys,0);
  }
  assert.equal(s.books.length,n);
  assert.equal(s.junk.reduce((v,j)=>v+j.qty*j.unitCopper,0),9000);
  s=act(E.sellJunk(c,s));
  s=act(E.exchange(c,s,90));
  assert.equal(s.gems,90);
  assert.throws(()=>E.buyKey(c,s),/Недостаточно/);
  s=act(E.redeem(c,s,'LAST-SECRET'));
  assert.equal(s.gems,100);
  const bonusKey=E.buyKey(c,s);s=bonusKey.state;
  assert.equal(bonusKey.bonusGranted,true);
  assert.equal(s.keys,1);
  s=act(E.open(c,s));
  assert.equal(s.books.length,n+1);
  assert.equal(s.bonusOpened,true);
  assert.equal(s.keys,0);
 }
});
test('organizer print sheets have exactly one card per main code and one separate secret card',()=>{
 for(const n of [1,5,10]){
  const c=scalable(n);
  const html=htmlFor(c);
  assert.equal((html.match(/class="card /g)||[]).length,n+1);
  assert.ok(html.includes('ПОСЛЕ ПОДАРКА №'+(n-1)) || n===1);
  assert.ok(html.includes('LAST-SECRET'));
  assert.equal((html.match(/class="card secret"/g)||[]).length,1);
  assert.equal(html,htmlFor(c),'print output must be reproducible');
 }
});
test('printed codes are HTML-escaped and bad configs cannot produce a print sheet',()=>{
 const c=scalable(2);c.gifts[0].clue='<script>alert(1)</script>';
 c.codes[0].code='ABC<TEST>';
 const html=htmlFor(c);
 assert.ok(html.includes('ABC&lt;TEST&gt;'));
 assert.ok(!html.includes('<script>alert(1)</script>'));
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gw2-v07-'));
 const fakeConfig=path.join(tmp,'config.js'),out=path.join(tmp,'private.html');
 fs.writeFileSync(fakeConfig,'window.QUEST_CONFIG='+JSON.stringify({...c,codes:[c.codes[0]]})+';');
 assert.throws(()=>generate(fakeConfig,out),/исправьте ошибки/);
 assert.equal(fs.existsSync(out),false);
 fs.rmSync(tmp,{recursive:true,force:true});
});
