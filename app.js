const KEY = 'abstain.items.v1';
const MILESTONES = [1, 7, 30, 100, 365];
const QUOTES = [
  '지금 이 순간이 가장 중요해요.',
  '충동은 파도처럼 지나가요.',
  '어제의 나보다 한 걸음 더.',
  '한 번 더 참으면 내일이 달라져요.',
  '이미 여기까지 왔어요.',
];
const DAY = 86400000;

const $ = (id) => document.getElementById(id);
let items = load();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function save() { localStorage.setItem(KEY, JSON.stringify(items)); }

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
      <div class="badges"></div>
      <div class="actions">
        <button class="reset">리셋</button>
        <button class="del">삭제</button>
      </div>
    </section>`).join('') || '<p class="meta">아래에서 첫 항목을 추가하세요.</p>';
  tick();
}

function tick() {
  document.querySelectorAll('.card').forEach((card) => {
    const it = items.find((x) => x.id === card.dataset.id);
    const ms = elapsed(it);
    const days = ms / DAY;
    const next = MILESTONES.find((d) => d > days);
    card.querySelector('.time').textContent = fmt(ms);
    card.querySelector('.meta').textContent =
      `최장 ${fmt(Math.max(it.best, ms)).split(' ').slice(0, 2).join(' ')} · 리셋 ${it.resets}회` +
      (next ? ` · 다음 목표 ${next}일` : '');
    card.querySelector('.badges').textContent =
      MILESTONES.filter((d) => d <= days).map((d) => `🏅${d}`).join(' ');
  });
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

$('add').addEventListener('submit', (e) => {
  e.preventDefault();
  const start = $('start').value ? new Date($('start').value).getTime() : Date.now();
  items.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: $('name').value.trim(), start, best: 0, resets: 0 });
  save();
  $('add').reset();
  render();
});

$('list').addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  const it = items.find((x) => x.id === card.dataset.id);
  if (e.target.classList.contains('reset') && confirm(`'${it.name}' 기록을 리셋할까요?`)) {
    it.best = Math.max(it.best, elapsed(it));
    it.resets += 1;
    it.start = Date.now();
  } else if (e.target.classList.contains('del') && confirm(`'${it.name}'을(를) 삭제할까요?`)) {
    items = items.filter((x) => x !== it);
  } else return;
  save();
  render();
});

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(items)], { type: 'application/json' }));
  a.download = 'backup.json';
  a.click();
});

$('import').addEventListener('change', async (e) => {
  try {
    const data = JSON.parse(await e.target.files[0].text());
    if (!Array.isArray(data)) throw new Error();
    items = data;
    save();
    render();
  } catch { alert('올바른 백업 파일이 아니에요.'); }
});

$('quote').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
render();
setInterval(tick, 1000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
