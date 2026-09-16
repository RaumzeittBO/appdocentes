export const QUESTION_SECONDS = 22;

export const calculateQuestionPoints = ({
  isCorrect,
  secondsRemaining,
  streak,
  questionSeconds = QUESTION_SECONDS
}) => {
  if (!isCorrect) return 0;

  const speedBonus = Math.round((secondsRemaining / questionSeconds) * 20);
  const streakBonus = Math.min(streak * 5, 30);
  return 100 + speedBonus + streakBonus;
};

export const calculateAntiCheatPenalty = (warningCount) => (
  warningCount <= 2 ? 15 : 40
);

export const parseTimeToSeconds = (time = '99:59') => {
  const [minutes, seconds] = String(time).split(':').map(Number);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return Number.MAX_SAFE_INTEGER;
  return (minutes * 60) + seconds;
};

export const rankGameResults = (results, fallbackQuestionCount = 15) => (
  [...results]
    .filter((result) => result.estado && !['descalificado', 'registrado'].includes(result.estado))
    .sort((a, b) => {
      const accuracyA = a.precision ?? ((a.correctas || 0) / Math.max(a.totalPreguntas || fallbackQuestionCount, 1));
      const accuracyB = b.precision ?? ((b.correctas || 0) / Math.max(b.totalPreguntas || fallbackQuestionCount, 1));
      if (accuracyB !== accuracyA) return accuracyB - accuracyA;
      if ((b.puntaje || 0) !== (a.puntaje || 0)) return (b.puntaje || 0) - (a.puntaje || 0);
      if ((b.rachaMax || 0) !== (a.rachaMax || 0)) return (b.rachaMax || 0) - (a.rachaMax || 0);
      return parseTimeToSeconds(a.tiempo) - parseTimeToSeconds(b.tiempo);
    })
);
