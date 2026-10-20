/* 실기시험(작업형) — 풀뽑기 작업장, 라멘 로우 콜 응대 */
window.CN = window.CN || {};

CN.practical = (function () {
  const u = CN.u;
  let timers = [], onVis = null, onUnload = null;

  function cleanup() {
    timers.forEach((t) => { clearInterval(t); clearTimeout(t); });
    timers = [];
    if (onVis) document.removeEventListener('visibilitychange', onVis);
    if (onUnload) window.removeEventListener('beforeunload', onUnload);
    onVis = onUnload = null;
  }

  function finish(app, score, detail, disq) {
    cleanup();
    const pass = !disq && score >= CN.certs[app.certId].practical.pass[app.grade];
    app.result = { score, pass, detail, voided: !!disq };
    app.status = disq ? '실격' : '채점완료';
    app.finishedAt = new Date().toISOString();
    app.session = { phase: 'done' };
    CN.store.saveApp(app);
    CN.router.go('#/result/' + app.no);
  }

  function guard(app) {
    onVis = () => {
      if (document.visibilityState === 'hidden') finish(app, 0, ['시험 도중 작업장을 벗어남 (운영규정 제5조)'], true);
    };
    onUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', onUnload);
  }

  function render(app, mount) {
    cleanup();
    /* 작업 도중 새로고침하거나 나갔다 들어온 경우: 작업장 이탈로 실격 */
    if (app.session && app.session.phase === 'play') return finish(app, 0, ['시험 도중 작업장을 벗어남 (운영규정 제5조)'], true);
    if (!app.session) { app.session = { phase: 'brief' }; CN.store.saveApp(app); }
    const kind = CN.certs[app.certId].practical.kind;
    if (kind === 'weed') weedBrief(app, mount);
    else ramenBrief(app, mount);
  }

  /* ════════════ 풀뽑기 작업장 ════════════ */
  const P = {
    grass: { name: '바랭이', weed: true, tool: ['hand', 'hoe'] },
    clover: { name: '토끼풀', weed: true, tool: ['hand', 'hoe'] },
    dandelion: { name: '민들레', weed: true, tool: ['hoe'] },
    purslane: { name: '쇠비름', weed: true, tool: ['hand', 'hoe'], bag: true },
    horsetail: { name: '쇠뜨기', weed: true, tool: ['hoe'], hits: 2 },
    wetweed: { name: '물에 젖으면 늘어나는 풀', weed: true, tool: ['hand', 'hoe'], bag: true, spread: true },
    flower: { name: '화초 (보호)', weed: false },
    sprout: { name: '작물 새싹 (보호)', weed: false },
    whitedandelion: { name: '흰민들레 (보호)', weed: false },
  };

  const WEED_CFG = {
    5: { size: 4, mix: { grass: 4, clover: 3, dandelion: 3, flower: 2, sprout: 2 }, labels: true, alarm: false },
    4: { size: 5, mix: { grass: 5, clover: 3, dandelion: 4, purslane: 4, flower: 3, sprout: 2 }, labels: true, alarm: false },
    3: { size: 6, mix: { grass: 5, clover: 3, dandelion: 4, purslane: 4, horsetail: 4, wetweed: 3, flower: 3, sprout: 3 }, labels: true, alarm: false },
    2: { size: 6, mix: { grass: 4, clover: 3, dandelion: 4, purslane: 4, horsetail: 5, wetweed: 3, flower: 3, sprout: 3 }, labels: true, alarm: true },
    1: { size: 7, mix: { grass: 6, clover: 4, dandelion: 5, purslane: 5, horsetail: 5, wetweed: 4, flower: 4, sprout: 3, whitedandelion: 4 }, labels: false, alarm: true },
  };

  const INK = '#4B3A30';
  function plantSVG(type, state) {
    const st = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
    let g = '';
    switch (type) {
      case 'grass':
        g = `<path d="M30 52 Q24 34 14 22" fill="none" ${st} /><path d="M30 52 Q30 30 30 12" fill="none" ${st}/><path d="M30 52 Q36 34 46 22" fill="none" ${st}/><path d="M30 52 Q20 42 10 40" fill="none" ${st}/><path d="M30 52 Q40 42 50 40" fill="none" ${st}/>
          <path d="M30 52 Q24 34 14 22 M30 52 Q30 30 30 12 M30 52 Q36 34 46 22" fill="none" stroke="#8CC56B" stroke-width="1" />`;
        break;
      case 'clover':
        g = `<path d="M30 52 V34" ${st}/><circle cx="23" cy="28" r="8" fill="#A8D88A" ${st}/><circle cx="37" cy="28" r="8" fill="#A8D88A" ${st}/><circle cx="30" cy="18" r="8" fill="#A8D88A" ${st}/><path d="M20 28 h6 M34 28 h6 M30 14 v6" stroke="#fff" stroke-width="1.6"/>`;
        break;
      case 'dandelion':
      case 'whitedandelion': {
        const fc = type === 'dandelion' ? '#FFD84D' : '#FFFFFF';
        g = `<path d="M30 52 L14 44 L20 42 L10 36 L22 38 L30 52 L38 38 L50 36 L40 42 L46 44 Z" fill="#9CCB7A" ${st}/><path d="M30 50 V24" ${st}/>
          <g ${st}>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="30" cy="12" rx="3.2" ry="7" fill="${fc}" transform="rotate(${a} 30 19)"/>`).join('')}</g><circle cx="30" cy="19" r="4" fill="${type === 'dandelion' ? '#F2A91F' : '#FFE9A0'}" ${st}/>`;
        break;
      }
      case 'purslane':
        g = `<path d="M30 52 Q20 44 12 46 M30 52 Q40 44 48 46 M30 52 Q28 40 22 32 M30 52 Q34 40 40 30" fill="none" stroke="#B8505F" stroke-width="3" stroke-linecap="round"/>
          ${[[12, 44], [48, 44], [21, 30], [41, 28], [17, 38], [44, 38]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.4" fill="#8FC977" ${st}/>`).join('')}`;
        break;
      case 'horsetail':
        g = `<path d="M30 54 V10" ${st}/>${[16, 24, 32, 40].map((y) => `<path d="M30 ${y} L18 ${y + 6} M30 ${y} L42 ${y + 6} M30 ${y} L22 ${y + 9} M30 ${y} L38 ${y + 9}" stroke="#7DB862" stroke-width="2" stroke-linecap="round"/><path d="M27 ${y} H33" ${st}/>`).join('')}`;
        break;
      case 'wetweed':
        g = `<path d="M30 52 Q18 40 24 30 Q30 22 22 12" fill="none" stroke="#5C9FB8" stroke-width="5" stroke-linecap="round"/><path d="M30 52 Q42 42 36 30 Q32 22 40 14" fill="none" stroke="#5C9FB8" stroke-width="5" stroke-linecap="round"/>
          <path d="M30 52 Q18 40 24 30 Q30 22 22 12 M30 52 Q42 42 36 30 Q32 22 40 14" fill="none" stroke="${INK}" stroke-width="1.4"/><path d="M46 20 Q50 26 46 29 Q42 26 46 20Z" fill="#9FD3F5" ${st}/><circle cx="22" cy="12" r="3" fill="#B98AD8" ${st}/><circle cx="40" cy="14" r="3" fill="#B98AD8" ${st}/>`;
        break;
      case 'flower':
        g = `<path d="M30 52 V26" ${st}/><path d="M30 44 Q20 40 18 32 Q26 34 30 42" fill="#9CCB7A" ${st}/><path d="M20 16 Q20 28 30 30 Q40 28 40 16 L35 21 L30 12 L25 21 Z" fill="#F9A8BE" ${st}/>`;
        break;
      case 'sprout':
        g = `<path d="M8 52 H52" stroke="#B48A62" stroke-width="2" stroke-dasharray="4 3"/><path d="M30 52 V32" ${st}/><path d="M30 34 Q16 34 14 24 Q26 22 30 32" fill="#C9E7A6" ${st}/><path d="M30 34 Q44 34 46 24 Q34 22 30 32" fill="#C9E7A6" ${st}/>`;
        break;
    }
    let wrap = g;
    if (state === 'pulled') wrap = `<g transform="rotate(80 30 40) translate(0 -4)" opacity=".85">${g}</g>`;
    if (state === 'dug1') wrap = `<path d="M10 50 Q30 38 50 50Z" fill="#C79A6B" stroke="${INK}" stroke-width="2"/><g opacity=".75">${g}</g>`;
    if (state === 'damaged') wrap = `<g opacity=".45" transform="rotate(-25 30 50)">${g}</g><path d="M18 18 L42 42 M42 18 L18 42" stroke="#E0475E" stroke-width="3" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 60 60" class="plant">${wrap}</svg>`;
  }
  const stumpSVG = `<svg viewBox="0 0 60 60" class="plant"><ellipse cx="30" cy="48" rx="10" ry="4" fill="#C79A6B" stroke="${INK}" stroke-width="2"/><path d="M27 48 V40 L30 43 L33 40 V48" fill="#E8D5A8" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  const oddSVG = `<svg viewBox="0 0 60 60" class="plant odd"><path d="M8 52 C4 40 12 30 20 32 C20 20 34 16 38 26 C46 20 56 30 52 40 C58 44 56 54 50 54 Z" fill="#5E7F4E" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><g class="odd-eyes"><ellipse cx="26" cy="40" rx="3" ry="3.6" fill="#FFF8D6"/><ellipse cx="38" cy="40" rx="3" ry="3.6" fill="#FFF8D6"/><circle cx="26.5" cy="41" r="1.4" fill="${INK}"/><circle cx="38.5" cy="41" r="1.4" fill="${INK}"/></g></svg>`;
  const doneSVG = `<svg viewBox="0 0 60 60" class="plant"><path d="M14 34 L26 44 L46 18" fill="none" stroke="#7FB069" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  /* 공구 아이콘 (손그림) */
  const ICO = {
    hand: `<svg viewBox="0 0 48 48" class="ico" aria-hidden="true"><path d="M15 39 L14 25 C13.6 21.6 17.6 20.8 18 24 L18 12 C18 8.4 22 8.4 22 12 L22 9 C22 5.4 26 5.4 26 9 L26 11 C26 7.6 30 7.6 30 11 L30 14 C30 10.8 34 10.8 34 14 L34.4 30 C34.6 35 33 38.6 32 39 Z" fill="#FFF7E8" stroke="#262626" stroke-width="2.3" stroke-linejoin="round"/><path d="M22 12 V23 M26 10.5 V23 M30 13.5 V23" stroke="#262626" stroke-width="1.6" stroke-linecap="round"/><circle cx="20" cy="30" r="1.5" fill="#F08AA3"/><circle cx="25" cy="32" r="1.5" fill="#F08AA3"/><circle cx="29.5" cy="29" r="1.5" fill="#F08AA3"/><circle cx="23" cy="26.5" r="1.3" fill="#F08AA3"/><rect x="13" y="38" width="22" height="8" rx="2.5" fill="#F7B6C6" stroke="#262626" stroke-width="2.3"/><path d="M17 39.5 V44.5 M21 39.5 V44.5 M25 39.5 V44.5 M29 39.5 V44.5 M33 39.5 V44.5" stroke="#262626" stroke-width="1.2" opacity=".55"/></svg>`,
    hoe: `<svg viewBox="0 0 48 48" class="ico" aria-hidden="true"><path d="M6 43 L21 28" stroke="#262626" stroke-width="8.6" stroke-linecap="round"/><path d="M6 43 L21 28" stroke="#C9955A" stroke-width="4.8" stroke-linecap="round"/><path d="M9.5 38.5 L12 41 M13.5 34.5 L16 37" stroke="#8E5F2E" stroke-width="1.4" stroke-linecap="round"/><rect x="18.5" y="23.5" width="6" height="6" rx="1.5" transform="rotate(45 21.5 26.5)" fill="#8E98A4" stroke="#262626" stroke-width="2"/><path d="M23 24 C23 17 26 11 31 10" fill="none" stroke="#262626" stroke-width="2.8" stroke-linecap="round"/><path d="M29 10 C33 7 39 7 42 10 C44 18 42 28 35 36 C33 28 31 18 29 10 Z" fill="#C3CCD6" stroke="#262626" stroke-width="2.3" stroke-linejoin="round"/><path d="M34 12 C37 16 37.5 22 36 27" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".9"/></svg>`,
    bag: `<svg viewBox="0 0 48 48" class="ico" aria-hidden="true"><path d="M27 15 C28 9 31 6 35 5 C34 9 31 13 27 15 Z" fill="#9CCB6A" stroke="#262626" stroke-width="2" stroke-linejoin="round"/><path d="M16 9 L19 15 L22 10 L25 15 L29 9 L31 16 L17 16 Z" fill="#E8CC96" stroke="#262626" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 18 C10 25 9.5 38 15 44 H33 C38.5 38 38 25 32 18 Z" fill="#E8CC96" stroke="#262626" stroke-width="2.3" stroke-linejoin="round"/><path d="M15 17.5 Q24 14 33 17.5" fill="none" stroke="#9C6B33" stroke-width="3.4" stroke-linecap="round"/><path d="M15 17.5 Q24 14 33 17.5" fill="none" stroke="#262626" stroke-width="1" stroke-linecap="round" opacity=".5"/><path d="M18 30 L22 30 M17 35 L21 35 M27 37 L31 37" stroke="#9C6B33" stroke-width="1.6" stroke-linecap="round"/><rect x="25" y="25" width="7" height="6" rx="1.2" fill="#F4DDB0" stroke="#9C6B33" stroke-width="1.4"/></svg>`,
    flare: `<svg viewBox="0 0 48 48" class="ico" aria-hidden="true"><path d="M24 4 L25.6 9.5 L31 8 L27.4 12 L32 15 L26.2 15 L24 20 L21.8 15 L16 15 L20.6 12 L17 8 L22.4 9.5 Z" fill="#FFE07A" stroke="#262626" stroke-width="1.8" stroke-linejoin="round"/><rect x="19" y="21" width="10" height="21" rx="2.5" fill="#E8584F" stroke="#262626" stroke-width="2.3"/><path d="M19 27 H29 M19 36 H29" stroke="#fff" stroke-width="2"/><rect x="21" y="18.5" width="6" height="3.5" rx="1" fill="#8E98A4" stroke="#262626" stroke-width="1.6"/></svg>`,
    drone: `<svg viewBox="0 0 48 48" class="ico" aria-hidden="true"><path d="M6 14 H18 M30 14 H42" stroke="#262626" stroke-width="2.4" stroke-linecap="round"/><path d="M12 14 V20 M36 14 V20" stroke="#262626" stroke-width="2.2"/><path d="M10 20 H38 C38 30 32 34 24 34 C16 34 10 30 10 20 Z" fill="#DDE7F2" stroke="#262626" stroke-width="2.3" stroke-linejoin="round"/><circle cx="24" cy="26" r="3.6" fill="#262626"/><circle cx="25.2" cy="24.8" r="1.2" fill="#fff"/><path d="M18 34 L15 40 M30 34 L33 40" stroke="#262626" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  };

  const TOOLS = [
    { id: 'hand', name: '손', icon: ICO.hand, desc: '밑동을 잡고 뽑기' },
    { id: 'hoe', name: '호미', icon: ICO.hoe, desc: '흙을 파서 뿌리째 들어내기' },
    { id: 'bag', name: '수거 자루', icon: ICO.bag, desc: '뽑아 둔 풀을 담아 수거' },
  ];

  function weedBrief(app, mount) {
    const g = app.grade;
    const cfg = WEED_CFG[g];
    const sec = Math.round(CN.certs.weed.practical.minutes[g] * 60);
    const types = Object.keys(cfg.mix);
    mount.innerHTML = `
      <section class="page paper">
        <h2 class="h-hand">실기시험 작업 지시서 — ${u.esc(CN.fullName('weed', g))}</h2>
        ${CN.exam.supervisor('지금부터 실기시험을 시작합니다. 지시서를 잘 읽고, 준비되면 작업장에 들어가세요.', 'grass')}
        <table class="kv">
          <tr><th>작업 구역</th><td>${cfg.size} × ${cfg.size} 칸 풀밭 (${u.esc(CN.certs.weed.gradeInfo[g].area)})</td></tr>
          <tr><th>작업 시간</th><td>${sec}초</td></tr>
          <tr><th>지급 공구</th><td>${TOOLS.map((t) => `${t.icon} ${t.name} — ${t.desc}`).join('<br>')}</td></tr>
          <tr><th>합격 기준</th><td>100점 만점에 ${CN.certs.weed.practical.pass[g]}점 이상</td></tr>
        </table>
        <h3 class="h-sub">작업 요구사항</h3>
        <ol class="rules-list">
          <li>구역 안의 <b>잡초를 모두 올바른 방법으로 제거</b>하십시오. 올바르지 않은 방법으로 제거하면 다시 자랍니다.</li>
          <li><b>보호 식물</b>(화초·작물${g === 1 ? '·보호종' : ''})을 손상하면 크게 감점합니다.</li>
          <li>뽑은 뒤 수거가 필요한 풀은 <b>수거 자루</b>로 담아야 제거로 인정합니다. 방치하면 다시 뿌리를 내립니다.</li>
          ${g <= 3 ? '<li>위험초는 시간이 지나면 주변으로 번집니다(운영규정 제9조).</li>' : ''}
          ${cfg.alarm ? '<li><b>위험 생물 경보가 울리면 즉시 작업을 멈추고 신호탄을 쏘십시오.</b> 제한 시간 안에 대응하지 않으면 실격(0점)입니다. 경보 중 작업하면 감점합니다(운영규정 제10조).</li>' : ''}
          <li>작업 도중 작업장을 벗어나면(다른 창으로 이동, 새로고침) 실격입니다.</li>
        </ol>
        ${cfg.labels ? `<h3 class="h-sub">이번 구역에서 볼 수 있는 식물</h3><div class="plant-guide">${types.map((t) => `<div class="pg-item">${plantSVG(t)}<span>${u.esc(P[t].name)}</span></div>`).join('')}</div>`
          : '<p class="note">※ 1급은 식물 식별도 평가 대상입니다. 식물 이름표가 제공되지 않습니다.</p>'}
        <div class="btns"><button class="btn btn-main" id="go">작업장 입장</button></div>
      </section>`;
    u.qs('#go', mount).onclick = () => weedPlay(app, mount);
  }

  function weedPlay(app, mount) {
    const g = app.grade;
    const cfg = WEED_CFG[g];
    const total = Math.round(CN.certs.weed.practical.minutes[g] * 60);
    const N = cfg.size;
    app.session = { phase: 'play' };
    app.status = '응시중';
    CN.store.saveApp(app);
    guard(app);

    const list = [];
    Object.entries(cfg.mix).forEach(([t, n]) => { for (let i = 0; i < n; i++) list.push(t); });
    while (list.length < N * N) list.push(null);
    const cells = u.shuffle(list).map((t) => ({ type: t, state: t ? 'grow' : 'empty', hits: 0, timer: 0 }));
    /* 가끔 섞여 있는 정체불명의 덤불 (점수와 무관) */
    if (CN.isNight() || Math.random() < 0.15) {
      const empties = cells.map((c, i) => (c.state === 'empty' ? i : -1)).filter((i) => i >= 0);
      if (empties.length) cells[empties[Math.floor(Math.random() * empties.length)]] = { type: null, state: 'odd', hits: 0, timer: 0 };
    }
    let duskSaid = false;

    const stat = { weeds: cells.filter((c) => c.type && P[c.type].weed).length, spawned: 0, removed: 0, protectedHit: 0, wrong: 0, alarmWork: 0, log: [] };
    let tool = 'hand', left = total, alarm = null, paused = 0, ended = false;
    const alarmAt = cfg.alarm ? Math.round(total * (0.3 + Math.random() * 0.35)) : -1;

    mount.innerHTML = `
      <section class="field-wrap">
        <div class="field-top">
          <div class="tools">${TOOLS.map((t) => `<button class="tool ${t.id === tool ? 'on' : ''}" data-t="${t.id}"><span class="ti">${t.icon}</span>${t.name}</button>`).join('')}</div>
          <div class="field-stat"><span>남은 시간 <b id="ft">${total}</b>초</span><span>제거 <b id="fr">0</b></span></div>
        </div>
        <div id="alarm"></div>
        <div class="field" id="field" style="--n:${N}"></div>
        <div class="field-log" id="flog">작업을 시작하세요. 공구를 고른 뒤 칸을 누릅니다.</div>
        <div class="btns"><button class="btn" id="end">작업 완료 신고</button></div>
      </section>`;
    const field = u.qs('#field', mount), flog = u.qs('#flog', mount), ft = u.qs('#ft', mount), fr = u.qs('#fr', mount), alarmBox = u.qs('#alarm', mount);

    function say(msg, bad) { flog.innerHTML = msg; flog.className = 'field-log' + (bad ? ' bad' : ''); }

    function draw() {
      field.innerHTML = cells.map((c, i) => {
        let inner = '';
        if (c.state === 'grow' || c.state === 'pulled' || c.state === 'dug1' || c.state === 'damaged') inner = plantSVG(c.type, c.state === 'grow' ? '' : c.state);
        else if (c.state === 'stump') inner = stumpSVG;
        else if (c.state === 'done') inner = doneSVG;
        else if (c.state === 'odd') inner = oddSVG;
        const label = c.state === 'odd' ? (cfg.labels ? '<span class="pl">???</span>' : '') : cfg.labels && c.type && c.state !== 'done' && c.state !== 'empty' ? `<span class="pl">${u.esc(P[c.type].name.replace(/ \(보호\)/, ''))}</span>` : '';
        return `<button class="cell s-${c.state}" data-i="${i}">${inner}${label}</button>`;
      }).join('');
      fr.textContent = stat.removed;
    }

    function act(i) {
      if (ended) return;
      if (paused > 0) return;
      const c = cells[i];
      if (alarm) { stat.alarmWork++; say('⚠️ 경보 중에는 작업을 멈춰야 합니다! (감점)', true); return; }
      if (c.state === 'odd') { c.state = 'empty'; say('…방금 그건 뭐였지?'); return draw(); }
      if (c.state === 'empty' || c.state === 'done') return;
      const def = P[c.type];
      if (!def.weed) {
        if (c.state === 'damaged') return;
        if (tool === 'bag') { say('보호 식물은 수거 대상이 아닙니다.', true); return; }
        c.state = 'damaged'; stat.protectedHit++;
        say(`❌ ${def.name}을(를) 손상했습니다! (크게 감점)`, true);
        return draw();
      }
      if (tool === 'bag') {
        if (c.state === 'pulled') { c.state = 'done'; stat.removed++; say(`${ICO.bag} ${def.name}을(를) 수거했습니다.`); }
        else if (c.state === 'stump') say('끊긴 뿌리는 자루로 담을 수 없습니다. 호미로 파내세요.', true);
        else say('아직 뽑지 않은 풀입니다.', true);
        return draw();
      }
      if (c.state === 'pulled') { say('이미 뽑았습니다. 수거 자루로 담으세요.'); return; }
      if (c.state === 'stump') {
        if (tool === 'hoe') { c.state = 'done'; stat.removed++; say('남은 뿌리를 호미로 파냈습니다.'); }
        else say('끊긴 뿌리는 손으로 잡을 수 없습니다.', true);
        return draw();
      }
      if (!def.tool.includes(tool)) {
        stat.wrong++;
        if (c.type === 'dandelion') { c.state = 'stump'; c.timer = 6; say('손으로 당기다 <b>곧은뿌리가 끊겼습니다.</b> 그대로 두면 다시 자랍니다.', true); }
        else { c.timer = 0; say(`${def.name}의 잎만 뜯겼습니다. <b>땅속줄기</b>가 남아 있습니다.`, true); }
        return draw();
      }
      if (def.hits && c.hits + 1 < def.hits) { c.hits++; c.state = 'dug1'; say(`${def.name}의 땅속줄기를 따라 파는 중… (한 번 더)`); return draw(); }
      if (def.bag) { c.state = 'pulled'; c.timer = 8; say(`${def.name}을(를) 뽑았습니다. <b>수거 자루</b>로 담으세요.`); }
      else { c.state = 'done'; stat.removed++; say(`${def.name} 제거 완료.`); }
      draw();
    }

    function neighbors(i) {
      const r = Math.floor(i / N), c = i % N, out = [];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < N && cc >= 0 && cc < N) out.push(rr * N + cc);
      });
      return out;
    }

    function second() {
      if (ended) return;
      if (paused > 0) { paused--; return; }
      left--;
      ft.textContent = left;
      field.style.setProperty('--dusk', Math.min(1, (1 - left / total) * 1.15).toFixed(2));
      if (!duskSaid && left <= total * 0.2) { duskSaid = true; say('해가 지기 시작했어요. 서둘러 마치고 돌아가요.'); }
      let changed = false;
      cells.forEach((c) => {
        if ((c.state === 'pulled' || c.state === 'stump') && --c.timer <= 0) {
          c.state = 'grow'; c.hits = 0; changed = true;
          say(`🌱 방치한 ${P[c.type].name}이(가) 다시 뿌리를 내렸습니다.`, true);
        }
      });
      if (left % 7 === 0) {
        cells.forEach((c, i) => {
          if (c.type === 'wetweed' && c.state === 'grow') {
            const empty = neighbors(i).filter((j) => cells[j].state === 'empty' || cells[j].state === 'done');
            if (empty.length) {
              const j = empty[Math.floor(Math.random() * empty.length)];
              cells[j] = { type: 'wetweed', state: 'grow', hits: 0, timer: 0 };
              stat.spawned++; changed = true;
            }
          }
        });
      }
      if (cfg.alarm && left === total - alarmAt) startAlarm();
      if (alarm) {
        alarm.left--;
        u.qs('#al', alarmBox).textContent = alarm.left;
        if (alarm.left <= 0) { stat.log.push('위험 생물 경보에 대응하지 않음 (운영규정 제10조)'); return end(true); }
      }
      if (changed) draw();
      if (left <= 0) end();
    }

    function startAlarm() {
      alarm = { left: 5 };
      alarmBox.innerHTML = `<div class="alarm"><span class="al-shake">⚠️ 삐익— 숲 가장자리에 <b>키메라 출현!</b> 작업 중지!</span> <button class="btn btn-alert" id="flare">${ICO.flare} 신호탄 발사</button> <span class="al-t"><b id="al">5</b>초</span></div>`;
      u.qs('#flare', alarmBox).onclick = () => {
        alarm = null;
        paused = 2;
        alarmBox.innerHTML = `<div class="alarm ok">${ICO.drone} 드론 도착. 위험 생물 대응 확인. 잠시 후 작업을 재개합니다.</div>`;
        stat.log.push('위험 생물 경보에 신호탄으로 대응');
        timers.push(setTimeout(() => { alarmBox.innerHTML = ''; }, 2500));
      };
    }

    function end(disq) {
      if (ended) return;
      ended = true;
      const weeds = stat.weeds + stat.spawned;
      const base = Math.round((stat.removed / weeds) * 100);
      const pen = stat.protectedHit * 8 + stat.wrong * 2 + stat.alarmWork * 5;
      const score = disq ? 0 : Math.max(0, base - pen);
      const detail = [
        `잡초 ${weeds}개체 중 ${stat.removed}개체 제거 (제거율 ${base}점)` + (stat.spawned ? ` — 위험초 확산 ${stat.spawned}개체 포함` : ''),
        `보호 식물 손상 ${stat.protectedHit}건 (−${stat.protectedHit * 8})`,
        `부적절한 공구 사용 ${stat.wrong}건 (−${stat.wrong * 2})`,
      ];
      if (cfg.alarm) detail.push(`경보 중 작업 ${stat.alarmWork}건 (−${stat.alarmWork * 5})`);
      finish(app, score, detail.concat(stat.log), disq);
    }

    u.qsa('.tool', mount).forEach((b) => {
      b.onclick = () => { tool = b.dataset.t; u.qsa('.tool', mount).forEach((x) => x.classList.toggle('on', x === b)); };
    });
    field.onclick = (e) => { const b = e.target.closest('.cell'); if (b) act(+b.dataset.i); };
    u.qs('#end', mount).onclick = () => CN.ui.confirm({ title: '작업 완료 신고', body: CN.exam.supervisor('작업을 마치고 채점을 받을까요? 남은 시간은 쓸 수 없습니다.', 'grass'), ok: '완료 신고', cancel: '계속 작업' }, () => end());
    draw();
    timers.push(setInterval(second, 1000));
  }

  /* ════════════ 라멘 로우 콜 응대 ════════════ */
  const M = () => CN.ramenManual;
  const OPT = { normal: ['적게', '기본', '많이', '아주 많이'], ninniku: ['없음', '적게', '많이', '아주 많이'] };

  function makeCall() {
    const keys = ['yasai', 'ninniku', 'abura', 'karame'];
    const names = { yasai: '야사이', ninniku: '닌니쿠', abura: '아부라', karame: '카라메' };
    const r = Math.random();
    const want = {};
    if (r < 0.08) { keys.forEach((k) => { want[k] = k === 'ninniku' ? 0 : 1; }); return { text: '소노마마', want }; }
    if (r < 0.16) { keys.forEach((k) => { want[k] = 2; }); return { text: '젠부', want }; }
    if (r < 0.22) { keys.forEach((k) => { want[k] = 3; }); return { text: '젠부 마시마시', want }; }
    const parts = [];
    keys.forEach((k) => {
      const lv = ['none', 'less', 'more', 'most'][Math.floor(Math.random() * 4)];
      const def = k === 'ninniku' ? 0 : 1;
      if (lv === 'none') want[k] = def;
      else if (lv === 'less') { want[k] = k === 'ninniku' ? 1 : 0; parts.push(names[k] + ' 스쿠나메'); }
      else if (lv === 'more') { want[k] = 2; parts.push(Math.random() < 0.5 ? names[k] : names[k] + ' 마시'); }
      else { want[k] = 3; parts.push(names[k] + ' 마시마시'); }
    });
    return { text: parts.length ? parts.join(' ') : '소노마마', want };
  }

  function ramenBrief(app, mount) {
    const m = M();
    const sec = Math.round(CN.certs.alba.practical.minutes[0] * 60);
    mount.innerHTML = `
      <section class="page paper">
        <h2 class="h-hand">실기시험 작업 지시서 — 슈퍼 알바이터</h2>
        ${CN.exam.supervisor('라멘 로우 주방입니다. 손님 8명을 응대합니다. 매뉴얼은 시험 전까지만 볼 수 있어요.', 'ramen')}
        <table class="kv">
          <tr><th>작업 내용</th><td>손님 8명의 식권 확인 → 면 삶기 → "닌니쿠 이레마스카?" 질문 → 콜 듣기 → 토핑 담아 제공</td></tr>
          <tr><th>작업 시간</th><td>${sec}초 (남은 손님은 0점)</td></tr>
          <tr><th>채점</th><td>손님 1명당 12.5점 — 면 양 2.5점 + 토핑 4종 각 2.5점</td></tr>
          <tr><th>합격 기준</th><td>100점 만점에 ${CN.certs.alba.practical.pass[0]}점 이상</td></tr>
        </table>
        <h3 class="h-sub">라멘 로우 콜 매뉴얼 (요약)</h3>
        <p>${u.esc(m.intro)}</p>
        <table class="grid-table"><tr><th>콜</th><th>의미</th></tr>${m.levels.concat(m.special).map((l) => `<tr><td>${u.esc(l.word)}</td><td>${u.esc(l.meaning)}</td></tr>`).join('')}</table>
        <p class="note">토핑: ${m.toppings.map((t) => `${t.name}(${t.ko})`).join(', ')}</p>
        <ol class="rules-list">
          <li><b>콜은 한 번만 들립니다.</b> 손님 말풍선은 잠시 뒤 사라집니다.</li>
          <li>"닌니쿠 이레마스카?"라고 묻기 전에 손님이 외치는 콜은 받지 않습니다(매뉴얼 3번).</li>
          <li>작업 도중 주방을 벗어나면(다른 창으로 이동, 새로고침) 실격입니다.</li>
        </ol>
        <div class="btns"><button class="btn btn-main" id="go">주방 입장</button></div>
      </section>`;
    u.qs('#go', mount).onclick = () => ramenPlay(app, mount);
  }

  function ramenPlay(app, mount) {
    const total = Math.round(CN.certs.alba.practical.minutes[0] * 60);
    const N = 8;
    app.session = { phase: 'play' };
    app.status = '응시중';
    CN.store.saveApp(app);
    guard(app);

    const bodies = CN.avatarParts.body.map((b) => b.id), ears = CN.avatarParts.ears.map((e) => e.id);
    const customers = Array.from({ length: N }, () => {
      const call = makeCall();
      return {
        size: Math.random() < 0.5 ? '소' : '대', call,
        early: Math.random() < 0.3 ? makeCall().text : null,
        avatar: { body: bodies[Math.floor(Math.random() * bodies.length)], ears: ears[Math.floor(Math.random() * ears.length)], face: 'normal' },
      };
    });
    let idx = 0, left = total, ended = false;
    const results = [];
    let st;

    mount.innerHTML = `
      <section class="kitchen">
        <div class="field-top"><div><b>라멘 로우</b> 주방</div><div class="field-stat"><span>손님 <b id="cn">1</b>/${N}</span><span>남은 시간 <b id="rt">${total}</b>초</span></div></div>
        <div class="counter" id="counter"></div>
      </section>`;
    const counter = u.qs('#counter', mount), rt = u.qs('#rt', mount), cn = u.qs('#cn', mount);

    function newOrder() {
      st = { size: null, boiled: false, boiling: false, asked: false, toppings: { yasai: 1, ninniku: 0, abura: 1, karame: 1 } };
      draw();
      const c = customers[idx];
      if (c.early) {
        timers.push(setTimeout(() => {
          if (!ended && customers[idx] === c && !st.asked) bubble(`${c.early}!`, true);
        }, 1200));
      }
    }

    function bubble(text, early) {
      const b = u.qs('#bubble', counter);
      if (!b) return;
      b.innerHTML = `<div class="call ${early ? 'early' : ''}">${u.esc(text)}</div>`;
      timers.push(setTimeout(() => { if (b.isConnected) b.innerHTML = ''; }, early ? 1800 : 3500));
    }

    function draw() {
      const c = customers[idx];
      cn.textContent = idx + 1;
      const tp = M().toppings;
      counter.innerHTML = `
        <div class="guest">${CN.avatarSVG(c.avatar)}<div id="bubble" class="bubble-slot"></div></div>
        <div class="ticket">식권<b>${c.size === '소' ? '小 라멘' : '大 라멘'}</b></div>
        <div class="station">
          <div class="step"><span class="sn">1</span> 면 양
            <button class="chip ${st.size === '소' ? 'on' : ''}" data-size="소">소</button>
            <button class="chip ${st.size === '대' ? 'on' : ''}" data-size="대">대</button></div>
          <div class="step"><span class="sn">2</span> <button class="btn btn-sm" id="boil" ${st.boiled || st.boiling || !st.size ? 'disabled' : ''}>${st.boiled ? '면 삶기 완료 ✓' : st.boiling ? '삶는 중…' : '면 삶기'}</button><div class="bar"><i id="bar" style="width:${st.boiled ? 100 : 0}%"></i></div></div>
          <div class="step"><span class="sn">3</span> <button class="btn btn-sm" id="ask" ${!st.boiled || st.asked ? 'disabled' : ''}>"닌니쿠 이레마스카?"</button></div>
          <div class="step col"><span class="sn">4</span> 토핑
            ${tp.map((t) => {
              const opts = t.key === 'ninniku' ? OPT.ninniku : OPT.normal;
              return `<div class="trow"><span class="tname">${t.name}</span>${opts.map((o, k) => `<button class="chip ${st.toppings[t.key] === k ? 'on' : ''}" data-tk="${t.key}" data-lv="${k}" ${st.asked ? '' : 'disabled'}>${o}</button>`).join('')}</div>`;
            }).join('')}
          </div>
          <div class="btns"><button class="btn btn-main" id="serve" ${st.asked ? '' : 'disabled'}>제공하기</button></div>
        </div>`;
      u.qsa('[data-size]', counter).forEach((b) => { b.onclick = () => { st.size = b.dataset.size; draw(); }; });
      u.qsa('[data-tk]', counter).forEach((b) => { b.onclick = () => { st.toppings[b.dataset.tk] = +b.dataset.lv; draw(); }; });
      const boil = u.qs('#boil', counter);
      boil.onclick = () => {
        st.boiling = true; draw();
        let p = 0;
        const t = setInterval(() => {
          p += 10;
          const bar = u.qs('#bar', counter);
          if (bar) bar.style.width = p + '%';
          if (p >= 100) { clearInterval(t); st.boiling = false; st.boiled = true; if (!ended) draw(); }
        }, 250);
        timers.push(t);
      };
      u.qs('#ask', counter).onclick = () => { st.asked = true; draw(); bubble(c.call.text); };
      u.qs('#serve', counter).onclick = serve;
    }

    function serve() {
      const c = customers[idx];
      let pts = st.size === c.size ? 2.5 : 0;
      const wrong = [];
      if (!pts) wrong.push('면 양');
      Object.keys(c.call.want).forEach((k) => {
        if (st.toppings[k] === c.call.want[k]) pts += 2.5;
        else wrong.push(M().toppings.find((t) => t.key === k).name);
      });
      results.push({ call: c.call.text, size: c.size, pts, wrong });
      idx++;
      if (idx >= N) end(); else newOrder();
    }

    function end() {
      if (ended) return;
      ended = true;
      const score = Math.round(results.reduce((a, r) => a + r.pts, 0) * 10) / 10;
      const detail = results.map((r, i) => `손님 ${i + 1} (${r.size}, "${r.call}") — ${r.pts}점${r.wrong.length ? ' / 틀림: ' + r.wrong.join(', ') : ''}`);
      for (let i = results.length; i < N; i++) detail.push(`손님 ${i + 1} — 응대하지 못함 (0점)`);
      finish(app, score, detail, false);
    }

    timers.push(setInterval(() => {
      if (ended) return;
      left--;
      rt.textContent = left;
      if (left <= 0) end();
    }, 1000));
    newOrder();
  }

  return { render, cleanup, plantSVG };
})();
