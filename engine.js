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
  // This exact demo was translated without changing gifts, codes or economics.
  // Accept only that known pair of releases, never an arbitrarily edited quest.
  function migrateEnglishDemo(c, data) {
    if (!data || data.version!==1 || data.fingerprint!=='8g5lcs' ||
        (data.contentFingerprint && data.contentFingerprint!=='w430xq') ||
        fingerprint(c)!=='ljfinq' || contentFingerprint(c)!=='1cp3dgy') return data;
    const state=clone(data);
    state.fingerprint=fingerprint(c);state.contentFingerprint=contentFingerprint(c);
    const items=new Map([...c.gifts.flatMap((_,i)=>rewardsForChest(c,i)),...bonusRewards(c)].map(item=>[item.id,item]));
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
      bonusGranted:false, bonusOpened:false, usedCodes:[], books:[], junk:[], materials:[],
      collectibles:[], buyback:[], lastRewards:[], lastAction:'', history:[]
    };
  }
  function read(c, storage) {
    try {
      const raw = storage.getItem(c.storageKey); if (!raw) return initial(c);
      const saved = JSON.parse(raw);
      const data = migrateEnglishDemo(c, saved);
      if (data.version !== 1 || data.fingerprint !== fingerprint(c)) return initial(c);
      if (data.contentFingerprint && data.contentFingerprint !== contentFingerprint(c)) return initial(c);
      const state=Object.assign(initial(c), data, {contentFingerprint:contentFingerprint(c)});
      // v0.2/v0.3 saves lacked this field. Upgrade them once without losing progress.
      if (!data.contentFingerprint || data!==saved) { try { write(c,storage,state); } catch (_) {} }
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
    const final = c.codes.find(code => code.final);
    const redeemed = !!final && s.usedCodes.includes(final.code.toUpperCase());
    if (!s.bonusGranted && s.opened === c.gifts.length && redeemed && s.keys > 0) {
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
      return { kind:'redeem', message:`Code redeemed: +${found.gems} gems.`, bonusGranted:false };
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
  function bonusRewards(c) {
    return [
      {type:'book',id:'legendary-book',name:c.bonus.title,subtitle:c.bonus.subtitle,icon:'📜',rarity:'legendary',clue:c.bonus.clue,hint:c.bonus.hint,qty:1},
      {type:'collectible',id:'legendary-token',name:'Seal of the Last Lion',icon:'⚜',rarity:'legendary',qty:1},
      {type:'collectible',id:'golden-sigil',name:'Gilded Sigil of Fate',icon:'✦',rarity:'exotic',qty:1},
      {type:'material',id:'eternal-dust',name:'Stellar Essence',icon:'✧',rarity:'ascended',qty:25}
    ];
  }
  function open(c, previous) {
    return atomic(c, previous, s => {
      requireValid(s.keys > 0, 'A Black Lion Chest Key is required.');
      let rewards; let bonus = false;
      if (s.opened < c.gifts.length) {
        rewards = rewardsForChest(c, s.opened); s.opened++;
      } else {
        requireValid(s.bonusGranted && !s.bonusOpened, 'There are no chests in your inventory.');
        bonus=true; s.bonusOpened=true;
        rewards=bonusRewards(c);
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
      s.lastRewards = rewards;
      // An early final code and an early purchase must never make the secret chest
      // unreachable. In that case the chest materializes after the last normal
      // chest, when the player already holds an extra key.
      const bonusGranted = !bonus && grantBonusIfEligible(c, s);
      return {kind:'open', message:bonus ? 'Legendary chest opened!' : '4 items received.', rewards, bonus, bonusGranted};
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
    if (file.configFingerprint==='8g5lcs' && file.contentFingerprint==='w430xq' &&
        file.state?.fingerprint==='8g5lcs' && file.state?.contentFingerprint==='w430xq') {
      const translated=migrateEnglishDemo(c,file.state);
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
    for (const key of ['usedCodes','books','junk','materials','collectibles','buyback','lastRewards','history'])
      requireValid(Array.isArray(raw[key]), 'Invalid list in save: '+key);
    const known=new Set(c.codes.map(x=>x.code.toUpperCase()));
    requireValid(raw.usedCodes.every(x=>typeof x==='string' && known.has(x)) && new Set(raw.usedCodes).size===raw.usedCodes.length, 'The redeemed code list is damaged.');
    requireValid(raw.books.length===raw.opened+(raw.bonusOpened?1:0), 'The journal count does not match the number of opened chests.');
    requireValid(raw.books.every((x,i)=>x && x.id === (i<c.gifts.length?'book-'+c.gifts[i].id:'legendary-book')), 'The quest journal order is damaged.');
    requireValid(raw.junk.every(x=>x && x.type==='junk' && Number.isSafeInteger(x.unitCopper) && x.unitCopper>=0 && Number.isSafeInteger(x.qty) && x.qty>0), 'Invalid junk items in save.');
    requireValid(raw.materials.every(x=>x && x.type==='material' && Number.isSafeInteger(x.qty) && x.qty>0), 'Invalid materials in save.');
    // Explicit allowlist; do not import unexpected data into the engine state.
    const state=initial(c);
    for(const key of Object.keys(state)) if(Object.prototype.hasOwnProperty.call(raw,key)) state[key]=clone(raw[key]);
    write(c,storage,state);
    return state;
  }

  function formatCoins(value) {
    const copper=Math.max(0,Math.floor(value));
    const g=Math.floor(copper/10000),s=Math.floor(copper%10000/100),c=copper%100;
    return `${g}g ${String(s).padStart(2,'0')}s ${String(c).padStart(2,'0')}c`;
  }
  return {initial,read,write,fingerprint,contentFingerprint,redeem,buyKey,open,sellJunk,buyBack,exchange,deposit,depositOne,formatCoins,rewardsForChest,junkAllocations,grantBonusIfEligible,exportSave,importSave};
});
