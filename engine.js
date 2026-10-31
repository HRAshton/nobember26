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
      const data = JSON.parse(raw);
      if (data.version !== 1 || data.fingerprint !== fingerprint(c)) return initial(c);
      if (data.contentFingerprint && data.contentFingerprint !== contentFingerprint(c)) return initial(c);
      const state=Object.assign(initial(c), data, {contentFingerprint:contentFingerprint(c)});
      // v0.2/v0.3 saves lacked this field. Upgrade them once without losing progress.
      if (!data.contentFingerprint) { try { write(c,storage,state); } catch (_) {} }
      return state;
    } catch { return initial(c); }
  }
  function write(c, storage, state) { storage.setItem(c.storageKey, JSON.stringify(state)); }
  function requireValid(condition, message) { if (!condition) throw new Error(message); }
  function atomic(c, previous, fn) {
    const s = clone(previous); const outcome = fn(s) || {};
    requireValid(Number.isInteger(s.gems) && s.gems >= 0, 'Некорректный баланс кристаллов');
    requireValid(Number.isInteger(s.goldCopper) && s.goldCopper >= 0, 'Некорректный баланс золота');
    requireValid(Number.isInteger(s.keys) && s.keys >= 0, 'Некорректное число ключей');
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
      requireValid(normalized.length > 0, 'Введите код с записки.');
      const found = c.codes.find(item => item.code.trim().toUpperCase() === normalized);
      requireValid(!!found, 'Код не найден. Проверьте написание.');
      requireValid(!s.usedCodes.includes(normalized), 'Этот код уже использован.');
      s.usedCodes.push(normalized); s.gems += found.gems;
      return { kind:'redeem', message:`Код принят: +${found.gems} кристаллов.`, bonusGranted:false };
    });
  }
  function buyKey(c, previous) {
    return atomic(c, previous, s => {
      requireValid(s.gems >= c.economy.keyPriceGems, 'Недостаточно кристаллов для ключа.');
      s.gems -= c.economy.keyPriceGems; s.keys++;
      const bonusGranted = grantBonusIfEligible(c, s);
      return {kind:'buyKey', message: bonusGranted ? 'Ключ приобретён. В инвентаре появился неизвестный сундук!' : 'Black Lion Chest Key добавлен в инвентарь.', bonusGranted};
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
  function open(c, previous) {
    return atomic(c, previous, s => {
      requireValid(s.keys > 0, 'Нужен Black Lion Chest Key.');
      let rewards; let bonus = false;
      if (s.opened < c.gifts.length) {
        rewards = rewardsForChest(c, s.opened); s.opened++;
      } else {
        requireValid(s.bonusGranted && !s.bonusOpened, 'В инвентаре нет сундуков.');
        bonus=true; s.bonusOpened=true;
        rewards=[
          {type:'book',id:'legendary-book',name:c.bonus.title,subtitle:c.bonus.subtitle,icon:'📜',rarity:'legendary',clue:c.bonus.clue,hint:c.bonus.hint,qty:1},
          {type:'collectible',id:'legendary-token',name:'Печать последнего Льва',icon:'⚜',rarity:'legendary',qty:1},
          {type:'collectible',id:'golden-sigil',name:'Позолоченный знак судьбы',icon:'✦',rarity:'exotic',qty:1},
          {type:'material',id:'eternal-dust',name:'Звёздная эссенция',icon:'✧',rarity:'ascended',qty:25}
        ];
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
      return {kind:'open', message:bonus ? 'Легендарный сундук открыт!' : 'Получено 4 предмета.', rewards, bonus, bonusGranted};
    });
  }
  function sellJunk(c, previous, id) {
    return atomic(c, previous, s => {
      const target = id ? s.junk.filter(x => x.id===id) : s.junk.slice();
      requireValid(target.length>0,'У торговца нечего продавать.');
      const value = target.reduce((a,x)=>a+x.qty*x.unitCopper,0);
      s.goldCopper += value;
      s.junk = s.junk.filter(x=>!target.some(y=>y.id===x.id));
      for(const item of target) s.buyback.unshift({...item, totalCopper:item.qty*item.unitCopper});
      s.buyback = s.buyback.slice(0,40);
      return { kind:'sell', message:`Продано предметов: ${target.length}. Получено ${formatCoins(value)}.`, value };
    });
  }
  function buyBack(c, previous, id) {
    return atomic(c, previous, s => {
      const index=s.buyback.findIndex(x=>x.id===id);
      requireValid(index>=0,'Предмет не найден в списке выкупа.');
      const item=s.buyback[index];
      requireValid(s.goldCopper >= item.totalCopper,'Недостаточно монет для выкупа.');
      s.goldCopper -= item.totalCopper;
      s.junk.push({id:item.id,name:item.name,icon:item.icon,rarity:item.rarity,qty:item.qty,unitCopper:item.unitCopper,type:'junk'});
      s.buyback.splice(index,1);
      return {kind:'buyback',message:`Выкуплено: ${item.name}.`};
    });
  }
  function exchange(c, previous, count) {
    return atomic(c, previous, s => {
      const gems=Number(count);
      requireValid(Number.isInteger(gems) && gems>0,'Укажите целое число кристаллов.');
      const cost=gems*c.economy.copperPerGem;
      requireValid(s.goldCopper>=cost,'Недостаточно монет для обмена.');
      s.goldCopper-=cost; s.gems+=gems;
      return {kind:'exchange',message:`Обмен завершён: +${gems} кристаллов.`};
    });
  }
  function depositOne(c, previous, id){
    return atomic(c, previous, s=>{
      const item=s.materials.find(x=>x.id===id);
      requireValid(!!item && !item.deposited,'Этот материал уже в хранилище.');
      item.deposited=true;
      return {kind:'deposit',message:`Материал ${item.name} отправлен на склад.`};
    });
  }
  function deposit(c, previous) {
    return atomic(c, previous, s => {
      const count=s.materials.filter(x=>!x.deposited).length;
      requireValid(count>0,'Все материалы уже в хранилище.');
      s.materials.forEach(x=>x.deposited=true);
      return {kind:'deposit',message:`Перемещено в Material Storage: ${count}.`};
    });
  }

  // Offline, player-controlled backup: only state is copied, never executable code.
  function exportSave(c, state, timestamp = new Date().toISOString()) {
    requireValid(state && state.fingerprint === fingerprint(c), 'Сохранение относится к другой версии квеста.');
    requireValid(state.contentFingerprint === contentFingerprint(c), 'Сохранение использует другие загадки.');
    return {
      format:'gw2-black-lion-quest-save', version:1,
      exportedAt:timestamp, configFingerprint:fingerprint(c),
      contentFingerprint:contentFingerprint(c), state:clone(state)
    };
  }
  function importSave(c, storage, input) {
    let file;
    try { file=typeof input==='string'?JSON.parse(input):input; }
    catch (_) { throw new Error('Файл сохранения не является корректным JSON.'); }
    requireValid(file && file.format==='gw2-black-lion-quest-save' && file.version===1, 'Неверный формат файла сохранения.');
    requireValid(file.configFingerprint===fingerprint(c) && file.contentFingerprint===contentFingerprint(c), 'Этот бэкап создан для другой версии квеста или другого набора загадок.');
    const raw=file.state;
    requireValid(raw && typeof raw==='object' && !Array.isArray(raw) && raw.version===1, 'Данные сохранения повреждены.');
    requireValid(raw.fingerprint===fingerprint(c) && raw.contentFingerprint===contentFingerprint(c), 'Контрольная версия сохранения не совпадает.');
    for (const key of ['gems','goldCopper','keys','opened'])
      requireValid(Number.isSafeInteger(raw[key]) && raw[key]>=0, 'Некорректное число в сохранении: '+key);
    requireValid(raw.opened<=c.gifts.length, 'В сохранении больше сундуков, чем в конфиге.');
    requireValid(typeof raw.bonusGranted==='boolean' && typeof raw.bonusOpened==='boolean', 'Некорректный статус секретного сундука.');
    requireValid(!raw.bonusGranted || raw.opened===c.gifts.length, 'Некорректный секретный сундук.');
    requireValid(!raw.bonusOpened || raw.bonusGranted, 'Некорректный финал сохранения.');
    for (const key of ['usedCodes','books','junk','materials','collectibles','buyback','lastRewards','history'])
      requireValid(Array.isArray(raw[key]), 'Некорректный список в сохранении: '+key);
    const known=new Set(c.codes.map(x=>x.code.toUpperCase()));
    requireValid(raw.usedCodes.every(x=>typeof x==='string' && known.has(x)) && new Set(raw.usedCodes).size===raw.usedCodes.length, 'Список активированных кодов повреждён.');
    requireValid(raw.books.length===raw.opened+(raw.bonusOpened?1:0), 'Количество найденных книжек не совпадает с числом открытий.');
    requireValid(raw.books.every((x,i)=>x && x.id === (i<c.gifts.length?'book-'+c.gifts[i].id:'legendary-book')), 'Порядок сюжетных книжек повреждён.');
    requireValid(raw.junk.every(x=>x && x.type==='junk' && Number.isSafeInteger(x.unitCopper) && x.unitCopper>=0 && Number.isSafeInteger(x.qty) && x.qty>0), 'Неверные предметы мусора в сохранении.');
    requireValid(raw.materials.every(x=>x && x.type==='material' && Number.isSafeInteger(x.qty) && x.qty>0), 'Неверные материалы в сохранении.');
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
