import React, { useState, useEffect } from 'react';
import './styles.css';
import Home from './components/Home';
import Flowchart from './components/Flowchart';
import Exam from './components/Exam';
import Results from './components/Results';
import TeacherPanel from './components/TeacherPanel';
import { 
  getActivity,
  registerStudent, 
  listenActivityConfig
} from './services/activityService';
import { 
  Activity, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  AlertOctagon, 
  ShieldAlert,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

// Client-side authentication credentials
const TEACHER_EMAIL = import.meta.env.VITE_TEACHER_EMAIL || 'docente@addison.edu';
const TEACHER_PASSWORD = import.meta.env.VITE_TEACHER_PASSWORD || 'Fabrizio2026';

function App() {
  // Navigation Routing State
  const [pathname, setPathname] = useState(window.location.pathname);

  // Student Session State
  const [studentName, setStudentName] = useState('');
  const [activityCode, setActivityCode] = useState('');
  const [studentResultId, setStudentResultId] = useState('');
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'lobby' | 'flowchart' | 'exam' | 'results' | 'disqualified'
  const [dqReason, setDqReason] = useState('');

  // Active Activity Data from Firestore
  const [activityData, setActivityData] = useState(null);
  const [activityError, setActivityError] = useState('');

  // Exam Score State
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  // Teacher Authentication State
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(
    () => sessionStorage.getItem('addison_teacher_logged') === 'true'
  );
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Custom Router Navigation Helper
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setPathname(path);
  };

  // Sync window back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check persistent disqualification on mount
  useEffect(() => {
    const savedDq = localStorage.getItem('addison_dq_reason');
    const savedName = localStorage.getItem('addison_student_name');
    const savedCode = localStorage.getItem('addison_activity_code');
    if (savedDq && savedName && savedCode) {
      setStudentName(savedName);
      setActivityCode(savedCode);
      setDqReason(savedDq);
      setCurrentView('disqualified');
    }
  }, []);

  // Listen to synchronized classroom status if student is registered in an activity
  useEffect(() => {
    if (!activityCode || currentView === 'home' || currentView === 'results' || currentView === 'disqualified') return;

    const unsubscribe = listenActivityConfig(activityCode, (data) => {
      if (data) {
        setActivityData(data);
        
        // Transition from lobby to flowchart or exam when teacher hits start
        if (currentView === 'lobby' && data.sessionActive) {
          if (data.directExam) {
            setCurrentView('exam');
          } else {
            setCurrentView('flowchart');
          }
        }
      }
    });

    return () => unsubscribe();
  }, [activityCode, currentView]);

  // Handle student name submission -> check activity -> register student
  const handleRegisterStudent = async (name, code) => {
    setActivityError('');
    try {
      // 1. Verify activity exists in Firestore
      const activeAct = await getActivity(code);
      if (!activeAct) {
        setActivityError(`El código de actividad "${code}" no existe. Pídele al docente el código correcto.`);
        return;
      }

      setActivityData(activeAct);
      setActivityCode(code);
      localStorage.setItem('addison_activity_code', code);

      // 2. Register student in this activity's results subcollection
      const docId = await registerStudent(code, name);
      setStudentResultId(docId);
      setStudentName(name);
      localStorage.setItem('addison_student_name', name);
      
      // 3. Move to Lobby or directly to Exam/Flowchart if already active
      if (activeAct.sessionActive) {
        if (activeAct.directExam) {
          setCurrentView('exam');
        } else {
          setCurrentView('flowchart');
        }
      } else {
        setCurrentView('lobby');
      }
    } catch (err) {
      console.error("Fallo al registrar estudiante:", err);
      setActivityError("Error de conexión al intentar acceder a la actividad. Verifica tu conexión a internet.");
    }
  };

  const handleFinishExam = (finalScore, time, answers) => {
    setScore(finalScore);
    setTimeTaken(time);
    setSelectedAnswers(answers);
    setCurrentView('results');
  };

  // Student is disqualified (called by Exam.jsx)
  const handleStudentDisqualified = (reason) => {
    setDqReason(reason);
    setCurrentView('disqualified');
    localStorage.setItem('addison_dq_reason', reason);
  };

  const handleGoToHome = () => {
    setStudentName('');
    setStudentResultId('');
    setActivityCode('');
    setActivityData(null);
    setScore(0);
    setTimeTaken('');
    setSelectedAnswers([]);
    setDqReason('');
    setActivityError('');
    setCurrentView('home');
    navigate('/');
  };

  // Teacher Login Action
  const handleTeacherLogin = (e) => {
    e.preventDefault();
    if (loginEmail === TEACHER_EMAIL && loginPassword === TEACHER_PASSWORD) {
      setIsTeacherLoggedIn(true);
      sessionStorage.setItem('addison_teacher_logged', 'true');
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    sessionStorage.removeItem('addison_teacher_logged');
    setLoginEmail('');
    setLoginPassword('');
    navigate('/');
  };

  // RENDER VIEW LOGIC
  const renderView = () => {
    // 🧑‍🏫 Teacher Panel Routing
    if (pathname === '/docente') {
      if (!isTeacherLoggedIn) {
        return (
          <div className="exam-layout" style={{ maxWidth: '420px', margin: '4rem auto' }}>
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', background: 'var(--primary-glow)', padding: '0.75rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
                  <Lock size={28} />
                </div>
                <h2>Acceso Docente</h2>
                <p style={{ fontSize: '0.9rem' }}>Ingresa tus credenciales para administrar la actividad</p>
              </div>

              <form onSubmit={handleTeacherLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="ejemplo@addison.edu"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                {loginError && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '500' }}>
                    {loginError}
                  </span>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Ingresar al Panel
                </button>

                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  style={{ width: '100%', fontSize: '0.85rem' }} 
                  onClick={() => navigate('/')}
                >
                  Volver al inicio de alumnos
                </button>
              </form>
            </div>
          </div>
        );
      }

      return (
        <TeacherPanel 
          onGoToHome={handleTeacherLogout} 
        />
      );
    }

    // 🧑‍🎓 Student Flow
    switch (currentView) {
      case 'home':
        return (
          <>
            <Home 
              onStartActivity={handleRegisterStudent} 
            />
            {activityError && (
              <div style={{ maxWidth: '480px', margin: '1rem auto 0', padding: '1rem', background: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', fontWeight: '600' }}>
                {activityError}
              </div>
            )}
          </>
        );
        
      case 'lobby':
        return (
          <div className="exam-layout" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
            <div className="card" style={{ padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', background: 'var(--primary-glow)', transform: 'scale(1.2)', filter: 'blur(8px)', animation: 'pulse-border 2s infinite' }}></div>
                <Loader2 className="logo-icon" size={48} style={{ animation: 'spin 2s linear infinite', position: 'relative' }} />
              </div>
              <h2 className="text-gradient-primary" style={{ fontSize: '2rem' }}>Sala de Espera Sincronizada</h2>
              <p>
                Hola <strong style={{ color: 'var(--primary)' }}>{studentName}</strong>, te has registrado en la actividad <strong style={{ color: 'var(--primary)' }}>{activityData?.title || activityCode}</strong>.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '8px', width: '100%' }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  Por favor, observa la pantalla del docente. La actividad comenzará automáticamente para todos cuando el profesor lo indique.
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Esperando señal del servidor...
              </span>
            </div>
          </div>
        );

      case 'flowchart':
        return (
          <Flowchart 
            studentName={studentName} 
            customSteps={activityData?.flowchart}
            onProceedToExam={() => setCurrentView('exam')} 
          />
        );

      case 'exam':
        return (
          <Exam 
            studentName={studentName} 
            studentResultId={studentResultId}
            activityCode={activityCode}
            questions={activityData?.questions || []}
            onFinishExam={handleFinishExam}
            onDisqualified={handleStudentDisqualified}
            onGoToHome={handleGoToHome}
          />
        );

      case 'results':
        return (
          <Results 
            score={score} 
            timeTaken={timeTaken} 
            selectedAnswers={selectedAnswers} 
            studentName={studentName} 
            questions={activityData?.questions || []}
            onGoToHome={handleGoToHome} 
            onGoToTeacher={() => navigate('/docente')}
          />
        );

      case 'disqualified':
        return (
          <div className="exam-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
            <div className="card" style={{ border: '2px solid var(--danger)', padding: '4rem 2rem', textAlign: 'center', maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-danger-glow)' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--danger-glow)', color: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', display: 'flex', justifyContent: 'center' }}>
                <AlertOctagon size={42} style={{ alignSelf: 'center' }} />
              </div>
              <h1 className="text-gradient-danger" style={{ fontSize: '2.2rem', marginBottom: '1rem', fontWeight: '800' }}>
                DESCALIFICADO POR HACER TRAMPA
              </h1>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                Tu acceso a esta actividad ha sido revocado permanentemente.
              </p>
              
              <div style={{ background: 'var(--danger-glow)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontFamily: 'var(--font-mono)', color: 'var(--danger)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                MOTIVO: {dqReason.toUpperCase()}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Esta incidencia se guardó en la base de datos de Firebase en tiempo real. 
                Tu navegador ha sido bloqueado en este dispositivo para la actividad: **{activityCode}**.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <Home 
            onStartActivity={handleRegisterStudent} 
          />
        );
    }
  };

  // Determine if student navigation in navbar is allowed
  const isStudentLocked = studentName !== '' && currentView !== 'results';

  return (
    <div className="app-container">
      {/* Premium Navbar */}
      <header className="app-navbar">
        <div className="logo-container" style={{ cursor: isStudentLocked ? 'not-allowed' : 'pointer' }} onClick={() => { if (!isStudentLocked) handleGoToHome(); }}>
          <Activity className="logo-icon" size={26} />
          <span className="logo-text">Addison Challenge</span>
        </div>

        <div className="nav-actions">
          {!isStudentLocked && pathname !== '/docente' && currentView !== 'home' && (
            <button className="btn btn-ghost" onClick={handleGoToHome} style={{ fontSize: '0.85rem' }}>
              Volver al inicio
            </button>
          )}

          {isStudentLocked && currentView !== 'disqualified' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--warning)', background: 'var(--warning-glow)', padding: '0.35rem 0.85rem', borderRadius: '4px', border: '1px solid var(--warning)' }}>
              <ShieldAlert size={16} />
              <span>Entorno Seguro (Código: {activityCode})</span>
            </div>
          )}

          {isStudentLocked && currentView === 'disqualified' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--danger)', background: 'var(--danger-glow)', padding: '0.35rem 0.85rem', borderRadius: '4px', border: '1px solid var(--danger)' }}>
              <AlertOctagon size={16} />
              <span>Sancionado</span>
            </div>
          )}

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Docente: <strong>F. Salamanca</strong>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* Premium Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(11, 19, 26, 0.4)' }}>
        <p>
          <strong>Addison Challenge</strong> — Demo Educativa Interactiva sobre la Enfermedad de Addison y Casos Clínicos.
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
          Creado por <strong style={{ color: 'var(--primary)' }}>Fabrizio Salamanca</strong> para docentes y estudiantes de ciencias de la salud. Todos los derechos reservados © 2026.
        </p>
      </footer>
    </div>
  );
}

export default App;
