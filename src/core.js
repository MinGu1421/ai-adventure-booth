// ===================== 공통 엔진 =====================
const W = 960, H = 540, LW = 480, LH = 270;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const lo = document.createElement('canvas'); lo.width = LW; lo.height = LH;
const L = lo.getContext('2d');
ctx.imageSmoothingEnabled = false; L.imageSmoothingEnabled = false;
function fit() { const s = Math.min(innerWidth / W, innerHeight / H); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; }
addEventListener('resize', fit); fit();

const FONT_UI = '"Do Hyeon", "Malgun Gothic", sans-serif';
const FONT_TX = '"Gowun Dodum", "Malgun Gothic", sans-serif';
const G = { pendant: false }; // 게임 전체 상태

// ---------- 유틸 ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn((x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }, g); return c; }
function spr(c, img, x, y, flip, scale) {
  scale = scale || 1;
  c.save(); c.translate(Math.round(x), Math.round(y));
  if (flip) { c.scale(-1, 1); c.drawImage(img, -img.width * scale, 0, img.width * scale, img.height * scale); }
  else c.drawImage(img, 0, 0, img.width * scale, img.height * scale);
  c.restore();
}
function T(s, x, y, size, col, align, font, stroke) {
  ctx.font = size + 'px ' + (font || FONT_UI); ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineWidth = Math.max(3, size / 6); ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = col || '#fff'; ctx.fillText(s, x, y);
}
function wrap(s, maxW, size, font) {
  ctx.font = size + 'px ' + (font || FONT_TX);
  const out = []; let cur = '';
  for (const para of s.split('\n')) {
    cur = '';
    for (const ch of para) { if (ctx.measureText(cur + ch).width > maxW && cur && !'.,!?…)」'.includes(ch)) { out.push(cur); cur = ch.trim() ? ch : ''; } else cur += ch; }
    out.push(cur);
  }
  return out;
}
function box(x, y, w, h, fill, border, bw) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); if (border) { ctx.lineWidth = bw || 4; ctx.strokeStyle = border; ctx.strokeRect(x + (bw || 4) / 2, y + (bw || 4) / 2, w - (bw || 4), h - (bw || 4)); } }
function blitLo() { ctx.drawImage(lo, 0, 0, W, H); }
const inside = (mx, my, b) => mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;

// ---------- 소리 ----------
let AC = null;
function audioInit() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } }
function beep(f, d, type, v, slide) {
  if (!AC) return; try {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'square'; o.frequency.value = f;
    if (slide) o.frequency.linearRampToValueAtTime(slide, AC.currentTime + d);
    g.gain.value = v || 0.06; g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + d);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d);
  } catch (e) { }
}
function noise(d, v, lp) {
  if (!AC) return; try {
    const n = AC.sampleRate * d, b = AC.createBuffer(1, n, AC.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = AC.createBufferSource(); s.buffer = b; const g = AC.createGain(); g.gain.value = v || 0.1;
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp || 1200;
    s.connect(f); f.connect(g); g.connect(AC.destination); s.start();
  } catch (e) { }
}
const SFX = {
  step: () => beep(520, 0.06, 'square', 0.04, 700), turn: () => beep(380, 0.06, 'square', 0.04, 300),
  fall: () => beep(500, 0.6, 'sawtooth', 0.06, 80), hit: () => { noise(0.25, 0.25, 900); beep(160, 0.2, 'square', 0.05, 60); },
  ok: () => { beep(660, 0.08); setTimeout(() => beep(880, 0.12), 80); }, clear: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'square', 0.05), i * 120)),
  bad: () => beep(200, 0.3, 'sawtooth', 0.06, 120), type: () => beep(900 + Math.random() * 200, 0.02, 'square', 0.015),
  jump: () => beep(400, 0.12, 'square', 0.04, 800), click: () => beep(700, 0.05, 'square', 0.04),
  foot: (v) => noise(0.08, v, 300),
};

// ---------- 입력 ----------
const keys = {};
let scene = null;
function normKey(e) {
  const c = e.code || '';
  if (c.startsWith('Key')) return c.slice(3).toLowerCase();
  if (c.startsWith('Digit')) return c.slice(5);
  if (c.startsWith('Numpad') && /\d/.test(c.slice(6))) return c.slice(6);
  if (c === 'Space') return 'space';
  if (c.startsWith('Shift')) return 'shift';
  if (c === 'Enter' || c === 'NumpadEnter') return 'enter';
  if (c === 'Escape') return 'esc';
  return (e.key || '').toLowerCase();
}
addEventListener('keydown', e => {
  audioInit();
  const k = normKey(e);
  if (['space', 'enter', 'shift'].includes(k) || e.code.startsWith('Arrow')) e.preventDefault();
  if (keys[k]) return; keys[k] = true;
  if (trans.a > 0.5) return;
  scene && scene.key && scene.key(k);
});
addEventListener('keyup', e => { keys[normKey(e)] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
const mouse = { x: 0, y: 0, down: false };
function mpos(e) { const r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) / r.width * W; mouse.y = (e.clientY - r.top) / r.height * H; }
cv.addEventListener('mousemove', e => { mpos(e); scene && scene.move && scene.move(mouse.x, mouse.y); });
cv.addEventListener('mousedown', e => { audioInit(); mpos(e); mouse.down = true; scene && scene.mdown && scene.mdown(mouse.x, mouse.y); });
addEventListener('mouseup', e => { mouse.down = false; scene && scene.mup && scene.mup(); });
cv.addEventListener('click', e => {
  mpos(e); if (trans.a > 0.5) return;
  if (scene && !scene.noHome && inside(mouse.x, mouse.y, HOME)) { SFX.click(); go(MainMenu()); return; }
  scene && scene.click && scene.click(mouse.x, mouse.y);
});
cv.addEventListener('wheel', e => { e.preventDefault(); mpos(e); scene && scene.wheel && scene.wheel(e.deltaY, mouse.x, mouse.y); }, { passive: false });

// ---------- 장면 전환 ----------
const trans = { a: 0, next: null, dir: 0 };
function go(s) { trans.next = s; trans.dir = 1; }
function setScene(s) { scene = s; s.t = 0; s.enter && s.enter(); }
const HOME = { x: 10, y: 10, w: 112, h: 34 };
function drawHome() {
  const h = inside(mouse.x, mouse.y, HOME);
  box(HOME.x, HOME.y, HOME.w, HOME.h, h ? '#ffe08a' : 'rgba(20,20,40,.75)', '#fff', 2);
  T('⟲ 처음으로', HOME.x + HOME.w / 2, HOME.y + HOME.h / 2 + 1, 18, h ? '#222' : '#fff', 'center');
}
let last = performance.now();
function loop(now) {
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (trans.dir === 1) { trans.a += dt * 4; if (trans.a >= 1) { trans.a = 1; trans.dir = -1; setScene(trans.next); } }
  else if (trans.dir === -1) { trans.a -= dt * 4; if (trans.a <= 0) { trans.a = 0; trans.dir = 0; } }
  if (scene) { scene.t += dt; scene.update && scene.update(dt); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); scene.draw(); if (!scene.noHome) drawHome(); }
  if (trans.a > 0) { ctx.fillStyle = 'rgba(0,0,0,' + trans.a + ')'; ctx.fillRect(0, 0, W, H); }
  requestAnimationFrame(loop);
}

// ---------- 하트 ----------
const HEART = mk(9, 8, p => { const r = '#e8323c', d = '#a01828', w = '#ffd0d0';[[1, 0, 2], [6, 0, 2], [0, 1, 4], [5, 1, 4], [0, 2, 9], [0, 3, 9], [1, 4, 7], [2, 5, 5], [3, 6, 3], [4, 7, 1]].forEach(([x, y, w2]) => p(x, y, w2, 1, r)); p(1, 1, 1, 1, w); p(2, 1, 1, 1, w); p(1, 2, 1, 1, w); p(7, 3, 1, 1, d); p(6, 4, 2, 1, d); p(5, 5, 2, 1, d); });
const HEART0 = mk(9, 8, p => { const r = '#444a';[[1, 0, 2], [6, 0, 2], [0, 1, 4], [5, 1, 4], [0, 2, 9], [0, 3, 9], [1, 4, 7], [2, 5, 5], [3, 6, 3], [4, 7, 1]].forEach(([x, y, w2]) => p(x, y, w2, 1, r)); });
function drawHearts(n, max, shake) {
  for (let i = 0; i < max; i++) {
    const x = W - 20 - (max - i) * 44 + (shake && i === n ? rnd(-3, 3) : 0);
    ctx.drawImage(i < n ? HEART : HEART0, x, 14, 36, 32);
  }
}

// ---------- 컷신 / 대화 ----------
// line: { n: 이름, p: 초상 키, t: 대사, bg: 배경함수, fx: 시작 시 실행 }
function Cutscene(lines, next, opt) {
  opt = opt || {};
  let i = -1, shown = 0, bg = opt.bg || null, side = 0;
  const S = { lines, st: {}, lt: 0 };
  const SKIP = { x: W - 150, y: 10, w: 140, h: 34 };
  function adv() {
    i++; shown = 0; S.lt = 0;
    if (i >= lines.length) { go(typeof next === 'function' ? next() : next); i = lines.length - 1; return; }
    const l = lines[i]; if (l.bg) bg = l.bg; if (l.fx) l.fx(S.st);
  }
  function press() { const l = lines[i]; if (!l) return; if (shown < l.t.length) shown = l.t.length; else { SFX.click(); adv(); } }
  S.enter = () => adv();
  S.key = k => { if (k === 'space' || k === 'enter') press(); };
  S.click = (x, y) => { if (inside(x, y, SKIP)) { SFX.click(); i = lines.length; go(typeof next === 'function' ? next() : next); return; } press(); };
  S.update = dt => { S.st.t = S.t; S.lt += dt; const l = lines[i]; if (l && shown < l.t.length) { const b = shown; shown = Math.min(l.t.length, shown + dt * 32); if ((shown | 0) !== (b | 0) && (shown | 0) % 2) SFX.type(); } if (l && l.auto && shown >= l.t.length && S.lt > l.t.length / 32 + l.auto) adv(); };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH);
    if (bg) bg(L, S.t, S.st, S); blitLo();
    if (bg && bg.over) bg.over(S.t, S.st, S);
    const l = lines[i]; if (!l) return;
    const nar = !l.n;
    if (!nar && l.p) drawPortrait(l.p, l.r ? W - 280 : 40, 100, 2.5, null, shown < l.t.length);
    const by = 396, bh = 132;
    box(20, by, W - 40, bh, nar ? 'rgba(10,10,20,.88)' : 'rgba(255,250,236,.96)', nar ? '#9aa4c8' : '#3a2a1a', 4);
    if (!nar) { ctx.font = '22px ' + FONT_UI; const nw = ctx.measureText(l.n).width + 32; const nx = l.r ? W - 40 - nw : 40; box(nx, by - 26, nw, 36, '#3a2a1a', '#ffe08a', 3); T(l.n, nx + nw / 2, by - 8, 22, '#ffe08a', 'center'); }
    const lines2 = wrap(l.t.slice(0, Math.floor(shown)), W - 110, 25, FONT_TX);
    lines2.slice(0, 4).forEach((s, j) => T(s, 50, by + 34 + j * 30, 25, nar ? '#e8ecff' : '#2a1d12', 'left', FONT_TX));
    if (shown >= l.t.length && (S.t * 2 | 0) % 2) T('▼', W - 54, by + bh - 22, 20, nar ? '#fff' : '#3a2a1a', 'center');
    const h = inside(mouse.x, mouse.y, SKIP); box(SKIP.x, SKIP.y, SKIP.w, SKIP.h, h ? '#ffe08a' : 'rgba(20,20,40,.75)', '#fff', 2); T('건너뛰기 ▶▶', SKIP.x + 70, SKIP.y + 18, 18, h ? '#222' : '#fff', 'center');
  };
  return S;
}

// 짧은 안내 화면 (텍스트 + 다음)
function Notice(title, body, next, opt) {
  opt = opt || {};
  const S = {};
  S.key = k => { if (k === 'space' || k === 'enter') { SFX.click(); go(typeof next === 'function' ? next() : next); } };
  S.click = () => S.key('space');
  S.update = dt => { if (opt.auto && S.t > opt.auto) { S.update = null; go(typeof next === 'function' ? next() : next); } };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH); if (opt.bg) { opt.bg(L, S.t, {}); blitLo(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H); }
    T(title, W / 2, 170, 48, opt.color || '#ffe08a', 'center', FONT_UI, '#000');
    wrap(body, 760, 24, FONT_TX).forEach((s, j) => T(s, W / 2, 250 + j * 34, 24, '#fff', 'center', FONT_TX));
    if (!opt.auto && (S.t * 2 | 0) % 2) T('스페이스 또는 클릭 ▶', W / 2, 470, 22, '#ccc', 'center');
    if (opt.drawExtra) opt.drawExtra(S.t);
  };
  return S;
}

// 공통 일시정지: E키(또는 좌측 상단 버튼)로 멈춤, 다시 누르면 화면을 먼저 보여 준 뒤 3초 카운트다운
const PAUSE_BTN = { x: 132, y: 10, w: 126, h: 34 };
function Pausable(S, playing) {
  let paused = false, cd = 0;
  const u = S.update, k = S.key, c = S.click, d = S.draw, md = S.mdown, wh = S.wheel;
  const busy = () => paused || cd > 0;
  S.isPaused = busy;
  S.key = key => {
    if (key === 'e' && playing()) { if (!paused && cd <= 0) { paused = true; SFX.click(); } else if (paused) { paused = false; cd = 3; SFX.click(); } return; }
    if (busy()) return; k && k(key);
  };
  S.click = (x, y) => { if (playing() && inside(x, y, PAUSE_BTN)) { S.key('e'); return; } if (busy()) return; c && c(x, y); };
  if (md) S.mdown = (x, y) => { if (busy() || (playing() && inside(x, y, PAUSE_BTN))) return; md(x, y); };
  if (wh) S.wheel = (a, x, y) => { if (!busy()) wh(a, x, y); };
  S.update = dt => {
    if (paused) return;
    if (cd > 0) { const b = Math.ceil(cd); cd -= dt; if (Math.ceil(cd) !== b && cd > 0) SFX.step(); return; }
    u && u(dt);
  };
  S.draw = () => {
    d();
    if (!playing() && !busy()) return;
    const h = inside(mouse.x, mouse.y, PAUSE_BTN) || paused;
    box(PAUSE_BTN.x, PAUSE_BTN.y, PAUSE_BTN.w, PAUSE_BTN.h, h ? '#ffe08a' : 'rgba(20,20,40,.75)', '#fff', 2);
    T(paused ? '▶ 계속 (E)' : 'Ⅱ 멈춤 (E)', PAUSE_BTN.x + PAUSE_BTN.w / 2, PAUSE_BTN.y + 18, 18, h ? '#222' : '#fff', 'center');
    if (paused) { ctx.fillStyle = 'rgba(0,0,30,.65)'; ctx.fillRect(0, 60, W, H - 60); T('일시 정지', W / 2, 230, 64, '#ffe08a', 'center', FONT_UI, '#000'); T('E 키를 다시 누르면 3초 뒤에 이어서 시작해요', W / 2, 300, 24, '#fff', 'center', FONT_TX, '#000'); }
    else if (cd > 0) T(String(Math.ceil(cd)), W / 2, H / 2, 140, '#ffe08a', 'center', FONT_UI, '#000');
  };
  return S;
}

function GameOver(msg) {
  return Notice(msg || '하트를 모두 잃었어요', '메인 화면으로 돌아갑니다.\n다시 도전해 보세요!', () => MainMenu(), { auto: 3.5, color: '#ff6a6a' });
}

// 엔딩 화면 + 리셋 버튼
function Ending(title, body, color, bg) {
  const S = {}; const RB = { x: W / 2 - 120, y: 430, w: 240, h: 60 };
  S.click = (x, y) => { if (inside(x, y, RB)) { SFX.click(); go(MainMenu()); } };
  S.key = k => { if (k === 'enter' && S.t > 1) S.click(RB.x + 1, RB.y + 1); };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH); if (bg) { bg(L, S.t, {}); blitLo(); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); }
    T(title, W / 2, 140, 64, color, 'center', FONT_UI, '#000');
    wrap(body, 780, 24, FONT_TX).forEach((s, j) => T(s, W / 2, 230 + j * 34, 24, '#fff', 'center', FONT_TX, '#0008'));
    const h = inside(mouse.x, mouse.y, RB); box(RB.x, RB.y, RB.w, RB.h, h ? '#ffe08a' : '#3a2a1a', '#fff', 4); T('⟲ 리셋 (메인으로)', W / 2, RB.y + 31, 26, h ? '#222' : '#fff', 'center');
  };
  S.noHome = true;
  return S;
}
