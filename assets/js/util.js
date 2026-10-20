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

/* 얼굴 그리기. o: { lx, rx, ey, by, my, mood, s } — 눈 x 두 개, 눈 y, 볼 y, 입 y, 크기 배율 */
CN.drawFace = function (o) {
  const ink = CN.avatarInk;
  const s = o.s || 1;
  const sw = (w) => (w * s).toFixed(2);
  const line = `stroke="${ink}" stroke-width="${sw(2.2)}" stroke-linecap="round" stroke-linejoin="round"`;
  const eye = (cx, cy, k) => `<ellipse cx="${cx}" cy="${cy}" rx="${4.8 * s * k}" ry="${5.8 * s * k}" fill="${ink}"/><circle cx="${cx + 1.5 * s}" cy="${cy - 2.1 * s}" r="${2 * s * k}" fill="#fff"/><circle cx="${cx - 1.6 * s}" cy="${cy + 2.3 * s}" r="${0.9 * s}" fill="#fff"/>`;
  const brow = (cx, dir, dy) => `<path d="M${cx - 5 * s * dir} ${o.ey - (10 + (dy || 0)) * s} Q${cx} ${o.ey - (12.5 + (dy || 0)) * s} ${cx + 5 * s * dir} ${o.ey - (11 + (dy || 0)) * s}" fill="none" stroke="${ink}" stroke-width="${sw(1.7)}" stroke-linecap="round"/>`;
  const blush = (cx) => `<ellipse cx="${cx}" cy="${o.by}" rx="${8.5 * s}" ry="${5.2 * s}" fill="${o.blush || '#F7A1B4'}"/>` +
    `<path d="M${cx - 4.5 * s} ${o.by + 3 * s} L${cx - 2 * s} ${o.by - 3 * s} M${cx - 0.5 * s} ${o.by + 3 * s} L${cx + 2 * s} ${o.by - 3 * s} M${cx + 3.5 * s} ${o.by + 3 * s} L${cx + 6 * s} ${o.by - 3 * s}" stroke="${ink}" stroke-width="${sw(1.2)}" stroke-linecap="round"/>`;
  const cat = (y) => `<path d="M${o.mx - 5 * s} ${y} Q${o.mx - 2.5 * s} ${y + 3.5 * s} ${o.mx} ${y} Q${o.mx + 2.5 * s} ${y + 3.5 * s} ${o.mx + 5 * s} ${y}" fill="none" stroke="${ink}" stroke-width="${sw(2)}" stroke-linecap="round"/>`;
  const closed = (cx) => `<path d="M${cx - 6 * s} ${o.ey} Q${cx} ${o.ey - 7 * s} ${cx + 6 * s} ${o.ey}" fill="none" stroke="${ink}" stroke-width="${sw(2.8)}" stroke-linecap="round"/>`;
  const cheeks = o.cheeks === false ? '' : blush(o.lx - 16 * s) + blush(o.rx + 16 * s);
  let f = '';
  switch (o.mood) {
    case 'smile':
      f = closed(o.lx) + closed(o.rx) + `<path d="M${o.mx - 6 * s} ${o.my - 1 * s} Q${o.mx} ${o.my + 9 * s} ${o.mx + 6 * s} ${o.my - 1 * s} Z" fill="#E66A7E" ${line}/>`;
      break;
    case 'teary':
      f = eye(o.lx, o.ey - 1 * s, 1.16) + eye(o.rx, o.ey - 1 * s, 1.16) + brow(o.lx, 1, 1) + brow(o.rx, -1, 1) +
        `<path d="M${o.mx - 6 * s} ${o.my + 4 * s} Q${o.mx - 3 * s} ${o.my + 1 * s} ${o.mx} ${o.my + 4 * s} Q${o.mx + 3 * s} ${o.my + 1 * s} ${o.mx + 6 * s} ${o.my + 4 * s}" fill="none" stroke="${ink}" stroke-width="${sw(2)}" stroke-linecap="round"/>` +
        `<path d="M${o.lx - 6 * s} ${o.ey + 5 * s} Q${o.lx - 9 * s} ${o.ey + 13 * s} ${o.lx - 5 * s} ${o.ey + 17 * s} Q${o.lx - 1 * s} ${o.ey + 13 * s} ${o.lx - 4 * s} ${o.ey + 5 * s}Z" fill="#9CD3F4"/>` +
        `<path d="M${o.rx + 6 * s} ${o.ey + 5 * s} Q${o.rx + 9 * s} ${o.ey + 13 * s} ${o.rx + 5 * s} ${o.ey + 17 * s} Q${o.rx + 1 * s} ${o.ey + 13 * s} ${o.rx + 4 * s} ${o.ey + 5 * s}Z" fill="#9CD3F4"/>`;
      break;
    case 'serious':
      f = eye(o.lx, o.ey, 0.95) + eye(o.rx, o.ey, 0.95) +
        `<path d="M${o.lx - 8 * s} ${o.ey - 11 * s} L${o.lx + 6 * s} ${o.ey - 8 * s}" ${line}/><path d="M${o.rx + 8 * s} ${o.ey - 11 * s} L${o.rx - 6 * s} ${o.ey - 8 * s}" ${line}/>` +
        `<path d="M${o.mx - 5 * s} ${o.my + 1 * s} L${o.mx + 5 * s} ${o.my + 1 * s}" ${line}/>`;
      break;
    case 'sleep':
      f = `<path d="M${o.lx - 6 * s} ${o.ey} Q${o.lx} ${o.ey + 5 * s} ${o.lx + 6 * s} ${o.ey}" fill="none" stroke="${ink}" stroke-width="${sw(2.6)}" stroke-linecap="round"/>` +
        `<path d="M${o.rx - 6 * s} ${o.ey} Q${o.rx} ${o.ey + 5 * s} ${o.rx + 6 * s} ${o.ey}" fill="none" stroke="${ink}" stroke-width="${sw(2.6)}" stroke-linecap="round"/>` + cat(o.my);
      break;
    case 'sleepy':
      f = `<path d="M${o.lx - 6 * s} ${o.ey + 1 * s} L${o.lx + 6 * s} ${o.ey + 1 * s}" ${line}/><path d="M${o.rx - 6 * s} ${o.ey + 1 * s} L${o.rx + 6 * s} ${o.ey + 1 * s}" ${line}/>` +
        `<ellipse cx="${o.lx}" cy="${o.ey + 3 * s}" rx="${3.6 * s}" ry="${2.4 * s}" fill="${ink}"/><ellipse cx="${o.rx}" cy="${o.ey + 3 * s}" rx="${3.6 * s}" ry="${2.4 * s}" fill="${ink}"/>` +
        `<path d="M${o.mx - 4 * s} ${o.my + 1 * s} Q${o.mx} ${o.my + 4 * s} ${o.mx + 4 * s} ${o.my + 1 * s}" fill="none" stroke="${ink}" stroke-width="${sw(2)}" stroke-linecap="round"/>`;
      break;
    case 'shout':
      f = eye(o.lx, o.ey, 1) + eye(o.rx, o.ey, 1) + brow(o.lx, 1, 2) + brow(o.rx, -1, 2) +
        `<path d="M${o.mx - 7 * s} ${o.my - 2 * s} Q${o.mx} ${o.my + 14 * s} ${o.mx + 7 * s} ${o.my - 2 * s} Z" fill="#E66A7E" ${line}/>`;
      break;
    default:
      f = eye(o.lx, o.ey, 1) + eye(o.rx, o.ey, 1) + brow(o.lx, 1) + brow(o.rx, -1) + cat(o.my);
  }
  return cheeks + f;
};

/* 증명사진 캐릭터의 SVG 내부 요소 (viewBox 0 0 120 120) */
CN.avatarInner = function (av, opt) {
  av = Object.assign({}, CN.defaultAvatar, av || {});
  const P = CN.avatarParts;
  const ink = CN.avatarInk;
  const line = `stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
  const head = 'M60 34 C86 33 108 48 109 76 C110 100 92 116 60 116 C29 116 10 101 11 77 C12 49 33 35 60 34Z';
  const face = (mood, extra) => CN.drawFace(Object.assign({ lx: 44, rx: 76, ey: 80, by: 88, my: 89, mx: 60, mood, blush: av.pattern === 'cheek' ? '#F27D98' : '#F7A1B4' }, extra || {}));
  const pawsOf = (fill) => `<path d="M40 117 C36 111 38 105 44 105 C48 105 49 109 47 112" fill="${fill}" ${line}/><path d="M80 117 C84 111 82 105 76 105 C72 105 71 109 73 112" fill="${fill}" ${line}/>`;
  const paws = (fill) => (opt && opt.noPaws ? '' : pawsOf(fill));

  /* 작중 인물 전용 얼굴 (명부·운세에 쓰임) */
  if (av.kind === 'kurimanju') {
    const fill = '#FFF0D2';
    return `<path d="${head}" fill="${fill}" ${line}/>` +
      `<path d="M11 74 C12 48 33 35 60 34 C86 33 108 48 109 74 C100 66 92 70 84 64 C76 70 68 64 60 68 C52 64 44 70 36 64 C28 70 20 66 11 74Z" fill="#C98A4B" ${line}/>` +
      `<path d="M40 46 Q48 42 54 46 M66 44 Q74 40 82 45" fill="none" stroke="#8E5A2B" stroke-width="2" stroke-linecap="round"/>` +
      face(av.face === 'normal' ? 'sleepy' : av.face, { ey: 84, by: 92, my: 94 }) + paws(fill);
  }
  if (av.kind === 'shisa') {
    const fill = '#FFE3B5';
    const mane = [[18, 66], [22, 52], [32, 42], [46, 36], [60, 34], [74, 36], [88, 42], [98, 52], [102, 66]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#E59A4E" ${line}/>`).join('');
    return `${mane}<path d="${head}" fill="${fill}" ${line}/>` +
      `<path d="M30 54 Q34 46 42 48 M78 48 Q86 46 90 54" fill="none" stroke="#C9772F" stroke-width="2.4" stroke-linecap="round"/>` +
      face(av.face === 'normal' ? 'smile' : av.face) + paws(fill);
  }
  if (av.kind === 'rakko') {
    const fill = '#EAD7BC';
    return `<path d="M24 50 C18 40 24 32 33 34 C37 36 39 40 39 43" fill="${fill}" ${line}/><path d="M96 50 C102 40 96 32 87 34 C83 36 81 40 81 43" fill="${fill}" ${line}/>` +
      `<path d="${head}" fill="${fill}" ${line}/><ellipse cx="60" cy="92" rx="30" ry="18" fill="#F6EBDB"/>` +
      `<path d="M36 60 L46 70 M46 60 L36 70" stroke="#B06A57" stroke-width="2.6" stroke-linecap="round"/>` +
      face(av.face === 'normal' ? 'serious' : av.face) + paws(fill);
  }

  if (av.kind === 'kani') {
    const fill = '#FAD1DA';
    return `<path d="M26 52 C20 44 22 36 30 36 C34 37 36 40 36 43" fill="${fill}" ${line}/><path d="M94 52 C100 44 98 36 90 36 C86 37 84 40 84 43" fill="${fill}" ${line}/>` +
      `<path d="${head}" fill="${fill}" ${line}/>` +
      `<path d="M30 46 Q60 30 90 46" fill="none" stroke="#D9534F" stroke-width="4" stroke-linecap="round"/>` +
      `<ellipse cx="60" cy="30" rx="15" ry="9" fill="#E8584F" ${line}/><path d="M53 22 V16 M67 22 V16" ${line}/><circle cx="53" cy="15" r="2.6" fill="${ink}"/><circle cx="67" cy="15" r="2.6" fill="${ink}"/>` +
      `<path d="M44 30 C34 30 32 20 38 16 C40 22 44 22 46 20" fill="#E8584F" ${line}/><path d="M76 30 C86 30 88 20 82 16 C80 22 76 22 74 20" fill="#E8584F" ${line}/>` +
      face(av.face === 'normal' ? 'smile' : av.face) + paws(fill);
  }

  const fill = (P.body.find((b) => b.id === av.body) || P.body[0]).fill;
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
  const hoodPath = hood ? `<path d="M12 72 C13 48 33 35 60 34 C86 33 107 48 108 72 C102 62 92 58 82 60 C72 61 64 56 60 47 C56 56 48 61 38 60 C28 58 18 62 12 72Z" fill="${hoodFill}" ${line}/>` : '';
  return `${ears}<path d="${head}" fill="${fill}" ${line}/>${hoodPath}${face(av.face)}${paws(fill)}`;
};

CN.avatarSVG = function (av, opt) {
  opt = opt || {};
  const bg = opt.bg ? `<rect x="0" y="0" width="120" height="120" rx="${opt.rx || 0}" fill="${opt.bg}"/>` : '';
  return `<svg class="${opt.cls || 'avatar'}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opt.label || '수험자 증명사진'}">${bg}${CN.avatarInner(av)}</svg>`;
};

/* 전신 캐릭터 (viewBox 0 0 120 130). kind: chiikawa | hachiware | usagi */
CN.charaSVG = function (kind, mood, opt) {
  opt = opt || {};
  const ink = CN.avatarInk;
  const line = `stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
  const fill = kind === 'usagi' ? '#FCEBA6' : '#FFFFFF';
  const body = 'M60 20 C93 20 111 40 109 66 C108 78 103 86 96 91 C100 101 99 112 91 118 Q85 123 78 119 Q72 124 66 119 L54 119 Q48 124 42 119 Q35 123 29 118 C21 112 20 101 24 91 C17 86 12 78 11 66 C9 40 27 20 60 20Z';
  const arms = `<path d="M27 92 Q16 95 18 104 Q23 107 29 101" fill="${fill}" ${line}/><path d="M93 92 Q104 95 102 104 Q97 107 91 101" fill="${fill}" ${line}/>`;
  let back = '', top = '';
  if (kind === 'chiikawa') {
    back = `<path d="M30 30 C24 20 32 12 40 16 C43 18 44 21 44 24" fill="${fill}" ${line}/><path d="M90 30 C96 20 88 12 80 16 C77 18 76 21 76 24" fill="${fill}" ${line}/>` +
      `<path d="M100 112 Q110 112 108 104 Q104 102 99 106" fill="${fill}" ${line}/>`;
  } else if (kind === 'hachiware') {
    const blue = '#4A6FAE';
    back = `<path d="M24 34 C22 22 24 10 28 4 C36 8 44 14 50 20" fill="${blue}" ${line}/><path d="M96 34 C98 22 96 10 92 4 C84 8 76 14 70 20" fill="${blue}" ${line}/>` +
      `<path d="M26 112 Q12 116 8 106 Q12 100 24 104" fill="${blue}" ${line}/>`;
    top = `<path d="M12 58 C12 36 30 20 60 20 C90 20 108 36 108 58 C102 48 92 44 82 46 C72 48 65 42 60 32 C55 42 48 48 38 46 C28 44 18 48 12 58Z" fill="${blue}" ${line}/>`;
  } else if (kind === 'usagi') {
    back = `<path d="M42 26 C36 10 36 -10 44 -12 C52 -12 52 8 52 24" fill="${fill}" ${line}/><path d="M68 24 C68 8 68 -12 76 -12 C84 -10 84 10 78 26" fill="${fill}" ${line}/>` +
      `<path d="M44 18 C41 8 42 -4 45 -6 C48 -4 48 8 48 18Z" fill="#F4A3B5"/><path d="M72 18 C72 8 72 -4 75 -6 C78 -4 79 8 76 18Z" fill="#F4A3B5"/>` +
      `<path d="M100 112 Q112 114 110 104 Q105 101 99 106" fill="${fill}" ${line}/>`;
  }
  const face = CN.drawFace({ lx: 44, rx: 76, ey: 62, by: 70, my: 71, mx: 60, mood: mood || 'normal' });
  const vb = kind === 'usagi' ? '0 -16 120 146' : '0 0 120 130';
  return `<svg class="${opt.cls || 'chara'}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opt.label || ''}" data-kind="${kind}">${back}<path d="${body}" fill="${fill}" ${line}/>${top}${arms}${face}</svg>`;
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
