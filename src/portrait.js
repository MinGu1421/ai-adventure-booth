// ---------- 스탠딩 일러스트 (96x144, 사람 비율 · 눈 깜빡임 · 숨쉬기 · 말하기 · 캐릭터별 동작) ----------
const HEXC = new Map();
function hexRGBA(h) {
  let v = HEXC.get(h); if (v) return v;
  const s = h.replace('#', ''); const n = s.length >= 6 ? s : s.split('').map(c => c + c).join('');
  v = [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16), n.length >= 8 ? parseInt(n.slice(6, 8), 16) : 255];
  HEXC.set(h, v); return v;
}
function PB(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const id = g.createImageData(w, h), d = id.data;
  const set = (x, y, col) => {
    x = Math.round(x); y = Math.round(y); if (!col || x < 0 || y < 0 || x >= w || y >= h) return;
    const [r, gg, b, a] = hexRGBA(col), i = (y * w + x) * 4;
    if (a >= 255) { d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255; }
    else { const k = a / 255; d[i] = d[i] * (1 - k) + r * k; d[i + 1] = d[i + 1] * (1 - k) + gg * k; d[i + 2] = d[i + 2] * (1 - k) + b * k; d[i + 3] = Math.max(d[i + 3], a); }
  };
  const rect = (x, y, ww, hh, col) => { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) set(x + i, y + j, col); };
  const line = (x0, y0, x1, y1, th, col, shade) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let s = 0; s <= n; s++) { const t = s / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; for (let j = -th / 2; j < th / 2; j++) for (let i = -th / 2; i < th / 2; i++) if (i * i + j * j <= th * th / 4) set(x + i, y + j, shade && i > th / 5 ? shade : col); } };
  const disc = (cx, cy, r, col) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) set(cx + x, cy + y, col); };
  return { set, rect, line, disc, w, h, done: () => { g.putImageData(id, 0, 0); return c; } };
}
const SKINS = { light: ['#ffe2c8', '#f5c9a3', '#e6b088', '#cf946c', '#a8714e'], tan: ['#f2cfa8', '#e2b386', '#cf9a6c', '#b27c52', '#8a5a38'], old: ['#f6dcc4', '#ebc6a2', '#d9ad86', '#c09070', '#946a4c'] };
const shadeHair = (c) => { const [r, g, b] = hexRGBA(c); const f = (k) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0')).join(''); return [f(1.45), f(1.15), c, f(0.7), f(0.45)]; };

// o: { age: 'adult'|'child'|'old', sex: 'm'|'f', skin, hair, style, eyes, brow, outfit, top, top2, acc, hat, act }
function realHuman(o, st) {
  const P = PB(96, 144), CX = 48;
  const child = o.age === 'child', old = o.age === 'old', fem = o.sex === 'f';
  const S = SKINS[o.skin || (old ? 'old' : 'light')];
  const H = shadeHair(o.hair || '#2b1d14');
  const yT = child ? 20 : 14, yC = child ? 68 : 70, FW = child ? 18 : fem ? 16 : 17.5;
  const yM = yT + 30, E = yT + 31;
  const fw = y => { if (y < yT || y > yC) return -1; if (y <= yM) return FW * Math.sqrt(Math.max(0, 1 - Math.pow((yM - y) / (yM - yT + 3), 2))); const t = (y - yM) / (yC - yM); let w = FW * (1 - (fem || child ? 0.62 : 0.5) * t * t); if (t > 0.82) w *= 1 - (t - 0.82) * 2.6; return Math.max(2, w); };
  const bob = st.breath || 0;
  const SW = child ? 31 : fem ? 34 : old ? 37 : 40, yN = (child ? 80 : 82), yS = yN + 13;
  const bw = y => { if (y < yN - 2) return -1; if (y < yS) { const t = (y - yN + 2) / (yS - yN + 2); return 8 + (SW - 8) * Math.pow(Math.sin(t * Math.PI / 2), 0.7); } return SW + (y - yS) * 0.07; };
  const hairCol = (x, y) => { const n = (x * 3 + (y >> 2) * 5) % 9; if (y < yT + 7 && x > CX - 12 && x < CX - 2 && (x + y) % 3 === 0) return H[0]; return n === 0 ? H[3] : n === 4 ? H[1] : H[2]; };
  const style = o.style || 'short';
  // ----- 뒷머리 -----
  if (style === 'long') for (let y = yT; y < 118; y++) for (let x = CX - FW - 6; x <= CX + FW + 6; x++) { const e = y > 108 ? (y - 108) * 0.8 : 0; if (Math.abs(x - CX) <= FW + 6 - e) P.set(x, y, hairCol(x, y)); }
  if (style === 'pony') { const sw = st.act ? 2 : 0; for (let y = yT + 6; y < yT + 58; y++) { const k = (y - yT - 6) / 52, cx2 = CX + FW + 3 + sw * Math.sin(k * 3), r = 5 - k * 3; for (let x = cx2 - r; x <= cx2 + r; x++) P.set(x, y, hairCol(Math.round(x), y)); } }
  // ----- 몸 / 옷 -----
  const top = o.top || '#4a6fd6', topS = shadeHair(top);
  for (let y = yN - 2; y < 144; y++) { const w = bw(y); for (let x = Math.floor(CX - w); x <= CX + w; x++) { const r = (x - CX) / w; let c = topS[2]; if (r > 0.55) c = topS[3]; if (r > 0.86) c = topS[4]; if (r < -0.8) c = topS[1]; if (y > yS + 4 && Math.abs(Math.abs(x - CX) - (w - 9)) < 0.6) c = topS[3]; P.set(x, y, c); } }
  for (let i = 0; i < 6; i++) { P.set(CX - SW + 11 + i, yS + 10 + i * 2, topS[3]); P.set(CX + SW - 11 - i, yS + 10 + i * 2, topS[4]); }
  // ----- 목 -----
  const NW = child || fem ? 6 : 7.5;
  for (let y = yC - 10; y < yN + 6; y++) for (let x = CX - NW; x <= CX + NW; x++) P.set(x, y, x > CX + 2 ? S[2] : S[1]);
  for (let y = yC - 1; y < yC + 4; y++) for (let x = CX - NW; x <= CX + NW; x++) P.set(x, y, S[3]);
  // ----- 옷깃 -----
  const of = o.outfit || 'tee';
  const neckV = (depth, col, col2) => { for (let y = yN - 2; y < yN + depth; y++) { const w = NW + 1 - (y - yN + 2) * (NW + 1) / (depth + 2); for (let x = CX - w; x <= CX + w; x++) P.set(x, y, x > CX + 1 ? S[2] : S[1]); } if (col) for (let y = yN - 3; y < yN + depth; y++) { const w = NW + 2 - (y - yN + 3) * (NW + 2) / (depth + 3); P.set(CX - w - 1, y, col); P.set(CX - w - 2, y, col2 || col); P.set(CX + w + 1, y, col); P.set(CX + w + 2, y, col2 || col); } };
  if (of === 'tee') { for (let x = CX - NW - 1; x <= CX + NW + 1; x++) P.set(x, yN - 2 + Math.round(Math.pow((x - CX) / (NW + 1), 2) * -1 + 1), topS[3]); }
  if (of === 'collar' || of === 'tie' || of === 'police' || of === 'school' || of === 'ribbon') {
    const sh = o.top2 || '#f4f4f8';
    if (of !== 'collar') { for (let y = yN - 1; y < yN + 30; y++) { const w = 3 + (y - yN) * 0.45; for (let x = CX - w; x <= CX + w; x++) P.set(x, y, Math.abs(x - CX) > w - 1 ? '#00000040' : sh); } }
    for (let i = 0; i < 7; i++) { P.line(CX - NW - 1, yN - 3, CX - 2, yN + 5, 3, sh); P.line(CX + NW + 1, yN - 3, CX + 2, yN + 5, 3, sh, '#c8c8d4'); }
    if (of === 'tie' || of === 'police' || of === 'school') { const tc = o.tie || '#c8303c'; P.rect(CX - 2, yN + 3, 5, 4, shadeHair(tc)[3]); for (let y = yN + 7; y < yN + 36; y++) { const w = 1.5 + (y - yN - 7) * 0.06; for (let x = CX - w; x <= CX + w + 1; x++) P.set(x, y, x > CX ? shadeHair(tc)[3] : tc); } }
    if (of === 'ribbon') { const rc = o.tie || '#d6324a'; for (let i = 0; i < 6; i++) { P.line(CX, yN + 7, CX - 7, yN + 3 + i, 2, rc); P.line(CX, yN + 7, CX + 7, yN + 3 + i, 2, rc, shadeHair(rc)[3]); } P.disc(CX, yN + 7, 2, shadeHair(rc)[3]); P.line(CX - 1, yN + 8, CX - 4, yN + 16, 2, rc); P.line(CX + 1, yN + 8, CX + 4, yN + 16, 2, rc); }
    if (of === 'school' || of === 'police' || of === 'ribbon') { for (let y = yN - 1; y < yN + 42; y++) { const w = 4 + (y - yN) * 0.5; P.set(CX - w - 1, y, topS[4]); P.set(CX + w + 1, y, topS[4]); P.set(CX - w - 2, y, topS[1]); } }
  }
  if (of === 'cardigan') { neckV(10, o.top2 || '#f2e6cc'); for (let y = yN + 8; y < 144; y++) { P.set(CX, y, topS[4]); } for (let i = 0; i < 4; i++) P.disc(CX + 2, yN + 16 + i * 12, 1, '#f2e6cc'); }
  if (of === 'camo') { const r = seeded(77); for (let i = 0; i < 46; i++) { const x = CX - SW + r() * SW * 2, y = yN + r() * 60; if (Math.abs(x - CX) < bw(y) - 1) P.disc(x, y, 1 + (r() * 2 | 0), r() < 0.5 ? '#3e4a26' : '#7a8a50'); } neckV(4, '#3e4a26'); P.rect(CX - 26, yN + 22, 52, 3, '#2e381c'); }
  if (of === 'police') { P.rect(CX - 28, yN + 18, 7, 8, '#ffd23a'); P.rect(CX - 26, yN + 20, 3, 4, '#b8860b'); P.rect(CX - SW + 2, yS - 3, 12, 3, '#ffd23a'); P.rect(CX + SW - 14, yS - 3, 12, 3, '#c9a020'); P.rect(CX + 14, yN + 22, 10, 2, '#9fb8e8'); }
  // ----- 얼굴 -----
  for (let y = yT; y <= yC; y++) { const w = fw(y); for (let x = Math.floor(CX - w); x <= CX + w; x++) { const r = (x - CX) / w; let c = S[1]; if (r > 0.45) c = S[2]; if (r > 0.82) c = S[3]; if (r < -0.82) c = S[2]; if (y > yC - 4) c = r > 0 ? S[3] : S[2]; if (y < yT + 15 && r < -0.15 && r > -0.7) c = S[0]; P.set(x, y, c); } }
  for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) P.set(CX - 12 + x, E + 6 + y, S[0]);
  // 귀
  for (let y = E - 2; y < E + 9; y++) { const k = 1 - Math.abs((y - E - 3) / 6); P.set(CX - FW - 1, y, S[2]); if (k > 0.3) P.set(CX - FW - 2, y, S[1]); P.set(CX + FW + 1, y, S[3]); if (k > 0.3) P.set(CX + FW + 2, y, S[3]); }
  // 눈
  const EX = child ? 8 : 7.5, look = st.look || 0, iris = o.eyes || '#3a2618';
  const eye = (ex, side) => {
    ex = Math.round(ex);
    if (st.blink) { for (let x = ex - 3; x <= ex + 3; x++) P.set(x, E + 1, '#2a1a14'); for (let x = ex - 2; x <= ex + 2; x++) P.set(x, E + 2, S[3]); return; }
    const big = child ? 1 : 0;
    for (let x = ex - 3; x <= ex + 3; x++) for (let y = E - big; y <= E + 2; y++) { if ((x === ex - 3 || x === ex + 3) && (y === E - big || y === E + 2)) continue; P.set(x, y, '#f6f2ee'); }
    for (let y = E - big; y <= E + 2; y++) for (let x = ex - 1 + look; x <= ex + 1 + look; x++) P.set(x, y, iris);
    P.set(ex + look, E + 1, '#120a08'); if (big) P.set(ex + look, E, '#120a08'); P.set(ex - 1 + look, E - big, '#ffffff');
    for (let x = ex - 3; x <= ex + 3; x++) P.set(x, E - 1 - big, '#2a1a14'); P.set(ex + side * 4, E - 1 - big, '#2a1a14'); if (fem) { P.set(ex + side * 4, E - 2 - big, '#2a1a14'); P.set(ex + side * 5, E - 2 - big, '#2a1a14'); }
    for (let x = ex - 2; x <= ex + 2; x++) P.set(x, E + 3, S[2]);
    if (old) { P.set(ex + side * 5, E + 1, S[3]); P.set(ex + side * 5, E + 3, S[3]); for (let x = ex - 2; x <= ex + 2; x++) P.set(x, E + 5, S[2]); }
  };
  eye(CX - EX, -1); eye(CX + EX, 1);
  // 눈썹
  const bc = o.brow || H[3], br = o.browStyle || 'normal';
  for (const side of [-1, 1]) { const ex = CX + side * EX; for (let i = -3; i <= 3; i++) { let y = E - 5 - (Math.abs(i) < 2 ? 1 : 0); if (br === 'sharp') y = E - 5 + Math.round(-i * side * 0.4); if (br === 'up') y -= 1 + (st.act ? 1 : 0); P.set(ex + i, y, bc); if (!fem && !child) P.set(ex + i, y + 1, bc); } }
  // 코
  for (let y = E + 2; y < E + 10; y++) P.set(CX + 2, y, S[2]);
  P.rect(CX - 1, E + 10, 3, 1, S[0]); P.set(CX - 2, E + 11, S[3]); P.set(CX + 2, E + 11, S[4]); P.rect(CX - 1, E + 12, 3, 1, S[2]);
  // 입
  const M = E + 17, lc = fem ? '#c8506a' : '#a8564a', lc2 = fem ? '#e88a9a' : '#c88070';
  const mouth = st.talk ? 'talk' : (st.act && o.actMouth) || o.mouth || 'neutral';
  if (mouth === 'talk' || mouth === 'open') { const h = mouth === 'open' ? 4 : 3; for (let y = M - 1; y < M - 1 + h; y++) for (let x = CX - 4; x <= CX + 4; x++) P.set(x, y, '#5a1a1a'); P.rect(CX - 3, M - 1, 7, 1, '#f4f0ea'); P.rect(CX - 3, M - 1 + h, 7, 1, lc2); P.rect(CX - 3, M - 2, 7, 1, lc); }
  else {
    P.rect(CX - 4, M, 9, 1, lc); P.rect(CX - 3, M + 1, 7, 1, lc2); P.rect(CX - 2, M + 2, 5, 1, S[2]);
    if (mouth === 'smile' || mouth === 'grin') { P.set(CX - 5, M - 1, lc); P.set(CX + 5, M - 1, lc); }
    if (mouth === 'grin') { P.rect(CX - 3, M, 7, 1, '#f4f0ea'); }
    if (mouth === 'frown') { P.set(CX - 5, M + 1, lc); P.set(CX + 5, M + 1, lc); }
  }
  if (fem || child) { P.rect(CX - 13, E + 7, 4, 2, '#f08a8a55'); P.rect(CX + 10, E + 7, 4, 2, '#f08a8a55'); }
  if (old) { P.line(CX - 8, E + 11, CX - 6, E + 18, 1, S[3]); P.line(CX + 8, E + 11, CX + 6, E + 18, 1, S[3]); P.rect(CX - 6, yT + 9, 12, 1, S[2]); P.rect(CX - 5, yT + 12, 10, 1, S[2]); }
  if (o.stubble) for (let y = M - 3; y < yC; y++) { const w = fw(y); for (let x = CX - w + 2; x <= CX + w - 2; x++) if ((x * 7 + y * 3) % 4 === 0 && Math.abs(y - M) > 1) P.set(x, y, '#3b2a1e55'); }
  // ----- 앞머리 -----
  const cap = (x, y) => { const dx = x - CX, dy = y - (yT + 16), R = FW + 2.5; return dx * dx + dy * dy * 1.15 <= R * R && y < yT + 16; };
  for (let y = yT - 12; y < yC + 4; y++) for (let x = CX - FW - 7; x <= CX + FW + 7; x++) {
    const dx = Math.abs(x - CX); let on = false;
    if (style === 'buzz') on = cap(x, y) && y < yT + 7;
    else if (style === 'bald') on = false;
    else on = cap(x, y);
    if (style === 'short' || style === 'spiky') { if (y >= yT + 4 && y < E - 6 && dx > FW - 2.5 && dx <= FW + 1.5) on = true; if (y >= yT && y < yT + 8 + ((x * 5) % 3) && dx < FW && x < CX + 9) on = true; }
    if (style === 'spiky' && y < yT + 2 && y > yT - 6) { const k = ((x - CX + 40) % 7); if (dx < FW + 1 && y > yT - 6 + Math.abs(k - 3) * 2) on = true; }
    if (style === 'long' || style === 'bob') { if (dx > FW - 3 && dx <= FW + (style === 'long' ? 6 : 4) && y < (style === 'bob' ? yC - 2 : yC + 4) && y >= yT) on = true; if (y >= yT && y < yT + 9 + (x > CX ? -(x - CX) * 0.25 : 0) && dx < FW) on = true; }
    if (style === 'pony' || style === 'bun') { if (y >= yT + 3 && y < E - 4 && dx > FW - 2 && dx <= FW + 1) on = true; if (y >= yT && y < yT + 6 + ((x * 3) % 2) && dx < FW && x < CX + 6) on = true; }
    if (on) P.set(x, y, hairCol(x, y));
  }
  if (style === 'bun') { P.disc(CX, yT - 5, 7, H[2]); P.rect(CX - 4, yT - 9, 5, 2, H[1]); P.rect(CX - 7, yT - 1, 14, 2, H[3]); }
  if (style === 'pony') { P.rect(CX + FW, yT + 5, 3, 4, '#e8506a'); }
  // ----- 모자 -----
  if (o.hat === 'police') { for (let y = yT - 8; y < yT + 8; y++) { const w = FW + 3 + (y - yT + 8) * 0.12; for (let x = CX - w; x <= CX + w; x++) P.set(x, y, x > CX + w * 0.5 ? '#141e40' : '#1f2d5c'); } P.rect(CX - FW - 4, yT + 6, FW * 2 + 9, 3, '#0a0f22'); for (let x = CX - FW - 2; x <= CX + FW + 2; x++) { P.set(x, yT + 9, '#0a0f22'); P.set(x, yT + 10, '#22305a'); } P.rect(CX - 3, yT - 4, 7, 7, '#ffd23a'); P.rect(CX - 1, yT - 2, 3, 3, '#b8860b'); }
  if (o.hat === 'helmet') { for (let y = yT - 10; y < yT + 12; y++) { const t = (y - yT + 10) / 22, w = (FW + 5) * Math.sqrt(Math.min(1, t * 1.6)); for (let x = CX - w; x <= CX + w; x++) P.set(x, y, x > CX + w * 0.5 ? '#3e4a26' : ((x * 5 + y * 3) % 11 === 0 ? '#6e8048' : '#56663a')); } P.rect(CX - FW - 6, yT + 10, FW * 2 + 13, 3, '#2e381c'); P.line(CX - FW - 2, yT + 12, CX - FW + 4, yC - 6, 2, '#2e381c'); P.line(CX + FW + 2, yT + 12, CX + FW - 4, yC - 6, 2, '#2e381c'); }
  if (o.hat === 'propeller') {
    const cols = ['#e84040', '#ffd23a', '#3a7ae8', '#3ab860'];
    for (let y = yT - 9; y < yT + 9; y++) { const t = (y - yT + 9) / 18, w = (FW + 3) * Math.sqrt(Math.min(1, t * 1.4)); for (let x = CX - w; x <= CX + w; x++) { const seg = Math.floor(((x - CX) / (w + 0.01) + 1) * 2) % 4; P.set(x, y, shadeHair(cols[seg])[x > CX + w * 0.5 ? 3 : 2]); } }
    P.rect(CX - FW - 3, yT + 7, FW * 2 + 7, 2, '#c03030');
    P.rect(CX - 1, yT - 15, 3, 7, '#888'); P.disc(CX, yT - 15, 2, '#ffd23a');
    const f = (st.frame || 0) % 4, L2 = [14, 7, 2, 7][f];
    P.rect(CX - L2, yT - 16, L2, 2, '#e84040'); P.rect(CX + 1, yT - 16, L2, 2, '#3a7ae8');
  }
  // ----- 안경 -----
  if (o.acc === 'glasses') { const g = '#1a1a1a'; for (const side of [-1, 1]) { const ex = Math.round(CX + side * EX); for (let x = ex - 5; x <= ex + 5; x++) { P.set(x, E - 3, g); P.set(x, E + 4, g); } for (let y = E - 3; y <= E + 4; y++) { P.set(ex - 5, y, g); P.set(ex + 5, y, g); } P.set(ex - 3, E - 2, '#ffffffaa'); if (st.act && o.glint) { P.set(ex + 2, E - 2, '#fff'); P.set(ex + 3, E - 1, '#fff'); } } P.rect(CX - 2, E - 1, 5, 1, g); P.rect(CX - FW - 1, E - 2, 3, 1, g); P.rect(CX + FW - 1, E - 2, 3, 1, g); }
  // ----- 동작 -----
  if (o.drawAct) o.drawAct(P, st, { CX, yT, yC, E, M, FW, SW, yN, yS, S, topS, H });
  return P.done();
}
function armTo(P, sx, sy, hx, hy, sleeve, skin, th) { P.line(sx, sy, hx, hy + 4, th || 8, sleeve[2], sleeve[3]); P.disc(hx, hy, 4, skin[1]); P.rect(hx - 3, hy - 4, 2, 3, skin[2]); }

function robotAIImg(st) {
  const P = PB(96, 144), m = ['#eef3f9', '#c8d2e0', '#a8b4c6', '#8c98ac', '#5a6478'], dk = '#2a3446', sc = '#0f1a2b', gl = '#4ef0ff';
  P.rect(46, 0, 4, 12, m[3]); P.disc(48, 3, 3, st.act ? '#ffe85a' : (st.frame % 2 ? '#ff5a5a' : '#ff9a9a'));
  for (let y = 66; y < 144; y++) { const w = y < 80 ? 22 + (y - 66) * 1.6 : 44; for (let x = 48 - w; x <= 48 + w; x++) { const r = (x - 48) / w; P.set(x, y, r > 0.6 ? m[3] : r < -0.85 ? m[2] : m[1]); } }
  P.rect(8, 84, 1, 60, m[4]); P.rect(87, 84, 1, 60, m[4]); P.rect(20, 84, 1, 60, m[3]); P.rect(76, 84, 1, 60, m[4]);
  P.rect(32, 86, 32, 22, dk); P.disc(40, 95, 3, '#ff5a5a'); P.disc(56, 95, 3, gl); P.rect(36, 102, 24, 2, (st.frame % 3) ? gl : '#1a8a9a'); P.rect(32, 116, 32, 1, m[3]); P.rect(32, 128, 32, 1, m[3]);
  P.rect(40, 56, 16, 12, dk); P.rect(40, 60, 16, 1, m[3]); P.rect(40, 64, 16, 1, m[3]);
  for (let y = 12; y < 58; y++) for (let x = 24; x <= 72; x++) { if ((x < 27 || x > 69) && (y < 15 || y > 55)) continue; P.set(x, y, x > 66 ? m[3] : x < 27 ? m[2] : y < 15 ? m[0] : m[1]); }
  P.rect(18, 26, 6, 18, m[3]); P.rect(72, 26, 6, 18, m[4]); P.rect(16, 30, 2, 10, dk); P.rect(78, 30, 2, 10, dk);
  P.rect(29, 18, 38, 30, sc); P.rect(30, 19, 36, 1, '#ffffff22');
  if (st.blink) { P.rect(33, 29, 9, 2, gl); P.rect(54, 29, 9, 2, gl); }
  else if (st.act) { for (const ex of [37, 58]) { P.set(ex - 3, 30, gl); P.set(ex - 2, 29, gl); P.set(ex - 1, 28, gl); P.set(ex, 27, gl); P.set(ex + 1, 28, gl); P.set(ex + 2, 29, gl); P.set(ex + 3, 30, gl); } }
  else { P.rect(33, 24, 8, 8, gl); P.rect(55, 24, 8, 8, gl); P.rect(34, 25, 3, 3, '#fff'); P.rect(56, 25, 3, 3, '#fff'); }
  if (st.talk) { P.rect(40, 38, 16, 5, gl); P.rect(42, 39, 12, 3, sc); } else { P.rect(40, 40, 16, 2, gl); P.rect(38, 38, 2, 2, gl); P.rect(56, 38, 2, 2, gl); }
  return P.done();
}
function robotDogImg(st) {
  const P = PB(96, 144), w = ['#ffffff', '#f2f2f6', '#dcdee6', '#c5c8d4', '#9a9eae'], o = '#ff9c3a', od = '#d06f12', dk = '#262a36', gl = '#7cf2c6';
  P.rect(16, 96, 14, 48, w[3]); P.rect(66, 96, 14, 48, w[3]);
  for (let y = 66; y < 144; y++) { const ww = 18 + Math.min(1, (y - 66) / 20) * 6; for (let x = 48 - ww; x <= 48 + ww; x++) P.set(x, y, x > 48 + ww * 0.6 ? w[3] : x < 48 - ww * 0.8 ? w[2] : w[1]); }
  P.rect(32, 70, 8, 24, '#ffffff');
  P.rect(32, 102, 12, 42, w[1]); P.rect(52, 102, 12, 42, w[2]); P.rect(44, 108, 8, 36, w[3]); P.rect(32, 138, 12, 2, w[4]); P.rect(52, 138, 12, 2, w[4]);
  P.rect(28, 60, 40, 6, '#e8434e'); P.disc(48, 70, 4, '#ffd23a'); P.disc(48, 70, 2, '#c79a12');
  const eo = st.act ? 8 : 0;
  for (let y = 0; y < 30; y++) { const ww = 6 - Math.abs(y - 12) * 0.25; P.rect(20 - ww / 2 - (y > 18 ? eo * (y - 18) / 12 : 0), 6 + y + (st.act ? 3 : 0), ww * 2, 1, y > 4 && y < 26 ? od : o); P.rect(76 - ww / 2 + (y > 18 ? eo * (y - 18) / 12 : 0), 6 + y + (st.act ? 3 : 0), ww * 2, 1, y > 4 && y < 26 ? od : o); }
  for (let y = 14; y < 58; y++) for (let x = 26; x <= 70; x++) { if ((x < 29 || x > 67) && (y < 17 || y > 55)) continue; P.set(x, y, x > 63 ? w[3] : w[1]); }
  P.rect(31, 22, 34, 14, dk); P.rect(32, 23, 32, 1, '#ffffff22');
  if (st.blink) { P.rect(35, 29, 8, 2, gl); P.rect(53, 29, 8, 2, gl); } else { P.rect(36, 25, 7, 7, gl); P.rect(53, 25, 7, 7, gl); P.rect(37, 26, 2, 2, '#fff'); P.rect(54, 26, 2, 2, '#fff'); }
  P.rect(37, 38, 22, 16, w[0]); P.rect(43, 38, 10, 6, dk); P.rect(45, 39, 4, 1, '#555c70'); P.rect(47, 44, 2, 4, dk); P.rect(42, 48, 12, 1, dk);
  if (st.talk || st.act) { P.rect(44, 49, 8, st.act ? 7 : 4, '#ff7a8a'); P.rect(47, 49, 2, st.act ? 6 : 3, '#e85a6a'); }
  P.rect(30, 44, 5, 3, '#ffb3c066'); P.rect(61, 44, 5, 3, '#ffb3c066');
  return P.done();
}

// 캐릭터 설정
const CHAR = {
  fool: { sex: 'm', style: 'spiky', hair: '#6b4a2a', mouth: 'open', outfit: 'tee', top: '#f2c230', browStyle: 'up', actMouth: 'open', drawAct: (P, st, k) => { if (!st.act) return; armTo(P, k.CX - k.SW + 4, k.yS + 4, k.CX - k.FW - 4, k.E + 10, k.topS, k.S, 8); armTo(P, k.CX + k.SW - 4, k.yS + 4, k.CX + k.FW + 4, k.E + 10, k.topS, k.S, 8); } },
  granny: { age: 'old', sex: 'f', style: 'bun', hair: '#c8c8c8', mouth: 'open', outfit: 'cardigan', top: '#8a4fb0', top2: '#f2e6cc', browStyle: 'up', eyes: '#4a3a2a', drawAct: (P, st, k) => { if (st.act) armTo(P, k.CX - k.SW + 4, k.yS + 6, k.CX - k.FW + 2, k.E + 12, k.topS, k.S, 8); } },
  adult: { sex: 'm', style: 'short', hair: '#3b2a1e', mouth: 'neutral', outfit: 'collar', top: '#5e8c5a', top2: '#5e8c5a', stubble: 1, drawAct: (P, st, k) => { if (!st.act) return; for (let y = k.yS + 18; y < k.yS + 28; y++) for (let x = k.CX - k.SW + 4; x <= k.CX + k.SW - 4; x++) P.set(x, y, y < k.yS + 20 ? k.topS[1] : y > k.yS + 25 ? k.topS[4] : k.topS[3]); P.disc(k.CX + 18, k.yS + 22, 4, k.S[1]); P.disc(k.CX - 18, k.yS + 24, 4, k.S[2]); } },
  genius: { sex: 'm', style: 'short', hair: '#15151c', mouth: 'neutral', outfit: 'tie', top: '#f4f4f8', top2: '#ffffff', tie: '#c8303c', acc: 'glasses', glint: 1, browStyle: 'sharp', drawAct: (P, st, k) => { if (st.act) armTo(P, k.CX + 8, 144, k.CX, k.E + 6, k.topS, k.S, 8); } },
  kid: { age: 'child', sex: 'm', style: 'short', hair: '#4a2c18', mouth: 'grin', outfit: 'tee', top: '#36b0e8', hat: 'propeller', eyes: '#2a1a10', drawAct: (P, st, k) => { if (!st.act) return; armTo(P, k.CX + k.SW - 4, k.yS + 8, k.CX + 16, k.yS + 4, k.topS, k.S, 8); P.rect(k.CX + 10, k.yS - 12, 12, 20, '#1a1a22'); P.rect(k.CX + 11, k.yS - 11, 10, 16, '#3a6ab8'); P.disc(k.CX + 18, k.yS - 9, 1, '#ff3030'); } },
  boy: { sex: 'm', style: 'spiky', hair: '#2a2a2a', mouth: 'grin', outfit: 'school', top: '#2f3f8f', tie: '#d4a017', drawAct: (P, st, k) => { if (st.act) armTo(P, k.CX + k.SW - 2, k.yS + 4, k.CX + k.FW + 2, k.yT + 8, k.topS, k.S, 8); } },
  girl: { sex: 'f', style: 'pony', hair: '#3a2214', mouth: 'frown', outfit: 'ribbon', top: '#2f3f8f', tie: '#d6324a', browStyle: 'sharp', drawAct: (P, st, k) => { if (!st.act) return; for (let y = k.yS + 18; y < k.yS + 27; y++) for (let x = k.CX - k.SW + 4; x <= k.CX + k.SW - 4; x++) P.set(x, y, y > k.yS + 24 ? k.topS[4] : k.topS[3]); P.disc(k.CX + 16, k.yS + 22, 3, k.S[1]); P.disc(k.CX - 16, k.yS + 23, 3, k.S[2]); } },
  police: { sex: 'm', style: 'short', hair: '#1c1c22', mouth: 'neutral', outfit: 'police', top: '#24365e', top2: '#bcd0ff', tie: '#1b2850', hat: 'police', browStyle: 'sharp', drawAct: (P, st, k) => { if (st.act) armTo(P, k.CX - k.SW + 4, k.yS + 2, k.CX - 10, k.yT + 2, k.topS, k.S, 8); } },
  soldier: { sex: 'm', skin: 'tan', style: 'buzz', hair: '#222', mouth: 'neutral', outfit: 'camo', top: '#5b6b3a', hat: 'helmet', browStyle: 'sharp' },
  romi: { sex: 'f', style: 'long', hair: '#4a2a1a', mouth: 'smile', outfit: 'collar', top: '#f0a8c0', top2: '#ffffff', drawAct: (P, st, k) => { if (st.act) armTo(P, k.CX - k.SW + 6, k.yS + 26, k.CX - 4, k.yS + 14, k.topS, k.S, 8); } },
  yena: { age: 'child', sex: 'f', style: 'bob', hair: '#2a1a12', mouth: 'grin', outfit: 'tee', top: '#ffd23a', drawAct: (P, st, k) => { if (st.act) armTo(P, k.CX + k.SW - 4, k.yS + 4, k.CX + k.SW + 6 + (st.frame % 2) * 4, k.yN - 22, k.topS, k.S, 7); } },
  owner: { sex: 'm', style: 'short', hair: '#2a2018', mouth: 'smile', outfit: 'tie', top: '#8a9aac', top2: '#ffffff', tie: '#2a3a6a', acc: 'glasses', glint: 1, drawAct: (P, st, k) => { if (st.act) armTo(P, k.CX + 8, 144, k.CX, k.E + 6, k.topS, k.S, 8); } },
};
const PORTRAITS = {};
const PSEED = { ai: 0.3, dog: 1.1, fool: 2.2, granny: 0.7, adult: 1.9, genius: 2.8, kid: 0.2, boy: 1.4, girl: 2.5, police: 0.9, soldier: 1.6, romi: 2.1, yena: 0.5, owner: 2.6 };
function portrait(k, st) {
  st = st || {};
  const key = k + '|' + (st.blink ? 1 : 0) + (st.talk ? 1 : 0) + (st.act ? 1 : 0) + (st.look || 0) + '|' + ((k === 'kid' || k === 'ai' || k === 'yena') ? (st.frame || 0) % 4 : 0);
  if (PORTRAITS[key]) return PORTRAITS[key];
  let img;
  if (k === 'ai') img = robotAIImg(st); else if (k === 'dog') img = robotDogImg(st);
  else img = realHuman(CHAR[k] || CHAR.adult, st);
  return PORTRAITS[key] = img;
}
// 현재 시간에 맞는 표정/동작 상태
function portraitState(k, talking) {
  const t = performance.now() / 1000, sd = PSEED[k] || 0;
  const bp = 3.2 + sd, blink = ((t + sd * 1.7) % bp) < 0.14;
  const ap = 5.5 + sd, act = ((t + sd * 2.3) % ap) > ap - 1.4;
  const look = k === 'soldier' && ((t + sd) % 6) > 4.5 ? 1 : 0;
  return { blink, act, look, talk: talking && ((t * 9) | 0) % 2 === 0, frame: (t * 12) | 0, breath: Math.sin(t * 1.9 + sd * 3) };
}
// 초상 그리기: s = 배율, crop = 위에서부터 보여줄 높이(원본 px), talking = 말하는 중
function drawPortrait(k, x, y, s, crop, talking) {
  const st = portraitState(k, talking), img = portrait(k, st), h = crop || img.height;
  const by = Math.round(st.breath) * s;
  ctx.drawImage(img, 0, 0, img.width, h, x, y + by, img.width * s, h * s);
}
