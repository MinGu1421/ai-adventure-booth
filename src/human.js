// ---------- 반실사(Semi-realistic) 스탠딩 일러스트: 벡터로 그려 부드러운 음영 ----------
// 논리 좌표는 기존과 같은 96x144 (포즈 좌표 그대로 사용), 실제 캔버스는 4배 해상도
function vecHuman(o, st) {
  const Q = 4, c = document.createElement('canvas'); c.width = 96 * Q; c.height = 144 * Q;
  const g = c.getContext('2d'); g.scale(Q, Q); g.lineCap = 'round'; g.lineJoin = 'round';
  const CX = 48, child = o.age === 'child', old = o.age === 'old', fem = o.sex === 'f';
  const S = SKINS[o.skin || (old ? 'old' : 'light')], H = shadeHair(o.hair || '#2b1d14');
  const yT = child ? 20 : 14, yC = child ? 68 : 70, FW = child ? 17.5 : fem ? 15.5 : 16.5;
  const E = Math.round(yT + (yC - yT) * 0.53), BX = CX + (o.bodyX || 0);
  const SW0 = child ? 31 : fem ? 34 : old ? 37 : 40, SW = SW0 - 7, yN = child ? 80 : 82, yS = yN + 13;
  const NW = child || fem ? 5.5 : 7, style = o.style || 'short', of = o.outfit || 'tee';
  const top = o.top || '#4a6fd6', topS = shadeHair(top), look = st.look || 0;
  const rgba = (h, a) => { const v = hexRGBA(h); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')'; };
  const fill = (col) => { g.fillStyle = col; g.fill(); };
  const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([p, col]) => gr.addColorStop(p, col)); return gr; };
  const rad = (x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([p, col]) => gr.addColorStop(p, col)); return gr; };
  const ell = (x, y, rx, ry, rot) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2); };
  const stroke = (col, w) => { g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  const hairGrad = (y0, y1) => lin(0, y0, 0, y1, [[0, H[1]], [0.35, H[2]], [1, H[3]]]);
  const faceTop = yT, jaw = fem || child ? 0.55 : 0.68;

  // ===== 뒷머리 =====
  if (style === 'long') {
    g.beginPath(); g.moveTo(CX - FW - 3, yT + 12); g.bezierCurveTo(CX - FW - 8, yT + 40, CX - FW - 9, 100, CX - FW - 5, 120); g.quadraticCurveTo(CX, 126, CX + FW + 5, 120); g.bezierCurveTo(CX + FW + 9, 100, CX + FW + 8, yT + 40, CX + FW + 3, yT + 12); g.closePath(); fill(hairGrad(yT, 124));
  }
  if (style === 'bob') { g.beginPath(); g.moveTo(CX - FW - 3, yT + 10); g.bezierCurveTo(CX - FW - 7, yT + 30, CX - FW - 6, yC, CX - FW + 2, yC + 1); g.lineTo(CX + FW - 2, yC + 1); g.bezierCurveTo(CX + FW + 6, yC, CX + FW + 7, yT + 30, CX + FW + 3, yT + 10); g.closePath(); fill(hairGrad(yT, yC)); }
  if (style === 'pony') {
    const sw = st.act ? 2.5 : 0; g.beginPath(); g.moveTo(CX + FW - 2, yT + 6); g.bezierCurveTo(CX + FW + 10, yT + 10, CX + FW + 8 + sw, yT + 34, CX + FW + 5 + sw, yT + 60); g.bezierCurveTo(CX + FW + 1 + sw, yT + 40, CX + FW + 1, yT + 22, CX + FW - 4, yT + 14); g.closePath(); fill(hairGrad(yT, yT + 60));
  }
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
  if (of === 'tee') { ell(BX, yN - 3, NW + 1, 6); fill(lin(BX - NW, 0, BX + NW, 0, [[0, S[1]], [1, S[3]]])); g.beginPath(); g.ellipse(BX, yN - 3, NW + 1.6, 6.6, 0, 0, Math.PI); stroke(topS[3], 1.6); }
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
  // ===== 귀 (얼굴 옆, 눈~코 높이) =====
  for (const sd of [-1, 1]) { ell(CX + sd * (FW - 0.3), E + 4, 3, 5.5, sd * 0.15); fill(sd < 0 ? S[2] : S[3]); ell(CX + sd * (FW - 0.1), E + 4.3, 1.4, 3.2, sd * 0.15); fill(rgba(S[4], 0.45)); }
  // ===== 얼굴 =====
  const face = () => { g.beginPath(); g.moveTo(CX, faceTop); g.bezierCurveTo(CX + FW * 0.78, faceTop, CX + FW, faceTop + (E - faceTop) * 0.5, CX + FW, E + 1); g.bezierCurveTo(CX + FW, E + (yC - E) * 0.5, CX + FW * jaw, yC - 3, CX, yC); g.bezierCurveTo(CX - FW * jaw, yC - 3, CX - FW, E + (yC - E) * 0.5, CX - FW, E + 1); g.bezierCurveTo(CX - FW, faceTop + (E - faceTop) * 0.5, CX - FW * 0.78, faceTop, CX, faceTop); g.closePath(); };
  face(); fill(rad(CX - FW * 0.3, E - 5, 1, FW * 1.75, [[0, S[0]], [0.42, S[1]], [0.78, S[2]], [1, S[3]]]));
  g.save(); face(); g.clip();
  ell(CX + FW * 0.9, E + 6, FW * 0.45, 16); fill(rgba(S[3], 0.35)); // 오른쪽 볼 그림자
  for (const sd of [-1, 1]) { ell(CX + sd * 10, E + 7.5, 4.2, 2.8); fill(fem || child ? 'rgba(240,120,120,.28)' : 'rgba(225,120,100,.13)'); }
  if (o.stubble) { g.beginPath(); g.moveTo(CX - FW, E + 10); g.bezierCurveTo(CX - FW * 0.7, yC + 2, CX + FW * 0.7, yC + 2, CX + FW, E + 10); g.lineTo(CX + FW, yC + 4); g.lineTo(CX - FW, yC + 4); fill('rgba(70,50,40,.12)'); }
  if (old) { for (const yy of [faceTop + 9, faceTop + 12]) { g.beginPath(); g.moveTo(CX - 6, yy); g.quadraticCurveTo(CX, yy - 1, CX + 6, yy); stroke(rgba(S[3], 0.5), 0.6); } for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(CX + sd * 6, E + 11); g.quadraticCurveTo(CX + sd * 8, E + 15, CX + sd * 6.5, E + 19); stroke(rgba(S[3], 0.6), 0.7); } }
  g.restore();
  // ===== 눈 =====
  const EX = child ? 7.8 : 7.3, eh = child ? 3.6 : fem ? 3.3 : 2.9, ew = child ? 3.7 : 3.6, iris = o.eyes || '#3a2618';
  for (const sd of [-1, 1]) {
    const ex = CX + sd * EX;
    // 눈두덩 음영 + 쌍꺼풀 선
    ell(ex, E - 2.2, ew + 1.2, 2.2); fill(rgba(S[3], 0.22));
    if (st.blink) { g.beginPath(); g.moveTo(ex - ew, E + 0.4); g.quadraticCurveTo(ex, E + 2.2, ex + ew, E + 0.2); stroke('#3a2418', 0.9); continue; }
    g.beginPath(); g.moveTo(ex - ew, E + 0.5); g.quadraticCurveTo(ex, E - eh, ex + ew, E + 0.2); g.quadraticCurveTo(ex, E + eh * 0.8, ex - ew, E + 0.5); g.closePath(); fill('#fbf8f4');
    g.save(); g.clip();
    const ix = ex + look * 1.1 + sd * -0.2; ell(ix, E + 0.1, 2.15, 2.15); fill(rad(ix, E + 0.6, 0.3, 2.2, [[0, shadeHair(iris)[1]], [0.6, iris], [1, shadeHair(iris)[4]]]));
    ell(ix, E + 0.1, 1.05, 1.05); fill('#120a08'); ell(ix - 0.7, E - 0.8, 0.6, 0.6); fill('#ffffff'); ell(ix + 0.7, E + 0.9, 0.3, 0.3); fill('rgba(255,255,255,.8)');
    g.beginPath(); g.moveTo(ex - ew, E - eh); g.lineTo(ex + ew, E - eh); g.lineTo(ex + ew, E - eh + 1.2); g.lineTo(ex - ew, E - eh + 1.2); fill('rgba(60,30,20,.25)');
    g.restore();
    g.beginPath(); g.moveTo(ex - ew - 0.2, E + 0.5); g.quadraticCurveTo(ex, E - eh - 0.2, ex + ew + 0.2, E + 0.1); stroke('#2a1810', fem ? 1.05 : 0.85);
    if (fem) { g.beginPath(); g.moveTo(ex + sd * ew, E + 0.2); g.lineTo(ex + sd * (ew + 1.3), E - 0.9); stroke('#2a1810', 0.7); }
    g.beginPath(); g.moveTo(ex - ew + 1, E + 1.7); g.quadraticCurveTo(ex, E + eh * 0.9, ex + ew - 1, E + 1.5); stroke(rgba(S[4], 0.35), 0.5);
    g.beginPath(); g.moveTo(ex - ew + 0.5, E - eh - 1.1); g.quadraticCurveTo(ex, E - eh - 2.3, ex + ew - 0.2, E - eh - 1); stroke(rgba(S[4], 0.3), 0.45);
  }
  // ===== 눈썹 =====
  const br = o.browStyle || 'normal', bc = o.brow || H[3];
  for (const sd of [-1, 1]) {
    const ex = CX + sd * EX, up = br === 'up' ? (st.act ? 2.2 : 1.2) : 0;
    let inY = E - 5.6 - up, outY = E - 5.4 - up, pk = E - 7 - up;
    if (br === 'sharp') { inY = E - 5.1; outY = E - 6.4; pk = E - 6.6; }
    g.beginPath(); g.moveTo(ex - sd * 3.8, inY); g.quadraticCurveTo(ex + sd * 0.5, pk, ex + sd * 4.2, outY); stroke(bc, fem || child ? 1.0 : 1.35);
  }
  // ===== 코 =====
  g.beginPath(); g.moveTo(CX + 1.6, E + 3); g.quadraticCurveTo(CX + 2.6, E + 7, CX + 2.2, E + 10); stroke(rgba(S[3], 0.45), 1.1);
  ell(CX - 0.2, E + 9.6, 2.2, 1.3); fill(rgba(S[0], 0.55));
  g.beginPath(); g.moveTo(CX - 2.6, E + 10.6); g.quadraticCurveTo(CX, E + 12.3, CX + 2.6, E + 10.6); stroke(rgba(S[4], 0.45), 0.8);
  // ===== 입 =====
  const M = Math.round(E + (yC - E) * 0.62), lc = fem ? '#cf5f78' : '#b8695a', lc2 = fem ? '#ee9fae' : '#d79a88';
  const mouth = st.talk ? 'talk' : (st.act && o.actMouth) || o.mouth || 'neutral';
  if (mouth === 'talk' || mouth === 'open') {
    const h = mouth === 'open' ? 3.6 : 2.6; ell(CX, M + 0.6, 3.6, h); fill('#5a1a1a'); g.save(); ell(CX, M + 0.6, 3.6, h); g.clip(); g.fillStyle = '#f4f0ea'; g.fillRect(CX - 4, M - h + 0.6, 8, 1.2); ell(CX, M + h, 2.4, 1.3); fill('#c85a5a'); g.restore();
    g.beginPath(); g.ellipse(CX, M + 0.6, 3.8, h + 0.3, 0, 0, Math.PI * 2); stroke(lc, 0.7);
  } else {
    const curve = mouth === 'smile' || mouth === 'grin' ? -1.1 : mouth === 'frown' ? 0.9 : -0.2;
    g.beginPath(); g.moveTo(CX - 3.6, M + curve); g.quadraticCurveTo(CX - 1.2, M - 1.1, CX, M - 0.6); g.quadraticCurveTo(CX + 1.2, M - 1.1, CX + 3.6, M + curve); g.quadraticCurveTo(CX, M + 0.4, CX - 3.6, M + curve); fill(lc);
    g.beginPath(); g.moveTo(CX - 3.2, M + curve * 0.7); g.quadraticCurveTo(CX, M + 2.8 + (curve > 0 ? -0.6 : 0), CX + 3.2, M + curve * 0.7); g.quadraticCurveTo(CX, M + 0.6, CX - 3.2, M + curve * 0.7); fill(lc2);
    if (mouth === 'grin') { g.beginPath(); g.moveTo(CX - 2.8, M + 0.1); g.quadraticCurveTo(CX, M + 1.4, CX + 2.8, M + 0.1); stroke('#f6f2ee', 0.9); }
    g.beginPath(); g.moveTo(CX - 3.6, M + curve); g.quadraticCurveTo(CX, M + 0.6, CX + 3.6, M + curve); stroke(rgba('#5a2a24', 0.6), 0.5);
  }
  // ===== 앞머리 =====
  const capY = yT + 16, capR = 18.5;
  const capPath = (sideY, inner) => {
    g.beginPath(); g.moveTo(CX - FW - 1.5, sideY); g.lineTo(CX - FW - 2.6, capY); g.ellipse(CX, capY, FW + 2.6, capR, 0, Math.PI, Math.PI * 2); g.lineTo(CX + FW + 1.5, sideY);
    inner();
    g.closePath();
  };
  const sheen = () => { g.beginPath(); g.ellipse(CX - 2, capY, FW - 1, capR - 4, 0, Math.PI * 1.15, Math.PI * 1.6); stroke(rgba(H[0], 0.55), 2.2); };
  const strands = (y1) => { g.save(); g.clip(); for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(CX + i * 3, yT + 1); g.quadraticCurveTo(CX + i * 5, yT + 5, CX + i * 4.5 - 2, y1); stroke(rgba(H[4], 0.3), 0.5); } g.restore(); };
  const fringeShort = (sideY) => capPath(sideY, () => { g.bezierCurveTo(CX + FW, E - 9, CX + FW - 3, yT + 9, CX + 8, yT + 10); g.bezierCurveTo(CX + 2, yT + 12, CX - 6, yT + 9, CX - 10, yT + 11); g.bezierCurveTo(CX - FW + 1, yT + 12, CX - FW + 0.5, E - 9, CX - FW - 1.5, sideY); });
  if (style === 'short' || style === 'spiky') {
    fringeShort(E - 5); fill(hairGrad(yT - 4, E)); strands(yT + 9); sheen();
    if (style === 'spiky') { for (let i = -4; i <= 4; i++) { const x = CX + i * 4.2; g.beginPath(); g.moveTo(x - 3, yT + 1); g.lineTo(x + (i % 2 ? 1 : -1), yT - 6 - (2 - Math.abs(i) * 0.4)); g.lineTo(x + 3, yT + 1); fill(i < 0 ? H[1] : H[2]); } }
  } else if (style === 'buzz') {
    g.beginPath(); g.ellipse(CX, capY, FW + 1, capR - 1, 0, Math.PI, Math.PI * 2); g.lineTo(CX + FW, yT + 9); g.quadraticCurveTo(CX, yT + 4, CX - FW, yT + 9); fill(rgba(H[2], 0.9));
  } else if (style === 'long' || style === 'bob') {
    const bot = style === 'long' ? yC + 10 : yC - 1;
    capPath(bot, () => { g.bezierCurveTo(CX + FW - 1, yC - 10, CX + FW - 1.5, E - 6, CX + FW - 2, yT + 14); g.bezierCurveTo(CX + 8, yT + 8, CX - 2, yT + 10, CX - 6, yT + 14); g.bezierCurveTo(CX - FW + 2, yT + 10, CX - FW + 1, E - 6, CX - FW + 1, yC - 10); g.lineTo(CX - FW - 1.5, bot); });
    fill(hairGrad(yT - 4, bot)); strands(yT + 12); sheen();
    if (style === 'long') for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(CX + sd * (FW + 1), yC - 4); g.bezierCurveTo(CX + sd * (FW + 3), yN + 4, CX + sd * (FW + 6), yN + 14, CX + sd * (FW + 2), yN + 26); g.lineTo(CX + sd * (FW - 4), yN + 18); g.bezierCurveTo(CX + sd * (FW - 2), yN + 6, CX + sd * (FW - 2), yC, CX + sd * (FW - 2), yC - 6); g.closePath(); fill(hairGrad(yC - 6, yN + 26)); }
  } else if (style === 'pony' || style === 'bun') {
    capPath(E - 6, () => { g.bezierCurveTo(CX + FW - 0.5, E - 10, CX + FW - 2, yT + 9, CX + 4, yT + 7); g.bezierCurveTo(CX - 4, yT + 6, CX - 10, yT + 11, CX - FW + 0.5, E - 8); g.lineTo(CX - FW - 1.5, E - 6); });
    fill(hairGrad(yT - 4, E)); strands(yT + 8); sheen();
    if (style === 'bun') { ell(CX, yT - 5, 7.5, 6.5); fill(rad(CX - 2, yT - 7, 1, 8, [[0, H[1]], [1, H[3]]])); g.beginPath(); g.moveTo(CX - 6, yT - 1); g.quadraticCurveTo(CX, yT + 1, CX + 6, yT - 1); stroke(H[4], 1); }
    if (style === 'pony') { g.beginPath(); g.roundRect(CX + FW - 1.5, yT + 5, 3.5, 4, 1); fill('#e8506a'); }
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
  const short = of === 'tee', armS = o.sleeve ? shadeHair(o.sleeve) : topS;
  const seg = (x0, y0, x1, y1, w, col, hi) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); stroke(col, w); if (hi) { g.beginPath(); g.moveTo(x0 - w * 0.18, y0); g.lineTo(x1 - w * 0.18, y1); stroke(hi, w * 0.3); } };
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
