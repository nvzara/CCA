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
    { id: 'split', name: '갈라진 앞머리' },
    { id: 'cheek', name: '진한 볼터치' },
  ],
};

CN.defaultAvatar = { body: 'white', ears: 'round', face: 'normal', pattern: 'none' };

CN.avatarSVG = function (av, opt) {
  av = Object.assign({}, CN.defaultAvatar, av || {});
  opt = opt || {};
  const P = CN.avatarParts;
  const fill = (P.body.find((b) => b.id === av.body) || P.body[0]).fill;
  const ink = '#4B3A30';
  const sw = 2.6;
  let ears = '';
  switch (av.ears) {
    case 'round':
      ears = `<circle cx="34" cy="34" r="10" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/><circle cx="86" cy="34" r="10" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/>`;
      break;
    case 'cat':
      ears = `<path d="M24 52 L30 20 L50 36 Z" fill="${fill}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M96 52 L90 20 L70 36 Z" fill="${fill}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M31 30 L33 40 L41 36Z" fill="#F7B6C6"/><path d="M89 30 L87 40 L79 36Z" fill="#F7B6C6"/>`;
      break;
    case 'bunny':
      ears = `<ellipse cx="46" cy="16" rx="8" ry="22" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/><ellipse cx="74" cy="16" rx="8" ry="22" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/><ellipse cx="46" cy="18" rx="3.5" ry="13" fill="#F7B6C6"/><ellipse cx="74" cy="18" rx="3.5" ry="13" fill="#F7B6C6"/>`;
      break;
    case 'horn':
      ears = `<path d="M44 36 Q42 18 52 22 Q52 30 54 34Z" fill="#FFE59A" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M76 36 Q78 18 68 22 Q68 30 66 34Z" fill="#FFE59A" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'droop':
      ears = `<ellipse cx="26" cy="54" rx="9" ry="15" transform="rotate(25 26 54)" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/><ellipse cx="94" cy="54" rx="9" ry="15" transform="rotate(-25 94 54)" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/>`;
      break;
  }
  let pattern = '';
  if (av.pattern === 'split') {
    pattern = `<path d="M30 58 Q36 36 60 34 Q84 36 90 58 Q84 52 72 52 Q64 52 60 44 Q56 52 48 52 Q36 52 30 58Z" fill="#7DA7D9" stroke="${ink}" stroke-width="2"/>`;
  }
  const blush = av.pattern === 'cheek' ? '#F58FA9' : '#F9B8C8';
  let eyes, mouth, extra = '';
  switch (av.face) {
    case 'smile':
      eyes = `<path d="M44 70 Q48 64 52 70" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="M68 70 Q72 64 76 70" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
      mouth = `<path d="M54 80 Q60 88 66 80 Z" fill="#E86F7F" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>`;
      break;
    case 'teary':
      eyes = `<ellipse cx="48" cy="69" rx="4.2" ry="5.2" fill="${ink}"/><ellipse cx="72" cy="69" rx="4.2" ry="5.2" fill="${ink}"/><circle cx="49.5" cy="67" r="1.6" fill="#fff"/><circle cx="73.5" cy="67" r="1.6" fill="#fff"/>`;
      mouth = `<path d="M55 84 Q60 79 65 84" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
      extra = `<path d="M43 74 Q41 82 44 86 Q47 82 45 74Z" fill="#9FD3F5"/><path d="M77 74 Q79 82 76 86 Q73 82 75 74Z" fill="#9FD3F5"/>`;
      break;
    case 'serious':
      eyes = `<ellipse cx="48" cy="70" rx="3.6" ry="4.4" fill="${ink}"/><ellipse cx="72" cy="70" rx="3.6" ry="4.4" fill="${ink}"/><path d="M42 61 L53 63" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/><path d="M78 61 L67 63" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
      mouth = `<path d="M55 82 L65 82" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
      break;
    default:
      eyes = `<ellipse cx="48" cy="70" rx="3.8" ry="4.6" fill="${ink}"/><ellipse cx="72" cy="70" rx="3.8" ry="4.6" fill="${ink}"/><circle cx="49.2" cy="68.4" r="1.3" fill="#fff"/><circle cx="73.2" cy="68.4" r="1.3" fill="#fff"/>`;
      mouth = `<path d="M56 80 Q58 83 60 80 Q62 83 64 80" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  const bg = opt.bg ? `<rect x="0" y="0" width="120" height="120" rx="${opt.rx || 0}" fill="${opt.bg}"/>` : '';
  return `<svg class="${opt.cls || 'avatar'}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="수험자 증명사진">${bg}${ears}
<path d="M60 30 C88 30 104 50 104 76 C104 100 86 112 60 112 C34 112 16 100 16 76 C16 50 32 30 60 30Z" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/>
${pattern}<ellipse cx="38" cy="80" rx="7" ry="4.2" fill="${blush}" opacity=".85"/><ellipse cx="82" cy="80" rx="7" ry="4.2" fill="${blush}" opacity=".85"/>${eyes}${mouth}${extra}</svg>`;
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
