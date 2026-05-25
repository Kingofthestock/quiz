/* 앱 진입점 + 해시 라우터 + 메인 화면
 *
 * 라우트:
 *  #/                메인 (모드 선택)
 *  #/solo/select     개인전 카테고리 선택
 *  #/solo/play       개인전 게임
 *  #/solo/result     개인전 결과
 *  #/result?s=...    공유로 들어온 결과 보기
 *  #/multi/...       (4단계에서 구현)
 */

const appEl = () => document.getElementById('app');

/* === 토스트 === */
let toastTimer = null;
function showToast(text, ms = 2200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}
window.showToast = showToast;

/* === 라우트 파싱 === */
function parseRoute() {
  const hash = window.location.hash || '#/';
  // 예: #/result?s=abc → path=/result, query=s=abc
  const [pathPart, queryPart] = hash.slice(1).split('?');
  const path = pathPart || '/';
  const query = {};
  if (queryPart) {
    queryPart.split('&').forEach((kv) => {
      const [k, v] = kv.split('=');
      query[decodeURIComponent(k || '')] = decodeURIComponent(v || '');
    });
  }
  return { path, query };
}

function navigate(path) {
  window.location.hash = path;
}
window.navigate = navigate;

/* === 메인 화면 (모드 선택) === */
function renderHome() {
  GameState.reset();
  appEl().innerHTML = `
    <header class="app-header">
      <div class="logo"><span class="dot"></span>상식 퀴즈</div>
      <p class="tagline">하루 한 판, 가볍게 머리 풀어볼까요?</p>
    </header>

    <section class="card card-pad-lg fade-in" aria-label="모드 선택">
      <h1 class="title-lg center-text">어떻게 풀어볼까요?</h1>
      <p class="subtitle center-text" style="margin-top:8px">모드를 선택하세요</p>

      <div class="mode-grid" style="margin-top:24px">
        <button class="mode-card" id="modeSolo" aria-label="개인전 시작">
          <div class="emoji-xl">🎯</div>
          <span class="label">개인전</span>
          <span class="desc">혼자 10문제 도전</span>
        </button>
        <button class="mode-card" id="modeMulti" aria-label="다인전 시작">
          <div class="emoji-xl">👥</div>
          <span class="label">다인전</span>
          <span class="desc">친구·봇과 함께 (준비 중)</span>
        </button>
      </div>
    </section>

    <p class="subtitle center-text muted" style="margin-top:24px; font-size:12px">
      카테고리 ${window.QUIZ_CATEGORIES.length}개 · 한 판 10문제 · PC·모바일 지원
    </p>
  `;

  document.getElementById('modeSolo').addEventListener('click', () => {
    GameState.mode = 'solo';
    navigate('/solo/select');
  });
  document.getElementById('modeMulti').addEventListener('click', () => {
    showToast('다인전은 곧 추가됩니다!');
  });
}

/* === 공유 결과 화면 (#/result?s=...) === */
function renderSharedResult(query) {
  const token = query.s;
  const data = token ? decodeResult(token) : null;

  if (!data) {
    appEl().innerHTML = `
      <a class="nav-back" href="#/">← 홈으로</a>
      <div class="card card-pad-lg fade-in center-text">
        <div class="emoji-xl">😅</div>
        <h1 class="title-lg" style="margin-top:12px">결과를 불러올 수 없어요</h1>
        <p class="subtitle" style="margin-top:8px">링크가 잘못되었거나 손상되었습니다.</p>
        <button class="btn btn-primary btn-lg" style="margin-top:24px" onclick="navigate('/')">홈으로</button>
      </div>
    `;
    return;
  }

  const { score, total, category, nickname } = data;
  const cat = getCategoryMeta(category) || { name: '알 수 없음', icon: '❓', cls: '' };
  const who = nickname ? `${nickname}님` : '친구';

  appEl().innerHTML = `
    <a class="nav-back" href="#/">← 홈으로</a>
    <section class="card card-pad-lg fade-in result-hero">
      <div class="emoji-xl">🎁</div>
      <p class="subtitle" style="margin-top:8px">${who}이(가) 보낸 결과예요</p>
      <p class="muted" style="margin-top:4px">카테고리: ${cat.icon} ${cat.name}</p>
      <div class="result-score">${score}<span class="of"> / ${total}</span></div>
      <p class="result-message">나도 한번 도전해볼까요?</p>
      <div class="result-actions">
        <button class="btn btn-primary btn-lg" onclick="GameState.mode='solo'; GameState.categoryId='${category}'; navigate('/solo/play')">같은 카테고리 도전</button>
        <button class="btn btn-ghost btn-lg" onclick="navigate('/')">처음부터</button>
      </div>
    </section>
  `;
}

/* === 라우터 === */
function router() {
  const { path, query } = parseRoute();

  if (path === '/' || path === '') {
    renderHome();
    return;
  }
  if (path === '/solo/select') {
    renderSoloSelect();
    return;
  }
  if (path === '/solo/play') {
    renderSoloPlay();
    return;
  }
  if (path === '/solo/result') {
    renderSoloResult();
    return;
  }
  if (path === '/result') {
    renderSharedResult(query);
    return;
  }
  // 알 수 없는 경로 → 홈
  navigate('/');
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
