// ===================== 펫: 화면을 자유롭게 돌아다니기 (시메지 방식) =====================
// 무한의 계단 스테이지(scene.stairs)에서는 캐릭터 뒤를 따라다니고, 그 외 모든 화면에서는
// 화면 테두리를 타고 오르고, 천장을 기고, 떨어지고, 펫마다 고유 동작을 한다. 클릭은 막지 않는다.
const PS = 34;            // 화면에서 펫 크기
const PET_ACT = { chick: '콕콕', ham: '데굴데굴', bun: '깡총', cat: '쿨쿨', dog: '멍!', peng: '슝~', fox: '폴짝!', dragon: '훨훨' };
let WALK = [];
function petsSync() {
  if (WALK.length !== ECO.pets.length || WALK.some((w, i) => w.kind !== ECO.pets[i].kind)) {
    WALK = ECO.pets.map((p, i) => (WALK[i] && WALK[i].kind === p.kind) ? WALK[i] : { kind: p.kind, x: 120 + Math.random() * (W - 240), y: -PS - i * 30, vx: 0, vy: 0, surf: 'air', st: 'fall', tm: 0, dir: Math.random() < 0.5 ? -1 : 1, spin: 0, say: '', sayT: 0 });
  }
  WALK.forEach((w, i) => w.name = ECO.pets[i].name);
}
function petPick(w) { // 바닥에서 다음 행동 고르기
  const r = Math.random();
  if (r < 0.38) { w.st = 'walk'; w.tm = 2 + Math.random() * 4; if (Math.random() < 0.4) w.dir = -w.dir; }
  else if (r < 0.55) { w.st = 'sit'; w.tm = 1.5 + Math.random() * 2.5; }
  else if (r < 0.72) { w.st = 'act'; w.tm = w.kind === 'cat' ? 4 : 1.6; w.say = PET_ACT[w.kind]; w.sayT = 1.4; if (w.kind === 'bun' || w.kind === 'fox') { w.surf = 'air'; w.st = 'fall'; w.vy = -420; w.vx = w.dir * (w.kind === 'fox' ? 260 : 120); } if (w.kind === 'dragon') { w.st = 'fly'; w.surf = 'air'; w.tm = 4 + Math.random() * 3; } }
  else if (r < 0.9) { w.st = 'walk'; w.tm = 9; w.wantWall = true; }            // 벽까지 가서 오르기
  else { w.surf = 'air'; w.st = 'fall'; w.vy = -300; w.vx = w.dir * 90; }       // 점프
}
function petsUpdate(dt) {
  petsSync();
  const G = 1100, top = 0, bot = H - PS, lft = 0, rgt = W - PS;
  WALK.forEach(w => {
    w.tm -= dt; if (w.sayT > 0) w.sayT -= dt;
    if (w.surf === 'air') {
      if (w.st === 'fly') { // 아기 용: 하늘을 날아다님
        w.x += w.dir * 90 * dt; w.y += Math.sin(performance.now() / 300) * 40 * dt - (w.y - 140) * 0.6 * dt;
        if (w.x < lft || w.x > rgt) { w.dir = -w.dir; w.x = Math.max(lft, Math.min(rgt, w.x)); }
        if (w.tm <= 0) { w.st = 'fall'; w.vy = 0; w.vx = w.dir * 40; }
        return;
      }
      w.vy += G * dt; w.x += w.vx * dt; w.y += w.vy * dt;
      if (w.x <= lft || w.x >= rgt) { w.x = Math.max(lft, Math.min(rgt, w.x)); if (Math.random() < 0.6 && w.y > 40 && w.y < bot - 20) { w.surf = w.x <= lft ? 'left' : 'right'; w.st = 'climb'; w.tm = 2 + Math.random() * 4; w.vx = w.vy = 0; } else w.vx = -w.vx * 0.5; }
      if (w.y < top) { w.y = top; w.vy = 0; }
      if (w.y >= bot) { w.y = bot; w.vy = 0; w.vx = 0; w.surf = 'floor'; w.st = 'sit'; w.tm = 0.5 + Math.random(); w.spin = 0; }
      if (w.kind === 'ham' && w.st === 'fall') w.spin += dt * 10;
      return;
    }
    if (w.surf === 'floor') {
      if (w.st === 'walk' || (w.st === 'act' && (w.kind === 'peng' || w.kind === 'ham'))) {
        const sp = w.st === 'act' ? (w.kind === 'peng' ? 260 : 180) : 46 + (w.kind === 'dog' ? 20 : 0);
        w.x += w.dir * sp * dt; if (w.kind === 'ham' && w.st === 'act') w.spin += w.dir * dt * 12;
        if (w.x <= lft || w.x >= rgt) { w.x = Math.max(lft, Math.min(rgt, w.x));
          if (w.wantWall || Math.random() < 0.35) { w.surf = w.x <= lft ? 'left' : 'right'; w.st = 'climb'; w.tm = 3 + Math.random() * 6; w.wantWall = false; } else w.dir = -w.dir; }
      }
      if (w.tm <= 0) { w.wantWall = false; w.spin = 0; petPick(w); }
      return;
    }
    if (w.surf === 'left' || w.surf === 'right') { // 벽 타기
      if (w.st === 'climb') { w.y -= 52 * dt; if (Math.random() < dt * 0.4) { w.st = 'hang'; w.tm = 0.8 + Math.random() * 1.5; } }
      else if (w.st === 'hang' && w.tm <= 0) w.st = 'climb';
      if (w.y <= top) { w.y = top; w.surf = 'ceil'; w.st = 'crawl'; w.tm = 2 + Math.random() * 5; w.dir = w.x <= lft ? 1 : -1; }
      else if (w.tm <= 0 && w.st === 'climb' && Math.random() < 0.5) { w.surf = 'air'; w.st = 'fall'; w.vx = (w.x <= lft ? 1 : -1) * 120; w.vy = -60; w.dir = w.x <= lft ? 1 : -1; }
      else if (w.tm <= 0) w.tm = 1 + Math.random() * 3;
      return;
    }
    if (w.surf === 'ceil') { // 천장 기기
      w.x += w.dir * 40 * dt;
      if (w.x <= lft || w.x >= rgt) { w.x = Math.max(lft, Math.min(rgt, w.x)); w.dir = -w.dir; }
      if (w.tm <= 0) { w.surf = 'air'; w.st = 'fall'; w.vx = 0; w.vy = 0; w.say = '으앗!'; w.sayT = 1; }
    }
  });
}
function petsDraw() {
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  const now = performance.now() / 1000;
  WALK.forEach((w, i) => {
    const moving = w.st === 'walk' || w.st === 'climb' || w.st === 'crawl' || w.st === 'fly' || (w.st === 'act' && w.kind !== 'cat');
    const f = moving ? ((now * 8 + i) | 0) % 2 : 0;
    let rot = 0, flip = w.dir < 0;
    if (w.surf === 'left') { rot = Math.PI / 2; flip = true; }      // 발이 왼쪽 벽, 머리는 위
    if (w.surf === 'right') { rot = -Math.PI / 2; flip = false; }   // 발이 오른쪽 벽, 머리는 위
    if (w.surf === 'ceil') { rot = Math.PI; flip = w.dir > 0; }     // 거꾸로 매달림
    let bob = 0, sy = 1;
    if (w.st === 'act' && w.kind === 'chick') bob = Math.abs(Math.sin(now * 14)) * 4;
    if (w.st === 'act' && w.kind === 'dog') rot += Math.sin(now * 30) * 0.08;
    if (w.st === 'sit') sy = 0.92;
    if (w.st === 'act' && w.kind === 'cat') sy = 0.8;
    const cx = w.x + PS / 2, cy = w.y + PS / 2;
    ctx.save(); ctx.translate(cx, cy + bob); ctx.rotate(rot + w.spin); ctx.scale(flip ? -1 : 1, sy);
    if (w.st === 'sit' || (w.st === 'act' && w.kind === 'cat')) ctx.translate(0, PS * (1 - sy) / 2 / sy);
    ctx.drawImage(petImg(w.kind, f), -PS / 2, -PS / 2, PS, PS); ctx.restore();
    if (w.st === 'fly' && ((now * 3 | 0) % 2)) { ctx.fillStyle = 'rgba(255,140,40,.8)'; ctx.fillRect(w.x + (w.dir > 0 ? PS : -8), w.y + 10, 8, 6); }
    const hov = Math.abs(mouse.x - cx) < PS / 2 && Math.abs(mouse.y - cy) < PS / 2;
    const tx = Math.max(30, Math.min(W - 30, cx)), ty = w.surf === 'ceil' ? w.y + PS + 16 : Math.max(14, w.y - 8);
    if (w.st === 'act' && w.kind === 'cat' && w.surf === 'floor') T('z'.repeat(1 + ((now * 2) | 0) % 3), w.x + PS, w.y - 4, 16, '#cfe', 'left');
    if (w.sayT > 0) T(w.say, tx, ty, 16, '#fff', 'center', FONT_UI, '#000');
    else if (hov) T('♥ ' + w.name, tx, ty, 15, '#ffd0e0', 'center', FONT_UI, '#000');
    else if (w.surf === 'floor') T(w.name, tx, ty, 13, '#fff', 'center', FONT_UI, '#000');
  });
  ctx.imageSmoothingEnabled = sm;
}
// 무한의 계단: 펫이 캐릭터가 지나온 계단을 따라 뒤에서 쫓아옴 (저해상도 캔버스 L에 그림)
const FOLLOW = [];
function petsFollow(c, steps, idx, ox, oy, SW, SH, dt, t) {
  ECO.pets.forEach((p, k) => {
    const j = Math.max(0, idx - 1 - k), tx = ox + steps[j] * SW - 6, ty = oy - j * SH - 12;
    const f = FOLLOW[k] || (FOLLOW[k] = { x: tx, y: ty, d: 1 });
    if (Math.abs(f.x - tx) > 80 || Math.abs(f.y - ty) > 80) { f.x = tx; f.y = ty; }
    const nx = f.x + (tx - f.x) * Math.min(1, dt * 9); if (Math.abs(nx - f.x) > 0.05) f.d = nx > f.x ? 1 : -1;
    f.x = nx; f.y += (ty - f.y) * Math.min(1, dt * 9);
    const hop = Math.abs(tx - f.x) + Math.abs(ty - f.y) > 1 ? Math.abs(Math.sin(t * 12 + k)) * 2 : 0;
    spr(c, petImg(p.kind, hop > 1 ? 1 : 0), f.x, f.y - hop, f.d < 0, 0.75);
  });
}
