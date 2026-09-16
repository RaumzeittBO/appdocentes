import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  Play,
  School,
  ShieldCheck,
  User
} from 'lucide-react';

export default function Home({ onStartActivity }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('LMA');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
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
      <section className="landing-section section-split student-access-first" id="acceso-estudiante">
        <div className="card">
          <div className="home-badge" style={{ marginBottom: '1rem' }}>
            <GraduationCap size={16} />
            <span>Acceso directo al juego</span>
          </div>
          <h1 style={{ marginBottom: '0.65rem' }}>Entrar como estudiante</h1>
          <p style={{ marginBottom: '1.5rem' }}>
            Escribe tu nombre y el codigo compartido por tu docente para ingresar a la actividad.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="student-name" className="input-label">Nombre y apellidos</label>
              <input
                id="student-name"
                type="text"
                className="form-control"
                placeholder="Ej. Ana Maria Gomez"
                autoFocus
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (event.target.value.trim()) setError('');
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
                placeholder="Ej. LMA"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (event.target.value.trim()) setError('');
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
            <User size={20} />
            <div>
              <h3>LMA: Codigo Rojo</h3>
              <p>Diagnostica. Decide. Sobrevive a la guardia.</p>
            </div>
          </div>
          <div className="student-track">
            <div className="track-item active"><span>1</span> Ingresa con tu codigo</div>
            <div className="track-item active"><span>2</span> Espera al docente</div>
            <div className="track-item"><span>3</span> Responde 15 preguntas</div>
            <div className="track-item"><span>4</span> Suma puntos y rachas</div>
            <div className="track-item"><span>5</span> Revisa el resultado</div>
          </div>
        </div>
      </section>

      <section className="landing-hero compact-game-hero">
        <div className="home-hero">
          <div className="home-badge">
            <School size={16} />
            <span>Juego educativo competitivo</span>
          </div>
          <h1>LMA: Codigo Rojo</h1>
          <span className="author-tag">Diagnostica. Decide. Sobrevive a la guardia.</span>
          <p>
            Rondas clinicas sobre leucemia mieloblastica aguda, laboratorio, diagnostico,
            decisiones medicas y un final con cuatro ganadores.
          </p>
          <div className="product-highlights">
            <div><ShieldCheck size={18} /> Examen seguro</div>
            <div><GraduationCap size={18} /> 15 preguntas</div>
            <div><CalendarCheck size={18} /> 4 ganadores</div>
          </div>
        </div>

        <div className="hero-product-card">
          <div className="hero-product-header">
            <div>
              <span className="mini-label">Partida en vivo</span>
              <h2>Codigo Rojo</h2>
            </div>
            <span className="status-pill">Lista</span>
          </div>
          <div className="mock-list">
            <div><CheckCircle2 size={16} /> Banco aleatorio <span>15 preguntas</span></div>
            <div><LockKeyhole size={16} /> Supervision antitrampa <span>activa</span></div>
            <div><CalendarCheck size={16} /> Podium final <span>4 ganadores</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
