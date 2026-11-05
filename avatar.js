// 계급별 아바타(반신 일러스트)·계급장 SVG. level은 rank.js의 RANKS 인덱스(0~11).
// 낮은 계급: 창백·다크서클·눈밑 처짐·미간 주름·수염 그늘·굳은 입 / 높은 계급: 혈색·미소·피부 광택·광채.
const MAX_LEVEL = 11;

function starPath(cx, cy, r) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI * i / 5 - Math.PI / 2;
    const d = i % 2 ? r * 0.4 : r;
    return `${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join('L')}Z`;
}

function faceSvg(level) {
  const t = level / MAX_LEVEL;
  const id = (name) => `${name}${level}`; // 같은 화면에 여러 개 그려도 id가 겹치지 않게
  const [h, s, l] = [60 - 32 * t, 15 + 60 * t, 62 + 18 * t];
  const skin = `hsl(${h} ${s}% ${l}%)`;
  const shade = `hsl(${h} ${s}% ${l - 14}%)`;
  const deep = `hsl(${h} ${s}% ${l - 28}%)`;
  const lid = 43 + 3 * (1 - t); // 위 눈꺼풀 높이 (클수록 처짐)
  const darkCircle = Math.max(0, 0.6 - level * 0.07);
  const bag = Math.max(0, 0.5 - level * 0.07);
  const furrow = Math.max(0, 0.5 - level * 0.06);
  const stubble = Math.max(0, 0.3 - level * 0.035);
  const gloss = t * 0.25;
  const browInner = 38 + 5 * (1 - t); // 낮을수록 찡그림
  const c = -3 + 9 * t; // 입꼬리 (음수 = 처짐, 양수 = 미소)
  const uniform = level >= 8 ? '#1f2d3d' : '#4b5320';
  const mouth = level >= 6
    ? `<path d="M42 74Q50 ${74 + c * 0.5} 58 74Q50 ${77.5 + c * 1.5} 42 74Z" fill="#f6f1ea" stroke="#8b3a3a" stroke-width="1.2" stroke-linejoin="round"/>`
    : `<path d="M42 74Q50 ${74 + c} 58 74" fill="none" stroke="#7a3b3b" stroke-width="2" stroke-linecap="round"/><ellipse cx="50" cy="77.5" rx="5" ry="1.5" fill="#b4636a" opacity=".45"/>`;
  const almond = `M31 49Q38 ${lid} 45 49Q38 54 31 49Z`;
  return `<svg viewBox="0 6 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <clipPath id="${id('c')}"><circle cx="50" cy="56" r="50"/></clipPath>
  <linearGradient id="${id('s')}"><stop offset="0" stop-color="${shade}"/><stop offset=".22" stop-color="${skin}"/><stop offset=".78" stop-color="${skin}"/><stop offset="1" stop-color="${shade}"/></linearGradient>
  <clipPath id="${id('ec')}"><path d="${almond}"/></clipPath>
  <g id="${id('eye')}">
    <path d="${almond}" fill="#f1ece4"/>
    <g clip-path="url(#${id('ec')})"><circle cx="38.5" cy="49" r="3.4" fill="#5b3a24"/><circle cx="38.5" cy="49" r="1.6" fill="#120d0a"/><circle cx="39.6" cy="48" r=".8" fill="#fff"/></g>
    <path d="M31 49Q38 ${lid} 45 49" fill="none" stroke="#2a1d17" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M32 54Q38 59.5 44 54" fill="none" stroke="${deep}" stroke-width="1.2" opacity="${bag}"/>
    <ellipse cx="38" cy="55" rx="7" ry="3.2" fill="#4a3a6a" opacity="${darkCircle}"/>
    <path d="M30 41Q38 37.5 46 ${browInner}" fill="none" stroke="#2b211c" stroke-width="2.4" stroke-linecap="round"/>
  </g>
</defs>
<g clip-path="url(#${id('c')})">
  <rect x="0" y="6" width="100" height="100" fill="${level >= 8 ? 'hsl(38 45% 22%)' : `hsl(215 25% ${20 + t * 10}%)`}"/>
  ${level >= 8 ? `<circle cx="50" cy="50" r="44" fill="#facc15" opacity="${0.18 + (level - 8) * 0.1}"/>` : ''}
  <path d="M2 112C2 98 20 93 36 92L64 92C80 93 98 98 98 112Z" fill="${uniform}"/>
  ${level >= 8 ? '<rect x="9" y="97" width="18" height="4" rx="1" fill="#facc15"/><rect x="73" y="97" width="18" height="4" rx="1" fill="#facc15"/>' : ''}
  <path d="M39 80L39 96Q50 102 61 96L61 80Z" fill="${shade}"/>
  <ellipse cx="50" cy="89" rx="13" ry="5" fill="${deep}" opacity=".35"/>
  <path d="M37 92L50 108L63 92L58 91L50 100L42 91Z" fill="#e5e7eb"/>
  <ellipse cx="27" cy="52" rx="3.5" ry="6" fill="${skin}" stroke="${shade}" stroke-width=".8"/>
  <ellipse cx="73" cy="52" rx="3.5" ry="6" fill="${skin}" stroke="${shade}" stroke-width=".8"/>
  <path d="M27 46C27 26 37 15 50 15C63 15 73 26 73 46C73 62 66 80 50 88C34 80 27 62 27 46Z" fill="url(#${id('s')})"/>
  <path d="M31 66C33 82 42 88 50 88C58 88 67 82 69 66C62 76 38 76 31 66Z" fill="#3a332e" opacity="${stubble}"/>
  <path d="M25 48C21 22 35 9 50 9C65 9 79 22 75 48C73 40 70 33 65 30C58 33 42 33 35 30C30 33 27 40 25 48Z" fill="#2a2522"/>
  <path d="M40 14Q52 11 62 16" fill="none" stroke="#5a4d44" stroke-width="1.5" opacity=".6"/>
  <path d="M40 35Q50 33 60 35M47.5 38.5L47.5 44M52.5 38.5L52.5 44" fill="none" stroke="${deep}" stroke-width="1" opacity="${furrow}"/>
  <use href="#${id('eye')}"/>
  <use href="#${id('eye')}" transform="translate(100 0) scale(-1 1)"/>
  <path d="M45 48Q43 60 41 63M55 48Q57 60 59 63M44 64.5Q50 69 56 64.5" fill="none" stroke="${deep}" stroke-width="1.2" stroke-linecap="round" opacity=".4"/>
  <ellipse cx="43.5" cy="65" rx="1.4" ry=".8" fill="#2a1d17" opacity=".5"/>
  <ellipse cx="56.5" cy="65" rx="1.4" ry=".8" fill="#2a1d17" opacity=".5"/>
  <path d="M40 65Q37 72 39 78M60 65Q63 72 61 78" fill="none" stroke="${deep}" stroke-width="1" opacity="${bag}"/>
  <ellipse cx="33" cy="64" rx="6" ry="4" fill="#f87171" opacity="${level >= 3 ? t * 0.35 : 0}"/>
  <ellipse cx="67" cy="64" rx="6" ry="4" fill="#f87171" opacity="${level >= 3 ? t * 0.35 : 0}"/>
  ${mouth}
  <ellipse cx="35" cy="60" rx="5" ry="3" fill="#fff" opacity="${gloss}"/>
  <ellipse cx="65" cy="60" rx="5" ry="3" fill="#fff" opacity="${gloss}"/>
  <ellipse cx="50" cy="36" rx="8" ry="2.5" fill="#fff" opacity="${gloss}"/>
</g>
${level === MAX_LEVEL ? '<circle cx="50" cy="56" r="48.5" fill="none" stroke="#facc15" stroke-width="3"/>' : ''}
${level >= 9 ? `<path d="${starPath(14, 24, 6)}" fill="#fde68a"/><path d="${starPath(88, 32, 6)}" fill="#fde68a"/>` : ''}
</svg>`;
}

// 병: 가로줄 1~4 / 부사관: 쉐브론 1~3 / 장교: 별 1~3 / 대장: 별 4
function badgeSvg(level) {
  let bg = '#4b5563';
  let mark = '<circle cx="20" cy="20" r="8" fill="none" stroke="#9ca3af" stroke-dasharray="3 3"/>';
  if (level >= 1 && level <= 4) {
    mark = Array.from({ length: level }, (_, i) => `<rect x="8" y="${30 - i * 7}" width="24" height="4" rx="1" fill="#e5e7eb"/>`).join('');
  } else if (level >= 5 && level <= 7) {
    bg = '#1d4ed8';
    mark = Array.from({ length: level - 4 }, (_, i) => {
      const y = 32 - i * 9;
      return `<path d="M8 ${y}L20 ${y - 8}L32 ${y}" fill="none" stroke="#e5e7eb" stroke-width="3"/>`;
    }).join('');
  } else if (level >= 8) {
    bg = '#a16207';
    const n = level === MAX_LEVEL ? 4 : level - 7;
    // 글자(★) 대신 path로 그려 폰트에 따라 깨지지 않게 한다. 4개는 2×2.
    const spots = { 1: [[20, 20]], 2: [[12, 20], [28, 20]], 3: [[9, 22], [20, 22], [31, 22]], 4: [[12, 12], [28, 12], [12, 28], [28, 28]] }[n];
    const r = { 1: 9, 2: 8, 3: 5.5, 4: 7 }[n];
    mark = spots.map(([x, y]) => `<path d="${starPath(x, y, r)}" fill="#fde68a"/>`).join('');
  }
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="${bg}"/>${mark}</svg>`;
}

if (typeof module !== 'undefined') module.exports = { faceSvg, badgeSvg };
