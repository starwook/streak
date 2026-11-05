// 계급·점수 로직. DOM 의존 없음 (나중에 채팅방/서버에서 재사용).
const DAY = 86400000;
const MIN_GOAL = 7;
const RANKS = [
  { name: '훈련병', min: 0 },
  { name: '이병', min: 7 },
  { name: '일병', min: 21 },
  { name: '상병', min: 45 },
  { name: '병장', min: 90 },
  { name: '하사', min: 150 },
  { name: '중사', min: 250 },
  { name: '상사', min: 400 },
  { name: '소위', min: 600 },
  { name: '대위', min: 900 },
  { name: '소령', min: 1300 },
  { name: '대장', min: 2000 },
];

function rankOf(score) {
  let level = 0;
  RANKS.forEach((r, i) => { if (score >= r.min) level = i; });
  const cur = RANKS[level];
  const next = RANKS[level + 1];
  return {
    level,
    name: cur.name,
    next: next && next.name,
    toNext: next ? next.min - score : 0,
    pct: next ? Math.floor((score - cur.min) / (next.min - cur.min) * 100) : 100,
  };
}

// 점수 대상: 목표가 있는 항목
function scorable(item) { return item.goal > 0; }

// 포기(목표 전 리셋/삭제) 시 깎일 점수. 이미 달성한 항목은 0.
function penaltyOf(item) { return scorable(item) && !item.awarded ? item.goal : 0; }

// 점수 하한은 0
function lose(meta, item) { meta.score = Math.max(0, meta.score - penaltyOf(item)); }

// 등록 후 목표 일수가 실제로 지난 항목에 점수 지급(1회). 바뀌었으면 true.
function settle(items, meta, now = Date.now()) {
  let changed = false;
  items.forEach((it) => {
    if (scorable(it) && !it.awarded && now - it.createdAt >= it.goal * DAY) {
      it.awarded = true;
      meta.score += it.goal;
      changed = true;
    }
  });
  if (changed) meta.peakLevel = Math.max(meta.peakLevel, rankOf(meta.score).level);
  return changed;
}

if (typeof module !== 'undefined') module.exports = { RANKS, MIN_GOAL, rankOf, scorable, penaltyOf, lose, settle };
