import React from 'react';
import { Clock, ArrowRight, RotateCcw, ShieldCheck, XCircle, CheckCircle } from 'lucide-react';

export default function Results({ score, timeTaken, selectedAnswers, studentName, questions = [], onGoToHome, onGoToTeacher }) {
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const getFeedbackMessage = () => {
    if (score === questions.length) return "¡Perfecto! Excelente dominio de la materia.";
    if (score >= Math.round(questions.length * 0.7)) return "¡Buen trabajo! Tienes un sólido conocimiento del tema.";
    if (score >= Math.round(questions.length * 0.4)) return "Buen intento. Te recomendamos repasar los detalles de las tarjetas de estudio.";
    return "Es necesario revisar la fisiopatología, diagnóstico y tratamiento del tema clínico.";
  };

  return (
    <div className="results-layout">
      <div className="card results-card">
        <div className="badge-wrapper">
          <div className="score-badge-circle">
            <span className="score-badge-value">{score}</span>
            <span className="score-badge-label">de {questions.length}</span>
          </div>
        </div>

        <h2 className="results-status-title">¡Examen Finalizado!</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Felicitaciones, <strong style={{ color: 'var(--primary)' }}>{studentName}</strong>. Tu resultado ha sido guardado con éxito.
        </p>

        <div className="results-metrics">
          <div className="metric-item">
            <span className="metric-label">Calificación</span>
            <span className="metric-value" style={{ color: score >= Math.round(questions.length * 0.7) ? 'var(--success)' : 'var(--warning)' }}>
              {percentage}%
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Tiempo Empleado</span>
            <span className="metric-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Clock size={16} />
              {timeTaken}
            </span>
          </div>
        </div>

        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          "{getFeedbackMessage()}"
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onGoToHome}>
            <RotateCcw size={16} />
            Volver a inicio
          </button>
        </div>
      </div>

      {/* Answer Review */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <ShieldCheck size={20} className="logo-icon" />
          Revisión de Preguntas
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.map((q, idx) => {
            const isCorrect = selectedAnswers[idx] === q.correctAnswer;
            return (
              <div 
                key={idx} 
                style={{ 
                  borderLeft: `3px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                  paddingLeft: '1rem',
                  background: 'rgba(255, 255, 255, 0.01)',
                  padding: '1rem',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>
                    {idx + 1}. {q.question}
                  </h4>
                  {isCorrect ? (
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <CheckCircle size={14} /> CORRECTO
                    </span>
                  ) : (
                    <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <XCircle size={14} /> INCORRECTO
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                  <div style={{ color: isCorrect ? 'var(--success)' : 'var(--text-muted)' }}>
                    <strong>Tu respuesta:</strong> {selectedAnswers[idx] !== null ? q.options[selectedAnswers[idx]] : "Sin respuesta"}
                  </div>
                  {!isCorrect && (
                    <div style={{ color: 'var(--success)' }}>
                      <strong>Respuesta correcta:</strong> {q.options[q.correctAnswer]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
