window.CN = window.CN || {};

CN.u = {
  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  pad(n, w) { return String(n).padStart(w, '0'); },
  today() { return CN.u.ymd(new Date()); },
  ymd(d) {
    d = new Date(d);
    return d.getFullYear() + '-' + CN.u.pad(d.getMonth() + 1, 2) + '-' + CN.u.pad(d.getDate(), 2);
  },
  korDate(d) {
    d = new Date(d);
    return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
  },
  won(n) { return n.toLocaleString('ko-KR') + '원'; },
  /* 만 나이 */
  age(birth, at) {
    const b = new Date(birth), t = at ? new Date(at) : new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
    return a;
  },
  /* 청소년 보호법: 만 19세 미만이되, 만 19세가 되는 해의 1월 1일을 맞이한 사람은 제외(연 나이 19세 이상이면 성인) */
  isAdultKR(birth) {
    return new Date().getFullYear() - new Date(birth).getFullYear() >= 19;
  },
  shuffle(arr, rnd) {
    const a = arr.slice();
    rnd = rnd || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  },
  /* 시드 고정 난수 (mulberry32) */
  rng(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  },
  /* 자격번호 검증문자: 숫자·영문을 가중합하여 36진 한 글자 */
  checkChar(body) {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let sum = 0;
    body.replace(/[^0-9A-Z]/g, '').split('').forEach((c, i) => {
      const v = /[0-9]/.test(c) ? +c : c.charCodeAt(0) - 55;
      sum += v * ((i % 7) + 3);
    });
    return chars[sum % chars.length];
  },
  qs(sel, root) { return (root || document).querySelector(sel); },
  qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },
};

/* ── 먼작귀 증명사진: 부위를 골라 그리는 자체 제작 캐릭터 ── */
CN.avatarParts = {
  body: [
    { id: 'white', name: '하양', fill: '#FFFFFF' },
    { id: 'cream', name: '크림', fill: '#FFF1D6' },
    { id: 'pink', name: '분홍', fill: '#FFD9E2' },
    { id: 'sky', name: '하늘', fill: '#D7E9FA' },
    { id: 'yellow', name: '노랑', fill: '#FFF0A8' },
    { id: 'gray', name: '회색', fill: '#E3E1E6' },
  ],
  ears: [
    { id: 'round', name: '동글 귀' },
    { id: 'cat', name: '뾰족 귀' },
    { id: 'bunny', name: '긴 귀' },
    { id: 'horn', name: '작은 뿔' },
    { id: 'droop', name: '처진 귀' },
  ],
  face: [
    { id: 'normal', name: '기본' },
    { id: 'smile', name: '방긋' },
    { id: 'teary', name: '울먹' },
    { id: 'serious', name: '진지' },
  ],
  pattern: [
    { id: 'none', name: '없음' },
    { id: 'split', name: '파란 두건' },
    { id: 'cheek', name: '진한 볼터치' },
  ],
};

CN.defaultAvatar = { body: 'white', ears: 'round', face: 'normal', pattern: 'none' };

CN.avatarInk = '#262626';

/* 증명사진 캐릭터의 SVG 내부 요소 (viewBox 0 0 120 120) */
CN.avatarInner = function (av, opt) {
  av = Object.assign({}, CN.defaultAvatar, av || {});
  const P = CN.avatarParts;
  const fill = (P.body.find((b) => b.id === av.body) || P.body[0]).fill;
  const ink = CN.avatarInk;
  const line = `stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
  const hood = av.pattern === 'split';
  const hoodFill = '#3F64A6';
  let ears = '';
  switch (av.ears) {
    case 'round':
      ears = `<path d="M24 50 C18 38 26 28 36 31 C40 33 42 37 42 40" fill="${fill}" ${line}/><path d="M96 50 C102 38 94 28 84 31 C80 33 78 37 78 40" fill="${fill}" ${line}/>`;
      break;
    case 'cat': {
      const ef = hood ? hoodFill : fill;
      ears = `<path d="M22 56 C20 42 22 30 26 22 C34 26 42 32 48 38" fill="${ef}" ${line}/><path d="M98 56 C100 42 98 30 94 22 C86 26 78 32 72 38" fill="${ef}" ${line}/>`;
      break;
    }
    case 'bunny':
      ears = `<path d="M44 42 C38 26 38 6 46 4 C54 4 54 24 54 40" fill="${fill}" ${line}/><path d="M66 40 C66 24 66 4 74 4 C82 6 82 26 76 42" fill="${fill}" ${line}/>
        <path d="M46 34 C43 24 44 12 47 10 C50 12 50 24 50 34Z" fill="#F4A3B5"/><path d="M70 34 C70 24 70 12 73 10 C76 12 77 24 74 34Z" fill="#F4A3B5"/>`;
      break;
    case 'horn':
      ears = `<path d="M46 38 C44 28 46 20 52 18 C54 24 56 30 56 36" fill="#FFE59A" ${line}/><path d="M74 38 C76 28 74 20 68 18 C66 24 64 30 64 36" fill="#FFE59A" ${line}/>`;
      break;
    case 'droop':
      ears = `<path d="M26 48 C12 50 8 66 14 74 C20 72 24 64 28 58" fill="${fill}" ${line}/><path d="M94 48 C108 50 112 66 106 74 C100 72 96 64 92 58" fill="${fill}" ${line}/>`;
      break;
  }
  /* 머리: 살짝 비대칭인 찹쌀떡 모양 */
  const head = 'M60 34 C86 33 108 48 109 76 C110 100 92 116 60 116 C29 116 10 101 11 77 C12 49 33 35 60 34Z';
  let hoodPath = '';
  if (hood) {
    hoodPath = `<path d="M12 72 C13 48 33 35 60 34 C86 33 107 48 108 72 C102 62 92 58 82 60 C72 61 64 56 60 47 C56 56 48 61 38 60 C28 58 18 62 12 72Z" fill="${hoodFill}" ${line}/>`;
  }
  const blushC = av.pattern === 'cheek' ? '#F27D98' : '#F7A1B4';
  const blush = (cx) => `<ellipse cx="${cx}" cy="88" rx="8.5" ry="5.2" fill="${blushC}"/>` +
    `<path d="M${cx - 4.5} 91 L${cx - 2} 85 M${cx - 0.5} 91 L${cx + 2} 85 M${cx + 3.5} 91 L${cx + 6} 85" stroke="${ink}" stroke-width="1.2" stroke-linecap="round"/>`;
  const eye = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${ink}"/><circle cx="${cx + 1.4}" cy="${cy - 2}" r="1.9" fill="#fff"/><circle cx="${cx - 1.6}" cy="${cy + 2.2}" r=".9" fill="#fff"/>`;
  let face = '';
  switch (av.face) {
    case 'smile':
      face = `<path d="M38 80 Q44 72 50 80" fill="none" stroke="${ink}" stroke-width="2.8" stroke-linecap="round"/><path d="M70 80 Q76 72 82 80" fill="none" stroke="${ink}" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M54 88 Q60 98 66 88 Z" fill="#E66A7E" ${line}/>`;
      break;
    case 'teary':
      face = eye(44, 79, 5.6, 6.6) + eye(76, 79, 5.6, 6.6) +
        `<path d="M37 69 Q42 66 48 67" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/><path d="M83 69 Q78 66 72 67" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M54 93 Q57 90 60 93 Q63 90 66 93" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <path d="M38 85 Q35 93 39 97 Q43 93 40 85Z" fill="#9CD3F4"/><path d="M82 85 Q85 93 81 97 Q77 93 80 85Z" fill="#9CD3F4"/>`;
      break;
    case 'serious':
      face = eye(44, 80, 4.6, 5.4) + eye(76, 80, 4.6, 5.4) +
        `<path d="M36 69 L50 72" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/><path d="M84 69 L70 72" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M55 91 L65 91" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`;
      break;
    default:
      face = eye(44, 80, 4.8, 5.8) + eye(76, 80, 4.8, 5.8) +
        `<path d="M38 70 Q43 68 48 69" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/><path d="M82 70 Q77 68 72 69" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M55 89 Q57.5 92.5 60 89 Q62.5 92.5 65 89" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
  }
  /* 앞발 */
  const paws = `<path d="M40 117 C36 111 38 105 44 105 C48 105 49 109 47 112" fill="${fill}" ${line}/><path d="M80 117 C84 111 82 105 76 105 C72 105 71 109 73 112" fill="${fill}" ${line}/>`;
  return `${ears}<path d="${head}" fill="${fill}" ${line}/>${hoodPath}${blush(28)}${blush(92)}${face}${opt && opt.noPaws ? '' : paws}`;
};

CN.avatarSVG = function (av, opt) {
  opt = opt || {};
  const bg = opt.bg ? `<rect x="0" y="0" width="120" height="120" rx="${opt.rx || 0}" fill="${opt.bg}"/>` : '';
  return `<svg class="${opt.cls || 'avatar'}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="수험자 증명사진">${bg}${CN.avatarInner(av)}</svg>`;
};

/* 작은 장식 그림들 (자체 제작) */
CN.deco = {
  sprout: '<svg viewBox="0 0 40 40" class="deco"><path d="M20 36 V20" stroke="#4B3A30" stroke-width="2.4" stroke-linecap="round"/><path d="M20 22 C10 22 6 14 8 8 C16 8 21 14 20 22Z" fill="#B6DB9A" stroke="#4B3A30" stroke-width="2.2"/><path d="M20 20 C28 20 34 14 32 6 C24 6 19 12 20 20Z" fill="#CDE8B4" stroke="#4B3A30" stroke-width="2.2"/></svg>',
  flower: '<svg viewBox="0 0 40 40" class="deco"><g stroke="#4B3A30" stroke-width="2"><circle cx="20" cy="11" r="6" fill="#FFD3DE"/><circle cx="29" cy="18" r="6" fill="#FFD3DE"/><circle cx="25" cy="28" r="6" fill="#FFD3DE"/><circle cx="15" cy="28" r="6" fill="#FFD3DE"/><circle cx="11" cy="18" r="6" fill="#FFD3DE"/><circle cx="20" cy="20" r="5" fill="#FFE07A"/></g></svg>',
  star: '<svg viewBox="0 0 40 40" class="deco"><path d="M20 4 L24.5 15 L36 16 L27 23.5 L30 35 L20 28.5 L10 35 L13 23.5 L4 16 L15.5 15Z" fill="#FFE59A" stroke="#4B3A30" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  pencil: '<svg viewBox="0 0 40 40" class="deco"><path d="M8 32 L10 24 L28 6 L34 12 L16 30 Z" fill="#FFE59A" stroke="#4B3A30" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 32 L10 24 L16 30Z" fill="#F2D3B3" stroke="#4B3A30" stroke-width="2"/><path d="M24 10 L30 16" stroke="#4B3A30" stroke-width="2"/><path d="M28 6 L34 12 L36 10 Q36 6 32 4Z" fill="#F7B6C6" stroke="#4B3A30" stroke-width="2"/></svg>',
  bowl: '<svg viewBox="0 0 40 40" class="deco"><path d="M8 14 Q12 4 20 10 Q28 2 32 14" fill="#CDE8B4" stroke="#4B3A30" stroke-width="2"/><path d="M4 16 H36 Q36 34 20 34 Q4 34 4 16Z" fill="#F7D57A" stroke="#4B3A30" stroke-width="2.4" stroke-linejoin="round"/><path d="M10 22 H30" stroke="#4B3A30" stroke-width="1.6" stroke-dasharray="3 3"/></svg>',
  cup: '<svg viewBox="0 0 40 40" class="deco"><path d="M10 10 H28 V28 Q28 34 19 34 Q10 34 10 28Z" fill="#FFF6DE" stroke="#4B3A30" stroke-width="2.4"/><path d="M10 16 H28 V28 Q28 34 19 34 Q10 34 10 28Z" fill="#F4C46A"/><path d="M28 14 Q36 14 36 21 Q36 27 28 27" fill="none" stroke="#4B3A30" stroke-width="2.4"/><path d="M10 10 H28 V28 Q28 34 19 34 Q10 34 10 28Z" fill="none" stroke="#4B3A30" stroke-width="2.4"/></svg>',
};

CN.certIcon = { weed: CN.deco.sprout, sake: CN.deco.cup, alba: CN.deco.bowl };
