// ===================== 주인을 찾아서 · 1~2 스테이지 =====================
function dogSpr(f, slide) {
  return mk(20, 16, p => {
    const w = '#f2f2f6', wd = '#c5c8d4', o = '#ff9c3a', dk = '#262a36', gl = '#7cf2c6', rd = '#e8434e';
    if (slide) {
      p(0, 9, 3, 2, o); p(2, 10, 14, 4, w); p(2, 13, 14, 1, wd); p(13, 7, 7, 6, w); p(14, 8, 5, 3, dk); p(17, 9, 1, 1, gl); p(19, 11, 1, 1, dk); p(12, 6, 3, 2, o); p(12, 12, 4, 1, rd);
      p(1, 14, 4, 2, wd); p(13, 14, 5, 2, wd); return;
    }
    p(0, 3, 2, 2, o); p(1, 4, 2, 3, o);
    p(3, 6, 11, 6, w); p(3, 11, 11, 1, wd); p(6, 7, 3, 1, '#ffffff');
    p(12, 1, 7, 7, w); p(13, 2, 5, 3, dk); p(16, 3, 1, 1, gl); p(17, 5, 3, 2, w); p(19, 5, 1, 1, dk);
    p(12, 0, 2, 3, o); p(12, 1, 1, 3, '#d06f12'); p(12, 7, 4, 2, rd); p(13, 8, 1, 1, '#ffd23a');
    if (f === 0) { p(4, 12, 2, 4, wd); p(11, 12, 2, 4, wd); p(7, 12, 2, 3, w); }
    else if (f === 1) { p(2, 12, 2, 3, wd); p(6, 12, 2, 4, wd); p(10, 12, 2, 3, wd); p(13, 12, 2, 4, wd); }
    else { p(2, 11, 3, 2, wd); p(12, 11, 3, 2, wd); }
  });
}
SPR.dog = [dogSpr(0), dogSpr(1), dogSpr(2), dogSpr(0, 1)];

function bgHome(c, t) {
  R(c, 0, 0, LW, LH, '#f6e2c0'); for (let x = 0; x < LW; x += 16) R(c, x, 0, 8, 150, '#f0d8b0');
  R(c, 0, 150, LW, 120, '#b07a4a'); for (let x = 0; x < LW; x += 40) R(c, x, 150, 2, 120, '#9a6a3a');
  R(c, 310, 70, 54, 36, '#8fd0ff'); R(c, 336, 70, 2, 36, '#fff'); R(c, 310, 87, 54, 2, '#fff'); R(c, 307, 67, 60, 3, '#fff');
  R(c, 330, 120, 20, 30, '#7a5a3a'); R(c, 326, 114, 28, 8, '#5a8a4a'); R(c, 120, 108, 4, 42, '#8a8a8a'); R(c, 114, 102, 16, 8, '#fff2c0');
  prop(c, 80, 70, 0.6, () => {
  R(c, 60, 60, 40, 30, '#c8a86a'); R(c, 64, 64, 32, 22, '#ffe8c0'); [[68, 70, '#4a2a1a'], [78, 70, '#2a2018'], [88, 74, '#2a1a12']].forEach(([x, y, col]) => { R(c, x, y, 5, 5, col); R(c, x, y + 5, 5, 6, '#e88a9a'); });
  });
  R(c, 158, 132, 84, 18, '#c84a5a'); R(c, 158, 124, 84, 9, '#a83a4a'); R(c, 154, 128, 6, 22, '#a83a4a'); R(c, 240, 128, 6, 22, '#a83a4a');
  spr(c, personSpr({ hair: '#4a2a1a', shirt: '#f0a8c0', pants: '#6a4a7a' }, 0), 170, 116); spr(c, personSpr({ hair: '#2a2018', shirt: '#6a7a8c' }, 0), 214, 116, true);
  spr(c, personSpr({ hair: '#2a1a12', shirt: '#ffd23a' }, (t * 4 | 0) % 2), 196 + Math.sin(t * 3) * 14, 140);
  spr(c, SPR.dog[(t * 6 | 0) % 2], 226 + Math.sin(t * 3 + 1) * 14, 148, Math.cos(t * 3 + 1) < 0);
  for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; c.globalAlpha = 1 - k; R(c, 200 + i * 20, 130 - k * 50, 4, 3, '#ff6a8a'); R(c, 201 + i * 20, 129 - k * 50, 2, 1, '#ff6a8a'); c.globalAlpha = 1; }
}
// ---------- 쓰레기 매립장 (실제 매립장 느낌의 픽셀 배경) ----------
const TRASH_COLS = ['#2a2a2e', '#c8c8c0', '#4a6a98', '#4a7a50', '#8aa8b8', '#a84a3a', '#9a7a50', '#b8a850', '#3a3a40', '#d8d8d0'];
const MOUNDS = {};
function mound(w, h, seed, haze) {
  const key = w + '_' + h + '_' + seed + '_' + (haze || 0); if (MOUNDS[key]) return MOUNDS[key];
  const r = seeded(seed * 97 + 13);
  const top = []; for (let x = 0; x < w; x++) { const k = x / w; top.push(h - h * Math.pow(Math.sin(k * Math.PI), 0.8) * (0.85 + 0.15 * Math.sin(k * 9 + seed)) - (r() < 0.3 ? 1 : 0)); }
  const cv2 = mk(w, h, (p, g) => {
    for (let x = 0; x < w; x++) for (let y = Math.floor(top[x]); y < h; y++) { const d = (y - top[x]) / h; p(x, y, 1, 1, d > 0.5 ? '#4a4238' : d > 0.2 ? '#5a5046' : '#6a5e50'); }
    const n = Math.floor(w * h / 18);
    for (let i = 0; i < n; i++) { const x = Math.floor(r() * w), y = top[x] + r() * (h - top[x]) * (r() < 0.6 ? 0.35 : 1); const c = TRASH_COLS[Math.floor(r() * TRASH_COLS.length)], sz = 1 + Math.floor(r() * 3); p(x, Math.floor(y), sz + (r() < 0.3 ? 1 : 0), sz, c); }
    for (let x = 2; x < w - 2; x += 2 + Math.floor(r() * 3)) { const c = TRASH_COLS[Math.floor(r() * TRASH_COLS.length)]; p(x, Math.floor(top[x]) - 2, 2 + Math.floor(r() * 3), 3, c); if (r() < 0.15) { p(x, Math.floor(top[x]) - 4, 4, 4, '#1a1a1a'); p(x + 1, Math.floor(top[x]) - 3, 2, 2, '#5a5046'); } }
    if (haze) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = haze; g.fillRect(0, 0, w, h); }
  });
  return MOUNDS[key] = cv2;
}
function bulldozer(c, x, y) { R(c, x, y + 6, 22, 7, '#e8b830'); R(c, x + 6, y, 10, 7, '#e8b830'); R(c, x + 8, y + 1, 6, 4, '#8ac8e8'); R(c, x - 6, y + 4, 6, 9, '#a8a8a8'); R(c, x + 1, y + 12, 20, 4, '#222'); for (let i = 0; i < 5; i++) R(c, x + 2 + i * 4, y + 13, 2, 2, '#555'); }
function bgLandfill(c, t, scroll) {
  scroll = scroll || 0;
  sky(c, '9a9a8a', 'd8c8a8');
  R(c, 360, 28, 22, 22, '#f0e0b8');
  const far = mound(260, 70, 1, '#c8bca499'), far2 = mound(220, 60, 2, '#c8bca499');
  for (let i = -1; i < 4; i++) { const x = ((i * 230 - scroll * 0.12) % 690 + 690) % 690 - 230; c.drawImage(i % 2 ? far : far2, x, 120); }
  for (let i = 0; i < 4; i++) { const x = (i * 150 + t * 18) % 540 - 30, y = 46 + i * 9 + Math.sin(t * 4 + i) * 3, f = (t * 6 + i) | 0; R(c, x, y, 3, 1, '#f2f2f2'); R(c, x + 4, y, 3, 1, '#f2f2f2'); R(c, x + 3, y + (f % 2), 1, 1, '#f2f2f2'); }
  const mids = [mound(150, 56, 3), mound(120, 46, 4), mound(170, 60, 5)];
  for (let i = -1; i < 5; i++) { const k = ((i % 3) + 3) % 3, x = ((i * 165 - scroll * 0.35) % 825 + 825) % 825 - 170; c.drawImage(mids[k], x, 205 - mids[k].height); if (k === 1) bulldozer(c, x + 48, 205 - mids[k].height + 4); }
  R(c, 0, 205, LW, 65, '#5a4e40');
  for (let x = -20; x < LW + 20; x += 6) { const X = ((x - scroll) % 486 + 486) % 486 - 6; R(c, X, 214, 3, 1, '#4a4034'); R(c, X + 2, 222, 3, 1, '#4a4034'); }
  for (let i = 0; i < 14; i++) { const X = ((i * 41 - scroll) % 574 + 574) % 574 - 40; R(c, X, 236 + (i * 7) % 26, 2 + (i % 3), 2, TRASH_COLS[i % TRASH_COLS.length]); }
  R(c, 0, 205, LW, 1, '#6a5e50');
}
function DogIntro() {
  return Cutscene([
    { n: '', t: 'AI 강아지 로봇은 주인 가족과 함께 행복한 나날을 보내고 있었다.', bg: bgHome },
    { n: '', t: '그러던 어느 날, 눈을 떠 보니... 쓰레기 더미 사이였다.', bg: (c, t) => { bgLandfill(c, t, 0); spr(c, SPR.dog[0], 225, 181, false, 1.5); } },
    { n: '', t: '이곳은 사실, 아무도 없는 쓰레기 매립장이었다.' },
    { n: '강아지 로봇', p: 'dog', t: '여기가 어디지...? 주인님은? 예나는? 왜 아무도 없지...?' },
    { n: '', t: '주변을 두리번거리던 강아지 로봇은 주인을 다시 찾아가기로 마음을 먹었다.' },
    { n: '강아지 로봇', p: 'dog', t: '기다려요, 주인님! 제가 꼭 찾아갈게요!' },
  ], () => DogStage1());
}

// ---------- 1 스테이지: 쿠키런 달리기 ----------
function DogStage1() {
  const S = {}; const GROUND = 210, DX = 70, LEN = 5600, PEND = 2700, DS = 1.5;
  let mode = 'howto', x = 0, v = 150, y = 0, vy = 0, air = false, dbl = false, slide = false, hearts = 3, inv = 0, shake = 0, endT = 0, prompt = 0, gotP = false, missed = false;
  const obs = []; { let ox = 650, prev = ''; while (ox < LEN - 300) { const k = ox / LEN; const opts = ['low', 'tall', 'hang'].filter(t => t !== prev); const type = opts[Math.floor(Math.random() * opts.length)]; if (Math.abs(ox - PEND) > 160) { obs.push({ x: ox, type }); prev = type; } ox += rnd(240, 340) * (1 - k * 0.3); } }
  // 코인: 길 위 또는 점프해야 닿는 높이에 가끔
  const cns = []; for (let cx = 520; cx < LEN - 300; cx += 260 + Math.random() * 260) cns.push({ x: cx, y: Math.random() < 0.5 ? GROUND - 14 : GROUND - 64 });
  function box2(o) { if (o.type === 'low') return { x: o.x, y: GROUND - 16, w: 20, h: 16 }; if (o.type === 'tall') return { x: o.x, y: GROUND - 54, w: 18, h: 54 }; return { x: o.x, y: 0, w: 28, h: GROUND - 14 }; }
  S.key = k => {
    if (mode === 'howto') { if (k === 'space' || k === 'enter') { SFX.click(); mode = 'play'; } return; }
    if (mode !== 'play') return;
    if (k === 'space') { if (!air) { vy = -310; air = true; dbl = false; SFX.jump(); } else if (!dbl) { vy = -290; dbl = true; SFX.jump(); } }
    if (k === 'enter' && prompt > 0 && !gotP) { gotP = true; G.pendant = true; prompt = 0; SFX.ok(); }
  };
  S.click = () => { if (mode === 'howto') S.key('space'); };
  S.update = dt => {
    inv = Math.max(0, inv - dt); shake = Math.max(0, shake - dt);
    if (mode === 'clear') { endT += dt; x += v * dt; if (endT > 1.6) { mode = 'done'; go(G.pendant ? PendantScene(DogAfter1) : DogAfter1()); } return; }
    if (mode !== 'play') return;
    const k = x / LEN; v = 150 + k * 110;
    x += v * dt;
    slide = keys.shift && !air;
    vy += 900 * dt; y += vy * dt; if (y >= 0) { y = 0; vy = 0; air = false; dbl = false; }
    const hb = slide ? { x: x + DX + 3, y: GROUND - 11 + y, w: 24, h: 11 } : { x: x + DX + 5, y: GROUND - 22 + y, w: 21, h: 21 };
    for (const o of obs) {
      if (o.hit) continue; const b = box2(o);
      if (hb.x < b.x + b.w && hb.x + hb.w > b.x && hb.y < b.y + b.h && hb.y + hb.h > b.y && inv <= 0) {
        o.hit = true; hearts--; inv = 1.3; shake = 0.4; SFX.hit(); if (hearts <= 0) { mode = 'over'; go(GameOver('주인을 찾지 못했어요.')); return; }
      }
    }
    for (let i = cns.length - 1; i >= 0; i--) { const c = cns[i]; if (hb.x < c.x + 9 && hb.x + hb.w > c.x - 1 && hb.y < c.y + 9 && hb.y + hb.h > c.y - 1) { cns.splice(i, 1); addCoin(1, (c.x - x) * 2, c.y * 2); } }
    const dp = PEND - (x + DX);
    if (!gotP && dp < 90 && dp > -60) prompt = (dp + 60) / 150; else prompt = 0;
    if (x + DX > LEN) { mode = 'clear'; SFX.clear(); }
  };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH); L.save(); if (shake > 0) L.translate(rnd(-3, 3), 0);
    bgLandfill(L, S.t, x);
    // 펜던트가 숨겨진 쓰레기 더미
    const pxs = PEND - x;
    if (pxs > -120 && pxs < 560) { const pm = mound(80, 34, 9); L.drawImage(pm, pxs - 40, 205 - 34); if (!gotP && (S.t * 3 | 0) % 2) { R(L, pxs, 178, 3, 3, '#ffe85a'); R(L, pxs - 2, 179, 7, 1, '#fff8b0'); R(L, pxs + 1, 176, 1, 7, '#fff8b0'); } }
    // 출구
    const ex = LEN - x + DX; if (ex < 560) { R(L, ex, 120, 8, 92, '#555'); R(L, ex + 60, 120, 8, 92, '#555'); R(L, ex, 112, 68, 14, '#3a6a3a'); L.fillStyle = '#fff'; L.font = '8px sans-serif'; L.fillText('매립장 출구', ex + 12, 122); }
    for (const c of cns) { const sx = c.x - x; if (sx < -10 || sx > 490) continue; L.save(); L.translate(sx + 4, c.y + 4 + Math.sin(S.t * 5 + c.x) * 1.5); L.scale(Math.abs(Math.cos(S.t * 3 + c.x)) * 0.8 + 0.2, 1); L.drawImage(COIN_IMG, -4, -4, 8, 8); L.restore(); }
    for (const o of obs) {
      const sx = o.x - x; if (sx < -40 || sx > 500) continue; const b = box2(o);
      if (o.type === 'low') { R(L, sx, b.y + 5, 12, 11, '#2a2a2e'); R(L, sx + 3, b.y + 3, 5, 3, '#2a2a2e'); R(L, sx + 2, b.y + 6, 3, 2, '#4a4a52'); R(L, sx + 9, b.y + 7, 11, 9, '#e8e8e0'); R(L, sx + 12, b.y + 5, 4, 3, '#e8e8e0'); R(L, sx + 11, b.y + 9, 3, 2, '#c8c8c0'); R(L, sx + 6, b.y + 12, 4, 4, '#c83a3a'); R(L, sx + 6, b.y + 12, 4, 1, '#ddd'); }
      else if (o.type === 'tall') { for (let j = 0; j < 4; j++) { const ty = b.y + 30 + j * 6; R(L, sx, ty, 18, 6, '#1a1a1a'); R(L, sx + 6, ty + 2, 6, 2, '#3a3a3a'); } R(L, sx + 1, b.y + 14, 16, 16, '#b8905a'); R(L, sx + 1, b.y + 21, 16, 1, '#8a6a3a'); R(L, sx + 3, b.y, 12, 14, '#3a6ab8'); R(L, sx + 3, b.y + 3, 12, 1, '#2a4a8a'); R(L, sx + 3, b.y + 9, 12, 1, '#2a4a8a'); }
      else { R(L, sx + 13, 0, 2, b.h - 10, '#777'); for (let j = 0; j < b.h - 10; j += 4) R(L, sx + 12, j, 4, 2, '#555'); R(L, sx, b.h - 10, 28, 10, '#9a6a2a'); R(L, sx + 2, b.h - 8, 24, 2, '#ffd23a'); R(L, sx, b.h - 2, 28, 2, '#5a3a10'); }
    }
    if (!(inv > 0 && (S.t * 12 | 0) % 2)) { const fr = slide ? 3 : air ? 2 : ((S.t * 10) | 0) % 2; spr(L, SPR.dog[fr], DX, GROUND - 24 + y, false, DS); }
    L.restore(); blitLo();
    drawHearts(hearts, 3, shake > 0);
    T('1 스테이지 · 쓰레기 매립장 탈출', W / 2, 30, 28, '#fff', 'center', FONT_UI, '#000');
    box(W / 2 - 200, 52, 400, 14, '#0008', '#fff', 2); R(ctx, W / 2 - 197, 55, 394 * clamp(x / LEN, 0, 1), 8, '#ffd23a');
    T('SPACE: 점프 (공중에서 한 번 더: 더블 점프)     SHIFT: 슬라이딩', W / 2, H - 22, 21, '#fff', 'center', FONT_UI, '#000'); if (mode !== 'howto') drawWallet(12, 80);
    if (prompt > 0) {
      const bx = (PEND - x) * 2 - 40, s = 1 + Math.sin(S.t * 12) * 0.06;
      ctx.save(); ctx.translate(bx + 40, 250); ctx.scale(s, s); box(-56, -28, 112, 56, '#ffe08a', '#3a2a1a', 4); T('ENTER', 0, 1, 30, '#3a2a1a', 'center'); ctx.restore();
      R(ctx, bx - 16, 284, 112 * prompt, 6, '#ffe08a');
    }
    if (mode === 'howto') {
      ctx.fillStyle = 'rgba(0,0,30,.7)'; ctx.fillRect(0, 0, W, H);
      box(W / 2 - 340, 80, 680, 380, '#fff8e6', '#3a2a1a', 6);
      T('1 스테이지 · 쓰레기 매립장 탈출', W / 2, 125, 36, '#3a2a1a', 'center');
      [['SPACE', '점프 (점프 중에 한 번 더 누르면 더블 점프)'], ['SHIFT', '누르고 있으면 슬라이딩 (위에 매달린 장애물 피하기)']].forEach((s, i) => { box(W / 2 - 300, 165 + i * 74, 120, 58, '#3a2a1a', '#ffe08a', 3); T(s[0], W / 2 - 240, 196 + i * 74, 28, '#ffe08a', 'center'); T(s[1], W / 2 - 165, 196 + i * 74, 21, '#3a2a1a', 'left', FONT_TX); });
      T('장애물을 피해 출구까지 달려가세요! 하트 3개 · 점점 빨라져요', W / 2, 340, 21, '#7a4a1a', 'center', FONT_TX);
      T('반짝이는 쓰레기 더미 근처에서 ENTER 버튼이 나오면...?', W / 2, 372, 19, '#a06a2a', 'center', FONT_TX);
      if ((S.t * 2 | 0) % 2) T('스페이스 또는 클릭으로 시작 ▶', W / 2, 420, 24, '#3a2a1a', 'center');
    }
    if (mode === 'clear') T('탈출 성공!', W / 2, 220, 64, '#ffe08a', 'center', FONT_UI, '#000');
  };
  return Pausable(S, () => mode === 'play');
}
// 펜던트 획득 화면 (3초)
const PENDANT_IMG = mk(80, 48, p => {
  const g = '#e8b830', gd = '#a87a10', gl = '#fff2a0';
  const heart = (ox) => { [[6, 0, 10], [22, 0, 10], [3, 3, 16], [21, 3, 16], [2, 6, 36], [2, 10, 36], [3, 14, 34], [5, 18, 30], [8, 22, 24], [11, 26, 18], [14, 30, 12], [17, 34, 6]].forEach(([x, y, w]) => p(ox + x, 8 + y, w, 4, g)); };
  heart(0); heart(40);
  p(4, 14, 32, 24, '#fff8e6'); p(6, 16, 28, 20, '#8fd0ff'); p(6, 30, 28, 6, '#9fd17a');
  p(9, 19, 4, 4, '#4a2a1a'); p(9, 23, 4, 7, '#f0a8c0'); p(15, 18, 4, 4, '#2a2018'); p(15, 22, 4, 8, '#6a7a8c'); p(21, 22, 3, 3, '#2a1a12'); p(21, 25, 3, 5, '#ffd23a'); p(26, 26, 6, 3, '#f2f2f6'); p(30, 24, 3, 3, '#f2f2f6'); p(26, 25, 1, 1, '#ff9c3a'); p(31, 25, 1, 1, '#262a36');
  p(46, 16, 28, 20, gd); p(48, 18, 24, 16, g); p(52, 22, 16, 8, gl); p(36, 6, 8, 3, gd); p(39, 0, 2, 7, gd);
});
function PendantScene(next) {
  const S = {};
  S.update = () => { if (S.t > 3.2 && !S.gone) { S.gone = 1; go(next()); } };
  S.key = k => { if (S.t > 1 && (k === 'space' || k === 'enter')) { S.gone = 1; go(next()); } };
  S.draw = () => {
    ctx.fillStyle = '#1a1420'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2 + S.t * 0.4; ctx.fillStyle = 'rgba(255,220,120,.08)'; ctx.beginPath(); ctx.moveTo(W / 2, 290); ctx.lineTo(W / 2 + Math.cos(a) * 600, 290 + Math.sin(a) * 600); ctx.lineTo(W / 2 + Math.cos(a + 0.12) * 600, 290 + Math.sin(a + 0.12) * 600); ctx.fill(); }
    T('펜던트를 얻었다!', W / 2, 90, 54, '#ffe08a', 'center', FONT_UI, '#000');
    ctx.drawImage(PENDANT_IMG, W / 2 - 240, 150, 480, 288);
    T('강아지 로봇과 가족이 함께 찍은 사진이 들어 있다', W / 2, 480, 24, '#fff', 'center', FONT_TX);
  };
  return S;
}

function bgCity(c, t) {
  sky(c, '8a9aa8', 'd8c8a8');
  for (let i = 0; i < 9; i++) { const x = i * 56 - 10, h = 60 + (i * 47 % 70); R(c, x, 200 - h, 48, h, '#6a7280'); for (let yy = 200 - h + 8; yy < 190; yy += 12) for (let xx = x + 6; xx < x + 44; xx += 12) R(c, xx, yy, 6, 7, (xx + yy) % 3 ? '#3a4250' : '#8a9aa8'); if (i % 3 === 1) R(c, x + 30, 200 - h, 18, 12, '#8a9aa8'); }
  R(c, 330, 50, 90, 150, '#4a5a7a'); for (let yy = 60; yy < 190; yy += 14) for (let xx = 338; xx < 412; xx += 14) R(c, xx, yy, 8, 9, '#2a3a5a'); R(c, 350, 54, 50, 10, '#ffd23a'); c.fillStyle = '#2a2a2a'; c.font = '8px sans-serif'; c.fillText('야르 컴퍼니', 352, 62);
  R(c, 0, 200, LW, 70, '#6a6a6a'); for (let x = 0; x < LW; x += 30) R(c, x, 230, 16, 3, '#ddd');
  R(c, 80, 190, 30, 12, '#8a3a2a'); R(c, 200, 196, 20, 6, '#5a5a5a');
  spr(c, SPR.dog[(t * 8 | 0) % 2], 40 + (t * 50) % 300, 186);
}
function bgStairwell(c, t, h, prog) {
  R(c, 0, 0, LW, LH, '#cfd6cc'); const o = (h || 0) * 0.5;
  for (let i = 0; i < 8; i++) { const y = ((i * 90 + o) % 720) - 100; R(c, 0, y, LW, 3, '#b8c0b4'); }
  for (let i = 0; i < 4; i++) { const y = ((i * 180 + o * 0.8) % 720) - 120; R(c, 40, y, 60, 70, '#8a9aa8'); R(c, 44, y + 4, 52, 62, '#b8d0e8'); R(c, 68, y + 4, 4, 62, '#8a9aa8'); R(c, 380, y + 40, 50, 30, '#3aa860'); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.fillText('비상구', 388, y + 59); }
  const fl = Math.min(6, 1 + Math.floor((prog || 0) * 5.99)); R(c, 8, 26, 44, 30, '#5a6a5a'); c.fillStyle = '#fff'; c.font = 'bold 20px sans-serif'; c.fillText(fl + 'F', 14, 49);
}
function DogAfter1() {
  return Cutscene([
    { n: '', t: '매립장을 벗어나 계속 달리던 강아지 로봇은, 얼마 전까지만 해도 사람들로 북적이던 버려진 폐도시를 발견했다.', bg: bgCity },
    { n: '', t: '폭풍이 이 도시를 휩쓸고 지나간다는 소식에, 사람들은 모두 대피소로 대피해 있는 상황이었다.' },
    { n: '', t: '도시를 돌아다니던 강아지 로봇은 주인이 일하던 회사 건물을 발견했다.' },
    { n: '강아지 로봇', p: 'dog', t: '저기다! 주인님이 일하던 회사!' },
    { n: '', t: '강아지 로봇은 건물 안으로 들어가, 사무실에 가기 위해 계단을 오르기 시작했다.', bg: (c, t) => bgStairwell(c, t, 0) },
  ], () => DogStage2());
}
function DogStage2() {
  return Stairs({ overMsg: '주인을 찾지 못했어요.',
    title: '2 스테이지 · 회사 계단 오르기', hero: [SPR.dog[0], SPR.dog[1]], heroOff: [10, 16], bg: bgStairwell, stepCol: ['#9aa4a0', '#6a7470'], turnClimbs: true,
    controls: [['A', '방향 바꾸기 + 동시에 한 칸 오르기', '방향 바꾸며 오르기'], ['D', '계단 한 칸 오르기 (누를 때마다 한 칸)', '오르기']],
    onClear: () => DogAfter2(),
  });
}
