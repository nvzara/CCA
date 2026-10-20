/* 자격증 그리기 — 카드형(앞·뒷면)과 증서형.
 * 선은 자격번호를 시드로 한 잡음으로 흔들어 손으로 그린 듯 매번 조금씩 다르게 그린다. */
window.CN = window.CN || {};

CN.license = (function () {
  const u = CN.u;
  const INK = '#222222';

  /* 카드 색: 5급 흰색, 3급 황토빛 금색, 2급 은색은 원작 고증. 4급·1급은 원작 미공개라 사이트 설정 */
  const FILL = {
    weed: { 5: '#FFFFFF', 4: '#D9EBC3', 3: '#E3B44C', 2: '#CDD1D5', 1: '#EBBBA9' },
    sake: { 0: '#F4D5A6' },
    alba: { 0: '#F7E28F' },
  };
  const LABEL = {
    weed: { top: '제초', bottom: (g) => g + '급' },
    sake: { top: '술', bottom: () => '면허' },
    alba: { top: '알바', bottom: () => '슈퍼' },
  };

  /* ── 손그림 선 ── */
  function noiseFn(rnd, amp) {
    const waves = [0, 1, 2].map((i) => ({ f: (0.012 + rnd() * 0.02) * (i + 1), p: rnd() * Math.PI * 2, a: amp / (i + 1.4) }));
    return (s) => waves.reduce((acc, w) => acc + w.a * Math.sin(s * w.f + w.p), 0) + (rnd() - 0.5) * amp * 0.25;
  }

  /* Catmull-Rom 곡선을 3차 베지어로 */
  function smooth(pts, closed) {
    if (pts.length < 2) return '';
    const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
    let d = `M${P[1][0].toFixed(1)} ${P[1][1].toFixed(1)}`;
    for (let i = 1; i < P.length - 2; i++) {
      const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + (closed ? 'Z' : '');
  }

  /* 둥근 사각형 둘레를 시계 방향으로 걸으며 바깥쪽으로 흔든 점들. gap=[x0,x1]이면 윗변 그 구간을 비운다 */
  function roughRect(x, y, w, h, radii, rnd, amp, gap) {
    const n = noiseFn(rnd, amp);
    const r = radii.map((v) => v * (0.85 + rnd() * 0.3));
    const pts = [];
    let s = 0;
    const push = (px, py, nx, ny) => { const o = n(s); pts.push([px + nx * o, py + ny * o, px]); s += 6; };
    const step = 6;
    for (let px = x + r[0]; px <= x + w - r[1]; px += step) push(px, y, 0, -1);
    for (let a = -Math.PI / 2; a <= 0; a += step / r[1]) push(x + w - r[1] + Math.cos(a) * r[1], y + r[1] + Math.sin(a) * r[1], Math.cos(a), Math.sin(a));
    for (let py = y + r[1]; py <= y + h - r[2]; py += step) push(x + w, py, 1, 0);
    for (let a = 0; a <= Math.PI / 2; a += step / r[2]) push(x + w - r[2] + Math.cos(a) * r[2], y + h - r[2] + Math.sin(a) * r[2], Math.cos(a), Math.sin(a));
    for (let px = x + w - r[2]; px >= x + r[3]; px -= step) push(px, y + h, 0, 1);
    for (let a = Math.PI / 2; a <= Math.PI; a += step / r[3]) push(x + r[3] + Math.cos(a) * r[3], y + h - r[3] + Math.sin(a) * r[3], Math.cos(a), Math.sin(a));
    for (let py = y + h - r[3]; py >= y + r[0]; py -= step) push(x, py, -1, 0);
    for (let a = Math.PI; a <= Math.PI * 1.5; a += step / r[0]) push(x + r[0] + Math.cos(a) * r[0], y + r[0] + Math.sin(a) * r[0], Math.cos(a), Math.sin(a));
    if (!gap) return smooth(pts.map((p) => [p[0], p[1]]), true);
    /* 윗변의 gap 구간을 빼고, gap 오른쪽 끝에서 시작해 한 바퀴 돌아 gap 왼쪽 끝에서 끝나는 열린 선 */
    const topCount = Math.floor((w - r[0] - r[1]) / step) + 1;
    const top = pts.slice(0, topCount);
    const rest = pts.slice(topCount);
    const right = top.filter((p) => p[2] >= gap[1]);
    const left = top.filter((p) => p[2] <= gap[0]);
    return smooth(right.concat(rest, left).map((p) => [p[0], p[1]]), false);
  }

  /* 살짝 휘고 끝이 조금 넘치는 직선 */
  function roughLine(x1, y1, x2, y2, rnd, amp, over) {
    over = over == null ? 1.2 : over;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const nx = -uy, ny = ux;
    const n = noiseFn(rnd, amp);
    const sx = x1 - ux * over * rnd(), sy = y1 - uy * over * rnd();
    const ex = x2 + ux * over * rnd(), ey = y2 + uy * over * rnd();
    const k = Math.max(3, Math.round(len / 10));
    const bow = (rnd() - 0.5) * amp * 1.6;
    const pts = [];
    for (let i = 0; i <= k; i++) {
      const t = i / k;
      const o = (i === 0 || i === k ? 0 : n(t * len)) + Math.sin(t * Math.PI) * bow;
      pts.push([sx + (ex - sx) * t + nx * o, sy + (ey - sy) * t + ny * o]);
    }
    return smooth(pts, false);
  }

  function stroke(d, w, color) {
    return `<path d="${d}" fill="none" stroke="${color || INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  /* 원작 카드의 작은 녹색 왕관 */
  function crown(cx, cy, s, rnd) {
    s = s || 1;
    const j = () => (rnd ? (rnd() - 0.5) * 1.2 : 0);
    const p = [[-14, 6], [-13 + j(), -6 + j()], [-6 + j(), 0 + j()], [0 + j(), -8 + j()], [6 + j(), 0 + j()], [13 + j(), -6 + j()], [14, 6]];
    const d = 'M' + p.map(([x, y]) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`).join(' L') +
      ` Q${cx} ${(cy + 8.5 * s).toFixed(1)} ${(cx - 14 * s).toFixed(1)} ${(cy + 6 * s).toFixed(1)}Z`;
    return `<path d="${d}" fill="#8CC152" stroke="#4E7F25" stroke-width="${1.8 * s}" stroke-linejoin="round"/>`;
  }

  function seal(text) {
    return `<svg viewBox="0 0 80 80" class="seal" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="none" stroke="#D9485F" stroke-width="4"/><circle cx="40" cy="40" r="28" fill="none" stroke="#D9485F" stroke-width="1.6"/>
      <text x="40" y="36" text-anchor="middle" font-size="13" font-weight="700" fill="#D9485F" font-family="Gaegu, Yomogi, sans-serif">${text[0]}</text>
      <text x="40" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#D9485F" font-family="Gaegu, Yomogi, sans-serif">${text[1]}</text></svg>`;
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

  function handText(x, y, size, text, anchor) {
    return `<text x="${x}" y="${y}" font-family="Gaegu, Yomogi, sans-serif" font-size="${size}" fill="${INK}" stroke="${INK}" stroke-width="${(size / 110).toFixed(2)}" paint-order="stroke" ${anchor ? `text-anchor="${anchor}"` : ''}>${u.esc(text)}</text>`;
  }

  /* 카드 공통 테두리: 굵은 바깥선 + 왕관 자리가 끊긴 가는 안쪽선 */
  function cardFrame(rnd, fill) {
    return `<path d="${roughRect(6, 6, 308, 238, [34, 26, 38, 30], rnd, 1.6)}" fill="${fill}" stroke="${INK}" stroke-width="4.6" stroke-linejoin="round"/>` +
      stroke(roughRect(19, 19, 282, 212, [22, 16, 26, 20], rnd, 1.3, [157, 197]), 3);
  }

  function cardFront(l) {
    const rnd = u.rng(u.hash(l.licNo));
    const id = 'lc' + u.hash(l.licNo).toString(36);
    const lab = LABEL[l.certId];
    const bottom = lab.bottom(l.grade);
    const px = 214, py = 44, pw = 70, ph = 92;
    return `<div class="lic-card front">
      <svg viewBox="0 0 320 250" class="lic-svg" role="img" aria-label="${u.esc(CN.fullName(l.certId, l.grade))} 자격증 앞면">
        <defs><clipPath id="${id}c"><rect x="${px + 1}" y="${py + 1}" width="${pw - 2}" height="${ph - 2}"/></clipPath></defs>
        ${cardFrame(rnd, FILL[l.certId][l.grade])}
        ${crown(177, 18, 1.15, rnd)}
        <rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#fff"/>
        <g clip-path="url(#${id}c)"><svg x="${px - 17}" y="${py + 6}" width="${pw + 34}" height="${pw + 34}" viewBox="0 0 120 120">${CN.avatarInner(l.avatar, { noPaws: true })}</svg></g>
        ${stroke(roughLine(19, 102, px, 103.5 + (rnd() - 0.5) * 1.5, rnd, 0.7, 0.4), 3)}
        ${stroke(roughLine(px, py, px + pw, py + (rnd() - 0.5) * 2, rnd, 0.8), 2.8)}
        ${stroke(roughLine(px + pw, py, px + pw + (rnd() - 0.5) * 2, py + ph, rnd, 0.8), 2.8)}
        ${stroke(roughLine(px + pw, py + ph, px, py + ph + (rnd() - 0.5) * 2, rnd, 0.8), 2.8)}
        ${stroke(roughLine(px, py + ph, px + (rnd() - 0.5) * 2, py, rnd, 0.8), 2.8)}
        ${stroke(roughLine(px + pw + 3, py + ph - 5, px + pw + 12, py + ph - 5 + (rnd() - 0.5) * 1.5, rnd, 0.4, 0), 2.8)}
        ${handText(74, 80, 36, lab.top)}
        ${handText(62, 156, 40, bottom)}
        <text x="286" y="218" text-anchor="end" font-size="${l.footer ? 11 : 7}" fill="${INK}" font-family="${l.footer ? 'Gaegu, Yomogi, sans-serif' : 'ui-monospace, monospace'}">${u.esc(l.footer || 'No.' + l.licNo)}</text>
      </svg>
      ${l.status !== '유효' ? '<div class="lc-void">효력 상실</div>' : ''}
    </div>`;
  }

  function cardBack(l) {
    const rnd = u.rng(u.hash(l.licNo) ^ 0x5bd1e995);
    const c = CN.certs[l.certId];
    const gi = c.gradeInfo[l.grade];
    let note = '';
    if (l.certId === 'weed') note = `${gi.area} · 보수 ${gi.pay.toFixed(1)}배`;
    if (l.certId === 'sake') note = '항상 휴대할 것 · 미제시 시 禁';
    if (l.certId === 'alba') note = '라멘 로우 근무 가능';
    const rows = [['이름', l.name], ['생년월일', l.birth], ['합격', u.ymd(l.passDate)], ['발급', u.ymd(l.issuedAt)]];
    return `<div class="lic-card back">
      <svg viewBox="0 0 320 250" class="lic-svg" role="img" aria-label="${u.esc(CN.fullName(l.certId, l.grade))} 자격증 뒷면">
        ${cardFrame(rnd, FILL[l.certId][l.grade])}
        ${crown(177, 18, 1, rnd)}
        ${handText(40, 62, 24, CN.fullName(l.certId, l.grade))}
        ${stroke(roughLine(19, 74, 301, 75, rnd, 1, 0.3), 2.6)}
        ${rows.map(([k, v], i) => `${handText(40, 100 + i * 24, 17, k)}${handText(112, 100 + i * 24, 19, v)}`).join('')}
        ${handText(40, 202, 12, note)}
        <text x="40" y="220" font-size="8" fill="${INK}" font-family="ui-monospace, monospace">No.${u.esc(l.licNo)}</text>
        <svg x="246" y="140" width="40" height="40" viewBox="0 0 42 42">${pattern(l.licNo).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
        <g transform="rotate(-10 259 113)"><svg x="232" y="86" width="54" height="54" viewBox="0 0 80 80">${seal('検定').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></g>
      </svg>
      ${l.status !== '유효' ? '<div class="lc-void">효력 상실</div>' : ''}
    </div>`;
  }

  function certificate(l) {
    const rnd = u.rng(u.hash(l.licNo) ^ 0x2c1b3c6d);
    const c = CN.certs[l.certId];
    const frame = `<svg class="lp-lines" viewBox="0 0 600 820" preserveAspectRatio="none" aria-hidden="true">
      <path d="${roughRect(6, 6, 588, 808, [44, 36, 48, 40], rnd, 2)}" fill="${FILL[l.certId][l.grade]}" stroke="${INK}" stroke-width="5" vector-effect="non-scaling-stroke"/>
      <path d="${roughRect(26, 26, 548, 768, [28, 22, 30, 26], rnd, 1.6, [270, 330])}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    </svg>`;
    return `<div class="lic-paper">
      ${frame}
      <div class="lp-crown"><svg viewBox="280 8 40 22">${crown(300, 18, 1, rnd)}</svg></div>
      <div class="lp-frame">
        <div class="lp-no">제 ${u.esc(l.licNo)} 호</div>
        <h1 class="lp-title">자 격 증</h1>
        <div class="lp-photo"><svg viewBox="0 0 120 120">${CN.avatarInner(l.avatar, { noPaws: true })}</svg></div>
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
      </div>
      ${l.status !== '유효' ? '<div class="lc-void big">효력 상실</div>' : ''}
    </div>`;
  }

  return { cardFront, cardBack, certificate, pattern };
})();
