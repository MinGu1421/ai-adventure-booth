// ===================== 무한의 계단 (공용) =====================
// cfg: { title, hero:[img,img], bg(c,t,height), stepCol:[top,front], turnClimbs, controls:[..], onClear:()=>scene }
function Stairs(cfg) {
  const S = { stairs: true };
  const DIFFS = [{ n: '1단계 · 쉬움', goal: 30, drain: 0.13 }, { n: '2단계 · 보통', goal: 50, drain: 0.18 }, { n: '3단계 · 어려움', goal: 100, drain: 0.23 }, { n: '4단계 · 매우 어려움', goal: 500, drain: 0.27 }, { n: '5단계 · 지옥', goal: 1000, drain: 0.3, hell: 1 }];
  const BTN = DIFFS.map((d, i) => ({ x: W / 2 - 200, y: 182 + i * 66, w: 400, h: 56 }));
  const SW = 22, SH = 12;
  let paused = false, cd = 0; const PB2 = { x: 132, y: 10, w: 126, h: 34 };
  let items = [], mode = 'select', diff = null, steps, idx, face, gauge, started, hearts = 3, ft = 0, camX = 0, camY = 0, hop = 0, shake = 0;
  function build() { steps = [0]; let x = 0, d = 1; for (let i = 1; i <= diff.goal + 14; i++) { if (i > 2 && Math.random() < 0.38) d = -d; x += d; steps.push(x); } items = steps.map((_, i) => i < 3 || i >= diff.goal ? null : Math.random() < 0.007 ? 'g' : Math.random() < 0.1 ? 'c' : null); idx = 0; face = 1; gauge = 1; started = false; camX = 0; camY = 0; mode = 'play'; }
  function fall() { mode = 'fall'; ft = 0; SFX.fall(); }
  function climb() {
    const d = steps[idx + 1] - steps[idx];
    if (d !== face) { fall(); return; }
    idx++; hop = 1; SFX.step(); gauge = Math.min(1, gauge + 0.11);
    if (items[idx]) { if (items[idx] === 'g') addGem(1, W / 2, H / 2 - 40); else addCoin(1, W / 2, H / 2 - 40); items[idx] = null; } // 계단 위 코인·보석 줍기
    if (idx >= diff.goal) { mode = 'clear'; ft = 0; SFX.clear(); }
  }
  S.key = k => {
    if (mode === 'select' && '12345'.includes(k)) { diff = DIFFS[+k - 1]; SFX.click(); mode = 'howto'; return; }
    if (mode === 'howto' && (k === 'space' || k === 'enter')) { SFX.click(); build(); return; }
    if (mode === 'play' && k === 'e') { if (!paused) { paused = true; SFX.click(); } else { paused = false; cd = 3; SFX.click(); } return; }
    if (mode !== 'play' || paused || cd > 0) return;
    if (k === 'd') { started = true; climb(); }
    if (k === 'a') { started = true; face = -face; SFX.turn(); if (cfg.turnClimbs) climb(); }
  };
  S.click = (x, y) => {
    if (mode === 'play' && inside(x, y, PB2)) { S.key('e'); return; }
    if (mode === 'select') BTN.forEach((b, i) => { if (inside(x, y, b)) S.key(String(i + 1)); });
    else if (mode === 'howto') S.key('space');
  };
  S.update = dt => {
    if (paused) return;
    if (cd > 0) { const b = Math.ceil(cd); cd -= dt; if (Math.ceil(cd) !== b && cd > 0) SFX.turn(); return; }
    hop = Math.max(0, hop - dt * 7); shake = Math.max(0, shake - dt);
    if (!steps) return;
    const tx = steps[idx] * SW, ty = -idx * SH;
    if (mode !== 'fall') { camX = lerp(camX, tx, Math.min(1, dt * 10)); camY = lerp(camY, ty, Math.min(1, dt * 10)); }
    if (mode === 'play' && started) { gauge -= diff.drain * (1 + idx / diff.goal * 0.7) * dt; if (gauge <= 0) { gauge = 0; fall(); } }
    if (mode === 'fall') { ft += dt; if (ft > 1.3) { hearts--; shake = 0.6; if (hearts <= 0) { mode = 'over'; go(GameOver(cfg.overMsg)); } else { mode = 'retry'; ft = 0; } } }
    else if (mode === 'retry') { ft += dt; if (ft > 1.6) build(); }
    else if (mode === 'clear') { ft += dt; if (ft > 1.8) { mode = 'done'; go(cfg.onClear()); } }
  };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH);
    cfg.bg(L, S.t, steps ? -camY : 0, steps ? idx / diff.goal : 0);
    if (steps) {
      const ox = 240 - camX, oy = 175 - camY;
      for (let i = Math.max(0, idx - 9); i < Math.min(steps.length, idx + 18); i++) {
        const x = ox + steps[i] * SW - SW / 2, y = oy - i * SH;
        R(L, x, y, SW, 5, cfg.stepCol[0]); R(L, x, y + 5, SW, 5, cfg.stepCol[1]); R(L, x, y, SW, 1, '#ffffff60');
        if (cfg.stepDeco) cfg.stepDeco(L, x, y, i);
        if (items[i]) { const bob = Math.sin(S.t * 5 + i) * 1.5; L.drawImage(items[i] === 'g' ? GEM_IMG : COIN_IMG, x + SW / 2 - 4, y - 11 + bob, 8, 8); }
        if (i === diff.goal) { R(L, x + SW / 2, y - 26, 2, 26, '#eee'); R(L, x + SW / 2 + 2, y - 26, 12, 8, '#ff4a4a'); }
      }
      if (mode !== 'retry') petsFollow(L, steps, idx, ox, oy, SW, SH, 1 / 60, S.t);
      const ho = cfg.heroOff || [8, 24]; let px = ox + steps[idx] * SW - ho[0], py = oy - idx * SH - ho[1] - Math.sin(hop * Math.PI) * 5;
      let fr = hop > 0.3 ? 1 : 0;
      if (mode === 'fall') { py += ft * ft * 260; px += face * ft * 30; fr = (S.t * 10 | 0) % 2; }
      if (mode !== 'retry') spr(L, cfg.hero[fr], px, py, face < 0);
    }
    blitLo();
    if (mode === 'select') {
      ctx.fillStyle = 'rgba(0,0,30,.6)'; ctx.fillRect(0, 0, W, H);
      T(cfg.title, W / 2, 100, 46, '#ffe08a', 'center', FONT_UI, '#000'); T('난이도를 골라 주세요 (숫자 1~5 또는 클릭)', W / 2, 150, 24, '#fff', 'center');
      DIFFS.forEach((d, i) => { const b = BTN[i], h = inside(mouse.x, mouse.y, b); box(b.x, b.y, b.w, b.h, h ? '#ffe08a' : d.hell ? '#5a0a0a' : d.goal >= 500 ? '#4a1a3a' : '#2a2a4a', d.hell ? '#ff5a3a' : '#fff', 4); T(d.n + '  —  ' + d.goal + '계단', W / 2, b.y + 30, 26, h ? '#222' : '#fff', 'center'); });
    } else if (mode === 'howto') {
      ctx.fillStyle = 'rgba(0,0,30,.7)'; ctx.fillRect(0, 0, W, H);
      box(W / 2 - 330, 90, 660, 360, '#fff8e6', '#3a2a1a', 6);
      T('조작 방법', W / 2, 135, 40, '#3a2a1a', 'center');
      cfg.controls.forEach((s, i) => { box(W / 2 - 280, 175 + i * 74, 70, 58, '#3a2a1a', '#ffe08a', 3); T(s[0], W / 2 - 245, 206 + i * 74, 32, '#ffe08a', 'center'); T(s[1], W / 2 - 190, 206 + i * 74, 23, '#3a2a1a', 'left', FONT_TX); });
      T('목표: ' + diff.goal + '계단 오르기 · 하트 3개 · 머뭇거리면 게이지가 줄어요', W / 2, 345, 21, '#7a4a1a', 'center', FONT_TX); T('E 키: 게임 멈춤 / 다시 시작 (3초 뒤에 이어서)', W / 2, 375, 20, '#7a4a1a', 'center', FONT_TX);
      if ((S.t * 2 | 0) % 2) T('스페이스 또는 클릭으로 시작 ▶', W / 2, 410, 24, '#3a2a1a', 'center');
    } else {
      drawHearts(hearts, 3, shake > 0);
      T(Math.min(idx, diff.goal) + ' / ' + diff.goal + ' 계단', W / 2, 32, 32, '#fff', 'center', FONT_UI, '#000');
      box(W / 2 - 150, 56, 300, 18, '#0008', '#fff', 2); R(ctx, W / 2 - 147, 59, 294 * gauge, 12, gauge > 0.35 ? '#5ee07a' : '#ff5a5a');
      T(cfg.controls.map(c => c[0] + ': ' + c[2]).join('     '), W / 2, H - 24, 22, '#fff', 'center', FONT_UI, '#000'); drawWallet();
      if (mode === 'retry') { T('추락! 처음부터 다시 도전!', W / 2, 220, 44, '#ff6a6a', 'center', FONT_UI, '#000'); T('남은 하트 ' + hearts + '개', W / 2, 280, 28, '#fff', 'center', FONT_UI, '#000'); }
      if (mode === 'clear') T('성공!', W / 2, 220, 70, '#ffe08a', 'center', FONT_UI, '#000');
      if (mode === 'play') { const h = inside(mouse.x, mouse.y, PB2) || paused; box(PB2.x, PB2.y, PB2.w, PB2.h, h ? '#ffe08a' : 'rgba(20,20,40,.75)', '#fff', 2); T(paused ? '▶ 계속 (E)' : 'Ⅱ 멈춤 (E)', PB2.x + PB2.w / 2, PB2.y + 18, 18, h ? '#222' : '#fff', 'center'); }
      if (paused) { ctx.fillStyle = 'rgba(0,0,30,.65)'; ctx.fillRect(0, 60, W, H - 60); T('일시 정지', W / 2, 230, 64, '#ffe08a', 'center', FONT_UI, '#000'); T('E 키를 한 번 더 누르면 게임으로 돌아가요', W / 2, 300, 26, '#fff', 'center', FONT_UI, '#000'); }
      else if (cd > 0) T(String(Math.ceil(cd)), W / 2, 240, 120, '#ffe08a', 'center', FONT_UI, '#000');
    }
  };
  S.dbg = () => ({ steps, idx, face, mode }); S.jump = n => { idx = n; }; window._st = S;
  return S;
}
