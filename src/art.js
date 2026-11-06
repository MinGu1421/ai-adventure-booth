// ===================== 그림 (배경·캐릭터 스프라이트) =====================
// 사람 스프라이트 16x24 (오른쪽을 봄). f = 걷기 프레임(0/1)
function personSpr(o, f) {
  return mk(16, 24, p => {
    const sk = o.skin || '#f3c9a0', hr = o.hair || '#2b1d14', sh = o.shirt || '#4a6fd6', pt = o.pants || '#2a2a3a';
    if (o.hat === 'prop') { p(4, 1, 2, 3, '#e84040'); p(6, 1, 2, 3, '#ffd23a'); p(8, 1, 2, 3, '#3a7ae8'); p(10, 1, 2, 3, '#3ab860'); p(7, 0, 2, 1, '#888'); p(3, 0, 4, 1, '#e84040'); p(9, 0, 4, 1, '#3a7ae8'); } else if (o.hat === 'police') { p(4, 0, 9, 3, '#1b2850'); p(3, 3, 11, 1, '#111a33'); p(7, 1, 2, 1, '#ffd23a'); } else if (o.hat === 'helmet') { p(3, 0, 10, 4, '#56663a'); } else { p(4, 1, 8, 3, hr); }
    p(4, 4, 8, 6, sk); p(4, 4, 2, 3, hr); p(9, 6, 1, 2, '#1d1d2b'); p(11, 8, 1, 1, '#c98a6a');
    p(3, 10, 10, 7, sh); p(5, 10, 6, 1, '#ffffff55');
    if (o.badge) p(9, 12, 2, 2, '#ffd23a');
    p(f ? 2 : 12, 11, 2, 5, sh); p(f ? 2 : 12, 16, 2, 1, sk);
    p(4, 17, 8, 2, pt);
    if (f) { p(3, 19, 3, 4, pt); p(10, 19, 3, 4, pt); p(2, 23, 4, 1, '#111'); p(10, 23, 4, 1, '#111'); }
    else { p(5, 19, 3, 4, pt); p(8, 19, 3, 4, pt); p(5, 23, 4, 1, '#111'); p(8, 23, 4, 1, '#111'); }
  });
}
function aiSpr(f) {
  return mk(16, 24, p => {
    const m = '#c8d2e0', md = '#8c98ac', gl = '#4ef0ff';
    p(7, 0, 2, 3, md); p(6, 0, 4, 1, '#ff5a5a');
    p(3, 3, 11, 9, m); p(12, 3, 2, 9, md); p(4, 5, 8, 5, '#0f1a2b'); p(6, 6, 2, 2, gl); p(9, 6, 2, 2, gl);
    p(4, 12, 9, 7, m); p(11, 12, 2, 7, md); p(6, 14, 4, 3, '#2a3446'); p(7, 15, 1, 1, '#ff5a5a');
    p(f ? 1 : 13, 13, 2, 5, md);
    if (f) { p(4, 19, 3, 4, md); p(10, 19, 3, 4, md); } else { p(5, 19, 3, 4, md); p(9, 19, 3, 4, md); }
    p(f ? 3 : 5, 23, 4, 1, '#2a3446'); p(f ? 10 : 9, 23, 4, 1, '#2a3446');
  });
}
const SPR = {};
SPR.police = [personSpr({ hat: 'police', shirt: '#2a3d6e', pants: '#1b2850', badge: 1 }, 0), personSpr({ hat: 'police', shirt: '#2a3d6e', pants: '#1b2850', badge: 1 }, 1)];
SPR.ai = [aiSpr(0), aiSpr(1)];
SPR.towns = [
  personSpr({ hair: '#6b4a2a', shirt: '#f2c230' }, 0), personSpr({ hair: '#d8d8d8', shirt: '#9b5fc0', pants: '#5a3a70' }, 0),
  personSpr({ hair: '#3b2a1e', shirt: '#5e8c5a' }, 0), personSpr({ hair: '#1a1a24', shirt: '#ffffff' }, 0),
  personSpr({ hair: '#4a2c18', shirt: '#36b0e8', hat: 'prop' }, 0), personSpr({ hair: '#2a2a2a', shirt: '#2f3f8f' }, 0), personSpr({ hair: '#3a2214', shirt: '#2f3f8f', pants: '#2f3f8f' }, 0),
];

// ---------- 공통 배경 조각 ----------
function sky(c, top, bot, bands) {
  bands = bands || 8;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const a = top.match(/\w\w/g).map(h => parseInt(h, 16)), b = bot.match(/\w\w/g).map(h => parseInt(h, 16));
    const col = 'rgb(' + a.map((v, k) => Math.round(lerp(v, b[k], t))).join(',') + ')';
    R(c, 0, i * LH / bands, LW, LH / bands + 1, col);
  }
}
function cloud(c, x, y, s, col) { col = col || '#ffffff'; R(c, x, y + 4 * s, 28 * s, 6 * s, col); R(c, x + 5 * s, y, 12 * s, 6 * s, col); R(c, x + 14 * s, y + 2 * s, 10 * s, 6 * s, col); }
function hills(c, y, amp, col, seed, off, step) {
  step = step || 4; c.fillStyle = col;
  for (let x = 0; x < LW; x += step) { const X = x + off; const h = Math.sin(X * 0.013 + seed) * amp + Math.sin(X * 0.031 + seed * 2) * amp * 0.5; c.fillRect(x, Math.round(y - h), step, LH); }
}
function tree(c, x, y, s, col) { s = s || 1; R(c, x + 4 * s, y + 10 * s, 3 * s, 8 * s, '#6b4226'); R(c, x, y + 3 * s, 11 * s, 9 * s, col || '#3f9a4a'); R(c, x + 2 * s, y, 7 * s, 4 * s, col || '#3f9a4a'); R(c, x + 2 * s, y + 3 * s, 3 * s, 2 * s, '#ffffff30'); }
function house(c, x, y, w, roof, wall) {
  R(c, x, y, w, 26, wall || '#f2e6cc'); R(c, x - 4, y - 10, w + 8, 10, roof || '#3d4f7a'); R(c, x - 6, y - 2, w + 12, 3, roof || '#3d4f7a'); R(c, x - 2, y - 12, w + 4, 3, '#ffffff30');
  R(c, x + 6, y + 8, 8, 8, '#7ec8f0'); R(c, x + w - 16, y + 10, 8, 16, '#7a4a2a'); R(c, x + 9, y + 8, 1, 8, '#fff'); R(c, x + 6, y + 11, 8, 1, '#fff');
}

// ---------- 홍산 야르 동네 ----------
function bgVillage(c, t, st) {
  sky(c, '7ec8ff', 'cdeeff');
  cloud(c, (40 + t * 6) % 520 - 40, 20, 2); cloud(c, (300 + t * 4) % 520 - 40, 36, 1.5);
  c.save(); c.translate(0, -60);
  hills(c, 150, 18, '#7fbf7a', 1, 0); hills(c, 170, 10, '#5fa65e', 3, 0);
  [[20, '#c0503a'], [100, '#3d4f7a'], [190, '#4a7a4a'], [300, '#8a4a7a'], [390, '#3d4f7a']].forEach(([x, r], i) => house(c, x, 150 + (i % 2) * 6, 56, r));
  tree(c, 170, 150, 1.5); tree(c, 360, 146, 1.5); tree(c, 450, 152, 1.4);
  R(c, 0, 190, LW, 140, '#9fd17a'); R(c, 0, 205, LW, 30, '#b8a88a'); for (let x = 0; x < LW; x += 24) R(c, x, 219, 12, 2, '#e8dcc0');
  R(c, 60, 186, 34, 22, '#8a6a4a'); R(c, 62, 188, 30, 10, '#f5e6c0'); c.fillStyle = '#5a3a1a'; c.font = '7px sans-serif'; c.fillText('홍산마켓', 63, 196);
  // 사람들
  const crowd = [[60, 0], [96, 1], [130, 2], [330, 3], [362, 4], [400, 5], [430, 6]];
  crowd.forEach(([x, k], i) => spr(c, SPR.towns[k], x, 196 + (st.buzz ? Math.round(Math.sin(t * 9 + i) * 1.5) : 0), x > 240));
  // AI
  let ax = 236; if (st.flee) { st.fx = (st.fx || 0) + 1; ax += Math.min(400, (t - st.flee) * 160); }
  if (ax < 480) spr(c, SPR.ai[st.flee ? ((t * 8 | 0) % 2) : 0], ax, 192 + (st.flee ? 0 : Math.round(Math.sin(t * 3))), false);
  if (st.live) { R(c, 360, 170, 8, 13, '#222'); R(c, 361, 171, 6, 10, '#6ad1ff'); if ((t * 2 | 0) % 2) R(c, 362, 172, 2, 2, '#f33'); }
  if (st.police) { const px = Math.min(180, -20 + (t - st.police) * 120); spr(c, SPR.police[px < 180 ? (t * 6 | 0) % 2 : 0], px, 196); R(c, 10, 196, 30, 16, '#fff'); R(c, 10, 196, 30, 4, '#2a3d6e'); R(c, 18, 192, 6, 4, (t * 4 | 0) % 2 ? '#f33' : '#33f'); R(c, 12, 210, 6, 6, '#222'); R(c, 32, 210, 6, 6, '#222'); }
  c.restore();
}

// ---------- 산 (계단용 배경, 카메라 y로 시차) ----------
function bgMountain(c, t, camY) {
  camY = camY || 0;
  const k = clamp(camY / 1500, 0, 1);
  sky(c, k > 0.5 ? '5a7ad8' : '6ab8ff', k > 0.5 ? 'f0b080' : 'd8f0ff');
  cloud(c, (60 + t * 5) % 520 - 40, 30 + (camY * 0.05) % 40, 2); cloud(c, (330 + t * 3) % 520 - 40, 70, 1.5, '#ffffffcc');
  const o = camY * 0.15;
  hills(c, 190 + o * 0.5, 50, '#8aa8c8', 2, 0, 3);
  hills(c, 220 + o, 34, '#5f8a6a', 5, 0, 3);
  hills(c, 255 + o * 1.6, 24, '#3f6a48', 7, 0, 3);
  for (let i = 0; i < 9; i++) tree(c, (i * 61 + 13) % LW, 245 + o * 1.6 - (i % 3) * 6, 1.2, '#2f5a38');
}

// ---------- 컷신용 특수 배경 ----------
function bgFact(c, t) {
  sky(c, '1a2240', '2a3a6a');
  for (let i = 0; i < 30; i++) R(c, (i * 97) % LW, (i * 53) % 140, 1, 1, '#fff8');
  c.save(); c.translate(0, -45);
  R(c, 70, 90, 50, 74, '#f4ead2'); R(c, 74, 94, 42, 66, '#c8302c'); R(c, 82, 104, 26, 26, '#f4ead2'); R(c, 90, 112, 10, 10, '#c8302c');
  R(c, 74, 140, 42, 4, '#222'); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.fillText('1889', 80, 155);
  const b = Math.sin(t * 2) * 2;
  R(c, 330, 150 + b, 20, 50, '#e8dcc0'); R(c, 300, 120 + b, 80, 30, '#c87a3a'); R(c, 310, 110 + b, 60, 12, '#c87a3a'); R(c, 316, 126 + b, 8, 6, '#f2c890'); R(c, 350, 116 + b, 8, 6, '#f2c890');
  R(c, 250, 200, 180, 6, '#6a4a2a'); for (let i = 0; i < 12; i++) R(c, 260 + i * 14, 206, 2, 20 + (i % 3) * 8, '#c8b89a');
  c.restore();
}
function bgJail(c, t, st) {
  R(c, 0, 0, LW, LH, '#1d2433'); for (let y = 0; y < LH; y += 16) for (let x = (y / 16 % 2) * 16; x < LW; x += 32) R(c, x, y, 30, 14, '#232c3e');
  const wl = st.drain ? Math.min(190, 120 + (t - st.drain) * 40) : 120 + Math.sin(t * 2) * 3;
  R(c, 0, wl, LW, LH, '#3a7ac8aa'); for (let x = 0; x < LW; x += 20) R(c, x + (t * 20 % 20), wl, 10, 2, '#9fd3ff');
  spr(c, SPR.ai[0], 232, Math.min(wl - 30, 150) + Math.sin(t * 3) * 2, false, 1);
  const broken = st.break && t - st.break > 0.6;
  for (let i = 0; i < 9; i++) {
    const x = 120 + i * 30;
    if (broken && (i === 4 || i === 3)) { R(c, x, 30, 6, 40, '#8a8a9a'); R(c, x + (i === 3 ? -10 : 10), 200, 6, 30, '#8a8a9a'); continue; }
    R(c, x, 30, 6, 210, '#8a8a9a'); R(c, x, 30, 2, 210, '#c0c0d0');
  }
  R(c, 110, 26, 280, 8, '#6a6a7a'); R(c, 110, 236, 280, 8, '#6a6a7a');
  c.fillStyle = '#ff6a6a'; c.font = 'bold 10px sans-serif'; c.fillText('물고문방', 210, 20);
  if (st.break && t - st.break < 0.6) { R(c, 0, 0, LW, LH, '#ffffff' + ((Math.round((0.6 - (t - st.break)) * 400)).toString(16).padStart(2, '0'))); }
}
function bgFree(c, t) {
  sky(c, 'ff9a6a', 'ffe0a0'); R(c, 220, 70, 40, 40, '#fff2c0');
  hills(c, 150, 20, '#c86a5a', 3, t * 20); hills(c, 175, 12, '#8a4a4a', 5, t * 40);
  R(c, 0, 185, LW, 90, '#5a3030');
  spr(c, SPR.ai[(t * 8 | 0) % 2], 200, 161, false);
  for (let i = 0; i < 6; i++) R(c, 190 - i * 8 - (t * 60 % 8), 175 + (i % 2) * 4, 3, 2, '#fff8');
}
