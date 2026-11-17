import * as THREE from 'three';
import './style.css';

const host = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc7c5);
scene.fog = new THREE.Fog(0x9bc7c5, 28, 105);

const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, .1, 180);
camera.position.set(0, 5.8, 10.5);

const renderer = new THREE.WebGLRenderer({antialias:false, alpha:false, powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd7f7f4, 0x264c43, 2.0));
const sun = new THREE.DirectionalLight(0xffe3bd, 2.0);
sun.position.set(-12,18,8); scene.add(sun);

// Ground and distant forest ring
const ground = new THREE.Mesh(new THREE.CircleGeometry(58,64), new THREE.MeshStandardMaterial({color:0x315c43,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.position.y=-.5; scene.add(ground);
const lake = new THREE.Mesh(new THREE.CircleGeometry(23,96), new THREE.MeshPhysicalMaterial({color:0x176b78,roughness:.25,metalness:.12,clearcoat:.65,clearcoatRoughness:.25}));
lake.rotation.x=-Math.PI/2; lake.position.y=-.08; lake.scale.set(1,.72,1); scene.add(lake);
const shore = new THREE.Mesh(new THREE.RingGeometry(22.6,25.2,96),new THREE.MeshStandardMaterial({color:0x8a9a68,roughness:1}));
shore.rotation.x=-Math.PI/2; shore.position.y=-.12; shore.scale.set(1,.72,1); scene.add(shore);

const trunkMat=new THREE.MeshStandardMaterial({color:0x594633});
const leafMats=[0x245b49,0x36765a,0x4b8661].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
for(let i=0;i<64;i++){
  const a=i/64*Math.PI*2, r=27+Math.random()*12, x=Math.cos(a)*r,z=Math.sin(a)*r;
  const h=2.8+Math.random()*3.5;
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,h*.45,5),trunkMat);trunk.position.set(x,h*.22,z);scene.add(trunk);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(1.4+Math.random(),h*.55,6),leafMats[i%3]);crown.position.set(x,h*.68,z);scene.add(crown);
}

// Pebbled bank
for(let i=0;i<45;i++){
 const a=Math.random()*Math.PI*2,r=22.8+Math.random()*3.3;
 const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.18+Math.random()*.32,0),new THREE.MeshStandardMaterial({color:0x71816b,roughness:1}));
 rock.position.set(Math.cos(a)*r,-.12,Math.sin(a)*r*.72);rock.scale.y=.45;scene.add(rock);
}

// Main fisher avatar: stylized low-poly human, third-person camera
const avatar=new THREE.Group(); scene.add(avatar);
const skin=new THREE.MeshStandardMaterial({color:0xc98e68,roughness:.9});
const robe=new THREE.MeshStandardMaterial({color:0xd6a65e,roughness:1});
const dark=new THREE.MeshStandardMaterial({color:0x253d3c,roughness:1});
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.78,3,7),robe);body.position.y=1.05;avatar.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.27,10,8),skin);head.position.y=1.72;avatar.add(head);
const hat=new THREE.Mesh(new THREE.ConeGeometry(.55,.2,8),dark);hat.rotation.x=Math.PI;hat.position.y=1.98;avatar.add(hat);
for(const x of [-.17,.17]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.55,6),dark);leg.position.set(x,.28,0);avatar.add(leg);}
const rod=new THREE.Mesh(new THREE.CylinderGeometry(.025,.045,3.6,5),new THREE.MeshStandardMaterial({color:0x563c24}));
rod.position.set(.5,2.3,-.55);rod.rotation.z=-.5;rod.rotation.x=-.18;avatar.add(rod);
avatar.position.set(0,0,24.5);avatar.rotation.y=Math.PI;

const fishMat=new THREE.MeshStandardMaterial({color:0xe4a34e,metalness:.15,roughness:.35});
const fishGroup=new THREE.Group();scene.add(fishGroup);
const fish=[];
for(let i=0;i<10;i++){
 const g=new THREE.Group();
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(.48,12,8),i%4===0?new THREE.MeshStandardMaterial({color:0x5ee4d3,metalness:.35,roughness:.2,emissive:0x073b3b}):fishMat);
 mesh.scale.set(1.7,.55,.65);g.add(mesh);
 const tail=new THREE.Mesh(new THREE.ConeGeometry(.34,.55,5),mesh.material);tail.position.x=-.95;tail.rotation.z=Math.PI/2;g.add(tail);
 const a=i/10*Math.PI*2,r=7+Math.random()*12;
 g.position.set(Math.cos(a)*r,-.45,Math.sin(a)*r*.72);g.rotation.y=-a+Math.PI/2;fishGroup.add(g);
 fish.push({g,a,r,s:.35+Math.random()*.35,phase:Math.random()*6});
}

// Player nameplates represented by lightweight ground markers; no fake users.
const livePlayers=new Map();
function makePlayer(p){
 if(livePlayers.has(p.userId)) return;
 const marker=new THREE.Group();
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.035,5,24),new THREE.MeshBasicMaterial({color:0x7fffe0}));
 ring.rotation.x=Math.PI/2; marker.add(ring);
 const pin=new THREE.Mesh(new THREE.ConeGeometry(.12,.42,6),new THREE.MeshBasicMaterial({color:0xe8ffff}));
 pin.position.y=.42;marker.add(pin);
 const angle=(livePlayers.size/12)*Math.PI*2;
 marker.position.set(Math.cos(angle)*21,0,Math.sin(angle)*15);
 scene.add(marker);livePlayers.set(p.userId,{marker,name:p.nickname});
}
function removePlayer(id){const p=livePlayers.get(id);if(!p)return;scene.remove(p.marker);livePlayers.delete(id);}
function announce(s){const n=document.querySelector('#notice');n.textContent=s;n.classList.add('show');clearTimeout(announce.t);announce.t=setTimeout(()=>n.classList.remove('show'),2600);}
function giftEffect(event){
 const mat=new THREE.MeshBasicMaterial({color:0x8effe2,transparent:true,opacity:.9});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.08,8,48),mat);ring.rotation.x=Math.PI/2;ring.position.set(0,.15,0);scene.add(ring);
 const start=performance.now();
 function pulse(t){const k=Math.min(1,(t-start)/1100);ring.scale.setScalar(1+k*9);mat.opacity=1-k;if(k<1)requestAnimationFrame(pulse);else{scene.remove(ring);ring.geometry.dispose();mat.dispose();}}
 requestAnimationFrame(pulse);
 announce(`✨ ${event.nickname||'Người xem'} tặng ${event.giftName||'quà'} · Linh ngư xuất hiện!`);
}
window.addEventListener('game-event',e=>{
 const d=e.detail;
 if(d.type==='player_join'){makePlayer(d);document.querySelector('#player-count').textContent=livePlayers.size;announce(`${d.nickname} đã xuống hồ!`);}
 if(d.type==='player_leave'){removePlayer(d.userId);document.querySelector('#player-count').textContent=livePlayers.size;}
 if(d.type==='gift')giftEffect(d);
});

// WebSocket bridge. No local fake users: only server events create viewers.
let ws;
let wsHeartbeat;
function connect(){
 const protocol=location.protocol==='https:'?'wss':'ws';
 const wsUrl = import.meta.env.DEV
   ? `${protocol}://${location.hostname}:8787`
   : `${protocol}://${location.host}`;
 ws=new WebSocket(wsUrl);
 ws.onopen=()=>{
   document.querySelector('#connection-label').textContent='Đã nối máy chủ';
   document.querySelector('#connection-dot').style.background='#61e8a6';
   clearInterval(wsHeartbeat);
   wsHeartbeat=setInterval(()=>{if(ws?.readyState===WebSocket.OPEN)ws.send('ping');},30000);
 };
 ws.onmessage=(m)=>{try{window.dispatchEvent(new CustomEvent('game-event',{detail:JSON.parse(m.data)}));}catch{}};
 ws.onclose=()=>{document.querySelector('#connection-label').textContent='Mất kết nối · đang thử lại';document.querySelector('#connection-dot').style.background='#d6a34b';setTimeout(connect,2500);};
 ws.onerror=()=>ws.close();
}
connect();

let cast=false;
document.querySelector('#cast').addEventListener('click',()=>{cast=!cast;document.querySelector('#cast').textContent=cast?'THU CẦN':'THẢ CÂU';announce(cast?'Đã thả câu. Chờ cá cắn…':'Đã thu cần câu.');});
let low=true;
document.querySelector('#quality').addEventListener('click',()=>{low=!low;renderer.setPixelRatio(Math.min(devicePixelRatio||1,low?1.25:1.5));document.querySelector('#quality').textContent=`ĐỒ HỌA: ${low?'TỐI ƯU':'CAO'}`;});

let last=performance.now(),frames=0,fpsTime=last;
function animate(t){
 const dt=Math.min(.05,(t-last)/1000);last=t;frames++;
 if(t-fpsTime>1000){document.querySelector('#fps').textContent=Math.round(frames*1000/(t-fpsTime));frames=0;fpsTime=t;}
 fish.forEach(f=>{f.a+=dt*f.s*.15;f.g.position.x=Math.cos(f.a)*f.r;f.g.position.z=Math.sin(f.a)*f.r*.72;f.g.rotation.y=-f.a+Math.PI/2;f.g.position.y=-.43+Math.sin(t*.001+f.phase)*.08;});
 // Smooth follow camera, looking over the fisher's shoulder toward the lake
 const desired=new THREE.Vector3(avatar.position.x,5.4,avatar.position.z+9.8);
 camera.position.lerp(desired,.035);camera.lookAt(0,1.1,5);
 renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));}
addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden)renderer.setAnimationLoop(null);else renderer.setAnimationLoop(animate);});
