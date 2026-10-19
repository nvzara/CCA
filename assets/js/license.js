/* 자격증 그리기 — 카드형(앞·뒷면)과 증서형 */
window.CN = window.CN || {};

CN.license = (function () {
  const u = CN.u;
  const INK = '#262626';

  /* 카드 색: 풀뽑기 검정은 급수가 오를수록 흰색 → 연두 → 금 → 은 → 분홍빛 금 */
  const FILL = {
    weed: { 5: '#FFFFFF', 4: '#DDEFCB', 3: '#E8BD55', 2: '#C9CED4', 1: '#EDB7A8' },
    sake: { 0: '#F6D6A6' },
    alba: { 0: '#FBE59A' },
  };
  const LABEL = {
    weed: { top: '제초', bottom: (g) => g + '급' },
    sake: { top: '술', bottom: () => '자격' },
    alba: { top: '로우', bottom: () => '슈퍼 알바' },
  };
  const PAPER = { weed: '#EAF6DF', sake: '#FFF1DC', alba: '#FFF6CC' };

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
      if (edge || r() < 0.45) cells += `<rect x="${x * 6}" y="${y * 6}" width="5" height="5" rx="1.6" fill="${INK}"/>`;
    }
    return `<svg viewBox="0 0 42 42" class="pattern" aria-hidden="true">${cells}</svg>`;
  }

  /* 손으로 그린 듯 흔들리는 선 */
  function wobble(id, seed) {
    return `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter>`;
  }

  /* 녹색 왕관(풀) */
  function crown(cx, cy) {
    return `<path d="M${cx - 17} ${cy + 9} L${cx - 15} ${cy - 7} L${cx - 7} ${cy + 1} L${cx} ${cy - 10} L${cx + 7} ${cy + 1} L${cx + 15} ${cy - 7} L${cx + 17} ${cy + 9} Z" fill="#8CC152" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
  }

  function cardFront(l) {
    const id = 'lc' + u.hash(l.licNo).toString(36);
    const fill = FILL[l.certId][l.grade];
    const lab = LABEL[l.certId];
    const bottom = lab.bottom(l.grade);
    const bottomSize = bottom.length > 3 ? 40 : 58;
    const ink = `stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    return `<div class="lic-card front">
      <svg viewBox="0 0 340 236" class="lic-svg" role="img" aria-label="${u.esc(CN.fullName(l.certId, l.grade))} 자격증 앞면">
        <defs>${wobble(id + 'w', u.hash(l.licNo) % 97)}<clipPath id="${id}c"><rect x="216" y="70" width="76" height="92"/></clipPath></defs>
        <g filter="url(#${id}w)">
          <rect x="7" y="16" width="326" height="212" rx="30" fill="${fill}" stroke="${INK}" stroke-width="3.4"/>
          <rect x="20" y="29" width="300" height="186" rx="18" ${ink} stroke-width="2.6"/>
          <rect x="148" y="14.5" width="44" height="16.5" fill="${fill}"/>
          <path d="M20 122 H214" ${ink} stroke-width="2.6"/>
          <rect x="214" y="68" width="80" height="96" fill="#fff" stroke="${INK}" stroke-width="2.6"/>
          <path d="M294 118 H305" ${ink} stroke-width="2.6"/>
        </g>
        <g clip-path="url(#${id}c)"><svg x="212" y="88" width="84" height="84" viewBox="0 0 120 120">${CN.avatarInner(l.avatar)}</svg></g>
        <rect x="214" y="68" width="80" height="96" fill="none" stroke="${INK}" stroke-width="2.6" filter="url(#${id}w)"/>
        ${crown(170, 22)}
        <text x="58" y="100" font-family="Gaegu, sans-serif" font-weight="700" font-size="46" fill="${INK}">${u.esc(lab.top)}</text>
        <text x="${bottom.length > 3 ? 40 : 62}" y="${bottom.length > 3 ? 184 : 192}" font-family="Gaegu, sans-serif" font-weight="700" font-size="${bottomSize}" fill="${INK}">${u.esc(bottom)}</text>
        <text x="300" y="206" text-anchor="end" font-size="8.5" fill="${INK}" opacity=".7" font-family="ui-monospace, monospace">No.${u.esc(l.licNo)}</text>
      </svg>
      ${l.status !== '유효' ? '<div class="lc-void">효력 상실</div>' : ''}
    </div>`;
  }

  function cardBack(l) {
    const c = CN.certs[l.certId];
    const gi = c.gradeInfo[l.grade];
    let notes = [];
    if (l.certId === 'weed') notes = [`작업 구역: ${gi.area}`, `보수 배율 ${gi.pay.toFixed(1)}배`];
    if (l.certId === 'sake') notes = ['음주 시 항상 휴대할 것', '불시 검사 미제시 시 禁 표시'];
    if (l.certId === 'alba') notes = ['라멘 로우 점원 근무 가능', '닌니쿠 이레마스카? 는 면이 다 삶아진 뒤에'];
    return `<div class="lic-card back" style="--lfill:${FILL[l.certId][l.grade]}">
      <div class="lb-in">
        <div class="lb-title">${u.esc(CN.fullName(l.certId, l.grade))}</div>
        <dl class="lb-info">
          <dt>성명</dt><dd>${u.esc(l.name)}</dd>
          <dt>생년월일</dt><dd>${u.esc(l.birth)}</dd>
          <dt>합격일</dt><dd>${u.esc(u.ymd(l.passDate))}</dd>
          <dt>발급일</dt><dd>${u.esc(u.ymd(l.issuedAt))}</dd>
          <dt>자격번호</dt><dd class="mono">${u.esc(l.licNo)}</dd>
        </dl>
        <ul class="lb-notes">${notes.map((x) => `<li>${u.esc(x)}</li>`).join('')}</ul>
        <div class="lb-foot"><span>치이카와 자격검정소</span>${pattern(l.licNo)}</div>
        <div class="lb-seal">${seal('検定')}</div>
      </div>
      ${l.status !== '유효' ? '<div class="lc-void">효력 상실</div>' : ''}
    </div>`;
  }

  function certificate(l) {
    const c = CN.certs[l.certId];
    return `<div class="lic-paper" style="--lbg:${PAPER[l.certId]};--lband:${FILL[l.certId][l.grade]}">
      <div class="lp-frame">
        <div class="lp-crown"><svg viewBox="140 6 60 32">${crown(170, 22)}</svg></div>
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
