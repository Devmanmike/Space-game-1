const canvas=document.getElementById("c");
const ctx=canvas.getContext("2d");

function resize(){
  canvas.width=innerWidth;
  canvas.height=innerHeight;
}
resize();

addEventListener("resize",resize);

/* =========================
PLAYER
========================= */

const player={
  x:0,
  y:0,
  speed:4
};

const keys={};

addEventListener("keydown",e=>{
  keys[e.key.toLowerCase()]=true;
});

addEventListener("keyup",e=>{
  keys[e.key.toLowerCase()]=false;
});

/* =========================
ROOMS
========================= */

const rooms=[
  {
    x:-300,
    y:-200,
    w:600,
    h:400,
    name:"Bridge"
  },

  {
    x:-250,
    y:250,
    w:500,
    h:300,
    name:"Engineering"
  },

  {
    x:400,
    y:-150,
    w:350,
    h:350,
    name:"Crew"
  }
];

/* =========================
EXIT
========================= */

function exitInterior(){

  window.location.href=
    "Index.html";
}

window.exitInterior=
exitInterior;

/* =========================
FLOOR
========================= */

function drawFloor(){

  const grid=80;

  ctx.strokeStyle="#1a1a1a";

  for(let x=-2000;x<2000;x+=grid){

    ctx.beginPath();

    ctx.moveTo(
      x-player.x+
      canvas.width/2,
      0
    );

    ctx.lineTo(
      x-player.x+
      canvas.width/2,
      canvas.height
    );

    ctx.stroke();
  }

  for(let y=-2000;y<2000;y+=grid){

    ctx.beginPath();

    ctx.moveTo(
      0,
      y-player.y+
      canvas.height/2
    );

    ctx.lineTo(
      canvas.width,
      y-player.y+
      canvas.height/2
    );

    ctx.stroke();
  }
}

/* =========================
LOOP
========================= */

function loop(){

  requestAnimationFrame(loop);

  ctx.fillStyle="#080808";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /* movement */

  if(keys["w"]) player.y-=player.speed;
  if(keys["s"]) player.y+=player.speed;
  if(keys["a"]) player.x-=player.speed;
  if(keys["d"]) player.x+=player.speed;

  drawFloor();

  /* rooms */

  for(let r of rooms){

    const sx=
      r.x-player.x+
      canvas.width/2;

    const sy=
      r.y-player.y+
      canvas.height/2;

    ctx.fillStyle="#222";

    ctx.fillRect(
      sx,
      sy,
      r.w,
      r.h
    );

    ctx.strokeStyle="#555";

    ctx.strokeRect(
      sx,
      sy,
      r.w,
      r.h
    );

    ctx.fillStyle="white";

    ctx.font="20px Arial";

    ctx.fillText(
      r.name,
      sx+20,
      sy+30
    );
  }

  /* player */

  ctx.fillStyle="cyan";

  ctx.beginPath();

  ctx.arc(
    canvas.width/2,
    canvas.height/2,
    12,
    0,
    Math.PI*2
  );

  ctx.fill();
}

loop();
