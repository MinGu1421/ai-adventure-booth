// ===================== 주인을 찾아서 · 3~6 스테이지 =====================
function bgOffice(c, t) {
  R(c, 0, 0, LW, LH, '#9aa8b8'); for (let y = 0; y < LH; y += 12) for (let x = (y / 12 % 2) * 12; x < LW; x += 24) R(c, x, y, 12, 12, '#93a1b2');
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const x = 30 + i * 74, y = 30 + r * 70; R(c, x, y, 56, 26, '#c8a878'); R(c, x + 4, y + 2, 18, 12, '#2a3446'); R(c, x + 6, y + 4, 14, 8, '#4a6a8a'); R(c, x + 30, y + 6, 14, 10, '#f2f2f2'); R(c, x + 20, y + 30, 16, 12, '#3a3a4a'); }
}
function DogAfter2() {
  return Cutscene([
    { n: '', t: '계단을 올라, 강아지 로봇은 드디어 주인이 일하던 자리가 있는 사무실에 도착했다.', bg: bgOffice },
    { n: '', t: '이 사무실에는 주인의 자리뿐만이 아닌, 수많은 지정석이 있었다.' },
    { n: '강아지 로봇', p: 'dog', t: '주인님 자리가 어디였더라...? 냄새를 따라가 보자!' },
    { n: '', t: '강아지 로봇은 지정석 사이를 돌아다니며 주인이 일하던 자리를 찾기 시작했다.' },
  ], () => DogStage3());
}

// ---------- 3 스테이지: 사무실 미로 (10개 맵 중 랜덤) ----------
const OFFICE_SEEDS = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1010];
function DogStage3() {
  const S = {}; const TS = 18, OX = 33, OY = 24;
  const mi = irnd(0, 9), rand = seeded(OFFICE_SEEDS[mi]);
  const mz = makeMaze(11, 6, rand); const m = mz.m;
  for (let y = 1; y < mz.TH - 1; y += 2) for (let x = 1; x < mz.TW - 1; x += 2) if (rand() < 0.5) { const open = mz.D.filter(([dx, dy]) => m[y + dy][x + dx] === 0); if (open.length === 1) { const c = mz.D.filter(([dx, dy]) => m[y + dy][x + dx] === 1 && x + dx * 2 > 0 && y + dy * 2 > 0 && x + dx * 2 < mz.TW - 1 && y + dy * 2 < mz.TH - 1); if (c.length) { const [dx, dy] = c[Math.floor(rand() * c.length)]; m[y + dy][x + dx] = 0; } } }
  const goalCands = []; for (let cy = 0; cy < 6; cy++) for (let cx = 6; cx < 11; cx++) if (cx + cy > 9) goalCands.push([cx, cy]);
  const [gcx, gcy] = goalCands[Math.floor(rand() * goalCands.length)];
  const gx = OX + (gcx * 2 + 1.5) * TS, gy = OY + (gcy * 2 + 1.5) * TS;
  let px = OX + 1.5 * TS, py = OY + 1.5 * TS, mode = 'howto', endT = 0, face = 1;
  const cns = []; { const open = []; for (let y = 1; y < mz.TH - 1; y++) for (let x = 1; x < mz.TW - 1; x++) if (m[y][x] === 0 && x + y > 4) open.push([x, y]); for (let i = 0; i < 8 && open.length; i++) { const [cx, cy] = open.splice(Math.floor(Math.random() * open.length), 1)[0]; cns.push({ x: OX + (cx + 0.5) * TS, y: OY + (cy + 0.5) * TS }); } }
  const solid = (x, y) => { const tx = Math.floor((x - OX) / TS), ty = Math.floor((y - OY) / TS); return !m[ty] || m[ty][tx] !== 0; };
  S.key = k => { if (mode === 'howto' && (k === 'space' || k === 'enter')) { SFX.click(); mode = 'play'; } };
  S.click = () => { if (mode === 'howto') S.key('space'); };
  S.update = dt => {
    if (mode === 'clear') { endT += dt; if (endT > 1.4) { mode = 'done'; go(DogDrawer()); } return; }
    if (mode !== 'play') return;
    const sp = 80 * dt, r = 5; let dx = 0, dy = 0;
    if (keys.w) dy -= sp; if (keys.s) dy += sp; if (keys.a) dx -= sp; if (keys.d) dx += sp;
    if (dx) face = Math.sign(dx);
    if (dx && !solid(px + dx + Math.sign(dx) * r, py - r + 1) && !solid(px + dx + Math.sign(dx) * r, py + r - 1)) px += dx;
    if (dy && !solid(px - r + 1, py + dy + Math.sign(dy) * r) && !solid(px + r - 1, py + dy + Math.sign(dy) * r)) py += dy;
    for (let i = cns.length - 1; i >= 0; i--) if (Math.hypot(px - cns[i].x, py - cns[i].y) < 10) { addCoin(1, cns[i].x * 2, cns[i].y * 2); cns.splice(i, 1); }
    if (Math.hypot(px - gx, py - gy) < 12) { mode = 'clear'; SFX.clear(); }
  };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH);
    R(L, 0, 0, LW, LH, '#5a6474');
    for (let y = 0; y < mz.TH; y++) for (let x = 0; x < mz.TW; x++) {
      const X = OX + x * TS, Y = OY + y * TS;
      if (m[y][x] === 0) { R(L, X, Y, TS, TS, (x + y) % 2 ? '#8e9cb0' : '#94a2b6'); continue; }
      const h = (x * 7 + y * 13) % 5;
      if (x === 0 || y === 0 || x === mz.TW - 1 || y === mz.TH - 1) { R(L, X, Y, TS, TS, '#d8d4c8'); R(L, X, Y + TS - 3, TS, 3, '#b8b4a8'); continue; }
      // 책상(칸 안쪽에 작게) + 강아지 크기에 맞춘 작은 소품
      R(L, X, Y, TS, TS, (x + y) % 2 ? '#8e9cb0' : '#94a2b6');
      R(L, X + 1, Y + 2, TS - 2, TS - 5, '#c8a878'); R(L, X + 1, Y + TS - 4, TS - 2, 2, '#9a7a4a');
      if (h === 0) { R(L, X + 6, Y + 4, 6, 4, '#2a3446'); R(L, X + 7, Y + 5, 4, 2, '#4a7aa8'); R(L, X + 8, Y + 8, 2, 1, '#2a3446'); }
      else if (h === 1) { R(L, X + 5, Y + 5, 5, 4, '#f2f2f2'); R(L, X + 11, Y + 6, 3, 3, '#f2f2f2'); }
      else if (h === 2) { R(L, X + 7, Y + 4, 3, 4, '#3aa860'); R(L, X + 7, Y + 8, 3, 2, '#8a5a3a'); }
      else if (h === 3) { R(L, X + 4, Y + 5, 9, 1, '#7a8a9a'); R(L, X + 4, Y + 8, 6, 1, '#7a8a9a'); }
      else { R(L, X + 10, Y + 5, 3, 4, '#e8e0d0'); R(L, X + 11, Y + 6, 1, 1, '#6a3a1a'); }
    }
    // 주인 자리
    R(L, gx - 8, gy - 8, 16, 16, '#ffe08a'); const b = Math.sin(S.t * 5) * 2;
    R(L, gx - 1, gy - 22 + b, 2, 12, '#3a2a1a'); R(L, gx + 1, gy - 22 + b, 9, 6, '#ff4a4a'); L.fillStyle = '#3a2a1a'; L.font = 'bold 7px sans-serif'; L.fillText('주인 자리', gx - 15, gy + 15);
    for (const c of cns) { L.save(); L.translate(c.x, c.y + Math.sin(S.t * 5 + c.x) * 1.2); L.scale(Math.abs(Math.cos(S.t * 3 + c.x)) * 0.8 + 0.2, 1); L.drawImage(COIN_IMG, -4, -4, 8, 8); L.restore(); }
    // 위치 표시 아이콘 (로봇 강아지)
    const pb = Math.abs(Math.sin(S.t * 10)) * ((keys.w || keys.a || keys.s || keys.d) && mode === 'play' ? 2 : 0);
    R(L, px - 8, py + 6, 16, 2, '#0004');
    spr(L, SPR.dog[(keys.w || keys.a || keys.s || keys.d) && mode === 'play' ? ((S.t * 10 | 0) % 2) : 0], px - 10, py - 10 - pb, face < 0);
    blitLo();
    T('3 스테이지 · 주인 자리를 찾아라!  (사무실 배치 ' + (mi + 1) + '번)', W / 2 + 70, 24, 22, '#fff', 'center', FONT_UI, '#000');
    T('W: 위   A: 왼쪽   S: 아래   D: 오른쪽', W / 2, H - 16, 20, '#fff', 'center', FONT_UI, '#000'); if (mode !== 'howto') drawWallet(12, H - 54);
    if (mode === 'howto') {
      ctx.fillStyle = 'rgba(0,0,30,.7)'; ctx.fillRect(0, 0, W, H);
      box(W / 2 - 330, 90, 660, 360, '#fff8e6', '#3a2a1a', 6);
      T('3 스테이지 · 사무실 미로', W / 2, 135, 36, '#3a2a1a', 'center');
      [['W', '위로'], ['A', '왼쪽으로'], ['S', '아래로'], ['D', '오른쪽으로']].forEach((s, i) => { const x = W / 2 - 260 + i * 135; box(x, 170, 60, 54, '#3a2a1a', '#ffe08a', 3); T(s[0], x + 30, 198, 30, '#ffe08a', 'center'); T(s[1], x + 30, 245, 20, '#3a2a1a', 'center', FONT_TX); });
      T('로봇 강아지를 움직여서 깃발이 꽂힌 주인 자리까지 가세요.', W / 2, 310, 20, '#7a4a1a', 'center', FONT_TX);
      T('사무실 배치는 10가지 중 하나가 랜덤으로 나와요!', W / 2, 345, 20, '#7a4a1a', 'center', FONT_TX);
      if ((S.t * 2 | 0) % 2) T('스페이스 또는 클릭으로 시작 ▶', W / 2, 410, 24, '#3a2a1a', 'center');
    }
    if (mode === 'clear') T('찾았다!', W / 2, 250, 64, '#ffe08a', 'center', FONT_UI, '#000');
  };
  S.tp = (x, y) => { px = x; py = y; }; S.goal = [gx, gy]; window._o = S;
  return Pausable(S, () => mode === 'play');
}
function DogDrawer() {
  const bg = (c, t, st) => {
    R(c, 0, 0, LW, LH, '#8a9aa8'); R(c, 60, 120, 360, 150, '#c8a878'); R(c, 60, 116, 360, 8, '#d8b888');
    R(c, 300, 60, 80, 56, '#2a3446'); R(c, 304, 64, 72, 46, '#4a7aa8'); R(c, 330, 116, 20, 6, '#333');
    R(c, 100, 90, 30, 26, '#c8a86a'); R(c, 103, 93, 24, 20, '#ffe8c0'); R(c, 107, 100, 4, 4, '#4a2a1a'); R(c, 113, 100, 4, 4, '#2a2018'); R(c, 119, 103, 4, 4, '#2a1a12');
    const o = st.open ? Math.min(40, (t - st.open) * 80) : 0;
    R(c, 90, 140 + o, 160, 36, '#b8986a'); R(c, 160, 154 + o, 20, 4, '#5a4a3a');
    if (st.open && o > 30) { R(c, 110, 150, 40, 30, '#fff8e6'); R(c, 160, 148, 50, 34, '#e8e0c0'); R(c, 164, 152, 42, 26, '#9fd17a'); R(c, 180, 160, 4, 4, '#e8434e'); }
    spr(c, SPR.dog[0], 262, 116 - 16 * 2.6, true, 2.6); // 강아지 로봇을 배경 크기에 맞게 크게
  };
  return Cutscene([
    { n: '', t: '강아지 로봇은 드디어 주인이 일하던 자리를 찾았다!', bg },
    { n: '', t: '주인의 자리를 뒤져 보다가, 서랍 한 칸을 열어 보았다.', fx: st => st.open = st.t || 0.001 },
    { n: '', t: '그 안에는 쪽지 하나와 지도가 들어 있었다.' },
  ], () => LetterScene());
}
function LetterScene() {
  const S = {}; const TXT = '여보, 예나랑 저는 먼저 대피했어요.\n위치는 여기 근처인 서울 야르 대피소예요.\n밖은 위험하니까 당신도 빨리 오세요.\n\n보낸 사람: 로미';
  let n = 0;
  S.enter = () => { try { document.fonts.load('44px "Nanum Pen Script"'); } catch (e) { } };
  S.update = dt => { const b = n; n = Math.min(TXT.length, n + dt * 9); if ((n | 0) !== (b | 0) && TXT[n | 0] !== ' ') SFX.foot(0.04); };
  S.key = k => { if (k === 'space' || k === 'enter') { if (n < TXT.length) n = TXT.length; else { SFX.click(); go(DogAfter3()); } } };
  S.click = () => S.key('space');
  S.draw = () => {
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.02);
    box(-330, -230, 660, 450, '#fff8e6', '#d8c8a0', 3);
    for (let i = 0; i < 9; i++) R(ctx, -300, -150 + i * 44, 600, 2, '#c8d8f0');
    ctx.restore();
    const PF = '"Nanum Pen Script", ' + FONT_TX;
    const lines = []; TXT.slice(0, Math.floor(n)).split('\n').forEach(p => { const w = wrap(p, 590, 44, PF); lines.push(...w); });
    lines.forEach((s, i) => T(s, 175, 108 + i * 44, 44, '#2a2a5a', 'left', PF));
    if (n < TXT.length) { const last = lines[lines.length - 1]; ctx.font = '44px ' + PF; const lx = 170 + ctx.measureText(last).width; R(ctx, lx + 2, 108 + (lines.length - 1) * 44 - 8 + Math.sin(S.t * 20) * 3, 4, 26, '#2a2a5a'); }
    else if ((S.t * 2 | 0) % 2) T('스페이스 또는 클릭 ▶', W / 2, H - 30, 22, '#ffe08a', 'center');
  };
  return S;
}
function DogAfter3() {
  return Cutscene([
    { n: '강아지 로봇', p: 'dog', t: '로미 씨가 쓴 쪽지야! 주인님 가족은 서울 야르 대피소에 있을 거야!', bg: bgOffice },
    { n: '', t: '강아지 로봇은 지도를 챙겨서, 지도에서 야르 대피소를 찾기 시작했다.' },
  ], () => DogStage4());
}

// ---------- 4 스테이지: 지도에서 야르 대피소 찾기 ----------
function DogStage4() {
  const S = {}; const MW = 1800, MH = 1100;
  const rnd2 = seeded(Date.now() & 0xffff);
  const names = ['서울 아르 대피소', '서울 야루 대피소', '부산 야르 대피소', '야르 체육관', '서울 야르 공원', '야르 초등학교', '홍산 대피소', '서울 야르 시장', '야르 병원', '서울 라르 대피소', '야르 도서관', '서울 야르 역', '야르 우체국', '서울 마르 대피소', '야르 소방서', '서울 야르 교회', '야르 주민센터', '서울 야르 주차장', '야르 컴퍼니', '서울 바르 대피소', '야르 마트', '야르 중학교', '서울 야르 대교', '야르 경찰서', '서울 야르 학원', '야르 아파트', '서울 하르 대피소', '야르 놀이터', '서울 야르 은행', '야르 공장', '서울 야르 약국', '야르 미술관'];
  const places = []; const tooClose = (x, y) => places.some(p => Math.hypot(p.x - x, p.y - y) < 120);
  function put(name, target) { for (let k = 0; k < 200; k++) { const x = 80 + rnd2() * (MW - 160), y = 80 + rnd2() * (MH - 160); if (!tooClose(x, y) && Math.abs(y - MH * 0.55) > 50) { places.push({ x, y, name, target, shelter: /대피소/.test(name) }); return; } } }
  put('서울 야르 대피소', true); names.forEach(n => put(n));
  const target = places[0];
  const mcoins = []; for (let i = 0; i < 7; i++) mcoins.push({ x: 60 + rnd2() * (MW - 120), y: 60 + rnd2() * (MH - 120) }); // 지도 곳곳에 숨은 코인 (클릭해서 줍기)
  const hint = { x: target.x + rnd(-80, 80), y: target.y + rnd(-60, 60) };
  const roadsV = [], roadsH = []; for (let x = 120; x < MW; x += 150 + rnd2() * 80) roadsV.push(x); for (let y = 100; y < MH; y += 130 + rnd2() * 60) roadsH.push(y);
  const parks = []; for (let i = 0; i < 7; i++) parks.push([rnd2() * MW, rnd2() * MH, 80 + rnd2() * 120, 60 + rnd2() * 80]);
  let z = Math.min(W / MW, H / MH), cx = MW / 2, cy = MH / 2, drag = null, mode = 'howto', tm = 0, endT = 0, wrong = null;
  const minZ = Math.min(W / MW, H / MH), maxZ = 3;
  const toMap = (sx, sy) => [(sx - W / 2) / z + cx, (sy - H / 2) / z + cy];
  function clampCam() { const hw = W / 2 / z, hh = H / 2 / z; cx = clamp(cx, Math.min(hw, MW / 2), Math.max(MW - hw, MW / 2)); cy = clamp(cy, Math.min(hh, MH / 2), Math.max(MH - hh, MH / 2)); }
  S.wheel = (dy, mx, my) => { if (mode !== 'play') return; const [ax, ay] = toMap(mx, my); z = clamp(z * (dy < 0 ? 1.15 : 1 / 1.15), minZ, maxZ); cx = ax - (mx - W / 2) / z; cy = ay - (my - H / 2) / z; clampCam(); };
  S.mdown = (x, y) => { drag = { x, y, cx, cy, moved: false }; };
  S.move = (x, y) => { if (drag && mouse.down) { if (Math.hypot(x - drag.x, y - drag.y) > 6) drag.moved = true; cx = drag.cx - (x - drag.x) / z; cy = drag.cy - (y - drag.y) / z; clampCam(); } };
  S.mup = () => { };
  S.key = k => { if (mode === 'howto' && (k === 'space' || k === 'enter')) { SFX.click(); mode = 'play'; } };
  S.click = (x, y) => {
    if (mode === 'howto') { S.key('space'); return; }
    if (mode !== 'play' || (drag && drag.moved)) return;
    const [mx, my] = toMap(x, y);
    const ci = mcoins.findIndex(c => Math.hypot(mx - c.x, my - c.y) < 16); if (ci >= 0) { mcoins.splice(ci, 1); addCoin(1, x, y); return; }
    if (Math.hypot(mx - target.x, my - target.y) < 22) { mode = 'clear'; SFX.clear(); return; }
    const p = places.find(p => Math.hypot(mx - p.x, my - p.y) < 22); if (p) { wrong = { p, t: 1.5 }; SFX.bad(); }
  };
  S.update = dt => { if (mode === 'play') tm += dt; if (wrong) { wrong.t -= dt; if (wrong.t <= 0) wrong = null; } if (mode === 'clear') { endT += dt; if (endT > 1.6) { mode = 'done'; go(DogAfter4()); } } };
  S.draw = () => {
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    ctx.fillStyle = '#efe6d2'; ctx.fillRect(0, 0, MW, MH);
    ctx.fillStyle = '#c8e0a8'; parks.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
    ctx.fillStyle = '#9cc8f0'; ctx.beginPath(); ctx.moveTo(0, MH * 0.5); for (let x = 0; x <= MW; x += 50) ctx.lineTo(x, MH * 0.52 + Math.sin(x / 200) * 30); for (let x = MW; x >= 0; x -= 50) ctx.lineTo(x, MH * 0.58 + Math.sin(x / 200) * 30); ctx.fill();
    ctx.fillStyle = '#ffffff'; roadsV.forEach(x => ctx.fillRect(x - 6, 0, 12, MH)); roadsH.forEach(y => ctx.fillRect(0, y - 6, MW, 12));
    ctx.fillStyle = '#f2c46a'; ctx.fillRect(roadsV[3] - 9, 0, 18, MH); ctx.fillRect(0, roadsH[2] - 9, MW, 18);
    ctx.font = '22px ' + FONT_UI; ctx.fillStyle = '#5a8ac0'; ctx.fillText('한 강', MW * 0.7, MH * 0.56);
    for (const p of places) {
      ctx.fillStyle = p.shelter ? '#3a9a5a' : '#c86a4a'; ctx.fillRect(p.x - 9, p.y - 7, 18, 14); ctx.beginPath(); ctx.moveTo(p.x - 12, p.y - 6); ctx.lineTo(p.x, p.y - 16); ctx.lineTo(p.x + 12, p.y - 6); ctx.fill();
      if (p.shelter) { ctx.fillStyle = '#fff'; ctx.fillRect(p.x - 2, p.y - 4, 4, 8); ctx.fillRect(p.x - 4, p.y - 2, 8, 3); }
      ctx.font = '9px ' + FONT_TX; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#efe6d2'; ctx.strokeText(p.name, p.x, p.y + 18); ctx.fillStyle = '#333'; ctx.fillText(p.name, p.x, p.y + 18);
    }
    for (const c of mcoins) { ctx.save(); ctx.translate(c.x, c.y); ctx.scale(Math.abs(Math.cos(S.t * 3 + c.x)) * 0.8 + 0.2, 1); ctx.imageSmoothingEnabled = false; ctx.drawImage(COIN_IMG, -9, -9, 18, 18); ctx.restore(); }
    if (tm > 20 && mode === 'play') { ctx.strokeStyle = 'rgba(255,60,60,' + (0.6 + Math.sin(S.t * 6) * 0.3) + ')'; ctx.lineWidth = 6 / z; ctx.beginPath(); ctx.arc(hint.x, hint.y, 130, 0, Math.PI * 2); ctx.stroke(); }
    if (mode === 'clear') { ctx.strokeStyle = '#ff3a3a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(target.x, target.y, 26 + Math.sin(S.t * 10) * 3, 0, Math.PI * 2); ctx.stroke(); }
    if (wrong) { ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wrong.p.x - 14, wrong.p.y - 14); ctx.lineTo(wrong.p.x + 14, wrong.p.y + 14); ctx.moveTo(wrong.p.x + 14, wrong.p.y - 14); ctx.lineTo(wrong.p.x - 14, wrong.p.y + 14); ctx.stroke(); }
    ctx.restore();
    box(W / 2 - 200, 8, 560, 44, 'rgba(255,248,230,.95)', '#3a2a1a', 3); T("지도에서 '서울 야르 대피소'를 찾아 클릭하세요!", W / 2 + 80, 31, 24, '#3a2a1a', 'center');
    box(W - 150, 60, 140, 34, 'rgba(0,0,0,.6)', '#fff', 2); T('⏱ ' + Math.floor(tm) + '초', W - 80, 78, 20, '#fff', 'center');
    T('마우스 휠 위: 확대 · 아래: 축소 · 드래그: 지도 이동 · 반짝이는 코인도 클릭해서 주울 수 있어요', W / 2, H - 18, 18, '#3a2a1a', 'center', FONT_UI, '#fff'); if (mode !== 'howto') drawWallet(12, H - 100);
    if (tm > 20 && mode === 'play') T('힌트: 빨간 동그라미 근처를 찾아보세요!', W / 2, 75, 22, '#e83a3a', 'center', FONT_UI, '#fff');
    if (wrong) T('여기는 ' + wrong.p.name + '! 다시 찾아보세요', W / 2, H / 2, 30, '#fff', 'center', FONT_UI, '#000');
    if (mode === 'howto') {
      ctx.fillStyle = 'rgba(0,0,30,.7)'; ctx.fillRect(0, 0, W, H);
      box(W / 2 - 330, 100, 660, 340, '#fff8e6', '#3a2a1a', 6);
      T('4 스테이지 · 지도에서 대피소 찾기', W / 2, 145, 34, '#3a2a1a', 'center');
      [['휠 ↑', '지도 확대'], ['휠 ↓', '지도 축소'], ['클릭', '야르 대피소 선택 (드래그로 이동)']].forEach((s, i) => { box(W / 2 - 280, 180 + i * 60, 90, 48, '#3a2a1a', '#ffe08a', 3); T(s[0], W / 2 - 235, 205 + i * 60, 22, '#ffe08a', 'center'); T(s[1], W / 2 - 170, 205 + i * 60, 22, '#3a2a1a', 'left', FONT_TX); });
      T('이름이 비슷한 곳이 많아요! 20초가 지나면 힌트가 나와요.', W / 2, 375, 20, '#7a4a1a', 'center', FONT_TX);
      if ((S.t * 2 | 0) % 2) T('스페이스 또는 클릭으로 시작 ▶', W / 2, 415, 22, '#3a2a1a', 'center');
    }
    if (mode === 'clear') T('찾았다! 서울 야르 대피소!', W / 2, H / 2, 50, '#ffe08a', 'center', FONT_UI, '#000');
  };
  S.target = target; S.tm = v => tm = v; S.view = () => ({ z, cx, cy }); window._map = S;
  return Pausable(S, () => mode === 'play');
}
function DogAfter4() {
  return Cutscene([
    { n: '', t: '지도에서 야르 대피소의 위치를 확인한 강아지 로봇은, 주인이 그곳에 있을 것이라는 확신을 가졌다.', bg: bgCity },
    { n: '', t: '그리고 건물 밖으로 나가, 지도를 보며 텅 빈 도로를 따라 대피소로 달려가기 시작했다.' },
    { n: '강아지 로봇', p: 'dog', t: '조심해야 해... 위에서 뭔가 떨어질지도 몰라!' },
  ], () => DogStage5());
}

// ---------- 5 스테이지: 낙하물 피하며 대피소로 ----------
function DogStage5() {
  const S = {}; const CW = 8, CH = 6, TS = 44;
  const mz = makeMaze(CW, CH); const m = mz.m, TW = mz.TW, TH = mz.TH;
  // 정답 길 찾기 (타일 BFS)
  const prev = new Map(), q = [[1, 1]]; prev.set('1,1', null);
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of mz.D) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (!prev.has(k) && m[ny] && m[ny][nx] === 0) { prev.set(k, [x, y]); q.push([nx, ny]); } } }
  const goal = [TW - 2, TH - 2], onPath = new Set(); { let c = goal; while (c) { onPath.add(c[0] + ',' + c[1]); c = prev.get(c[0] + ',' + c[1]); } }
  const block = new Set();
  for (const k of onPath) { const [x, y] = k.split(',').map(Number); for (const [dx, dy] of mz.D) { const nx = x + dx, ny = y + dy, kk = nx + ',' + ny; if (m[ny][nx] === 0 && !onPath.has(kk)) block.add(kk); } }
  const cns = []; { const ks = [...onPath].filter(k => k !== '1,1' && k !== goal.join(',')); for (let i = 0; i < 10 && ks.length; i++) { const [x, y] = ks.splice(Math.floor(Math.random() * ks.length), 1)[0].split(',').map(Number); cns.push({ x: (x + 0.5) * TS, y: (y + 0.5) * TS }); } }
  let px = 1.5 * TS, py = 1.5 * TS, hearts = 3, inv = 0, shake = 0, mode = 'howto', endT = 0, fall = [], ft = 1.5, face = 0, camX = 0, camY = 0;
  const solid = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); if (!m[ty] || m[ty][tx] !== 0) return true; return block.has(tx + ',' + ty); };
  const DEB = [0, 1, 2].map(k => mk(14, 14, p => { if (k === 0) { p(1, 3, 12, 8, '#8a8a8a'); p(3, 1, 8, 3, '#9a9a9a'); p(2, 10, 10, 3, '#6a6a6a'); } else if (k === 1) { p(2, 2, 10, 10, '#a85a3a'); p(4, 4, 6, 2, '#c87a5a'); p(2, 7, 10, 1, '#7a3a2a'); } else { p(1, 5, 12, 4, '#6a7a8a'); p(5, 1, 4, 12, '#6a7a8a'); p(2, 6, 10, 2, '#8a9aaa'); } }));
  S.key = k => { if (mode === 'howto' && (k === 'space' || k === 'enter')) { SFX.click(); mode = 'play'; } };
  S.click = () => { if (mode === 'howto') S.key('space'); };
  S.update = dt => {
    inv = Math.max(0, inv - dt); shake = Math.max(0, shake - dt);
    camX = lerp(camX, clamp(px - LW / 2, 0, TW * TS - LW), Math.min(1, dt * 8)); camY = lerp(camY, clamp(py - LH / 2, 0, TH * TS - LH), Math.min(1, dt * 8));
    if (mode === 'clear') { endT += dt; if (endT > 1.5) { mode = 'done'; go(DogAfter5()); } return; }
    if (mode !== 'play') return;
    const sp = 95 * dt, r = 7; let dx = 0, dy = 0;
    if (keys.w) dy -= sp; if (keys.s) dy += sp; if (keys.a) dx -= sp; if (keys.d) dx += sp;
    if (dx || dy) face = Math.atan2(dy, dx);
    if (dx && !solid(px + dx + Math.sign(dx) * r, py - r + 1) && !solid(px + dx + Math.sign(dx) * r, py + r - 1)) px += dx;
    if (dy && !solid(px - r + 1, py + dy + Math.sign(dy) * r) && !solid(px + r - 1, py + dy + Math.sign(dy) * r)) py += dy;
    ft -= dt; if (ft <= 0) { ft = rnd(0.7, 1.3); const a = Math.random() * Math.PI * 2, d = rnd(0, 50); fall.push({ x: px + Math.cos(a) * d + Math.cos(face) * 30, y: py + Math.sin(a) * d + Math.sin(face) * 30, t: 0, k: irnd(0, 2) }); }
    for (const f of fall) { f.t += dt; if (f.t >= 1.1 && !f.land) { f.land = true; noise(0.2, 0.15, 500); if (Math.hypot(f.x - px, f.y - py) < 16 && inv <= 0) { hearts--; inv = 1.3; shake = 0.4; SFX.hit(); if (hearts <= 0) { mode = 'over'; go(GameOver('주인을 찾지 못했어요.')); return; } } } }
    fall = fall.filter(f => f.t < 2.2);
    for (let i = cns.length - 1; i >= 0; i--) if (Math.hypot(px - cns[i].x, py - cns[i].y) < 14) { addCoin(1, W / 2, H / 2 - 30); cns.splice(i, 1); }
    if (Math.floor(px / TS) === goal[0] && Math.floor(py / TS) === goal[1]) { mode = 'clear'; SFX.clear(); }
  };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH); L.save(); L.translate(-Math.round(camX) + (shake > 0 ? rnd(-3, 3) : 0), -Math.round(camY));
    R(L, 0, 0, TW * TS, TH * TS, '#5a5a5a');
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const X = x * TS, Y = y * TS;
      if (m[y][x] === 0) { R(L, X, Y, TS, TS, '#6a6a6e'); if (x % 2 === 1 && y % 2 === 0) R(L, X + TS / 2 - 1, Y + 6, 2, 10, '#ddd'); if (y % 2 === 1 && x % 2 === 0) R(L, X + 6, Y + TS / 2 - 1, 10, 2, '#ddd'); continue; }
      const h = (x * 13 + y * 7) % 4; R(L, X, Y, TS, TS, ['#7a8290', '#8a7a6a', '#6a7a8a', '#8a8a7a'][h]); R(L, X + 4, Y + 4, TS - 8, TS - 8, ['#6a7280', '#7a6a5a', '#5a6a7a', '#7a7a6a'][h]);
      if (h === 1) { R(L, X + 10, Y + 12, 10, 8, '#3a3a3a'); } if (h === 2) R(L, X + 8, Y + 8, 6, 6, '#4a5a6a');
    }
    for (const k of block) { const [x, y] = k.split(',').map(Number), X = x * TS, Y = y * TS; for (let i = 0; i < 3; i++) { R(L, X + 4, Y + 8 + i * 12, TS - 8, 6, i % 2 ? '#ffd23a' : '#e8434e'); } R(L, X + 6, Y + 6, 3, 34, '#555'); R(L, X + TS - 9, Y + 6, 3, 34, '#555'); }
    const GX = goal[0] * TS, GY = goal[1] * TS; R(L, GX + 4, GY + 4, TS - 8, TS - 8, '#3a9a5a'); R(L, GX + 14, GY + 16, 16, 22, '#2a2a2a'); L.fillStyle = '#fff'; L.font = 'bold 8px sans-serif'; L.fillText('대피소', GX + 10, GY + 13);
    for (const c of cns) { L.save(); L.translate(c.x, c.y + Math.sin(S.t * 5 + c.x) * 1.5); L.scale(Math.abs(Math.cos(S.t * 3 + c.x)) * 0.8 + 0.2, 1); L.drawImage(COIN_IMG, -6, -6, 12, 12); L.restore(); }
    for (const f of fall) { if (!f.land) { const s = 4 + f.t * 10; L.fillStyle = 'rgba(0,0,0,' + (0.2 + f.t * 0.4) + ')'; L.beginPath(); L.ellipse(f.x, f.y, s, s * 0.6, 0, 0, Math.PI * 2); L.fill(); spr(L, DEB[f.k], f.x - 7, f.y - 7 - (1.1 - f.t) * 200); } else spr(L, DEB[f.k], f.x - 7, f.y - 7); }
    if (!(inv > 0 && (S.t * 12 | 0) % 2)) { L.save(); L.translate(Math.round(px), Math.round(py)); L.drawImage(SPR.dog[(keys.w || keys.a || keys.s || keys.d) ? ((S.t * 10 | 0) % 2) : 0], -10, -12); L.restore(); }
    L.restore(); blitLo();
    // 미니맵
    const mmS = 6, mmW = TW * mmS, mmH = TH * mmS, mx0 = W - mmW - 16, my0 = 60;
    box(mx0 - 6, my0 - 6, mmW + 12, mmH + 12, 'rgba(255,248,230,.95)', '#3a2a1a', 3);
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { if (m[y][x] === 0) R(ctx, mx0 + x * mmS, my0 + y * mmS, mmS, mmS, block.has(x + ',' + y) ? '#e8434e' : '#9a9aa0'); }
    R(ctx, mx0 + goal[0] * mmS - 2, my0 + goal[1] * mmS - 2, mmS + 4, mmS + 4, '#3a9a5a');
    R(ctx, mx0 + px / TS * mmS - 3, my0 + py / TS * mmS - 3, 6, 6, (S.t * 4 | 0) % 2 ? '#2a6aff' : '#fff');
    T('지도', mx0 + mmW / 2, my0 + mmH + 20, 18, '#fff', 'center', FONT_UI, '#000');
    drawHearts(hearts, 3, shake > 0);
    T('5 스테이지 · 대피소로!', 150, 70, 26, '#fff', 'left', FONT_UI, '#000');
    T('W: 앞(위)   A: 왼쪽   S: 뒤(아래)   D: 오른쪽', W / 2, H - 20, 20, '#fff', 'center', FONT_UI, '#000'); if (mode !== 'howto') drawWallet(12, H - 104);
    if (mode === 'howto') {
      ctx.fillStyle = 'rgba(0,0,30,.7)'; ctx.fillRect(0, 0, W, H);
      box(W / 2 - 330, 90, 660, 360, '#fff8e6', '#3a2a1a', 6);
      T('5 스테이지 · 낙하물을 피해 대피소로', W / 2, 135, 32, '#3a2a1a', 'center');
      [['W', '앞'], ['A', '왼쪽'], ['S', '뒤'], ['D', '오른쪽']].forEach((s, i) => { const x = W / 2 - 260 + i * 135; box(x, 170, 60, 54, '#3a2a1a', '#ffe08a', 3); T(s[0], x + 30, 198, 30, '#ffe08a', 'center'); T(s[1], x + 30, 245, 20, '#3a2a1a', 'center', FONT_TX); });
      T('오른쪽 위 지도를 보고 초록색 대피소까지 가세요. 잘못된 길은 막혀 있어요.', W / 2, 300, 19, '#7a4a1a', 'center', FONT_TX);
      T('바닥에 그림자가 커지면 물건이 떨어져요! 하트 3개', W / 2, 335, 19, '#7a4a1a', 'center', FONT_TX);
      if ((S.t * 2 | 0) % 2) T('스페이스 또는 클릭으로 시작 ▶', W / 2, 410, 24, '#3a2a1a', 'center');
    }
    if (mode === 'clear') T('대피소 도착!', W / 2, 250, 64, '#ffe08a', 'center', FONT_UI, '#000');
  };
  S.tp = (x, y) => { px = x; py = y; }; S.goal = goal; S.TS = TS; window._r = S;
  return S;
}
function bgShelter(c, t, st) {
  const back = !!st.back;
  sky(c, back ? '5a6a7a' : '7a8a9a', back ? 'a8a090' : 'c8c0b0'); c.save(); c.translate(0, -45);
  R(c, 0, 60, LW, 140, back ? '#6a6a62' : '#7a7a72'); for (let y = 60; y < 200; y += 14) R(c, 0, y, LW, 1, '#5a5a52'); R(c, 0, 45, LW, 15, back ? '#6a6a62' : '#7a7a72');
  const dx = back ? 286 : 204, dw = back ? 30 : 72, dh = back ? 34 : 46, dy = 200 - dh;
  if (back) { R(c, dx - 4, dy - 12, dw + 8, 10, '#3a4a3a'); c.fillStyle = '#fff'; c.font = 'bold 7px sans-serif'; c.fillText('뒷문', dx + dw / 2 - 7, dy - 4); R(c, 70, 182, 18, 18, '#8a6a3a'); R(c, 72, 185, 14, 1, '#6a4a2a'); R(c, 90, 188, 13, 12, '#7a5a30'); R(c, 170, 192, 24, 8, '#4a4a52'); }
  else { R(c, 178, 122, 124, 16, '#2a5a3a'); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.fillText('서울 야르 대피소', 198, 134); R(c, dx - 6, dy - 3, dw + 12, 3, '#4a4a42'); }
  R(c, dx, dy, dw, dh, '#2a2a2a'); if (st.open) { const k = clamp((t - st.open) / 0.8, 0, 1); R(c, dx + 2, dy + 2, dw - 4, dh - 2, k > 0.5 ? '#e8d49a' : '#5a5040'); R(c, dx + 4, dy + dh - 6, dw - 8, 6, '#f2e2b0'); }
  const hw = dw / 2, close = st.close ? Math.max(0, 1 - (t - st.close) * 1.2) : 1, half = st.close ? hw * (1 - close) : 0;
  R(c, dx, dy, half, dh, '#5a6a5a'); R(c, dx + dw - half, dy, half, dh, '#5a6a5a');
  if (half > 4) { R(c, dx + half - 3, dy + dh * 0.45, 2, 8, '#333'); R(c, dx + dw - half + 1, dy + dh * 0.45, 2, 8, '#333'); }
  const fx = dx + dw / 2 - 26;
  if (st.fam && st.open && t - st.open > 0.4) { const k = clamp((t - st.open - 0.6) / 1.2, 0, 1); spr(c, personSpr({ hair: '#4a2a1a', shirt: '#f0a8c0', pants: '#6a4a7a' }, (t * 6 | 0) % 2), fx + 15, 176 + k * 4); spr(c, personSpr({ hair: '#2a1a12', shirt: '#ffd23a' }, (t * 6 | 0) % 2), fx + 35 + k * 6, 180); spr(c, personSpr({ hair: '#2a2018', shirt: '#6a7a8c' }, 0), fx - 5, 176); }
  R(c, 0, 200, LW, 120, back ? '#7a7a72' : '#8a8a82');
  const sold = personSpr({ hat: 'helmet', shirt: '#5b6b3a', pants: '#3e4a26' }, 0);
  if (back) { spr(c, sold, dx + dw + 8, 178, true); R(c, dx + dw + 4, 188, 10, 2, '#222'); }
  else { spr(c, sold, dx - 22, 178, false); spr(c, sold, dx + dw + 6, 178, true); R(c, dx - 10, 188, 10, 2, '#222'); R(c, dx + dw + 2, 188, 10, 2, '#222'); }
  let gx = 236;
  if (back) {
    const k = st.sneak ? clamp((t - st.sneak) / 3, 0, 1) : 1; gx = lerp(70, 262, k);
    // 해피엔딩: 열린 문 안으로 걸어 들어가기
    const k2 = st.go ? clamp((t - st.go) / 1.6, 0, 1) : 0; if (st.go) gx = lerp(262, dx + dw / 2 - 8, k2);
    if (k2 < 1) spr(c, SPR.dog[(k < 1 || (st.go && k2 < 1)) ? (t * 6 | 0) % 2 : 0], gx, 186 - (k < 1 && gx < 120 ? 8 : 0), false);
  }
  else spr(c, SPR.dog[0], gx, 186, false);
  c.restore();
}
function DogAfter5() {
  return Cutscene([
    { n: '', t: '강아지 로봇은 장애물과 낙하물을 피하며 마침내 대피소에 도착했다.', bg: bgShelter },
    { n: '', t: '대피소 입구에는 무장을 하고 있는 두 명의 군인이 있었다.' },
    { n: '강아지 로봇', p: 'dog', t: '(뭐라고 설명해야 대피소 안으로 들어갈 수 있을까...?)' },
  ], () => DogStage6());
}

// ---------- 6 스테이지: 선택지 게임 ----------
function DogStage6() {
  const S = {};
  const Q = [
    { who: '군인 1', q: '멈춰! 이곳은 허가된 사람만 들어올 수 있는 대피소다. 넌 뭐지?', c: ['저는 주인을 찾고 있는 강아지 로봇이에요. 주인 가족이 이 대피소에 있어요.', '비켜요! 안 비키면 물어 버릴 거예요! 왈왈!'], a: 0, bad: '위험한 로봇이다! 당장 돌아가!' },
    { who: '군인 2', q: '주인이 여기 있다는 건 어떻게 알지?', c: ['그냥 느낌이 그래요. AI의 감은 틀린 적이 없거든요!', '주인 회사 책상 서랍에서 쪽지를 찾았어요. 서울 야르 대피소로 오라고 적혀 있었어요.'], a: 1, bad: '근거도 없는 말을 어떻게 믿나? 돌아가라!' },
    { who: '군인 1', q: '그 가족 이름을 말해 봐라.', c: ['로미 씨랑 딸 예나예요!', '음... 김철수? 아니면 이영희였나?'], a: 0, bad: '이름도 모르면서 가족이라고? 돌아가!' },
  ];
  let qi = 0, sel = 0, mode = 'q', msgT = 0, cold = 0;
  const COLD = [['군인 2', '쪽지는 길에서 누구나 주울 수 있지. 확인할 수 없는 말만으로는 문을 열어 줄 수 없다.'], ['군인 1', '규칙은 규칙이다. 돌아가라.'],
    ['', '그러던 로봇 강아지는 대피소 주변을 서성이다가, 대피소의 뒷문을 발견하게 된다.'], ['', '뒷문에는 앞문에 비해서 군인이 얼마 없었다. 그래서 로봇 강아지는 군인들의 시선을 피해서 뒷문으로 접근하기 시작한다.'],
    ['뒷문 군인', '거기 누구냐! ...앞문에서 쫓겨났다던 그 로봇이군.']];
  const st = {};
  const finalQ = () => ({ who: '강아지 로봇', q: '(뒷문 군인에게 들켰다... 어떻게 하지?)', c: G.pendant ? ['제발요... 한 번만 확인해 주세요!', '알겠어요... 돌아갈게요.', '(펜던트를 보여준다.)'] : ['제발요... 한 번만 확인해 주세요!', '알겠어요... 돌아갈게요.'], final: true });
  const cur = () => qi < Q.length ? Q[qi] : finalQ();
  const boxes = () => { const n = cur().c.length; return cur().c.map((_, i) => ({ x: 60, y: 238 + i * (n > 2 ? 66 : 88), w: W - 120, h: n > 2 ? 60 : 78 })); };
  function decide() {
    const q = cur(); SFX.click();
    if (q.final) {
      if (sel === 2) { go(HappyEnding()); } else go(SadEnding());
      mode = 'done'; return;
    }
    if (sel === q.a) { SFX.ok(); addCoin(2, W / 2, 300); qi++; sel = 0; if (qi === Q.length) { mode = 'cold'; msgT = 0; cold = 0; } }
    else { SFX.bad(); mode = 'wrong'; msgT = 0; }
  }
  S.key = k => {
    if (mode === 'cold') { if (k === 'space' || k === 'enter') { cold++; SFX.click(); if (cold === 2) { st.back = 1; st.sneak = S.t; } if (cold >= COLD.length) mode = 'q'; } return; }
    if (mode !== 'q') return;
    const n = cur().c.length;
    if (k === '1') { sel = 0; SFX.turn(); } if (k === '2') { sel = 1; SFX.turn(); } if (k === '3' && n > 2) { sel = 2; SFX.turn(); }
    if (k === 'space') decide();
  };
  S.click = (x, y) => {
    if (mode === 'cold') { S.key('space'); return; }
    if (mode !== 'q') return;
    boxes().forEach((b, i) => { if (inside(x, y, b)) { if (sel === i) decide(); else { sel = i; SFX.turn(); } } });
  };
  S.update = dt => { if (mode === 'wrong') { msgT += dt; if (msgT > 2.2) { qi = 0; sel = 0; mode = 'q'; } } };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH); bgShelter(L, S.t, st); blitLo();
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H);
    T('6 스테이지 · 군인을 설득하라', W / 2, 30, 26, '#fff', 'center', FONT_UI, '#000');
    if (mode === 'cold') {
      const l = COLD[Math.min(cold, COLD.length - 1)];
      if (l[0]) { drawPortrait('soldier', W - 280, 100, 2.5); box(20, 380, W - 40, 140, 'rgba(255,250,236,.96)', '#3a2a1a', 4); T(l[0], 50, 360, 24, '#ffe08a', 'left', FONT_UI, '#3a2a1a'); }
      else box(20, 380, W - 40, 140, 'rgba(10,10,20,.88)', '#9aa4c8', 4);
      wrap(l[1], W - 110, 25).forEach((s, j) => T(s, 50, 420 + j * 32, 25, l[0] ? '#2a1d12' : '#e8ecff', 'left', FONT_TX));
      if ((S.t * 2 | 0) % 2) T('▼ 스페이스', W - 110, 495, 20, l[0] ? '#3a2a1a' : '#fff', 'center');
      return;
    }
    const q = cur();
    box(40, 60, W - 80, 150, 'rgba(255,250,236,.96)', '#3a2a1a', 4);
    box(52, 68, 136, 136, '#d8e4f0'); drawPortrait(q.who === '강아지 로봇' ? 'dog' : 'soldier', 54, 70, 1.4, 94);
    T(q.who, 210, 92, 26, '#7a4a1a', 'left');
    wrap(q.q, W - 300, 25).forEach((s, j) => T(s, 210, 132 + j * 32, 25, '#2a1d12', 'left', FONT_TX));
    if (!q.final) T('질문 ' + (qi + 1) + ' / ' + Q.length, W - 70, 82, 18, '#9a7a5a', 'right');
    boxes().forEach((b, i) => {
      const s = sel === i, h = inside(mouse.x, mouse.y, b);
      box(b.x, b.y, b.w, b.h, s ? '#ffe08a' : h ? '#3a3a6a' : 'rgba(30,30,60,.9)', s ? '#fff' : '#9aa4c8', s ? 5 : 3);
      T((i + 1) + '', b.x + 34, b.y + b.h / 2, 30, s ? '#3a2a1a' : '#ffe08a', 'center');
      { const ls = wrap(q.c[i], b.w - 130, 22, FONT_TX).slice(0, 2); ls.forEach((t2, j) => T(t2, b.x + 66, b.y + b.h / 2 + (j - (ls.length - 1) / 2) * 27, 22, s ? '#3a2a1a' : '#fff', 'left', FONT_TX)); }
      if (s) T('◀', b.x + b.w - 30, b.y + b.h / 2, 24, '#3a2a1a', 'center');
    });
    T('숫자 1 · 2' + (q.c.length > 2 ? ' · 3' : '') + ': 선택 바꾸기     SPACE: 결정 (마우스: 한 번 클릭 선택, 두 번 클릭 결정)', W / 2, H - 20, 19, '#fff', 'center', FONT_UI, '#000');
    if (mode === 'wrong') {
      ctx.fillStyle = 'rgba(120,0,0,.7)'; ctx.fillRect(0, 0, W, H);
      T(Q[qi].bad, W / 2, 230, 34, '#fff', 'center', FONT_UI, '#000'); T('오답! 처음 질문부터 다시 시작해요', W / 2, 300, 26, '#ffd0d0', 'center', FONT_UI, '#000');
    }
    if (mode === 'q') drawWallet(W - 208, 10);
  };
  return Pausable(S, () => mode === 'q');
}
function SadEnding() {
  const B = (c, t, st) => { st.back = 1; bgShelter(c, t, st); };
  return Cutscene([
    { n: '', t: '군인에게 자신의 사정을 말한 강아지 로봇은 군인들의 반응을 살폈다.', bg: B },
    { n: '뒷문 군인', p: 'soldier', r: 1, t: '...미안하다.' },
    { n: '', t: '군인들은 매정했다. 군인들은 대피소의 문을 닫았다.', fx: st => st.close = st.t || 0.001 },
    { n: '강아지 로봇', p: 'dog', t: '주인님...' },
  ], () => Ending('새드 엔딩', '강아지 로봇은 닫힌 문 앞에 홀로 남았어요...\n\n힌트: 1 스테이지 쓰레기 매립장 어딘가에\n가족의 소중한 물건이 숨어 있어요. 반짝이는 곳을 잘 보세요!', '#9ab4ff', (c, t) => bgShelter(c, t, { close: -10, back: 1 })));
}
// 대피소 안 (해피엔딩): 강아지 로봇이 들어와서 가족을 만난다
function bgShelterIn(c, t, st) {
  R(c, 0, 0, LW, LH, '#8a8a80'); R(c, 0, 105, LW, LH, '#a8a49a'); c.save(); c.translate(0, -45); for (let y = 0; y < 150; y += 16) R(c, 0, y, LW, 1, '#7a7a70');
  for (let i = 0; i < 4; i++) { R(c, 40 + i * 120, 50, 50, 4, '#f4f4e8'); R(c, 40 + i * 120, 54, 50, 2, '#ffffff60'); }
  R(c, 160, 70, 150, 20, '#2a5a3a'); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.fillText('서울 야르 대피소 · 실내', 176, 84);
  R(c, 14, 92, 34, 58, '#5a5040'); R(c, 17, 95, 28, 55, '#e8d49a');
  R(c, 0, 150, LW, 170, '#a8a49a'); for (let x = 0; x < LW; x += 32) R(c, x, 150, 1, 170, '#98948a');
  // 다른 대피 주민들, 담요와 간이침대
  const cot = (x, y, col) => { R(c, x, y, 40, 8, col); R(c, x, y + 8, 40, 2, '#5a5a5a'); R(c, x + 2, y + 10, 2, 5, '#5a5a5a'); R(c, x + 36, y + 10, 2, 5, '#5a5a5a'); };
  cot(70, 168, '#6a8ac8'); cot(130, 196, '#c86a6a'); cot(240, 172, '#6ac88a'); cot(90, 220, '#c8b86a');
  spr(c, personSpr({ hair: '#6a6a6a', shirt: '#8a6a4a' }, 0), 80, 146); spr(c, personSpr({ hair: '#2a2a2a', shirt: '#4a7a9a' }, 0), 150, 174, true); spr(c, personSpr({ hair: '#d8d8d8', shirt: '#9b5fc0', pants: '#5a3a70' }, 0), 250, 150);
  R(c, 200, 140, 30, 20, '#b89a6a'); R(c, 204, 136, 8, 6, '#e8e0d0'); R(c, 216, 134, 10, 8, '#4a7ad8');
  // 가족
  const fam = st.meet;
  spr(c, personSpr({ hair: '#4a2a1a', shirt: '#f0a8c0', pants: '#6a4a7a' }, 0), 360, 172, true);
  spr(c, personSpr({ hair: '#2a2018', shirt: '#6a7a8c' }, 0), 400, 170, true);
  spr(c, personSpr({ hair: '#2a1a12', shirt: '#ffd23a' }, fam ? (t * 6 | 0) % 2 : 0), fam ? 336 + Math.sin(t * 6) * 3 : 384, fam ? 180 : 184, !fam);
  // 강아지 로봇이 문에서 가족에게 달려감
  const k = st.run ? clamp((t - st.run) / 2.4, 0, 1) : 0, x = lerp(22, 318, k);
  spr(c, SPR.dog[k < 1 ? (t * 8 | 0) % 2 : 0], x, 190 - (k < 1 ? Math.abs(Math.sin(t * 10)) * 3 : 0), false);
  if (fam) for (let i = 0; i < 3; i++) { const q = (t * 0.6 + i / 3) % 1; c.globalAlpha = 1 - q; R(c, 330 + i * 18, 170 - q * 40, 4, 3, '#ff6a8a'); R(c, 331 + i * 18, 169 - q * 40, 2, 1, '#ff6a8a'); c.globalAlpha = 1; }
  c.restore();
}
function HappyEnding() {
  const B = (c, t, st) => { st.back = 1; bgShelter(c, t, st); };
  return Cutscene([
    { n: '', t: '강아지 로봇은 펜던트를 열어 군인들에게 보여주었다. 그 안에는 가족과 강아지 로봇이 함께 찍은 사진이 있었다.', bg: B },
    { n: '뒷문 군인', p: 'soldier', r: 1, t: '이 사진... 안에 있는 그 가족이 맞군. 진짜 가족이었구나.' },
    { n: '뒷문 군인', p: 'soldier', r: 1, t: '확인됐다. 문을 열어라!', fx: st => st.open = st.t || 0.001 },
    { n: '', t: '강아지 로봇은 열린 문을 지나 대피소 안으로 들어갔다.', fx: st => st.go = st.t || 0.001 },
    { n: '', t: '대피소 안에는 폭풍을 피해 온 사람들이 가득했다. 강아지 로봇은 사람들 사이를 두리번거리며 가족을 찾았다. 그리고...', bg: bgShelterIn, fx: st => st.run = st.t || 0.001 },
    { n: '예나', p: 'yena', r: 1, t: '우리 강아지다!!! 어떻게 여기까지 왔어?!', fx: st => st.meet = 1 },
    { n: '로미', p: 'romi', r: 1, t: '세상에... 그 먼 길을 혼자 찾아왔구나.' },
    { n: '주인', p: 'owner', r: 1, t: '펜던트를 아직도 가지고 있었구나. 고마워, 우리 가족이 다시 모였어.' },
    { n: '강아지 로봇', p: 'dog', t: '주인님! 드디어 찾았어요!' },
  ], () => Ending('해피 엔딩', '강아지 로봇은 대피소 안에서 가족들을 다시 만났어요!\n\n쪽지와 지도, 그리고 펜던트라는 확실한 증거 덕분에\n군인들도 강아지 로봇의 말을 믿을 수 있었답니다.', '#ffe08a', bgHome));
}
