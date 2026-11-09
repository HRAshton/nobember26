#!/usr/bin/env node
'use strict';
/*
  Printable gift code cards, generated separately from the game.
*/
const fs=require('node:fs');
const path=require('node:path');
const {validate,load}=require('./validate-config.cjs');
const {bonusStages}=require('../engine.js');
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function htmlFor(c){
 const main=c.codes.filter(x=>!x.final);
 const cards=main.map((item,i)=>({
   caption:i===0?'QUEST START':`AFTER GIFT #${i}`,
   description:i===0?'Give this to the player before the first chest.':`Place with physical gift #${i} so the player can open the next chest.`,
   code:item.code,gems:item.gems,secret:false
 }));
 bonusStages(c).forEach((stage,index)=>{
  const secret=c.codes.find(entry=>entry.final && entry.code.toUpperCase()===stage.code.toUpperCase());
  cards.push({caption:'SECRET CODE '+(index+1),description:index===0?'Hide separately, to be found near the end.':'Place with the previous secret gift.',code:secret.code,gems:secret.gems,secret:true});
 });
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Black Lion Code Cards</title><style>
@page{size:A4;margin:11mm}*{box-sizing:border-box}body{margin:0;background:#edeae2;color:#2b2925;font-family:Georgia,serif}.intro{max-width:920px;margin:20px auto 14px;padding:12px 19px;border-left:5px solid #a77935;background:#fff}.intro h1{margin:0 0 5px;font-size:25px}.intro p{margin:0;font:13px/1.6 Arial,sans-serif}.sheet{max-width:920px;margin:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;padding:8px 12px 24px}.card{break-inside:avoid;page-break-inside:avoid;min-height:204px;display:flex;flex-direction:column;justify-content:space-between;padding:18px;border:5px double #b78e4a;background:linear-gradient(130deg,#423a31,#1e2526 75%);color:#ebd7aa;box-shadow:0 5px 8px #0002;position:relative;overflow:hidden}.card:before{content:'✦';font-size:105px;color:#d1b76d0d;position:absolute;right:9px;top:-32px}.card.secret{border-color:#b88bca;background:linear-gradient(125deg,#3b3041,#1e212b)}.brand{font-size:11px;letter-spacing:4px;color:#c3ab76}.card h2{font-size:17px;font-weight:400;font-variant:small-caps;margin:8px 0 3px}.code{font-family:Arial,sans-serif;font-size:21px;font-weight:bold;letter-spacing:2px;color:#fff3cf;overflow-wrap:anywhere}.gems{font:12px Arial,sans-serif;color:#d7bdf1}.cut-note{font:11px/1.4 Arial,sans-serif;color:#a6a098;margin-top:10px}.footer{margin:0 12px;font:10px/1.4 Arial,sans-serif;color:#7b6652}@media print{body{background:#fff}.intro{margin:0 0 10px;background:#fff;box-shadow:none}.sheet{padding:0}.card{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-shadow:none}.footer{display:none}}@media(max-width:640px){.sheet{grid-template-columns:1fr}.card{min-height:180px}}
</style></head><body><div class="intro"><h1>Black Lion Quest · code cards</h1><p>Print and cut out the cards, then place them with the gifts in the order shown.</p></div><main class="sheet">${cards.map(card=>`<section class="card ${card.secret?'secret':''}"><div><div class="brand">BLACK LION · QUEST</div><h2>${h(card.caption)}</h2></div><div><div class="code">${h(card.code)}</div><div class="gems">✧ ${h(card.gems)} Gems</div><div class="cut-note">${h(card.description)}</div></div></section>`).join('')}</main></body></html>`;
}
function generate(configFile,outputFile){
 const c=load(configFile);const result=validate(c);
 if(result.errors.length)throw new Error('Fix the configuration errors first:\n'+result.errors.join('\n'));
 const rendered=htmlFor(c);
 fs.mkdirSync(path.dirname(outputFile),{recursive:true});
 fs.writeFileSync(outputFile,rendered,'utf8');
 return outputFile;
}
if(require.main===module){
 const root=path.join(__dirname,'..');
 const config=path.resolve(root,'config.js');
 // Default output is a sibling of the project, not a public web document.
 const output=path.resolve(process.argv[2]||path.join(root,'..','black-lion-PRIVATE-code-cards.html'));
 try{generate(config,output);console.log('Cards saved: '+output+'\nPrint and cut out the cards.');}
 catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={htmlFor,generate};
