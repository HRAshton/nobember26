const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const E = require('../engine.js');
const {load} = require('../scripts/validate-config.cjs');
const previous = load(path.join(__dirname, 'fixtures/personal-two-secret-config.js'));
const current = load(path.join(__dirname, '../config.js'));

test('quotation revision preserves progress and refreshes acquired books only once', () => {
  let state = E.initial(previous);
  for (const code of previous.codes.filter(entry => !entry.final)) {
    state = E.redeem(previous, state, code.code).state;
    state = E.buyKey(previous, state).state;
    state = E.open(previous, state).state;
  }
  state = E.sellJunk(previous, state).state;
  state = E.exchange(previous, state, 90).state;
  for (const code of previous.codes.filter(entry => entry.final)) {
    state = E.redeem(previous, state, code.code).state;
    state = E.buyKey(previous, state).state;
    state = E.open(previous, state).state;
  }
  let saved = JSON.stringify(state);
  const storage = {getItem: () => saved, setItem: (_, value) => {saved = value;}};
  const upgraded = E.read(current, storage);
  assert.equal(upgraded.books.length, 7);
  assert.deepEqual(upgraded.books.map(book => book.clue), [...current.gifts, ...current.bonus].map(entry => entry.clue));
  for (const field of ['gems', 'goldCopper', 'keys', 'opened', 'usedCodes', 'bonusOpenedIds', 'bonusOpened', 'bonusGranted']) {
    assert.deepEqual(upgraded[field], state[field]);
  }
  assert.equal(upgraded.lastRewards.find(item => item.type === 'book').clue, current.bonus[1].clue);
  assert.deepEqual(E.read(current, storage), upgraded);
  const previousQuotations={...upgraded,fingerprint:'t47zv8',contentFingerprint:'3hxg46'};
  previousQuotations.books=previousQuotations.books.map(book=>({...book,clue:'Previous quotation'}));
  saved=JSON.stringify(previousQuotations);
  assert.deepEqual(E.read(current,storage),upgraded);
  previousQuotations.fingerprint='1smb5pj';
  previousQuotations.contentFingerprint='wtz1zx';
  saved=JSON.stringify(previousQuotations);
  assert.deepEqual(E.read(current,storage),upgraded);
});
