// ===================== 재화(코인·보석) · 저장 · 명예의 전당 · 펫 상점 =====================
// 코인 = 1점, 보석 = 코인 10개 가치. 지갑·펫·닉네임은 '초기화'로 지워지고, 명예의 전당 기록은 남는다.
const SAVE_KEY = 'aiadv_save_v1', HALL_KEY = 'aiadv_hall_v1';
const GEM_VALUE = 10;
function loadJSON(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
const ECO = Object.assign({ coins: 0, gems: 0, pets: [], nick: '' }, loadJSON(SAVE_KEY, {}));
function ecoSave() { saveJSON(SAVE_KEY, ECO); }
function hallLoad() { return loadJSON(HALL_KEY, []); }
function hallSave(h) { saveJSON(HALL_KEY, h); }

// ---------- 그림 ----------
const COIN_IMG = mk(12, 12, p => { const o = '#a86a00', y = '#ffd23a', l = '#fff3a0'; p(3, 0, 6, 1, o); p(1, 1, 2, 1, o); p(9, 1, 2, 1, o); p(0, 3, 1, 6, o); p(11, 3, 1, 6, o); p(1, 10, 2, 1, o); p(9, 10, 2, 1, o); p(3, 11, 6, 1, o); p(1, 2, 10, 8, y); p(3, 1, 6, 10, y); p(2, 2, 2, 3, l); p(5, 3, 2, 6, '#e0a800'); p(5, 3, 1, 6, '#c88a00'); });
const GEM_IMG = mk(12, 12, p => { const o = '#1a4a8a'; p(3, 1, 6, 1, o); p(1, 2, 10, 1, o); p(0, 3, 12, 2, '#3ab8ff'); p(1, 5, 10, 1, '#2a8ae8'); p(2, 6, 8, 1, '#2a8ae8'); p(3, 7, 6, 1, '#1a6ad0'); p(4, 8, 4, 1, '#1a6ad0'); p(5, 9, 2, 1, '#1a5ab8'); p(2, 2, 8, 1, '#9ae0ff'); p(3, 3, 2, 2, '#e8f8ff'); });
function drawCoinIcon(x, y, s, gem) { const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false; ctx.drawImage(gem ? GEM_IMG : COIN_IMG, x, y, 12 * s, 12 * s); ctx.imageSmoothingEnabled = sm; }

// ---------- 획득 ----------
const POPS = []; // 화면에 잠깐 떠오르는 "+1"
function addCoin(n, x, y) { ECO.coins += n || 1; ecoSave(); SFX.ok(); POPS.push({ t: 0, x: x == null ? 120 : x, y: y == null ? H - 70 : y, s: '+' + (n || 1), gem: false }); }
function addGem(n, x, y) { ECO.gems += n || 1; ecoSave(); [988, 1319, 1568].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.05), i * 70)); POPS.push({ t: 0, x: x == null ? 120 : x, y: y == null ? H - 70 : y, s: '+' + (n || 1), gem: true }); }
// 스테이지 화면 왼쪽 아래 지갑 표시 + 획득 팝업 (스테이지 draw 끝에서 호출)
function drawWallet(x, y) {
  x = x == null ? 12 : x; y = y == null ? H - 58 : y;
  box(x, y, 196, 46, 'rgba(10,10,30,.72)', '#ffd23a', 2);
  drawCoinIcon(x + 10, y + 9, 2.3); T(String(ECO.coins), x + 44, y + 24, 22, '#ffe680');
  drawCoinIcon(x + 104, y + 9, 2.3, true); T(String(ECO.gems), x + 138, y + 24, 22, '#9ae0ff');
  for (let i = POPS.length - 1; i >= 0; i--) { const p = POPS[i]; p.t += 1 / 60; if (p.t > 1.1) { POPS.splice(i, 1); continue; } ctx.globalAlpha = Math.min(1, (1.1 - p.t) * 3); drawCoinIcon(p.x - 26, p.y - 40 * p.t - 12, 2, p.gem); T(p.s, p.x + 8, p.y - 40 * p.t, 26, p.gem ? '#9ae0ff' : '#ffe680'); ctx.globalAlpha = 1; }
}

// ---------- 글자 입력 창 (한글 입력이 되도록 진짜 입력칸을 캔버스 위에 띄움) ----------
let INPUT_OPEN = false;
function askText(title, hint, initial, maxLen, done, cancel) {
  INPUT_OPEN = true; for (const k in keys) keys[k] = false;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,20,.6);z-index:50;font-family:"Do Hyeon","Malgun Gothic",sans-serif';
  wrap.innerHTML = '<div style="background:#fff8e6;border:5px solid #3a2a1a;border-radius:16px;padding:26px 30px;min-width:360px;text-align:center;color:#3a2a1a"><div class="q-title" style="font-size:30px;margin-bottom:8px"></div><div class="q-hint" style="font-family:Gowun Dodum,sans-serif;font-size:17px;margin-bottom:14px;color:#7a4a1a"></div><input maxlength="' + (maxLen || 10) + '" style="font-size:26px;padding:8px 12px;width:280px;border:3px solid #3a2a1a;border-radius:10px;text-align:center;font-family:inherit"><div style="margin-top:16px;display:flex;gap:12px;justify-content:center"><button style="font-size:22px;padding:8px 26px;border-radius:10px;border:3px solid #3a2a1a;background:#ffe08a;font-family:inherit;cursor:pointer">확인</button>' + (cancel ? '<button style="font-size:22px;padding:8px 20px;border-radius:10px;border:3px solid #3a2a1a;background:#eee;font-family:inherit;cursor:pointer">취소</button>' : '') + '</div></div>';
  wrap.querySelector('.q-title').textContent = title; wrap.querySelector('.q-hint').textContent = hint || '';
  const inp = wrap.querySelector('input'), btns = wrap.querySelectorAll('button'); inp.value = initial || '';
  const close = () => { wrap.remove(); INPUT_OPEN = false; for (const k in keys) keys[k] = false; };
  const ok = () => { const v = inp.value.trim(); if (!v) { inp.focus(); inp.style.borderColor = '#d02020'; return; } close(); done(v); };
  btns[0].onclick = ok; if (cancel) btns[1].onclick = () => { close(); cancel(); };
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && !e.isComposing) ok(); if (e.key === 'Escape' && cancel) { close(); cancel(); } });
  inp.addEventListener('keyup', e => e.stopPropagation());
  document.body.appendChild(wrap); setTimeout(() => inp.focus(), 30);
}

// ---------- 공통: 화면 위쪽 제목 + 돌아가기 ----------
const BACK = { x: 10, y: 10, w: 150, h: 40 };
function topBar(title, sub) {
  box(BACK.x, BACK.y, BACK.w, BACK.h, inside(mouse.x, mouse.y, BACK) ? '#ffe08a' : 'rgba(20,20,40,.8)', '#fff', 2); T('◀ 메인으로', BACK.x + BACK.w / 2, BACK.y + 21, 20, inside(mouse.x, mouse.y, BACK) ? '#222' : '#fff', 'center');
  T(title, W / 2, 46, 42, '#ffe08a', 'center', FONT_UI, '#2a1a00'); if (sub) T(sub, W / 2, 88, 19, '#dde', 'center', FONT_TX);
  drawWallet(W - 208, 10);
}
const btnDraw = (b, label, col, size) => { const h = inside(mouse.x, mouse.y, b) && !b.off; box(b.x, b.y, b.w, b.h, b.off ? '#55556a' : h ? '#ffe08a' : col || '#2a2a5a', b.off ? '#888' : '#fff', 3); T(label, b.x + b.w / 2, b.y + b.h / 2 + 1, size || 22, b.off ? '#aaa' : h ? '#222' : '#fff', 'center'); };

// ---------- 명예의 전당 ----------
function HallOfFame() {
  const S = { noHome: true };
  const BC = { x: 120, y: 420, w: 220, h: 56 }, BG = { x: 370, y: 420, w: 220, h: 56 }, BN = { x: 620, y: 420, w: 220, h: 56 };
  let msg = '', msgT = 0;
  const askNick = (first) => askText(first ? '명예의 전당 첫 입장! 닉네임을 정해 주세요' : '닉네임 바꾸기', '누가 세운 기록인지 알 수 있도록 이름을 남겨요 (10자 이내)', ECO.nick, 10, v => { ECO.nick = v; ecoSave(); SFX.ok(); }, first ? null : () => { });
  S.enter = () => { if (!ECO.nick) setTimeout(() => askNick(true), 350); };
  const offer = (coins, gems) => {
    if (!ECO.nick) { askNick(true); return; }
    const pts = coins + gems * GEM_VALUE; if (pts <= 0) { msg = '바칠 재화가 없어요. 스테이지에서 코인과 보석을 모아 오세요!'; msgT = 3; SFX.bad(); return; }
    ECO.coins -= coins; ECO.gems -= gems; ecoSave();
    const h = hallLoad(); let r = h.find(e => e.name === ECO.nick); if (!r) { r = { name: ECO.nick, pts: 0 }; h.push(r); } r.pts += pts; r.at = Date.now(); hallSave(h);
    msg = pts + '점을 바쳤어요! (지금까지 ' + r.pts + '점)'; msgT = 3; SFX.clear();
  };
  S.click = (x, y) => {
    if (INPUT_OPEN) return;
    if (inside(x, y, BACK)) { SFX.click(); go(MainMenu()); return; }
    if (inside(x, y, BC)) offer(ECO.coins, 0); else if (inside(x, y, BG)) offer(0, ECO.gems); else if (inside(x, y, BN)) { SFX.click(); askNick(false); }
  };
  S.key = k => { if (k === 'esc') S.click(BACK.x + 1, BACK.y + 1); };
  S.update = dt => { if (msgT > 0) msgT -= dt; };
  S.draw = () => {
    ctx.fillStyle = '#1a1230'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(255,220,120,' + (0.15 + 0.15 * Math.sin(S.t * 2 + i)) + ')'; ctx.fillRect((i * 97) % W, (i * 53) % H, 3, 3); }
    topBar('🏆 명예의 전당', '모은 재화를 바치면 점수가 올라가요 · 코인 1점, 보석 ' + GEM_VALUE + '점');
    const h = hallLoad().sort((a, b) => b.pts - a.pts); const top = h.slice(0, 7), mine = h.findIndex(e => e.name === ECO.nick);
    box(120, 110, 720, 296, 'rgba(255,248,230,.97)', '#c8a040', 4);
    T('순위', 180, 136, 20, '#7a5a20', 'center'); T('닉네임', 400, 136, 20, '#7a5a20', 'center'); T('바친 점수', 720, 136, 20, '#7a5a20', 'center');
    if (!top.length) T('아직 기록이 없어요. 첫 번째 주인공이 되어 보세요!', W / 2, 260, 24, '#7a5a20', 'center', FONT_TX);
    top.forEach((e, i) => { const y = 170 + i * 34, me = e.name === ECO.nick; if (me) { ctx.fillStyle = 'rgba(255,210,60,.35)'; ctx.fillRect(130, y - 15, 700, 30); } const medal = ['#ffc83a', '#c8ccd8', '#d88a4a'][i];
      if (medal) { ctx.fillStyle = medal; ctx.beginPath(); ctx.arc(180, y, 13, 0, 7); ctx.fill(); T(String(i + 1), 180, y + 1, 18, '#3a2a1a', 'center'); } else T(String(i + 1), 180, y + 1, 20, '#3a2a1a', 'center');
      T(e.name + (me ? '  (나)' : ''), 400, y + 1, 22, '#2a1d12', 'center', FONT_TX); T(e.pts.toLocaleString() + '점', 720, y + 1, 22, '#2a1d12', 'center'); });
    if (mine >= 7) T('내 순위: ' + (mine + 1) + '위 · ' + h[mine].pts + '점', W / 2, 392, 19, '#a05010', 'center');
    BC.off = ECO.coins <= 0; BG.off = ECO.gems <= 0;
    btnDraw(BC, '코인 전부 바치기', '#7a5a10'); btnDraw(BG, '보석 전부 바치기', '#1a4a8a'); btnDraw(BN, '닉네임: ' + (ECO.nick || '없음'), '#3a3a5a', 20);
    if (msgT > 0) T(msg, W / 2, 500, 22, '#ffe680', 'center', FONT_TX);
  };
  return S;
}

// ---------- 펫 ----------
// [이름, 가격, 몸색, 무늬/포인트색, 모양]
const PETS = [['병아리', 10, '#ffe04a', '#ff9a2a', 'chick'], ['햄스터', 20, '#f2c890', '#ffffff', 'ham'], ['토끼', 35, '#f4f4f4', '#ffb0c0', 'bun'], ['고양이', 50, '#f2a04a', '#ffffff', 'cat'],
  ['강아지', 70, '#c8955a', '#7a4a20', 'dog'], ['펭귄', 100, '#2a3040', '#ffffff', 'peng'], ['여우', 150, '#ff7a2a', '#ffffff', 'fox'], ['아기 용', 300, '#5ad06a', '#ffd23a', 'dragon']];
const PET_IMG = {};
function petImg(kind, f) {
  const key = kind + f; if (PET_IMG[key]) return PET_IMG[key];
  const d = PETS.find(p => p[4] === kind), c1 = d[2], c2 = d[3], o = '#2a1a14';
  return PET_IMG[key] = mk(16, 16, p => {
    const leg = f ? 1 : 0;
    if (kind === 'chick') { p(4, 4, 8, 8, c1); p(3, 6, 10, 5, c1); p(9, 6, 1, 1, o); p(12, 7, 2, 1, c2); p(5, 12, 1, 2 + leg, c2); p(9, 12, 1, 3 - leg, c2); p(4, 8, 3, 2, '#ffd000'); return; }
    if (kind === 'peng') { p(4, 2, 8, 12, c1); p(6, 5, 5, 8, c2); p(7, 4, 1, 1, o); p(10, 4, 1, 1, o); p(8, 6, 2, 1, '#ff9a2a'); p(5, 14, 2, 1 + leg, '#ff9a2a'); p(9, 14, 2, 2 - leg, '#ff9a2a'); return; }
    // 네 발 동물 공통 몸
    p(3, 8, 10, 5, c1); p(4, 13, 2, 2 + leg, c1); p(10, 13, 2, 3 - leg, c1); p(9, 3, 6, 6, c1);
    p(13, 5, 1, 1, o); p(14, 7, 1, 1, kind === 'dragon' ? '#ff4a2a' : '#ff8aa0');
    if (kind === 'bun') { p(10, 0, 2, 4, c1); p(13, 0, 2, 4, c1); p(11, 1, 1, 2, c2); p(1, 9, 2, 2, c2); }
    if (kind === 'cat') { p(9, 2, 2, 2, c1); p(13, 2, 2, 2, c1); p(5, 8, 2, 5, c2); p(1, 6, 2, 4, c1); }
    if (kind === 'dog') { p(9, 3, 2, 4, c2); p(4, 8, 3, 2, c2); p(1, 7, 2, 2, c1); }
    if (kind === 'ham') { p(9, 2, 2, 2, c2); p(13, 2, 2, 2, c2); p(4, 10, 6, 3, c2); }
    if (kind === 'fox') { p(9, 1, 2, 3, c1); p(13, 1, 2, 3, c1); p(0, 6, 4, 4, c1); p(0, 8, 2, 2, c2); p(12, 7, 3, 2, c2); }
    if (kind === 'dragon') { p(5, 5, 4, 3, c2); p(10, 1, 1, 2, c2); p(13, 1, 1, 2, c2); p(0, 9, 3, 2, c1); p(5, 9, 6, 3, '#9af0a0'); }
  });
}
function PetShop() {
  const S = { noHome: true }; let msg = '', msgT = 0, sel = -1;
  const cards = PETS.map((p, i) => ({ x: 70 + (i % 4) * 210, y: 110 + Math.floor(i / 4) * 170, w: 190, h: 156, i }));
  S.click = (x, y) => {
    if (INPUT_OPEN) return;
    if (inside(x, y, BACK)) { SFX.click(); go(MainMenu()); return; }
    for (const c of cards) if (inside(x, y, c)) {
      const [name, price, , , kind] = PETS[c.i];
      if (ECO.coins < price) { msg = '코인이 부족해요! (' + name + ' ' + price + '원, 가진 코인 ' + ECO.coins + '원)'; msgT = 3; SFX.bad(); return; }
      SFX.click();
      askText(name + ' 입양하기 (' + price + '원)', '새 가족이 될 ' + name + '의 이름을 지어 주세요', '', 8, v => { ECO.coins -= price; ECO.pets.push({ kind, name: v }); ecoSave(); msg = '"' + v + '"(' + name + ')를 입양했어요!'; msgT = 3; SFX.clear(); }, () => { });
      return;
    }
  };
  S.key = k => { if (k === 'esc') S.click(BACK.x + 1, BACK.y + 1); };
  S.update = dt => { if (msgT > 0) msgT -= dt; };
  S.draw = () => {
    ctx.fillStyle = '#21402e'; ctx.fillRect(0, 0, W, H); for (let x = 0; x < W; x += 40) { ctx.fillStyle = 'rgba(255,255,255,.03)'; ctx.fillRect(x, 0, 20, H); }
    topBar('🐾 펫 상점', '코인으로 펫을 입양하고 이름을 지어 줘요 · 입양한 펫은 메인 화면에서 함께 뛰어놀아요');
    cards.forEach(c => {
      const [name, price, , , kind] = PETS[c.i], can = ECO.coins >= price, h = inside(mouse.x, mouse.y, c);
      box(c.x, c.y - (h ? 4 : 0), c.w, c.h, h ? '#fff3c8' : '#fff8e6', can ? '#3a2a1a' : '#9a9a9a', 3);
      const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false; ctx.drawImage(petImg(kind, (S.t * 4 | 0) % 2 && h ? 1 : 0), c.x + c.w / 2 - 32, c.y + 12 - (h ? 4 : 0), 64, 64); ctx.imageSmoothingEnabled = sm;
      T(name, c.x + c.w / 2, c.y + 96 - (h ? 4 : 0), 24, '#2a1d12', 'center');
      drawCoinIcon(c.x + c.w / 2 - 40, c.y + 116 - (h ? 4 : 0), 2); T(price + '원', c.x + c.w / 2 + 12, c.y + 129 - (h ? 4 : 0), 22, can ? '#8a5a00' : '#aa3a3a', 'center');
    });
    const own = ECO.pets; T('우리 집 펫: ' + (own.length ? own.map(p => p.name).join(', ') : '아직 없어요'), W / 2, 470, 20, '#e8ffe8', 'center', FONT_TX);
    if (msgT > 0) T(msg, W / 2, 506, 22, '#ffe680', 'center', FONT_TX);
  };
  return S;
}

// ---------- 초기화 확인 ----------
function ResetConfirm() {
  const S = { noHome: true }; const Y = { x: W / 2 - 230, y: 330, w: 210, h: 64 }, N = { x: W / 2 + 20, y: 330, w: 210, h: 64 };
  S.click = (x, y) => {
    if (inside(x, y, Y)) { ECO.coins = 0; ECO.gems = 0; ECO.pets = []; ECO.nick = ''; ecoSave(); G.pendant = false; SFX.clear(); go(Notice('초기화 완료!', '코인·보석·펫·닉네임을 모두 지웠어요.\n명예의 전당 기록은 그대로 남아 있어요.\n다음 사람이 시작해도 좋아요!', () => MainMenu(), { auto: 3 })); }
    else if (inside(x, y, N)) { SFX.click(); go(MainMenu()); }
  };
  S.key = k => { if (k === 'esc') S.click(N.x + 1, N.y + 1); };
  S.draw = () => {
    ctx.fillStyle = '#1a1020'; ctx.fillRect(0, 0, W, H); box(W / 2 - 320, 110, 640, 320, '#fff8e6', '#c83a3a', 5);
    T('정말 초기화할까요?', W / 2, 170, 40, '#c83a3a', 'center');
    ['코인 ' + ECO.coins + '개 · 보석 ' + ECO.gems + '개 · 펫 ' + ECO.pets.length + '마리 · 닉네임이 모두 지워져요.', '명예의 전당에 남긴 기록은 지워지지 않아요.', '다음 사람에게 넘겨줄 때 눌러 주세요.'].forEach((s, i) => T(s, W / 2, 228 + i * 32, 20, i === 1 ? '#2a7a3a' : '#3a2a1a', 'center', FONT_TX));
    btnDraw(Y, '네, 초기화', '#a02020', 24); btnDraw(N, '아니요', '#3a3a5a', 24);
  };
  return S;
}
