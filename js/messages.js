/* 점수 구간별 응원 메시지
 * 각 구간에서 랜덤하게 하나 선택
 */

window.SCORE_MESSAGES = {
  0: [
    {
      title: "괜찮아요, 시작이 반이에요!",
      sub: "다음에는 분명 더 잘할 수 있어요. 같은 카테고리로 한 번 더 도전해볼까요?",
      emoji: "🌱",
    },
    {
      title: "오늘은 워밍업이었어요!",
      sub: "퀴즈는 풀수록 늘어요. 가볍게 한 판 더 도전해보세요.",
      emoji: "🌤️",
    },
  ],
  low: [
    {
      title: "감 잡기 시작했어요!",
      sub: "조금만 더 풀어보면 금세 익숙해질 거예요.",
      emoji: "🌿",
    },
    {
      title: "포기는 금물!",
      sub: "맞힌 문제가 분명 있다는 건 가능성이 있다는 뜻이에요.",
      emoji: "🍀",
    },
    {
      title: "이제 시작이에요!",
      sub: "한 문제씩 더 맞혀가는 재미, 한 번 더 느껴봐요.",
      emoji: "✨",
    },
  ],
  mid: [
    {
      title: "꽤 잘하셨어요!",
      sub: "평균은 거뜬히 넘기는 실력이에요. 한 단계 더 노려볼까요?",
      emoji: "👏",
    },
    {
      title: "안정적인 점수예요!",
      sub: "조금만 더 집중하면 고득점 구간도 충분히 가능해요.",
      emoji: "💪",
    },
    {
      title: "괜찮은 실력!",
      sub: "다음엔 다른 카테고리도 한번 도전해보세요.",
      emoji: "🌟",
    },
  ],
  high: [
    {
      title: "와, 대단한데요?",
      sub: "거의 다 맞히셨어요. 한 문제만 더 잡았으면 만점!",
      emoji: "🔥",
    },
    {
      title: "고수의 향기가 나요!",
      sub: "이 정도면 친구들 앞에서 자랑해도 되겠어요.",
      emoji: "🏆",
    },
    {
      title: "거의 완벽!",
      sub: "만점이 코앞이에요. 다시 한 번 도전해보면 어떨까요?",
      emoji: "⭐",
    },
  ],
  perfect: [
    {
      title: "🎉 완벽한 만점! 🎉",
      sub: "10문제 전부 정답! 진정한 상식 마스터예요!",
      emoji: "👑",
    },
    {
      title: "만점입니다!",
      sub: "이건 자랑할 만해요. 친구들에게도 도전장을 던져볼까요?",
      emoji: "🥇",
    },
  ],
};

function getScoreBucket(score) {
  if (score === 0) return '0';
  if (score >= 1 && score <= 3) return 'low';
  if (score >= 4 && score <= 7) return 'mid';
  if (score >= 8 && score <= 9) return 'high';
  return 'perfect';
}

function getScoreMessage(score) {
  const bucket = getScoreBucket(score);
  const list = window.SCORE_MESSAGES[bucket];
  return list[Math.floor(Math.random() * list.length)];
}

window.getScoreBucket = getScoreBucket;
window.getScoreMessage = getScoreMessage;
