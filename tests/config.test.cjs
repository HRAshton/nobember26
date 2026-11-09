const test=require('node:test');const assert=require('node:assert/strict');
const {validate,load}=require('../scripts/validate-config.cjs');
const config=load(require('node:path').join(__dirname,'../config.js'));
const copy=x=>JSON.parse(JSON.stringify(x));
test('personal quest config validates with no economy violations',()=>{assert.deepEqual(validate(config).errors,[]);});

test('personal codes match the five regular clues and two ordered secret clues',()=>{
 const main=config.codes.filter(code=>!code.final);
 assert.deepEqual(main.map(code=>code.code),['gem','goblet','scruffy','gold','silk']);
 assert.ok(main.every(code=>code.gems===config.economy.keyPriceGems));
 assert.deepEqual(config.codes.filter(code=>code.final).map(code=>({code:code.code,gems:code.gems})),[{code:'choya',gems:10},{code:'prophecies',gems:100}]);
 assert.deepEqual([...config.gifts.map(gift=>gift.clue),...config.bonus.map(stage=>stage.clue)],[
  'Первый след ищи внизу. Я лежу на земле и терпеливо жду, когда ты опустишь взгляд.',
  'Здесь чашки ждут горячего чая, а тарелки ждут нового застолья. Среди них спрятался твой следующий подарок.',
  'Рядом с маленьким окном в большой мир нашлось место и для меня. Ищи возле планшета.',
  'Надо мной рождаются слова и начинаются приключения. Приподними клавиатуру. Следующая находка ждёт под ней.',
  'Здесь дорожные одежды отдыхают между странствиями. Осмотри стойку, на которой они ждут своего часа.',
  'Не всякая мелодия слышна ушами. Иногда её можно узнать по аромату. Загляни под рояль, там тебя ждёт следующая находка.',
  'Шесть находок уже стали частью твоей истории. Последняя ждёт среди чужих, там, где книги стоят плечом к плечу.'
 ]);
});
test('wrong final code reward cannot unlock the bonus key',()=>{const c=copy(config);c.codes.find(x=>x.final).gems=9;assert.match(validate(c).errors.join(';'),/bonus key/);});
test('extra main code is rejected to prevent bonus key farm',()=>{const c=copy(config);c.codes.push({code:'UNEXPECTED',gems:100});assert.match(validate(c).errors.join(';'),/main codes/);});
test('codes are case-insensitively unique',()=>{const c=copy(config);c.codes[1].code=c.codes[0].code.toLowerCase();assert.match(validate(c).errors.join(';'),/Duplicate code/);});
test('missing clue or duplicated gift IDs are rejected',()=>{const c=copy(config);c.gifts[1].id=c.gifts[0].id;c.gifts[2].clue='';const result=validate(c);assert.match(result.errors.join(';'),/Duplicate gift ID/);assert.match(result.errors.join(';'),/clue/);});
test('scalable N gift configuration is valid with codes matched to N',()=>{const c=copy(config);const extra={...c.gifts[0],id:'gift-'+(c.gifts.length+1)};c.gifts.push(extra);c.codes.splice(3,0,{code:'GIFT-THREE',gems:100});assert.equal(validate(c).errors.length,0);});
