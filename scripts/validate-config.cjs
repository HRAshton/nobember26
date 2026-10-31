#!/usr/bin/env node
'use strict';
/* Run: npm run validate. Intentionally strict so the gift economy cannot be broken accidentally. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function validate(c){
 const errors=[],warnings=[];
 const fail=message=>errors.push(message);
 const warn=message=>warnings.push(message);
 if(!c||typeof c!=='object')return {errors:['Config must be an object'],warnings};
 const e=c.economy||{}, gifts=Array.isArray(c.gifts)?c.gifts:[], codes=Array.isArray(c.codes)?c.codes:[];
 if(!gifts.length)fail('Need at least one gift');
 if(gifts.length>90)warn('More than 90 gifts: some junk will be worth under 1 silver');
 if(!Number.isInteger(e.keyPriceGems)||e.keyPriceGems<=0)fail('economy.keyPriceGems must be a positive integer');
 if(!Number.isInteger(e.copperPerGem)||e.copperPerGem<=0)fail('economy.copperPerGem must be a positive integer');
 if(!Number.isInteger(e.junkTotalCopper)||e.junkTotalCopper<0)fail('economy.junkTotalCopper must be a nonnegative integer');
 const seenGifts=new Set();
 const fields=['bookTitle','subtitle','clue','junkName','material','collectible'];
 gifts.forEach((gift,i)=>{
  if(!gift||typeof gift!=='object'){fail(`gifts[${i}] must be an object`);return;}
  if(typeof gift.id!=='string'||!(/^[a-z0-9-]+$/).test(gift.id))fail(`gifts[${i}].id needs lowercase letters, digits and dashes`);
  else if(seenGifts.has(gift.id))fail(`Duplicate gift ID: ${gift.id}`);else seenGifts.add(gift.id);
  fields.forEach(field=>{if(typeof gift[field]!=='string'||!gift[field].trim())fail(`gifts[${i}].${field} is required`);});
 });
 if(!c.bonus||typeof c.bonus.clue!=='string'||!c.bonus.clue.trim()||typeof c.bonus.title!=='string'||!c.bonus.title.trim())fail('bonus.title and bonus.clue are required');
 const seenCodes=new Set();let main=0,final=0,mainGems=0,finalGems=0;
 codes.forEach((entry,i)=>{
  if(!entry||typeof entry!=='object'){fail(`codes[${i}] must be an object`);return;}
  const code=String(entry.code||'').trim().toUpperCase();
  if(!code||!/^[A-Z0-9_-]+$/.test(code))fail(`codes[${i}].code must be nonempty, letters/numbers/_/- only`);
  if(seenCodes.has(code))fail(`Duplicate code: ${code}`);seenCodes.add(code);
  if(!Number.isInteger(entry.gems)||entry.gems<=0)fail(`codes[${i}].gems must be positive integer`);
  if(entry.final){final++;finalGems+=entry.gems||0;}else{main++;mainGems+=entry.gems||0;}
 });
 if(main!==gifts.length)fail(`Need ${gifts.length} main codes (one for each gift), found ${main}`);
 if(final!==1)fail(`Need exactly one final code, found ${final}`);
 if(Number.isInteger(e.keyPriceGems) && mainGems!==gifts.length*e.keyPriceGems)fail('All main codes combined must pay for exactly one key per gift');
 if(Number.isInteger(e.copperPerGem) && Number.isInteger(e.junkTotalCopper) && Number.isInteger(e.keyPriceGems)){
  if(e.junkTotalCopper % e.copperPerGem !== 0)warn('Total junk does not convert to an exact integer of gems');
  if(e.junkTotalCopper + finalGems*e.copperPerGem!==e.keyPriceGems*e.copperPerGem)fail('Total junk value + final code must buy exactly one bonus key');
  if(e.junkTotalCopper>=e.keyPriceGems*e.copperPerGem)fail('Junk alone must NOT be enough for an extra key');
  if(finalGems>=e.keyPriceGems)fail('Final code alone must NOT be enough for an extra key');
 }
 return {errors,warnings};
}
function load(file){const ctx={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file,timeout:1000});return JSON.parse(JSON.stringify(ctx.window.QUEST_CONFIG));}
if(require.main===module){
 const file=path.resolve(process.argv[2]||path.join(__dirname,'..','config.js'));
 try{
  const result=validate(load(file));
  for(const x of result.errors)console.error('ERROR:',x);
  for(const x of result.warnings)console.warn('WARNING:',x);
  if(result.errors.length){console.error(`Invalid config (${result.errors.length} errors).`);process.exitCode=1;}
  else console.log('Config valid. Economy has exactly one extra key after the secret code.');
 }catch(error){console.error('Cannot validate config:',error.message);process.exitCode=1;}
}
module.exports={validate,load};
