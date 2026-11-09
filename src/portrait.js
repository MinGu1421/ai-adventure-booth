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
// 여러 단계 색 사이를 부드럽게 섞기 (세미실사 음영용)
function ramp(cols, f) { f = Math.max(0, Math.min(cols.length - 1.001, f)); const i = Math.floor(f), t = f - i, a = hexRGBA(cols[i]), b = hexRGBA(cols[i + 1]); return '#' + [0, 1, 2].map(k => Math.round(a[k] + (b[k] - a[k]) * t).toString(16).padStart(2, '0')).join(''); }
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
  const fw = y => { if (y < yT || y > yC) return -1; if (y <= yM) return FW * Math.sqrt(Math.max(0, 1 - Math.pow((yM - y) / (yM - yT + 3), 2))); const t = (y - yM) / (yC - yM); let w = FW * (1 - (fem || child ? 0.55 : 0.45) * t * t); if (t > 0.8) w *= 1 - (t - 0.8) * 2.2; return Math.max(2, w); };
  const bob = st.breath || 0, BX = CX + (o.bodyX || 0);
  const SW0 = child ? 31 : fem ? 34 : old ? 37 : 40, SW = SW0 - 7, yN = (child ? 80 : 82), yS = yN + 13;
  const bw = y => { if (y < yN - 2) return -1; if (y < yS) { const t = (y - yN + 2) / (yS - yN + 2); return 8 + (SW - 8) * Math.pow(Math.sin(t * Math.PI / 2), 0.7); } return SW + (y - yS) * 0.07; };
  const hairCol = (x, y) => { const r = (x - CX) / (FW + 6), st = Math.sin(x * 1.7 + y * 0.35) * 0.35 + Math.sin(x * 0.6 - y * 0.2) * 0.2; let f = 2 + r * 0.9 + st; if (y < yT + 9 && r < -0.05 && r > -0.6) f -= 1.1 * (1 - Math.abs(r + 0.32) * 3); return ramp(H, f); };
  const style = o.style || 'short';
  // ----- 뒷머리 -----
  if (style === 'long') for (let y = yT; y < 118; y++) for (let x = CX - FW - 6; x <= CX + FW + 6; x++) { const e = y > 108 ? (y - 108) * 0.8 : 0; if (Math.abs(x - CX) <= FW + 6 - e) P.set(x, y, hairCol(x, y)); }
  if (style === 'pony') { const sw = st.act ? 2 : 0; for (let y = yT + 6; y < yT + 58; y++) { const k = (y - yT - 6) / 52, cx2 = CX + FW + 3 + sw * Math.sin(k * 3), r = 5 - k * 3; for (let x = cx2 - r; x <= cx2 + r; x++) P.set(x, y, hairCol(Math.round(x), y)); } }
  // ----- 몸 / 옷 -----
  const top = o.top || '#4a6fd6', topS = shadeHair(top);
  for (let y = yN - 2; y < 144; y++) { const w = bw(y); for (let x = Math.floor(BX - w); x <= BX + w; x++) { const r = (x - BX) / w; let f = 1.7 + r * 0.9 + Math.pow(Math.max(0, r), 3) * 1.3 - Math.max(0, -r - 0.75) * 2; if (y < yS + 2) f -= 0.25 * (1 - Math.abs(r)); if (y > yS + 4 && Math.abs(Math.abs(x - BX) - (w - 9)) < 0.6) f += 0.6; P.set(x, y, ramp(topS, f)); } }
  // ----- 목 -----
  const NW = child || fem ? 6 : 7.5;
  for (let y = yC - 10; y < yN + 6; y++) { const nc = lerp(CX, BX, clamp((y - yC + 10) / (yN + 6 - yC + 10), 0, 1)); for (let x = Math.floor(nc - NW); x <= nc + NW; x++) { const r = (x - nc) / NW; P.set(x, y, ramp(S, 1.1 + r * 0.8 + (y < yC + 4 ? 1 - (y - yC + 1) / 6 : 0) * 1.2)); } }
  // ----- 옷깃 -----
  const of = o.outfit || 'tee';
  const neckV = (depth, col, col2) => { for (let y = yN - 2; y < yN + depth; y++) { const w = NW + 1 - (y - yN + 2) * (NW + 1) / (depth + 2); for (let x = BX - w; x <= BX + w; x++) P.set(x, y, x > BX + 1 ? S[2] : S[1]); } if (col) for (let y = yN - 3; y < yN + depth; y++) { const w = NW + 2 - (y - yN + 3) * (NW + 2) / (depth + 3); P.set(BX - w - 1, y, col); P.set(BX - w - 2, y, col2 || col); P.set(BX + w + 1, y, col); P.set(BX + w + 2, y, col2 || col); } };
  if (of === 'tee') { for (let x = BX - NW - 1; x <= BX + NW + 1; x++) P.set(x, yN - 2 + Math.round(Math.pow((x - BX) / (NW + 1), 2) * -1 + 1), topS[3]); }
  if (of === 'collar' || of === 'tie' || of === 'police' || of === 'school' || of === 'ribbon') {
    const sh = o.top2 || '#f4f4f8';
    if (of !== 'collar') { for (let y = yN - 1; y < yN + 30; y++) { const w = 3 + (y - yN) * 0.45; for (let x = BX - w; x <= BX + w; x++) P.set(x, y, Math.abs(x - BX) > w - 1 ? '#00000040' : sh); } }
    for (let i = 0; i < 7; i++) { P.line(BX - NW - 1, yN - 3, BX - 2, yN + 5, 3, sh); P.line(BX + NW + 1, yN - 3, BX + 2, yN + 5, 3, sh, '#c8c8d4'); }
    if (of === 'tie' || of === 'police' || of === 'school') { const tc = o.tie || '#c8303c'; P.rect(BX - 2, yN + 3, 5, 4, shadeHair(tc)[3]); for (let y = yN + 7; y < yN + 36; y++) { const w = 1.5 + (y - yN - 7) * 0.06; for (let x = BX - w; x <= BX + w + 1; x++) P.set(x, y, x > BX ? shadeHair(tc)[3] : tc); } }
    if (of === 'ribbon') { const rc = o.tie || '#d6324a'; for (let i = 0; i < 6; i++) { P.line(BX, yN + 7, BX - 7, yN + 3 + i, 2, rc); P.line(BX, yN + 7, BX + 7, yN + 3 + i, 2, rc, shadeHair(rc)[3]); } P.disc(BX, yN + 7, 2, shadeHair(rc)[3]); P.line(BX - 1, yN + 8, BX - 4, yN + 16, 2, rc); P.line(BX + 1, yN + 8, BX + 4, yN + 16, 2, rc); }
    if (of === 'school' || of === 'police' || of === 'ribbon') { for (let y = yN - 1; y < yN + 42; y++) { const w = 4 + (y - yN) * 0.5; P.set(BX - w - 1, y, topS[4]); P.set(BX + w + 1, y, topS[4]); P.set(BX - w - 2, y, topS[1]); } }
  }
  if (of === 'cardigan') { neckV(10, o.top2 || '#f2e6cc'); for (let y = yN + 8; y < 144; y++) { P.set(BX, y, topS[4]); } for (let i = 0; i < 4; i++) P.disc(BX + 2, yN + 16 + i * 12, 1, '#f2e6cc'); }
  if (of === 'camo') { const r = seeded(77); for (let i = 0; i < 46; i++) { const x = BX - SW + r() * SW * 2, y = yN + r() * 60; if (Math.abs(x - BX) < bw(y) - 1) P.disc(x, y, 1 + (r() * 2 | 0), r() < 0.5 ? '#3e4a26' : '#7a8a50'); } neckV(4, '#3e4a26'); P.rect(BX - 26, yN + 22, 52, 3, '#2e381c'); }
  if (of === 'police') { P.rect(BX - 28, yN + 18, 7, 8, '#ffd23a'); P.rect(BX - 26, yN + 20, 3, 4, '#b8860b'); P.rect(BX - SW + 2, yS - 3, 12, 3, '#ffd23a'); P.rect(BX + SW - 14, yS - 3, 12, 3, '#c9a020'); P.rect(BX + 14, yN + 22, 10, 2, '#9fb8e8'); }
  // ----- 얼굴 -----
  for (let y = yT; y <= yC; y++) { const w = fw(y); for (let x = Math.floor(CX - w); x <= CX + w; x++) {
    const r = (x - CX) / w, v = (y - yT) / (yC - yT);
    let f = 1.0 + r * 0.75 + Math.pow(Math.abs(r), 4) * 1.1 + Math.max(0, v - 0.86) * 7 * (0.6 + Math.max(0, r));
    f -= Math.max(0, 0.35 - Math.abs(v - 0.3)) * Math.max(0, 0.6 - Math.abs(r + 0.35)) * 2.4; // 이마·광대 하이라이트
    f += Math.max(0, 0.12 - Math.abs(v - 0.62)) * Math.max(0, Math.abs(r) - 0.55) * 8; // 볼 아래 음영
    P.set(x, y, ramp(S, f));
  } }
  // 귀
  for (let y = E - 2; y < E + 9; y++) { const k = 1 - Math.abs((y - E - 3) / 6), wl = fw(y); P.set(CX - wl - 1, y, S[2]); if (k > 0.3) P.set(CX - wl - 2, y, S[1]); if (k > 0.6) P.set(CX - wl - 3, y, S[2]); P.set(CX + wl + 1, y, S[3]); if (k > 0.3) P.set(CX + wl + 2, y, S[3]); if (k > 0.6) P.set(CX + wl + 3, y, S[4]); }
  // 눈
  const EX = child ? 8 : 7.5, look = st.look || 0, iris = o.eyes || '#3a2618';
  const eye = (ex, side) => {
    ex = Math.round(ex + (o.eyeX || 0) * side * 0);
    if (st.blink) { for (let x = ex - 3; x <= ex + 3; x++) P.set(x, E + 2 - (Math.abs(x - ex) > 2 ? 0 : 1) + 1, '#3a2418'); return; }
    const t0 = E - 1, t1 = E + 3; // 눈 높이 5px
    for (let x = ex - 3; x <= ex + 3; x++) for (let y = t0; y <= t1; y++) { if ((x === ex - 3 || x === ex + 3) && (y === t0 || y === t1)) continue; P.set(x, y, '#fbf8f4'); }
    for (let y = t0; y <= t1; y++) for (let x = ex - 2 + look; x <= ex + 1 + look; x++) if (!((y === t0 || y === t1) && (x === ex - 2 + look || x === ex + 1 + look))) P.set(x, y, iris);
    P.rect(ex - 1 + look, E, 2, 2, '#1a0e0a'); P.set(ex - 2 + look, t0, '#ffffff'); P.set(ex - 1 + look, t0 + 1, '#ffffff'); P.set(ex + 1 + look, t1 - 1, '#ffffff99');
    for (let x = ex - 3; x <= ex + 3; x++) P.set(x, t0 - 1, '#3a2418'); P.set(ex + side * 4, t0, '#3a2418');
    if (fem) { P.set(ex + side * 4, t0 - 1, '#3a2418'); P.set(ex + side * 5, t0 - 2, '#3a2418'); }
    if (old) { P.set(ex + side * 5, E + 2, S[2]); }
  };
  eye(CX - EX, -1); eye(CX + EX, 1);
  // 눈썹
  const bc = o.brow || H[2], br = o.browStyle || 'normal';
  for (const side of [-1, 1]) { const ex = CX + side * EX; for (let i = -3; i <= 3; i++) { let y = E - 5 - (Math.abs(i) < 2 ? 1 : 0); if (br === 'sharp') y = E - 6 + Math.round(-i * side * 0.25); if (br === 'up') y -= 1 + (st.act ? 1 : 0); P.set(ex + i, y, bc); } }
  // 코
  for (let y = E + 5; y < E + 10; y++) P.set(CX + 2, y, S[2]);
  P.rect(CX - 1, E + 10, 3, 1, S[0]); P.set(CX - 1, E + 11, S[2]); P.set(CX + 2, E + 11, S[3]);
  // 입
  const M = E + 16, lc = fem ? '#d0607a' : '#b86a5a', lc2 = fem ? '#f0a0ae' : '#d89a88';
  const mouth = st.talk ? 'talk' : (st.act && o.actMouth) || o.mouth || 'neutral';
  if (mouth === 'talk' || mouth === 'open') { const h = mouth === 'open' ? 4 : 3; for (let y = M - 1; y < M - 1 + h; y++) for (let x = CX - 4; x <= CX + 4; x++) P.set(x, y, '#5a1a1a'); P.rect(CX - 3, M - 1, 7, 1, '#f4f0ea'); P.rect(CX - 3, M - 1 + h, 7, 1, lc2); P.rect(CX - 3, M - 2, 7, 1, lc); }
  else {
    P.rect(CX - 3, M, 7, 1, lc); P.rect(CX - 2, M + 1, 5, 1, lc2);
    if (mouth === 'smile' || mouth === 'grin') { P.set(CX - 4, M - 1, lc); P.set(CX + 4, M - 1, lc); }
    if (mouth === 'grin') { P.rect(CX - 3, M, 7, 1, '#f4f0ea'); }
    if (mouth === 'frown') { P.set(CX - 4, M + 1, lc); P.set(CX + 4, M + 1, lc); }
  }
  { const bl = fem || child ? '#f08a8a66' : '#f0a08a33'; P.rect(CX - 13, E + 6, 4, 2, bl); P.rect(CX + 10, E + 6, 4, 2, bl); }
  if (old) { P.line(CX - 8, E + 11, CX - 6, E + 18, 1, S[3]); P.line(CX + 8, E + 11, CX + 6, E + 18, 1, S[3]); P.rect(CX - 6, yT + 9, 12, 1, S[2]); P.rect(CX - 5, yT + 12, 10, 1, S[2]); }
  if (o.stubble) for (let y = M - 3; y < yC; y++) { const w = fw(y); for (let x = CX - w + 2; x <= CX + w - 2; x++) if ((x * 7 + y * 3) % 5 === 0 && Math.abs(y - M) > 1 && y > M - 1) P.set(x, y, '#3b2a1e22'); }
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
  // ----- 팔 (어깨-팔꿈치-손, 동작 중에는 기본 팔 대신 동작 팔만 그림) -----
  const k = { CX, BX, yT, yC, E, M, FW, SW, yN, yS, S, topS, H, sy: yS + 5, sl: BX - SW + 3, sr: BX + SW - 3 };
  const def = [[k.sl - 3, k.sy + 26, k.sl - 1, k.sy + 52], [k.sr + 3, k.sy + 26, k.sr + 1, k.sy + 52]];
  const pose = (st.act && o.actPose ? o.actPose(k, st) : o.pose ? o.pose(k, st) : def).map((p, i) => p || def[i]);
  const short = of === 'tee', armS = o.sleeve ? shadeHair(o.sleeve) : topS;
  pose.forEach((p, i) => limb(P, i ? k.sr : k.sl, k.sy, p[0], p[1], p[2], p[3], armS, S, short));
  if (o.drawAct) o.drawAct(P, st, k, pose);
  return P.done();
}
// Scale2x(EPX)를 두 번 적용해 4배로 키움: 머리카락·윤곽선의 계단 모양을 부드럽게
function scale2x(src) {
  const w = src.width, h = src.height, sd = src.getContext('2d').getImageData(0, 0, w, h).data;
  const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const g = c.getContext('2d'); const od = g.createImageData(w * 2, h * 2), o = od.data;
  const px = (x, y) => { x = x < 0 ? 0 : x >= w ? w - 1 : x; y = y < 0 ? 0 : y >= h ? h - 1 : y; return (y * w + x) * 4; };
  const same = (a, b) => sd[a] === sd[b] && sd[a + 1] === sd[b + 1] && sd[a + 2] === sd[b + 2] && sd[a + 3] === sd[b + 3];
  const put = (x, y, i) => { const k = (y * w * 2 + x) * 4; o[k] = sd[i]; o[k + 1] = sd[i + 1]; o[k + 2] = sd[i + 2]; o[k + 3] = sd[i + 3]; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const P = px(x, y), A = px(x, y - 1), B = px(x + 1, y), C = px(x - 1, y), D = px(x, y + 1);
    let e0 = P, e1 = P, e2 = P, e3 = P;
    if (!same(A, D) && !same(C, B)) { if (same(C, A)) e0 = A; if (same(A, B)) e1 = B; if (same(C, D)) e2 = C; if (same(D, B)) e3 = D; }
    put(x * 2, y * 2, e0); put(x * 2 + 1, y * 2, e1); put(x * 2, y * 2 + 1, e2); put(x * 2 + 1, y * 2 + 1, e3);
  }
  g.putImageData(od, 0, 0); return c;
}
function limb(P, sx, sy, ex, ey, hx, hy, sl, sk, short) {
  // 위팔
  if (short) { const mx = sx + (ex - sx) * 0.5, my = sy + (ey - sy) * 0.5; P.line(mx, my, ex, ey, 8, sk[1], sk[2]); P.line(sx, sy, mx, my, 11, sl[2], sl[3]); }
  else P.line(sx, sy, ex, ey, 10, sl[2], sl[3]);
  // 팔꿈치 관절 + 아래팔
  P.disc(ex, ey, short ? 3.5 : 4.5, short ? sk[1] : sl[2]);
  const dx = hx - ex, dy = hy - ey, d = Math.hypot(dx, dy) || 1, cx = hx - dx / d * 4, cy = hy - dy / d * 4;
  P.line(ex, ey, cx, cy, short ? 7 : 9, short ? sk[1] : sl[2], short ? sk[2] : sl[3]);
  if (!short) P.line(cx - dx / d * 0.5, cy - dy / d * 0.5, cx, cy, 9, sl[3]);
  // 손
  P.disc(hx, hy, 4.5, sk[1]); P.disc(hx + 1, hy + 1, 2, sk[2]); P.disc(hx - 1, hy - 1, 1.5, sk[0]);
}

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
  // pose / actPose: [왼쪽 팔, 오른쪽 팔] = [팔꿈치x, 팔꿈치y, 손x, 손y] (null이면 기본 자세)
  fool: { sex: 'm', style: 'spiky', hair: '#6b4a2a', mouth: 'open', outfit: 'tee', top: '#f2c230', browStyle: 'up', actMouth: 'open', tilt: 3, bodyX: 2,
    pose: k => [null, [k.sr + 10, k.sy - 20, k.CX + k.FW + 1, k.yT + 13]],
    actPose: k => [[k.sl - 9, k.sy - 18, k.sl - 4, k.yT + 6], [k.sr + 9, k.sy - 18, k.sr + 4, k.yT + 6]] },
  granny: { age: 'old', sex: 'f', style: 'bun', hair: '#c8c8c8', mouth: 'smile', actMouth: 'open', outfit: 'cardigan', top: '#8a4fb0', top2: '#f2e6cc', browStyle: 'up', eyes: '#4a3a2a', tilt: -1,
    pose: k => [[k.sl - 1, k.sy + 22, k.BX - 2, k.sy + 30], [k.sr + 1, k.sy + 22, k.BX + 3, k.sy + 31]],
    actPose: k => [[k.sl - 2, k.sy + 16, k.CX - k.FW + 1, k.E + 13], [k.sr + 2, k.sy + 16, k.CX + k.FW - 1, k.E + 13]] },
  adult: { sex: 'm', style: 'short', hair: '#3b2a1e', mouth: 'neutral', outfit: 'collar', top: '#5e8c5a', top2: '#5e8c5a', stubble: 1, bodyX: -2, look: 1,
    pose: k => [[k.sl - 2, k.sy + 22, k.BX + 15, k.sy + 15], [k.sr + 2, k.sy + 24, k.BX - 15, k.sy + 17]],
    actPose: k => [[k.sl - 6, k.sy + 16, k.sl - 13, k.sy + 2], [k.sr + 6, k.sy + 16, k.sr + 13, k.sy + 2]] },
  genius: { sex: 'm', style: 'short', hair: '#15151c', mouth: 'smile', outfit: 'tie', top: '#f4f4f8', top2: '#ffffff', tie: '#c8303c', acc: 'glasses', glint: 1, browStyle: 'sharp', bodyX: -3, tilt: -2,
    pose: k => [[k.sl - 12, k.sy + 17, k.sl + 2, k.sy + 35], null],
    actPose: k => [[k.sl - 12, k.sy + 17, k.sl + 2, k.sy + 35], [k.sr - 1, k.sy + 22, k.CX + 4, k.E - 1]] },
  kid: { age: 'child', sex: 'm', style: 'short', hair: '#4a2c18', mouth: 'grin', outfit: 'tee', top: '#36b0e8', hat: 'propeller', eyes: '#2a1a10', tilt: -2,
    pose: k => [[k.sl - 1, k.sy + 20, k.BX - 4, k.sy + 12], [k.sr + 1, k.sy + 20, k.BX + 5, k.sy + 12]],
    actPose: k => [null, [k.sr + 9, k.sy + 2, k.sr + 3, k.yN - 16]],
    drawAct: (P, st, k, pose) => { const h = pose[1]; const x = h[2] - 6, y = h[3] - 17; P.rect(x, y, 12, 20, '#1a1a22'); P.rect(x + 1, y + 1, 10, 16, '#3a6ab8'); P.disc(x + 8, y + 3, 1, '#ff3030'); P.disc(h[2], h[3], 3.5, k.S[1]); } },
  boy: { sex: 'm', style: 'spiky', hair: '#2a2a2a', mouth: 'grin', outfit: 'school', top: '#2f3f8f', tie: '#d4a017', bodyX: 3, tilt: 2,
    pose: k => [null, [k.sr + 11, k.sy - 22, k.CX + k.FW + 1, k.yT + 14]],
    actPose: k => [[k.sl - 6, k.sy + 16, k.sl - 13, k.sy + 2], [k.sr + 6, k.sy + 16, k.sr + 13, k.sy + 2]] },
  girl: { sex: 'f', style: 'pony', hair: '#3a2214', mouth: 'neutral', actMouth: 'frown', outfit: 'ribbon', top: '#2f3f8f', tie: '#d6324a', browStyle: 'sharp', bodyX: -3, tilt: -3, look: -1,
    pose: k => [[k.sl - 11, k.sy + 16, k.sl + 1, k.sy + 33], [k.sr + 11, k.sy + 16, k.sr - 1, k.sy + 33]],
    actPose: k => [[k.sl - 11, k.sy + 16, k.sl + 1, k.sy + 33], [k.sr + 9, k.sy + 6, k.sr + 16, k.sy - 9]] },
  police: { sex: 'm', style: 'short', hair: '#1c1c22', mouth: 'neutral', outfit: 'police', top: '#24365e', top2: '#bcd0ff', tie: '#1b2850', hat: 'police', bodyX: 2,
    pose: k => [null, [k.sr + 12, k.sy + 16, k.sr - 1, k.sy + 34]],
    actPose: k => [[k.sl - 11, k.sy - 16, k.CX - k.FW + 5, k.yT + 9], [k.sr + 12, k.sy + 16, k.sr - 1, k.sy + 34]] },
  soldier: { sex: 'm', skin: 'tan', style: 'buzz', hair: '#222', mouth: 'neutral', outfit: 'camo', top: '#5b6b3a', hat: 'helmet',
    pose: k => [[k.sl - 2, k.sy + 24, k.sl + 1, k.sy + 50], [k.sr + 2, k.sy + 24, k.sr - 1, k.sy + 50]] },
  romi: { sex: 'f', style: 'long', hair: '#4a2a1a', mouth: 'smile', outfit: 'collar', top: '#f0a8c0', top2: '#ffffff', tilt: 2, bodyX: 2,
    pose: k => [[k.sl - 1, k.sy + 22, k.BX - 2, k.sy + 30], [k.sr + 1, k.sy + 22, k.BX + 3, k.sy + 31]],
    actPose: k => [[k.sl - 2, k.sy + 22, k.BX - 6, k.sy + 6], [k.sr + 1, k.sy + 22, k.BX + 3, k.sy + 31]] },
  yena: { age: 'child', sex: 'f', style: 'bob', hair: '#2a1a12', mouth: 'grin', outfit: 'tee', top: '#ffd23a', tilt: 3,
    actPose: (k, st) => [null, [k.sr + 9, k.sy - 6, k.sr + 9 + (st.frame % 2) * 4, k.yN - 22]] },
  owner: { sex: 'm', style: 'short', hair: '#2a2018', mouth: 'smile', outfit: 'tie', top: '#8a9aac', top2: '#ffffff', tie: '#2a3a6a', acc: 'glasses', glint: 1, bodyX: 2,
    actPose: k => [null, [k.sr - 1, k.sy + 22, k.CX + 4, k.E - 1]] },
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
  img = scale2x(scale2x(img)); img.base = 96;
  return PORTRAITS[key] = img;
}
// 현재 시간에 맞는 표정/동작 상태
function portraitState(k, talking) {
  const t = performance.now() / 1000, sd = PSEED[k] || 0;
  const bp = 3.2 + sd, blink = ((t + sd * 1.7) % bp) < 0.14;
  const ap = 5.5 + sd, act = ((t + sd * 2.3) % ap) > ap - 1.4;
  const look = k === 'soldier' && ((t + sd) % 6) > 4.5 ? 1 : ((CHAR[k] && CHAR[k].look) || 0);
  return { blink, act, look, talk: talking && ((t * 9) | 0) % 2 === 0, frame: (t * 12) | 0, breath: Math.sin(t * 1.9 + sd * 3) };
}
// 초상 그리기: s = 배율, crop = 위에서부터 보여줄 높이(원본 px), talking = 말하는 중
function drawPortrait(k, x, y, s, crop, talking) {
  const st = portraitState(k, talking), img = portrait(k, st), q = img.width / (img.base || img.width), h = (crop || 144) * q;
  const by = Math.round(st.breath) * s, tl = ((CHAR[k] && CHAR[k].tilt) || 0) * Math.PI / 180, dw = 96 * s, dh = h / q * s;
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (tl) { ctx.save(); ctx.translate(x + dw / 2, y + by + dh); ctx.rotate(tl); ctx.drawImage(img, 0, 0, img.width, h, -dw / 2, -dh, dw, dh); ctx.restore(); }
  else ctx.drawImage(img, 0, 0, img.width, h, x, y + by, dw, dh);
  ctx.imageSmoothingEnabled = sm;
}
