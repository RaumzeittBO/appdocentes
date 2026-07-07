import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  KeyRound,
  Layers3,
  LockKeyhole,
  MonitorCheck,
  Play,
  School,
  ShieldCheck,
  User,
  Users
} from 'lucide-react';

const platformModules = [
  {
    icon: School,
    title: 'Aulas y cursos',
    description: 'Organiza materias por aula, comparte codigos de acceso y prepara sesiones en vivo.'
  },
  {
    icon: FileQuestion,
    title: 'Examenes seguros',
    description: 'Pantalla completa, alertas por cambio de pestana, bloqueo de copiar/pegar y registro de incidentes.'
  },
  {
    icon: ClipboardList,
    title: 'Tareas y actividades',
    description: 'Estructura tareas, cuestionarios, guias de estudio y entregas con seguimiento por estudiante.'
  },
  {
    icon: BarChart3,
    title: 'Notas y reportes',
    description: 'Visualiza resultados, tiempos, estados, ranking y alertas desde el panel docente en tiempo real.'
  }
];

const roadmapItems = [
  'Autenticacion por institucion y roles',
  'Banco de preguntas por materia',
  'Tareas con archivos y rubricas',
  'Pagos mensuales y planes SaaS'
];

export default function Home({ onStartActivity, onGoToTeacher }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('ADDISON');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre completo para comenzar.');
      return;
    }
    if (!code.trim()) {
      setError('Por favor, ingresa el codigo de la actividad proporcionado por tu docente.');
      return;
    }
    setError('');
    onStartActivity(name.trim(), code.trim().toUpperCase());
  };

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="home-hero">
          <div className="home-badge">
            <School size={16} />
            <span>Plataforma para docentes, colegios y universidades</span>
          </div>
          <h1>AulaNova</h1>
          <span className="author-tag">Aulas, tareas y examenes seguros en un solo lugar</span>
          <p>
            Gestiona clases, crea actividades, publica material de estudio y toma examenes con
            supervision antitrampa. Esta primera version ya permite sesiones sincronizadas,
            panel docente en tiempo real y evaluaciones protegidas.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#acceso-estudiante">
              <GraduationCap size={18} />
              Entrar como estudiante
            </a>
            <button type="button" className="btn btn-secondary" onClick={onGoToTeacher}>
              <MonitorCheck size={18} />
              Ir al panel docente
            </button>
          </div>
          <div className="product-highlights">
            <div><ShieldCheck size={18} /> Examenes seguros</div>
            <div><BookOpen size={18} /> Cursos y aulas</div>
            <div><ClipboardList size={18} /> Tareas y reportes</div>
          </div>
        </div>

        <div className="hero-product-card">
          <div className="hero-product-header">
            <div>
              <span className="mini-label">Panel docente</span>
              <h2>Clase en vivo</h2>
            </div>
            <span className="status-pill">Activa</span>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>32</strong>
              <span>estudiantes</span>
            </div>
            <div>
              <strong>94%</strong>
              <span>avance</span>
            </div>
            <div>
              <strong>2</strong>
              <span>alertas</span>
            </div>
          </div>
          <div className="mock-list">
            <div>
              <CheckCircle2 size={16} />
              Examen final publicado
              <span>10 preguntas</span>
            </div>
            <div>
              <LockKeyhole size={16} />
              Supervision antitrampa
              <span>activa</span>
            </div>
            <div>
              <CalendarCheck size={16} />
              Tarea semanal
              <span>pendiente</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section section-split" id="acceso-estudiante">
        <div className="card">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User className="logo-icon" size={24} />
            Acceso del estudiante
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Usa el codigo que tu docente comparte en clase para entrar a la sala de espera,
            estudiar el material y rendir el examen seguro.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="student-name" className="input-label">Nombre y Apellidos</label>
              <input
                id="student-name"
                type="text"
                className="form-control"
                placeholder="Ej. Ana Maria Gomez"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setError('');
                }}
              />
            </div>

            <div className="input-group" style={{ marginTop: '1.25rem' }}>
              <label htmlFor="activity-code" className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <KeyRound size={12} />
                Codigo de la actividad
              </label>
              <input
                id="activity-code"
                type="text"
                className="form-control"
                placeholder="Ej. BIO101"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (e.target.value.trim()) setError('');
                }}
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              />
            </div>

            {error && (
              <span style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block', fontWeight: '500' }}>
                {error}
              </span>
            )}

            <div className="home-actions" style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary">
                <Play size={18} />
                Entrar a mi clase
              </button>
            </div>
          </form>
        </div>

        <div className="student-preview card">
          <div className="panel-preview-title">
            <GraduationCap size={20} />
            <div>
              <h3>Panel estudiante</h3>
              <p>Vista inicial para mostrar el flujo que construiremos por fases.</p>
            </div>
          </div>
          <div className="student-track">
            <div className="track-item active"><span>1</span> Registro en aula</div>
            <div className="track-item active"><span>2</span> Sala sincronizada</div>
            <div className="track-item"><span>3</span> Material y tareas</div>
            <div className="track-item"><span>4</span> Examen protegido</div>
            <div className="track-item"><span>5</span> Resultados</div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="mini-label">Suite educativa</span>
          <h2>Todo lo necesario para venderlo como plataforma mensual</h2>
          <p>
            La base actual cubre evaluacion segura. El diseno ya presenta el producto como una suite
            completa para docentes, instituciones y estudiantes.
          </p>
        </div>
        <div className="module-grid">
          {platformModules.map((module) => {
            const Icon = module.icon;
            return (
              <div className="module-card" key={module.title}>
                <Icon size={22} />
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="landing-section teacher-showcase">
        <div>
          <span className="mini-label">Panel docente</span>
          <h2>Administra sesiones, contenidos y alertas desde una sola pantalla</h2>
          <p>
            El panel actual ya permite crear actividades, iniciar o pausar la clase, ver registros,
            escuchar alertas y revisar resultados. En las siguientes fases lo convertiremos en un
            dashboard multi-curso con usuarios reales y suscripciones.
          </p>
          <button type="button" className="btn btn-primary" onClick={onGoToTeacher}>
            <MonitorCheck size={18} />
            Abrir panel docente
          </button>
        </div>
        <div className="teacher-preview-card">
          <div className="preview-row">
            <span><Users size={16} /> Aula BIO101</span>
            <strong>En vivo</strong>
          </div>
          <div className="preview-progress"><span style={{ width: '78%' }}></span></div>
          <div className="preview-stats">
            <div><strong>18</strong><span>registrados</span></div>
            <div><strong>14</strong><span>completados</span></div>
            <div><strong>1</strong><span>alerta</span></div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="mini-label">Planes futuros</span>
          <h2>Preparado para mensualidades</h2>
          <p>Esta estructura visual ya deja claro como se monetizara la plataforma.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Docente</h3>
            <strong>Bs. 49/mes</strong>
            <p>Para profesores independientes que necesitan aulas y examenes seguros.</p>
          </div>
          <div className="pricing-card featured">
            <h3>Institucion</h3>
            <strong>Bs. 199/mes</strong>
            <p>Para colegios, institutos y universidades con multiples docentes.</p>
          </div>
          <div className="pricing-card">
            <h3>Campus</h3>
            <strong>A medida</strong>
            <p>Usuarios ilimitados, soporte, reportes avanzados e integraciones.</p>
          </div>
        </div>
      </section>

      <section className="landing-section roadmap-strip">
        <div>
          <span className="mini-label">Siguientes fases</span>
          <h2>Lo que falta para completar el producto</h2>
        </div>
        <div className="roadmap-list">
          {roadmapItems.map((item) => (
            <div key={item}>
              <Layers3 size={16} />
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
