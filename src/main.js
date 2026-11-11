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
  for (let x = 0; x < LW; x += 30) R(c, x, 250, 14, 2, '#5a5f8a');
  spr(c, SPR.police[(t * 8 | 0) % 2], 60 + ((t * 40) % 420), 228);
  spr(c, SPR.ai[(t * 8 | 0) % 2], 100 + ((t * 40) % 420), 228);
}
function MainMenu() {
  const S = { noHome: true };
  const B = [{ x: W / 2 - 260, y: 210, w: 520, h: 96, n: '경찰과 AI', s: '허위 사실을 퍼뜨린 AI를 잡아라!', warn: '⚠ 공포 미로가 있으니 주의하세요.', go: () => PoliceIntro() },
  { x: W / 2 - 260, y: 330, w: 520, h: 96, n: '주인을 찾아서', s: '주인을 잃어버린 AI 강아지 로봇의 모험', go: () => (typeof DogIntro === 'function' ? DogIntro() : Notice('제작 중!', '주인을 찾아서는 곧 추가됩니다.', () => MainMenu())) }];
  // 아래쪽 작은 버튼: 명예의 전당 · 펫 상점 · 초기화
  const B2 = [{ x: 14, y: 14, w: 180, h: 44, n: '🏆 명예의 전당', go: () => HallOfFame(), col: '#6a4a10' }, { x: 14, y: 66, w: 180, h: 44, n: '🐾 펫 상점', go: () => PetShop(), col: '#1f5a3a' }, { x: 14, y: 118, w: 180, h: 44, n: '⟲ 초기화', go: () => ResetConfirm(), col: '#6a1a1a' }];
  S.enter = () => { G.pendant = false; };
  S.click = (x, y) => { B.forEach(b => { if (inside(x, y, b)) { SFX.ok(); go(b.go()); } }); B2.forEach(b => { if (inside(x, y, b)) { SFX.click(); go(b.go()); } }); };
  S.draw = () => {
    L.clearRect(0, 0, LW, LH); bgMenu(L, S.t); blitLo();
    T('우리가 만드는 강당 AI 과학 체험부스', W / 2, 80, 30, '#bcd0ff', 'center', FONT_UI, '#000');
    T('AI 어드벤처', W / 2, 140, 72, '#ffe08a', 'center', FONT_UI, '#2a1a00');
    B.forEach((b, i) => {
      const h = inside(mouse.x, mouse.y, b);
      box(b.x, b.y + (h ? -4 : 0), b.w, b.h, h ? '#ffe08a' : '#2a2a5a', h ? '#fff' : '#9aa4c8', 5);
      drawPortrait(i ? 'dog' : 'police', b.x + 14, b.y + 8 + (h ? -4 : 0), 0.85, 94);
      T(b.n, b.x + 110, b.y + 36 + (h ? -4 : 0), 38, h ? '#2a1a00' : '#fff');
      if (b.warn) T(b.warn, b.x + 268, b.y + 38 + (h ? -4 : 0), 17, h ? '#b01818' : '#ff8a8a', 'left', FONT_TX);
      T(b.s, b.x + 110, b.y + 72 + (h ? -4 : 0), 20, h ? '#5a3a10' : '#bcd0ff', 'left', FONT_TX);
    });
    // 배경의 경찰이 AI를 쫓으며 외치는 말풍선 (경찰 왼쪽, 버튼·AI와 겹치지 않게)
    { const px = (60 + ((S.t * 40) % 420)) * 2, py = 228 * 2; if ((S.t % 3) < 2 && px > 140) {
      const bx = px - 128, by = py - 4; box(bx, by, 112, 34, '#fff', '#222', 2); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(bx + 108, by + 10); ctx.lineTo(bx + 124, by + 18); ctx.lineTo(bx + 108, by + 24); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 111, by + 10); ctx.lineTo(bx + 124, by + 18); ctx.lineTo(bx + 111, by + 24); ctx.stroke();
      T('거기 서라!', bx + 56, by + 18, 19, '#c81818', 'center'); } }
    // 입양한 펫들이 길 위를 뛰어다님 (이름표와 함께)
    ECO.pets.forEach((p, i) => { const sp = 34 + (i % 3) * 9, x = ((S.t * sp + i * 137) % (W + 120)) - 60, y = 498 + (i % 2) * 10, f = (S.t * 8 + i | 0) % 2; const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false; ctx.drawImage(petImg(p.kind, f), x, y - 34 - (f ? 2 : 0), 34, 34); ctx.imageSmoothingEnabled = sm; T(p.name, x + 17, y - 40, 13, '#fff', 'center'); });
    B2.forEach(b => btnDraw(b, b.n, b.col, 19));
    drawWallet(W - 208, 10);
    T('마우스를 버튼에 가져다 대고 클릭하세요', W / 2, H - 22, 18, '#ccd', 'center');
  };
  return S;
}
try { ['30px "Do Hyeon"', '20px "Gowun Dodum"', '40px "Nanum Pen Script"'].forEach(f => document.fonts.load(f)); } catch (e) { }
setScene(MainMenu());
requestAnimationFrame(loop);
