// ===================== 메인 화면 =====================
const APTS = (() => { const r = seeded(4242), a = []; let x = -10; while (x < LW) { const w = 46 + Math.floor(r() * 20), h = 110 + Math.floor(r() * 80); a.push({ x, w, h, n: 101 + a.length, lit: Array.from({ length: 200 }, () => r()) , far: false }); x += w + 6 + Math.floor(r() * 10); } return a; })();
const APTS_FAR = (() => { const r = seeded(777), a = []; let x = 0; while (x < LW) { const w = 30 + Math.floor(r() * 16), h = 90 + Math.floor(r() * 60); a.push({ x, w, h }); x += w + 3; } return a; })();
function bgMenu(c, t) {
  sky(c, '141a40', '4a3a7a');
  for (let i = 0; i < 50; i++) { const tw = (Math.sin(t * 2 + i) + 1) / 2; R(c, (i * 89) % LW, (i * 37) % 110, 1, 1, tw > 0.5 ? '#fff' : '#fff6'); }
  c.fillStyle = '#f2eccc'; c.beginPath(); c.arc(408, 38, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = '#18204a'; c.beginPath(); c.arc(413, 35, 8, 0, Math.PI * 2); c.fill();
  for (const b of APTS_FAR) R(c, b.x, 235 - b.h, b.w, b.h, '#252a52');
  for (const b of APTS) {
    const y0 = 235 - b.h; R(c, b.x, y0, b.w, b.h, '#353b6a'); R(c, b.x + b.w - 5, y0, 5, b.h, '#2a2f58'); R(c, b.x, y0 - 4, b.w, 4, '#40467a');
    R(c, b.x + b.w / 2 - 9, y0 + 4, 18, 8, '#2a2f58'); c.fillStyle = '#c8ccf0'; c.font = 'bold 7px sans-serif'; c.fillText(b.n + '동', b.x + b.w / 2 - 8, y0 + 11);
    let k = 0;
    for (let yy = y0 + 16; yy < 225; yy += 9) for (let xx = b.x + 4; xx < b.x + b.w - 8; xx += 8) { const v = b.lit[k++ % 200]; const on = v > 0.45 && !(v > 0.9 && ((t * 0.5 + v * 10) | 0) % 3 === 0); R(c, xx, yy, 5, 5, on ? (v > 0.8 ? '#ffe9a8' : '#f2c86a') : '#1f2348'); }
  }
  R(c, 0, 228, LW, 42, '#1a1d36'); R(c, 0, 228, LW, 2, '#3a3f6a');
  for (let i = 0; i < 9; i++) tree(c, i * 56 + 8, 210, 1.2, '#1f3a2a');
  for (let x = 0; x < LW; x += 30) R(c, x + ((t * 30) % 30), 250, 14, 2, '#5a5f8a');
  spr(c, SPR.police[(t * 8 | 0) % 2], 60 + ((t * 40) % 420), 228);
  spr(c, SPR.ai[(t * 8 | 0) % 2], 100 + ((t * 40) % 420), 228);
}
function MainMenu() {
  const S = { noHome: true };
  const B = [{ x: W / 2 - 230, y: 210, w: 460, h: 96, n: '경찰과 AI', s: '허위 사실을 퍼뜨린 AI를 잡아라!', go: () => PoliceIntro() },
  { x: W / 2 - 230, y: 330, w: 460, h: 96, n: '주인을 찾아서', s: '주인을 잃어버린 AI 강아지 로봇의 모험', go: () => (typeof DogIntro === 'function' ? DogIntro() : Notice('제작 중!', '주인을 찾아서는 곧 추가됩니다.', () => MainMenu())) }];
  S.enter = () => { G.pendant = false; };
  S.click = (x, y) => B.forEach(b => { if (inside(x, y, b)) { SFX.ok(); go(b.go()); } });
  S.draw = () => {
    L.clearRect(0, 0, LW, LH); bgMenu(L, S.t); blitLo();
    T('우리가 만드는 강당 AI 과학 체험부스', W / 2, 80, 30, '#bcd0ff', 'center', FONT_UI, '#000');
    T('AI 어드벤처', W / 2, 140, 72, '#ffe08a', 'center', FONT_UI, '#2a1a00');
    B.forEach((b, i) => {
      const h = inside(mouse.x, mouse.y, b);
      box(b.x, b.y + (h ? -4 : 0), b.w, b.h, h ? '#ffe08a' : '#2a2a5a', h ? '#fff' : '#9aa4c8', 5);
      drawPortrait(i ? 'dog' : 'police', b.x + 14, b.y + 8 + (h ? -4 : 0), 0.85, 94);
      T(b.n, b.x + 110, b.y + 36 + (h ? -4 : 0), 38, h ? '#2a1a00' : '#fff');
      T(b.s, b.x + 110, b.y + 72 + (h ? -4 : 0), 20, h ? '#5a3a10' : '#bcd0ff', 'left', FONT_TX);
    });
    T('마우스를 버튼에 가져다 대고 클릭하세요', W / 2, H - 30, 20, '#ccd', 'center');
  };
  return S;
}
try { ['30px "Do Hyeon"', '20px "Gowun Dodum"', '40px "Nanum Pen Script"'].forEach(f => document.fonts.load(f)); } catch (e) { }
setScene(MainMenu());
requestAnimationFrame(loop);
