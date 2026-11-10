// ---------- 애니메이션 일러스트 스타일 스탠딩 일러스트 (부드러운 붓 음영, 큰 눈, 가는 머리결) ----------
// 논리 좌표 96x144 (포즈 좌표 그대로), 실제 캔버스 4배 해상도. 캐릭터마다 얼굴형·눈·눈썹·머리 모양이 다름
function vecHuman(o, st) {
  const Q = 4, c = document.createElement('canvas'); c.width = 96 * Q; c.height = 144 * Q;
  const g = c.getContext('2d'); g.scale(Q, Q); g.lineCap = 'round'; g.lineJoin = 'round';
  const F = o.face || {}, CX = 48, child = o.age === 'child', old = o.age === 'old', fem = o.sex === 'f';
  const S = SKINS[o.skin || (old ? 'old' : 'light')], H = shadeHair(o.hair || '#2b1d14');
  const yT = child ? 13 : 10, yC = (child ? 62 : 65) + (F.long || 0), FW = (child ? 19 : fem ? 18 : 18.6) * (F.w || 1);
  const E = Math.round(yT + (yC - yT) * (F.eyeY || 0.58)), BX = CX + (o.bodyX || 0);
  const SW0 = child ? 29 : fem ? 31 : old ? 33 : 35, SW = SW0 - 7, yN = yC + 10, yS = yN + 13;
  const NW = child || fem ? 4.3 : 5.3, style = o.style || 'neat', of = o.outfit || 'tee';
  const top = o.top || '#4a6fd6', topS = shadeHair(top), look = (st.look || 0);
  const rgba = (h, a) => { const v = hexRGBA(h); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')'; };
  const fill = (col) => { g.fillStyle = col; g.fill(); };
  const FLAT = !o.grad; let keep = false; // 3D 느낌(그라데이션) 없이 평면 채색 + 선화
  const flat = stops => stops[Math.min(stops.length - 1, stops.length > 2 ? 1 : 0)][1];
  const lin = (x0, y0, x1, y1, stops) => { if (FLAT && !keep) return flat(stops); const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([p, col]) => gr.addColorStop(p, col)); return gr; };
  const rad = (x, y, r0, r1, stops) => { if (FLAT && !keep) return flat(stops); const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([p, col]) => gr.addColorStop(p, col)); return gr; };
  const ell = (x, y, rx, ry, rot) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2); };
  const stroke = (col, w) => { g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  const soft = (px, fn, force) => { g.save(); if (!FLAT || force) g.filter = 'blur(' + px + 'px)'; fn(); g.restore(); }; // 붓으로 문지른 듯한 부드러운 음영
  const R = seeded(o.seed || 7);
  const hairCol = (x0, y0, x1, y1) => lin(x0, y0, x1, y1, [[0, H[1]], [0.45, H[2]], [1, H[3]]]);
  // 머리 가닥: 뿌리(rx, ry) 폭 w → 끝(tx, ty), bend 만큼 휨. 가는 머리결 선을 함께 그림
  const lock = (rx, ry, w, tx, ty, bend, col) => {
    const mx = (rx + tx) / 2 + bend, my = (ry + ty) / 2;
    g.beginPath(); g.moveTo(rx - w / 2, ry); g.quadraticCurveTo(mx - w * 0.45, my, tx, ty); g.quadraticCurveTo(mx + w * 0.45, my, rx + w / 2, ry); g.closePath(); fill(col || hairCol(rx, ry, tx, ty)); if (FLAT) { g.beginPath(); g.moveTo(rx - w / 2, ry); g.quadraticCurveTo(mx - w * 0.45, my, tx, ty); g.quadraticCurveTo(mx + w * 0.45, my, rx + w / 2, ry); stroke(rgba(H[4], 0.85), 0.4); }
    for (const [f, cl, lw] of [[-0.18, rgba(H[4], 0.45), 0.35], [0.12, rgba(H[0], 0.35), 0.3]]) { g.beginPath(); g.moveTo(rx + w * f, ry + 1); g.quadraticCurveTo(mx + w * f * 0.6, my, tx + (rx - tx) * 0.12, ty + (ry - ty) * 0.12); stroke(cl, lw); }
  };
  const zig = (xL, xR, yb, n, amp) => { for (let i = 0; i <= n; i++) { const x = xR + (xL - xR) * (i / n); g.lineTo(x, yb + (i % 2 ? -amp : 0)); } };

  // ===== 뒷머리 =====
  const backG = (y0, y1) => lin(0, y0, 0, y1, [[0, H[2]], [0.6, H[3]], [1, H[4]]]);
  if (style === 'long' || style === 'wavy') {
    const bot = style === 'wavy' ? 120 : 126;
    g.beginPath(); g.moveTo(CX - FW - 3, yT + 10); g.bezierCurveTo(CX - FW - 10, yT + 40, CX - FW - 11, 100, CX - FW - 7, bot); g.lineTo(CX + FW + 7, bot); zig(CX - FW - 7, CX + FW + 7, bot, 10, 7); g.lineTo(CX - FW - 7, bot); g.closePath(); fill(backG(yT, bot));
    g.beginPath(); g.moveTo(CX + FW + 7, bot); g.bezierCurveTo(CX + FW + 11, 100, CX + FW + 10, yT + 40, CX + FW + 3, yT + 10); g.lineTo(CX - FW - 3, yT + 10); g.lineTo(CX - FW - 7, bot); g.closePath(); fill(backG(yT, bot));
  }
  if (style === 'bob') { g.beginPath(); g.moveTo(CX - FW - 3, yT + 8); g.bezierCurveTo(CX - FW - 8, yT + 30, CX - FW - 7, yC, CX - FW - 4, yC + 2); zig(CX - FW - 4, CX + FW + 4, yC + 2, 9, 2.5); g.bezierCurveTo(CX + FW + 7, yC, CX + FW + 8, yT + 30, CX + FW + 3, yT + 8); g.closePath(); fill(backG(yT, yC + 4)); }
  if (style === 'pony') { const sw = st.act ? 2.5 : 0; for (let i = 0; i < 3; i++) lock(CX + FW + 1 - i * 2, yT + 6 + i * 2, 9 - i * 2, CX + FW + 7 + sw - i * 1.5, yT + 62 - i * 6, 6 - i, i ? H[3] : null); }
  if (style !== 'long' && style !== 'wavy' && style !== 'bob' && style !== 'buzz') { g.beginPath(); g.ellipse(CX, yT + 18, FW + 4, 22, 0, Math.PI * 0.9, Math.PI * 2.1); g.closePath(); fill(H[3]); }
  // ===== 목 =====
  const nTop = yC - 9, nBot = yN + 4;
  g.beginPath(); g.moveTo(CX - NW, nTop); g.lineTo(CX + NW, nTop); g.lineTo(BX + NW + 0.5, nBot); g.lineTo(BX - NW - 0.5, nBot); g.closePath();
  if (FLAT) { g.save(); fill(S[0]); stroke('rgba(130,70,55,.55)', 0.5); g.restore(); g.beginPath(); g.moveTo(CX - NW, nTop); g.lineTo(CX + NW, nTop); g.lineTo(BX + NW + 0.5, nBot); g.lineTo(BX - NW - 0.5, nBot); g.closePath(); }
  fill(lin(CX - NW, 0, CX + NW, 0, [[0, S[1]], [0.6, S[2]], [1, S[3]]]));
  ell(CX + 0.5, yC + 1.5, NW + 1, 3.5); fill(rgba(S[4], 0.35));
  // ===== 몸통 =====
  const SWt = SW0 - 5;
  const torso = () => { g.beginPath(); g.moveTo(BX - NW - 2, yN - 3); g.bezierCurveTo(BX - NW - 9, yN - 1, BX - SWt + 2, yN + 2, BX - SWt, yS + 4); g.lineTo(BX - SWt - 1.5, 150); g.lineTo(BX + SWt + 1.5, 150); g.lineTo(BX + SWt, yS + 4); g.bezierCurveTo(BX + SWt - 2, yN + 2, BX + NW + 9, yN - 1, BX + NW + 2, yN - 3); g.closePath(); };
  torso(); fill(lin(BX - SWt, 0, BX + SWt, 0, [[0, topS[1]], [0.35, topS[2]], [0.75, topS[3]], [1, topS[4]]])); if (FLAT) { g.save(); torso(); g.clip(); g.beginPath(); g.moveTo(BX + SWt * 0.35, yN); g.quadraticCurveTo(BX + SWt * 0.25, yS + 20, BX + SWt * 0.45, 150); g.lineTo(BX + SWt + 3, 150); g.lineTo(BX + SWt + 3, yN - 6); g.closePath(); fill(rgba(topS[4], 0.35)); g.restore(); torso(); stroke(rgba(topS[4], 0.95), 0.7); }
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
  // ===== 귀 =====
  for (const sd of [-1, 1]) { ell(CX + sd * (FW - 1), E + 2, 2.3, 4.2, sd * 0.2); fill(sd < 0 ? S[1] : S[2]); ell(CX + sd * (FW - 0.6), E + 2.3, 1, 2.4, sd * 0.2); fill(rgba(S[3], 0.5)); }
  // ===== 얼굴형 (v: 갸름, round: 둥글, square: 각짐) =====
  const jw = F.jaw || 'v';
  const face = () => {
    g.beginPath(); g.moveTo(CX, yT); g.bezierCurveTo(CX + FW * 0.8, yT, CX + FW, yT + (E - yT) * 0.45, CX + FW, E);
    if (jw === 'square') { g.bezierCurveTo(CX + FW, E + 8, CX + FW * 0.92, yC - 7, CX + FW * 0.6, yC - 2); g.quadraticCurveTo(CX, yC + 1.5, CX - FW * 0.6, yC - 2); g.bezierCurveTo(CX - FW * 0.92, yC - 7, CX - FW, E + 8, CX - FW, E); }
    else if (jw === 'round') { g.bezierCurveTo(CX + FW, E + 10, CX + FW * 0.62, yC, CX, yC); g.bezierCurveTo(CX - FW * 0.62, yC, CX - FW, E + 10, CX - FW, E); }
    else { g.bezierCurveTo(CX + FW * 0.98, E + 7, CX + FW * 0.7, yC - 8, CX + 3, yC - 1); g.quadraticCurveTo(CX, yC + 0.6, CX - 3, yC - 1); g.bezierCurveTo(CX - FW * 0.7, yC - 8, CX - FW * 0.98, E + 7, CX - FW, E); }
    g.bezierCurveTo(CX - FW, yT + (E - yT) * 0.45, CX - FW * 0.8, yT, CX, yT); g.closePath();
  };
  face(); fill(lin(0, yT, 0, yC, [[0, S[1]], [0.5, S[0]], [1, S[0]]]));
  g.save(); face(); g.clip();
  soft(5, () => {
    ell(CX, yT + 4, FW + 2, 13); fill(rgba(S[3], FLAT ? 0.35 : 0.55));                // 앞머리 그림자
    ell(CX + FW * 1.02, E + 6, FW * 0.42, 18); fill(rgba(S[2], FLAT ? 0.45 : 0.6));     // 오른쪽 볼 그림자
    if (!FLAT) { ell(CX - FW * 1.05, E + 4, FW * 0.25, 14); fill(rgba(S[2], 0.35)); ell(CX, yC + 2, FW * 0.5, 4); fill(rgba(S[2], 0.35)); }
  });
  soft(4, () => { for (const sd of [-1, 1]) { ell(CX + sd * 10, E + 7, 5.5, 3); fill(fem || child ? 'rgba(255,105,115,.55)' : 'rgba(235,110,100,.32)'); } }, true);
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(CX + sd * 8 + i * 1.6 - 0.6, E + 7.8); g.lineTo(CX + sd * 8 + i * 1.6 + 0.4, E + 6); stroke('rgba(215,75,85,.5)', 0.35); }
  const ex_ = F.extra || [];
  if (ex_.includes('freckle')) for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { ell(CX + sd * (7 + R() * 7), E + 5 + R() * 4, 0.45, 0.45); fill('rgba(150,80,50,.6)'); }
  if (ex_.includes('stubble')) soft(2, () => { g.beginPath(); g.moveTo(CX - FW, E + 9); g.bezierCurveTo(CX - FW * 0.7, yC + 2, CX + FW * 0.7, yC + 2, CX + FW, E + 9); g.lineTo(CX + FW, yC + 4); g.lineTo(CX - FW, yC + 4); fill('rgba(70,60,60,.22)'); });
  if (ex_.includes('wrinkle') || old) { for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(CX + sd * 5.5, E + 9); g.quadraticCurveTo(CX + sd * 7.5, E + 12, CX + sd * 6, E + 15); stroke(rgba(S[3], 0.6), 0.6); for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(CX + sd * 12.5, E - 1 + i * 1.6); g.lineTo(CX + sd * 14.5, E - 1.6 + i * 1.8); stroke(rgba(S[3], 0.5), 0.45); } } }
  g.restore();
  face(); stroke('rgba(130,70,55,.55)', 0.55);
  if (ex_.includes('bandaid')) { g.save(); g.translate(CX + 6, E + 6); g.rotate(-0.5); g.beginPath(); g.roundRect(-4, -1.4, 8, 2.8, 1.2); fill('#f2c9a0'); stroke('rgba(150,100,70,.6)', 0.3); g.beginPath(); g.roundRect(-1.4, -1.2, 2.8, 2.4, 0.5); fill('#e8b088'); g.restore(); }
  // ===== 눈 (종류: big 기본 / narrow 가늘게 / sharp 치켜 / droopy 처진 / half 반쯤 감은 / smile 웃는 눈) =====
  const ek = F.eye || 'big', es = F.eyeS || 1;
  const EX = (child ? 8.2 : 7.9) * (F.eyeX || 1), ew = (child ? 4.6 : fem ? 4.6 : 4.4) * es, iris = o.eyes || '#5a3020';
  let eh = (child ? 6.6 : fem ? 6.3 : 5.4) * es; if (ek === 'narrow') eh *= 0.55; if (ek === 'sharp') eh *= 0.8; if (old) eh *= 0.8;
  const lashW = (F.lash || (fem || child ? 1.9 : 1.6));
  keep = true;
  for (const sd of [-1, 1]) {
    const ex = CX + sd * EX, yE = E + 0.5, tilt = ek === 'sharp' ? 1.4 : ek === 'droopy' ? -1.4 : 0;
    const oy = -tilt * 0.6; // 바깥쪽 끝 높이 변화
    if (st.blink || ek === 'smile') { g.beginPath(); g.moveTo(ex - ew - 0.5, yE + (ek === 'smile' ? 1 : 0)); g.quadraticCurveTo(ex, yE + (ek === 'smile' ? -2.4 : 2.4), ex + ew + 0.5, yE + (ek === 'smile' ? 1 : -0.2)); stroke('#2a1410', 1.4); g.beginPath(); g.moveTo(ex + sd * (ew + 0.3), yE); g.lineTo(ex + sd * (ew + 1.8), yE - 0.9); stroke('#2a1410', 0.8); continue; }
    const inX = ex - sd * ew, outX = ex + sd * ew;
    const topY = yE - eh * 0.62, botY = yE + eh * 0.42;
    const eyeP = () => { g.beginPath(); g.moveTo(inX, yE + 0.3); g.bezierCurveTo(ex - sd * ew * 0.6, topY - 0.4, ex + sd * ew * 0.6, topY - 0.8 + oy, outX, yE - 0.5 + oy * 2); g.bezierCurveTo(ex + sd * ew * 0.7, botY + 0.6 + oy, ex - sd * ew * 0.7, botY + 0.8, inX, yE + 0.3); g.closePath(); };
    eyeP(); fill('#fbf8f6');
    g.save(); eyeP(); g.clip();
    const ix = ex + look * 1.2, iy = yE + 0.4, irx = ew * 0.72, iry = Math.max(eh * 0.62, 2.4);
    ell(ix, iy, irx, iry); fill(lin(0, iy - iry, 0, iy + iry, [[0, '#120806'], [0.42, iris], [0.85, shadeHair(iris)[0]], [1, shadeHair(iris)[1]]]));
    ell(ix, iy - 0.3, irx * 0.46, iry * 0.52); fill('rgba(10,4,3,.9)');
    soft(1.2, () => { g.beginPath(); g.moveTo(ex - ew - 1, topY - 1); g.lineTo(ex + ew + 1, topY - 1); g.lineTo(ex + ew + 1, topY + 2.6); g.quadraticCurveTo(ex, topY + 3.8, ex - ew - 1, topY + 2.6); g.closePath(); fill('rgba(40,15,25,.55)'); });
    ell(ix - irx * 0.42, iy - iry * 0.42, irx * 0.4, iry * 0.26, -0.3); fill('#ffffff');
    ell(ix + irx * 0.42, iy + iry * 0.4, irx * 0.18, iry * 0.12); fill('rgba(255,255,255,.95)');
    soft(0.8, () => { ell(ix, iy + iry * 0.65, irx * 0.6, iry * 0.2); fill(rgba(shadeHair(iris)[0], 0.7)); });
    if (ek === 'half') { g.beginPath(); g.moveTo(ex - ew - 1, topY - 2); g.lineTo(ex + ew + 1, topY - 2); g.lineTo(ex + ew + 1, yE - eh * 0.1); g.lineTo(ex - ew - 1, yE - eh * 0.05); g.closePath(); fill(S[1]); }
    g.restore();
    // 윗눈꺼풀 + 속눈썹
    const lidY = ek === 'half' ? yE - eh * 0.08 : null;
    g.beginPath(); if (lidY != null) { g.moveTo(inX, lidY + 0.3); g.lineTo(outX, lidY - 0.3 + oy); } else { g.moveTo(inX - sd * 0.4, yE + 0.6); g.bezierCurveTo(ex - sd * ew * 0.6, topY - 0.8, ex + sd * ew * 0.6, topY - 1.2 + oy, outX + sd * 0.6, yE - 0.8 + oy * 2); }
    stroke('#22100c', lashW);
    const ly = (lidY != null ? lidY : yE - 0.8) + oy * 2;
    g.beginPath(); g.moveTo(ex + sd * (ew - 0.6), ly - 0.6); g.lineTo(ex + sd * (ew + 2.2), ly - 2 - tilt * 0.5); g.lineTo(ex + sd * (ew + 0.4), ly + 0.8); g.closePath(); fill('#22100c');
    if (fem || child) for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(ex + sd * (ew - 1.6 - i * 1.6), topY + 0.4 + oy); g.lineTo(ex + sd * (ew - 0.6 - i * 1.6), topY - 1.3 + oy); stroke('#22100c', 0.6); }
    g.beginPath(); g.moveTo(ex + sd * (ew * 0.1), botY + 0.4); g.quadraticCurveTo(ex + sd * ew * 0.6, botY + 0.3 + oy, outX - sd * 0.2, yE + 1 + oy); stroke('rgba(90,40,35,.55)', 0.5);
    g.beginPath(); g.moveTo(ex - ew * 0.5, topY - 1.9); g.quadraticCurveTo(ex, topY - 2.7, ex + ew * 0.7, topY - 1.7 + oy); stroke(rgba(S[3], 0.5), 0.4);
    if (old) { g.beginPath(); g.moveTo(ex - ew * 0.6, botY + 1.6); g.quadraticCurveTo(ex, botY + 2.4, ex + ew * 0.6, botY + 1.6); stroke(rgba(S[3], 0.55), 0.4); }
  }
  keep = false;
  // ===== 눈썹 (굵기 F.brow, 모양: angry 미간 내림 / worried 미간 올림 / normal) =====
  const bk = o.browStyle || 'normal', bw = F.brow || (fem || child ? 0.9 : 1.2), bc = o.brow || H[3];
  for (const sd of [-1, 1]) {
    const ex = CX + sd * EX, up = bk === 'up' ? (st.act ? 2 : 1) : 0, base = E - eh * 0.62 - 3.4 - up;
    let inY = base + 0.3, outY = base + 0.6, pk = base - 1.2;
    if (bk === 'sharp' || bk === 'angry') { inY = base + 1.6; outY = base - 0.6; pk = base - 0.4; }
    if (bk === 'worried') { inY = base - 1.2; outY = base + 1; pk = base - 1; }
    g.beginPath(); g.moveTo(ex - sd * 3.4, inY); g.quadraticCurveTo(ex + sd * 0.6, pk, ex + sd * 4.3, outY); stroke(bc, bw);
    if (bw > 1.4) { g.beginPath(); g.moveTo(ex - sd * 3.4, inY + 0.5); g.quadraticCurveTo(ex + sd * 0.6, pk + 0.6, ex + sd * 3.6, outY + 0.5); stroke(bc, bw * 0.7); }
  }
  // ===== 코 =====
  const nz = F.nose || 1;
  g.beginPath(); g.moveTo(CX + 0.4, E + 7.2 * nz); g.lineTo(CX + 1.3 * nz, E + 9.2 * nz); g.lineTo(CX - 0.3, E + 9.5 * nz); stroke(rgba(S[3], 0.85), 0.6);
  if (nz > 1.1) { ell(CX - 1.2, E + 9.8 * nz, 0.5, 0.35); fill(rgba(S[4], 0.5)); ell(CX + 1.6, E + 9.8 * nz, 0.5, 0.35); fill(rgba(S[4], 0.5)); }
  // ===== 입 =====
  const M = Math.round(E + (yC - E) * 0.58), lc = '#a8484a', mw = F.mouthW || 1;
  const mouth = st.talk ? 'talk' : (st.act && o.actMouth) || o.mouth || 'neutral';
  if (mouth === 'talk' || mouth === 'open') {
    const h = mouth === 'open' ? 2.9 : 2; g.beginPath(); g.moveTo(CX - 2.6 * mw, M); g.quadraticCurveTo(CX, M - 0.6, CX + 2.6 * mw, M); g.quadraticCurveTo(CX + 1.4 * mw, M + h * 1.5, CX, M + h * 1.6); g.quadraticCurveTo(CX - 1.4 * mw, M + h * 1.5, CX - 2.6 * mw, M); fill('#6e2228');
    ell(CX, M + h * 1.1, 1.6 * mw, h * 0.5); fill('#d86872'); g.beginPath(); g.moveTo(CX - 2.2 * mw, M + 0.3); g.quadraticCurveTo(CX, M + 0.1, CX + 2.2 * mw, M + 0.3); stroke('#ffffff', 0.6);
  } else if (mouth === 'grin') {
    g.beginPath(); g.moveTo(CX - 3 * mw, M - 0.5); g.quadraticCurveTo(CX, M + 3 , CX + 3 * mw, M - 0.5); g.quadraticCurveTo(CX, M + 0.5, CX - 3 * mw, M - 0.5); fill('#7a2830'); g.beginPath(); g.moveTo(CX - 2.4 * mw, M - 0.1); g.quadraticCurveTo(CX, M + 0.8, CX + 2.4 * mw, M - 0.1); stroke('#ffffff', 0.7);
    if (ex_.includes('gap')) { g.beginPath(); g.moveTo(CX, M); g.lineTo(CX, M + 0.9); stroke('#7a2830', 0.5); }
  } else if (mouth === 'smile') { g.beginPath(); g.moveTo(CX - 2.6 * mw, M - 0.4); g.quadraticCurveTo(CX, M + 1.6, CX + 2.6 * mw, M - 0.4); stroke(lc, 0.7); }
  else if (mouth === 'frown') { g.beginPath(); g.moveTo(CX - 2.2 * mw, M + 0.8); g.quadraticCurveTo(CX, M - 0.6, CX + 2.2 * mw, M + 0.8); stroke(lc, 0.7); }
  else if (mouth === 'smirk') { g.beginPath(); g.moveTo(CX - 2 * mw, M + 0.3); g.quadraticCurveTo(CX + 0.5, M + 0.6, CX + 2.6 * mw, M - 0.9); stroke(lc, 0.7); }
  else { g.beginPath(); g.moveTo(CX - 1.8 * mw, M); g.quadraticCurveTo(CX, M + 0.6, CX + 1.8 * mw, M); stroke(lc, 0.7); }
  // ===== 앞머리 =====
  const capY = yT + 17, capR = 20.5;
  const crown = () => { g.beginPath(); g.ellipse(CX, capY, FW + 3.2, capR, 0, Math.PI, Math.PI * 2); g.lineTo(CX + FW + 3.2, capY + 2); g.quadraticCurveTo(CX, yT + 4, CX - FW - 3.2, capY + 2); g.closePath(); fill(hairCol(CX - FW, yT - 4, CX + FW, capY)); if (FLAT) stroke(rgba(H[4], 0.9), 0.5); for (let i = 0; i < 9; i++) { const a = Math.PI * (1.1 + i * 0.09); g.beginPath(); g.moveTo(CX + Math.cos(a) * 3, capY - 14); g.quadraticCurveTo(CX + Math.cos(a) * (FW - 2), capY + Math.sin(a) * (capR - 4), CX + Math.cos(a) * (FW + 2), capY + 1); stroke(rgba(i % 2 ? H[4] : H[0], 0.3), 0.35); } };
  const shine = () => { soft(1.5, () => { g.beginPath(); g.ellipse(CX - 2, capY + 2, FW, capR - 6.5, 0, Math.PI * 1.18, Math.PI * 1.7); stroke(rgba(H[0], 0.8), 2.6); }); g.beginPath(); g.ellipse(CX, capY, FW + 3.2, capR, 0, Math.PI * 1.05, Math.PI * 1.35); stroke('rgba(255,255,255,.22)', 0.8); };
  // 앞머리 묶음: tipY 끝 높이, n 가닥 수, spread 퍼짐, sideLen 옆머리 길이, sweep 한쪽으로 쏠림, jag 들쭉날쭉
  const bangs = (tipY, n, spread, sideLen, sweep, jag) => {
    for (const sd of [-1, 1]) { lock(CX + sd * (FW - 1), yT + 13, 7, CX + sd * (FW - 2.5), sideLen, sd * 1.5); lock(CX + sd * (FW + 1.5), yT + 15, 5, CX + sd * (FW + 1), sideLen - 6, sd * 2.5, H[3]); }
    for (let i = 0; i < n; i++) { const k = i / (n - 1) - 0.5, rx = CX + k * FW * 1.5 - (sweep || 0) * 3, tx = CX + k * FW * spread + (sweep || 0) * (4 + k * 3), len = tipY + (i % 2 ? -2.5 : 0) + Math.abs(k) * 3 + (jag ? (R() - 0.5) * jag : 0) + (sweep || 0) * k * 4; lock(rx, yT + 9, 9.5, tx, len, k * 4 + (sweep || 0) * 3); }
  };
  const spikes = (n, len, spread) => { for (let i = 0; i < n; i++) { const a = Math.PI * (1.02 + i * (spread || 0.96) / (n - 1)), rx = CX + Math.cos(a) * (FW - 2), ry = capY + Math.sin(a) * (capR - 4), L = len * (0.7 + R() * 0.6); lock(rx, ry, 9, rx + Math.cos(a) * L + (R() - 0.5) * 4, ry + Math.sin(a) * L - 2, (R() - 0.5) * 5, H[i % 3 ? 2 : 1]); } };
  if (style === 'messy') { spikes(9, 9, 0.96); bangs(E - 6, 7, 1.9, E + 3, 0, 8); crown(); shine(); }
  else if (style === 'spiky') { spikes(8, 11, 0.9); bangs(E - 9, 6, 1.6, E, 0, 4); crown(); shine(); }
  else if (style === 'neat') { bangs(E - 9, 6, 1.4, E + 1, 0.9, 0); crown(); shine(); }
  else if (style === 'side') { bangs(E - 5, 7, 1.6, E + 2, -1.4, 0); crown(); shine(); }
  else if (style === 'kid') { bangs(E - 7, 7, 1.5, E + 1, 0, 2); crown(); shine(); }
  else if (style === 'buzz') { g.beginPath(); g.ellipse(CX, capY, FW + 1, capR - 1, 0, Math.PI, Math.PI * 2); g.lineTo(CX + FW, yT + 9); g.quadraticCurveTo(CX, yT + 4, CX - FW, yT + 9); fill(rgba(H[2], 0.9)); }
  else if (style === 'long' || style === 'wavy' || style === 'bob') {
    if (style !== 'bob') for (const sd of [-1, 1]) { lock(CX + sd * (FW + 1), yT + 16, 8, CX + sd * (FW + (style === 'wavy' ? 6 : 3)), yN + 28, sd * (style === 'wavy' ? 7 : 4)); lock(CX + sd * (FW - 1.5), yT + 18, 6, CX + sd * (FW - 1), yN + 20, sd * (style === 'wavy' ? -4 : 2), H[3]); }
    bangs(E - 4, 8, 1.6, style === 'bob' ? yC + 2 : yC + 14, style === 'wavy' ? 0.8 : 0, 0); crown(); shine();
    if (o.clip) { g.save(); g.translate(CX + FW - 4, yT + 12); g.rotate(0.6); g.beginPath(); g.roundRect(-4, -1.2, 8, 2.4, 1); fill(o.clip); g.restore(); }
  } else if (style === 'pony' || style === 'bun') {
    bangs(E - 6, 6, 1.5, style === 'pony' ? E + 8 : E + 4, 0, 0); crown(); shine();
    if (style === 'bun') { ell(CX, yT - 6, 8, 7); fill(rad(CX - 2, yT - 8, 1, 9, [[0, H[1]], [1, H[3]]])); g.beginPath(); g.arc(CX, yT - 6, 5, 3.6, 5.6); stroke(rgba(H[0], 0.6), 1); for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(CX, yT - 6, 6.5 - i * 0.8, 3.4 + i * 0.3, 4.6 + i * 0.3); stroke(rgba(H[4], 0.35), 0.35); } }
    if (style === 'pony') { ell(CX + FW + 0.5, yT + 6, 2.6, 2.6); fill(o.clip || '#ff6a8a'); }
  }
  if (ex_.includes('ahoge')) lock(CX + 2, yT - 1, 3, CX + 7, yT - 12, -4);
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
  const seg = (x0, y0, x1, y1, w, col, hi) => { if (FLAT) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); stroke(rgba(topS[4], 0.9), w + 1); hi = null; } g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); stroke(col, w); if (hi) { g.beginPath(); g.moveTo(x0 - w * 0.12, y0); g.lineTo(x1 - w * 0.12, y1); stroke(hi, w * 0.55); } };
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
