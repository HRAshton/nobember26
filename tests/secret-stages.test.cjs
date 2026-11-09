const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const E = require('../engine.js');
const {load, validate} = require('../scripts/validate-config.cjs');
const {htmlFor} = require('../scripts/print-code-cards.cjs');
const config = load(path.join(__dirname, '../config.js'));
const previousConfig = load(path.join(__dirname, 'fixtures/personal-single-secret-config.js'));

function store() {
  const values = new Map();
  return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};
}

function mainQuest(c, state = E.initial(c)) {
  for (const code of c.codes.filter(entry => !entry.final)) {
    state = E.redeem(c, state, code.code).state;
    state = E.buyKey(c, state).state;
    state = E.open(c, state).state;
  }
  return state;
}

function exchangeJunk(c, state) {
  state = E.sellJunk(c, state).state;
  return E.exchange(c, state, 90).state;
}

function perfumeChest() {
  let state = exchangeJunk(config, mainQuest(config));
  state = E.redeem(config, state, ' ChOyA ').state;
  state = E.buyKey(config, state).state;
  return E.open(config, state);
}

test('choya funds the perfume chest and prophecies separately funds the final book', () => {
  assert.deepEqual(validate(config).errors, []);
  const perfume = perfumeChest();
  let state = perfume.state;
  assert.equal(perfume.rewards.length, 4);
  assert.equal(perfume.legendary, false);
  assert.equal(state.books.at(-1).id, 'book-perfume');
  assert.equal(state.books.at(-1).clue, config.bonus[0].clue);
  assert.deepEqual(state.bonusOpenedIds, ['perfume']);
  assert.equal(state.bonusGranted, false);
  assert.equal(state.bonusOpened, false);
  assert.equal(state.gems, 0);
  assert.equal(state.keys, 0);
  assert.throws(() => E.redeem(config, state, 'choya'), /already been redeemed/);
  assert.throws(() => E.buyKey(config, state), /Not enough/);
  state = E.redeem(config, state, 'prophecies').state;
  assert.equal(state.gems, 100);
  state = E.buyKey(config, state).state;
  assert.equal(state.bonusGranted, true);
  const final = E.open(config, state);
  state = final.state;
  assert.equal(final.legendary, true);
  assert.equal(final.rewards.length, 4);
  assert.equal(state.books.length, 7);
  assert.equal(state.books.at(-1).id, 'legendary-book');
  assert.equal(state.books.at(-1).clue, config.bonus[1].clue);
  assert.deepEqual(state.bonusOpenedIds, ['perfume', 'legendary']);
  assert.equal(state.bonusOpened, true);
  assert.equal(state.keys, 0);
  assert.equal(state.gems, 0);
  assert.equal(state.goldCopper, 0);
  assert.throws(() => E.open(config, state), /required|no chests/);
});

test('a pre-purchased key and an early book code cannot skip the perfume stage', () => {
  let state = E.redeem(config, E.initial(config), 'prophecies').state;
  state = mainQuest(config, state);
  state = E.buyKey(config, state).state;
  assert.equal(state.bonusGranted, false);
  assert.throws(() => E.open(config, state), /no chests/);
  const redeemed = E.redeem(config, state, 'choya');
  state = redeemed.state;
  assert.equal(redeemed.bonusGranted, true);
  state = E.open(config, state).state;
  assert.equal(state.books.at(-1).id, 'book-perfume');
  state = exchangeJunk(config, state);
  state = E.buyKey(config, state).state;
  state = E.open(config, state).state;
  assert.equal(state.bonusOpened, true);
  assert.equal(state.books.at(-1).id, 'legendary-book');
});

test('partial secret progress survives reload and invalid stage lists cannot replace a save', () => {
  const state = perfumeChest().state;
  const storage = store();
  E.write(config, storage, state);
  assert.deepEqual(E.read(config, storage), state);
  const backup = E.exportSave(config, state);
  assert.deepEqual(E.importSave(config, storage, backup), state);
  const before = storage.getItem(config.storageKey);
  for (const stageList of [['perfume', 'perfume'], ['unknown'], 'perfume']) {
    const invalid = structuredClone(backup);
    invalid.state.bonusOpenedIds = stageList;
    assert.throws(() => E.importSave(config, storage, invalid), /secret chests/);
    assert.equal(storage.getItem(config.storageKey), before);
  }
});

test('existing personal progress maps the former ten-gem code to choya without losing items', () => {
  let old = E.redeem(previousConfig, E.initial(previousConfig), 'prophecies').state;
  old = mainQuest(previousConfig, old);
  delete old.bonusOpenedIds;
  const storage = store();
  E.write(previousConfig, storage, old);
  const state = E.read(config, storage);
  for (const field of ['opened', 'gems', 'goldCopper', 'keys']) assert.equal(state[field], old[field]);
  assert.equal(state.books.length, old.books.length);
  assert.ok(state.usedCodes.includes('CHOYA'));
  assert.ok(!state.usedCodes.includes('PROPHECIES'));
  assert.equal(E.redeem(config, state, 'prophecies').state.gems, old.gems + 100);
  assert.deepEqual(E.importSave(config, storage, E.exportSave(previousConfig, old)), state);
});

test('a completed previous finale keeps its book and receives one key for the added perfume chest', () => {
  let old = exchangeJunk(previousConfig, mainQuest(previousConfig));
  old = E.redeem(previousConfig, old, 'prophecies').state;
  old = E.buyKey(previousConfig, old).state;
  old = E.open(previousConfig, old).state;
  delete old.bonusOpenedIds;
  const storage = store();
  E.write(previousConfig, storage, old);
  let state = E.read(config, storage);
  assert.equal(state.keys, old.keys + 1);
  assert.equal(state.books.length, 6);
  assert.deepEqual(state.bonusOpenedIds, ['legendary']);
  assert.equal(state.bonusOpened, false);
  assert.equal(state.bonusGranted, true);
  assert.deepEqual(E.importSave(config, storage, E.exportSave(previousConfig, old)), state);
  assert.deepEqual(E.read(config, storage), state, 'the upgrade grants its key only once');
  state = E.open(config, state).state;
  assert.equal(state.books.length, 7);
  assert.equal(state.books.at(-2).id, 'book-perfume');
  assert.equal(state.books.at(-1).id, 'legendary-book');
  assert.equal(state.bonusOpened, true);
  assert.equal(state.keys, 0);
  assert.throws(() => E.redeem(config, state, 'prophecies'), /already been redeemed/);
});

test('code cards and configuration validation cover both ordered secret stages', () => {
  const cards = htmlFor(config);
  assert.equal((cards.match(/class="card /g) || []).length, 7);
  assert.equal((cards.match(/class="card secret"/g) || []).length, 2);
  assert.ok(cards.indexOf('choya') < cards.indexOf('prophecies'));
  const duplicate = structuredClone(config);
  duplicate.bonus[1].code = duplicate.bonus[0].code;
  assert.match(validate(duplicate).errors.join(' '), /own secret code/);
  const wrongPrice = structuredClone(config);
  wrongPrice.codes.find(code => code.code === 'prophecies').gems = 10;
  assert.match(validate(wrongPrice).errors.join(' '), /bonus key/);
});
