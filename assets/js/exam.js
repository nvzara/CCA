/* 필기시험 — 시험지(문제지) + 답안지 방식.
 * 실제 지필 시험처럼 시험지에 한 표시는 채점하지 않고, 답안지에 마킹한 답만 채점한다. */
window.CN = window.CN || {};

CN.exam = (function () {
  const u = CN.u;
  const PER_PAGE = 4;
  let timer = null, onVis = null, onUnload = null;

  function cleanup() {
    clearInterval(timer); timer = null;
    if (onVis) document.removeEventListener('visibilitychange', onVis);
    if (onUnload) window.removeEventListener('beforeunload', onUnload);
    onVis = onUnload = null;
  }

  function buildSession(app) {
    const c = CN.certs[app.certId];
    const w = c.written;
    const levels = w.levels[app.grade];
    const n = w.perSubject[app.grade];
    const bank = CN.bank[app.certId];
    const items = [];
    w.subjects.forEach((_, si) => {
      const pool = bank.map((q, i) => ({ q, i })).filter((x) => x.q.s === si && levels.includes(x.q.lv));
      u.shuffle(pool).slice(0, n).forEach((x) => items.push({ id: x.i, order: u.shuffle([0, 1, 2, 3]) }));
    });
    return { phase: 'brief', items, answers: {}, memo: {}, leaves: 0, startedAt: null, booklet: 'ABCD'[Math.floor(Math.random() * 4)] };
  }

  function limitSec(app) { return CN.certs[app.certId].written.minutes[app.grade] * 60; }
  function remainSec(app) {
    const s = app.session;
    return Math.max(0, Math.round(limitSec(app) - (Date.now() - new Date(s.startedAt).getTime()) / 1000));
  }

  function grade(app, voided) {
    const c = CN.certs[app.certId];
    const w = c.written;
    const bank = CN.bank[app.certId];
    const s = app.session;
    const per = w.subjects.map(() => ({ n: 0, ok: 0 }));
    s.items.forEach((it, idx) => {
      const q = bank[it.id];
      per[q.s].n++;
      const picked = s.answers[idx];
      if (picked != null && it.order[picked] === q.a) per[q.s].ok++;
    });
    const scores = per.map((p) => Math.round((p.ok / p.n) * 100));
    const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    const pass = !voided && scores.every((x) => x >= w.cutoff) && avg >= w.passAvg;
    app.result = { scores, avg, pass, voided: !!voided, correct: per.map((p) => p.ok), counts: per.map((p) => p.n) };
    app.status = voided ? '무효' : '채점완료';
    app.finishedAt = new Date().toISOString();
    app.session.phase = 'done';
    CN.store.saveApp(app);
  }

  function supervisor(msg, kind) {
    return `<div class="supervisor"><div class="sv-face">${armorSVG(kind)}</div><div class="sv-bubble">${msg}</div></div>`;
  }
  /* 갑옷씨 상반신: 둥근 투구, 검은 눈구멍, 이빨 같은 격자 입가리개, 둥근 어깨 갑옷 */
  const ARMOR = {
    gray: { body: '#C4C4C6', shade: '#A9A9AD' },
    grass: { body: '#EFA65A', shade: '#D98A3E', band: 'bandana' },
    ramen: { body: '#D6C95C', shade: '#BCAE45', band: 'towel' },
  };
  function armorSVG(kind) {
    const k = ARMOR[kind] || ARMOR.gray;
    const ink = '#262626';
    const st = `stroke="${ink}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
    let band = '';
    if (k.band === 'towel') band = `<path d="M15.5 21 C15 9 22 5 30 5 C38 5 45 9 44.5 21 C38 17 22 17 15.5 21 Z" fill="#fff" ${st}/><path d="M17 20 C24 16.5 36 16.5 43 20" fill="none" stroke="${ink}" stroke-width="1.2" opacity=".5"/>`;
    if (k.band === 'bandana') band = `<path d="M15.5 19 C16 12 22 8.5 30 8.5 C38 8.5 44 12 44.5 19 C38 16 22 16 15.5 19 Z" fill="#7FB6E0" ${st}/><circle cx="24" cy="13" r="1.3" fill="#FFE07A"/><circle cx="32" cy="12" r="1.3" fill="#F7A1B4"/><circle cx="38" cy="15" r="1.3" fill="#fff"/><path d="M44 17 L50 15 L48 20 Z" fill="#7FB6E0" ${st}/>`;
    return `<svg viewBox="0 0 60 60" class="armor" aria-hidden="true">
      <path d="M4 60 C4 50 9 44 17 43 C20 47 40 47 43 43 C51 44 56 50 56 60 Z" fill="${k.body}" ${st}/>
      <path d="M5 54 C7 48 12 45 18 45 M55 54 C53 48 48 45 42 45" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M22 41 H38 L37 47 H23 Z" fill="${k.shade}" ${st}/>
      <path d="M16 40 C14 30 14.5 8 30 8 C45.5 8 46 30 44 40 C40 43 20 43 16 40 Z" fill="${k.body}" ${st}/>
      <path d="M30 8.5 V17" stroke="${ink}" stroke-width="1.4" opacity=".55"/>
      <path d="M17 23 C24 20.5 36 20.5 43 23 L42.6 28.5 C36 26.6 24 26.6 17.4 28.5 Z" fill="${ink}"/>
      <rect x="22.5" y="30" width="15" height="8" rx="2" fill="#fff" ${st}/>
      <path d="M26.2 30.5 V37.5 M30 30.5 V37.5 M33.8 30.5 V37.5 M23 34 H37" stroke="${ink}" stroke-width="1.3"/>
      <circle cx="18.5" cy="33" r="1" fill="${ink}"/><circle cx="41.5" cy="33" r="1" fill="${ink}"/>
      ${band}
    </svg>`;
  }

  function clockSVG(remain, total) {
    const frac = remain / total;
    const ang = (1 - frac) * 360;
    const rad = (ang - 90) * Math.PI / 180;
    const x = 30 + 19 * Math.cos(rad), y = 30 + 19 * Math.sin(rad);
    const large = ang > 180 ? 1 : 0;
    const used = ang <= 0 ? '' : ang >= 359.9 ? '<circle cx="30" cy="30" r="22" fill="#F9C6D3"/>' :
      `<path d="M30 30 L30 8 A22 22 0 ${large} 1 ${30 + 22 * Math.cos(rad)} ${30 + 22 * Math.sin(rad)} Z" fill="#F9C6D3"/>`;
    return `<svg viewBox="0 0 60 60" class="clock"><circle cx="30" cy="30" r="26" fill="#FFFDF6" stroke="#4B3A30" stroke-width="2.6"/>${used}
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const a = i * 30 * Math.PI / 180; return `<circle cx="${30 + 22 * Math.sin(a)}" cy="${30 - 22 * Math.cos(a)}" r="1.4" fill="#4B3A30"/>`; }).join('')}
      <path d="M30 30 L${x} ${y}" stroke="#4B3A30" stroke-width="2.6" stroke-linecap="round"/><circle cx="30" cy="30" r="2.6" fill="#4B3A30"/></svg>`;
  }
  function mmss(s) { return u.pad(Math.floor(s / 60), 2) + ':' + u.pad(s % 60, 2); }

  /* ── 화면 ── */
  function render(app, mount) {
    cleanup();
    if (!app.session) { app.session = buildSession(app); CN.store.saveApp(app); }
    const s = app.session;
    if (s.phase === 'brief') return brief(app, mount);
    if (s.phase === 'wait') return wait(app, mount);
    if (s.phase === 'exam') {
      if (remainSec(app) <= 0) { grade(app); return CN.router.go('#/result/' + app.no); }
      return paper(app, mount);
    }
    CN.router.go('#/result/' + app.no);
  }

  function brief(app, mount) {
    const user = CN.store.me();
    const c = CN.certs[app.certId];
    const w = c.written;
    const total = app.session.items.length;
    const venue = CN.venues.find((v) => v.id === app.venue);
    mount.innerHTML = `
      <section class="page paper">
        <h2 class="h-hand">시험장 입실 — 본인 확인</h2>
        ${supervisor('수험표와 얼굴을 확인하겠습니다. 확인이 끝나면 유의사항을 읽어 주세요.' + (CN.isNight() ? '<br><small>…늦은 시간이네요. 시험이 끝나면 곧장 집으로 돌아가세요. 창문 밖은 보지 말고요.</small>' : ''))}
        <div class="idcheck">
          <div class="photo">${CN.avatarSVG(user.avatar)}</div>
          <table class="kv">
            <tr><th>수험번호</th><td class="mono">${u.esc(app.no)}</td></tr>
            <tr><th>성명</th><td>${u.esc(user.name)}</td></tr>
            <tr><th>종목</th><td>${u.esc(CN.fullName(app.certId, app.grade))} 필기시험</td></tr>
            <tr><th>시험장</th><td>${u.esc(venue ? venue.name : '')}</td></tr>
            <tr><th>문항 / 시간</th><td>${w.subjects.length}과목 ${total}문항 / ${w.minutes[app.grade]}분</td></tr>
          </table>
        </div>
        <h3 class="h-sub">수험자 유의사항</h3>
        <ol class="rules-list">
          <li>시험지(문제지)와 답안지를 함께 받습니다. <b>채점은 답안지에 마킹한 답으로만 합니다.</b> 시험지에 표시한 것은 채점하지 않습니다.</li>
          <li>답안지에는 문항마다 하나의 답만 마킹합니다. 고칠 때는 마킹한 칸을 다시 눌러 지우개로 지운 뒤 새로 마킹합니다.</li>
          <li>시작 종이 울리기 전에는 시험지를 넘기지 않습니다.</li>
          <li>시험 시간이 끝나면 감독관이 답안지를 걷습니다. 마킹하지 않은 문항은 0점입니다.</li>
          <li>시험 중 감독관의 허락 없이 시험장을 벗어나면(다른 창으로 이동) 경고하며, <b>3회 이탈 시 부정행위로 시험을 무효</b>로 합니다.</li>
          <li>합격 기준: 매 과목 ${w.cutoff}점 이상, 전 과목 평균 ${w.passAvg}점 이상.</li>
        </ol>
        <label class="check"><input type="checkbox" id="agree"> 위 유의사항을 모두 읽고 이해했습니다.</label>
        <div class="btns"><button class="btn btn-main" id="go" disabled>시험지 받기</button></div>
      </section>`;
    const agree = u.qs('#agree', mount), go = u.qs('#go', mount);
    agree.onchange = () => { go.disabled = !agree.checked; };
    go.onclick = () => { app.session.phase = 'wait'; app.status = '응시중'; CN.store.saveApp(app); render(app, mount); };
  }

  function wait(app, mount) {
    const user = CN.store.me();
    const c = CN.certs[app.certId];
    mount.innerHTML = `
      <section class="page exam-wait">
        ${supervisor('시험지를 나눠 드렸습니다. 표지에 성명과 수험번호를 확인하세요. <b>시작 종이 울리면</b> 넘기세요.')}
        <div class="booklet-cover">
          <div class="cover-band">${new Date().getFullYear()}년도 상시 검정</div>
          <div class="cover-title">${u.esc(CN.fullName(app.certId, app.grade))}</div>
          <div class="cover-sub">필기시험 문제지</div>
          <div class="cover-type">${app.session.booklet}형</div>
          <table class="kv small"><tr><th>수험번호</th><td class="mono">${u.esc(app.no)}</td></tr><tr><th>성명</th><td>${u.esc(user.name)}</td></tr></table>
          <p class="cover-note">${c.written.subjects.map((s, i) => `제${i + 1}과목 ${u.esc(s)}`).join(' · ')}</p>
          <div class="cover-deco">${CN.certIcon[app.certId]}${CN.deco.pencil}</div>
        </div>
        <div class="bell" id="bell">시작 종을 기다리는 중… <b id="cd">3</b></div>
        <div class="btns"><button class="btn btn-main" id="open" disabled>시험지 펼치기</button></div>
      </section>`;
    let n = 3;
    const cd = u.qs('#cd', mount), bell = u.qs('#bell', mount), open = u.qs('#open', mount);
    timer = setInterval(() => {
      n--;
      if (n > 0) { cd.textContent = n; return; }
      clearInterval(timer);
      bell.innerHTML = '🔔 따르릉— <b>시작!</b>';
      bell.classList.add('ring');
      open.disabled = false;
    }, 1000);
    open.onclick = () => {
      app.session.phase = 'exam';
      app.session.startedAt = new Date().toISOString();
      CN.store.saveApp(app);
      render(app, mount);
    };
  }

  function paper(app, mount) {
    const user = CN.store.me();
    const c = CN.certs[app.certId];
    const w = c.written;
    const s = app.session;
    const bank = CN.bank[app.certId];
    const total = s.items.length;
    const pages = Math.ceil(total / PER_PAGE);
    let page = s.page || 0;
    const limit = limitSec(app);
    const announced = s.announced || (s.announced = {});

    mount.innerHTML = `
      <section class="exam">
        <div class="exam-top">
          <div class="exam-who"><span class="mono">${u.esc(app.no)}</span> · ${u.esc(user.name)} · ${u.esc(CN.fullName(app.certId, app.grade))} (${s.booklet}형)</div>
          <div class="exam-clock" id="clock"></div>
        </div>
        <div id="svmsg"></div>
        <div class="exam-body">
          <div class="booklet" id="booklet"></div>
          <aside class="omr" id="omr"></aside>
        </div>
      </section>`;

    const booklet = u.qs('#booklet', mount), omr = u.qs('#omr', mount), clock = u.qs('#clock', mount), svmsg = u.qs('#svmsg', mount);

    function subjectStart(idx) {
      const q = bank[s.items[idx].id];
      return idx === 0 || bank[s.items[idx - 1].id].s !== q.s ? q.s : -1;
    }

    function drawBooklet(flip) {
      const from = page * PER_PAGE, to = Math.min(total, from + PER_PAGE);
      let html = `<div class="sheet ${flip ? 'flip-' + flip : ''}"><div class="sheet-head"><span>${u.esc(CN.fullName(app.certId, app.grade))}</span><span>${s.booklet}형</span></div><div class="sheet-cols">`;
      for (let i = from; i < to; i++) {
        const it = s.items[i], q = bank[it.id];
        const ss = subjectStart(i);
        if (ss >= 0) html += `<div class="subj-title">제${ss + 1}과목 : ${u.esc(w.subjects[ss])}</div>`;
        html += `<div class="q"><div class="q-text"><b>${i + 1}.</b> ${u.esc(q.q)}</div><ol class="q-opts">` +
          it.order.map((oi, k) => `<li data-q="${i}" data-k="${k}" class="${s.memo[i] === k ? 'memo' : ''}"><span class="num">${'①②③④'[k]}</span> ${u.esc(q.o[oi])}</li>`).join('') +
          '</ol></div>';
      }
      html += `</div><div class="sheet-foot">- ${page + 1} -</div></div>
        <div class="pager"><button class="btn btn-sm" id="prev" ${page === 0 ? 'disabled' : ''}>◀ 앞장</button>
        <span class="pg">${page + 1} / ${pages} 쪽</span>
        <button class="btn btn-sm" id="next" ${page === pages - 1 ? 'disabled' : ''}>뒷장 ▶</button></div>
        <p class="hint">✏️ 보기를 누르면 시험지에 연필로 동그라미가 쳐집니다(메모용, 채점 안 됨). 답은 오른쪽 <b>답안지</b>에 마킹하세요.</p>`;
      booklet.innerHTML = html;
      u.qsa('.q-opts li', booklet).forEach((li) => {
        li.onclick = () => {
          const qi = +li.dataset.q, k = +li.dataset.k;
          s.memo[qi] = s.memo[qi] === k ? undefined : k;
          CN.store.saveApp(app);
          drawBooklet();
        };
      });
      u.qs('#prev', booklet).onclick = () => { page--; s.page = page; CN.store.saveApp(app); drawBooklet('r'); drawOMR(); };
      u.qs('#next', booklet).onclick = () => { page++; s.page = page; CN.store.saveApp(app); drawBooklet('l'); drawOMR(); };
    }

    function drawOMR() {
      const prevRows = omr.querySelector('.omr-rows');
      const keepScroll = prevRows ? prevRows.scrollTop : 0;
      const unmarked = s.items.filter((_, i) => s.answers[i] == null).length;
      let rows = '';
      for (let i = 0; i < total; i++) {
        const ss = subjectStart(i);
        if (ss >= 0) rows += `<div class="omr-subj">제${ss + 1}과목</div>`;
        rows += `<div class="omr-row ${Math.floor(i / PER_PAGE) === page ? 'cur' : ''}"><span class="omr-no" data-go="${i}">${i + 1}</span>` +
          [0, 1, 2, 3].map((k) => `<button class="bub ${s.answers[i] === k ? 'on' : ''}" data-q="${i}" data-k="${k}" aria-label="${i + 1}번 ${k + 1}">${k + 1}</button>`).join('') + '</div>';
      }
      omr.innerHTML = `<div class="omr-head">답 안 지</div>
        <div class="omr-info"><span>${u.esc(user.name)}</span><span class="mono">${u.esc(app.no)}</span><span>${s.booklet}형</span></div>
        <div class="omr-rows">${rows}</div>
        <div class="omr-foot">미표기 <b>${unmarked}</b>문항</div>
        <button class="btn btn-main btn-block" id="submit">답안지 제출</button>`;
      u.qs('.omr-rows', omr).scrollTop = keepScroll;
      u.qsa('.bub', omr).forEach((b) => {
        b.onclick = () => {
          const qi = +b.dataset.q, k = +b.dataset.k;
          if (s.answers[qi] === k) delete s.answers[qi]; else s.answers[qi] = k;
          CN.store.saveApp(app);
          drawOMR();
        };
      });
      u.qsa('.omr-no', omr).forEach((n) => {
        n.onclick = () => { page = Math.floor(+n.dataset.go / PER_PAGE); s.page = page; drawBooklet(); drawOMR(); };
      });
      u.qs('#submit', omr).onclick = () => submit(unmarked);
    }

    function submit(unmarked) {
      CN.ui.confirm({
        title: '답안지 제출',
        body: supervisor(unmarked ? `아직 마킹하지 않은 문항이 <b>${unmarked}개</b> 있어요. 그래도 제출할까요?` : '모든 문항에 마킹했어요. 제출할까요?'),
        ok: '제출합니다', cancel: '다시 볼게요',
      }, () => {
        CN.ui.confirm({
          title: '마지막 확인',
          body: supervisor('제출한 답안지는 <b>다시 고칠 수 없습니다.</b> 정말 제출하시겠습니까?'),
          ok: '네, 제출합니다', cancel: '취소',
        }, () => { cleanup(); grade(app); CN.router.go('#/result/' + app.no); });
      });
    }

    function tick() {
      const r = remainSec(app);
      clock.innerHTML = clockSVG(r, limit) + `<div><div class="clock-label">남은 시간</div><div class="clock-time ${r <= 300 ? 'warn' : ''}">${mmss(r)}</div></div>`;
      const say = (key, msg) => { if (!announced[key]) { announced[key] = 1; CN.store.saveApp(app); svmsg.innerHTML = supervisor(msg); } };
      if (r <= 600 && r > 300 && limit > 900) say('10', '시험 종료 <b>10분 전</b>입니다. 답안지 마킹을 확인하세요.');
      if (r <= 300 && r > 0) say('5', '시험 종료 <b>5분 전</b>입니다. 시험지에만 표시하고 답안지에 옮기지 않은 문항이 없는지 확인하세요.');
      if (r <= 0) {
        cleanup();
        grade(app);
        CN.ui.alert('시험 종료', supervisor('따르릉— 시험이 끝났습니다. <b>펜을 내려놓으세요.</b> 답안지를 걷겠습니다.'), () => CN.router.go('#/result/' + app.no));
      }
    }

    onVis = () => {
      if (document.visibilityState !== 'hidden') return;
      s.leaves = (s.leaves || 0) + 1;
      CN.store.saveApp(app);
      if (s.leaves >= 3) {
        cleanup();
        grade(app, true);
        CN.ui.alert('부정행위 처리', supervisor('시험장을 <b>3번</b> 벗어났습니다. 운영규정 제5조에 따라 이번 시험은 <b>무효</b>입니다.'), () => CN.router.go('#/result/' + app.no));
      } else {
        CN.ui.alert('경고', supervisor(`시험 중에 시험장을 벗어나면 안 됩니다. (경고 ${s.leaves}/3회)`));
      }
    };
    onUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', onUnload);

    drawBooklet();
    drawOMR();
    tick();
    timer = setInterval(tick, 1000);
  }

  return { render, cleanup, grade, supervisor, armorSVG };
})();
