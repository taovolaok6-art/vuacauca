import 'dotenv/config';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { ControlEvent, TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const PORT = Number(process.env.PORT || 8787);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};

const server = http.createServer(async (req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/health') { res.writeHead(200,{'content-type':'application/json'}); return res.end('{"ok":true}'); }
    let target = path.resolve(distDir, '.' + pathname);
    if (!target.startsWith(distDir)) { res.writeHead(403); return res.end('Forbidden'); }
    try { if (!(await stat(target)).isFile()) target = path.join(distDir,'index.html'); }
    catch { target = path.join(distDir,'index.html'); }
    const body = await readFile(target);
    res.writeHead(200, {'content-type':mime[path.extname(target)] || 'application/octet-stream','cache-control':'no-cache'});
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found. Run npm run build before starting the server.'); }
});
const wss = new WebSocketServer({server});
const clients = new Set();
const activePlayers = new Map();

function broadcast(payload){
 const data=JSON.stringify(payload);
 for(const client of clients){if(client.readyState===1)client.send(data);}
}
wss.on('connection',socket=>{
 clients.add(socket);
 socket.on('message',data=>{ if(data.toString()==='ping' && socket.readyState===1) socket.send('pong'); });
 socket.on('close',()=>clients.delete(socket));
 socket.send(JSON.stringify({type:'server_status',status:'connected'}));
});
function getIdentity(user){
 const id=user?.id ?? user?.displayId;
 if(id===undefined || id===null) return null;
 return String(id);
}

let connection;
async function startTikTok(){
 const username=process.env.TIKTOK_USERNAME?.trim().replace(/^@/,'');
 if(!username){console.log('TikTok bridge idle: set TIKTOK_USERNAME in Render Environment to enable LIVE events.');return;}
 connection=new TikTokLiveConnection(username);
 connection.on(ControlEvent.ERROR,({info,exception})=>console.error('[TikTok]',info,exception));
 connection.on(WebcastEvent.CHAT,event=>{
   const user=event.user;
   const userId=getIdentity(user);
   if(!userId) return;
   const content=(event.content||'').trim().toLocaleUpperCase('vi-VN');
   const nickname=user.nickname||user.displayId||'Người câu';
   if(content==='CÂU CÁ' || content==='CAU CA'){
     if(activePlayers.has(userId)) return;
     const player={userId,nickname};
     activePlayers.set(userId,player);
     broadcast({type:'player_join',...player});
     console.log('Player joined:',nickname,userId);
   } else if(content==='RỜI GAME' || content==='ROI GAME'){
     if(!activePlayers.has(userId)) return;
     activePlayers.delete(userId);
     broadcast({type:'player_leave',userId});
     console.log('Player left:',nickname,userId);
   }
 });
 connection.on(WebcastEvent.GIFT,event=>{
   const user=event.user;
   const nickname=user?.nickname||user?.displayId||'Người xem';
   if(event.giftDetails?.giftType===1 && event.repeatEnd!==true) return;
   broadcast({type:'gift',nickname,giftName:event.giftDetails?.giftName||String(event.giftId||'quà'),giftId:event.giftId});
 });
 try{const state=await connection.connect();console.log('Connected to TikTok LIVE room:',state.roomId);}
 catch(err){console.error('TikTok connection failed:',err?.message||err);}
}
server.listen(PORT,'0.0.0.0',()=>{console.log(`Game + WebSocket listening on :${PORT}`);void startTikTok();});
process.once('SIGINT',async()=>{if(connection)await connection.disconnect();server.close(()=>process.exit(0));});