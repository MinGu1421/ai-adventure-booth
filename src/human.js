// ---------- 반실사(Semi-realistic) 스탠딩 일러스트: 벡터로 그려 부드러운 음영 ----------
// 논리 좌표는 기존과 같은 96x144 (포즈 좌표 그대로 사용), 실제 캔버스는 4배 해상도
function vecHuman(o, st) {
  const Q = 4, c = document.createElement('canvas'); c.width = 96 * Q; c.height = 144 * Q;
  const g = c.getContext('2d'); g.scale(Q, Q); g.lineCap = 'round'; g.lineJoin = 'round';
  const CX = 48, child = o.age === 'child', old = o.age === 'old', fem = o.sex === 'f';
  const S = SKINS[o.skin || (old ? 'old' : 'light')], H = shadeHair(o.hair || '#2b1d14');
  // 캐주얼 그림체: 머리를 크게, 몸은 작고 둥글게
  // 애니메이션 그림체: 큰 머리, 갸름한 V라인 턱, 낮게 자리한 큰 눈
  const yT = child ? 13 : 10, yC = child ? 63 : 65, FW = child ? 19.5 : fem ? 18.5 : 19;
  const E = Math.round(yT + (yC - yT) * 0.6), BX = CX + (o.bodyX || 0);
  const SW0 = child ? 29 : fem ? 31 : old ? 33 : 35, SW = SW0 - 7, yN = yC + 10, yS = yN + 13;
  const NW = child || fem ? 4.3 : 5.3, style = o.style || 'short', of = o.outfit || 'tee';
  const top = o.top || '#4a6fd6', topS = shadeHair(top), look = st.look || 0;
  const rgba = (h, a) => { const v = hexRGBA(h); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')'; };
  const fill = (col) => { g.fillStyle = col; g.fill(); };
  const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([p, col]) => gr.addColorStop(p, col)); return gr; };
  const rad = (x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([p, col]) => gr.addColorStop(p, col)); return gr; };
  const ell = (x, y, rx, ry, rot) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2); };
  const stroke = (col, w) => { g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  const hairGrad = (y0, y1) => lin(0, y0, 0, y1, [[0, H[1]], [0.35, H[2]], [1, H[3]]]);
  const faceTop = yT, jaw = 0.74;

  // ===== 뒷머리 (끝이 뾰족한 머리 다발) =====
  const hairG = (y0, y1) => lin(0, y0, 0, y1, [[0, H[2]], [0.5, H[3]], [1, H[2]]]);
  const zig = (xL, xR, yb, n, amp) => { for (let i = 0; i <= n; i++) { const x = xR + (xL - xR) * (i / n); g.lineTo(x, yb + (i % 2 ? -amp : 0)); } };
  if (style === 'long') { g.beginPath(); g.moveTo(CX - FW - 3, yT + 10); g.bezierCurveTo(CX - FW - 9, yT + 40, CX - FW - 10, 104, CX - FW - 6, 124); g.lineTo(CX + FW + 6, 124); zig(CX - FW - 6, CX + FW + 6, 124, 8, 6); g.closePath(); fill(hairG(yT, 124)); g.beginPath(); g.moveTo(CX + FW + 6, 124); g.bezierCurveTo(CX + FW + 10, 104, CX + FW + 9, yT + 40, CX + FW + 3, yT + 10); g.lineTo(CX - FW - 3, yT + 10); g.closePath(); fill(hairG(yT, 124)); }
  if (style === 'bob') { g.beginPath(); g.moveTo(CX - FW - 3, yT + 8); g.bezierCurveTo(CX - FW - 8, yT + 30, CX - FW - 7, yC, CX - FW - 3, yC + 4); zig(CX - FW - 3, CX + FW + 3, yC + 4, 6, 4); g.bezierCurveTo(CX + FW + 7, yC, CX + FW + 8, yT + 30, CX + FW + 3, yT + 8); g.closePath(); fill(hairG(yT, yC + 4)); }
  if (style === 'pony') {
    const sw = st.act ? 2.5 : 0; g.beginPath(); g.moveTo(CX + FW - 3, yT + 4); g.bezierCurveTo(CX + FW + 12, yT + 8, CX + FW + 10 + sw, yT + 36, CX + FW + 6 + sw, yT + 64); g.lineTo(CX + FW + 3 + sw, yT + 54); g.lineTo(CX + FW + 1 + sw, yT + 60); g.bezierCurveTo(CX + FW + 1, yT + 38, CX + FW, yT + 22, CX + FW - 5, yT + 14); g.closePath(); fill(hairG(yT, yT + 64));
  }
  if (style === 'short' || style === 'spiky' || style === 'bun') { g.beginPath(); g.ellipse(CX, yT + 18, FW + 4, 22, 0, Math.PI * 0.9, Math.PI * 2.1); g.closePath(); fill(H[3]); }
  // ===== 목 =====
  const nTop = yC - 9, nBot = yN + 4;
  g.beginPath(); g.moveTo(CX - NW, nTop); g.lineTo(CX + NW, nTop); g.lineTo(BX + NW + 0.5, nBot); g.lineTo(BX - NW - 0.5, nBot); g.closePath();
  fill(lin(CX - NW, 0, CX + NW, 0, [[0, S[1]], [0.6, S[2]], [1, S[3]]]));
  ell(CX + 0.5, yC + 1.5, NW + 1, 3.5); fill(rgba(S[4], 0.35));
  // ===== 몸통 =====
  const SWt = SW0 - 5;
  const torso = () => { g.beginPath(); g.moveTo(BX - NW - 2, yN - 3); g.bezierCurveTo(BX - NW - 9, yN - 1, BX - SWt + 2, yN + 2, BX - SWt, yS + 4); g.lineTo(BX - SWt - 1.5, 150); g.lineTo(BX + SWt + 1.5, 150); g.lineTo(BX + SWt, yS + 4); g.bezierCurveTo(BX + SWt - 2, yN + 2, BX + NW + 9, yN - 1, BX + NW + 2, yN - 3); g.closePath(); };
  torso(); fill(lin(BX - SWt, 0, BX + SWt, 0, [[0, topS[1]], [0.35, topS[2]], [0.75, topS[3]], [1, topS[4]]]));
  g.save(); torso(); g.clip();
  // 옷 주름, 겨드랑이 그림자
  g.beginPath(); g.moveTo(BX - SWt + 9, yS + 10); g.quadraticCurveTo(BX - SWt + 7, yS + 30, BX - SWt + 10, 146); stroke(rgba(topS[4], 0.35), 1.2);
  g.beginPath(); g.moveTo(BX + SWt - 9, yS + 10); g.quadraticCurveTo(BX + SWt - 7, yS + 30, BX + SWt - 10, 146); stroke(rgba(topS[4], 0.45), 1.2);
  // ----- 옷 종류별 디테일 (목 둘레에 정확히 맞춤) -----
  const vOpen = (depth, col) => { g.beginPath(); g.moveTo(BX - NW - 1.5, yN - 4); g.lineTo(BX, yN + depth); g.lineTo(BX + NW + 1.5, yN - 4); g.closePath(); fill(col); };
  if (of === 'stripe') { for (let y = yN + 3; y < 150; y += 7) { g.fillStyle = rgba(o.top2 || '#ffffff', 0.9); g.fillRect(BX - SWt - 2, y, SWt * 2 + 4, 3); } }
  if (of === 'hoodie') { g.beginPath(); g.roundRect(BX - 13, yN + 30, 26, 16, 5); stroke(rgba(topS[4], 0.6), 1.2); }
  if (of === 'tee' || of === 'stripe') { ell(BX, yN - 3, NW + 1, 6); fill(lin(BX - NW, 0, BX + NW, 0, [[0, S[1]], [1, S[3]]])); g.beginPath(); g.ellipse(BX, yN - 3, NW + 1.6, 6.6, 0, 0, Math.PI); stroke(topS[3], 1.6); }
  if (of === 'collar') { vOpen(9, lin(0, yN - 4, 0, yN + 9, [[0, S[2]], [1, S[3]]])); const sh = o.top2 || '#f4f4f8'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(BX + sd * (NW + 2), yN - 5); g.lineTo(BX + sd * (NW + 8), yN + 4); g.lineTo(BX + sd * 1.5, yN + 9); g.closePath(); fill(shadeHair(sh)[sd < 0 ? 1 : 3]); } }
  if (of === 'tie' || of === 'police' || of === 'school' || of === 'ribbon') {
    const sh = o.top2 || '#f4f4f8', jacket = of !== 'tie';
    g.beginPath(); g.moveTo(BX - NW - 2, yN - 4); g.lineTo(BX - (jacket ? 3 : NW + 3), yN + (jacket ? 34 : 70)); g.lineTo(BX + (jacket ? 3 : NW + 3), yN + (jacket ? 34 : 70)); g.lineTo(BX + NW + 2, yN - 4); g.closePath(); fill(lin(BX - 8, 0, BX + 8, 0, [[0, '#ffffff'], [1, shadeHair(sh)[3]]]));
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(BX + sd * (NW + 2), yN - 5); g.lineTo(BX + sd * (NW + 6), yN + 3); g.lineTo(BX + sd * 1.5, yN + 6); g.closePath(); fill(sd < 0 ? '#ffffff' : shadeHair(sh)[3]); }
    if (of !== 'ribbon') { const tc = o.tie || '#c8303c', T2 = shadeHair(tc); g.beginPath(); g.moveTo(BX - 2.5, yN + 4); g.lineTo(BX + 2.5, yN + 4); g.lineTo(BX + 1.6, yN + 8); g.lineTo(BX - 1.6, yN + 8); g.closePath(); fill(T2[3]); g.beginPath(); g.moveTo(BX - 1.6, yN + 8); g.lineTo(BX + 1.6, yN + 8); g.lineTo(BX + 3, yN + 36); g.lineTo(BX, yN + 40); g.lineTo(BX - 3, yN + 36); g.closePath(); fill(lin(BX - 3, 0, BX + 3, 0, [[0, T2[1]], [1, T2[3]]])); }
    else { const rc = o.tie || '#d6324a', R2 = shadeHair(rc); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(BX, yN + 7); g.quadraticCurveTo(BX + sd * 6, yN + 1, BX + sd * 8, yN + 6); g.quadraticCurveTo(BX + sd * 6, yN + 12, BX, yN + 7); fill(sd < 0 ? rc : R2[3]); g.beginPath(); g.moveTo(BX + sd * 0.5, yN + 8); g.lineTo(BX + sd * 4, yN + 17); stroke(rc, 2); } ell(BX, yN + 7, 2, 2); fill(R2[3]); }
    if (jacket) for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(BX + sd * (NW + 2), yN - 4); g.lineTo(BX + sd * 3, yN + 34); g.lineTo(BX + sd * 3, 150); g.lineTo(BX + sd * (SWt + 3), 150); g.lineTo(BX + sd * (SWt + 3), yN - 6); g.closePath(); fill(lin(BX - SWt, 0, BX + SWt, 0, [[0, topS[1]], [0.35, topS[2]], [0.75, topS[3]], [1, topS[4]]])); g.beginPath(); g.moveTo(BX + sd * (NW + 2), yN - 4); g.lineTo(BX + sd * 12, yN + 14); g.lineTo(BX + sd * 3, yN + 34); stroke(topS[4], 1); }
  }
  if (of === 'cardigan') { vOpen(12, lin(0, yN - 4, 0, yN + 12, [[0, o.top2 || '#f2e6cc'], [1, shadeHair(o.top2 || '#f2e6cc')[3]]])); g.beginPath(); g.moveTo(BX, yN + 12); g.lineTo(BX, 150); stroke(topS[4], 1); for (let i = 0; i < 4; i++) { ell(BX + 2, yN + 17 + i * 12, 1.2, 1.2); fill('#f2e6cc'); } }
  if (of === 'camo') { const r = seeded(77); for (let i = 0; i < 60; i++) { ell(BX - SWt + r() * SWt * 2, yN - 4 + r() * 66, 1.5 + r() * 2.5, 1 + r() * 1.8, r() * 3); fill(r() < 0.5 ? 'rgba(52,64,30,.8)' : 'rgba(122,138,80,.75)'); } vOpen(5, lin(0, yN - 4, 0, yN + 5, [[0, S[2]], [1, S[3]]])); g.beginPath(); g.moveTo(BX - NW - 2, yN - 4); g.lineTo(BX, yN + 5); g.lineTo(BX + NW + 2, yN - 4); stroke('#34401e', 1.6); }
  if (of === 'police') { g.beginPath(); g.roundRect(BX - 22, yN + 16, 7, 9, 1.5); fill(lin(0, yN + 16, 0, yN + 25, [[0, '#ffe680'], [1, '#c9a020']])); g.beginPath(); g.roundRect(BX - SWt + 1, yS - 4, 13, 3.5, 1.5); fill('#ffd23a'); g.beginPath(); g.roundRect(BX + SWt - 14, yS - 4, 13, 3.5, 1.5); fill('#c9a020'); g.beginPath(); g.roundRect(BX + 12, yN + 20, 10, 2, 1); fill('#9fb8e8'); }
  g.restore();
  if (of === 'hoodie') { g.beginPath(); g.ellipse(BX, yN - 2, NW + 8, 7, 0, 0, Math.PI * 2); fill(lin(BX - NW - 8, 0, BX + NW + 8, 0, [[0, topS[1]], [1, topS[3]]])); g.beginPath(); g.ellipse(BX, yN - 3, NW + 1.5, 4.5, 0, 0, Math.PI * 2); fill(lin(BX - NW, 0, BX + NW, 0, [[0, S[1]], [1, S[3]]])); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(BX + sd * 3, yN + 3); g.quadraticCurveTo(BX + sd * 3.5, yN + 10, BX + sd * 2.6, yN + 16); stroke('#f4f4f4', 1.1); ell(BX + sd * 2.6, yN + 16.5, 0.9, 1.2); fill('#d8d8d8'); } }
  if (o.acc2 === 'pearl') for (let i = -5; i <= 5; i++) { const a = Math.PI * (0.5 + i * 0.075); ell(BX + Math.cos(a) * (NW + 3.5), yN - 4 + Math.sin(a) * 7, 1.1, 1.1); fill(rad(BX + Math.cos(a) * (NW + 3.5) - 0.3, yN - 4.3 + Math.sin(a) * 7, 0.1, 1.2, [[0, '#ffffff'], [1, '#d8d0c8']])); }
  // ===== 귀 (머리카락 사이로 살짝) =====
  for (const sd of [-1, 1]) { ell(CX + sd * (FW - 1), E + 2, 2.2, 4, sd * 0.2); fill(sd < 0 ? S[1] : S[2]); ell(CX + sd * (FW - 0.6), E + 2.3, 1, 2.4, sd * 0.2); fill(rgba(S[3], 0.5)); }
  // ===== 얼굴 (둥근 볼 + 갸름한 V라인 턱) =====
  const face = () => { g.beginPath(); g.moveTo(CX, yT); g.bezierCurveTo(CX + FW * 0.8, yT, CX + FW, yT + (E - yT) * 0.45, CX + FW, E); g.bezierCurveTo(CX + FW * 0.98, E + 7, CX + FW * 0.7, yC - 8, CX + 3, yC - 1); g.quadraticCurveTo(CX, yC + 0.6, CX - 3, yC - 1); g.bezierCurveTo(CX - FW * 0.7, yC - 8, CX - FW * 0.98, E + 7, CX - FW, E); g.bezierCurveTo(CX - FW, yT + (E - yT) * 0.45, CX - FW * 0.8, yT, CX, yT); g.closePath(); };
  face(); fill(rad(CX - FW * 0.25, E - 4, 1, FW * 1.6, [[0, '#fff1e6'], [0.5, S[0]], [0.85, S[1]], [1, S[2]]]));
  g.save(); face(); g.clip();
  ell(CX + FW * 0.95, E + 4, FW * 0.35, 14); fill(rgba(S[2], 0.3));
  // 앞머리 그림자 (이마)
  g.beginPath(); g.moveTo(CX - FW, yT); g.lineTo(CX + FW, yT); g.lineTo(CX + FW, E - 9); g.quadraticCurveTo(CX, E - 5, CX - FW, E - 9); g.closePath(); fill(rgba(S[2], 0.55));
  // 볼터치: 분홍 그라데이션 + 빗금
  for (const sd of [-1, 1]) { ell(CX + sd * 10, E + 6.5, 5.2, 2.8); fill(rad(CX + sd * 10, E + 6.5, 0.5, 5.2, [[0, fem || child ? 'rgba(255,110,120,.5)' : 'rgba(240,120,110,.3)'], [1, 'rgba(255,120,120,0)']])); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(CX + sd * 8 + i * 1.6 - 0.6, E + 7.4); g.lineTo(CX + sd * 8 + i * 1.6 + 0.4, E + 5.6); stroke('rgba(220,80,90,.45)', 0.35); } }
  if (old) { for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(CX + sd * 5.5, E + 9); g.quadraticCurveTo(CX + sd * 7.5, E + 12, CX + sd * 6, E + 15); stroke(rgba(S[3], 0.55), 0.6); g.beginPath(); g.moveTo(CX + sd * 12, E - 1); g.lineTo(CX + sd * 14, E - 2); stroke(rgba(S[3], 0.5), 0.5); } }
  g.restore();
  face(); stroke('rgba(140,80,60,.45)', 0.55);
  // ===== 눈 (애니메이션: 크고 세로로 긴 눈, 그라데이션 홍채, 여러 하이라이트) =====
  const EX = child ? 8.2 : 7.9, eh = child ? 6.4 : fem ? 6.2 : old ? 4.4 : 5.2, ew = child ? 4.6 : fem ? 4.6 : 4.4, iris = o.eyes || '#5a3020';
  for (const sd of [-1, 1]) {
    const ex = CX + sd * EX, yE = E + 0.5;
    if (st.blink) { g.beginPath(); g.moveTo(ex - ew - 0.5, yE); g.quadraticCurveTo(ex, yE + 2.4, ex + ew + 0.5, yE - 0.2); stroke('#2a1410', 1.4); g.beginPath(); g.moveTo(ex + sd * (ew + 0.3), yE - 0.1); g.lineTo(ex + sd * (ew + 2), yE - 1); stroke('#2a1410', 0.9); continue; }
    const topY = yE - eh * 0.62, botY = yE + eh * 0.42;
    const eyeP = () => { g.beginPath(); g.moveTo(ex - ew, yE + 0.3); g.bezierCurveTo(ex - ew * 0.7, topY - 0.4, ex + ew * 0.6, topY - 0.8, ex + ew + 0.2, yE - 0.6); g.bezierCurveTo(ex + ew * 0.8, botY + 0.6, ex - ew * 0.7, botY + 0.8, ex - ew, yE + 0.3); g.closePath(); };
    eyeP(); fill('#fdfaf8');
    g.save(); eyeP(); g.clip();
    const ix = ex + look * 1.2 + sd * -0.1, iy = yE + 0.2, irx = ew * 0.74, iry = eh * 0.56;
    ell(ix, iy, irx, iry); fill(lin(0, iy - iry, 0, iy + iry, [[0, '#1a0c08'], [0.45, iris], [1, shadeHair(iris)[0]]]));
    ell(ix, iy - 0.4, irx * 0.48, iry * 0.55); fill('rgba(12,6,4,.85)');
    g.beginPath(); g.moveTo(ex - ew, topY); g.lineTo(ex + ew, topY); g.lineTo(ex + ew, topY + 2.2); g.quadraticCurveTo(ex, topY + 3.4, ex - ew, topY + 2.2); g.closePath(); fill('rgba(40,20,30,.35)');
    ell(ix - irx * 0.4, iy - iry * 0.45, irx * 0.42, iry * 0.28, -0.3); fill('#ffffff');
    ell(ix + irx * 0.45, iy + iry * 0.45, irx * 0.2, iry * 0.14); fill('rgba(255,255,255,.9)');
    ell(ix, iy + iry * 0.7, irx * 0.6, iry * 0.18); fill(rgba(shadeHair(iris)[0], 0.5));
    g.restore();
    // 굵은 윗속눈썹 + 바깥쪽 날개
    g.beginPath(); g.moveTo(ex - ew - 0.4, yE + 0.6); g.bezierCurveTo(ex - ew * 0.7, topY - 0.8, ex + ew * 0.6, topY - 1.2, ex + ew + 0.6, yE - 0.8); stroke('#24120e', fem || child ? 1.9 : 1.6);
    g.beginPath(); g.moveTo(ex + sd * (ew - 0.6), sd > 0 ? yE - 1.4 : yE - 1.2); g.lineTo(ex + sd * (ew + 2.2), yE - 2.6 + (sd > 0 ? 0 : 0.2)); g.lineTo(ex + sd * (ew + 0.4), yE + 0.2); g.closePath(); fill('#24120e');
    if (fem) { g.beginPath(); g.moveTo(ex + sd * (ew - 1.5), topY + 0.3); g.lineTo(ex + sd * (ew + 0.6), topY - 1.4); stroke('#24120e', 0.8); }
    g.beginPath(); g.moveTo(ex + sd * (ew * 0.1), botY + 0.4); g.quadraticCurveTo(ex + sd * ew * 0.6, botY + 0.3, ex + sd * (ew - 0.2), yE + 1); stroke('rgba(60,30,24,.55)', 0.55);
    g.beginPath(); g.moveTo(ex - ew * 0.5, topY - 1.8); g.quadraticCurveTo(ex, topY - 2.6, ex + ew * 0.7, topY - 1.6); stroke(rgba(S[3], 0.45), 0.4);
  }
  // ===== 눈썹 (가늘게) =====
  const br = o.browStyle || 'normal', bc = o.brow || H[3];
  for (const sd of [-1, 1]) {
    const ex = CX + sd * EX, up = br === 'up' ? (st.act ? 2 : 1) : 0, base = E - eh * 0.62 - 3.2 - up;
    let inY = base + 0.3, outY = base + 0.6, pk = base - 1.2;
    if (br === 'sharp') { inY = base + 1.2; outY = base - 0.4; pk = base - 0.6; }
    g.beginPath(); g.moveTo(ex - sd * 3.4, inY); g.quadraticCurveTo(ex + sd * 0.6, pk, ex + sd * 4.2, outY); stroke(bc, fem || child ? 0.85 : 1.15);
  }
  // ===== 코 (작은 그림자) =====
  g.beginPath(); g.moveTo(CX + 0.4, E + 7.5); g.lineTo(CX + 1.2, E + 9.3); g.lineTo(CX - 0.2, E + 9.5); stroke(rgba(S[3], 0.8), 0.6);
  // ===== 입 =====
  const M = Math.round(E + (yC - E) * 0.58), lc = '#b4504e';
  const mouth = st.talk ? 'talk' : (st.act && o.actMouth) || o.mouth || 'neutral';
  if (mouth === 'talk' || mouth === 'open') {
    const h = mouth === 'open' ? 2.8 : 2; g.beginPath(); g.moveTo(CX - 2.6, M); g.quadraticCurveTo(CX, M - 0.6, CX + 2.6, M); g.quadraticCurveTo(CX + 1.4, M + h * 1.5, CX, M + h * 1.6); g.quadraticCurveTo(CX - 1.4, M + h * 1.5, CX - 2.6, M); fill('#7a2a30');
    ell(CX, M + h * 1.1, 1.6, h * 0.5); fill('#e0707a'); g.beginPath(); g.moveTo(CX - 2.2, M + 0.3); g.quadraticCurveTo(CX, M + 0.1, CX + 2.2, M + 0.3); stroke('#ffffff', 0.6);
  } else if (mouth === 'grin' || mouth === 'smile') {
    g.beginPath(); g.moveTo(CX - 2.8, M - 0.4); g.quadraticCurveTo(CX, M + (mouth === 'grin' ? 2.6 : 1.6), CX + 2.8, M - 0.4); if (mouth === 'grin') { g.quadraticCurveTo(CX, M + 0.6, CX - 2.8, M - 0.4); fill('#8a3036'); } else stroke(lc, 0.7);
  } else if (mouth === 'frown') { g.beginPath(); g.moveTo(CX - 2.2, M + 0.8); g.quadraticCurveTo(CX, M - 0.6, CX + 2.2, M + 0.8); stroke(lc, 0.7); }
  else { g.beginPath(); g.moveTo(CX - 1.8, M); g.quadraticCurveTo(CX, M + 0.6, CX + 1.8, M); stroke(lc, 0.7); }
  // ===== 앞머리 (머리 다발: 뿌리에서 끝으로 가늘어지는 뾰족한 가닥) =====
  const capY = yT + 17, capR = 20.5;
  const hairCol = (x0, y0, x1, y1) => lin(x0, y0, x1, y1, [[0, H[1]], [0.5, H[2]], [1, H[3]]]);
  // 가닥 하나: 뿌리(rx, ry) 폭 w, 끝(tx, ty), 휘어짐 bend
  const lock = (rx, ry, w, tx, ty, bend, col) => { const mx = (rx + tx) / 2 + bend, my = (ry + ty) / 2; g.beginPath(); g.moveTo(rx - w / 2, ry); g.quadraticCurveTo(mx - w * 0.45, my, tx, ty); g.quadraticCurveTo(mx + w * 0.45, my, rx + w / 2, ry); g.closePath(); fill(col || hairCol(rx, ry, tx, ty)); };
  // 머리 윗부분(정수리)
  const crown = () => { g.beginPath(); g.ellipse(CX, capY, FW + 3.2, capR, 0, Math.PI, Math.PI * 2); g.lineTo(CX + FW + 3.2, capY + 2); g.quadraticCurveTo(CX, yT + 4, CX - FW - 3.2, capY + 2); g.closePath(); fill(hairCol(CX - FW, yT - 4, CX + FW, capY)); };
  const ring = () => { g.beginPath(); g.ellipse(CX, capY + 2, FW + 0.5, capR - 6, 0, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = lin(CX - FW, 0, CX + FW, 0, [[0, rgba(H[0], 0)], [0.3, rgba(H[0], 0.75)], [0.6, rgba(H[0], 0.45)], [1, rgba(H[0], 0)]]); g.lineWidth = 2.4; g.stroke(); };
  const bangs = (tipY, n, spread, sideLen) => {
    // 옆머리 (얼굴 테두리)
    for (const sd of [-1, 1]) { lock(CX + sd * (FW - 1), yT + 13, 7, CX + sd * (FW - 2.5), sideLen, sd * 1.5); lock(CX + sd * (FW + 1.5), yT + 15, 5, CX + sd * (FW + 1), sideLen - 6, sd * 2.5, H[3]); }
    for (let i = 0; i < n; i++) { const k = i / (n - 1) - 0.5, rx = CX + k * FW * 1.5, tx = CX + k * FW * spread + (k > 0 ? 1 : -1) * 0.5, len = tipY + (i % 2 ? -2.5 : 0) + Math.abs(k) * 3; lock(rx, yT + 9, 9.5, tx, len, k * 4); }
  };
  if (style === 'short' || style === 'spiky') {
    const sp = style === 'spiky';
    if (sp) for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * 0.15), rx = CX + Math.cos(a) * (FW - 2), ry = capY + Math.sin(a) * (capR - 4); lock(rx, ry, 9, rx + Math.cos(a) * 9, ry + Math.sin(a) * 8 - 2, (i % 2 ? 2 : -2), H[i < 3 ? 1 : 2]); }
    bangs(E - 7, 7, 1.7, E + 2); crown(); ring();
  } else if (style === 'buzz') {
    g.beginPath(); g.ellipse(CX, capY, FW + 1, capR - 1, 0, Math.PI, Math.PI * 2); g.lineTo(CX + FW, yT + 9); g.quadraticCurveTo(CX, yT + 4, CX - FW, yT + 9); fill(rgba(H[2], 0.9));
  } else if (style === 'long' || style === 'bob') {
    bangs(E - 4, 8, 1.6, style === 'long' ? yC + 14 : yC + 2); crown(); ring();
    if (style === 'long') for (const sd of [-1, 1]) { lock(CX + sd * (FW + 1), yC - 6, 8, CX + sd * (FW + 3), yN + 28, sd * 3); lock(CX + sd * (FW - 2), yC - 2, 6, CX + sd * (FW - 1), yN + 20, sd * 2, H[3]); }
  } else if (style === 'pony' || style === 'bun') {
    bangs(E - 6, 6, 1.5, style === 'pony' ? E + 6 : E + 4); crown(); ring();
    if (style === 'bun') { ell(CX, yT - 6, 8, 7); fill(rad(CX - 2, yT - 8, 1, 9, [[0, H[1]], [1, H[3]]])); g.beginPath(); g.arc(CX, yT - 6, 5, 3.6, 5.6); stroke(rgba(H[0], 0.6), 1); }
    if (style === 'pony') { ell(CX + FW + 0.5, yT + 6, 2.6, 2.6); fill('#ff6a8a'); }
  }
  // ===== 모자 =====
  if (o.hat === 'police') {
    g.beginPath(); g.moveTo(CX - FW - 2.5, yT + 9); g.lineTo(CX - FW - 5, yT - 6); g.quadraticCurveTo(CX, yT - 13, CX + FW + 5, yT - 6); g.lineTo(CX + FW + 2.5, yT + 9); g.closePath(); fill(lin(CX - FW, 0, CX + FW, 0, [[0, '#2a3a6e'], [0.6, '#1f2d5c'], [1, '#121c3e']]));
    g.beginPath(); g.roundRect(CX - FW - 2.5, yT + 3, FW * 2 + 5, 5.5, 1); fill('#0e1630');
    g.beginPath(); g.moveTo(CX - FW - 3, yT + 8.5); g.quadraticCurveTo(CX, yT + 15, CX + FW + 3, yT + 8.5); g.quadraticCurveTo(CX, yT + 11, CX - FW - 3, yT + 8.5); fill('#05080f');
    ell(CX, yT - 2, 3.4, 3.8); fill(rad(CX - 1, yT - 3, 0.5, 4, [[0, '#fff2a0'], [1, '#c9940f']]));
  }
  if (o.hat === 'helmet') {
    g.beginPath(); g.ellipse(CX, yT + 11, FW + 5, 20, 0, Math.PI, Math.PI * 2); g.closePath(); fill(rad(CX - 6, yT - 2, 2, 26, [[0, '#7a8a52'], [0.6, '#56663a'], [1, '#3a4626']]));
    const r = seeded(5); g.save(); g.beginPath(); g.ellipse(CX, yT + 11, FW + 5, 20, 0, Math.PI, Math.PI * 2); g.clip(); for (let i = 0; i < 14; i++) { ell(CX - FW - 4 + r() * (FW * 2 + 8), yT - 8 + r() * 18, 1.5 + r() * 2, 1 + r() * 1.5, r() * 3); fill('rgba(46,56,28,.6)'); } g.restore();
    g.beginPath(); g.roundRect(CX - FW - 6, yT + 9.5, FW * 2 + 12, 3, 1.5); fill('#2e381c');
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(CX + sd * (FW + 1), yT + 12); g.quadraticCurveTo(CX + sd * (FW + 0.5), E + 8, CX + sd * (FW - 5), yC - 4); stroke('#2e381c', 1.4); }
  }
  if (o.hat === 'propeller') {
    const cols = ['#e84040', '#ffd23a', '#3a7ae8', '#3ab860'];
    g.save(); g.beginPath(); g.ellipse(CX, yT + 8, FW + 3, 15, 0, Math.PI, Math.PI * 2); g.closePath(); g.clip();
    cols.forEach((col, i) => { g.beginPath(); g.moveTo(CX, yT + 8); g.arc(CX, yT + 8, 30, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4); g.closePath(); fill(col); });
    ell(CX - 5, yT - 2, 6, 3); fill('rgba(255,255,255,.35)'); g.restore();
    g.beginPath(); g.roundRect(CX - FW - 3.5, yT + 6.5, FW * 2 + 7, 2.6, 1.2); fill('#b02a2a');
    g.beginPath(); g.moveTo(CX, yT - 7); g.lineTo(CX, yT - 13); stroke('#888', 1.2); ell(CX, yT - 13.5, 1.6, 1.6); fill('#ffd23a');
    const L2 = [13, 7, 2, 7][(st.frame || 0) % 4]; g.beginPath(); g.roundRect(CX - L2, yT - 15, L2, 2, 1); fill('#e84040'); g.beginPath(); g.roundRect(CX + 0.5, yT - 15, L2, 2, 1); fill('#3a7ae8');
  }
  // ===== 안경 =====
  if (o.acc === 'glasses') {
    for (const sd of [-1, 1]) { const ex = CX + sd * EX; g.beginPath(); g.roundRect(ex - 5, E - 3.6, 10, 7.4, 2.5); fill('rgba(200,230,255,.12)'); stroke('#1a1a1a', 0.9); if (st.act && o.glint) { g.beginPath(); g.moveTo(ex + 1, E - 2.5); g.lineTo(ex + 3.5, E); stroke('#ffffff', 0.9); } }
    g.beginPath(); g.moveTo(CX - EX + 5, E - 1); g.quadraticCurveTo(CX, E - 2.2, CX + EX - 5, E - 1); stroke('#1a1a1a', 0.8);
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(CX + sd * (EX + 5), E - 1.5); g.lineTo(CX + sd * (FW + 0.5), E - 0.5); stroke('#1a1a1a', 0.8); }
  }
  // ===== 팔 (어깨-팔꿈치-손; 동작 중에는 기본 팔 대신 동작 팔만) =====
  const k = { CX, BX, yT, yC, E, M, FW, SW, yN, yS, S, topS, H, sy: yS + 5, sl: BX - SW + 3, sr: BX + SW - 3 };
  const def = [[k.sl - 3, k.sy + 26, k.sl - 1, k.sy + 52], [k.sr + 3, k.sy + 26, k.sr + 1, k.sy + 52]];
  const pose = (st.act && o.actPose ? o.actPose(k, st) : o.pose ? o.pose(k, st) : def).map((p, i) => p || def[i]);
  const short = of === 'tee' || of === 'stripe', armS = o.sleeve ? shadeHair(o.sleeve) : topS;
  const seg = (x0, y0, x1, y1, w, col, hi) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); stroke(col, w); if (hi) { g.beginPath(); g.moveTo(x0 - w * 0.12, y0); g.lineTo(x1 - w * 0.12, y1); stroke(hi, w * 0.55); } };
  pose.forEach((p, i) => {
    const sx = i ? k.sr : k.sl, sy = k.sy, [ex, ey, hx, hy] = p, dx = hx - ex, dy = hy - ey, d = Math.hypot(dx, dy) || 1, cx = hx - dx / d * 4.2, cy = hy - dy / d * 4.2;
    if (short) {
      const mx = sx + (ex - sx) * 0.5, my = sy + (ey - sy) * 0.5;
      seg(mx, my, ex, ey, 8, S[2], rgba(S[0], 0.45)); seg(ex, ey, cx, cy, 7.4, S[2], rgba(S[0], 0.45));
      seg(sx, sy, mx, my, 11.5, armS[3], rgba(armS[1], 0.35));
    } else {
      seg(ex, ey, cx, cy, 9, armS[3], rgba(armS[1], 0.3)); seg(sx, sy, ex, ey, 10.4, armS[2], rgba(armS[1], 0.35));
      ell(ex, ey, 4.8, 4.8); fill(armS[2]); seg(cx - dx / d * 0.4, cy - dy / d * 0.4, cx, cy, 9.2, rgba(armS[4], 0.6));
    }
    // 손
    const a = Math.atan2(dy, dx); ell(hx, hy, 4.4, 3.6, a); fill(rad(hx - 1, hy - 1, 0.5, 5, [[0, S[0]], [0.6, S[1]], [1, S[3]]]));
    ell(hx + Math.cos(a + 1.3) * 3, hy + Math.sin(a + 1.3) * 3, 1.6, 1.2, a); fill(S[2]);
  });
  if (o.drawAct) {
    const P = { rect: (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); }, disc: (x, y, r, col) => { ell(x, y, r, r); fill(col); }, set: (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); }, line: (x0, y0, x1, y1, th, col) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); stroke(col, th); } };
    o.drawAct(P, st, k, pose);
  }
  return c;
}
