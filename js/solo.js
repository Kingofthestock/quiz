/* 개인전 화면들
 *  - renderSoloSelect: 카테고리 선택 (8개 + 혼합)
 *  - renderSoloPlay  : 10문제 진행
 *  - renderSoloResult: 결과 + 응원 + 공유 + 다시하기
 */

const SOLO_TOTAL = window.QUIZ_QUESTION_COUNT || 10;

/* ───────────────── 카테고리 선택 ───────────────── */
function renderSoloSelect() {
  const cats = window.QUIZ_CATEGORIES;
  const items = cats
    .map(
      (c) => `
      <button class="cat-card ${c.cls}" data-id="${c.id}">
        <span class="icon">${c.icon}</span>
        <span class="name">${c.name}</span>
      </button>`
    )
    .join('');

  document.getElementById('app').innerHTML = `
    <a class="nav-back" href="#/">← 홈으로</a>
    <section class="card card-pad-lg fade-in">
      <h1 class="title-lg center-text">카테고리를 골라주세요</h1>
      <p class="subtitle center-text" style="margin-top:8px">한 판은 10문제예요</p>

      <div class="cat-grid" style="margin-top:24px">
        ${items}
        <button class="cat-card mix" data-id="mix">
          <span class="icon">🎲</span>
          <span class="name">혼합</span>
        </button>
      </div>
    </section>
  `;

  document.querySelectorAll('.cat-card').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      GameState.mode = 'solo';
      GameState.categoryId = id;
      navigate('/solo/play');
    });
  });
}

/* ───────────────── 게임 화면 ───────────────── */
function renderSoloPlay() {
  // 카테고리 없으면 선택 화면으로
  if (!GameState.categoryId) {
    navigate('/solo/select');
    return;
  }

  // 새 판이거나 이어가는 판이거나
  if (GameState.questions.length === 0) {
    GameState.resetGameOnly();
    GameState.questions = pickQuestions(GameState.categoryId, SOLO_TOTAL);
    if (GameState.questions.length === 0) {
      // 데이터 누락 방어
      document.getElementById('app').innerHTML = `
        <a class="nav-back" href="#/">← 홈으로</a>
        <div class="card card-pad-lg fade-in center-text">
          <p>문제를 불러오지 못했어요.</p>
          <button class="btn btn-primary" style="margin-top:16px" onclick="navigate('/solo/select')">카테고리 다시 고르기</button>
        </div>
      `;
      return;
    }
  }

  paintCurrentQuestion();
}

function paintCurrentQuestion() {
  const idx = GameState.currentIndex;
  const total = GameState.questions.length;
  const q = GameState.questions[idx];
  const catMeta = getCategoryMeta(q._cat) || getCategoryMeta(GameState.categoryId);
  const progressPct = Math.round((idx / total) * 100);

  const choicesHtml = q.choices
    .map(
      (c, i) => `
      <button class="choice" data-i="${i}" type="button">
        <span class="badge">${String.fromCharCode(65 + i)}</span>
        <span class="text">${escapeHtml(c)}</span>
      </button>`
    )
    .join('');

  document.getElementById('app').innerHTML = `
    <a class="nav-back" id="quitBtn" href="javascript:void(0)">← 그만두기</a>

    <div class="progress" aria-label="진행 상황">
      <div class="progress-bar"><span style="width:${progressPct}%"></span></div>
      <span class="progress-num">${idx + 1} / ${total}</span>
    </div>

    <section class="card card-pad-lg fade-in" aria-live="polite">
      <p class="q-meta">${catMeta.icon} ${catMeta.name}${GameState.categoryId === 'mix' ? ' (혼합)' : ''}</p>
      <h2 class="question" style="margin-top:8px">${escapeHtml(q.q)}</h2>

      <div class="choices" id="choices">
        ${choicesHtml}
      </div>

      <div id="explanation" style="display:none"></div>
      <div id="nextWrap" style="display:none; margin-top:20px">
        <button class="btn btn-primary btn-lg btn-block" id="nextBtn">
          ${idx + 1 === total ? '결과 보기 →' : '다음 문제 →'}
        </button>
      </div>
    </section>
  `;

  document.querySelectorAll('#choices .choice').forEach((btn) => {
    btn.addEventListener('click', () => handleChoice(parseInt(btn.dataset.i, 10)));
  });
  document.getElementById('quitBtn').addEventListener('click', () => {
    if (confirm('지금까지의 진행이 사라집니다. 그만두시겠어요?')) {
      GameState.resetGameOnly();
      navigate('/');
    }
  });
}

function handleChoice(selectedIdx) {
  const q = GameState.questions[GameState.currentIndex];
  const correct = selectedIdx === q.answer;

  GameState.answers.push({ correct, selected: selectedIdx });
  if (correct) GameState.score += 1;

  // 버튼 상태 업데이트
  const btns = document.querySelectorAll('#choices .choice');
  btns.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('correct');
    else if (i === selectedIdx) b.classList.add('incorrect');
    else b.classList.add('dim');
  });

  // 해설
  if (q.ex) {
    const ex = document.getElementById('explanation');
    ex.className = 'explanation';
    ex.innerHTML = `<span class="label">${correct ? '정답!' : '아쉬워요'}</span>${escapeHtml(q.ex)}`;
    ex.style.display = 'block';
  }

  // 다음 버튼 노출
  const nextWrap = document.getElementById('nextWrap');
  nextWrap.style.display = 'block';
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.focus();
  nextBtn.addEventListener('click', goNext);
}

function goNext() {
  if (GameState.currentIndex + 1 >= GameState.questions.length) {
    navigate('/solo/result');
  } else {
    GameState.currentIndex += 1;
    paintCurrentQuestion();
  }
}

/* ───────────────── 결과 화면 ───────────────── */
function renderSoloResult() {
  if (!GameState.categoryId || GameState.answers.length === 0) {
    navigate('/');
    return;
  }
  const total = GameState.questions.length;
  const score = GameState.score;
  const cat = getCategoryMeta(GameState.categoryId);
  const msg = getScoreMessage(score);

  document.getElementById('app').innerHTML = `
    <a class="nav-back" href="#/">← 홈으로</a>
    <section class="card card-pad-lg fade-in result-hero">
      <div class="emoji-xl">${msg.emoji}</div>
      <p class="subtitle" style="margin-top:8px">카테고리: ${cat.icon} ${cat.name}</p>
      <div class="result-score">${score}<span class="of"> / ${total}</span></div>
      <h2 class="title-lg" style="margin-top:8px">${escapeHtml(msg.title)}</h2>
      <p class="result-message">${escapeHtml(msg.sub)}</p>

      <div class="result-actions">
        <button class="btn btn-primary btn-lg" id="againSame">같은 카테고리 다시</button>
        <button class="btn btn-ghost btn-lg" id="againOther">카테고리 바꾸기</button>
      </div>
      <button class="btn btn-ghost btn-block" id="shareBtn" style="margin-top:12px">🔗 결과 공유 (URL 복사)</button>
    </section>
  `;

  document.getElementById('againSame').addEventListener('click', () => {
    GameState.resetGameOnly();
    navigate('/solo/play');
  });
  document.getElementById('againOther').addEventListener('click', () => {
    GameState.resetGameOnly();
    GameState.categoryId = null;
    navigate('/solo/select');
  });
  document.getElementById('shareBtn').addEventListener('click', async () => {
    const url = buildShareUrl({
      score,
      total,
      category: GameState.categoryId,
    });
    const ok = await copyText(url);
    showToast(ok ? '링크를 복사했어요! 친구에게 공유해보세요' : '복사에 실패했어요');
  });
}

/* ───────────────── 유틸 ───────────────── */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

window.renderSoloSelect = renderSoloSelect;
window.renderSoloPlay = renderSoloPlay;
window.renderSoloResult = renderSoloResult;
