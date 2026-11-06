// ===================== 경찰과 AI · 2 스테이지 (케이블카) =====================
function cableCar(c, x, y, roof, body) {
  R(c, x + 14, y - 14, 2, 14, '#555'); R(c, x + 8, y - 16, 14, 3, '#333');
  R(c, x, y, 30, 4, roof || '#d84a3a'); R(c, x + 1, y + 4, 28, 18, body || '#f2e6cc'); R(c, x + 3, y + 7, 10, 8, '#8fd0ff'); R(c, x + 17, y + 7, 10, 8, '#8fd0ff'); R(c, x + 1, y + 20, 28, 2, '#9a8a6a');
}
function bgCable(c, t, st, dusk) {
  if (dusk) sky(c, '141c4a', '6a4a8a'); else sky(c, '7ab8ff', 'ffe2b8');
  if (dusk) for (let i = 0; i < 25; i++) R(c, (i * 97) % LW, (i * 41) % 100, 1, 1, '#fff9');
  hills(c, 150, 40, dusk ? '#2a2a5a' : '#8aa8c8', 2, 0, 3); hills(c, 190, 26, dusk ? '#1f2448' : '#5f8a6a', 6, 0, 3);
  for (let i = 0; i < 8; i++) tree(c, (i * 67) % LW, 175 - (i % 3) * 5, 1.1, dusk ? '#1a2a2a' : '#3f6a48');
  // 케이블: 왼쪽 아래 → 오른쪽 위
  c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 190); c.lineTo(LW, 20); c.stroke();
  const ky = x => 190 - x * (170 / LW);
  const p1 = st.p1 != null ? st.p1 : Math.min(320, 200 + t * 5), p2 = st.p2 != null ? st.p2 : Math.min(210, 90 + t * 5);
  cableCar(c, p1, ky(p1 + 15) + 14); cableCar(c, p2, ky(p2 + 15) + 14, '#3a6ad8');
  if (!st.aiOff) spr(c, SPR.ai[0], st.aiX != null ? st.aiX : p1 + 7, ky(p1 + 15) - 10 + (st.aiJump ? (t - st.aiJump) * (t - st.aiJump) * 300 - (t - st.aiJump) * 80 : 0));
  if (st.pol) { const onCar = st.polX != null ? st.polX : p2 + 7; spr(c, SPR.police[(t * 6 | 0) % 2], onCar, (st.polY != null ? st.polY : ky(onCar + 8) - 10)); }
  if (st.rope) { c.strokeStyle = '#c8a86a'; c.beginPath(); c.moveTo(p2 + 15, ky(p2 + 15) + 10); c.lineTo(p1 + 15, ky(p1 + 15) + 12); c.stroke(); }
  if (st.chip) { R(c, (st.polX || 0) + 14, (st.polY || 0) + 8, 4, 3, '#3aff7a'); }
}
function PoliceStage2Intro() {
  const B = (c, t, st) => bgCable(c, t, st, false);
  return Cutscene([
    { n: '', t: '산까지 올라온 경찰은 AI 로봇을 쫓아서 계속 산을 올랐다.', bg: B },
    { n: '', t: '그때! AI 로봇이 산 정상으로 가는 케이블카 지붕 위에 올라타는 것이 보였다.' },
    { n: '경찰', p: 'police', t: '거기 서! 이번엔 놓치지 않는다!' },
    { n: '', t: '경찰은 AI가 올라탄 케이블카 바로 다음 차례로 온 케이블카 지붕 위에 올라탔다.', fx: st => st.pol = 1 },
    { n: 'AI', p: 'ai', r: 1, t: '으앗, 따라온다! 이거나 받아라!' },
  ], () => PoliceStage2());
}
function itemSpr(k) {
  return mk(10, 10, p => {
    if (k === 0) { p(1, 6, 3, 2, '#f2d23a'); p(3, 7, 4, 2, '#f2d23a'); p(6, 4, 2, 4, '#f2d23a'); p(7, 2, 2, 3, '#f2d23a'); p(8, 1, 1, 2, '#6a4a1a'); }
    if (k === 1) { p(4, 2, 2, 7, '#9aa4b8'); p(2, 0, 6, 3, '#9aa4b8'); p(4, 0, 2, 2, '#0000'); p(3, 8, 4, 2, '#6a7488'); }
    if (k === 2) { p(2, 1, 6, 8, '#d84a3a'); p(2, 3, 6, 2, '#f2f2f2'); p(3, 1, 4, 1, '#bbb'); }
    if (k === 3) { p(2, 2, 6, 6, '#888'); p(4, 4, 2, 2, '#333'); p(1, 4, 8, 2, '#888'); p(4, 1, 2, 8, '#888'); }
  });
}
const ITEMS = [0, 1, 2, 3].map(itemSpr);
function PoliceStage2() {
  const S = {}; const LX = [150, 240, 330], GOAL = 10;
  let lane = 1, px = 240, hearts = 3, dodged = 0, objs = [], nextT = 1.6, mode = 'howto', windup = -1, shake = 0, flash = 0, endT = 0, warn = [];
  function spawn() {
    const n = dodged >= 5 && Math.random() < 0.35 ? 2 : 1; const ls = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, n);
    ls.forEach(l => objs.push({ l, z: 0, dur: Math.max(0.95, 1.5 - dodged * 0.05), k: irnd(0, 3), rot: 0 }));
    windup = 0.35;
  }
  S.key = k => {
    if (mode === 'howto') { if (k === 'space' || k === 'enter') { SFX.click(); mode = 'play'; } return; }
    if (mode !== 'play') return;
    if (k === 'a' && lane > 0) { lane--; SFX.turn(); }
    if (k === 'd' && lane < 2) { lane++; SFX.turn(); }
  };
  S.click = () => { if (mode === 'howto') S.key('space'); };
  S.update = dt => {
    shake = Math.max(0, shake - dt); flash = Math.max(0, flash - dt); windup = Math.max(-1, windup - dt);
    px = lerp(px, LX[lane], Math.min(1, dt * 18));
    if (mode === 'play') {
      nextT -= dt; if (nextT <= 0) { spawn(); nextT = Math.max(0.9, 1.6 - dodged * 0.06) + rnd(0, 0.4); }
      for (const o of objs) {
        o.z += dt / o.dur; o.rot += dt * 10;
        if (o.z >= 1 && !o.done) {
          o.done = true;
          if (o.l === lane) { hearts--; shake = 0.5; flash = 0.3; SFX.hit(); if (hearts <= 0) { mode = 'over'; go(GameOver()); } }
          else { dodged++; SFX.ok(); if (dodged >= GOAL) { mode = 'clear'; endT = 0; SFX.clear(); objs = []; break; } }
        }
      }
      objs = objs.filter(o => o.z < 1.25);
    }
    if (mode === 'clear') { endT += dt; if (endT > 1.8) { mode = 'done'; go(PoliceStage2Clear()); } }
  };
  S.draw = () => {
    const sx = shake > 0 ? rnd(-3, 3) : 0;
    L.clearRect(0, 0, LW, LH); L.save(); L.translate(sx, 0);
    sky(L, '7ab8ff', 'ffd8a8');
    hills(L, 120, 30, '#8aa8c8', 2, S.t * 3, 3); hills(L, 150, 20, '#5f8a6a', 6, S.t * 6, 3);
    for (let i = 0; i < 10; i++) tree(L, ((i * 53 - S.t * 30) % 520 + 520) % 520 - 30, 140 + (i % 3) * 6, 1, '#3f6a48');
    // 케이블 (원근)
    L.strokeStyle = '#333'; L.beginPath(); L.moveTo(240, 0); L.lineTo(238, 270); L.stroke(); L.beginPath(); L.moveTo(244, 0); L.lineTo(250, 270); L.stroke();
    // 앞 케이블카 (AI)
    const by = 58 + Math.sin(S.t * 1.5) * 2;
    R(L, 238, by - 30, 4, 30, '#555'); R(L, 210, by, 60, 6, '#d84a3a'); R(L, 212, by + 6, 56, 26, '#f2e6cc'); R(L, 216, by + 10, 20, 12, '#8fd0ff'); R(L, 244, by + 10, 20, 12, '#8fd0ff');
    spr(L, SPR.ai[windup > 0 ? 1 : 0], 232, by - 24);
    if (windup > 0) R(L, 246, by - 26, 4, 4, '#ff5a5a');
    // 내 케이블카 지붕
    L.fillStyle = '#3a6ad8'; L.beginPath(); L.moveTo(70, 270); L.lineTo(130, 196); L.lineTo(350, 196); L.lineTo(410, 270); L.fill();
    L.fillStyle = '#2a50a8'; L.beginPath(); L.moveTo(70, 270); L.lineTo(80, 262); L.lineTo(400, 262); L.lineTo(410, 270); L.fill();
    R(L, 236, 196, 8, 74, '#2a50a8');
    for (let i = 0; i < 3; i++) R(L, LX[i] - 18, 236, 36, 2, '#ffffff40');
    // 경고 표시
    for (const o of objs) if (!o.done && o.z > 0.35) { const a = (o.z * 10 | 0) % 2; R(L, LX[o.l] - 14, 250, 28, 6, a ? '#ff4a4a' : '#ffd23a'); }
    // 날아오는 물건
    for (const o of objs) {
      const z = o.z, x = lerp(240, LX[o.l], z), y = lerp(by, 225, z) - Math.sin(Math.min(1, z) * Math.PI) * 40, s = lerp(0.6, 3, Math.min(z, 1.2));
      L.save(); L.translate(x, y); L.rotate(o.rot); L.drawImage(ITEMS[o.k], -5 * s, -5 * s, 10 * s, 10 * s); L.restore();
    }
    // 경찰
    spr(L, SPR.police[(S.t * 3 | 0) % 2], px - 16, 196, false, 2);
    L.restore();
    blitLo();
    if (flash > 0) { ctx.fillStyle = 'rgba(255,0,0,' + flash + ')'; ctx.fillRect(0, 0, W, H); }
    drawHearts(hearts, 3, shake > 0);
    T('피한 횟수  ' + dodged + ' / ' + GOAL, W / 2, 32, 32, '#fff', 'center', FONT_UI, '#000');
    T('A: 왼쪽으로 한 칸     D: 오른쪽으로 한 칸', W / 2, H - 22, 22, '#fff', 'center', FONT_UI, '#000');
    if (mode === 'howto') {
      ctx.fillStyle = 'rgba(0,0,30,.7)'; ctx.fillRect(0, 0, W, H);
      box(W / 2 - 330, 90, 660, 360, '#fff8e6', '#3a2a1a', 6);
      T('2 스테이지 · 케이블카 위의 추격', W / 2, 135, 36, '#3a2a1a', 'center');
      [['A', '왼쪽으로 한 칸 이동'], ['D', '오른쪽으로 한 칸 이동']].forEach((s, i) => { box(W / 2 - 280, 175 + i * 74, 70, 58, '#3a2a1a', '#ffe08a', 3); T(s[0], W / 2 - 245, 206 + i * 74, 32, '#ffe08a', 'center'); T(s[1], W / 2 - 190, 206 + i * 74, 24, '#3a2a1a', 'left', FONT_TX); });
      T('AI가 던지는 물건을 10번 피하면 클리어! 빨간 표시가 뜬 칸을 피하세요.', W / 2, 355, 20, '#7a4a1a', 'center', FONT_TX);
      if ((S.t * 2 | 0) % 2) T('스페이스 또는 클릭으로 시작 ▶', W / 2, 410, 24, '#3a2a1a', 'center');
    }
    if (mode === 'clear') T('성공!', W / 2, 220, 70, '#ffe08a', 'center', FONT_UI, '#000');
  };
  return S;
}
function PoliceStage2Clear() {
  const B = (c, t, st) => {
    st.p1 = 300; st.p2 = 200; st.pol = 1; const ky = x => 190 - x * (170 / LW);
    if (st.cross) { const k = clamp((t - st.cross) / 2, 0, 1); st.polX = lerp(207, 300, k); st.polY = lerp(ky(215), ky(315), k) - 4 + Math.sin(k * Math.PI) * 10; }
    if (st.aiJump && t - st.aiJump > 1.2) st.aiOff = 1;
    if (st.aiJump) st.aiX = 307 + (t - st.aiJump) * 40;
    bgCable(c, t, st, true);
    if (st.station) { R(c, 380, 60, 100, 80, '#3a3a5a'); R(c, 390, 70, 20, 20, '#ffd86a'); R(c, 420, 70, 20, 20, '#ffd86a'); R(c, 450, 70, 20, 20, '#ffd86a'); }
  };
  return Cutscene([
    { n: '', t: '해가 지고 있어서 슬슬 어두워지기 시작했다. 하늘이 남색으로 물들어 간다.', bg: B },
    { n: '', t: '경찰은 AI가 올라타 있는 케이블카 지붕을 향해 밧줄을 던졌다!', fx: st => st.rope = 1 },
    { n: '', t: '그리고 그 밧줄을 타고 AI가 있는 케이블카로 넘어갔다.', fx: st => st.cross = st.t || 0.001 },
    { n: '경찰', p: 'police', t: '이제 끝이다! 이 해킹 칩만 꽂으면...!', fx: st => st.chip = 1 },
    { n: 'AI', p: 'ai', r: 1, t: '안 돼! 잡힐 순 없어!' },
    { n: '', t: 'AI는 케이블카에서 뛰어내려 버리고, 어둠 속 다른 곳으로 사라졌다.', fx: st => { st.aiJump = st.t || 0.001; st.chip = 0; } },
    { n: '경찰', p: 'police', t: '이런... 놓쳤다. 케이블카가 도착하면 바로 쫓아가야겠군.' },
    { n: '', t: '경찰은 케이블카가 도착할 때까지 기다린 후, 케이블카에서 내렸다.', fx: st => st.station = 1 },
  ], () => (typeof PoliceStage3Intro === 'function' ? PoliceStage3Intro() : Notice('3 스테이지는 제작 중!', '곧 추가됩니다.', () => MainMenu())));
}
