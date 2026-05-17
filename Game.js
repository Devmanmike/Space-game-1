const canvas=document.getElementById("c");
const ctx=canvas.getContext("2d");

const map=document.getElementById("map");
const mctx=map.getContext("2d");

function resize(){
  canvas.width=innerWidth;
  canvas.height=innerHeight;
}
resize();
addEventListener("resize",resize);

map.width=170;
map.height=170;

/* =========================
SHIP
========================= */

const shipImg=new Image();
shipImg.src="https://raw.githubusercontent.com/Devmanmike/Space-game-1/refs/heads/main/Polish_20260516_231834569.png";

let playerAngle=0;

/* =========================
WORLD STATE
========================= */

const player={x:0,y:0};
let resources=120;

let boost=false;
let landed=false;
let landedPlanet=null;

/* =========================
PLANETS / BLACK HOLES
========================= */

const planets=[
  {x:1200,y:500,r:180,color:"#2d79ff",name:"Terra"},
  {x:-1500,y:-900,r:220,color:"#88ddff",name:"Ice"},
  {x:2200,y:-1700,r:160,color:"#d69d45",name:"Desert"}
];

const blackholes=[];
for(let i=0;i<2;i++){
  blackholes.push({
    x:(Math.random()-0.5)*7000,
    y:(Math.random()-0.5)*7000,
    r:100+Math.random()*50
  });
}

/* =========================
ASTEROIDS / CHUNKS
========================= */

const chunkSize=1000;
const chunks=new Map();

function chunkKey(x,y){return x+","+y;}

function generateChunk(cx,cy){
  const key=chunkKey(cx,cy);
  if(chunks.has(key)) return chunks.get(key);

  const asteroids=[];
  for(let i=0;i<8;i++){
    asteroids.push({
      x:cx*chunkSize+Math.random()*chunkSize,
      y:cy*chunkSize+Math.random()*chunkSize,
      r:18+Math.random()*50,
      hp:100,
      maxHp:100,
      vx:(Math.random()-0.5)*0.3,
      vy:(Math.random()-0.5)*0.3,
      splitLevel:0
    });
  }

  chunks.set(key,asteroids);
  return asteroids;
}

function getAsteroids(){
  const cx=Math.floor(player.x/chunkSize);
  const cy=Math.floor(player.y/chunkSize);

  let result=[];
  for(let yy=-1;yy<=1;yy++){
    for(let xx=-1;xx<=1;xx++){
      result.push(...generateChunk(cx+xx,cy+yy));
    }
  }
  return result;
}

/* =========================
BUILDINGS / DRONES
========================= */

const buildings=[];
const drones=[];

function buildExtractor(){
  if(resources<15) return;
  resources-=15;
  buildings.push({type:"extractor",x:player.x,y:player.y});
}

function buildDrone(){
  if(resources<25) return;
  resources-=25;
  drones.push({x:player.x,y:player.y});
}

/* =========================
INPUT (JOYSTICKS)
========================= */

let move={active:false,x:0,y:0};
let aim={active:false,holding:false,x:0,y:0};

const mBase=document.getElementById("joyMoveBase");
const aBase=document.getElementById("joyAimBase");
const mStick=document.getElementById("moveStick");
const aStick=document.getElementById("aimStick");

function joyMove(e){
  if(!move.active) return;
  const r=mBase.getBoundingClientRect();
  const cx=r.left+65, cy=r.top+65;

  const px=e.touches?e.touches[0].clientX:e.clientX;
  const py=e.touches?e.touches[0].clientY:e.clientY;

  let x=px-cx, y=py-cy;
  let len=Math.hypot(x,y);

  if(len>45){x=x/len*45;y=y/len*45;}

  move.x=x/45;
  move.y=y/45;

  mStick.style.transform=`translate(${x}px,${y}px)`;
}

function resetMove(){
  move.active=false;
  move.x=0;move.y=0;
  mStick.style.transform="translate(0,0)";
}

function joyAim(e){
  if(!aim.active) return;

  const r=aBase.getBoundingClientRect();
  const cx=r.left+65, cy=r.top+65;

  const px=e.touches?e.touches[0].clientX:e.clientX;
  const py=e.touches?e.touches[0].clientY:e.clientY;

  let x=px-cx,y=py-cy;
  let len=Math.hypot(x,y);

  if(len>45){x=x/len*45;y=y/len*45;}

  aim.x=x/45;
  aim.y=y/45;

  aStick.style.transform=`translate(${x}px,${y}px)`;
}

function resetAim(){
  aim.active=false;
  aim.holding=false;
  aim.x=0;aim.y=0;
  aStick.style.transform="translate(0,0)";
}

/* events */
mBase.onmousedown=()=>move.active=true;
mBase.ontouchstart=()=>move.active=true;
mBase.onmousemove=joyMove;
mBase.ontouchmove=joyMove;
mBase.onmouseup=resetMove;
mBase.ontouchend=resetMove;

aBase.onmousedown=()=>{aim.active=true;aim.holding=true;}
aBase.ontouchstart=()=>{aim.active=true;aim.holding=true;}
aBase.onmousemove=joyAim;
aBase.ontouchmove=joyAim;
aBase.onmouseup=resetAim;
aBase.ontouchend=resetAim;

/* =========================
UTILS
========================= */

function screen(x,y){
  return {
    x:(x-player.x)+canvas.width/2,
    y:(y-player.y)+canvas.height/2
  };
}

function distLine(px,py,x1,y1,x2,y2){
  let A=px-x1,B=py-y1,C=x2-x1,D=y2-y1;
  let dot=A*C+B*D;
  let len=C*C+D*D;
  let t=Math.max(0,Math.min(1,dot/len));
  let xx=x1+t*C, yy=y1+t*D;
  return Math.hypot(px-xx,py-yy);
}

/* =========================
LANDING
========================= */

function nearbyPlanet(){
  for(let p of planets){
    const d=Math.hypot(p.x-player.x,p.y-player.y);
    if(d<p.r+80) return p;
  }
  return null;
}

function toggleLanding(){
  if(!landed){
    const p=nearbyPlanet();
    if(!p) return;
    landed=true;
    landedPlanet=p;
    player.x=0;player.y=0;
    document.getElementById("landBtn").innerText="Takeoff";
  }else{
    landed=false;
    landedPlanet=null;
    document.getElementById("landBtn").innerText="Land";
  }
}

/* =========================
OTHER FEATURES
========================= */

function toggleBoost(){boost=!boost;}

function toggleFullscreen(){
  if(!document.fullscreenElement)
    document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

/* =========================
GAME LOOP (same logic)
========================= */

function loop(){
  requestAnimationFrame(loop);

  ctx.fillStyle=landed?"#102010":"#050510";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  player.x+=move.x*(boost?6:3);
  player.y+=move.y*(boost?6:3);

  const asteroids=getAsteroids();

  for(let a of asteroids){
    a.x+=a.vx||0;
    a.y+=a.vy||0;

    const s=screen(a.x,a.y);

    ctx.fillStyle="#777";
    ctx.beginPath();
    ctx.arc(s.x,s.y,a.r,0,Math.PI*2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(canvas.width/2,canvas.height/2);
  ctx.rotate(playerAngle);

  if(shipImg.complete){
    ctx.drawImage(shipImg,-32,-32,64,64);
  }
  ctx.restore();

  document.getElementById("res").innerText=Math.floor(resources);
}

loop();
