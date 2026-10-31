const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const port=Number(process.env.PORT||3000);
const server=http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent((req.url||'/').split('?')[0]); }
  catch { res.writeHead(400);res.end('Bad request');return; }
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  const hidden=path.relative(root,target).split(path.sep).some(part=>part.startsWith('.'));
  if (hidden||!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(target).pipe(res);
}).listen(port,()=>console.log(`GW2 Quest: http://localhost:${server.address().port}`));
