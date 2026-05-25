/* 게임 상태 관리 (단일 객체)
 * 라우터 화면 사이에 공유되는 인-메모리 상태
 */

window.GameState = {
  mode: null,         // 'solo' | 'multi'
  categoryId: null,   // 'spelling' | 'mix' | ...
  questions: [],      // 현재 판의 문제 10개 (셔플된 카피)
  currentIndex: 0,
  answers: [],        // [{ correct: boolean, selected: number }]
  score: 0,

  reset() {
    this.mode = null;
    this.categoryId = null;
    this.questions = [];
    this.currentIndex = 0;
    this.answers = [];
    this.score = 0;
  },

  resetGameOnly() {
    this.questions = [];
    this.currentIndex = 0;
    this.answers = [];
    this.score = 0;
  },
};

/* 배열 셔플 (Fisher–Yates) */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 카테고리 ID로 문제 가져오기 (mix는 8개 카테고리에서 섞음)
 * count개를 뽑아 반환. 부족하면 가능한 만큼만.
 */
function pickQuestions(categoryId, count) {
  if (categoryId === 'mix') {
    const all = [];
    Object.keys(window.QUIZ_DATA).forEach((id) => {
      window.QUIZ_DATA[id].forEach((q) => all.push({ ...q, _cat: id }));
    });
    return shuffle(all).slice(0, count);
  }
  const list = window.QUIZ_DATA[categoryId] || [];
  return shuffle(list).slice(0, count).map((q) => ({ ...q, _cat: categoryId }));
}

/* 카테고리 메타 찾기 (mix 포함) */
function getCategoryMeta(id) {
  if (id === 'mix') {
    return { id: 'mix', icon: '🎲', name: '혼합', cls: 'mix' };
  }
  return window.QUIZ_CATEGORIES.find((c) => c.id === id) || null;
}

window.shuffle = shuffle;
window.pickQuestions = pickQuestions;
window.getCategoryMeta = getCategoryMeta;
