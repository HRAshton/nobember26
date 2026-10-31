(function () {
  'use strict';
  const C=window.QUEST_CONFIG, E=window.GW2Engine, AudioFX=window.GW2Sounds;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sound = name => { if (AudioFX) AudioFX.play(name); };
  function updateSoundButton(){const b=document.querySelector('#audioToggle');if(!b)return;const on=AudioFX&&AudioFX.isEnabled();b.setAttribute('aria-pressed',String(!!on));b.setAttribute('aria-label',on?'Disable sound effects':'Enable sound effects');b.innerHTML=on?'◖ <span>Sound on</span>':'◖ <span>Sound off</span>';}
  let S=E.read(C,localStorage), screen='inventory', tab='store', inventoryTab='bags', pending=null, toastTimer=null, searchQuery='', selectedId=null, pressTimer=null, suppressContextClick=false, dragState=null, windowOffset={x:0,y:0};
  const $ = s=>document.querySelector(s);
  const h = text=>String(text??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const a='./assets/';
  // The static game works offline with local art. On an actual web host, the
  // public GW2 API can optionally provide genuine chest/key inventory icons.
  // No codes, player progress, or personal data are transmitted in this request.
  const officialArt=Object.create(null);
  const img = (name,cls='')=>`<img class="${cls}" data-art="${h(name)}" src="${h((window.GW2_LOCAL_ASSETS||{})[name] || (a+name+'.svg'))}" alt="">`;
  function applyOfficialArt(){
    for(const [name,src] of Object.entries(officialArt))
      if (!(window.GW2_LOCAL_ASSETS||{})[name])
      document.querySelectorAll(`img[data-art="${name}"]`).forEach(el=>{if(el.src!==src)el.src=src;});
  }
  async function loadOfficialArt(){
    if(!['http:','https:'].includes(location.protocol))return;
    // A finished local skin never needs the optional metadata service.
    if(['chest','key','material-dust','material-ore','material-shard','material-eternal'].every(name=>(window.GW2_LOCAL_ASSETS||{})[name]))return;
    try {
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),3500);
      let response;
      try {response=await fetch('https://api.guildwars2.com/v2/items?ids=20316,19980,24272,19703,24273,24295&lang=en',{signal:controller.signal,credentials:'omit'});}
      finally{clearTimeout(timeout);}
      if(!response.ok)return;
      const entries=await response.json();
      const ids={20316:'chest',19980:'key',24272:'material-dust',19703:'material-ore',24273:'material-shard',24295:'material-eternal'};
      for(const item of entries){
        const name=ids[item.id];
        if(!name || typeof item.icon!=='string')continue;
        const u=new URL(item.icon);
        if(u.protocol!=='https:' || u.hostname!=='render.guildwars2.com' || !/^\/file\/[A-Fa-f0-9]+\/\d+\.png$/.test(u.pathname))continue;
        // Preload: never swap a working local icon for a broken remote image.
        const success=await new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src=u.href;});
        if(success){officialArt[name]=u.href;applyOfficialArt();}
      }
    } catch (_) { /* Offline and blocked networks keep local icon fallback. */ }
  }
  const coin = value=> {const g=Math.floor(value/10000),s=Math.floor(value%10000/100),c=value%100;return `<span class="coins"><b class="gold-num">${g}<i>g</i></b><b class="silver-num">${String(s).padStart(2,'0')}<i>s</i></b><b class="copper-num">${String(c).padStart(2,'0')}<i>c</i></b></span>`;};
  const letter = item => item.rarity||'fine';
  const rarities={junk:'Junk',basic:'Basic',fine:'Fine',masterwork:'Masterwork',rare:'Rare',exotic:'Exotic',ascended:'Ascended',legendary:'Legendary'};
  const itemDescription = item => {
    if (item.type==='chest'||item.type==='bonusChest')return 'Contains four rewards. Requires a Black Lion Chest Key to open.';
    if (item.type==='key')return 'Opens one Black Lion Chest.';
    if (item.type==='book')return 'A quest journal. Double-click to read its clue.';
    if (item.type==='junk')return 'A junk trophy that can be sold to a merchant.';
    if (item.type==='material')return 'A crafting material. Can be deposited in Material Storage.';
    return 'A trophy kept in your collection.';
  };
  function findItem(id){return [...regularItems(),...S.books,...S.materials,...S.collectibles,...S.buyback].find(x=>x.id===id);}
  function menuEntries(item, bag){
    const entries=[];
    if(['chest','bonusChest'].includes(item.type))entries.push(['open','Use'],['preview','Preview']);
    if(item.type==='key')entries.push(['inspect','Inspect']);
    if(item.type==='book')entries.push(['read','Read']);
    if(item.type==='material'){
      entries.push(['inspect','Inspect']);
      if(!item.deposited)entries.push(['deposit','Deposit Material']);
    }
    if(item.type==='junk'){
      entries.push(['inspect','Inspect']);
      if(bag==='vendor')entries.push(['sell','Sell']);
      else if(bag==='buyback')entries.push(['buyback','Buy Back']);
      else entries.push(['merchant','Sell at Merchant…']);
    }
    if(item.type==='collectible')entries.push(['inspect','Preview']);
    return entries;
  }
  const illustration = item => {
    if(item.type==='chest'||item.type==='bonusChest') return 'chest';
    if(item.type==='key') return 'key';
    if(item.id==='legendary-book') return 'book-final';
    if(item.id==='legendary-token') return 'collectible-final';
    if(item.id==='golden-sigil') return 'collectible-sigil';
    if(item.id==='eternal-dust') return 'material-eternal';
    const match = /^(.+?)-(.+)$/.exec(item.id||'');
    if(!match) return null;
    const index = C.gifts.findIndex(g=>g.id===match[2]);
    if(index<0)return null;
    const prefix=match[1];
    if(prefix==='book')return 'book-'+(index%3+1);
    if(prefix==='junk')return ['junk-seal','junk-tooth','junk-box'][index%3];
    if(prefix==='material')return ['material-dust','material-ore','material-shard'][index%3];
    if(prefix==='collectible')return ['collectible-anchor','collectible-caravan','collectible-captain'][index%3];
    return null;
  };
  const icon = item=> illustration(item) ? img(illustration(item),'item-art') : `<span class="icon-glyph">${h(item.icon||'✧')}</span>`;
  const itemTile = (item,bag='normal')=> `<button class="item-slot item-${letter(item)} ${selectedId===item.id?'item-selected':''}" type="button" data-item="${h(item.id)}" data-name="${h(item.name.toLocaleLowerCase())}" data-bag="${bag}" aria-pressed="${selectedId===item.id}" aria-label="${h(item.name)}">
    ${icon(item)}${item.qty>1?`<span class="stack-count">${item.qty}</span>`:''}<span class="rarity-corner"></span></button>`;
  const empties = count=>Array.from({length:Math.max(0,count)},()=>'<span class="item-slot slot-empty" aria-hidden="true"></span>').join('');
  function regularItems(){const list=[];const remain=C.gifts.length-S.opened;if(remain>0)list.push({type:'chest',id:'regular-chest',name:'Black Lion Chest',qty:remain,rarity:'fine'});if(S.bonusGranted&&!S.bonusOpened)list.push({type:'bonusChest',id:'bonus-chest',name:'Black Lion Chest',qty:1,rarity:'fine'});if(S.keys>0)list.push({type:'key',id:'black-lion-key',name:'Black Lion Chest Key',qty:S.keys,rarity:'fine'});return [...list,...S.junk,...S.materials.filter(x=>!x.deposited)];}
  function slotGrid(items,capacity,bag){const cols=10;const shownCapacity=Math.max(capacity,Math.ceil(items.length/10)*10);return `<div class="slots-grid">${items.map(x=>itemTile(x,bag)).join('')}${empties(shownCapacity-items.length)}</div>`;}
  function inventory(){
    const current=inventoryTab;
    const all=regularItems(), quest=S.books;
    const starterSlots=Math.max(20,Math.ceil(all.length/20)*20);
    const questSlots=Math.max(20,Math.ceil(quest.length/20)*20);
    return `<div class="inventory-toolbar"><span>Inventory <em>${all.length+quest.length} / ${starterSlots+questSlots}</em></span><div class="toolbar-actions"><button data-action="compact" title="Compact inventory" aria-label="Compact inventory">${img('compact')}</button><button data-action="deposit" title="Deposit All Materials" aria-label="Deposit all materials">${img('deposit')}</button></div></div><div class="inventory-search"><span aria-hidden="true">⌕</span><input id="inventorySearch" type="search" placeholder="Search inventory..." aria-label="Search inventory" value="${h(searchQuery)}"></div>
      <div class="minor-tabs"><button class="${current==='bags'?'selected':''}" data-invtab="bags">Bags</button><button class="${current==='materials'?'selected':''}" data-invtab="materials">Material Storage</button><button class="${current==='collection'?'selected':''}" data-invtab="collection">Collections</button></div>
      ${current==='bags'?`
      <div class="inventory-with-rail">
      <div class="bag-rail" aria-label="Bags">
        <button class="rail-bag" title="Starter Backpack" data-jump-bag="starter" aria-label="Jump to Starter Backpack">${img('bag')}<span>1</span></button>
        <button class="rail-bag quest-rail" title="Quest Bag" data-jump-bag="quest" aria-label="Jump to Quest Bag">${img('book-1')}<span>2</span></button>
        <span class="rail-lock" title="Other bags are unavailable" aria-hidden="true">♙</span>
      </div>
      <div class="inventory-bag-area">
      <div class="bag-block" id="bag-starter"><div class="bag-heading"><span class="bag-icon">▣</span><span>Starter Backpack</span><small>${all.length}/${starterSlots}</small></div>${slotGrid(all,starterSlots,'normal')}</div>
      <div class="bag-block" id="bag-quest"><div class="bag-heading"><span class="bag-icon quest-icon">✧</span><span>Quest Bag <small>Account Bound</small></span><small>${quest.length}/${questSlots}</small></div>${slotGrid(quest,questSlots,'quest')}</div>
      </div></div>
      `:current==='materials'?`<div class="storage-copy">Deposit All Materials moves materials out of your bags without selling them.</div>${slotGrid(S.materials.filter(x=>x.deposited),20,'materials')}<button class="ingame-button" data-action="deposit">Deposit All Materials</button>`:
      `<div class="storage-copy">Collectible trophies use no backpack slots and cannot be sold.</div>${slotGrid(S.collectibles,20,'collection')}`}
      <div class="inventory-actions"><span>Double-click to use · Right-click for menu</span><button class="ingame-button small" data-action="selected-use" ${selectedId && findItem(selectedId)?'':'disabled'}>${selectedId && findItem(selectedId)?'Use / Read':'Select an item'}</button></div><div class="inventory-bottom"><button data-screen="merchant" title="Visit the merchant">⚖ Merchant</button><span>${coin(S.goldCopper)}</span><button data-screen="trading" title="Buy gems">${img('gem')} ${S.gems}</button></div>`;
  }
  function merchant(){const sellable=S.junk;return `<div class="merchant-header"><div class="merchant-portrait">⚖</div><div><strong>Merchant</strong><small>Always happy to make a deal!</small></div></div><div class="minor-tabs"><button class="${tab==='buyback'?'':'selected'}" data-tab="sell">Sell</button><button class="${tab==='buyback'?'selected':''}" data-tab="buyback">Buyback</button></div>
    <div class="vendor-list">${(tab==='buyback'?S.buyback:sellable).length===0?'<div class="empty-message">Nothing to sell. Open chests to find items.</div>':(tab==='buyback'?S.buyback:sellable).map(item=>`<div class="vendor-item">${itemTile(item,tab==='buyback'?'buyback':'vendor')}<div class="vendor-description"><strong>${h(item.name)}</strong><small>${tab==='buyback'?'Buy back item':'Junk · Sell to merchant'} · ×${item.qty}</small></div><div class="vendor-price">${coin(item.qty*item.unitCopper)}<button class="ingame-button small" data-action="${tab==='buyback'?'buyback':'sell-one'}" data-id="${h(item.id)}">${tab==='buyback'?'Buy':'Sell'}</button></div></div>`).join('')}</div>
    <div class="vendor-bottom"><div>Available: ${coin(S.goldCopper)}</div><button class="ingame-button gold" data-action="sell-all" ${sellable.length?'':'disabled'}>Sell Junk</button></div>`;}
  function trading(){return `<div class="blt-heading">${img('crest')}<div><strong>BLACK LION</strong><small>TRADING COMPANY</small></div><span class="blt-gems">${img('gem')} ${S.gems}</span></div>
      <div class="minor-tabs trading-tabs"><button class="${tab==='store'?'selected':''}" data-tab="store">Gem Store</button><button class="${tab==='exchange'?'selected':''}" data-tab="exchange">Currency Exchange</button><button class="${tab==='redeem'?'selected':''}" data-tab="redeem">Redeem Code</button></div>
      ${tab==='store'?`<div class="store-feature"><div class="store-image">${img('key')}</div><div class="store-content"><small>GEM STORE · FEATURED</small><h2>Black Lion Chest Key</h2><p>Opens one Black Lion Chest. Its contents stay hidden until opened.</p><div class="shop-price">${img('gem')} <strong>${C.economy.keyPriceGems}</strong><span>gems</span></div><button class="ingame-button gold full" data-action="buy-key" ${S.gems>=C.economy.keyPriceGems?'':'disabled'}>Purchase key</button></div></div>`:
      tab==='exchange'?`<div class="exchange-screen"><div class="currency-flourish">${img('gem')}</div><h2>Currency Exchange</h2><p>Exchange coins for gems at the fixed rate below.</p><div class="exchange-rate"><span>1 <b>silver</b></span><strong>➞</strong><span>1 <b>gem</b></span></div><div class="exchange-balance">Available: ${coin(S.goldCopper)} · ≈ ${Math.floor(S.goldCopper/C.economy.copperPerGem)} gems</div><form id="exchangeForm" class="game-form"><label for="exchangeQty">Gems to buy</label><div class="form-row"><input id="exchangeQty" inputmode="numeric" type="number" min="1" step="1" max="${Math.floor(S.goldCopper/C.economy.copperPerGem)}" value="${Math.max(1,Math.floor(S.goldCopper/C.economy.copperPerGem))}"><button class="ingame-button gold" type="submit">Exchange</button></div></form></div>`:
      `<div class="redeem-screen"><div class="redeem-emblem">✥</div><h2>Redeem Code</h2><p>Enter the code from a note you found. Each code can be redeemed once.</p><form id="redeemForm" class="game-form"><label for="promo">Your code</label><input id="promo" type="text" placeholder="ENTER CODE" spellcheck="false" autocomplete="off" required maxlength="64"><button class="ingame-button gold full" type="submit">Redeem</button></form><div class="redeem-help">Find codes on the notes hidden with your gifts.</div></div>`}`;}
  function wallet(){return `<div class="wallet-screen"><div class="wallet-symbol">✥</div><h2>Wallet</h2><div class="wallet-line"><span>${img('gem')} Gems</span><strong>${S.gems}</strong></div><div class="wallet-line"><span>◎ Gold</span><strong>${coin(S.goldCopper)}</strong></div><div class="wallet-line"><span>${img('key')} Black Lion Chest Keys</span><strong>${S.keys}</strong></div><div class="save-controls"><strong>Local Save</strong><p>Your progress is saved in this browser. Export a backup to move it to another device or before clearing browser data.</p><div class="save-buttons"><button class="ingame-button" data-action="export-save">Export Save</button><button class="ingame-button" data-action="import-save">Import Save</button></div><input id="saveFileInput" type="file" accept=".json,application/json" hidden aria-label="Save backup file"></div><button class="ingame-button" data-screen="trading">Open Black Lion Trading Company</button></div>`;}
  function titleFor(name){return {inventory:'Inventory',merchant:'Merchant',trading:'Black Lion Trading Company',wallet:'Wallet'}[name]||'Inventory';}
  function draw(){
    const titles={inventory:'◈',merchant:'⚖',trading:'✦',wallet:'◎'};
    $('#window').dataset.screen=screen;$('#windowTitle').textContent=titleFor(screen);$('#windowSymbol').textContent=titles[screen];$('#windowShortcut').textContent=screen==='inventory'?'[ I ]':screen==='trading'?'[ O ]':'';
    hideFloats();
    $('#windowBody').innerHTML=screen==='inventory'?inventory():screen==='merchant'?merchant():screen==='trading'?trading():wallet();
    $('#window').classList.remove('hidden');
    $$('.dock-button').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.screen===screen));
    $('#topGems').textContent=S.gems;$('#topGold').textContent=E.formatCoins(S.goldCopper);applySearch();applyOfficialArt();
  }
  function $$(sel){return Array.from(document.querySelectorAll(sel));}
  function applySearch(){
    $$('.item-slot[data-name]').forEach(item=>item.classList.toggle('search-dimmed', !!searchQuery&&!item.dataset.name.includes(searchQuery.toLocaleLowerCase())));
  }
  function go(name){selectedId=null;screen=name;if(name==='trading'&&!['store','exchange','redeem'].includes(tab))tab='store';if(name==='merchant'&&!['sell','buyback'].includes(tab))tab='sell';draw();}
  function toast(message, error=false){const id=Date.now()+Math.random();const e=document.createElement('div');e.className='toast'+(error?' error':'');e.textContent=message;e.dataset.id=id;$('#toasts').appendChild(e);setTimeout(()=>e.remove(),4200);}
  function perform(fn){try{const result=fn();S=result.state;E.write(C,localStorage,S);draw();toast(result.message);sound(({redeem:'redeem',buyKey:'purchase',sell:'sell',buyback:'purchase',exchange:'exchange',deposit:'select'})[result.kind]||'select');if(result.rewards)showRewards(result.rewards,result.bonus);else if(result.bonusGranted)showBonusGranted();return result;}catch(ex){sound('error');toast(ex.message,true);return null;}}
  function hideOverlay(){hideFloats(); if(pending?.timer) clearTimeout(pending.timer);$('#overlay').classList.add('hidden');$('#dialogContent').innerHTML=''; pending=null; }
  function showOverlay(markup,cls=''){hideFloats();const dialog=$('#dialogContent');dialog.className='dialog-shell '+cls;dialog.innerHTML=markup;$('#overlay').classList.remove('hidden');applyOfficialArt();}
  function previewChest(){
    // Spoiler-safe preview: never display the next book title, clue or secret chest identity.
    showOverlay(`<div class="chest-preview"><div class="modal-title"><strong>Black Lion Chest  Preview</strong><button data-action="close-modal" aria-label="Close">×</button></div><div class="preview-hero">${img('chest')}<div><strong>Black Lion Chest</strong><p>Each chest contains four items.</p></div></div><div class="preview-grid"><div>${img('book-1')}<strong>Unknown Journal</strong><small>Quest item · guaranteed</small></div><div>${img('junk-seal')}<strong>Merchant Trophy</strong><small>Junk · guaranteed</small></div><div>${img('material-dust')}<strong>Crafting Material</strong><small>Guaranteed</small></div><div>${img('collectible-anchor')}<strong>Mystery Collectible</strong><small>Guaranteed</small></div></div><p class="preview-warning">The journal can be read after you open the chest.</p><button class="ingame-button gold" data-action="close-modal">Close</button></div>`,'preview-dialog');
  }
  function hideFloats(){const tip=$('#itemTooltip'),menu=$('#itemMenu');if(tip)tip.classList.add('hidden');if(menu)menu.classList.add('hidden');}
  function placeFloat(el,x,y,margin=12){
    el.classList.remove('hidden');
    const r=el.getBoundingClientRect();
    const left=Math.max(8,Math.min(x+margin,innerWidth-r.width-8));
    const top=Math.max(8,Math.min(y+margin,innerHeight-r.height-8));
    el.style.left=left+'px';el.style.top=top+'px';
  }
  function showTooltip(item,x,y){
    const t=$('#itemTooltip');if(!t||!item)return;
    t.innerHTML=`<div class="tip-title ${h(letter(item))}">${h(item.name)}</div><div class="tip-rule"></div><div class="tip-type">${h(rarities[letter(item)]||'Item')} · ${h(['chest','bonusChest'].includes(item.type)?'Container':item.type)}</div><p>${h(itemDescription(item))}</p>${item.type==='junk'?`<div class="tip-value">Vendor value: ${coin(item.unitCopper*item.qty)}</div>`:''}${item.type==='book'?'<div class="tip-bound">Account Bound · Not sellable</div>':''}${item.qty>1?`<div class="tip-count">Stack: ${item.qty}</div>`:''}`;
    placeFloat(t,x,y,16);
  }
  function showItemMenu(item,bag,x,y){
    if(!item)return;
    $('#itemTooltip').classList.add('hidden');
    const menu=$('#itemMenu');
    menu.innerHTML=`<div class="context-head">${h(item.name)}</div>`+menuEntries(item,bag).map(([op,label])=>`<button type="button" data-menu-action="${op}" data-menu-id="${h(item.id)}">${h(label)}</button>`).join('');
    placeFloat(menu,x,y,4);
  }
  function selectItem(id){selectedId=id;const old=$('.item-slot.item-selected');if(old)old.classList.remove('item-selected');$$('.item-slot[data-item]').forEach(el=>{const yes=el.dataset.item===id;el.classList.toggle('item-selected',yes);el.setAttribute('aria-pressed',yes?'true':'false');});const b=$('[data-action="selected-use"]');if(b){b.disabled=!id;b.textContent=id?'Use / Read':'Select an item';}}
  function useItem(id){const item=findItem(id);if(!item)return;
    if(item.type==='chest'||item.type==='bonusChest')return chestPrompt();
    if(item.type==='book')return readBook(item);
    return inspectItem(id);
  }
  function contextOperation(op,id){const item=findItem(id);hideFloats();if(!item)return;
    switch(op){
      case 'open':case 'read':return useItem(id);
      case 'preview':return ['chest','bonusChest'].includes(item.type)?previewChest():inspectItem(id);
      case 'inspect':return inspectItem(id);
      case 'deposit':return perform(()=>E.depositOne(C,S,id));
      case 'sell':return perform(()=>E.sellJunk(C,S,id));
      case 'buyback':return perform(()=>E.buyBack(C,S,id));
      case 'merchant':tab='sell';return go('merchant');
    }
  }
  function chestPrompt(){
    const count=C.gifts.length-S.opened+(S.bonusGranted&&!S.bonusOpened?1:0);
    if(count<=0){toast('There are no chests in your inventory.',true);return;}
    // Every chest, including the secret one, has exactly the same closed visual.
    showOverlay(`<div class="chest-modal faithful-chest"><div class="modal-title"><strong>Black Lion Chest</strong><button data-action="close-modal" aria-label="Close">×</button></div>
      <div class="chest-stage">
        <div class="chest-side chest-side-left" aria-label="Chest count">${img('chest')}<span>×${count}</span></div>
        <div class="chest-hero">${img('chest','big-chest')}<span class="chest-keyhole" aria-hidden="true">✦</span></div>
        <div class="chest-side chest-side-right" aria-label="Key count">${img('key')}<span>×${S.keys}</span></div>
      </div>
      <div class="chest-rune">✦　✧　✦</div>
      <div class="reward-placeholder">${Array.from({length:4},(_,i)=>`<span title="Reward ${i+1}"><small>?</small></span>`).join('')}</div>
      <div class="chest-bottom-buttons"><button class="ingame-button gold large" data-action="open-chest" ${S.keys>0?'':'disabled'}>Open</button>${S.keys===0?'<button class="ingame-button" data-action="open-shop">Get a Key</button>':''}</div>
      <small class="chest-footnote">4 rewards · 1 Black Lion Chest Key</small>
      </div>`,'chest-dialog');
  }

  function showRewards(rewards,bonus){
    pending=null;sound(bonus?'bonus':'reveal');
    // The clue book is guaranteed but revealed LAST. All four rewards were
    // already saved before the chest-opening animation started.
    const display=[...rewards.filter(item=>item.type!=='book'),...rewards.filter(item=>item.type==='book')];
    showOverlay(`<div class="reward-modal ${bonus?'reward-legendary':''}"><div class="modal-title"><strong>${bonus?'LEGENDARY REWARD':'Black Lion Chest'}</strong><button data-action="close-modal" aria-label="Close">×</button></div><div class="reward-flare" aria-hidden="true">${bonus?'✦':'❈'}</div>${bonus?'<div class="legendary-sunburst" aria-hidden="true"></div><div class="legendary-kicker">LEGENDARY · THE LAST PAGE</div>':''}<h2>${bonus?'A Legendary Discovery!':'Chest Opened'}</h2><p>4 items received · Select an item to inspect</p><div class="reward-slots" role="group" aria-label="Chest rewards">${display.map((item,index)=>`<button type="button" class="reward-item ${h(item.rarity)} ${item.type==='book'?'reward-clue':''}" style="--reveal-index:${index}" data-inspect-reward="${h(item.id)}" aria-label="${h(item.name)}  ${h(rarities[item.rarity]||item.rarity)}" title="${h(item.name)} · ${h(rarities[item.rarity]||item.rarity)}">${icon(item)}<span class="reward-count">${item.qty>1?'×'+item.qty:''}</span></button>`).join('')}</div><div class="reward-names">${display.map(item=>`<small class="item-text ${h(item.rarity)}">${h(item.name)}</small>`).join('')}</div><div class="reward-actions"><button class="ingame-button gold" data-action="close-modal">Take All</button><button class="ingame-button" data-action="read-new-book">${bonus?'Read Legendary Tome':'Read New Journal'}</button></div></div>`,'rewards-dialog');
  }
  function startChestOpening(){
    // Commit the entire transaction *before* the animation. Refresh, skipping or Escape
    // cannot duplicate a key or lose a book; all changes are persisted atomically.
    let result;
    try {result=E.open(C,S); S=result.state;E.write(C,localStorage,S);draw();}
    catch(error){toast(error.message,true);return;}
    const bonus=result.bonus;
    // An edge-case surprise if the bonus key was bought ahead of time.
    if(result.bonusGranted)toast('A new Black Lion Chest has been added to your inventory.');
    sound(bonus?'legendary':'open');
    if(reducedMotion){showRewards(result.rewards,bonus);return;}
    showOverlay(`<div class="opening-modal ${bonus?'opening-legendary':''}"><div class="modal-title"><strong>Black Lion Chest</strong><button data-action="close-modal" aria-label="Close">×</button></div><div class="opening-stage"><div class="portal-ring"></div><div class="portal-ring portal-ring-outer"></div><div class="portal-stars" aria-hidden="true">✦ ✧ ✦ ✧ ✦</div>${img('chest','opening-chest closed-chest')}${img('chest-open','opening-chest opened-chest')}<div class="opening-particles">✧　✦　✧</div></div><div class="opening-label">${bonus?'A legendary treasure awakens...':'Opening Black Lion Chest...'}</div><button class="ingame-button" data-action="skip-open">Skip animation</button></div>`,'opening-dialog');
    pending={rewards:result.rewards,bonus,timer:setTimeout(()=>showRewards(result.rewards,bonus),bonus?1900:1200)};
  }
  function showBonusGranted(){showOverlay(`<div class="secret-modal"><div class="modal-title"><strong>Inventory</strong><button data-action="close-modal" aria-label="Close">×</button></div><div class="secret-shimmer">✦</div><h2>New Item Acquired</h2><div class="secret-acquired">${img('chest')}<div><strong>Black Lion Chest</strong><span>×1</span></div></div><p>Item added to your inventory.</p><button class="ingame-button gold" data-action="close-modal">Continue</button></div>`);}
  function readBook(item){
    // Only books already acquired can appear in this journal navigator.
    const index=S.books.findIndex(b=>b.id===item.id);
    const previous=index>0?S.books[index-1]:null;
    const next=index>=0&&index<S.books.length-1?S.books[index+1]:null;
    showOverlay(`<div class="book-modal illuminated-book"><div class="modal-title"><strong>${h(item.name)}</strong><button data-action="close-modal" aria-label="Close">×</button></div>
      <div class="book-spread"><div class="book-left-page"><div class="book-front-emblem">❦</div><div class="book-volume">${h(item.rarity==='legendary'?'LEGENDARY TOME':'A TRAVELER’S JOURNAL')}</div><div class="book-illustration">${icon(item)}</div><h3>${h(item.name)}</h3><div class="book-ledger">Account Bound<br>Quest Item</div></div>
      <div class="book-pages"><div class="book-decoration">❧</div><h2>${h(item.subtitle||item.name)}</h2><p>«${h(item.clue)}»</p><div class="book-rule">✥</div><small>Pages from a forgotten journal</small></div></div>
      <div class="book-navigation"><button class="ingame-button small" data-booknav="${previous?h(previous.id):''}" ${previous?'':'disabled'} aria-label="Previous collected journal">← Previous</button><span>${index+1} / ${S.books.length} · Collected journals</span><button class="ingame-button small" data-booknav="${next?h(next.id):''}" ${next?'':'disabled'} aria-label="Next collected journal">Next →</button></div>
      <button class="ingame-button" data-action="close-modal">Close Book</button></div>`,'book-dialog');
  }
  function inspectItem(id){let item;
    if(id==='regular-chest'||id==='bonus-chest') return chestPrompt();
    if(id==='black-lion-key')return showOverlay(`<div class="detail-modal"><div class="modal-title"><strong>Black Lion Chest Key</strong><button data-action="close-modal">×</button></div><div class="detail-icon">${img('key')}</div><p>Opens a Black Lion Chest. Double-click a chest to use it.</p><button data-action="close-modal" class="ingame-button">Close</button></div>`);
    item=[...S.books,...S.junk,...S.materials,...S.collectibles].find(x=>x.id===id);
    if(!item)return;
    if(item.type==='book')return readBook(item);
    showOverlay(`<div class="detail-modal"><div class="modal-title"><strong>${h(item.name)}</strong><button data-action="close-modal">×</button></div><div class="detail-icon ${h(item.rarity)}">${icon(item)}</div><p>${item.type==='junk'?'Junk · This item can be sold to a merchant.':item.type==='material'?'Crafting Material · Can be deposited in Material Storage.':'Collectible · A permanent collectible trophy.'}</p><p>Quantity: ${item.qty}${item.type==='junk'?` · Price: ${E.formatCoins(item.qty*item.unitCopper)}`:''}</p><button data-action="close-modal" class="ingame-button">Close</button></div>`);
  }
  function downloadSave(){
    try{
      const data=JSON.stringify(E.exportSave(C,S),null,2);
      const blob=new Blob([data],{type:'application/json;charset=utf-8'});
      const url=URL.createObjectURL(blob);const link=document.createElement('a');
      link.href=url;link.download='black-lion-quest-save.json';document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1200);toast('Save backup downloaded.');
    }catch(e){toast('Export failed: '+e.message,true);}
  }
  async function restoreSave(file){
    if(!file)return;
    if(file.size>1024*1024){toast('The file is too large to be a quest save.',true);return;}
    try{
      const raw=await file.text();
      // Import never runs before the player explicitly approves replacement.
      if(!window.confirm('Replace your current progress with this save file?'))return;
      S=E.importSave(C,localStorage,raw);
      selectedId=null;hideOverlay();inventoryTab='bags';go('inventory');
      toast('Save restored!');sound('redeem');
    }catch(e){toast('Restore failed: '+e.message,true);}
  }
  document.querySelector('#audioToggle').addEventListener('click',()=>{if(AudioFX)AudioFX.toggle();updateSoundButton();});
  updateSoundButton();
  document.addEventListener('click',e=>{
    // data-screen also labels the window for CSS. Only navigation buttons may
    // switch screens: treating the container as navigation detaches live forms.
    const target=e.target.closest('button[data-screen],[data-action],[data-tab],[data-invtab],[data-item],[data-book],[data-booknav],[data-inspect-reward],[data-jump-bag]');if(!target)return;
    if(target.dataset.screen){go(target.dataset.screen);return;}
    if(target.dataset.tab){tab=target.dataset.tab;draw();return;}
    if(target.dataset.invtab){inventoryTab=target.dataset.invtab;draw();return;}
    if(target.dataset.book){const found=S.books.find(x=>x.id===target.dataset.book);if(found)readBook(found);return;}
    if(target.dataset.booknav){const found=S.books.find(x=>x.id===target.dataset.booknav);if(found)readBook(found);return;}
    if(target.dataset.inspectReward){const found=S.lastRewards.find(x=>x.id===target.dataset.inspectReward);if(found)inspectItem(found.id);return;}
    if(target.dataset.jumpBag){const el=$('#bag-'+target.dataset.jumpBag);if(el)el.scrollIntoView({block:'nearest',behavior:reducedMotion?'auto':'smooth'});return;}
    if(target.dataset.item){if(suppressContextClick){suppressContextClick=false;return;}selectItem(target.dataset.item);hideFloats();return;}
    const action=target.dataset.action;
    switch(action){
      case 'buy-key':perform(()=>E.buyKey(C,S));break;
      case 'sell-all':perform(()=>E.sellJunk(C,S));break;
      case 'sell-one':perform(()=>E.sellJunk(C,S,target.dataset.id));break;
      case 'buyback':perform(()=>E.buyBack(C,S,target.dataset.id));break;
      case 'deposit':perform(()=>E.deposit(C,S));break;
      case 'compact':toast('Your items are already compacted automatically.');break;
      case 'export-save':downloadSave();break;
      case 'import-save':$('#saveFileInput')?.click();break;
      case 'selected-use':if(selectedId)useItem(selectedId);break;
      case 'read-new-book':{const found=[...S.lastRewards].reverse().find(x=>x.type==='book');if(found)readBook(found);break;}
      case 'open-chest':startChestOpening();break;
      case 'skip-open':if(pending){const r=pending;clearTimeout(r.timer);showRewards(r.rewards,r.bonus);}break;
      case 'close-modal':hideOverlay();break;
      case 'open-shop':hideOverlay();tab='store';go('trading');break;
    }
  });
  document.addEventListener('dblclick',e=>{
    const t=e.target.closest('.item-slot[data-item]');if(t){e.preventDefault();useItem(t.dataset.item);}
  });
  document.addEventListener('contextmenu',e=>{
    const t=e.target.closest('.item-slot[data-item]');if(!t)return;
    e.preventDefault();selectItem(t.dataset.item);showItemMenu(findItem(t.dataset.item),t.dataset.bag,e.clientX,e.clientY);
  });
  document.addEventListener('mouseover',e=>{
    const t=e.target.closest('.item-slot[data-item]');if(t && $('#itemMenu').classList.contains('hidden'))showTooltip(findItem(t.dataset.item),e.clientX,e.clientY);
  });
  document.addEventListener('mousemove',e=>{
    const t=e.target.closest('.item-slot[data-item]');if(t && !$('#itemTooltip').classList.contains('hidden') && $('#itemMenu').classList.contains('hidden'))placeFloat($('#itemTooltip'),e.clientX,e.clientY,16);
  });
  document.addEventListener('focusin',e=>{
    const t=e.target.closest('.item-slot[data-item]');
    if(t){const r=t.getBoundingClientRect();showTooltip(findItem(t.dataset.item),r.left+r.width/2,r.top);}
  });
  document.addEventListener('focusout',e=>{
    if(e.target.closest('.item-slot[data-item]')) $('#itemTooltip').classList.add('hidden');
  });
  document.addEventListener('mouseout',e=>{
    const t=e.target.closest('.item-slot[data-item]');if(t && !t.contains(e.relatedTarget))$('#itemTooltip').classList.add('hidden');
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-menu-action]');
    if(b){contextOperation(b.dataset.menuAction,b.dataset.menuId);return;}
    if(!e.target.closest('#itemMenu') && !e.target.closest('[data-item]'))hideFloats();
  });
  // Touch devices: press and hold an item for the same context menu as right click.
  document.addEventListener('pointerdown',e=>{
    const t=e.target.closest('.item-slot[data-item]');if(!t || e.pointerType==='mouse')return;
    const x=e.clientX,y=e.clientY;
    clearTimeout(pressTimer);
    pressTimer=setTimeout(()=>{suppressContextClick=true;selectItem(t.dataset.item);showItemMenu(findItem(t.dataset.item),t.dataset.bag,x,y);},550);
  });
  for(const eventName of ['pointerup','pointercancel','pointermove'])document.addEventListener(eventName,()=>clearTimeout(pressTimer));
  document.addEventListener('change',e=>{if(e.target.id==='saveFileInput'){const file=e.target.files?.[0];restoreSave(file);e.target.value='';}});
  document.addEventListener('input',e=>{if(e.target.id==='inventorySearch'){searchQuery=e.target.value;applySearch();}});
  document.addEventListener('submit',e=>{
    if(e.target.id==='redeemForm'){e.preventDefault();const code=e.target.querySelector('input').value;const result=perform(()=>E.redeem(C,S,code));if(result)e.target.reset();}
    if(e.target.id==='exchangeForm'){e.preventDefault();const v=e.target.querySelector('input').value;perform(()=>E.exchange(C,S,v));}
  });
  const gameTitle=$('#window .window-titlebar');
  gameTitle.addEventListener('pointerdown',e=>{
    if(e.button!==0 || e.pointerType==='touch' || e.target.closest('button'))return;
    const r=$('#window').getBoundingClientRect();
    dragState={startX:e.clientX,startY:e.clientY,baseX:windowOffset.x,baseY:windowOffset.y,left:r.left,top:r.top,right:r.right,bottom:r.bottom};
    gameTitle.setPointerCapture(e.pointerId);
  });
  gameTitle.addEventListener('pointermove',e=>{
    if(!dragState)return;
    const dx=e.clientX-dragState.startX,dy=e.clientY-dragState.startY;
    // Keep at least 100px of the titlebar visible on narrow desktop screens.
    windowOffset.x=Math.round(Math.min(innerWidth-120-dragState.left+dragState.baseX,Math.max(-dragState.right+120+dragState.baseX,dragState.baseX+dx)));
    windowOffset.y=Math.round(Math.min(innerHeight-100-dragState.top+dragState.baseY,Math.max(-dragState.top+dragState.baseY+10,dragState.baseY+dy)));
    $('#window').style.transform=`translate(${windowOffset.x}px, ${windowOffset.y}px)`;
  });
  for(const eventName of ['pointerup','pointercancel','lostpointercapture'])gameTitle.addEventListener(eventName,()=>{dragState=null;});
  $('#windowClose').addEventListener('click' ,()=>$('#window').classList.add('hidden'));
  $('#overlay').addEventListener('click',e=>{if(e.target===$('#overlay'))hideOverlay();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(!$('#itemMenu').classList.contains('hidden'))hideFloats();else if(!$('#overlay').classList.contains('hidden'))hideOverlay();else $('#window').classList.add('hidden');return;}
    if((e.key==='Enter'||e.key===' ') && e.target.matches('.item-slot[data-item]')){e.preventDefault();useItem(e.target.dataset.item);return;}
    if(e.target.closest('input,textarea'))return;
    if(!$('#overlay').classList.contains('hidden') && $('.book-modal')) {
      const dir=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0;
      if(dir){const el=$(`.book-navigation button[data-booknav]:${dir===-1?'first-child':'last-child'}`);if(el && !el.disabled){e.preventDefault();const found=S.books.find(x=>x.id===el.dataset.booknav);if(found)readBook(found);}return;}
    }
    if(e.key.toLowerCase()==='m'){e.preventDefault();if(AudioFX)AudioFX.toggle();updateSoundButton();return;}
    if(e.key.toLowerCase()==='i'){e.preventDefault();go('inventory');}
    if(e.key.toLowerCase()==='o'){e.preventDefault();tab='store';go('trading');}
  });
  draw();
  loadOfficialArt();
})();
