import React, { useEffect, useMemo, useRef, useState } from 'react';
import { updateStudentResult, saveCheatingAlert } from '../services/activityService';
import { AlertTriangle, Award, Clock, Flame, HeartPulse, RefreshCw, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

const ROUND_LIMIT = 15;
const QUESTION_SECONDS = 22;

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const prepareQuestions = (questions) => {
  const grouped = questions.reduce((acc, question) => {
    const key = question.round || 'RONDA RAPIDA';
    acc[key] = acc[key] || [];
    acc[key].push(question);
    return acc;
  }, {});
  const selected = Object.values(grouped).flatMap((roundQuestions) => shuffle(roundQuestions).slice(0, 3));
  const pool = selected.length >= ROUND_LIMIT ? selected : shuffle(questions).slice(0, ROUND_LIMIT);

  return shuffle(pool).map((question) => {
    const options = question.options.map((text, index) => ({ text, originalIndex: index }));
    const shuffledOptions = shuffle(options);
    return {
      ...question,
      options: shuffledOptions.map((option) => option.text),
      correctAnswer: shuffledOptions.findIndex((option) => option.originalIndex === question.correctAnswer)
    };
  });
};

export default function Exam({ studentName, studentResultId, activityCode, questions = [], onFinishExam }) {
  const gameQuestions = useMemo(() => prepareQuestions(questions), [questions]);
  const [examStarted, setExamStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(gameQuestions.length).fill(null));
  const [feedback, setFeedback] = useState(null);
  const [questionSeconds, setQuestionSeconds] = useState(QUESTION_SECONDS);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [warningReason, setWarningReason] = useState('');

  const timerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const leaveTimestamp = useRef(0);
  const submittingRef = useRef(false);
  const warningsRef = useRef(0);
  const penaltyRef = useRef(0);
  const maxStreakRef = useRef(0);
  const feedbackRef = useRef(false);

  const currentQuestion = gameQuestions[currentIdx] || { question: 'Cargando desafio...', options: [] };
  const progressPercent = gameQuestions.length > 0 ? ((currentIdx + 1) / gameQuestions.length) * 100 : 0;
  const finalScore = Math.max(0, score - penalty);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const recordAntiCheat = async (reason, severity = 'advertencia') => {
    const nextWarnings = warningsRef.current + 1;
    warningsRef.current = nextWarnings;
    setWarningReason(reason);
    setIsWarningActive(true);

    const penaltyValue = nextWarnings <= 2 ? 15 : 40;
    penaltyRef.current += penaltyValue;
    setPenalty(penaltyRef.current);

    try {
      await saveCheatingAlert(activityCode, {
        studentName,
        type: severity === 'penalizacion' ? 'Penalizacion antitrampa' : 'Advertencia antitrampa',
        message: `${reason}. Advertencias: ${nextWarnings}. Penalizacion: -${penaltyValue} pts`,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving anti-cheat alert:', err);
    }

    window.setTimeout(() => setIsWarningActive(false), 2500);
  };

  const startGame = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) await element.requestFullscreen();
      setExamStarted(true);
    } catch (error) {
      console.warn('Fullscreen unavailable or rejected:', error);
      setExamStarted(true);
      recordAntiCheat('inicio sin pantalla completa', 'advertencia');
    }
  };

  useEffect(() => {
    if (examStarted) return;
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, [examStarted]);

  const submitGame = async (answers = selectedAnswers, forcedScore = finalScore, forcedCorrect = correctCount) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    clearInterval(timerRef.current);
    clearInterval(elapsedTimerRef.current);

    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    } catch (error) {
      console.warn('Could not exit fullscreen:', error);
    }

    const accuracy = gameQuestions.length > 0 ? forcedCorrect / gameQuestions.length : 0;
    const resultPayload = {
      puntaje: forcedScore,
      correctas: forcedCorrect,
      totalPreguntas: gameQuestions.length,
      precision: accuracy,
      rachaMax: maxStreakRef.current,
      penalizacion: penaltyRef.current,
      advertencias: warningsRef.current,
      tiempo: formatTime(elapsedTime),
      estado: 'completado',
      fecha: new Date().toISOString()
    };

    try {
      if (studentResultId) await updateStudentResult(activityCode, studentResultId, resultPayload);
    } catch (error) {
      console.error('Error updating final result:', error);
    }

    onFinishExam(forcedScore, formatTime(elapsedTime), answers, gameQuestions, resultPayload);
  };

  const handleAnswer = (optionIndex) => {
    if (feedbackRef.current || submittingRef.current) return;
    feedbackRef.current = true;
    clearInterval(timerRef.current);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const speedBonus = isCorrect ? Math.round((questionSeconds / QUESTION_SECONDS) * 20) : 0;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const streakBonus = isCorrect ? Math.min(nextStreak * 5, 30) : 0;
    const gained = isCorrect ? 100 + speedBonus + streakBonus : 0;
    const nextScore = score + gained;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextMaxStreak = Math.max(maxStreakRef.current, nextStreak);
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentIdx] = optionIndex;

    maxStreakRef.current = nextMaxStreak;
    setSelectedAnswers(updatedAnswers);
    setScore(nextScore);
    setCorrectCount(nextCorrect);
    setStreak(nextStreak);
    setFeedback({
      isCorrect,
      gained,
      correctText: currentQuestion.options[currentQuestion.correctAnswer],
      explanation: currentQuestion.explanation || 'Respuesta registrada.'
    });

    window.setTimeout(() => {
      setFeedback(null);
      feedbackRef.current = false;
      if (currentIdx >= gameQuestions.length - 1) {
        submitGame(updatedAnswers, Math.max(0, nextScore - penaltyRef.current), nextCorrect);
      } else {
        setCurrentIdx((prev) => prev + 1);
      }
    }, 1800);
  };

  useEffect(() => {
    if (!examStarted || feedback) return;
    setQuestionSeconds(QUESTION_SECONDS);
    timerRef.current = setInterval(() => {
      setQuestionSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [examStarted, currentIdx, feedback]);

  useEffect(() => {
    if (!examStarted) return;
    elapsedTimerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(elapsedTimerRef.current);
  }, [examStarted]);

  useEffect(() => {
    if (!examStarted) return;

    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement || document.webkitFullscreenElement;
      if (!isFull && !submittingRef.current) recordAntiCheat('salida de pantalla completa', 'advertencia');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        leaveTimestamp.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        const elapsed = (Date.now() - leaveTimestamp.current) / 1000;
        if (elapsed > 2) recordAntiCheat('cambio de pestana o aplicacion', 'penalizacion');
      }
    };

    const handleWindowBlur = () => {
      window.setTimeout(() => {
        if (!document.hasFocus() && !submittingRef.current) recordAntiCheat('perdida de foco del navegador', 'advertencia');
      }, 350);
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 't', 'w'].includes(key)) {
        e.preventDefault();
        recordAntiCheat('atajo bloqueado durante la partida', 'penalizacion');
      }
      if (e.key === 'F12') {
        e.preventDefault();
        recordAntiCheat('intento de abrir herramientas de desarrollador', 'penalizacion');
      }
    };

    const blockAction = (e) => {
      e.preventDefault();
      recordAntiCheat('accion bloqueada en entorno seguro', 'advertencia');
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', blockAction);
    document.addEventListener('paste', blockAction);
    document.addEventListener('contextmenu', blockAction);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', blockAction);
      document.removeEventListener('paste', blockAction);
      document.removeEventListener('contextmenu', blockAction);
    };
  }, [examStarted]);

  if (!examStarted) {
    return (
      <div className="exam-layout game-shell">
        <div className="card exam-pre-screen code-red-pre">
          <div className="security-badge code-red-badge">
            <HeartPulse size={18} />
            <span>LMA: CODIGO ROJO</span>
          </div>
          <h2>Diagnostica. Decide. Sobrevive a la guardia.</h2>
          <p>
            Rondas rapidas sobre reconocimiento, laboratorio, diagnostico, morfologia, genetica y decisiones clinicas.
            Gana por precision; la velocidad solo suma bonus moderado.
          </p>
          <ul className="security-list">
            <li><ShieldCheck size={18} /><span>Precision primero: +100 por correcta, bonus pequeno por velocidad y racha.</span></li>
            <li><ShieldAlert size={18} /><span>Antitrampa moderado: advertencias y penalizaciones, no expulsion automatica por una sola perdida de foco.</span></li>
            <li><Award size={18} /><span>Al final el panel docente muestra exactamente 4 ganadores.</span></li>
          </ul>
          <button className="btn btn-primary code-red-button" onClick={startGame}>
            <Zap size={18} />
            Iniciar guardia
          </button>
          <div className="countdown-chip">Inicio automatico en {countdown}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-layout game-shell">
      {isWarningActive && (
        <div className="anti-cheat-toast">
          <AlertTriangle size={18} />
          <div>
            <strong>Advertencia antitrampa</strong>
            <span>{warningReason}. Penalizacion aplicada.</span>
          </div>
          <button className="btn btn-secondary" onClick={async () => {
            try {
              if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
            } catch (error) {
              console.warn(error);
            }
            setIsWarningActive(false);
          }}>
            <RefreshCw size={14} />
            Reingresar
          </button>
        </div>
      )}

      <div className="game-topbar">
        <div>
          <span className="mini-label">{currentQuestion.round || 'RONDA RAPIDA'}</span>
          <h2>Codigo Rojo</h2>
        </div>
        <div className="game-score">
          <span>{finalScore} pts</span>
          <small>{studentName}</small>
        </div>
      </div>

      <div className="exam-stats game-stats">
        <div className="stat-card"><Clock size={20} /><div><span className="stat-label">Tiempo pregunta</span><span className="stat-value">{questionSeconds}s</span></div></div>
        <div className="stat-card"><Award size={20} /><div><span className="stat-label">Correctas</span><span className="stat-value">{correctCount}/{gameQuestions.length}</span></div></div>
        <div className="stat-card"><Flame size={20} /><div><span className="stat-label">Racha</span><span className="stat-value">{streak}</span></div></div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-fill code-red-progress" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="card question-card code-red-question">
        {currentQuestion.caseText && <div className="case-file">{currentQuestion.caseText}</div>}
        <div className="question-kicker">
          <span>{currentQuestion.category || 'Desafio'}</span>
          <span>{currentIdx + 1} / {gameQuestions.length}</span>
        </div>
        <h3 className="question-text">{currentQuestion.question}</h3>
        <div className="options-list">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={`${currentQuestion.id}-${idx}`}
              className={`option-btn game-option ${selectedAnswers[currentIdx] === idx ? 'selected' : ''}`}
              onClick={() => handleAnswer(idx)}
              disabled={!!feedback}
            >
              <span>{option}</span>
              <div className="option-marker"></div>
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          <strong>{feedback.isCorrect ? 'CORRECTO' : 'INCORRECTO'}</strong>
          <span>{feedback.isCorrect ? `+${feedback.gained} pts` : `Correcta: ${feedback.correctText}`}</span>
          <p>{feedback.explanation}</p>
        </div>
      )}
    </div>
  );
}
