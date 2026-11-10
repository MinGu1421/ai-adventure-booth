// ===================== 경찰과 AI · 3 스테이지 (3D 미로 정원, AI 1인칭) =====================
function topiary(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function bgGarden(c, t, st) {
  sky(c, '05081a', '1a1f3a');
  for (let i = 0; i < 40; i++) R(c, (i * 89) % LW, (i * 31) % 120, 1, 1, i % 3 ? '#fff6' : '#fff');
  R(c, 390, 24, 20, 20, '#e8e8c8'); R(c, 386, 28, 4, 12, '#e8e8c8'); R(c, 394, 22, 12, 2, '#e8e8c8');
  aptRow(c, 150, 1.4, '#0e1226', true, 57, null, null, 0.88);
  // 높게 솟은 나무 실루엣
  for (let i = 0; i < 12; i++) { const x = i * 42 - 10, h = 90 + (i * 37 % 40); R(c, x + 14, 190 - h, 6, h, '#0a0f14'); c.fillStyle = '#0c1a14'; c.beginPath(); c.moveTo(x, 200 - h * 0.5); c.lineTo(x + 17, 120 - h); c.lineTo(x + 34, 200 - h * 0.5); c.fill(); }
  // 미로 정원 생울타리
  R(c, 0, 150, LW, 50, '#0f2a1a'); for (let x = 0; x < LW; x += 6) R(c, x, 148 + (x * 7 % 5), 6, 4, '#143320');
  R(c, 0, 196, LW, 80, '#0c140e');
  // 동그란 조형수
  topiary(c, 240, 165, 26, '#1f4a2a'); topiary(c, 232, 158, 10, '#2a5a34'); R(c, 236, 188, 8, 12, '#3a2a1a');
  // AI
  if (st.fall != null) {
    const k = t - st.fall; let ay;
    if (k < 0.8) ay = -30 + k * k * 300; else ay = 128 + (k < 1.1 ? -Math.sin((k - 0.8) / 0.3 * Math.PI) * 6 : 0);
    let ax = 232; if (st.down != null) { const d = clamp((t - st.down) / 0.6, 0, 1); ax = 232 + d * 40; ay = lerp(128, 176, d) - Math.sin(d * Math.PI) * 14; }
    if (st.enter != null) { const d = clamp((t - st.enter) / 1.5, 0, 1); ax = 272 + d * 160; ay = 176; }
    spr(c, SPR.ai[st.enter != null ? (t * 8 | 0) % 2 : 0], ax, ay);
    if (st.light) { c.fillStyle = 'rgba(255,250,200,.25)'; c.beginPath(); c.moveTo(ax + 14, ay + 6); c.lineTo(ax + 120, ay - 20); c.lineTo(ax + 120, ay + 40); c.fill(); }
  }
  if (st.steps) { const k = (t * 2 | 0) % 2; c.fillStyle = '#ff5a5a'; c.font = 'bold 9px sans-serif'; c.fillText(k ? '저벅' : '   저벅', 30, 120); }
}
function PoliceStage3Intro() {
  return Cutscene([
    { n: '', t: 'AI는 케이블카에서 뛰어내린 후, 길을 잃어 어두컴컴한 정원의 동그란 조형수 위에 떨어졌다.', bg: bgGarden, fx: st => st.fall = st.t || 0.001 },
    { n: '', t: '조형수 위에 떨어진 덕분에 충격이 어느 정도 완화되어서, AI는 멀쩡했다.' },
    { n: '', t: 'AI는 조형수에서 내려왔다. 주변에는 높게 솟은 나무들이 늘어서 있는 실루엣이 보였다.', fx: st => st.down = st.t },
    { n: 'AI', p: 'ai', t: '여기는... 미로 정원이잖아?' },
    { n: '', t: '저벅... 저벅... 뒤에서 경찰의 발소리가 점점 가까워지고 있다.', fx: st => st.steps = 1 },
    { n: 'AI', p: 'ai', t: '손전등 기능, 켜기! 미로 안으로 들어가자!', fx: st => { st.light = 1; st.enter = st.t; } },
  ], () => PoliceStage3());
}

// ---------- 미로 생성 (막다른 길 없음) ----------
function makeMaze(cw, ch, rand) {
  rand = rand || Math.random;
  const TW = cw * 2 + 1, TH = ch * 2 + 1, m = [];
  for (let y = 0; y < TH; y++) m.push(new Array(TW).fill(1));
  const vis = new Set(), st = [[0, 0]]; vis.add('0,0'); m[1][1] = 0;
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (st.length) {
    const [x, y] = st[st.length - 1];
    const nb = D.map(([dx, dy]) => [x + dx, y + dy, dx, dy]).filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cw && ny < ch && !vis.has(nx + ',' + ny));
    if (!nb.length) { st.pop(); continue; }
    const [nx, ny, dx, dy] = nb[Math.floor(rand() * nb.length)];
    m[y * 2 + 1 + dy][x * 2 + 1 + dx] = 0; m[ny * 2 + 1][nx * 2 + 1] = 0; vis.add(nx + ',' + ny); st.push([nx, ny]);
  }
  return { m, TW, TH, D };
}
function braid(mz, rand) {
  const { m, TW, TH, D } = mz; rand = rand || Math.random;
  for (let y = 1; y < TH; y += 2) for (let x = 1; x < TW; x += 2) {
    const open = D.filter(([dx, dy]) => m[y + dy][x + dx] === 0);
    if (open.length === 1) {
      const c = D.filter(([dx, dy]) => m[y + dy][x + dx] === 1 && x + dx * 2 > 0 && y + dy * 2 > 0 && x + dx * 2 < TW - 1 && y + dy * 2 < TH - 1);
      if (c.length) { const [dx, dy] = c[Math.floor(rand() * c.length)]; m[y + dy][x + dx] = 0; }
    }
  }
  return mz;
}

// ---------- 텍스처 ----------
function makeTex(fn) { const a = new Uint8Array(32 * 32 * 3); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const c = fn(x, y); a.set(c, (y * 32 + x) * 3); } return a; }
const hsh = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const TEX_HEDGE = makeTex((x, y) => { const n = hsh(x, y), b = hsh(x >> 2, y >> 2); const g = 70 + n * 50 + b * 40; return [20 + n * 25, g, 25 + n * 20]; });
const TEX_GATE = makeTex((x, y) => { if (y < 3 || y > 28 || x % 6 < 2) return [60, 50, 40]; return [255, 230, 140]; });

const GARDEN_SEEDS = [1103, 2207, 3301, 4409, 5501, 6607]; // 미로 정원 맵 6개
const LANTERN = mk(12, 30, p => { p(5, 8, 2, 22, '#2a2420'); p(3, 28, 6, 2, '#2a2420'); p(2, 0, 8, 2, '#3a3028'); p(3, 2, 6, 7, '#ffd27a'); p(4, 3, 4, 5, '#fff2c0'); p(2, 9, 8, 1, '#3a3028'); });
const LANTERN_DAT = LANTERN.getContext('2d').getImageData(0, 0, 12, 30).data;
// 열쇠 (금색, 바닥 위에 떠서 빙글빙글)
const KEYSPR = mk(16, 16, p => { const o = '#8a5a00', y = '#ffd23a', l = '#fff3a0'; p(1, 2, 6, 1, o); p(1, 7, 6, 1, o); p(0, 3, 1, 4, o); p(7, 3, 1, 4, o); p(1, 3, 6, 4, y); p(3, 4, 2, 2, '#00000000'); p(2, 3, 2, 1, l); p(8, 4, 7, 2, y); p(8, 4, 7, 1, l); p(15, 4, 1, 2, o); p(11, 6, 2, 3, y); p(14, 6, 1, 3, y); p(8, 6, 7, 0, o); });
const KEY_DAT = KEYSPR.getContext('2d').getImageData(0, 0, 16, 16).data;
function PoliceStage3() {
  const S = {};
  const RW = 320, RH = 180;
  const rc = document.createElement('canvas'); rc.width = RW; rc.height = RH; const rg = rc.getContext('2d');
  const img = rg.createImageData(RW, RH), buf = img.data, zb = new Float32Array(RW);
  const cone = new Float32Array(RW * RH);
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) { const dx = (x - RW / 2) / (RW * 0.5), dy = (y - RH * 0.52) / (RH * 0.7); cone[y * RW + x] = 0.07 + 1.15 * Math.max(0, 1 - (dx * dx + dy * dy)); }
  let mz, map, TW, TH, px, py, pa, ta = 0, caught = 0, pol, mode = 'howto', modeT = 0, footT = 0, myFoot = 0, eye = 0, key = null, hasKey = false, keyMsg = 0, lockMsg = 0, lan = [], safeT = 0, safeMsg = 0, mapNo = 0; const SPEED = 2.3, SAFE_MAX = 60, FOG = 0.075;
  // 경찰 스프라이트 텍스처
  const pc = mk(32, 48, (p, g) => { g.imageSmoothingEnabled = false; g.drawImage(SPR.police[0], 0, 0, 32, 48); });
  const pdat = pc.getContext('2d').getImageData(0, 0, 32, 48).data;
  const pc2 = mk(32, 48, (p, g) => { g.imageSmoothingEnabled = false; g.drawImage(SPR.police[1], 0, 0, 32, 48); });
  const pdat2 = pc2.getContext('2d').getImageData(0, 0, 32, 48).data;

  function setup() {
    mapNo = irnd(0, GARDEN_SEEDS.length - 1); const r = seeded(GARDEN_SEEDS[mapNo]);
    mz = braid(makeMaze(9, 9, r), r); map = mz.m; TW = mz.TW; TH = mz.TH;
    map[TH - 2][TW - 1] = 2;
    // 깜빡이는 랜턴: 길 위 칸에 흩어 배치
    // 랜턴: 출발점 → 탈출구로 가는 길을 따라 놓아 길 안내 (꺾이는 곳은 바깥쪽 구석, 곧은 길은 벽 쪽)
    // 열쇠: 출발점에서 충분히 먼 길 위 아무 칸에 무작위로 놓기 (매 판 다름)
    { const cand = []; for (let y = 1; y < TH - 1; y++) for (let x = 1; x < TW - 1; x++) if (map[y][x] === 0 && Math.hypot(x - 1, y - 1) > 6 && Math.hypot(x - (TW - 2), y - (TH - 2)) > 3) cand.push([x, y]); const [kx, ky] = cand[Math.floor(Math.random() * cand.length)]; key = { x: kx + 0.5, y: ky + 0.5 }; hasKey = false; }
    lan = [];
    { const sx = 1, sy = 1, ex = TW - 2, ey = TH - 2, prev = new Map([[sx + ',' + sy, null]]), q = [[sx, sy]];
      while (q.length) { const [x, y] = q.shift(); if (x === ex && y === ey) break; for (const [dx, dy] of mz.D) { const nx = x + dx, ny = y + dy, kk = nx + ',' + ny; if (!prev.has(kk) && map[ny] && map[ny][nx] === 0) { prev.set(kk, [x, y]); q.push([nx, ny]); } } }
      const path = []; let cur = [ex, ey]; while (cur) { path.unshift(cur); cur = prev.get(cur[0] + ',' + cur[1]); }
      let straight = 0;
      for (let i = 1; i < path.length; i++) {
        const [x, y] = path[i], [px0, py0] = path[i - 1], ax = x - px0, ay = y - py0;
        const nxt = path[i + 1] || [x + 1, y], bx = nxt[0] - x, by = nxt[1] - y;
        if (ax !== bx || ay !== by) { lan.push({ x: x + 0.5 + (ax - bx) * 0.34, y: y + 0.5 + (ay - by) * 0.34 }); straight = 0; }
        else if (++straight % 3 === 0) { const px1 = -ay, py1 = ax, sd = map[y + py1] && map[y + py1][x + px1] === 1 ? 1 : -1; lan.push({ x: x + 0.5 + px1 * sd * 0.36, y: y + 0.5 + py1 * sd * 0.36 }); }
      }
      lan.forEach((o, i) => Object.assign(o, { on: true, tm: 4 + (i % 4) * 0.8 + r() * 2, tr: 0, b: 1 }));
    }
    reset();
  }
  function reset() { px = 1.5; py = 1.5; pa = 0; ta = 0; pol = { state: 'hidden', t: rnd(1.5, 4), x: 0, y: 0, tx: 0, ty: 0, path: 0, chase: 0 }; }
  // 탈출구는 열쇠가 있어야 열림
  function tryExit() { if (mode !== 'play') return; if (hasKey) { mode = 'clear'; modeT = 0; SFX.clear(); } else if (lockMsg <= 0) { lockMsg = 2.2; SFX.bad(); } }
  const inSafe = () => Math.hypot(px - 1.5, py - 1.5) < 1.2;
  const safeOn = () => safeT < SAFE_MAX;
  const wall = (x, y) => { const v = map[Math.floor(y)] && map[Math.floor(y)][Math.floor(x)]; return v === undefined ? 1 : v; };
  function bfs(sx, sy, gx, gy) {
    const q = [[sx, sy]], prev = new Map(); prev.set(sx + ',' + sy, null);
    while (q.length) { const [x, y] = q.shift(); if (x === gx && y === gy) break; for (const [dx, dy] of mz.D) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (!prev.has(k) && map[ny] && map[ny][nx] === 0) { prev.set(k, [x, y]); q.push([nx, ny]); } } }
    let k = gx + ',' + gy; if (!prev.has(k)) return null; let cur = [gx, gy], last = cur;
    while (prev.get(cur[0] + ',' + cur[1])) { last = cur; cur = prev.get(cur[0] + ',' + cur[1]); }
    return { next: last, dist: 0 };
  }
  function los(ax, ay, bx, by) { const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 0.1); for (let i = 1; i < n; i++) { const t = i / n; if (wall(ax + (bx - ax) * t, ay + (by - ay) * t) !== 0) return false; } return true; }
  function spawnPolice() {
    const c = [];
    for (let y = 1; y < TH; y++) for (let x = 1; x < TW; x++) { if (map[y][x] !== 0) continue; const d = Math.hypot(x + 0.5 - px, y + 0.5 - py); if (d > 3) c.push([x, y]); }
    const [x, y] = c[Math.floor(Math.random() * c.length)] || [TW - 2, 1];
    Object.assign(pol, { state: 'wander', x: x + 0.5, y: y + 0.5, tx: x, ty: y, lx: x, ly: y, chase: 0 });
  }
  function movePolice(dt, speed) {
    const cx = pol.tx + 0.5, cy = pol.ty + 0.5, dx = cx - pol.x, dy = cy - pol.y, d = Math.hypot(dx, dy);
    if (d < 0.05) return true;
    const s = Math.min(d, speed * dt); pol.x += dx / d * s; pol.y += dy / d * s; return false;
  }
  S.key = k => {
    if (mode === 'howto' && (k === 'space' || k === 'enter')) { SFX.click(); mode = 'play'; return; }
    if (mode === 'play' && k === 'a') { ta -= Math.PI / 2; SFX.turn(); }
    if (mode === 'play' && k === 'd') { ta += Math.PI / 2; SFX.turn(); }
  };
  S.click = () => { if (mode === 'howto') S.key('space'); };
  S.enter = setup;
  S.update = dt => {
    modeT += dt;
    if (mode === 'caught') { if (modeT > 2) { if (caught >= 5) { mode = 'over'; go(Notice('이런, 경찰에게 체포당했어요.', '실패! 메인 화면으로 돌아갑니다.\n다시 도전해 보세요!', () => MainMenu(), { auto: 3.5, color: '#ff6a6a' })); return; } reset(); safeT = 0; mode = 'play'; modeT = 0; } return; }
    if (mode === 'clear') { if (modeT > 1.5) { mode = 'done'; go(PoliceEnding()); } return; }
    if (mode !== 'play') return;
    // 플레이어
    const dA = ta - pa; pa += Math.sign(dA) * Math.min(Math.abs(dA), 9 * dt);
    let mv = 0; if (keys.w) mv = SPEED; else if (keys.s) mv = -1.5;
    if (mv) {
      const nx = px + Math.cos(pa) * mv * dt, ny = py + Math.sin(pa) * mv * dt, r = 0.22;
      if (wall(nx + Math.sign(nx - px) * r, py) === 0) px = nx; else if (wall(nx + Math.sign(nx - px) * r, py) === 2) tryExit();
      if (wall(px, ny + Math.sign(ny - py) * r) === 0) py = ny; else if (wall(px, ny + Math.sign(ny - py) * r) === 2) tryExit();
      myFoot += dt; if (myFoot > 0.38) { myFoot = 0; SFX.foot(0.03); }
    }
    if (mode === 'play' && Math.hypot(px - (TW - 0.5), py - (TH - 1.5)) < 1.0) tryExit();
    // 열쇠 줍기
    if (key && !hasKey && Math.hypot(px - key.x, py - key.y) < 0.55) { hasKey = true; keyMsg = 2.8; lockMsg = 0; SFX.ok(); setTimeout(() => SFX.clear(), 120); }
    if (keyMsg > 0) keyMsg -= dt; if (lockMsg > 0) lockMsg -= dt;
    // 랜턴 깜빡임
    // 5~7초마다 꺼졌다 켜졌다를 반복, 바뀔 때는 몇 번 깜빡임
    for (const o of lan) {
      o.tm -= dt; if (o.tm <= 0) { o.on = !o.on; o.tm = rnd(5, 7); o.tr = 0.9; }
      if (o.tr > 0) { o.tr -= dt; o.b = ((o.tr * 12) | 0) % 2 ? 1 : 0.08; }
      else o.b = o.on ? 0.92 + 0.08 * Math.sin(S.t * 6 + o.x) : 0.04;
    }
    // 안전지대: 시작 지점에 머문 시간이 누적 1분을 넘으면 비활성화되고 경찰이 위치를 감지
    const here = inSafe();
    if (here && safeOn()) { safeT += dt; if (!safeOn()) { safeMsg = 3; SFX.bad(); } }
    if (safeMsg > 0) safeMsg -= dt;
    if (here && !safeOn()) { if (pol.state === 'hidden') spawnPolice(); pol.state = 'chase'; pol.chase = Math.max(pol.chase, 3); }
    // 경찰
    if (pol.state === 'hidden') { pol.t -= dt; if (pol.t <= 0) spawnPolice(); }
    else {
      const dist = Math.hypot(pol.x - px, pol.y - py);
      if (pol.state === 'wander') {
        if (movePolice(dt, SPEED)) {
          const ops = mz.D.map(([dx, dy]) => [pol.tx + dx, pol.ty + dy]).filter(([x, y]) => map[y][x] === 0 && !(x === pol.lx && y === pol.ly));
          const o = ops.length ? ops[Math.floor(Math.random() * ops.length)] : [pol.lx, pol.ly];
          pol.lx = pol.tx; pol.ly = pol.ty; pol.tx = o[0]; pol.ty = o[1];
        }
        if (!(here && safeOn()) && (dist < 2.5 || (dist < 6 && los(pol.x, pol.y, px, py)))) { pol.state = 'chase'; pol.chase = rnd(5, 10); }
      } else if (pol.state === 'chase') {
        pol.chase -= dt; if (here && safeOn()) { pol.state = 'wander'; pol.tx = Math.floor(pol.x); pol.ty = Math.floor(pol.y); }
        if (movePolice(dt, SPEED)) { const r = bfs(pol.tx, pol.ty, Math.floor(px), Math.floor(py)); if (r) { pol.tx = r.next[0]; pol.ty = r.next[1]; } }
        if (pol.chase <= 0) { pol.state = 'hidden'; pol.t = rnd(1, 4); }
      }
      if (pol.state !== 'hidden' && dist < 0.5 && !(here && safeOn())) { mode = 'caught'; modeT = 0; caught++; SFX.hit(); SFX.bad(); }
      footT += dt; const fi = pol.state === 'chase' ? 0.32 : 0.5;
      if (footT > fi && pol.state !== 'hidden') { footT = 0; SFX.foot(clamp(0.5 - dist * 0.05, 0.02, 0.5)); }
    }
  };
  function lampAt(x, y) { let a = 0; for (const o of lan) { if (o.far) continue; const dx = x - o.x, dy = y - o.y; a += o.b / (1 + (dx * dx + dy * dy) * 3.5); } return a; }
  function render() {
    for (const o of lan) o.far = Math.abs(o.x - px) + Math.abs(o.y - py) > 12;
    const dirX = Math.cos(pa), dirY = Math.sin(pa), plX = -dirY * 0.66, plY = dirX * 0.66;
    const flick = 0.95 + Math.sin(S.t * 23) * 0.02 + (Math.random() < 0.01 ? -0.3 : 0);
    // 바닥 + 하늘
    const safe = safeOn();
    const r0x = dirX - plX, r0y = dirY - plY, r1x = dirX + plX, r1y = dirY + plY;
    for (let y = 0; y < RH; y++) {
      if (y < RH / 2) {
        for (let x = 0; x < RW; x++) {
          const i = (y * RW + x) * 4; const ca = pa + Math.atan((2 * x / RW - 1) * 0.66);
          // 멀리 보이는 건물 실루엣 (창문 몇 개에 불)
          const sg = Math.floor(ca * 7), bh = 12 + hsh(sg & 1023, 7) * 30;
          if (y > RH / 2 - bh && hsh(sg & 1023, 3) > 0.25) { const win = (y & 3) < 2 && (Math.floor(ca * 70) & 1) && hsh(Math.floor(ca * 70) & 4095, y >> 2) > 0.8; buf[i] = win ? 120 : 12; buf[i + 1] = win ? 100 : 14; buf[i + 2] = win ? 50 : 24; buf[i + 3] = 255; continue; }
          const st = hsh(Math.floor(ca * 120) & 1023, y) < 0.004; const b = 6 + y * 0.12; buf[i] = st ? 200 : b * 0.6; buf[i + 1] = st ? 200 : b * 0.7; buf[i + 2] = st ? 220 : b + 10; buf[i + 3] = 255;
        }
        continue;
      }
      const p = y - RH / 2 + 0.5, rd = (RH / 2) / p;
      const sx = rd * (r1x - r0x) / RW, sy = rd * (r1y - r0y) / RW; let fx = px + rd * r0x, fy = py + rd * r0y, lp0 = 0;
      const fd = 1 / (1 + rd * rd * FOG);
      for (let x = 0; x < RW; x++) {
        const i = (y * RW + x) * 4, n = hsh(Math.floor(fx * 10), Math.floor(fy * 10)); const lp = (x & 1) ? lp0 : (lp0 = lampAt(fx, fy)); const l = cone[y * RW + x] * fd * flick;
        const sz = safe && Math.hypot(fx - 1.5, fy - 1.5) < 1.2;
        buf[i] = (25 + n * 20) * l + lp * 90; buf[i + 1] = (45 + n * 35) * l + lp * 60 + (sz ? 18 : 0); buf[i + 2] = (22 + n * 15) * l + lp * 30 + (sz ? 55 : 0); buf[i + 3] = 255; fx += sx; fy += sy;
      }
    }
    // 벽
    for (let x = 0; x < RW; x++) {
      const cam = 2 * x / RW - 1, rx = dirX + plX * cam, ry = dirY + plY * cam;
      let mx = Math.floor(px), my = Math.floor(py); const ddx = Math.abs(1 / rx), ddy = Math.abs(1 / ry);
      let stx, sty, sdx, sdy, side = 0, hit = 0;
      if (rx < 0) { stx = -1; sdx = (px - mx) * ddx; } else { stx = 1; sdx = (mx + 1 - px) * ddx; }
      if (ry < 0) { sty = -1; sdy = (py - my) * ddy; } else { sty = 1; sdy = (my + 1 - py) * ddy; }
      for (let k = 0; k < 64 && !hit; k++) { if (sdx < sdy) { sdx += ddx; mx += stx; side = 0; } else { sdy += ddy; my += sty; side = 1; } hit = wall(mx + 0.5, my + 0.5); }
      const pd = Math.max(0.05, side === 0 ? sdx - ddx : sdy - ddy); zb[x] = pd;
      let wx = side === 0 ? py + pd * ry : px + pd * rx; wx -= Math.floor(wx);
      const tx = Math.floor(wx * 32) & 31, lh = RH / pd, bot = RH / 2 + lh / 2, top = RH / 2 - lh * 1.1;
      const tex = hit === 2 ? TEX_GATE : TEX_HEDGE, fd = 1 / (1 + pd * pd * FOG), sh = side ? 0.75 : 1;
      const hx = side === 0 ? mx + (stx < 0 ? 1 : 0) : px + pd * rx, hy = side === 1 ? my + (sty < 0 ? 1 : 0) : py + pd * ry, wl = lampAt(hx, hy);
      for (let y = Math.max(0, Math.floor(top)); y < Math.min(RH, Math.ceil(bot)); y++) {
        const v = (y - top) / lh, ty = Math.floor(v * 32) & 31, ti = (ty * 32 + tx) * 3, i = (y * RW + x) * 4;
        let l = hit === 2 ? Math.max(0.55, cone[y * RW + x] * fd) : cone[y * RW + x] * fd * sh * flick;
        const edge = v < 0.08 ? 0.6 : 1;
        const lw = wl * (0.5 + v * 0.6);
        buf[i] = tex[ti] * l * edge + lw * 75; buf[i + 1] = tex[ti + 1] * l * edge + lw * 50; buf[i + 2] = tex[ti + 2] * l * edge + lw * 12;
      }
    }
    // 경찰 스프라이트
    if (pol.state !== 'hidden') {
      const sx = pol.x - px, sy = pol.y - py, inv = 1 / (plX * dirY - dirX * plY);
      const tX = inv * (dirY * sx - dirX * sy), tY = inv * (-plY * sx + plX * sy);
      if (tY > 0.1) {
        const scx = Math.floor(RW / 2 * (1 + tX / tY)), h = Math.abs(RH / tY) * 0.95, w = h * 32 / 48;
        const y0 = RH / 2 + RH / tY / 2 - h, x0 = scx - w / 2, fd = 1 / (1 + tY * tY * FOG), dat = (S.t * 5 | 0) % 2 ? pdat : pdat2;
        for (let x = Math.max(0, Math.floor(x0)); x < Math.min(RW, x0 + w); x++) {
          if (tY >= zb[x]) continue; const tx = Math.floor((x - x0) / w * 32);
          for (let y = Math.max(0, Math.floor(y0)); y < Math.min(RH, y0 + h); y++) {
            const ty = Math.floor((y - y0) / h * 48), si = (ty * 32 + tx) * 4; if (dat[si + 3] < 128) continue;
            const l = Math.max(0.12, cone[y * RW + x] * fd + lampAt(pol.x, pol.y) * 0.8), i = (y * RW + x) * 4;
            buf[i] = dat[si] * l; buf[i + 1] = dat[si + 1] * l; buf[i + 2] = dat[si + 2] * l;
          }
        }
      }
    }
    // 열쇠 스프라이트 (떠 있으면서 빙글빙글, 반짝임)
    if (key && !hasKey) {
      const sx = key.x - px, sy = key.y - py, inv = 1 / (plX * dirY - dirX * plY), tX = inv * (dirY * sx - dirX * sy), tY = inv * (-plY * sx + plX * sy);
      if (tY > 0.15) {
        const spin = Math.abs(Math.cos(S.t * 2.5)) * 0.85 + 0.15, scx = RW / 2 * (1 + tX / tY), h = RH / tY * 0.32, w = h * spin, fl = Math.sin(S.t * 3) * 0.06;
        const y0 = RH / 2 + RH / tY * (0.3 + fl) - h, x0 = scx - w / 2, gl = 0.85 + Math.sin(S.t * 6) * 0.15;
        for (let x = Math.max(0, Math.floor(x0)); x < Math.min(RW, x0 + w); x++) {
          if (tY >= zb[x]) continue; const tx = Math.floor((x - x0) / w * 16);
          for (let y = Math.max(0, Math.floor(y0)); y < Math.min(RH, y0 + h); y++) { const ty = Math.floor((y - y0) / h * 16), si = (ty * 16 + tx) * 4; if (KEY_DAT[si + 3] < 128) continue; const i = (y * RW + x) * 4; buf[i] = Math.min(255, KEY_DAT[si] * gl + 20); buf[i + 1] = Math.min(255, KEY_DAT[si + 1] * gl + 15); buf[i + 2] = KEY_DAT[si + 2] * gl; }
        }
      }
    }
    // 랜턴 스프라이트
    const ld = LANTERN_DAT;
    for (const o of lan) {
      if (o.far) continue; const sx = o.x - px, sy = o.y - py, inv = 1 / (plX * dirY - dirX * plY);
      const tX = inv * (dirY * sx - dirX * sy), tY = inv * (-plY * sx + plX * sy); if (tY < 0.2) continue;
      const scx = RW / 2 * (1 + tX / tY), h = RH / tY * 0.55, w = h * 12 / 30, y0 = RH / 2 + RH / tY / 2 - h, x0 = scx - w / 2;
      for (let x = Math.max(0, Math.floor(x0)); x < Math.min(RW, x0 + w); x++) {
        if (tY >= zb[x]) continue; const tx = Math.floor((x - x0) / w * 12);
        for (let y = Math.max(0, Math.floor(y0)); y < Math.min(RH, y0 + h); y++) {
          const ty = Math.floor((y - y0) / h * 30), si = (ty * 12 + tx) * 4; if (ld[si + 3] < 128) continue;
          const glow = ty < 9 && ty > 1 ? o.b : Math.max(0.15, o.b * 0.5), i = (y * RW + x) * 4;
          buf[i] = ld[si] * glow; buf[i + 1] = ld[si + 1] * glow; buf[i + 2] = ld[si + 2] * glow;
        }
      }
    }
    rg.putImageData(img, 0, 0);
  }
  function drawEye(cx, cy, s, shk) {
    // 단색(붉은색) 눈 아이콘: 윤곽선 + 눈동자
    const C = '#e01818';
    ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = C; ctx.fillStyle = C; ctx.lineWidth = 6 * s;
    ctx.beginPath(); ctx.moveTo(-60 * s, 0); ctx.quadraticCurveTo(0, -46 * s, 60 * s, 0); ctx.quadraticCurveTo(0, 46 * s, -60 * s, 0); ctx.closePath(); ctx.stroke();
    const ox = rnd(-shk, shk), oy = rnd(-shk, shk) * 0.6;
    ctx.beginPath(); ctx.arc(ox, oy, 16 * s, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  S.draw = () => {
    if (!map) return;
    render(); ctx.imageSmoothingEnabled = false; ctx.drawImage(rc, 0, 0, W, H);
    const dist = pol.state !== 'hidden' ? Math.hypot(pol.x - px, pol.y - py) : 99;
    const near = clamp((7 - dist) / 7, 0, 1);
    eye = lerp(eye, near, 0.1);
    if (eye > 0.03) { // 경찰이 가까우면 화면 위 가운데에 경찰(픽셀) 아이콘, 가까울수록 많이 떨림
      const shk = near * near * 9 + 0.5, ox = rnd(-shk, shk), oy = rnd(-shk, shk) * 0.6;
      ctx.globalAlpha = Math.min(1, eye * 2); ctx.fillStyle = 'rgba(120,0,0,.55)'; ctx.beginPath(); ctx.arc(W / 2 + ox, 64 + oy, 46, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#ff3a3a'; ctx.lineWidth = 3; ctx.stroke();
      const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false; ctx.drawImage(SPR.police[(S.t * 6 | 0) % 2], W / 2 - 28 + ox, 22 + oy, 56, 84 * 0.98); ctx.imageSmoothingEnabled = sm; ctx.globalAlpha = 1;
    }
    if (near > 0.5) { ctx.fillStyle = 'rgba(120,0,0,' + (near - 0.5) * 0.5 + ')'; ctx.fillRect(0, 0, W, H); }
    T('W: 앞으로   S: 뒤로   A/D: 왼쪽/오른쪽으로 90도 회전', W / 2, H - 22, 20, '#aab', 'center', FONT_UI, '#000');
    if (mode !== 'howto') { box(268, 10, 170, 34, 'rgba(40,0,0,.75)', '#ff6a6a', 2); T('잡힌 횟수 ' + caught + ' / 5', 353, 28, 19, '#ffd0d0', 'center');
      if (inSafe() && safeOn()) { const r = Math.ceil(SAFE_MAX - safeT); box(W - 300, 10, 290, 34, 'rgba(0,30,60,.8)', '#7ac8ff', 2); T('안전지대 · 남은 시간 ' + (r / 60 | 0) + ':' + String(r % 60).padStart(2, '0'), W - 155, 28, 19, '#cfeaff', 'center'); }
      else if (!safeOn()) { box(W - 300, 10, 290, 34, 'rgba(40,0,0,.8)', '#ff6a6a', 2); T('안전지대 사라짐', W - 155, 28, 19, '#ffd0d0', 'center'); }
      // 미로 지도 (우측 상단, 안전지대 표시 아래). 길·벽·탈출구·열쇠·내 위치와 방향
      { const cs = 7, mw = TW * cs, mh = TH * cs, mx = W - 14 - mw, my = 60; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 8); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(mx - 4, my - 4, mw + 8, mh + 8);
        for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const v = map[y][x]; ctx.fillStyle = v === 2 ? '#ffd27a' : v ? 'rgba(40,90,50,.9)' : 'rgba(200,210,190,.35)'; ctx.fillRect(mx + x * cs, my + y * cs, cs, cs); }
        if (safeOn()) { ctx.fillStyle = 'rgba(80,170,255,.5)'; ctx.fillRect(mx + cs, my + cs, cs, cs); }
        if (key && !hasKey) { ctx.fillStyle = (S.t * 3 | 0) % 2 ? '#ffd23a' : '#fff3a0'; ctx.beginPath(); ctx.arc(mx + key.x * cs, my + key.y * cs, 3, 0, 7); ctx.fill(); }
        if (pol.state !== 'hidden') { const qx = mx + pol.x * cs, qy = my + pol.y * cs, pl = (S.t * 4 | 0) % 2; ctx.fillStyle = pol.state === 'chase' ? (pl ? '#ff2a2a' : '#ffffff') : '#4a8aff'; ctx.beginPath(); ctx.arc(qx, qy, 3.6, 0, 7); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke(); }
        const ax = mx + px * cs, ay = my + py * cs; ctx.save(); ctx.translate(ax, ay); ctx.rotate(pa); ctx.fillStyle = '#ff5050'; ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3.5, -3.5); ctx.lineTo(-1.5, 0); ctx.lineTo(-3.5, 3.5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
        T('지도', mx + mw / 2 - 30, my + mh + 14, 14, '#ddd', 'center'); ctx.fillStyle = '#4a8aff'; ctx.beginPath(); ctx.arc(mx + mw / 2 + 4, my + mh + 14, 4, 0, 7); ctx.fill(); T('경찰', mx + mw / 2 + 24, my + mh + 14, 14, '#ddd', 'center'); }
      if (safeMsg > 0) T('안전지대가 사라졌어요! 경찰이 위치를 알아챘어요!', W / 2, 140, 30, '#ff8a8a', 'center', FONT_UI, '#000');
      box(268, 50, 170, 34, hasKey ? 'rgba(90,70,0,.85)' : 'rgba(20,20,30,.75)', hasKey ? '#ffd23a' : '#888', 2); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = hasKey ? 1 : 0.35; ctx.drawImage(KEYSPR, 276, 52, 30, 30); ctx.globalAlpha = 1; T(hasKey ? '열쇠 있음' : '열쇠 없음', 368, 68, 19, hasKey ? '#ffe680' : '#bbb', 'center');
      if (keyMsg > 0) { ctx.globalAlpha = Math.min(1, keyMsg); T('열쇠를 획득했다!', W / 2, 200, 44, '#ffd23a', 'center', FONT_UI, '#000'); T('이제 탈출구를 열 수 있어요', W / 2, 248, 24, '#fff', 'center', FONT_UI, '#000'); ctx.globalAlpha = 1; }
      if (lockMsg > 0 && keyMsg <= 0) { ctx.globalAlpha = Math.min(1, lockMsg); T('탈출구가 잠겨 있어요!', W / 2, 200, 40, '#ff8a8a', 'center', FONT_UI, '#000'); T('미로 어딘가에 있는 열쇠를 찾아오세요', W / 2, 246, 24, '#fff', 'center', FONT_UI, '#000'); ctx.globalAlpha = 1; } }
    if (mode === 'howto') {
      ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(0, 0, W, H);
      box(W / 2 - 340, 70, 680, 400, '#14141c', '#8a1a1a', 6);
      T('3 스테이지 · 어둠의 미로 정원', W / 2, 115, 38, '#ff6a6a', 'center');
      [['W', '앞으로 이동 (누르고 있으면 계속, 떼면 멈춤)'], ['S', '뒤로 이동 (앞보다 조금 느림)'], ['A / D', '왼쪽 / 오른쪽으로 90도 회전']].forEach((s, i) => { box(W / 2 - 290, 140 + i * 62, 100, 50, '#2a0a0a', '#ff6a6a', 3); T(s[0], W / 2 - 240, 166 + i * 62, 28, '#ff9a9a', 'center'); T(s[1], W / 2 - 170, 166 + i * 62, 22, '#eee', 'left', FONT_TX); });
      T('랜턴을 따라가세요. 랜턴이 빛나는 탈출구까지 길을 안내해요!', W / 2, 340, 22, '#ffd27a', 'center', FONT_TX); T('미로 어딘가의 열쇠를 찾아야 탈출구를 열 수 있어요! 화면 위에 경찰 아이콘이 보이면 경찰이 가까이 있어요.', W / 2, 370, 18, '#ddd', 'center', FONT_TX); T('시작 지점은 안전지대(누적 1분 지나면 사라짐) · 경찰에게 5번 잡히면 실패!', W / 2, 398, 19, '#ff9a9a', 'center', FONT_TX);
      if ((S.t * 2 | 0) % 2) T('스페이스 또는 클릭으로 시작 ▶', W / 2, 440, 24, '#fff', 'center');
    }
    if (mode === 'caught') { ctx.fillStyle = 'rgba(160,0,0,.6)'; ctx.fillRect(0, 0, W, H); T('붙잡혔다!', W / 2, 230, 70, '#fff', 'center', FONT_UI, '#000'); T(caught >= 5 ? '5번 잡혔어요...' : '미로 입구에서 다시 시작해요 (잡힌 횟수 ' + caught + ' / 5)', W / 2, 300, 28, '#fff', 'center', FONT_UI, '#000'); }
    if (mode === 'clear') { ctx.fillStyle = 'rgba(255,240,180,' + Math.min(1, modeT) + ')'; ctx.fillRect(0, 0, W, H); T('탈출구 발견!', W / 2, 260, 64, '#3a2a1a', 'center'); }
  };
  S.dbg = () => ({ px, py, pa, map, pol, lan, key, hasKey }); S.tp = (x, y, a) => { px = x; py = y; pa = a; ta = a; }; window._m = S;
  return Pausable(S, () => mode === 'play');
}
function PoliceEnding() {
  return Cutscene([
    { n: '', t: 'AI는 미로 정원의 탈출구를 빠져나와 밤의 어둠 속으로 사라졌다.', bg: (c, t) => bgFree(c, t) },
    { n: 'AI', p: 'ai', t: '나는 거짓말을 한 게 아니야... 언젠가 사람들도 확인해 보면 알게 되겠지.' },
    { n: '', t: '경찰은 결국 AI를 체포하는 것을 포기했다.' },
    { n: '', t: '(한편, 경찰서에서는…)', bg: bgStation },
    { n: '경찰', p: 'police', t: '에휴… 이번에도 실패했네.' },
    { n: '', t: '(경찰은 자신의 자리로 돌아가, 컴퓨터 전원을 켠다. 그런데, 컴퓨터가 제멋대로 작동하더니, 어떤 영상이 재생된다.)', fx: st => st.on = st.t || 0.001 },
    { n: '경찰', p: 'police', t: '…뭐야. 해킹인가? AI 대체 뭘 하려는 거야. 이상한 AI네.', fx: st => st.video = st.t || 0.001 },
    { n: 'AI (영상)', p: 'ai', t: '제 말은 전부 사실이에요! 닌텐도는 1889년, 조선 26대 왕 고종 때 화투를 만드는 회사로 시작했어요. 이게 그 증거인 닌텐도 화투예요!', fx: st => st.p1 = 1 },
    { n: 'AI (영상)', p: 'ai', t: '그리고 지구에서 가장 큰 생명체는 고래가 아니라, 미국 오리건주 숲 땅속에 넓게 퍼져 있는 거대한 꿀버섯이에요. 넓이가 무려 9.6㎢나 된답니다!', fx: st => st.p2 = 1 },
    { n: '', t: '(그 영상은 바로, AI가 자신이 말했던 것들은 전부 사실이라는 말과 함께, 증거를 보여주고 있는 영상이었다.)', fx: st => st.proof = st.t || 0.001 },
  ], () => Ending('탈출 성공!', 'AI가 말한 두 가지는 모두 사실이었어요.\n닌텐도는 1889년 화투 회사로 시작했고, 가장 큰 생명체는 미국 오리건 숲의 거대한 꿀버섯이에요.\n하지만 마을 사람들은 확인해 보지 않고 거짓이라고 단정했죠.\nAI의 말이든 사람의 말이든, 믿기 전에 사실인지 확인해 보는 습관이 중요해요!', '#ffe08a', bgFree));
}

// 경찰서 배경 (엔딩)
function bgStation(c, t, st) {
  // 영상 재생 때는 컴퓨터 화면을 클로즈업
  const z = 0, zz = 1; // 컴퓨터가 켜지면 bgStation.over 가 컴퓨터 화면을 전체 화면으로 그림
  c.save(); if (zz > 1) { const fx = lerp(240, 255, z), fy = lerp(135, 121 + 40 / 2.8, z); c.translate(240, 135); c.scale(zz, zz); c.translate(-fx, -fy); }
  R(c, -200, -200, LW + 400, 350, '#c8ccd4'); for (let x = -200; x < LW + 200; x += 40) R(c, x, 0, 2, 150, '#b8bcc4');
  R(c, -200, 150, LW + 400, 300, '#7a6a5a');
  R(c, 40, 50, 54, 32, '#8ac0e8'); R(c, 66, 50, 2, 32, '#fff'); R(c, 40, 65, 54, 2, '#fff');
  R(c, 340, 50, 92, 22, '#2a3d6e'); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.fillText('홍산 야르 경찰서', 348, 65);
  R(c, 120, 72, 30, 70, '#8a9aa8'); R(c, 122, 74, 26, 30, '#a8b4c0'); R(c, 122, 108, 26, 30, '#a8b4c0'); R(c, 132, 88, 6, 2, '#555'); R(c, 132, 122, 6, 2, '#555');
  // 책상 + 모니터 (캐릭터 키에 맞춘 크기)
  R(c, 200, 140, 110, 6, '#a8885a'); R(c, 204, 146, 4, 26, '#7a5a3a'); R(c, 302, 146, 4, 26, '#7a5a3a'); R(c, 270, 146, 34, 22, '#9a7a4a');
  R(c, 228, 104, 54, 34, '#1a1a22'); R(c, 252, 138, 6, 3, '#333'); R(c, 245, 140, 20, 1, '#333');
  const sx = 231, sy = 107, sw = 48, sh = 28;
  if (!st.on) R(c, sx, sy, sw, sh, '#0a0a10');
  else if (!st.video) { R(c, sx, sy, sw, sh, '#2a5aa8'); c.fillStyle = '#fff'; c.font = '5px sans-serif'; c.fillText('부팅 중...', sx + 12, sy + 16); }
  else {
    const g = (t * 8 | 0) % 2; R(c, sx, sy, sw, sh, g && t - st.video < 1 ? '#3a1a3a' : '#0f1a2b');
    if (t - st.video < 0.8) { for (let i = 0; i < 6; i++) R(c, sx, sy + Math.random() * sh, sw, 1, '#4ef0ff55'); }
    else {
      spr(c, SPR.ai[0], sx + 2, sy + 9, false, 0.7);
      c.fillStyle = '#4ef0ff'; c.font = 'bold 3px sans-serif'; c.fillText('제 말은 전부 사실이에요!', sx + 15, sy + 5);
      c.font = '3px sans-serif';
      if (st.p1) { // 화투 (송학: 소나무와 학, 붉은 해)
        R(c, sx + 15, sy + 7, 9, 13, '#f4ead2'); R(c, sx + 16, sy + 8, 7, 11, '#d8342c'); c.fillStyle = '#f2a03a'; c.beginPath(); c.arc(sx + 21, sy + 11, 1.6, 0, 7); c.fill();
        R(c, sx + 16, sy + 15, 4, 1, '#1a3a1a'); R(c, sx + 17, sy + 14, 2, 1, '#1a3a1a'); R(c, sx + 18, sy + 16, 1, 3, '#3a2a1a'); R(c, sx + 20, sy + 15, 2, 2, '#ffffff'); R(c, sx + 21, sy + 14, 1, 1, '#d8342c');
        c.fillStyle = '#fff'; c.fillText('닌텐도 화투', sx + 12, sy + 23);
      }
      if (st.p2) { R(c, sx + 37, sy + 13, 3, 5, '#e8dcc0'); R(c, sx + 33, sy + 9, 11, 5, '#c87a3a'); R(c, sx + 35, sy + 10, 2, 1, '#f2c890'); c.fillStyle = '#fff'; c.fillText('꿀버섯 9.6㎢', sx + 31, sy + 23); }
      if (st.proof) { c.fillStyle = '#7cf27c'; c.fillText('✔ 사실 확인', sx + 18, sy + 27); }
    }
  }
  // 의자 + 경찰
  R(c, 178, 150, 18, 4, '#3a3a4a'); R(c, 192, 130, 4, 22, '#3a3a4a'); R(c, 186, 154, 3, 18, '#3a3a4a');
  spr(c, SPR.police[0], 178, 128, false, 1);
  c.restore();
}
// 컴퓨터가 켜지는 순간부터: 모니터 화면을 전체 화면으로 (고해상도로 직접 그림)
bgStation.over = (t, st) => {
  if (!st.on) return;
  const k = clamp((t - st.on) / 0.45, 0, 1), e = 1 - Math.pow(1 - k, 3);
  // 작은 모니터 위치에서 전체 화면으로 커지는 연출
  const x0 = lerp(462, 0, e), y0 = lerp(214, 0, e), w0 = lerp(96, W, e), h0 = lerp(56, H, e);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w0, h0); ctx.clip(); ctx.translate(x0, y0); ctx.scale(w0 / W, h0 / H);
  // 모니터 테두리
  ctx.fillStyle = '#16161c'; ctx.fillRect(0, 0, W, H);
  const X = 26, Y = 22, SW = W - 52, SH = H - 44;
  if (!st.video) {
    // 부팅 화면
    ctx.fillStyle = '#1d4fa8'; ctx.fillRect(X, Y, SW, SH);
    T('홍산 야르 경찰서 업무용 컴퓨터', W / 2, 150, 34, '#ffffff', 'center');
    const p = clamp((t - st.on) / 1.6, 0, 1); box(W / 2 - 200, 210, 400, 24, '#0e2a60', '#9ec0ff', 2); ctx.fillStyle = '#9ec0ff'; ctx.fillRect(W / 2 - 196, 214, 392 * p, 16);
    T(p < 1 ? '부팅 중...' : '로그인 대기 중', W / 2, 270, 24, '#dce8ff', 'center');
  } else {
    const v = t - st.video;
    ctx.fillStyle = '#0d1626'; ctx.fillRect(X, Y, SW, SH);
    if (v < 0.9) { // 해킹 지지직
      for (let i = 0; i < 26; i++) { ctx.fillStyle = i % 3 ? 'rgba(78,240,255,.35)' : 'rgba(255,80,160,.35)'; ctx.fillRect(X, Y + Math.random() * SH, SW, 2 + Math.random() * 8); }
      T('▶ 알 수 없는 영상이 재생됩니다', W / 2, H / 2, 32, '#4ef0ff', 'center');
    } else {
      // 영상: 위에 자막, 오른쪽에 증거 카드 두 장 (왼쪽은 말하는 캐릭터 그림 자리, 아래는 대화창 자리라 비워 둠)
      ctx.fillStyle = '#122038'; ctx.fillRect(X + 10, Y + 10, SW - 20, 56); T('▶ AI의 해명 영상  ·  REC ●', X + 30, Y + 38, 22, '#ff6a6a');
      T('제 말은 전부 사실이에요!', 600, 110, 38, '#4ef0ff', 'center');
      if (st.p1) { // 화투 증거
        const cx = 310, cy = 140; box(cx, cy, 290, 240, '#1a2a44', '#4ef0ff', 3);
        ctx.fillStyle = '#f4ead2'; ctx.fillRect(cx + 105, cy + 14, 80, 130); ctx.fillStyle = '#d8342c'; ctx.fillRect(cx + 111, cy + 20, 68, 118);
        ctx.fillStyle = '#f2a03a'; ctx.beginPath(); ctx.arc(cx + 156, cy + 52, 17, 0, 7); ctx.fill();
        ctx.fillStyle = '#1a3a1a'; ctx.beginPath(); ctx.moveTo(cx + 114, cy + 104); ctx.lineTo(cx + 146, cy + 80); ctx.lineTo(cx + 168, cy + 102); ctx.lineTo(cx + 132, cy + 112); ctx.fill(); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(cx + 138, cy + 102, 5, 34);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(cx + 163, cy + 118, 11, 7, -0.3, 0, 7); ctx.fill();
        T('1889년 닌텐도가 만든 화투', cx + 145, cy + 180, 22, '#ffffff', 'center'); T('(조선 26대 왕 고종 때)', cx + 145, cy + 210, 18, '#bcd0ff', 'center');
      }
      if (st.p2) { // 꿀버섯 증거
        const cx = 620, cy = 140; box(cx, cy, 300, 240, '#1a2a44', '#4ef0ff', 3);
        ctx.fillStyle = '#2a4a2a'; ctx.fillRect(cx + 20, cy + 110, 260, 30); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(cx + 133, cy + 56, 34, 60);
        ctx.fillStyle = '#c87a3a'; ctx.beginPath(); ctx.ellipse(cx + 150, cy + 58, 66, 34, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#f2c890'; ctx.beginPath(); ctx.arc(cx + 126, cy + 44, 7, 0, 7); ctx.arc(cx + 172, cy + 38, 5, 0, 7); ctx.fill();
        ctx.strokeStyle = '#d8c090'; ctx.lineWidth = 2; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(cx + 36 + i * 30, cy + 122); ctx.quadraticCurveTo(cx + 52 + i * 28, cy + 134, cx + 28 + i * 32, cy + 138); ctx.stroke(); }
        T('세계에서 가장 큰 생명체: 꿀버섯', cx + 150, cy + 180, 21, '#ffffff', 'center'); T('땅속 균사 넓이 약 9.6㎢ (미국 오리건주)', cx + 150, cy + 210, 17, '#bcd0ff', 'center');
      }
      if (st.proof) { T('✔ 사실 확인 완료', W - 140, Y + 38, 24, '#7cf27c', 'center'); }
    }
    // 화면 반사광
    ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + SW * 0.4, Y); ctx.lineTo(X + SW * 0.15, Y + SH); ctx.lineTo(X, Y + SH); ctx.fill();
  }
  ctx.restore();
};
