/* 자격증 그리기 — 카드형(앞·뒷면)과 증서형 */
window.CN = window.CN || {};

CN.license = (function () {
  const u = CN.u;
  const THEME = {
    weed: { bg: '#EAF6DF', band: '#B9DDA0', dot: '#CFE8BC', title: '풀뽑기 검정' },
    sake: { bg: '#FFF1DC', band: '#F4C98A', dot: '#F8DDB3', title: '술 자격증' },
    alba: { bg: '#FFF6CC', band: '#F5D76E', dot: '#F9E7A0', title: '슈퍼 알바이터' },
  };

  function seal(text) {
    return `<svg viewBox="0 0 80 80" class="seal" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="none" stroke="#D9485F" stroke-width="4"/><circle cx="40" cy="40" r="28" fill="none" stroke="#D9485F" stroke-width="1.6"/>
      <text x="40" y="36" text-anchor="middle" font-size="13" font-weight="700" fill="#D9485F" font-family="Gaegu, sans-serif">${text[0]}</text>
      <text x="40" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#D9485F" font-family="Gaegu, sans-serif">${text[1]}</text></svg>`;
  }

  /* 번호에서 만든 확인 무늬 (도장 갑옷씨가 대조하는 무늬) */
  function pattern(licNo) {
    const r = u.rng(u.hash(licNo));
    let cells = '';
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      const edge = (x < 2 && y < 2) || (x > 4 && y < 2) || (x < 2 && y > 4);
      if (edge || r() < 0.45) cells += `<rect x="${x * 6}" y="${y * 6}" width="5" height="5" rx="1.6" fill="#4B3A30"/>`;
    }
    return `<svg viewBox="0 0 42 42" class="pattern" aria-hidden="true">${cells}</svg>`;
  }

  function scallop(color) {
    return `background-image: radial-gradient(circle at 8px 8px, ${color} 5px, transparent 5.5px); background-size: 16px 16px;`;
  }

  function cardFront(l) {
    const t = THEME[l.certId];
    const c = CN.certs[l.certId];
    return `<div class="lic-card front" style="--lbg:${t.bg};--lband:${t.band}">
      <div class="lc-dots" style="${scallop(t.dot)}"></div>
      <div class="lc-head"><span class="lc-logo">ちいかわ検定所</span><span class="lc-kind">자 격 증</span></div>
      <div class="lc-body">
        <div class="lc-photo">${CN.avatarSVG(l.avatar)}</div>
        <div class="lc-info">
          <div class="lc-cert">${CN.certIcon[l.certId]}<b>${u.esc(c.name)}</b> <span class="lc-grade">${u.esc(CN.gradeLabel(l.certId, l.grade))}</span></div>
          <dl>
            <dt>성명</dt><dd>${u.esc(l.name)}</dd>
            <dt>생년월일</dt><dd>${u.esc(l.birth)}</dd>
            <dt>합격일</dt><dd>${u.esc(u.ymd(l.passDate))}</dd>
            <dt>발급일</dt><dd>${u.esc(u.ymd(l.issuedAt))}</dd>
          </dl>
        </div>
      </div>
      <div class="lc-foot"><span class="mono">No. ${u.esc(l.licNo)}</span>${pattern(l.licNo)}</div>
      <div class="lc-seal">${seal('検定')}</div>
      ${l.status !== '유효' ? '<div class="lc-void">효력 상실</div>' : ''}
    </div>`;
  }

  function cardBack(l) {
    const t = THEME[l.certId];
    const c = CN.certs[l.certId];
    const gi = c.gradeInfo[l.grade];
    let lines = [];
    if (l.certId === 'weed') lines = [`작업 가능 구역: ${gi.area}`, `보수 배율: ${gi.pay.toFixed(1)}배 (5급 기준)`, '뽑은 풀은 풀 담당 갑옷씨에게 계량·검사를 받을 것', '위험 생물 출현 시 작업 중지 → 대피 → 신호탄'];
    if (l.certId === 'sake') lines = ['음주 시 반드시 이 자격증을 휴대할 것', '불시 음주 면허증 검사에 응할 것 (미제시 시 禁 표시)', '휴간일을 지키고, 마신 날은 운전하지 않기', '도마뱀 등에게 빼앗기지 않도록 주의'];
    if (l.certId === 'alba') lines = ['라멘 로우 점원으로 근무할 수 있음', '"닌니쿠 이레마스카?"는 면이 다 삶아진 뒤에', '콜은 정확하게, 위생은 철저하게', '뜨거운 것이 지나갈 때는 말로 알리기'];
    return `<div class="lic-card back" style="--lbg:${t.bg};--lband:${t.band}">
      <div class="lc-dots" style="${scallop(t.dot)}"></div>
      <div class="lc-head"><span class="lc-logo">유의사항</span><span class="lc-kind">${u.esc(CN.fullName(l.certId, l.grade))}</span></div>
      <ul class="lc-notes">${lines.map((x) => `<li>${u.esc(x)}</li>`).join('')}</ul>
      <div class="lc-back-foot">이 자격증은 남에게 빌려주거나 빌릴 수 없습니다. 주운 분은 가까운 노동 접수 창구에 맡겨 주세요.</div>
      <div class="lc-back-deco">${CN.deco.sprout}${CN.deco.flower}${CN.deco.star}</div>
    </div>`;
  }

  function certificate(l) {
    const t = THEME[l.certId];
    const c = CN.certs[l.certId];
    return `<div class="lic-paper" style="--lbg:${t.bg};--lband:${t.band}">
      <div class="lp-frame">
        <div class="lp-corner tl">${CN.deco.flower}</div><div class="lp-corner tr">${CN.deco.star}</div>
        <div class="lp-corner bl">${CN.deco.sprout}</div><div class="lp-corner br">${CN.certIcon[l.certId]}</div>
        <div class="lp-no mono">제 ${u.esc(l.licNo)} 호</div>
        <h1 class="lp-title">자 격 증</h1>
        <div class="lp-photo">${CN.avatarSVG(l.avatar)}</div>
        <table class="lp-table">
          <tr><th>성명</th><td>${u.esc(l.name)}</td></tr>
          <tr><th>생년월일</th><td>${u.esc(u.korDate(l.birth))}</td></tr>
          <tr><th>자격종목</th><td>${u.esc(c.name)} (${u.esc(c.jp)})</td></tr>
          <tr><th>등급</th><td>${u.esc(CN.gradeLabel(l.certId, l.grade))}</td></tr>
          <tr><th>합격연월일</th><td>${u.esc(u.korDate(l.passDate))}</td></tr>
        </table>
        <p class="lp-text">위 사람은 치이카와 자격검정소 운영규정에서 정한 <b>${u.esc(CN.fullName(l.certId, l.grade))}</b> 검정에 최종 합격하였으므로 이 자격증을 드립니다.</p>
        <p class="lp-date">${u.esc(u.korDate(l.issuedAt))}</p>
        <div class="lp-issuer">치이카와 자격검정소장 <span class="lp-seal">${seal('検定')}</span></div>
        <p class="lp-fine">이 자격증은 비공식 팬 사이트에서 재미로 발급한 것으로 어떠한 법적 효력도 없습니다.</p>
        ${l.status !== '유효' ? '<div class="lc-void big">효력 상실</div>' : ''}
      </div>
    </div>`;
  }

  return { cardFront, cardBack, certificate, pattern };
})();
