window.CN = window.CN || {};

/* ── 출제기준 (과목별 주요항목) ── */
CN.outline = {
  weed: [
    ['잡초의 생활형(한해살이·두해살이·여러해살이)', '번식 기관(곧은뿌리, 땅속줄기, 기는줄기, 덩이줄기, 비늘줄기)', '주요 잡초 식별(바랭이, 토끼풀, 민들레, 쇠비름, 쇠뜨기, 명아주 등)', '생태계교란 식물과 유해 잡초', '잡초 생태(종자은행, 휴면, 경합, 타감작용)'],
    ['손 제초의 기본(시기, 잡는 법, 뿌리째 제거)', '공구 사용(호미, 낫, 뿌리뽑기 도구)', '뽑은 풀의 처리와 수거, 퇴비화', '예방적 관리(피복, 태양열 소독, 결실 전 제거)', '작업 계획과 작업량 계산'],
    ['보호구 착용과 작업 자세', '온열질환 예방과 응급조치', '위험 식물·벌·진드기 대응', '위험초 및 위험 생물 출현 시 조치', '검정 운영규정(작업 접수, 구역, 보수, 자격 관리)'],
  ],
  sake: [
    ['알코올 발효와 술의 분류(양조주·증류주)', '도수와 순수 알코올량 계산', '원료와 제법(누룩, 홉, 정미율 등)', '알코올의 열량과 메탄올의 위험'],
    ['알코올 대사(간, 아세트알데하이드)', '휴간일과 적정 음주', '음주와 약물·임신', '급성 알코올 중독 응급조치'],
    ['음주운전 관련 법규', '청소년 보호와 주류 판매 법규', '음주 예절과 강권 금지', '술 자격증 운영규정(휴대 의무, 불시 검사, 부정 취득)'],
  ],
  alba: [
    ['개인위생과 손 씻기', '보관 온도와 위험 온도대', '교차오염과 식중독균', '대량 조리 식품의 냉각, 알레르기 표시, 건강진단'],
    ['라멘의 구성(가에시, 육수, 면)', '조리 원리(유화, 면 삶기)', '라멘 로우 콜 매뉴얼', '로우의 응대 순서와 예절'],
    ['주방 안전(화재, 화상, 칼, 미끄럼)', '고객 응대와 불만 처리', '근로계약, 휴게시간, 최저임금, 주휴', '고객응대 근로자 보호'],
  ],
};

/* ── 공통 UI ── */
CN.ui = (function () {
  const u = CN.u;
  function modal(html, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<div class="modal ${opts.cls || ''}" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    return { el: wrap, close };
  }
  function confirm(o, onOk) {
    const m = modal(`<h3 class="modal-title">${o.title}</h3><div class="modal-body">${o.body}</div>
      <div class="btns"><button class="btn" data-x>${o.cancel || '취소'}</button><button class="btn btn-main" data-ok>${o.ok || '확인'}</button></div>`);
    u.qs('[data-x]', m.el).onclick = m.close;
    u.qs('[data-ok]', m.el).onclick = () => { m.close(); onOk(); };
  }
  function alert(title, body, cb) {
    const m = modal(`<h3 class="modal-title">${title}</h3><div class="modal-body">${body}</div><div class="btns"><button class="btn btn-main" data-ok>확인</button></div>`);
    u.qs('[data-ok]', m.el).onclick = () => { m.close(); if (cb) cb(); };
  }
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }
  return { modal, confirm, alert, toast };
})();

/* ── 팬 사이트 안내 ── */
CN.fanNotice = function (force) {
  const KEY = 'chiikawa-kentei.notice';
  try { if (!force && sessionStorage.getItem(KEY)) return; } catch (e) { /* 저장소를 쓸 수 없으면 매번 안내 */ }
  const m = CN.ui.modal(`
    <div class="notice-head">${CN.deco.flower}<h3 class="modal-title">찾아 주셔서 감사합니다</h3>${CN.deco.sprout}</div>
    <div class="modal-body notice-body">
      <p>이 사이트는 나가노 선생님의 만화 『치이카와 — 먼가 작고 귀여운 녀석(ちいかわ なんか小さくてかわいいやつ)』을 아끼는 팬이 만든 <b>비공식 팬 사이트</b>입니다.</p>
      <ul>
        <li>원작자 나가노 선생님 및 공식 권리자와는 <b>아무런 관계가 없으며</b>, 공식 서비스가 아닙니다.</li>
        <li><b>어떠한 이윤도 추구하지 않습니다.</b> 광고·판매·후원 요청이 없으며 모든 기능은 무료입니다.</li>
        <li>원작의 캐릭터·명칭·세계관에 관한 모든 권리는 원작자와 공식 권리자께 있습니다. 공식 이미지는 사용하지 않았으며, 사이트의 그림은 모두 직접 그린 것입니다.</li>
        <li>원작에서 공개되지 않은 부분(시험 과목, 문제, 합격 기준, 운영규정 등)은 팬의 상상으로 채운 것으로 <b>공식 설정이 아닙니다.</b></li>
        <li>발급되는 자격증은 재미를 위한 것으로 <b>법적 효력이 없습니다.</b></li>
        <li>입력하신 정보는 서버로 전송되지 않고 지금 사용하시는 브라우저에만 저장됩니다.</li>
        <li>권리자께서 우려를 표하시면 즉시 수정하거나 운영을 중단하겠습니다.</li>
      </ul>
      <p class="notice-last">원작과 원작자께 깊은 존경과 감사를 담아 만들었습니다.<br>치이카와와 친구들을 공식 작품과 공식 굿즈로도 함께 응원해 주세요.</p>
    </div>
    <div class="btns"><button class="btn btn-main" data-ok>잘 알겠습니다</button></div>`, { cls: 'notice' });
  CN.u.qs('[data-ok]', m.el).onclick = () => {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* 무시 */ }
    m.close();
  };
};

/* ── 라우터 ── */
CN.router = (function () {
  const routes = [];
  function on(pattern, fn) { routes.push({ re: new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$'), fn }); }
  function go(hash) { if (location.hash === hash) handle(); else location.hash = hash; }
  function handle() {
    CN.exam.cleanup();
    CN.practical.cleanup();
    document.body.classList.remove('in-exam');
    const path = (location.hash || '#/').slice(1) || '/';
    const main = document.getElementById('main');
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        main.innerHTML = '';
        r.fn(main, ...m.slice(1).map(decodeURIComponent));
        markNav(path);
        window.scrollTo(0, 0);
        return;
      }
    }
    main.innerHTML = '<section class="page paper"><h2 class="h-hand">이 쪽은 찢어져 있어요…</h2><p>찾는 쪽이 없습니다.</p><a class="btn" href="#/">처음으로</a></section>';
  }
  function markNav(path) {
    CN.u.qsa('.tabs a').forEach((a) => a.classList.toggle('on', path.startsWith(a.getAttribute('href').slice(1)) && a.getAttribute('href') !== '#/'));
    renderUserbar();
  }
  return { on, go, handle };
})();

function renderUserbar() {
  const u = CN.u, me = CN.store.me();
  const bar = document.getElementById('userbar');
  bar.innerHTML = me
    ? `<a href="#/my" class="ub-me">${CN.avatarSVG(me.avatar, { cls: 'avatar mini' })}<span>${u.esc(me.name)} 수험자</span></a><a href="#/my" class="pill">수험 수첩</a><button class="pill" id="ub-out">수첩 덮기</button>`
    : '<a href="#/register" class="pill pill-main">수험자 등록</a>';
  const out = document.getElementById('ub-out');
  if (out) out.onclick = () => { CN.store.logout(); CN.ui.toast('수험 수첩을 덮었습니다.'); CN.router.go('#/'); };
}

/* ── 화면들 ── */
(function () {
  const u = CN.u, S = CN.store, R = CN.router;

  function needMe(main) {
    if (S.me()) return true;
    main.innerHTML = `<section class="page paper center"><h2 class="h-hand">수험자 등록이 필요해요</h2>${CN.avatarSVG({ face: 'teary' }, { cls: 'avatar big' })}
      <p>원서 접수와 시험 응시, 자격증 발급은 수험자 등록 후 이용할 수 있습니다.</p><a class="btn btn-main" href="#/register">수험자 등록하기</a></section>`;
    return false;
  }
  function title(t, sub) { return `<div class="page-title"><h2 class="h-hand">${t}</h2>${sub ? `<p>${sub}</p>` : ''}</div>`; }
  function statusBadge(a) {
    if (a.result) {
      if (a.result.voided) return '<span class="badge bad">무효·실격</span>';
      return a.result.pass ? '<span class="badge ok">합격</span>' : '<span class="badge no">불합격</span>';
    }
    return `<span class="badge">${u.esc(a.status)}</span>`;
  }
  const kindName = (k) => (k === 'written' ? '필기' : '실기');
  function minFee(c) { return Math.min(...Object.values(c.fee.written)); }

  /* 홈 */
  R.on('/', (main) => {
    const me = S.me();
    main.innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <p class="hero-kicker">ちいかわ検定所 · 수험 안내 책자</p>
          <h1 class="hero-title">치이카와<br>자격검정소</h1>
          <p class="hero-sub">작고 귀여워도, <b>시험은 진짜</b>입니다.</p>
          <div class="btns left">
            <a class="btn btn-main" href="#/apply">원서 접수하기</a>
            <a class="btn" href="#/certs">종목 안내 보기</a>
          </div>
        </div>
        <div class="hero-art">
          <div class="hero-avatars">
            ${CN.avatarSVG({ body: 'white', ears: 'round', face: 'serious' })}
            ${CN.avatarSVG({ body: 'white', ears: 'cat', pattern: 'split', face: 'smile' })}
            ${CN.avatarSVG({ body: 'yellow', ears: 'bunny', face: 'normal' })}
          </div>
          <div class="hero-desk">${CN.deco.pencil}<span>수험서</span>${CN.deco.sprout}</div>
        </div>
      </section>

      <section class="quick">
        ${[
          ['#/apply', CN.deco.pencil, '원서 접수', '종목·등급 선택'],
          [me ? '#/my' : '#/register', CN.deco.star, me ? '수험 수첩' : '수험자 등록', me ? '수험표·응시' : '증명사진 그리기'],
          ['#/announce', CN.deco.flower, '합격 발표', '수험번호로 조회'],
          ['#/issue', CN.deco.cup, '자격증 발급', '카드형·증서형'],
          ['#/verify', CN.deco.bowl, '진위 확인', '자격번호 대조'],
          ['#/practice', CN.deco.sprout, '공개문제', '해설과 함께'],
        ].map(([h, ic, t, s]) => `<a class="qcard" href="${h}">${ic}<b>${t}</b><span>${s}</span></a>`).join('')}
      </section>

      <section class="section">
        <h2 class="sec-title"><span>시험 종목</span></h2>
        <div class="cards">${CN.certOrder.map((id) => certCard(id)).join('')}</div>
      </section>

      <section class="section">
        <h2 class="sec-title"><span>노동 게시판</span></h2>
        <div class="cork">${CN.notices.slice(0, 3).map(noteHTML).join('')}</div>
        <div class="btns"><a class="btn btn-sm" href="#/board">게시판 전체 보기</a></div>
      </section>`;
  });

  function certCard(id) {
    const c = CN.certs[id];
    return `<a class="pcard" href="#/cert/${id}">
      <div class="pcard-img" style="background:${c.color}">${CN.certIcon[id]}</div>
      <div class="pcard-body">
        <div class="pcard-tag">${u.esc(c.jp)}</div>
        <b>${u.esc(c.name)}</b>
        <p>${u.esc(c.summary)}</p>
        <div class="pcard-meta"><span>${c.grades[0] === 0 ? '단일등급' : '5급 ~ 1급'}</span><span>필기${c.practical ? ' + 실기' : ''}</span><span>응시료 ${u.won(minFee(c))}~</span></div>
      </div></a>`;
  }
  function noteHTML(n, i) {
    return `<a class="note-card n${i % 4}" href="#/board/${n.id}"><span class="pin"></span><span class="nc-cat">${u.esc(n.cat)}</span><b>${u.esc(n.title)}</b><span class="nc-date">${u.esc(n.date)}</span></a>`;
  }

  /* 종목 안내 */
  R.on('/certs', (main) => {
    main.innerHTML = title('시험 종목 안내', '치이카와 세계에서 실제로 등장하는 자격만 시행합니다.') + `<div class="cards">${CN.certOrder.map(certCard).join('')}</div>`;
  });

  R.on('/cert/:id', (main, id) => {
    const c = CN.certs[id];
    if (!c) return R.go('#/certs');
    const w = c.written;
    const rows = c.grades.map((g) => {
      const gi = c.gradeInfo[g];
      const n = w.perSubject[g] * w.subjects.length;
      return `<tr><td><b>${CN.gradeLabel(id, g)}</b></td><td>${u.esc(gi.eligibility)}</td><td>${u.esc(gi.area)}${gi.pay ? `<br><small>보수 배율 ${gi.pay.toFixed(1)}</small>` : ''}</td>
        <td>${n}문항 / ${w.minutes[g]}분</td><td>${c.practical ? `${u.esc(c.practical.title)}<br><small>${Math.round(c.practical.minutes[g] * 60)}초 · ${c.practical.pass[g]}점 이상</small>` : '없음'}</td>
        <td>필기 ${u.won(c.fee.written[g])}${c.practical ? `<br>실기 ${u.won(c.fee.practical[g])}` : ''}</td></tr>`;
    }).join('');
    main.innerHTML = `
      ${title(u.esc(c.name) + ` <small class="jp">${u.esc(c.jp)}</small>`, u.esc(c.summary))}
      <section class="page paper">
        <h3 class="h-sub">개요</h3>
        <p>${u.esc(c.origin)}</p>
        <table class="kv"><tr><th>시행처</th><td>${u.esc(c.issuer)}</td></tr><tr><th>시행 방식</th><td>상시 검정 (접수 후 바로 응시)</td></tr></table>
        <h3 class="h-sub">수행 직무</h3>
        <ul class="dots">${c.duties.map((d) => `<li>${u.esc(d)}</li>`).join('')}</ul>
        <h3 class="h-sub">등급별 시험 정보</h3>
        <div class="table-wrap"><table class="grid-table"><tr><th>등급</th><th>응시자격</th><th>작업 구역·혜택</th><th>필기</th><th>실기</th><th>응시료</th></tr>${rows}</table></div>
        <h3 class="h-sub">검정 방법 및 합격 기준</h3>
        <table class="kv">
          <tr><th>필기시험</th><td>시험지·답안지 방식, 4지 택일형. ${w.subjects.map((s, i) => `제${i + 1}과목 ${u.esc(s)}`).join(', ')}</td></tr>
          <tr><th>필기 합격</th><td>매 과목 100점 만점에 ${w.cutoff}점 이상, 전 과목 평균 ${w.passAvg}점 이상</td></tr>
          ${c.practical ? `<tr><th>실기시험</th><td>${u.esc(c.practical.title)} — 필기 합격자(2년간 유효)만 응시</td></tr>` : ''}
          ${c.pledge ? '<tr><th>발급 요건</th><td>안전 음용 서약서 제출</td></tr>' : ''}
        </table>
        <h3 class="h-sub">출제 기준</h3>
        <div class="table-wrap"><table class="grid-table"><tr><th>과목</th><th>주요 항목</th></tr>
          ${w.subjects.map((s, i) => `<tr><td><b>${u.esc(s)}</b></td><td><ul class="dots">${CN.outline[id][i].map((x) => `<li>${u.esc(x)}</li>`).join('')}</ul></td></tr>`).join('')}</table></div>
        <p class="note">※ '관계 규정' 문항은 <a href="#/rules">검정 운영규정</a>${id === 'alba' ? '과 <a href="#/rules">라멘 로우 콜 매뉴얼</a>' : ''}에서 출제합니다.</p>
        <div class="btns"><a class="btn btn-main" href="#/apply?c=${id}">이 종목 원서 접수</a><a class="btn" href="#/practice?c=${id}">공개문제 풀어보기</a></div>
      </section>`;
  });

  /* 운영규정·매뉴얼 */
  R.on('/rules', (main) => {
    const m = CN.ramenManual;
    main.innerHTML = `${title('검정 운영규정', '관계 규정 과목의 출제 근거입니다. 시험 전에 꼭 읽어 두세요.')}
      <section class="page paper lined">
        ${CN.rules.map((r) => `<div class="rule"><b>${u.esc(r.t)}</b><p>${u.esc(r.b)}</p></div>`).join('')}
      </section>
      ${title('라멘 로우 콜 매뉴얼', '슈퍼 알바이터 필기·실기의 출제 근거입니다.')}
      <section class="page paper">
        <p>${u.esc(m.intro)}</p>
        <h3 class="h-sub">토핑</h3>
        <table class="grid-table"><tr><th>콜 이름</th><th>내용</th></tr>${m.toppings.map((t) => `<tr><td>${t.name}</td><td>${u.esc(t.ko)}</td></tr>`).join('')}</table>
        <h3 class="h-sub">양 단계</h3>
        <table class="grid-table"><tr><th>콜</th><th>의미</th></tr>${m.levels.map((l) => `<tr><td>${u.esc(l.word)}</td><td>${u.esc(l.meaning)}</td></tr>`).join('')}</table>
        <h3 class="h-sub">특수 콜</h3>
        <table class="grid-table"><tr><th>콜</th><th>의미</th></tr>${m.special.map((l) => `<tr><td>${u.esc(l.word)}</td><td>${u.esc(l.meaning)}</td></tr>`).join('')}</table>
        <h3 class="h-sub">응대 순서</h3>
        <ol class="rules-list">${m.steps.map((s) => `<li>${u.esc(s)}</li>`).join('')}</ol>
        <p class="note">예) "야사이 마시마시 닌니쿠 스쿠나메 아부라" → 야채 아주 많이, 마늘 적게, 등지방 많이, 카라메 기본</p>
      </section>`;
  });

  /* 시험 일정 */
  R.on('/schedule', (main) => {
    main.innerHTML = `${title('시험 일정', `${new Date().getFullYear()}년 모든 종목 상시 검정`)}
      <section class="page paper">
        <div class="table-wrap"><table class="grid-table">
          <tr><th>종목</th><th>원서 접수</th><th>필기시험</th><th>실기시험</th><th>합격 발표</th><th>자격증 발급</th></tr>
          ${CN.certOrder.map((id) => {
            const c = CN.certs[id];
            return `<tr><td><b>${u.esc(c.name)}</b>${c.grades[0] ? ' 5~1급' : ''}</td><td>상시</td><td>접수 즉시</td><td>${c.practical ? '필기 합격 후 상시' : '—'}</td><td>채점 즉시</td><td>최종 합격 후 즉시</td></tr>`;
          }).join('')}
        </table></div>
        <h3 class="h-sub">시험장 안내</h3>
        <div class="table-wrap"><table class="grid-table"><tr><th>시험장</th><th>위치</th><th>시행</th></tr>
          ${CN.venues.map((v) => `<tr><td>${u.esc(v.name)}</td><td>${u.esc(v.addr)}</td><td>${v.kinds.map(kindName).join(', ')}</td></tr>`).join('')}</table></div>
        <p class="note">※ 풀뽑기 검정 실기는 풀밭 제1시험장, 슈퍼 알바이터 실기는 라멘 로우 실습장에서만 시행합니다.</p>
      </section>`;
  });

  /* 수험자 등록 */
  R.on('/register', (main) => {
    const users = S.users();
    const av = Object.assign({}, CN.defaultAvatar);
    main.innerHTML = `${title('수험자 등록', '수험 수첩을 만들고 증명사진을 그려 주세요.')}
      ${users.length ? `<section class="page paper"><h3 class="h-sub">이미 만든 수험 수첩 펴기</h3><div class="user-list">${users.map((x) => `<button class="user-pick" data-id="${x.id}">${CN.avatarSVG(x.avatar, { cls: 'avatar mini' })}<span>${u.esc(x.name)}</span><small>${u.esc(x.birth)}</small></button>`).join('')}</div></section>` : ''}
      <section class="page paper">
        <h3 class="h-sub">새 수험 수첩 만들기</h3>
        <div class="reg">
          <div class="reg-photo"><div class="photo-frame" id="pv">${CN.avatarSVG(av)}</div><small>증명사진 (3×4)</small></div>
          <div class="reg-form">
            <label class="field-l">성명 <input id="nm" maxlength="12" placeholder="예) 치이카와" autocomplete="off"></label>
            <label class="field-l">생년월일 <input id="bd" type="date" max="${u.today()}"></label>
            ${Object.entries({ body: '몸 색', ears: '귀', face: '표정', pattern: '무늬' }).map(([k, label]) => `
              <div class="field-l">${label}<div class="chips">${CN.avatarParts[k].map((p) => `<button class="chip ${av[k] === p.id ? 'on' : ''}" data-part="${k}" data-v="${p.id}">${u.esc(p.name)}</button>`).join('')}</div></div>`).join('')}
            <p class="note">생년월일은 술 자격증 응시자격(만 19세 이상) 확인에만 쓰이며, 이 브라우저에만 저장됩니다.</p>
            <div class="btns left"><button class="btn btn-main" id="reg">수험 수첩 만들기</button></div>
          </div>
        </div>
      </section>`;
    u.qsa('.user-pick', main).forEach((b) => { b.onclick = () => { S.switchUser(b.dataset.id); CN.ui.toast('수험 수첩을 폈습니다.'); R.go('#/my'); }; });
    u.qsa('[data-part]', main).forEach((b) => {
      b.onclick = () => {
        av[b.dataset.part] = b.dataset.v;
        u.qsa(`[data-part="${b.dataset.part}"]`, main).forEach((x) => x.classList.toggle('on', x === b));
        u.qs('#pv', main).innerHTML = CN.avatarSVG(av);
      };
    });
    u.qs('#reg', main).onclick = () => {
      const name = u.qs('#nm', main).value.trim(), birth = u.qs('#bd', main).value;
      if (!name) return CN.ui.alert('확인해 주세요', '성명을 적어 주세요.');
      if (!birth || new Date(birth) > new Date() || new Date(birth).getFullYear() < 1900) return CN.ui.alert('확인해 주세요', '생년월일을 바르게 적어 주세요.');
      S.register({ name, birth, avatar: av });
      CN.ui.toast('수험 수첩을 만들었습니다!');
      R.go('#/my');
    };
  });

  /* 원서 접수 */
  R.on('/apply', (main) => applyPage(main, null));
  R.on('/apply\\?c=:c', (main, c) => applyPage(main, c));

  function eligibility(me, certId, grade, kind) {
    const c = CN.certs[certId];
    const gi = c.gradeInfo[grade];
    const msgs = [];
    let ok = true;
    if (gi.minAge && !u.isAdultKR(me.birth)) { ok = false; msgs.push('응시자격: 만 19세 이상(청소년 보호법 기준)이어야 합니다.'); }
    if (gi.prereq) {
      const pc = typeof gi.prereq === 'object' ? gi.prereq.cert : certId;
      const pg = typeof gi.prereq === 'object' ? gi.prereq.grade : gi.prereq;
      if (!S.hasGradeOrAbove(me.id, pc, pg)) { ok = false; msgs.push(`응시자격: ${CN.fullName(pc, pg)} 이상을 취득해야 합니다.`); }
    }
    if (S.finalPass(me.id, certId, grade)) { ok = false; msgs.push('이미 최종 합격한 종목·등급입니다. [자격증 발급]에서 발급받으세요.'); }
    else if (kind === 'practical') {
      if (!S.writtenValid(me.id, certId, grade)) { ok = false; msgs.push('실기시험은 필기시험 합격자(합격일로부터 2년 이내)만 응시할 수 있습니다.'); }
    } else if (c.practical && S.writtenValid(me.id, certId, grade)) {
      ok = false; msgs.push('이미 필기시험에 합격하여 2년간 필기가 면제됩니다. 실기시험을 접수하세요.');
    }
    const pending = S.myApps().find((a) => a.certId === certId && a.grade === grade && a.kind === kind && !a.result);
    if (pending) { ok = false; msgs.push(`이미 접수한 시험이 있습니다 (수험번호 ${pending.no}). 수험 수첩에서 응시하세요.`); }
    if (ok) msgs.push('응시자격을 갖추었습니다.');
    return { ok, msgs };
  }

  function applyPage(main, preset) {
    if (!needMe(main)) return;
    const me = S.me();
    const st = { cert: preset && CN.certs[preset] ? preset : 'weed', grade: null, kind: 'written', venue: null, pay: 'cash' };
    st.grade = CN.certs[st.cert].grades[0];

    function draw() {
      const c = CN.certs[st.cert];
      if (!c.practical) st.kind = 'written';
      const el = eligibility(me, st.cert, st.grade, st.kind);
      const venues = CN.venues.filter((v) => v.kinds.includes(st.kind) && (st.kind === 'written' || (st.cert === 'weed' ? v.id === 'v1' : v.id === 'v4')));
      if (!venues.find((v) => v.id === st.venue)) st.venue = venues[0].id;
      const fee = c.fee[st.kind][st.grade];
      main.innerHTML = `${title('원서 접수', `${u.esc(me.name)} 수험자님, 응시할 시험을 골라 주세요.`)}
        <section class="page paper form-steps">
          <div class="fs"><span class="fs-n">1</span><div><b>종목</b><div class="chips">${CN.certOrder.map((id) => `<button class="chip big ${st.cert === id ? 'on' : ''}" data-cert="${id}">${CN.certIcon[id]} ${u.esc(CN.certs[id].name)}</button>`).join('')}</div></div></div>
          <div class="fs"><span class="fs-n">2</span><div><b>등급</b><div class="chips">${c.grades.map((g) => `<button class="chip ${st.grade === g ? 'on' : ''}" data-grade="${g}">${CN.gradeLabel(st.cert, g)}</button>`).join('')}</div></div></div>
          <div class="fs"><span class="fs-n">3</span><div><b>시험 구분</b><div class="chips"><button class="chip ${st.kind === 'written' ? 'on' : ''}" data-kind="written">필기시험</button>${c.practical ? `<button class="chip ${st.kind === 'practical' ? 'on' : ''}" data-kind="practical">실기시험 (${u.esc(c.practical.title)})</button>` : ''}</div></div></div>
          <div class="fs"><span class="fs-n">4</span><div><b>응시자격 확인</b><div class="elig ${el.ok ? 'ok' : 'ng'}">${el.msgs.map((m) => `<p>${el.ok ? '✅' : '⚠️'} ${u.esc(m)}</p>`).join('')}</div></div></div>
          <div class="fs"><span class="fs-n">5</span><div><b>시험장</b><div class="chips">${venues.map((v) => `<button class="chip ${st.venue === v.id ? 'on' : ''}" data-venue="${v.id}">${u.esc(v.name)}</button>`).join('')}</div><small>${u.esc(venues.find((v) => v.id === st.venue).addr)}</small></div></div>
          <div class="fs"><span class="fs-n">6</span><div><b>응시료 납부</b> <span class="fee">${u.won(fee)}</span>
            <div class="chips"><button class="chip ${st.pay === 'cash' ? 'on' : ''}" data-pay="cash">접수 창구 현금 납부</button><button class="chip ${st.pay === 'pay' ? 'on' : ''}" data-pay="pay">보수에서 차감</button></div>
            <small>실제로 결제되지 않는 가상 납부입니다.</small></div></div>
          <label class="check"><input type="checkbox" id="agree"> 접수 내용을 확인했으며, 시험 당일 수험자 유의사항을 따르겠습니다.</label>
          <div class="btns"><button class="btn btn-main" id="submit" ${el.ok ? '' : 'disabled'}>원서 제출</button></div>
        </section>`;
      const bind = (attr, key, cast) => u.qsa(`[data-${attr}]`, main).forEach((b) => { b.onclick = () => { st[key] = cast ? cast(b.dataset[attr]) : b.dataset[attr]; if (key === 'cert') st.grade = CN.certs[st.cert].grades[0]; draw(); }; });
      bind('cert', 'cert'); bind('grade', 'grade', Number); bind('kind', 'kind'); bind('venue', 'venue'); bind('pay', 'pay');
      u.qs('#submit', main).onclick = () => {
        if (!u.qs('#agree', main).checked) return CN.ui.alert('확인해 주세요', '접수 내용 확인란에 체크해 주세요.');
        const app = S.apply(st.cert, st.grade, st.kind, st.venue, fee);
        CN.ui.toast('원서를 접수했습니다. 수험표를 확인하세요.');
        R.go('#/ticket/' + app.no);
      };
    }
    draw();
  }

  /* 수험표 */
  R.on('/ticket/:no', (main, no) => {
    if (!needMe(main)) return;
    const a = S.getApp(no), me = S.me();
    if (!a || a.userId !== me.id) return R.go('#/my');
    const v = CN.venues.find((x) => x.id === a.venue);
    main.innerHTML = `${title('수험표', '시험장에 입실할 때 필요합니다. 인쇄해 둘 수도 있어요.')}
      <section class="ticket-sheet print-area">
        <div class="tk-head"><span>${new Date(a.appliedAt).getFullYear()}년도 상시 검정</span><b>수 험 표</b><span>ちいかわ検定所</span></div>
        <div class="tk-body">
          <div class="tk-photo">${CN.avatarSVG(me.avatar)}</div>
          <table class="kv">
            <tr><th>수험번호</th><td class="mono big">${u.esc(a.no)}</td></tr>
            <tr><th>성명</th><td>${u.esc(me.name)}</td></tr>
            <tr><th>생년월일</th><td>${u.esc(me.birth)}</td></tr>
            <tr><th>종목</th><td>${u.esc(CN.fullName(a.certId, a.grade))} · ${kindName(a.kind)}시험</td></tr>
            <tr><th>시험장</th><td>${u.esc(v.name)} <small>(${u.esc(v.addr)})</small></td></tr>
            <tr><th>시험 일시</th><td>상시 — 접수 후 바로 입실 가능</td></tr>
          </table>
        </div>
        <ul class="tk-notes">
          <li>수험표와 신분증을 지참하고 시작 전에 입실하십시오.</li>
          <li>${a.kind === 'written' ? '필기시험은 답안지에 마킹한 답만 채점합니다.' : '실기시험 도중 작업장을 벗어나면 실격입니다.'}</li>
          <li>시험 중 시험장을 3회 벗어나면 부정행위로 처리합니다.</li>
        </ul>
        <div class="tk-seal">${'<span class="stamp">접수</span>'}</div>
      </section>
      <div class="btns no-print">
        <button class="btn" onclick="window.print()">수험표 인쇄</button>
        ${a.result ? `<a class="btn btn-main" href="#/result/${a.no}">결과 보기</a>` : `<a class="btn btn-main" href="#/exam/${a.no}">시험장 입실</a>`}
      </div>`;
  });

  /* 시험 */
  R.on('/exam/:no', (main, no) => {
    if (!needMe(main)) return;
    const a = S.getApp(no);
    if (!a || a.userId !== S.me().id) return R.go('#/my');
    if (a.result) return R.go('#/result/' + no);
    document.body.classList.add('in-exam');
    if (a.kind === 'written') CN.exam.render(a, main); else CN.practical.render(a, main);
  });

  /* 채점 결과 */
  R.on('/result/:no', (main, no) => {
    if (!needMe(main)) return;
    const a = S.getApp(no), me = S.me();
    if (!a || a.userId !== me.id) return R.go('#/my');
    if (!a.result) return R.go('#/exam/' + no);
    const c = CN.certs[a.certId], r = a.result;
    let body = '';
    if (a.kind === 'written') {
      const w = c.written;
      body = `<div class="table-wrap"><table class="grid-table score"><tr><th>과목</th><th>맞힌 문항</th><th>점수</th><th>판정</th></tr>
        ${w.subjects.map((s, i) => `<tr><td>제${i + 1}과목 ${u.esc(s)}</td><td>${r.correct[i]} / ${r.counts[i]}</td><td><b>${r.scores[i]}</b></td><td>${r.scores[i] < w.cutoff ? '<span class="red">과락</span>' : '통과'}</td></tr>`).join('')}
        <tr class="sum"><td>평균</td><td></td><td><b>${r.avg}</b></td><td>기준 ${w.passAvg}점</td></tr></table></div>`;
    } else {
      body = `<div class="big-score">${r.score}<small>점</small></div><p class="center">기준 ${c.practical.pass[a.grade]}점</p><ul class="dots">${r.detail.map((d) => `<li>${u.esc(d)}</li>`).join('')}</ul>`;
    }
    const stamp = r.voided ? '<div class="result-stamp void">무효</div>' : r.pass ? '<div class="result-stamp pass">합격</div>' : '<div class="result-stamp fail">불합격</div>';
    let next = '';
    if (r.pass && a.kind === 'written' && c.practical) next = `<p>🎉 필기시험에 합격했습니다! 합격일로부터 2년간 필기가 면제됩니다.</p><a class="btn btn-main" href="#/apply?c=${a.certId}">실기시험 접수하기</a>`;
    else if (r.pass) next = '<p>🎉 최종 합격입니다! 자격증을 발급받으세요.</p><a class="btn btn-main" href="#/issue">자격증 발급 신청</a>';
    else next = `<p>${a.kind === 'written' ? '과목별 점수를 확인하고 약한 과목을 보완해 다시 도전하세요. 공부한 내용은 반드시 나옵니다.' : '작업 기록을 확인하고 다시 도전하세요.'}</p><a class="btn btn-main" href="#/apply?c=${a.certId}">다시 접수하기</a> <a class="btn" href="#/practice?c=${a.certId}">공개문제 복습</a>`;
    main.innerHTML = `${title('채점 결과 통지서')}
      <section class="page paper result">
        ${stamp}
        <table class="kv"><tr><th>수험번호</th><td class="mono">${u.esc(a.no)}</td></tr><tr><th>성명</th><td>${u.esc(me.name)}</td></tr><tr><th>종목</th><td>${u.esc(CN.fullName(a.certId, a.grade))} ${kindName(a.kind)}시험</td></tr><tr><th>채점일</th><td>${u.esc(u.korDate(a.finishedAt))}</td></tr></table>
        ${body}
        ${r.voided ? '<p class="red">시험장 이탈 등 운영규정 위반으로 무효(실격) 처리되었습니다.</p>' : ''}
        <div class="next">${next}</div>
      </section>`;
  });

  /* 합격자 발표 */
  R.on('/announce', (main) => {
    main.innerHTML = `${title('합격자 발표', '수험번호와 생년월일로 조회합니다.')}
      <section class="page paper narrow">
        <label class="field-l">수험번호 <input id="no" placeholder="예) 26W5-1019-0001" autocomplete="off"></label>
        <label class="field-l">생년월일 <input id="bd" type="date"></label>
        <div class="btns"><button class="btn btn-main" id="go">조회</button></div>
        <div id="out"></div>
      </section>`;
    u.qs('#go', main).onclick = () => {
      const no = u.qs('#no', main).value.trim().toUpperCase(), bd = u.qs('#bd', main).value;
      const a = S.getApp(no);
      const owner = a && S.users().find((x) => x.id === a.userId);
      const out = u.qs('#out', main);
      if (!a || !owner || owner.birth !== bd) { out.innerHTML = '<div class="elig ng"><p>⚠️ 일치하는 수험 정보가 없습니다. 수험번호와 생년월일을 확인하세요.</p></div>'; return; }
      if (!a.result) { out.innerHTML = '<div class="elig"><p>아직 응시하지 않았거나 채점 전입니다.</p></div>'; return; }
      out.innerHTML = `<div class="announce ${a.result.pass ? 'ok' : 'ng'}"><b>${u.esc(owner.name)}</b> 님의 ${u.esc(CN.fullName(a.certId, a.grade))} ${kindName(a.kind)}시험 결과는
        <span class="big">${a.result.voided ? '무효' : a.result.pass ? '합격' : '불합격'}</span>입니다.</div>`;
    };
  });

  /* 자격증 발급 */
  R.on('/issue', (main) => {
    if (!needMe(main)) return;
    const me = S.me();
    const passes = [];
    CN.certOrder.forEach((id) => CN.certs[id].grades.forEach((g) => { const p = S.finalPass(me.id, id, g); if (p) passes.push(p); }));
    const lics = S.myLicenses();
    main.innerHTML = `${title('자격증 발급', '최종 합격한 자격의 자격증을 발급·재발급합니다.')}
      <section class="page paper">
        ${passes.length ? `<div class="issue-list">${passes.map((p) => {
          const cur = lics.find((l) => l.certId === p.certId && l.grade === p.grade && l.status === '유효');
          return `<div class="issue-item">${CN.certIcon[p.certId]}<div><b>${u.esc(CN.fullName(p.certId, p.grade))}</b><small>합격일 ${u.esc(u.ymd(p.finishedAt))}${cur ? ` · 발급됨 (${u.esc(cur.licNo)})` : ''}</small></div>
            <div class="btns right">${cur ? `<a class="btn btn-sm" href="#/license/${cur.licNo}">자격증 보기</a>` : ''}<button class="btn btn-sm btn-main" data-issue="${p.no}">${cur ? '재발급' : '발급 신청'}</button></div></div>`;
        }).join('')}</div>` : `<div class="center">${CN.avatarSVG({ face: 'teary' }, { cls: 'avatar big' })}<p>아직 최종 합격한 자격이 없습니다.</p><a class="btn btn-main" href="#/apply">원서 접수하기</a></div>`}
      </section>`;
    u.qsa('[data-issue]', main).forEach((b) => { b.onclick = () => issueDialog(S.getApp(b.dataset.issue)); });
  });

  function issueDialog(p) {
    const c = CN.certs[p.certId];
    const pledge = c.pledge ? `<div class="pledge"><b>안전 음용 서약서</b>
      <label class="check"><input type="checkbox" class="pl"> 휴간일을 지키고, 나의 적정 음주량을 넘지 않겠습니다.</label>
      <label class="check"><input type="checkbox" class="pl"> 술을 마신 날에는 운전하지 않겠습니다.</label>
      <label class="check"><input type="checkbox" class="pl"> 다른 사람에게 술을 강요하지 않겠습니다.</label>
      <label class="check"><input type="checkbox" class="pl"> 자격증을 항상 휴대하고 불시 검사에 응하겠습니다.</label></div>` : '';
    const m = CN.ui.modal(`<h3 class="modal-title">${u.esc(CN.fullName(p.certId, p.grade))} 자격증 발급</h3>
      <div class="modal-body"><p>발급 형태를 고르세요. 발급 후 두 형태 모두 볼 수 있습니다.</p>
        <div class="chips"><button class="chip on" data-form="card">카드형 (휴대용)</button><button class="chip" data-form="paper">증서형 (액자용)</button></div>
        ${pledge}
        <p class="note">재발급하면 기존 자격증은 효력을 잃습니다. 증명사진은 현재 수험 수첩의 사진으로 들어갑니다.</p></div>
      <div class="btns"><button class="btn" data-x>취소</button><button class="btn btn-main" data-ok>발급</button></div>`);
    let form = 'card';
    u.qsa('[data-form]', m.el).forEach((b) => { b.onclick = () => { form = b.dataset.form; u.qsa('[data-form]', m.el).forEach((x) => x.classList.toggle('on', x === b)); }; });
    u.qs('[data-x]', m.el).onclick = m.close;
    u.qs('[data-ok]', m.el).onclick = () => {
      if (c.pledge && u.qsa('.pl', m.el).some((x) => !x.checked)) return CN.ui.toast('서약서의 모든 항목에 동의해야 발급됩니다.');
      const lic = S.issue(p, form);
      m.close();
      R.go('#/license/' + lic.licNo);
    };
  }

  R.on('/license/:no', (main, no) => {
    if (!needMe(main)) return;
    const l = S.findLicense(no);
    if (!l || l.userId !== S.me().id) return R.go('#/issue');
    const showPaper = l.form === 'paper';
    main.innerHTML = `${title('자격증', `${u.esc(CN.fullName(l.certId, l.grade))} · ${u.esc(l.status)}`)}
      <div class="chips center no-print"><button class="chip ${showPaper ? '' : 'on'}" data-v="card">카드형</button><button class="chip ${showPaper ? 'on' : ''}" data-v="paper">증서형</button></div>
      <section class="lic-stage print-area" id="stage"></section>
      <div class="btns no-print"><button class="btn btn-main" onclick="window.print()">인쇄하기</button><a class="btn" href="#/verify?n=${encodeURIComponent(l.licNo)}">진위 확인</a></div>`;
    const stage = u.qs('#stage', main);
    const show = (v) => { stage.innerHTML = v === 'paper' ? CN.license.certificate(l) : `<div class="card-pair">${CN.license.cardFront(l)}${CN.license.cardBack(l)}</div>`; };
    u.qsa('[data-v]', main).forEach((b) => { b.onclick = () => { u.qsa('[data-v]', main).forEach((x) => x.classList.toggle('on', x === b)); show(b.dataset.v); }; });
    show(showPaper ? 'paper' : 'card');
  });

  /* 진위 확인 */
  R.on('/verify', (main) => verifyPage(main, ''));
  R.on('/verify\\?n=:n', (main, n) => verifyPage(main, n));
  function verifyPage(main, preset) {
    main.innerHTML = `${title('자격증 진위 확인', '자격증에 적힌 번호·성명·발급일을 접수 대장과 대조합니다.')}
      <section class="page paper narrow">
        <label class="field-l">자격번호 <input id="no" value="${u.esc(preset)}" placeholder="예) 2026-W5-000001-K" autocomplete="off"></label>
        <label class="field-l">성명 <input id="nm" autocomplete="off"></label>
        <label class="field-l">발급일 <input id="dt" type="date"></label>
        <div class="btns"><button class="btn btn-main" id="go">대조하기</button></div>
        <div id="out"></div>
      </section>`;
    u.qs('#go', main).onclick = () => {
      const no = u.qs('#no', main).value.trim().toUpperCase(), nm = u.qs('#nm', main).value.trim(), dt = u.qs('#dt', main).value;
      const out = u.qs('#out', main);
      const m = no.match(/^(\d{4}-[WSA]\d-\d{6})-([0-9A-Z])$/);
      if (!m) { out.innerHTML = '<div class="elig ng"><p>⚠️ 자격번호 형식이 올바르지 않습니다. (예: 2026-W5-000001-K)</p></div>'; return; }
      if (u.checkChar(m[1]) !== m[2]) { out.innerHTML = '<div class="elig ng"><p>⚠️ 검증문자가 맞지 않습니다. 위조되었거나 잘못 적은 번호입니다.</p></div>'; return; }
      const l = S.findLicense(no);
      if (!l) { out.innerHTML = '<div class="elig ng"><p>⚠️ 접수 대장에 없는 번호입니다.</p></div>'; return; }
      if (l.name !== nm || u.ymd(l.issuedAt) !== dt) { out.innerHTML = '<div class="elig ng"><p>⚠️ 자격번호는 있으나 성명 또는 발급일이 일치하지 않습니다.</p></div>'; return; }
      out.innerHTML = l.status === '유효'
        ? `<div class="elig ok"><p>✅ <b>정상 발급된 자격증입니다.</b></p><p>${u.esc(l.name)} · ${u.esc(CN.fullName(l.certId, l.grade))} · 합격일 ${u.esc(u.ymd(l.passDate))}</p><div class="pattern-check">대조 무늬 ${CN.license.pattern(l.licNo)}</div></div>`
        : `<div class="elig ng"><p>⚠️ 이 자격증은 <b>${u.esc(l.status)}</b> 상태입니다. 최신 자격증을 확인하세요.</p></div>`;
    };
  }

  /* 공개문제 */
  R.on('/practice', (main) => practicePage(main, 'weed'));
  R.on('/practice\\?c=:c', (main, c) => practicePage(main, CN.certs[c] ? c : 'weed'));
  function practicePage(main, certId) {
    const st = { cert: certId, grade: CN.certs[certId].grades[0] };
    function draw() {
      const c = CN.certs[st.cert];
      const levels = c.written.levels[st.grade];
      const pool = CN.bank[st.cert].filter((q) => levels.includes(q.lv));
      const qs = u.shuffle(pool).slice(0, 10).map((q) => ({ q, order: u.shuffle([0, 1, 2, 3]) }));
      main.innerHTML = `${title('공개문제', '실제 출제 범위에서 무작위로 10문항을 뽑았습니다. 보기를 누르면 정답과 해설이 나옵니다.')}
        <section class="page paper">
          <div class="chips">${CN.certOrder.map((id) => `<button class="chip ${st.cert === id ? 'on' : ''}" data-cert="${id}">${u.esc(CN.certs[id].name)}</button>`).join('')}</div>
          ${c.grades[0] ? `<div class="chips">${c.grades.map((g) => `<button class="chip ${st.grade === g ? 'on' : ''}" data-grade="${g}">${g}급</button>`).join('')}</div>` : ''}
          <div class="practice">${qs.map((x, i) => `<div class="q pq" data-i="${i}"><div class="q-text"><b>${i + 1}.</b> <span class="tag">${u.esc(c.written.subjects[x.q.s])}</span> ${u.esc(x.q.q)}</div>
            <ol class="q-opts">${x.order.map((oi, k) => `<li data-k="${k}"><span class="num">${'①②③④'[k]}</span> ${u.esc(x.q.o[oi])}</li>`).join('')}</ol><div class="expl"></div></div>`).join('')}</div>
          <div class="btns"><button class="btn btn-main" id="again">다른 문제 풀기</button><a class="btn" href="#/rules">운영규정 읽기</a></div>
        </section>`;
      u.qsa('[data-cert]', main).forEach((b) => { b.onclick = () => { st.cert = b.dataset.cert; st.grade = CN.certs[st.cert].grades[0]; draw(); }; });
      u.qsa('[data-grade]', main).forEach((b) => { b.onclick = () => { st.grade = +b.dataset.grade; draw(); }; });
      u.qsa('.pq', main).forEach((box) => {
        const x = qs[+box.dataset.i];
        u.qsa('li', box).forEach((li) => {
          li.onclick = () => {
            if (box.classList.contains('done')) return;
            box.classList.add('done');
            const k = +li.dataset.k;
            const right = x.order.indexOf(x.q.a);
            u.qsa('li', box)[right].classList.add('right');
            if (k !== right) li.classList.add('wrong');
            u.qs('.expl', box).innerHTML = `<b>${k === right ? '⭕ 정답' : '❌ 오답'}</b> — 정답 ${'①②③④'[right]}. ${u.esc(x.q.e)}`;
          };
        });
      });
      u.qs('#again', main).onclick = draw;
    }
    draw();
  }

  /* 수험 수첩 */
  R.on('/my', (main) => {
    if (!needMe(main)) return;
    const me = S.me();
    const apps = S.myApps(), lics = S.myLicenses();
    main.innerHTML = `${title('수험 수첩')}
      <section class="page paper my-head">
        <div class="photo-frame">${CN.avatarSVG(me.avatar)}</div>
        <div><h3 class="h-hand">${u.esc(me.name)}</h3><p>생년월일 ${u.esc(me.birth)} · 수첩 만든 날 ${u.esc(u.ymd(me.createdAt))}</p>
          <div class="btns left"><a class="btn btn-sm" href="#/apply">원서 접수</a><button class="btn btn-sm" id="photo">증명사진 다시 그리기</button><a class="btn btn-sm" href="#/register">다른 수첩 펴기</a></div></div>
      </section>
      <section class="page paper">
        <h3 class="h-sub">접수 내역</h3>
        ${apps.length ? `<div class="table-wrap"><table class="grid-table"><tr><th>수험번호</th><th>종목</th><th>구분</th><th>접수일</th><th>상태</th><th></th></tr>
          ${apps.map((a) => `<tr><td class="mono">${u.esc(a.no)}</td><td>${u.esc(CN.fullName(a.certId, a.grade))}</td><td>${kindName(a.kind)}</td><td>${u.esc(u.ymd(a.appliedAt))}</td><td>${statusBadge(a)}</td>
            <td class="act"><a class="btn btn-sm" href="#/ticket/${a.no}">수험표</a>${a.result ? `<a class="btn btn-sm" href="#/result/${a.no}">결과</a>` : `<a class="btn btn-sm btn-main" href="#/exam/${a.no}">${a.status === '응시중' ? '이어서 응시' : '입실'}</a>`}</td></tr>`).join('')}</table></div>`
          : '<p>아직 접수한 시험이 없습니다.</p>'}
      </section>
      <section class="page paper">
        <h3 class="h-sub">내 자격증</h3>
        ${lics.length ? `<div class="mini-lics">${lics.map((l) => `<a class="mini-lic ${l.status !== '유효' ? 'void' : ''}" href="#/license/${l.licNo}">${CN.certIcon[l.certId]}<b>${u.esc(CN.fullName(l.certId, l.grade))}</b><small class="mono">${u.esc(l.licNo)}</small><small>${u.esc(l.status)}</small></a>`).join('')}</div>`
          : '<p>아직 발급받은 자격증이 없습니다.</p>'}
      </section>`;
    u.qs('#photo', main).onclick = () => photoDialog(me);
  });

  function photoDialog(me) {
    const av = Object.assign({}, CN.defaultAvatar, me.avatar);
    const m = CN.ui.modal(`<h3 class="modal-title">증명사진 다시 그리기</h3><div class="modal-body"><div class="photo-frame center-block" id="pv2">${CN.avatarSVG(av)}</div>
      ${Object.entries({ body: '몸 색', ears: '귀', face: '표정', pattern: '무늬' }).map(([k, label]) => `<div class="field-l">${label}<div class="chips">${CN.avatarParts[k].map((p) => `<button class="chip ${av[k] === p.id ? 'on' : ''}" data-part="${k}" data-v="${p.id}">${u.esc(p.name)}</button>`).join('')}</div></div>`).join('')}
      <p class="note">이미 발급한 자격증의 사진은 바뀌지 않습니다. 재발급하면 새 사진이 들어갑니다.</p></div>
      <div class="btns"><button class="btn" data-x>취소</button><button class="btn btn-main" data-ok>저장</button></div>`);
    u.qsa('[data-part]', m.el).forEach((b) => {
      b.onclick = () => {
        av[b.dataset.part] = b.dataset.v;
        u.qsa(`[data-part="${b.dataset.part}"]`, m.el).forEach((x) => x.classList.toggle('on', x === b));
        u.qs('#pv2', m.el).innerHTML = CN.avatarSVG(av);
      };
    });
    u.qs('[data-x]', m.el).onclick = m.close;
    u.qs('[data-ok]', m.el).onclick = () => { S.updateMe({ avatar: av }); m.close(); R.handle(); };
  }

  /* 게시판 */
  R.on('/board', (main) => {
    main.innerHTML = `${title('노동 게시판', '검정소의 공지와 안내를 붙여 둡니다.')}<div class="cork">${CN.notices.map(noteHTML).join('')}</div>`;
  });
  R.on('/board/:id', (main, id) => {
    const n = CN.notices.find((x) => String(x.id) === id);
    if (!n) return R.go('#/board');
    main.innerHTML = `<section class="page paper lined"><span class="badge">${u.esc(n.cat)}</span><h2 class="h-hand">${u.esc(n.title)}</h2><p class="muted">${u.esc(n.date)} · 치이카와 자격검정소</p>
      ${n.body.split('\n').map((p) => (p ? `<p>${u.esc(p)}</p>` : '')).join('')}<div class="btns"><a class="btn" href="#/board">목록</a></div></section>`;
  });

  /* 자주 묻는 질문 */
  R.on('/faq', (main) => {
    main.innerHTML = `${title('자주 묻는 질문')}<section class="page paper">${CN.faqs.map((f) => `<details class="faq"><summary>${u.esc(f.q)}</summary><p>${u.esc(f.a)}</p></details>`).join('')}
      <div class="btns"><button class="btn btn-sm" id="notice">팬 사이트 안내 다시 보기</button><button class="btn btn-sm" id="wipe">이 브라우저의 모든 기록 지우기</button></div></section>`;
    u.qs('#notice', main).onclick = () => CN.fanNotice(true);
    u.qs('#wipe', main).onclick = () => CN.ui.confirm({ title: '기록 지우기', body: '수험 수첩, 접수 내역, 자격증이 모두 지워집니다. 되돌릴 수 없습니다.', ok: '모두 지우기' }, () => { S.reset(); CN.ui.toast('모든 기록을 지웠습니다.'); R.go('#/'); });
  });
})();

window.addEventListener('hashchange', CN.router.handle);
window.addEventListener('DOMContentLoaded', () => {
  CN.router.handle();
  CN.fanNotice();
});
