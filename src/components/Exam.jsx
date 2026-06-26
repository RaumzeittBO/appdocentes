import React, { useState, useEffect, useRef } from 'react';
import { updateStudentResult, saveCheatingAlert } from '../services/activityService';
import { ShieldAlert, ShieldCheck, Clock, Award, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Exam({ studentName, studentResultId, activityCode, questions = [], onFinishExam, onDisqualified, onGoToHome }) {
  const [examStarted, setExamStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [elapsedTime, setElapsedTime] = useState(0);

  // ⚠️ Grace Period State
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [warningTimeLeft, setWarningTimeLeft] = useState(3);
  const [warningReason, setWarningReason] = useState('');

  // ⏳ Pre-exam countdown state (10 seconds to auto-start)
  const [preExamTimeLeft, setPreExamTimeLeft] = useState(10);

  const disqualifiedRef = useRef(false);
  const timerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const leaveTimestamp = useRef(0);

  // Helper to format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Synthesize a quick warning beep locally to urge return
  const playLocalBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // Standard A4 warning beep
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Local beep failed:", e);
    }
  };

  // Start warning countdown
  const triggerWarning = (reason) => {
    if (disqualifiedRef.current) return;
    if (isWarningActive) return;

    setIsWarningActive(true);
    setWarningReason(reason);
    setWarningTimeLeft(3);
    playLocalBeep();

    // Start 3-second warning countdown
    let count = 3;
    warningTimerRef.current = setInterval(() => {
      count -= 1;
      setWarningTimeLeft(count);
      playLocalBeep();

      if (count <= 0) {
        clearInterval(warningTimerRef.current);
        disqualifyStudent(reason);
      }
    }, 1000);
  };

  // Cancel warning countdown when returning safely
  const cancelWarning = () => {
    clearInterval(warningTimerRef.current);
    setIsWarningActive(false);
    setWarningTimeLeft(3);
    setWarningReason('');
  };

  // Disqualify student function
  const disqualifyStudent = async (reason) => {
    if (disqualifiedRef.current) return;
    disqualifiedRef.current = true;

    // Clear all timers
    clearInterval(timerRef.current);
    clearInterval(elapsedTimerRef.current);
    clearInterval(warningTimerRef.current);

    // Try to exit fullscreen
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (e) {
      console.warn("Could not exit fullscreen:", e);
    }

    // Save warning alert to Firestore (Teacher plays the audio alerts)
    try {
      await saveCheatingAlert(activityCode, {
        studentName,
        type: 'Falta Proctoring',
        message: `Falta de conducta detectada: ${reason}`,
        createdAt: new Date().toISOString()
      });

      // Update existing student database entry to descalificado
      if (studentResultId) {
        await updateStudentResult(activityCode, studentResultId, {
          estado: 'descalificado',
          tiempo: formatTime(elapsedTime),
          fecha: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error updating Firestore on disqualification:", err);
    }

    // Call parent handler to show full screen lock
    onDisqualified(reason);
  };

  // Start Exam and request fullscreen
  const startExam = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      
      setExamStarted(true);
    } catch (error) {
      console.error("Failed to enter fullscreen mode:", error);
      alert("Es obligatorio permitir pantalla completa para iniciar el examen.");
    }
  };

  // ⏳ 10-second pre-exam auto-start timer
  useEffect(() => {
    if (examStarted) return;
    const timer = setInterval(() => {
      setPreExamTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          startExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted]);

  // Request fullscreen to recover from warning
  const resumeFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      }
      cancelWarning();
    } catch (error) {
      console.error("Failed to re-enter fullscreen:", error);
    }
  };

  // Proctor listeners setup
  useEffect(() => {
    if (!examStarted) return;

    // 1. Fullscreen changes
    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement || 
                     document.webkitFullscreenElement || 
                     document.mozFullScreenElement || 
                     document.msFullscreenElement;
      
      if (!isFull && examStarted && !disqualifiedRef.current) {
        triggerWarning("salir de pantalla completa");
      }
    };

    // 2. Tab changes (Visibility API)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !disqualifiedRef.current) {
        leaveTimestamp.current = Date.now();
      } else if (document.visibilityState === 'visible' && !disqualifiedRef.current) {
        // Calculate how long they were away (for mobile suspension)
        const elapsed = (Date.now() - leaveTimestamp.current) / 1000;
        if (elapsed > 3) {
          disqualifyStudent("cambio de pestaña por más de 3 segundos");
        } else {
          // If less than 3s, show the warning or let them re-enter
          triggerWarning("pérdida de visibilidad de la pestaña");
        }
      }
    };

    // 3. Focus loss (Window blur)
    const handleWindowBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus() && !disqualifiedRef.current && !isWarningActive) {
          triggerWarning("pérdida de foco del navegador");
        }
      }, 350);
    };

    // 4. Hotkeys blocking (Ctrl/Meta + C, V, T, W, F12)
    const handleKeyDown = (e) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      
      if (isCtrlOrMeta && (key === 'c' || key === 'v' || key === 't' || key === 'w')) {
        e.preventDefault();
        disqualifyStudent("intentar usar atajo de teclado bloqueado");
      }

      if (e.key === 'F12') {
        e.preventDefault();
        disqualifyStudent("intentar abrir consola de desarrollador");
      }
    };

    // 5. Copy/Paste
    const handleCopy = (e) => {
      e.preventDefault();
      disqualifyStudent("intentar copiar contenido");
    };

    const handlePaste = (e) => {
      e.preventDefault();
      disqualifyStudent("intentar pegar contenido");
    };

    // 6. Right click
    const handleContextMenu = (e) => {
      e.preventDefault();
      disqualifyStudent("abrir menú contextual (clic derecho)");
    };

    // Register event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    // Timers
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(elapsedTimerRef.current);
          submitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    elapsedTimerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      clearInterval(timerRef.current);
      clearInterval(elapsedTimerRef.current);
      clearInterval(warningTimerRef.current);
    };
  }, [examStarted, isWarningActive]);

  // Submit Exam
  const submitExam = async (isTimeUp = false) => {
    clearInterval(timerRef.current);
    clearInterval(elapsedTimerRef.current);
    clearInterval(warningTimerRef.current);

    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
      }
    } catch (e) {
      console.warn("Could not exit fullscreen:", e);
    }

    let score = 0;
    selectedAnswers.forEach((ans, index) => {
      if (ans === questions[index].correctAnswer) {
        score += 1;
      }
    });

    const finalStatus = isTimeUp ? 'tiempo expirado' : 'completado';

    try {
      if (studentResultId) {
        await updateStudentResult(activityCode, studentResultId, {
          puntaje: score,
          tiempo: formatTime(elapsedTime),
          estado: finalStatus,
          fecha: new Date().toISOString()
        });
      }
      onFinishExam(score, formatTime(elapsedTime), selectedAnswers);
    } catch (err) {
      console.error("Error updates on finish:", err);
      onFinishExam(score, formatTime(elapsedTime), selectedAnswers);
    }
  };

  const handleSelectOption = (optIdx) => {
    const updated = [...selectedAnswers];
    updated[currentIdx] = optIdx;
    setSelectedAnswers(updated);
  };

  // Pre-exam Warning Layout
  if (!examStarted) {
    return (
      <div className="exam-layout">
        <div className="card exam-pre-screen">
          <div className="security-badge">
            <ShieldAlert size={18} />
            <span>MODO SUPERVISIÓN MÁXIMA ACTIVO</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>
            Reglas del Examen Seguro
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            Para iniciar, es obligatorio expandir el navegador a pantalla completa. 
            Cualquier desviación será sancionada con la descalificación inmediata.
          </p>

          <ul className="security-list">
            <li style={{ color: 'var(--danger)' }}>
              <ShieldAlert size={18} />
              <span><strong>Advertencia de Pantalla Completa:</strong> Salir de pantalla completa por cualquier medio descalificará tu examen (gracia de 3 segundos para volver).</span>
            </li>
            <li>
              <ShieldCheck size={18} />
              <span><strong>Restricciones de Foco:</strong> Queda prohibido abrir consolas, cambiar de pestaña, copiar o pegar enunciados.</span>
            </li>
            <li>
              <ShieldCheck size={18} />
              <span><strong>Notificación al Docente:</strong> Toda infracción emitirá una sirena sonora y reportará tu nombre al panel del docente Fabrizio Salamanca.</span>
            </li>
          </ul>

          <div style={{ margin: '1.5rem 0', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px' }}>
            <p className="browser-disclaimer">
              Detección de compartir pantalla no disponible desde navegador común.
            </p>
          </div>

          <button className="btn btn-primary" onClick={startExam} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Iniciar examen en pantalla completa
          </button>
          
          <div style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            El examen comenzará automáticamente en <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{preExamTimeLeft}s</strong>...
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx] || { question: "Cargando pregunta...", options: [] };
  const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  return (
    <div className="exam-layout">
      {/* ⚠️ Warning Grace Period Overlay */}
      {isWarningActive && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.95)', zIndex: 2000 }}>
          <div className="card" style={{ border: '2px solid var(--warning)', maxWidth: '480px', width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-glow)', padding: '3rem 2rem' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--warning-glow)', color: 'var(--warning)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ color: 'var(--warning)', fontSize: '1.8rem', marginBottom: '1rem' }}>¡FUERA DE PANTALLA COMPLETA!</h2>
            <p style={{ marginBottom: '2rem', fontSize: '1.05rem', color: 'var(--text-main)' }}>
              Has salido del entorno seguro por: <strong>{warningReason}</strong>.
            </p>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--warning)', marginBottom: '2rem', animation: 'pulse-border 1s infinite' }}>
              {warningTimeLeft}s
            </div>
            <button className="btn btn-primary" onClick={resumeFullscreen} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} />
              Reingresar a Pantalla Completa
            </button>
          </div>
        </div>
      )}

      {/* Proctor Header */}
      <div className="exam-proctor-header">
        <div className="proctor-alert-indicator">
          <AlertTriangle size={18} />
          <span>SUPERVISIÓN ACTIVA (Código: {activityCode})</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Estudiante: <strong>{studentName}</strong>
        </span>
      </div>

      {/* Stats */}
      <div className="exam-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tiempo Restante</span>
            <span className="stat-value" style={{ color: timeLeft < 30 ? 'var(--danger)' : 'var(--text-main)' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Award size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Preguntas</span>
            <span className="stat-value">{currentIdx + 1} de {questions.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Question */}
      <div className="card question-card">
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        <div className="options-list">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${selectedAnswers[currentIdx] === idx ? 'selected' : ''}`}
              onClick={() => handleSelectOption(idx)}
            >
              <span>{option}</span>
              <div className="option-marker"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="exam-navigation">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentIdx(prev => prev - 1)}
          disabled={currentIdx === 0}
        >
          Anterior
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentIdx(prev => prev + 1)}
            disabled={selectedAnswers[currentIdx] === null}
          >
            Siguiente
          </button>
        ) : (
          <button
            className="btn btn-danger"
            onClick={() => submitExam(false)}
            disabled={selectedAnswers[currentIdx] === null}
          >
            Finalizar Examen
          </button>
        )}
      </div>
    </div>
  );
}
