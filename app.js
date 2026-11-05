// rank.js(RANKS, rankOf, settle …), avatar.js(faceSvg, badgeSvg)를 먼저 불러온다.
const KEY = 'abstain.items.v1';
const META_KEY = 'abstain.meta.v1';
const QUOTES = [
  '지금 이 순간이 가장 중요해요.',
  '충동은 파도처럼 지나가요.',
  '어제의 나보다 한 걸음 더.',
  '한 번 더 참으면 내일이 달라져요.',
  '이미 여기까지 왔어요.',
];

const $ = (id) => document.getElementById(id);
let items = load();
let meta = loadMeta();
let shownLevel = -1;

function normalize(it) { return { createdAt: it.start, awarded: false, ...it }; }
function load() {
  try { return (JSON.parse(localStorage.getItem(KEY)) || []).map(normalize); } catch { return []; }
}
function newMeta() { return { score: 0, seenLevel: 0, peakLevel: 0 }; }
function loadMeta() {
  try { return { ...newMeta(), ...JSON.parse(localStorage.getItem(META_KEY)) }; } catch { return newMeta(); }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(items));
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function elapsed(item) { return Math.max(0, Date.now() - item.start); }

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor(s % 86400 / 3600);
  const m = Math.floor(s % 3600 / 60);
  return `${d}일 ${h}시간 ${m}분 ${s % 60}초`;
}

function render() {
  $('list').innerHTML = items.map((it) => `
    <section class="card" data-id="${it.id}">
      <h2>${esc(it.name)}</h2>
      <div class="time"></div>
      <div class="meta"></div>
      <div class="goal" hidden>
        <div class="goal-text"></div>
        <progress max="100"></progress>
        <div class="stake"></div>
      </div>
      <div class="actions">
        <button class="reset">리셋</button>
        <button class="del">삭제</button>
      </div>
    </section>`).join('') || '<p class="meta">아래에서 첫 항목을 추가하세요.</p>';
  tick();
}

function tick() {
  if (settle(items, meta)) save();
  document.querySelectorAll('.card').forEach((card) => {
    const it = items.find((x) => x.id === card.dataset.id);
    const ms = elapsed(it);
    const days = ms / DAY;
    card.querySelector('.time').textContent = fmt(ms);
    card.querySelector('.meta').textContent =
      `최장 ${fmt(Math.max(it.best, ms)).split(' ').slice(0, 2).join(' ')} · 리셋 ${it.resets}회`;
    const goal = card.querySelector('.goal');
    goal.hidden = !it.goal;
    if (it.goal) {
      const pct = Math.min(100, Math.floor(days / it.goal * 100));
      goal.querySelector('.goal-text').textContent = `${Math.floor(days) + 1}일차 / 목표 ${it.goal}일 · ${pct}%`;
      goal.querySelector('progress').value = pct;
      goal.querySelector('.stake').textContent = it.awarded
        ? `달성 ✓ +${it.goal}점 획득 · 이제 리셋해도 감점 없음`
        : `달성 시 +${it.goal}점 · 포기 시 -${it.goal}점 · 지급까지 D-${Math.ceil((it.createdAt + it.goal * DAY - Date.now()) / DAY)}`;
    }
  });
  renderRank();
}

function renderRank() {
  const r = rankOf(meta.score);
  if (r.level !== shownLevel) {
    $('face').innerHTML = faceSvg(r.level);
    $('badge').innerHTML = badgeSvg(r.level);
    shownLevel = r.level;
  }
  $('rank-name').textContent = r.name;
  $('rank-meta').textContent = `${meta.score}점 · ${r.next ? `${r.next}까지 ${r.toNext}점` : '최고 계급'} · 최고 ${RANKS[meta.peakLevel].name}`;
  $('rank-bar').value = r.pct;
  if (r.level > meta.seenLevel) showLevelUp(r);
  if (r.level !== meta.seenLevel) {
    meta.seenLevel = r.level; // 강등은 조용히 반영
    save();
  }
}

function showLevelUp(r) {
  $('levelup-body').innerHTML = `<div class="face">${faceSvg(r.level)}</div><h2>${r.name} 진급!</h2>`;
  $('levelup').showModal();
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

$('add').addEventListener('submit', (e) => {
  e.preventDefault();
  let start = $('start').value ? new Date($('start').value).getTime() : Date.now();
  // iOS가 시작 시각을 분 단위로 채워 넣으면 초가 잘려 0~59초 앞서므로, 1분 이내면 지금으로 맞춘다
  if (Date.now() - start < 60000) start = Date.now();
  items.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: $('name').value.trim(),
    goal: parseInt($('goal').value, 10),
    start, createdAt: Date.now(), awarded: false, best: 0, resets: 0,
  });
  save();
  $('add').reset();
  render();
});

function confirm2(msg) {
  return confirm(msg) && confirm('정말 맞나요? 되돌릴 수 없어요.');
}

// 목표 전 포기 시 잃는 점수와 강등을 경고문으로 만든다
function giveUpNote(it) {
  const lost = Math.min(penaltyOf(it), meta.score);
  if (!lost) return '';
  const cur = rankOf(meta.score);
  const after = rankOf(meta.score - lost);
  return `\n\n목표 전 포기: -${lost}점${after.level < cur.level ? `\n${cur.name} → ${after.name} 강등` : ''}`;
}

$('list').addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  const it = items.find((x) => x.id === card.dataset.id);
  if (e.target.classList.contains('reset') && confirm2(`'${it.name}' 기록을 리셋할까요?${giveUpNote(it)}`)) {
    lose(meta, it);
    it.best = Math.max(it.best, elapsed(it));
    it.resets += 1;
    it.start = Date.now();
    if (!it.awarded) it.createdAt = it.start; // 새 도전은 처음부터 다시 센다
  } else if (e.target.classList.contains('del') && confirm2(`'${it.name}'을(를) 삭제할까요?${giveUpNote(it)}`)) {
    lose(meta, it);
    items = items.filter((x) => x !== it);
  } else return;
  save();
  render();
});

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ items, meta })], { type: 'application/json' }));
  a.download = 'backup.json';
  a.click();
});

$('import').addEventListener('change', async (e) => {
  try {
    const data = JSON.parse(await e.target.files[0].text());
    const list = Array.isArray(data) ? data : data.items; // 예전 백업은 배열
    if (!Array.isArray(list)) throw new Error();
    items = list.map(normalize);
    meta = { ...newMeta(), ...(Array.isArray(data) ? null : data.meta) };
    save();
    render();
  } catch { alert('올바른 백업 파일이 아니에요.'); }
});

$('quote').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
render();
setInterval(tick, 1000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
