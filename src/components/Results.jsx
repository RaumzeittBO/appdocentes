import React from 'react';
import { CheckCircle, Clock, RotateCcw, ShieldCheck, Trophy, XCircle } from 'lucide-react';

export default function Results({ score, timeTaken, selectedAnswers, studentName, questions = [], onGoToHome }) {
  const correctTotal = selectedAnswers.filter((ans, index) => ans === questions[index]?.correctAnswer).length;
  const percentage = questions.length > 0 ? Math.round((correctTotal / questions.length) * 100) : 0;

  const getFeedbackMessage = () => {
    if (percentage === 100) return 'Guardia impecable. Excelente dominio del caso.';
    if (percentage >= 70) return 'Buen trabajo. Tu precision diagnostica fue solida.';
    if (percentage >= 40) return 'Buen intento. Conviene repasar laboratorio, diagnostico y decisiones clinicas.';
    return 'Necesitas reforzar reconocimiento, urgencias y criterios de sospecha en LMA.';
  };

  return (
    <div className="results-layout">
      <div className="card results-card">
        <div className="badge-wrapper">
          <div className="score-badge-circle">
            <span className="score-badge-value">{score}</span>
            <span className="score-badge-label">puntos</span>
          </div>
        </div>

        <h2 className="results-status-title">Codigo Rojo completado</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Trophy size={18} />
          Bien jugado, <strong style={{ color: 'var(--primary)' }}>{studentName}</strong>. Tu resultado ya entro al ranking.
        </p>

        <div className="results-metrics">
          <div className="metric-item">
            <span className="metric-label">Precision</span>
            <span className="metric-value" style={{ color: percentage >= 70 ? 'var(--success)' : 'var(--warning)' }}>
              {percentage}% ({correctTotal}/{questions.length})
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Tiempo empleado</span>
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
            Volver al inicio
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <ShieldCheck size={20} className="logo-icon" />
          Revision educativa
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.map((q, idx) => {
            const isCorrect = selectedAnswers[idx] === q.correctAnswer;
            return (
              <div
                key={q.id || idx}
                style={{
                  borderLeft: `3px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                  background: 'rgba(255, 255, 255, 0.62)',
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
                  <div style={{ color: isCorrect ? 'var(--success)' : 'var(--text-muted)' }}>
                    <strong>Tu respuesta:</strong> {selectedAnswers[idx] !== null && selectedAnswers[idx] !== undefined ? q.options[selectedAnswers[idx]] : 'Sin respuesta'}
                  </div>
                  {!isCorrect && (
                    <div style={{ color: 'var(--success)' }}>
                      <strong>Respuesta correcta:</strong> {q.options[q.correctAnswer]}
                    </div>
                  )}
                  {q.explanation && <div style={{ color: 'var(--text-muted)' }}><strong>Clave:</strong> {q.explanation}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
