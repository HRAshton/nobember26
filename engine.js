/* Portable and dependency-free state engine. Browser: window.GW2Engine; Node: require('./engine.js') */
(function(root, factory) {
  const exported = factory();
  if (typeof module === 'object' && module.exports) module.exports = exported;
  if (root) root.GW2Engine = exported;
})(typeof window === 'undefined' ? null : window, function() {
  'use strict';
  const clone = x => JSON.parse(JSON.stringify(x));
  const FNV = str => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  };
  function fingerprint(c) { return FNV(JSON.stringify({g:c.gifts.map(g=>g.id),codes:c.codes,economy:c.economy,bonus:c.bonus})); }
  // A second fingerprint protects edited book text and artwork labels from old saved snapshots.
  function contentFingerprint(c) { return FNV(JSON.stringify({gifts:c.gifts,bonus:c.bonus})); }
  function bonusStages(c) {
    if (Array.isArray(c.bonus)) return c.bonus;
    const code=c.codes.find(entry=>entry?.final)?.code;
    return [{...c.bonus,id:'legendary',code}];
  }
  function openedBonusIds(c, state) {
    if (Array.isArray(state.bonusOpenedIds)) return state.bonusOpenedIds;
    return state.bonusOpened ? [bonusStages(c).at(-1).id] : [];
  }
  function bonusBookId(stage) {
    return stage.id==='legendary' ? 'legendary-book' : 'book-'+stage.id;
  }
  // Only these exact revisions may reuse progress from an earlier release.
  function migrateKnownRevision(c, data) {
    if (!data || data.version!==1) return data;
    const currentFingerprint=fingerprint(c);
    const currentContent=contentFingerprint(c);
    const demoTranslation=data.fingerprint==='8g5lcs' &&
      (!data.contentFingerprint || data.contentFingerprint==='w430xq') &&
      currentFingerprint==='ljfinq' && currentContent==='1cp3dgy';
    const personalRevision=data.fingerprint==='1u9j280' && data.contentFingerprint==='1jgo4t0' &&
      currentFingerprint==='6ddbjx' && currentContent==='ua3dfa';
    const previousPersonal=(data.fingerprint==='6ddbjx' && data.contentFingerprint==='ua3dfa') ||
      (data.fingerprint==='1u9j280' && data.contentFingerprint==='1jgo4t0');
    const quotationConfig=(currentFingerprint==='t47zv8' && currentContent==='3hxg46') ||
      (currentFingerprint==='1smb5pj' && ['wtz1zx','1l5a8tv'].includes(currentContent));
    const secretExpansion=previousPersonal && ((currentFingerprint==='1g13ejj' && currentContent==='15s46ts') || quotationConfig);
    const quotationRevision=quotationConfig && ((data.fingerprint==='1g13ejj' && data.contentFingerprint==='15s46ts') ||
      (data.fingerprint==='t47zv8' && data.contentFingerprint==='3hxg46') ||
      (data.fingerprint==='1smb5pj' && data.contentFingerprint==='wtz1zx'));
    if (!demoTranslation && !personalRevision && !secretExpansion && !quotationRevision) return data;
    const state=clone(data);
    state.fingerprint=fingerprint(c);state.contentFingerprint=contentFingerprint(c);
    state.bonusOpenedIds=openedBonusIds(c,data);
    if (secretExpansion) {
      state.usedCodes=state.usedCodes.map(code=>code==='PROPHECIES'?'CHOYA':code);
      state.bonusOpened=false;
      // A completed former finale keeps its book and receives a key for the
      // newly inserted perfume chest, with no repeat reward for the old book.
      if (data.bonusOpened) {
        state.keys++;
        state.usedCodes=[...new Set([...state.usedCodes,'CHOYA','PROPHECIES'])];
      }
      state.bonusGranted=false;
      grantBonusIfEligible(c,state);
    }
    const stages=bonusStages(c);
    const items=new Map([...c.gifts.flatMap((_,i)=>rewardsForChest(c,i)),...stages.flatMap((_,i)=>bonusRewards(c,i))].map(item=>[item.id,item]));
    for (const list of ['books','junk','materials','collectibles','buyback','lastRewards']) {
      if (!Array.isArray(state[list])) continue;
      state[list]=state[list].map(item=>{
        const translated=items.get(item?.id);
        if (!translated) return item;
        const result={...item};
        for (const key of ['name','subtitle','clue','hint'])
          if (key in translated) result[key]=translated[key];
        return result;
      });
    }
    return state;
  }
  function initial(c) {
    return {
      version: 1, fingerprint: fingerprint(c), contentFingerprint: contentFingerprint(c), gems:0, goldCopper:0, keys:0, opened:0,
      bonusGranted:false, bonusOpened:false, bonusOpenedIds:[], usedCodes:[], books:[], junk:[], materials:[],
      collectibles:[], buyback:[], lastRewards:[], lastAction:'', history:[]
    };
  }
  function read(c, storage) {
    try {
      const raw = storage.getItem(c.storageKey); if (!raw) return initial(c);
      const saved = JSON.parse(raw);
      const data = migrateKnownRevision(c, saved);
      if (data.version !== 1 || data.fingerprint !== fingerprint(c)) return initial(c);
      if (data.contentFingerprint && data.contentFingerprint !== contentFingerprint(c)) return initial(c);
      const state=Object.assign(initial(c), data, {contentFingerprint:contentFingerprint(c)});
      state.bonusOpenedIds=openedBonusIds(c,data);
      // v0.2/v0.3 saves lacked this field. Upgrade them once without losing progress.
      if (!data.contentFingerprint || !data.bonusOpenedIds || data!==saved) { try { write(c,storage,state); } catch (_) {} }
      return state;
    } catch { return initial(c); }
  }
  function write(c, storage, state) { storage.setItem(c.storageKey, JSON.stringify(state)); }
  function requireValid(condition, message) { if (!condition) throw new Error(message); }
  function atomic(c, previous, fn) {
    const s = clone(previous); const outcome = fn(s) || {};
    requireValid(Number.isInteger(s.gems) && s.gems >= 0, 'Invalid gem balance');
    requireValid(Number.isInteger(s.goldCopper) && s.goldCopper >= 0, 'Invalid coin balance');
    requireValid(Number.isInteger(s.keys) && s.keys >= 0, 'Invalid key count');
    s.lastAction = outcome.message || '';
    s.history = [...s.history, {kind:outcome.kind || 'action', message:s.lastAction}].slice(-40);
    return {state:s, ...outcome};
  }
  function grantBonusIfEligible(c, s) {
    const completed=openedBonusIds(c,s);
    const stage=bonusStages(c).find(entry=>!completed.includes(entry.id));
    const redeemed=stage && s.usedCodes.includes(stage.code.trim().toUpperCase());
    if (!s.bonusGranted && s.opened===c.gifts.length && redeemed && s.keys>0) {
      s.bonusGranted = true;
      return true;
    }
    return false;
  }
  function redeem(c, previous, raw) {
    return atomic(c, previous, s => {
      const normalized = String(raw || '').trim().toUpperCase();
      requireValid(normalized.length > 0, 'Enter the code from your note.');
      const found = c.codes.find(item => item.code.trim().toUpperCase() === normalized);
      requireValid(!!found, 'Code not found. Check the spelling.');
      requireValid(!s.usedCodes.includes(normalized), 'This code has already been redeemed.');
      s.usedCodes.push(normalized); s.gems += found.gems;
      const bonusGranted=grantBonusIfEligible(c,s);
      return { kind:'redeem', message:`Code redeemed: +${found.gems} gems.`, bonusGranted };
    });
  }
  function buyKey(c, previous) {
    return atomic(c, previous, s => {
      requireValid(s.gems >= c.economy.keyPriceGems, 'Not enough gems to buy a key.');
      s.gems -= c.economy.keyPriceGems; s.keys++;
      const bonusGranted = grantBonusIfEligible(c, s);
      return {kind:'buyKey', message: bonusGranted ? 'Key purchased. A mysterious chest has appeared in your inventory!' : 'Black Lion Chest Key added to your inventory.', bonusGranted};
    });
  }
  function junkAllocations(c) {
    const n = c.gifts.length; if (n===0) return [];
    const weights = c.gifts.map((_, i) => [2,3,4][i%3]);
    const weightSum = weights.reduce((a,b)=>a+b,0);
    const coins = weights.map(w => Math.floor(c.economy.junkTotalCopper*w/weightSum));
    let left = c.economy.junkTotalCopper - coins.reduce((a,b)=>a+b,0);
    for(let i=0;left>0;i=(i+1)%n,left--) coins[i]++;
    return coins;
  }
  function rewardsForChest(c, idx) {
    const g = c.gifts[idx]; const value = junkAllocations(c)[idx];
    const qty = [2,3,4][idx%3];
    const count = value % qty===0 ? qty : 1;
    return [
      {type:'book',id:`book-${g.id}`,name:g.bookTitle,subtitle:g.subtitle,icon:'📖',rarity:'rare',clue:g.clue,hint:g.hint,qty:1},
      {type:'junk',id:`junk-${g.id}`,name:g.junkName,icon:g.junkIcon || '♜',rarity:'junk',qty:count,unitCopper:value/count},
      {type:'material',id:`material-${g.id}`,name:g.material,icon:g.materialIcon || '✧',rarity:'fine',qty:[5,8,3][idx%3]},
      {type:'collectible',id:`collectible-${g.id}`,name:g.collectible,icon:g.collectibleIcon || '⚜',rarity:['masterwork','rare','exotic'][idx%3],qty:1}
    ];
  }
  function bonusRewards(c, index=bonusStages(c).length-1) {
    const stage=bonusStages(c)[index];
    const legendary=stage.id==='legendary';
    return [
      {type:'book',id:bonusBookId(stage),name:stage.title,subtitle:stage.subtitle,icon:'📜',rarity:legendary?'legendary':'exotic',clue:stage.clue,hint:stage.hint,qty:1},
      {type:'collectible',id:legendary?'legendary-token':stage.id+'-token',name:legendary?'Seal of the Last Lion':'Choya Perfume',icon:legendary?'⚜':'✿',rarity:legendary?'legendary':'exotic',qty:1},
      {type:'collectible',id:legendary?'golden-sigil':stage.id+'-sigil',name:legendary?'Gilded Sigil of Fate':'Fragrant Choya Blossom',icon:'✦',rarity:legendary?'exotic':'rare',qty:1},
      {type:'material',id:legendary?'eternal-dust':stage.id+'-dust',name:legendary?'Stellar Essence':'Shimmering Essence',icon:'✧',rarity:legendary?'ascended':'fine',qty:legendary?25:10}
    ];
  }
  function open(c, previous) {
    return atomic(c, previous, s => {
      requireValid(s.keys > 0, 'A Black Lion Chest Key is required.');
      let rewards; let bonus = false; let legendary = false;
      if (s.opened < c.gifts.length) {
        rewards = rewardsForChest(c, s.opened); s.opened++;
      } else {
        requireValid(s.bonusGranted && !s.bonusOpened, 'There are no chests in your inventory.');
        const stages=bonusStages(c);
        s.bonusOpenedIds=openedBonusIds(c,s);
        const index=stages.findIndex(stage=>!s.bonusOpenedIds.includes(stage.id));
        requireValid(index>=0,'There are no chests in your inventory.');
        bonus=true;legendary=stages[index].id==='legendary';
        rewards=bonusRewards(c,index);
        s.bonusOpenedIds.push(stages[index].id);
        s.bonusOpened=s.bonusOpenedIds.length===stages.length;
        s.bonusGranted=s.bonusOpened;
      }
      s.keys--;
      rewards.forEach(item => {
        if (item.type==='book') s.books.push(item);
        if (item.type==='junk') s.junk.push(item);
        if (item.type==='material') {
          const existing=s.materials.find(x=>x.id===item.id);
          if (existing) existing.qty += item.qty; else s.materials.push({...item, deposited:false});
        }
        if (item.type==='collectible') s.collectibles.push(item);
      });
      const bookOrder=[...c.gifts.map(gift=>'book-'+gift.id),...bonusStages(c).map(bonusBookId)];
      s.books.sort((a,b)=>bookOrder.indexOf(a.id)-bookOrder.indexOf(b.id));
      s.lastRewards = rewards;
      // An early final code and an early purchase must never make the secret chest
      // unreachable. In that case the chest materializes after the last normal
      // chest, when the player already holds an extra key.
      const bonusGranted = grantBonusIfEligible(c, s);
      return {kind:'open', message:legendary ? 'Legendary chest opened!' : '4 items received.', rewards, bonus, legendary, bonusGranted};
    });
  }
  function sellJunk(c, previous, id) {
    return atomic(c, previous, s => {
      const target = id ? s.junk.filter(x => x.id===id) : s.junk.slice();
      requireValid(target.length>0,'You have no items to sell.');
      const value = target.reduce((a,x)=>a+x.qty*x.unitCopper,0);
      s.goldCopper += value;
      s.junk = s.junk.filter(x=>!target.some(y=>y.id===x.id));
      for(const item of target) s.buyback.unshift({...item, totalCopper:item.qty*item.unitCopper});
      s.buyback = s.buyback.slice(0,40);
      return { kind:'sell', message:`Sold ${target.length} items for ${formatCoins(value)}.`, value };
    });
  }
  function buyBack(c, previous, id) {
    return atomic(c, previous, s => {
      const index=s.buyback.findIndex(x=>x.id===id);
      requireValid(index>=0,'Item not found in the buyback list.');
      const item=s.buyback[index];
      requireValid(s.goldCopper >= item.totalCopper,'Not enough coins to buy this item back.');
      s.goldCopper -= item.totalCopper;
      s.junk.push({id:item.id,name:item.name,icon:item.icon,rarity:item.rarity,qty:item.qty,unitCopper:item.unitCopper,type:'junk'});
      s.buyback.splice(index,1);
      return {kind:'buyback',message:`Bought back: ${item.name}.`};
    });
  }
  function exchange(c, previous, count) {
    return atomic(c, previous, s => {
      const gems=Number(count);
      requireValid(Number.isInteger(gems) && gems>0,'Enter a positive whole number of gems.');
      const cost=gems*c.economy.copperPerGem;
      requireValid(s.goldCopper>=cost,'Not enough coins for this exchange.');
      s.goldCopper-=cost; s.gems+=gems;
      return {kind:'exchange',message:`Exchange complete: +${gems} gems.`};
    });
  }
  function depositOne(c, previous, id){
    return atomic(c, previous, s=>{
      const item=s.materials.find(x=>x.id===id);
      requireValid(!!item && !item.deposited,'This material is already in storage.');
      item.deposited=true;
      return {kind:'deposit',message:`${item.name} deposited in Material Storage.`};
    });
  }
  function deposit(c, previous) {
    return atomic(c, previous, s => {
      const count=s.materials.filter(x=>!x.deposited).length;
      requireValid(count>0,'All materials are already in storage.');
      s.materials.forEach(x=>x.deposited=true);
      return {kind:'deposit',message:`Deposited ${count} materials in Material Storage.`};
    });
  }

  // Offline, player-controlled backup: only state is copied, never executable code.
  function exportSave(c, state, timestamp = new Date().toISOString()) {
    requireValid(state && state.fingerprint === fingerprint(c), 'The save belongs to a different quest version.');
    requireValid(state.contentFingerprint === contentFingerprint(c), 'The save uses a different set of clues.');
    return {
      format:'gw2-black-lion-quest-save', version:1,
      exportedAt:timestamp, configFingerprint:fingerprint(c),
      contentFingerprint:contentFingerprint(c), state:clone(state)
    };
  }
  function importSave(c, storage, input) {
    let file;
    try { file=typeof input==='string'?JSON.parse(input):input; }
    catch (_) { throw new Error('The save file is not valid JSON.'); }
    requireValid(file && file.format==='gw2-black-lion-quest-save' && file.version===1, 'Invalid save file format.');
    if (file.state && file.configFingerprint===file.state.fingerprint &&
        file.contentFingerprint===file.state.contentFingerprint) {
      const translated=migrateKnownRevision(c,file.state);
      if (translated!==file.state) file={...file,state:translated,configFingerprint:translated.fingerprint,contentFingerprint:translated.contentFingerprint};
    }
    requireValid(file.configFingerprint===fingerprint(c) && file.contentFingerprint===contentFingerprint(c), 'This backup belongs to a different quest version or set of clues.');
    const raw=file.state;
    requireValid(raw && typeof raw==='object' && !Array.isArray(raw) && raw.version===1, 'The save data is damaged.');
    requireValid(raw.fingerprint===fingerprint(c) && raw.contentFingerprint===contentFingerprint(c), 'The save version checksum does not match.');
    for (const key of ['gems','goldCopper','keys','opened'])
      requireValid(Number.isSafeInteger(raw[key]) && raw[key]>=0, 'Invalid number in save: '+key);
    requireValid(raw.opened<=c.gifts.length, 'The save contains more chests than the configuration allows.');
    requireValid(typeof raw.bonusGranted==='boolean' && typeof raw.bonusOpened==='boolean', 'Invalid secret chest status.');
    requireValid(!raw.bonusGranted || raw.opened===c.gifts.length, 'Invalid secret chest state.');
    requireValid(!raw.bonusOpened || raw.bonusGranted, 'Invalid ending state in save.');
    requireValid(raw.bonusOpenedIds===undefined || Array.isArray(raw.bonusOpenedIds),'Invalid completed secret chests.');
    const completed=openedBonusIds(c,raw);
    const stages=bonusStages(c);
    requireValid(Array.isArray(completed) && new Set(completed).size===completed.length &&
      completed.every(id=>stages.some(stage=>stage.id===id)), 'Invalid completed secret chests.');
    requireValid(raw.bonusOpened===(completed.length===stages.length),'Invalid ending state in save.');
    for (const key of ['usedCodes','books','junk','materials','collectibles','buyback','lastRewards','history'])
      requireValid(Array.isArray(raw[key]), 'Invalid list in save: '+key);
    const known=new Set(c.codes.map(x=>x.code.toUpperCase()));
    requireValid(raw.usedCodes.every(x=>typeof x==='string' && known.has(x)) && new Set(raw.usedCodes).size===raw.usedCodes.length, 'The redeemed code list is damaged.');
    requireValid(raw.books.length===raw.opened+completed.length, 'The journal count does not match the number of opened chests.');
    const expectedBooks=[...c.gifts.slice(0,raw.opened).map(gift=>'book-'+gift.id),...stages.filter(stage=>completed.includes(stage.id)).map(bonusBookId)];
    requireValid(raw.books.every((book,index)=>book && book.id===expectedBooks[index]), 'The quest journal order is damaged.');
    requireValid(raw.junk.every(x=>x && x.type==='junk' && Number.isSafeInteger(x.unitCopper) && x.unitCopper>=0 && Number.isSafeInteger(x.qty) && x.qty>0), 'Invalid junk items in save.');
    requireValid(raw.materials.every(x=>x && x.type==='material' && Number.isSafeInteger(x.qty) && x.qty>0), 'Invalid materials in save.');
    // Explicit allowlist; do not import unexpected data into the engine state.
    const state=initial(c);
    for(const key of Object.keys(state)) if(Object.prototype.hasOwnProperty.call(raw,key)) state[key]=clone(raw[key]);
    state.bonusOpenedIds=clone(completed);
    write(c,storage,state);
    return state;
  }

  function formatCoins(value) {
    const copper=Math.max(0,Math.floor(value));
    const g=Math.floor(copper/10000),s=Math.floor(copper%10000/100),c=copper%100;
    return `${g}g ${String(s).padStart(2,'0')}s ${String(c).padStart(2,'0')}c`;
  }
  return {initial,read,write,fingerprint,contentFingerprint,bonusStages,redeem,buyKey,open,sellJunk,buyBack,exchange,deposit,depositOne,formatCoins,rewardsForChest,junkAllocations,grantBonusIfEligible,exportSave,importSave};
});
