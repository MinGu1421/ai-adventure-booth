// ===================== 만남의 광장 : 4대 컴퓨터의 친구들이 함께 모이는 곳 (Supabase) =====================
// 방향키/WASD로 걷기 · 이모티콘 버튼 · Enter로 채팅(나쁜 말은 서버에서 ♥♥로 가려짐)
const LOOKS = [['#e84a4a', '#3a2a8a'], ['#3a8ae8', '#2a2a3a'], ['#3ac86a', '#5a3a1a'], ['#f2a02a', '#2a4a6a'], ['#b05ae8', '#3a2a2a'], ['#ff7ab0', '#2a3a5a']];
const AVA = {};
function avaImg(look, f) {
  const k = look + '_' + f; if (AVA[k]) return AVA[k];
  const [shirt, pants] = LOOKS[look % LOOKS.length], skin = '#ffd2a8', hair = '#3a2414', o = '#1a1210';
  return AVA[k] = mk(12, 18, p => {
    p(3, 0, 6, 2, hair); p(2, 1, 8, 3, hair); p(3, 3, 6, 5, skin); p(2, 3, 1, 2, hair); p(9, 3, 1, 2, hair);
    p(4, 5, 1, 1, o); p(7, 5, 1, 1, o); p(5, 7, 2, 1, '#d87a6a');
    p(2, 8, 8, 5, shirt); p(1, 9, 1, 3, shirt); p(10, 9, 1, 3, shirt); p(1, 12, 1, 1, skin); p(10, 12, 1, 1, skin);
    p(3, 13, 6, 2, pants);
    if (f) { p(3, 15, 2, 2, pants); p(7, 15, 2, 1, pants); p(3, 17, 2, 1, o); p(7, 16, 2, 1, o); }
    else { p(3, 15, 2, 2, pants); p(7, 15, 2, 2, pants); p(3, 17, 2, 1, o); p(7, 17, 2, 1, o); }
  });
}
const nickLook = n => { let h = 0; for (const ch of n || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % LOOKS.length; };

function Plaza() {
  const S = { noHome: true };
  const me = { x: 300 + Math.random() * 360, y: 400, dir: 1, walk: 0, emote: '', emoteT: 0, say: '', sayT: 0 };
  const EMO = ['👋', '❤️', '😂', '👍', '🎉', '😮'];
  const EB = EMO.map((e, i) => ({ x: 214 + i * 64, y: 482, w: 56, h: 46, e }));
  const CB = { x: 614, y: 482, w: 196, h: 46 };
  const FX = 480, FY = 300, FR = 78;              // 분수대 (못 지나감)
  let others = {}, chat = [], online = null, busy = false, lastSync = -9, sendEmote = null, sendSay = null, seen = {};
  const say = () => {
    if (!ECO.nick) return;
    askText('💬 채팅', '광장에 있는 친구들에게 보낼 말 (40자 이내) · 고운 말을 써요!', '', 40, v => { sendSay = v; }, () => { });
  };
  S.enter = () => { if (!ECO.nick) setTimeout(() => askNickname('광장에 들어가려면 닉네임이 필요해요', '다른 사람이 쓰는 닉네임은 쓸 수 없어요 (10자 이내)', null, () => go(MainMenu())), 350); };
  function sync() {
    if (busy || !ECO.nick) return; busy = true; lastSync = S.t;
    const body = { p_name: ECO.nick, p_x: me.x, p_y: me.y, p_dir: me.dir, p_look: nickLook(ECO.nick), p_pet: ECO.pets[0] ? ECO.pets[0].kind : null, p_emote: sendEmote, p_say: sendSay };
    const se = sendEmote, ss = sendSay;
    fetch(SB_URL + '/rest/v1/rpc/booth_plaza_sync', { method: 'POST', headers: SB_H, body: JSON.stringify(body) })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => {
        online = true; if (sendEmote === se) sendEmote = null; if (sendSay === ss) sendSay = null;
        const now = {};
        d.players.forEach(p => { const o = others[p.name] || { x: p.x, y: p.y, walk: 0 }; Object.assign(o, { tx: p.x, ty: p.y, dir: p.dir, look: p.look, pet: p.pet }); if (p.emote && p.emote_age != null && p.emote_age < 3) { if (o.emAt !== p.emote + Math.round(p.emote_age)) { o.emote = p.emote; o.emoteT = 3 - p.emote_age; } } now[p.name] = o; });
        others = now;
        chat = d.chat.map(c => ({ name: c.name, msg: c.msg }));
        d.chat.forEach(c => { if (!seen[c.id]) { seen[c.id] = 1; if (c.age < 6) { const who = c.name === ECO.nick ? me : others[c.name]; if (who) { who.say = c.msg; who.sayT = 5 - Math.min(4, c.age); } if (c.name !== ECO.nick) beep(880, 0.06, 'square', 0.03); } } });
      })
      .catch(() => { online = false; })
      .finally(() => { busy = false; });
  }
  S.click = (x, y) => {
    if (INPUT_OPEN) return;
    if (inside(x, y, BACK)) { SFX.click(); go(MainMenu()); return; }
    for (const b of EB) if (inside(x, y, b)) { me.emote = b.e; me.emoteT = 3; sendEmote = b.e; SFX.click(); return; }
    if (inside(x, y, CB)) { SFX.click(); say(); }
  };
  S.key = k => {
    if (INPUT_OPEN) return;
    if (k === 'esc') S.click(BACK.x + 1, BACK.y + 1);
    if (k === 'enter') say();
    if (/^[1-6]$/.test(k)) S.click(EB[+k - 1].x + 2, EB[+k - 1].y + 2);
  };
  S.update = dt => {
    if (!INPUT_OPEN) {
      let dx = (keys.arrowright || keys.d ? 1 : 0) - (keys.arrowleft || keys.a ? 1 : 0), dy = (keys.arrowdown || keys.s ? 1 : 0) - (keys.arrowup || keys.w ? 1 : 0);
      if (dx || dy) { const l = Math.hypot(dx, dy); me.x += dx / l * 170 * dt; me.y += dy / l * 150 * dt; if (dx) me.dir = dx; me.walk += dt; } else me.walk = 0;
      me.x = Math.max(24, Math.min(W - 24, me.x)); me.y = Math.max(190, Math.min(462, me.y));
      const ddx = me.x - FX, ddy = (me.y - FY) * 1.6, dd = Math.hypot(ddx, ddy); if (dd < FR) { me.x = FX + ddx / dd * FR; me.y = FY + ddy / dd * FR / 1.6; }
    }
    if (me.emoteT > 0) me.emoteT -= dt; if (me.sayT > 0) me.sayT -= dt;
    for (const n in others) { const o = others[n]; const mv = Math.hypot(o.tx - o.x, o.ty - o.y); o.x += (o.tx - o.x) * Math.min(1, dt * 8); o.y += (o.ty - o.y) * Math.min(1, dt * 8); o.walk = mv > 2 ? o.walk + dt : 0; if (o.emoteT > 0) o.emoteT -= dt; if (o.sayT > 0) o.sayT -= dt; }
    if (S.t - lastSync > 0.4 || sendSay || sendEmote) sync();
  };
  function bubble(x, y, s, col) {
    ctx.font = '18px ' + FONT_TX; const w = Math.min(320, ctx.measureText(s).width + 22);
    const bx = Math.max(6, Math.min(W - w - 6, x - w / 2)), by = y - 40;
    box(bx, by, w, 32, col || '#fff', '#2a2a3a', 2); ctx.fillStyle = col || '#fff'; ctx.beginPath(); ctx.moveTo(x - 6, by + 30); ctx.lineTo(x, by + 40); ctx.lineTo(x + 6, by + 30); ctx.fill();
    T(s, bx + w / 2, by + 17, 18, '#1a1a2a', 'center', FONT_TX);
  }
  function person(p, name, mine) {
    const f = p.walk > 0 ? ((p.walk * 8) | 0) % 2 : 0, sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 18, 6, 0, 0, 7); ctx.fill();
    const img = avaImg(mine ? nickLook(ECO.nick) : p.look || 0, f);
    ctx.save(); ctx.translate(p.x, p.y - 54 - (f ? 2 : 0)); if (p.dir < 0) ctx.scale(-1, 1); ctx.drawImage(img, -18, 0, 36, 54); ctx.restore();
    if (!mine && p.pet) { const pf = ((performance.now() / 120) | 0) % 2 && p.walk > 0 ? 1 : 0; ctx.save(); ctx.translate(p.x - p.dir * 30, p.y - 24); if (p.dir < 0) ctx.scale(-1, 1); ctx.drawImage(petImg(p.pet, pf), -12, 0, 24, 24); ctx.restore(); }
    ctx.imageSmoothingEnabled = sm;
    T(name + (mine ? ' (나)' : ''), p.x, p.y - 66, 17, mine ? '#ffe680' : '#fff', 'center', FONT_UI, '#000');
    if (p.sayT > 0) bubble(p.x, p.y - 78, p.say);
    else if (p.emoteT > 0) { const k = Math.min(1, (3 - p.emoteT) * 6); T(p.emote, p.x, p.y - 100 - (1 - k) * 10, 34 * k + 1, '#fff', 'center'); }
  }
  S.draw = () => {
    // 하늘·건물·광장 바닥
    ctx.fillStyle = '#8fd0ff'; ctx.fillRect(0, 0, W, 170);
    for (let i = 0; i < 6; i++) { const cx = ((i * 190 + S.t * 8) % (W + 160)) - 80; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(cx, 120 + (i % 2) * 18, 46, 14, 0, 0, 7); ctx.fill(); }
    [[0, 90, '#c8a882'], [150, 70, '#e0b090'], [700, 80, '#b8c0d8'], [830, 100, '#d0a0a0']].forEach(([x, h, c]) => { ctx.fillStyle = c; ctx.fillRect(x, 170 - h, 130, h); ctx.fillStyle = '#6a8ab8'; for (let wy = 170 - h + 14; wy < 160; wy += 26) for (let wx = x + 14; wx < x + 120; wx += 30) ctx.fillRect(wx, wy, 16, 14); });
    ctx.fillStyle = '#d8c8a8'; ctx.fillRect(0, 170, W, H - 170);
    for (let y = 170; y < H; y += 30) for (let x = ((y / 30) % 2) * 30; x < W; x += 60) { ctx.fillStyle = '#cdbb98'; ctx.fillRect(x, y, 30, 30); }
    ctx.fillStyle = '#4aa04a'; [[40, 200], [920, 200], [40, 440], [920, 440]].forEach(([x, y]) => { ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x - 6, y - 10, 12, 40); ctx.fillStyle = '#3a9a4a'; ctx.beginPath(); ctx.arc(x, y - 26, 30, 0, 7); ctx.fill(); });
    // 분수대
    ctx.fillStyle = '#9aa0b0'; ctx.beginPath(); ctx.ellipse(FX, FY, FR, FR / 1.6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#4ab0e8'; ctx.beginPath(); ctx.ellipse(FX, FY, FR - 12, FR / 1.6 - 9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#c8ccd8'; ctx.fillRect(FX - 8, FY - 46, 16, 46);
    for (let i = 0; i < 10; i++) { const a = (S.t * 2 + i * 0.63) % 1; ctx.fillStyle = 'rgba(220,245,255,' + (1 - a) + ')'; ctx.fillRect(FX + Math.cos(i * 0.63) * 34 * a, FY - 50 + a * a * 60 - a * 40, 5, 5); }
    // 사람들 (아래쪽에 있는 사람이 앞에 보이게)
    const list = Object.keys(others).map(n => [others[n], n, false]); list.push([me, ECO.nick || '?', true]);
    list.sort((a, b) => a[0].y - b[0].y).forEach(([p, n, m]) => person(p, n, m));
    topBar('🤝 만남의 광장', '방향키로 걷고, 이모티콘(1~6)과 채팅(Enter)으로 다른 컴퓨터의 친구들과 인사해요');
    const cnt = Object.keys(others).length + 1;
    T(online === null ? '● 서버 연결 중…' : online ? '● 지금 광장에 ' + cnt + '명' : '● 서버 연결 안 됨 · 인터넷을 확인해 주세요', W - 16, 74, 17, online === false ? '#ff8a8a' : '#c8ffd0', 'right', FONT_UI, '#000');
    // 채팅 기록
    if (chat.length) { const sh = chat.slice(-5); box(12, 470 - sh.length * 24 - 14, 196, sh.length * 24 + 12, 'rgba(10,10,30,.6)', null); }
    chat.slice(-5).forEach((c, i, a) => { const s = c.name + ': ' + c.msg; T(s.length > 14 ? s.slice(0, 14) + '…' : s, 20, 470 - (a.length - i) * 24 + 2, 15, c.name === ECO.nick ? '#ffe680' : '#fff', 'left', FONT_TX); });
    EB.forEach(b => { const h = inside(mouse.x, mouse.y, b); box(b.x, b.y, b.w, b.h, h ? '#ffe08a' : 'rgba(20,20,50,.85)', '#fff', 2); T(b.e, b.x + b.w / 2, b.y + b.h / 2 + 1, 26, '#fff', 'center'); });
    btnDraw(CB, '💬 채팅 (Enter)', '#2a6a4a', 21);
  };
  return S;
}
