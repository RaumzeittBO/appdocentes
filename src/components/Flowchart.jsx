import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  FlaskConical, 
  SearchCode, 
  CheckSquare, 
  Activity, 
  Zap, 
  Info, 
  X, 
  ArrowRight,
  Clock
} from 'lucide-react';

const defaultFlowchartSteps = [
  {
    id: 1,
    title: "1. Sospecha Clínica",
    subtitle: "Síntomas iniciales e insidiosos",
    icon: AlertTriangle,
    preview: "Astenia, pérdida de peso, náuseas, dolor abdominal, hipotensión, hiperpigmentación.",
    bullets: [
      "Astenia y debilidad muscular progresiva (fatiga severa).",
      "Pérdida de peso involuntaria y anorexia.",
      "Síntomas gastrointestinales: náuseas, vómitos, dolor abdominal difuso.",
      "Hipotensión arterial (frecuentemente ortostática).",
      "Hiperpigmentación cutánea y mucosa (debido a la elevación de ACTH y consecuente estimulación de receptores de melanocortina, visible en nudillos, cicatrices y encías)."
    ]
  },
  {
    id: 2,
    title: "2. Hallazgos de Laboratorio",
    subtitle: "Alteraciones hidroelectrolíticas clave",
    icon: FlaskConical,
    preview: "Hiponatremia, hiperpotasemia, hipoglucemia.",
    bullets: [
      "Hiponatremia: debido a la pérdida urinaria de sodio por falta de aldosterona.",
      "Hiperpotasemia: por retención de potasio en los túbulos colectores renales.",
      "Hipoglucemia: secundaria a la deficiencia de cortisol (que reduce la gluconeogénesis).",
      "Acidosis metabólica leve y hemoconcentración."
    ]
  },
  {
    id: 3,
    title: "3. Pruebas de Confirmación",
    subtitle: "Establecimiento del diagnóstico endocrino",
    icon: SearchCode,
    preview: "Cortisol sérico bajo, ACTH plasmática elevada y prueba de estimulación.",
    bullets: [
      "Cortisol plasmático matutino (8:00 AM) bajo (usualmente < 3 µg/dL confirma; > 19 µg/dL descarta).",
      "ACTH plasmática elevada: indica la falta de retroalimentación negativa por parte de las glándulas suprarrenales.",
      "Prueba de estimulación con ACTH sintética (Cosintropina): se administra ACTH IV/IM y se mide el cortisol a los 30/60 min. Si no sube (> 18 µg/dL), se confirma la insuficiencia."
    ]
  },
  {
    id: 4,
    title: "4. Diagnóstico Definitivo",
    subtitle: "Insuficiencia Suprarrenal Primaria",
    icon: CheckSquare,
    preview: "Confirmación del fallo intrínseco de la corteza suprarrenal.",
    bullets: [
      "Causa Autoinmune (adrenalitis autoinmune): representa el 70-80% de los casos en países desarrollados (anticuerpos anti-21-hidroxilasa positivos).",
      "Causas Infecciosas: la Tuberculosis adrenal sigue siendo común a nivel mundial, además de micosis sistémicas o VIH.",
      "Hemorragia adrenal bilateral (Síndrome de Waterhouse-Friderichsen) o metástasis tumorales."
    ]
  },
  {
    id: 5,
    title: "5. Tratamiento Crónico",
    subtitle: "Reemplazo hormonal de por vida",
    icon: Activity,
    preview: "Hidrocortisona, fludrocortisona y educación ante el estrés.",
    bullets: [
      "Glucocorticoides: Hidrocortisona oral dividida en 2-3 dosis diarias (ej. 15-25 mg/día), simulando el ritmo circadiano. Como alternativa, acetato de cortisona o prednisolona.",
      "Mineralocorticoides: Fludrocortisona oral (0.05 - 0.2 mg/día) para normalizar la presión arterial y electrolitos.",
      "Educación y Prevención: Duplicar o triplicar la dosis de glucocorticoides ante fiebre, cirugías, traumatismos o infecciones menores ('Reglas de días de enfermedad')."
    ]
  },
  {
    id: 6,
    title: "6. Crisis Adrenal Aguda",
    subtitle: "Emergencia médica potencialmente mortal",
    icon: Zap,
    preview: "Shock hemodinámico, hipotensión refractaria, hidrocortisona IV y solución salina.",
    bullets: [
      "Manifestaciones: shock circulatorio grave (hipotensión refractaria a catecolaminas), deshidratación extrema, vómitos persistentes y fiebre.",
      "Tratamiento inmediato: Hidrocortisona IV directa (100 mg en bolo) seguida de infusión continua o dosis cada 6 horas.",
      "Rehidratación agresiva: Solución salina isotónica al 0.9% IV (asociada a dextrosa al 5% para tratar la hipoglucemia)."
    ]
  }
];

// Sequential list of fallback icons for custom flowcharts
const iconsList = [AlertTriangle, FlaskConical, SearchCode, CheckSquare, Activity, Zap];

export default function Flowchart({ studentName, customSteps, onProceedToExam }) {
  const [activeStep, setActiveStep] = useState(null);

  // ⏳ 2-minute study timer (120 seconds)
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onProceedToExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onProceedToExam]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Map custom steps to structure
  const steps = customSteps && customSteps.length > 0 
    ? customSteps.map((step, index) => ({
        id: index + 1,
        title: step.title || `Paso ${index + 1}`,
        subtitle: step.subtitle || 'Detalle del paso',
        icon: iconsList[index % iconsList.length],
        preview: step.preview || (step.bullets && step.bullets[0]) || 'Sin descripción',
        bullets: step.bullets || []
      }))
    : defaultFlowchartSteps;

  return (
    <div className="flowchart-container">
      <div className="flowchart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Ruta de Aprendizaje y Estudio
          </h2>
          <p>
            Hola <strong style={{ color: 'var(--primary)' }}>{studentName}</strong>. 
            Estudia detenidamente las siguientes tarjetas de estudio interactivo. Haz clic en cada una de ellas para ver información médica detallada antes de comenzar la evaluación.
          </p>
        </div>

        {/* ⏳ Study timer card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: timeLeft <= 20 ? 'var(--danger-glow)' : 'var(--bg-card-glass)',
          border: `1px solid ${timeLeft <= 20 ? 'var(--danger)' : 'var(--border-color)'}`,
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          color: timeLeft <= 20 ? 'var(--danger)' : 'var(--text-main)',
          fontWeight: 'bold',
          boxShadow: timeLeft <= 20 ? 'var(--shadow-danger-glow)' : 'none',
          animation: timeLeft <= 20 ? 'pulse-border 1.5s infinite' : 'none'
        }}>
          <Clock className="logo-icon" size={24} style={{ color: timeLeft <= 20 ? 'var(--danger)' : 'var(--primary)' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tiempo restante de estudio
            </div>
            <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="flowchart-nodes">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.id} 
              className="flow-node"
              onClick={() => setActiveStep(step)}
            >
              <div className="node-number">Módulo {step.id}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--primary)', display: 'flex' }}>
                  <Icon size={20} />
                </span>
                <h3 className="node-title">{step.title.includes('. ') ? step.title.split('. ')[1] : step.title}</h3>
              </div>
              <p className="node-preview">{step.preview}</p>
              <div className="node-footer">
                <Info size={14} />
                <span>Ver detalles de estudio</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={onProceedToExam}>
          <span>Comenzar Examen</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {activeStep && (
        <div className="modal-overlay" onClick={() => setActiveStep(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveStep(null)}>
              <X size={20} />
            </button>
            <div className="modal-node-header">
              <div className="modal-icon-wrapper">
                <span style={{ color: 'var(--primary)', display: 'flex' }}>
                  <span style={{ display: 'flex' }}>
                    {React.createElement(activeStep.icon, { size: 20 })}
                  </span>
                </span>
              </div>
              <div>
                <h3 className="modal-node-title">{activeStep.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{activeStep.subtitle}</p>
              </div>
            </div>
            <div className="modal-body">
              <ul>
                {activeStep.bullets.map((bullet, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{bullet}</li>
                ))}
              </ul>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => setActiveStep(null)}
            >
              Cerrar detalles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
