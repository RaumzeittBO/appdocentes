import React, { useState } from 'react';
import { Play, User, Activity, KeyRound } from 'lucide-react';

export default function Home({ onStartActivity }) {
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
      setError('Por favor, ingresa el código de la actividad proporcionado por tu docente.');
      return;
    }
    setError('');
    onStartActivity(name.trim(), code.trim().toUpperCase());
  };

  return (
    <div className="home-layout">
      <div className="home-hero">
        <div className="home-badge">
          <Activity size={16} />
          <span>Fisiopatología Endocrina e Interactiva</span>
        </div>
        <h1>Addison Challenge</h1>
        <span className="author-tag">Actividad interactiva creada por Fabrizio Salamanca</span>
        <p>
          Bienvenido al reto educativo sobre la **Enfermedad de Addison** y otros temas clínicos interactivos.
          Esta plataforma te guiará a través de la sospecha clínica, confirmación diagnóstica y pautas de tratamiento, culminando con un examen evaluativo de alta proctorización.
        </p>
        <p style={{ fontSize: '0.95rem' }}>
          Para ingresar, regístrate con tu nombre completo e ingresa el código de sesión que tu docente ha iniciado en la pizarra.
        </p>
      </div>

      <div className="home-form">
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User className="logo-icon" size={24} />
            Registro de Estudiante
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="student-name" className="input-label">Nombre y Apellidos</label>
              <input
                id="student-name"
                type="text"
                className="form-control"
                placeholder="Ej. Ana María Gómez"
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
                Código de la Actividad
              </label>
              <input
                id="activity-code"
                type="text"
                className="form-control"
                placeholder="Ej. ADDISON"
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
                Entrar a la actividad
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
