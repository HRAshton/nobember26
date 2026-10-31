#!/usr/bin/env node
'use strict';
/*
  Organizer-only printable HTML. This file is NOT generated during the site build.
  Default output is OUTSIDE the web project directory so it is less likely to
  be uploaded with the public site. Never publish this print sheet online.
*/
const fs=require('node:fs');
const path=require('node:path');
const {validate,load}=require('./validate-config.cjs');
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function htmlFor(c){
 const main=c.codes.filter(x=>!x.final);
 const secret=c.codes.find(x=>x.final);
 const cards=main.map((item,i)=>({
   caption:i===0?'СТАРТ КВЕСТА':`ПОСЛЕ ПОДАРКА №${i}`,
   description:i===0?'Передать игроку перед первым сундуком.':`Положить вместе с настоящим подарком №${i}, чтобы игрок мог открыть следующий сундук.`,
   code:item.code,gems:item.gems,secret:false
 }));
 cards.push({caption:'СЕКРЕТНЫЙ КОД',description:'Спрячьте отдельно. Должен быть найден ближе к финалу.',code:secret.code,gems:secret.gems,secret:true});
 return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Black Lion — Organizer Code Cards (PRIVATE)</title><style>
@page{size:A4;margin:11mm}*{box-sizing:border-box}body{margin:0;background:#edeae2;color:#2b2925;font-family:Georgia,serif}.intro{max-width:920px;margin:20px auto 14px;padding:12px 19px;border-left:5px solid #a77935;background:#fff}.intro h1{margin:0 0 5px;font-size:25px}.intro p{margin:0;font:13px/1.6 Arial,sans-serif}.sheet{max-width:920px;margin:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;padding:8px 12px 24px}.card{break-inside:avoid;page-break-inside:avoid;min-height:204px;display:flex;flex-direction:column;justify-content:space-between;padding:18px;border:5px double #b78e4a;background:linear-gradient(130deg,#423a31,#1e2526 75%);color:#ebd7aa;box-shadow:0 5px 8px #0002;position:relative;overflow:hidden}.card:before{content:'✦';font-size:105px;color:#d1b76d0d;position:absolute;right:9px;top:-32px}.card.secret{border-color:#b88bca;background:linear-gradient(125deg,#3b3041,#1e212b)}.brand{font-size:11px;letter-spacing:4px;color:#c3ab76}.card h2{font-size:17px;font-weight:400;font-variant:small-caps;margin:8px 0 3px}.code{font-family:Arial,sans-serif;font-size:21px;font-weight:bold;letter-spacing:2px;color:#fff3cf;overflow-wrap:anywhere}.gems{font:12px Arial,sans-serif;color:#d7bdf1}.cut-note{font:11px/1.4 Arial,sans-serif;color:#a6a098;margin-top:10px}.footer{margin:0 12px;font:10px/1.4 Arial,sans-serif;color:#7b6652}@media print{body{background:#fff}.intro{margin:0 0 10px;background:#fff;box-shadow:none}.sheet{padding:0}.card{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-shadow:none}.footer{display:none}}@media(max-width:640px){.sheet{grid-template-columns:1fr}.card{min-height:180px}}
</style></head><body><div class="intro"><h1>Black Lion Quest · карточки кодов</h1><p><strong>ТОЛЬКО ДЛЯ ОРГАНИЗАТОРА.</strong> Печатайте и вырезайте карточки. Этот файл содержит все коды, включая секретный; не добавляйте его в публичные файлы сайта.</p></div><main class="sheet">${cards.map(card=>`<section class="card ${card.secret?'secret':''}"><div><div class="brand">BLACK LION · QUEST</div><h2>${h(card.caption)}</h2></div><div><div class="code">${h(card.code)}</div><div class="gems">✧ ${h(card.gems)} Gems</div><div class="cut-note">${h(card.description)}</div></div></section>`).join('')}</main><p class="footer">Неофициальный некоммерческий фан-квест. Все награды и кристаллы виртуальные.</p></body></html>`;
}
function generate(configFile,outputFile){
 const c=load(configFile);const result=validate(c);
 if(result.errors.length)throw new Error('Сначала исправьте ошибки конфига:\n'+result.errors.join('\n'));
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
 try{generate(config,output);console.log('Карточки сохранены: '+output+'\nНе публикуйте этот файл вместе с сайтом.');}
 catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={htmlFor,generate};
