import React, { useState, useEffect, useRef } from 'react';
import { 
  listenResults, 
  listenAlerts, 
  clearActivityData, 
  saveCheatingAlert,
  saveActivity,
  deleteActivity,
  listActivities,
  listenActivityConfig
} from '../services/activityService';
import { 
  GraduationCap, 
  Users, 
  BellRing, 
  Trash2, 
  Sparkles, 
  Trophy, 
  Clock, 
  AlertTriangle,
  FileSpreadsheet,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  Plus,
  Edit,
  Upload,
  BookOpen,
  FileText,
  X,
  KeyRound,
  CheckCircle,
  ListTodo,
  Loader2
} from 'lucide-react';

const defaultAddisonActivity = {
  code: "ADDISON",
  title: "Plantilla demo: Enfermedad de Addison",
  directExam: false,
  sessionActive: false,
  flowchart: [
    {
      title: "1. Sospecha Clínica",
      subtitle: "Síntomas iniciales e insidiosos",
      preview: "Astenia, pérdida de peso, náuseas, dolor abdominal, hipotensión, hiperpigmentación.",
      bullets: [
        "Astenia y debilidad muscular progresiva (fatiga severa).",
        "Pérdida de peso involuntaria y anorexia.",
        "Síntomas gastrointestinales: náuseas, vómitos, dolor abdominal difuso.",
        "Hipotensión arterial (frecuentemente ortostática).",
        "Hiperpigmentación cutánea y mucosa (nudillos, cicatrices y encías)."
      ]
    },
    {
      title: "2. Hallazgos de Laboratorio",
      subtitle: "Alteraciones hidroelectrolíticas clave",
      preview: "Hiponatremia, hiperpotasemia, hipoglucemia.",
      bullets: [
        "Hiponatremia: debido a la pérdida urinaria de sodio por falta de aldosterona.",
        "Hiperpotasemia: por retención de potasio en los túbulos colectores renales.",
        "Hipoglucemia: secundaria a la deficiencia de cortisol.",
        "Acidosis metabólica leve y hemoconcentración."
      ]
    },
    {
      title: "3. Pruebas de Confirmación",
      subtitle: "Establecimiento del diagnóstico endocrino",
      preview: "Cortisol sérico bajo, ACTH plasmática elevada y prueba de estimulación.",
      bullets: [
        "Cortisol plasmático matutino (8:00 AM) bajo (< 3 µg/dL confirma).",
        "ACTH plasmática elevada: indica la falta de retroalimentación negativa.",
        "Prueba de estimulación con ACTH sintética (Cosintropina): mide el aumento de cortisol."
      ]
    },
    {
      title: "4. Diagnóstico Definitivo",
      subtitle: "Insuficiencia Suprarrenal Primaria",
      preview: "Confirmación del fallo intrínseco de la corteza suprarrenal.",
      bullets: [
        "Causa Autoinmune (adrenalitis): 70-80% de casos en países desarrollados (anti-21-hidroxilasa).",
        "Causas Infecciosas: Tuberculosis adrenal común en países en desarrollo, VIH, micosis.",
        "Hemorragia adrenal o metástasis bilaterales."
      ]
    },
    {
      title: "5. Tratamiento Crónico",
      subtitle: "Reemplazo hormonal de por vida",
      preview: "Hidrocortisona, fludrocortisona y educación ante el estrés.",
      bullets: [
        "Glucocorticoides: Hidrocortisona oral dividida en 2-3 dosis diarias.",
        "Mineralocorticoides: Fludrocortisona oral (0.05 - 0.2 mg/día) para normalizar presión.",
        "Reglas de días de enfermedad: Duplicar/triplicar glucocorticoides ante fiebre o infecciones."
      ]
    },
    {
      title: "6. Crisis Adrenal Aguda",
      subtitle: "Emergencia médica potencialmente mortal",
      preview: "Shock hemodinámico, hipotensión refractaria, hidrocortisona IV y solución salina.",
      bullets: [
        "Manifestaciones: shock circulatorio, deshidratación extrema, vómitos y fiebre.",
        "Tratamiento inmediato: Hidrocortisona IV (100 mg en bolo) seguida de dosis cada 6 horas.",
        "Rehidratación agresiva: Solución salina isotónica al 0.9% IV y dextrosa."
      ]
    }
  ],
  questions: [
    {
      question: "¿Cuál es una característica típica de la enfermedad de Addison?",
      options: [
        "Hiperpigmentación cutánea y de mucosas",
        "Hipertensión arterial grave",
        "Aumento de peso inexplicado",
        "Hipernatremia extrema"
      ],
      correctAnswer: 0
    },
    {
      question: "¿Qué alteración electrolítica es frecuente en estos pacientes?",
      options: [
        "Hipernatremia e hipopotasemia",
        "Hiponatremia e hiperpotasemia",
        "Hipercalcemia con hipernatremia",
        "Hiponatremia con hipopotasemia"
      ],
      correctAnswer: 1
    },
    {
      question: "En la insuficiencia suprarrenal primaria (Addison), la ACTH plasmática suele estar:",
      options: [
        "Muy disminuida o indetectable",
        "Dentro del rango de normalidad",
        "Elevada de forma compensatoria",
        "Suprimida por retroalimentación positiva"
      ],
      correctAnswer: 2
    },
    {
      question: "El tratamiento de reemplazo hormonal crónico estándar suele incluir:",
      options: [
        "Hidrocortisona (glucocorticoide) y fludrocortisona (mineralocorticoide)",
        "Únicamente dexametasona a dosis altas",
        "Levotiroxina e insulina de acción prolongada",
        "Espironolactona y diuréticos de asa"
      ],
      correctAnswer: 0
    },
    {
      question: "Una crisis adrenal aguda es una emergencia médica que puede presentarse típicamente con:",
      options: [
        "Hipertensión arterial severa y cefalea",
        "Shock circulatorio, hipotensión profunda y vómitos",
        "Fiebre leve y poliuria sin afectación hemodinámica",
        "Bradicardia extrema y parestesias transitorias"
      ],
      correctAnswer: 1
    },
    {
      question: "El nivel de cortisol sérico en un paciente con enfermedad de Addison primaria suele estar:",
      options: [
        "Significativamente elevado",
        "Normal durante las horas de la mañana",
        "Bajo, con pérdida de su ritmo circadiano",
        "Elevado únicamente en situaciones de estrés"
      ],
      correctAnswer: 2
    },
    {
      question: "La adrenalitis autoinmune (causa más frecuente en países desarrollados) afecta principalmente a la:",
      options: [
        "Médula suprarrenal, respetando la corteza",
        "Corteza suprarrenal (las tres capas)",
        "Adenohipófisis (hipófisis anterior)",
        "Neurohipófisis y glándula pineal"
      ],
      correctAnswer: 1
    }
  ]
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    // Formato: HH:MM - DD/MM
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const day = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    return `${time} - ${day}`;
  } catch (e) {
    return isoString;
  }
};

export default function TeacherPanel({ onGoToHome }) {
  // Activity Manager State
  const [activitiesList, setActivitiesList] = useState([]);
  const [selectedActivityCode, setSelectedActivityCode] = useState('ADDISON');
  const [activeActivity, setActiveActivity] = useState(null);

  // Monitoring Sync State
  const [results, setResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  // UI Modal Manager (Unified Create/Edit Modal)
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDirectExam, setNewDirectExam] = useState(false);
  
  // Gemini Form State
  const [isAiMode, setIsAiMode] = useState(true);
  const [aiTopic, setAiTopic] = useState('');
  const [aiNumQuestions, setAiNumQuestions] = useState(7);
  const [contextFileName, setContextFileName] = useState('');
  const [contextFileText, setContextFileText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Client-Side custom key configuration (for privacy / multi-teacher support)
  const [customApiKey, setCustomApiKey] = useState(
    () => localStorage.getItem('addison_custom_gemini_key') || ''
  );

  // Dynamic Editor Forms
  const [manualQuestions, setManualQuestions] = useState([]);
  const [manualFlowchart, setManualFlowchart] = useState([]);
  const [activeEditorTab, setActiveEditorTab] = useState('questions'); // 'questions' | 'cards'

  // Audio Alerts State
  const announcedAlertIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  // Fetch activities on mount
  useEffect(() => {
    refreshActivities();
  }, []);

  const refreshActivities = async () => {
    try {
      const list = await listActivities();
      const hasAddison = list.some(act => act.code === 'ADDISON');
      if (list.length === 0 || !hasAddison) {
        await saveActivity('ADDISON', defaultAddisonActivity);
        const updatedList = await listActivities();
        setActivitiesList(updatedList);
      } else {
        setActivitiesList(list);
      }
    } catch (e) {
      console.error("Error loading activities list:", e);
    }
  };

  // Listen to the selected activity's session config in real-time
  useEffect(() => {
    if (!selectedActivityCode) return;
    
    const unsubscribe = listenActivityConfig(selectedActivityCode, (data) => {
      setActiveActivity(data);
    });
    return () => unsubscribe();
  }, [selectedActivityCode]);

  // Reset audio alert registry when switching activities
  useEffect(() => {
    isFirstLoad.current = true;
    announcedAlertIds.current = new Set();
    setResults([]);
    setAlerts([]);
    setLoadingDashboard(true);
  }, [selectedActivityCode]);

  // Real-time synchronization for selected activity's Results & Alerts
  useEffect(() => {
    if (!selectedActivityCode) return;

    // Results listener
    const unsubscribeResults = listenResults(selectedActivityCode, (data) => {
      setResults(data);
      setLoadingDashboard(false);
    });

    // Alerts listener (Handles Teacher-side siren/voice alarm)
    const unsubscribeAlerts = listenAlerts(selectedActivityCode, (data) => {
      setAlerts(data);
      
      if (data.length === 0) return;

      // Skip old alerts on initial loading to prevent voice spam
      if (isFirstLoad.current) {
        data.forEach(alert => announcedAlertIds.current.add(alert.id));
        isFirstLoad.current = false;
        return;
      }

      // Identify new alerts that aren't announced yet
      const newAlerts = data.filter(alert => !announcedAlertIds.current.has(alert.id));
      if (newAlerts.length > 0) {
        newAlerts.forEach(newAlert => {
          announcedAlertIds.current.add(newAlert.id);
          
          // Trigger Audio Beeps
          playBuzzerAlarm();
          
          // Vocalize warning in Spanish
          const vocalText = `Alerta. El estudiante ${newAlert.studentName} cometió una falta por ${newAlert.message}.`;
          speakLatinSpanish(vocalText);
        });
      }
    });

    return () => {
      unsubscribeResults();
      unsubscribeAlerts();
    };
  }, [selectedActivityCode]);

  // Synthesize alarm sound on Teacher PC
  const playBuzzerAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (startTime, freq, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      playTone(audioCtx.currentTime, 587.33, 0.25); // D5
      playTone(audioCtx.currentTime + 0.3, 440.00, 0.25); // A4
      playTone(audioCtx.currentTime + 0.6, 587.33, 0.25);
    } catch (e) {
      console.warn("Teacher PC Buzzer synthesis failed:", e);
    }
  };

  // Vocalize warning on Teacher PC speaker
  const speakLatinSpanish = (text) => {
    try {
      if (!window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      const latinVoice = voices.find(v => v.lang === 'es-MX') ||
                         voices.find(v => v.lang === 'es-US') ||
                         voices.find(v => v.lang === 'es-CO') ||
                         voices.find(v => v.lang === 'es-AR') ||
                         voices.find(v => v.lang === 'es-CL') ||
                         voices.find(v => v.lang.startsWith('es'));
      
      if (latinVoice) {
        utterance.voice = latinVoice;
        utterance.lang = latinVoice.lang;
      } else {
        utterance.lang = 'es-ES';
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Teacher PC Speech synthesis failed:", e);
    }
  };

  // Toggle release lobby
  const handleToggleSession = async () => {
    if (!activeActivity) return;
    try {
      await saveActivity(selectedActivityCode, {
        sessionActive: !activeActivity.sessionActive
      });
    } catch (err) {
      console.error("Error toggling session status:", err);
    }
  };

  // Clear student records
  const handleClearData = async () => {
    if (window.confirm(`¿Estás seguro de restablecer la actividad "${selectedActivityCode}"? Todos los registros, notas y alertas serán borrados permanentemente.`)) {
      try {
        setIsClearing(true);
        await clearActivityData(selectedActivityCode);
      } catch (err) {
        console.error("Failed to clear activity:", err);
      } finally {
        setIsClearing(false);
      }
    }
  };

  // Delete dynamic activity
  const handleDeleteActivity = async (code) => {
    if (code === 'ADDISON') {
      alert("No se permite eliminar la actividad predeterminada ADDISON.");
      return;
    }
    if (window.confirm(`¿Deseas eliminar permanentemente la actividad "${code}"?`)) {
      try {
        await deleteActivity(code);
        if (selectedActivityCode === code) {
          setSelectedActivityCode('ADDISON');
        }
        refreshActivities();
      } catch (e) {
        console.error("Failed to delete activity:", e);
      }
    }
  };

  // Simulate warning
  const handleSimulateAlert = async () => {
    const studentNames = ["Dante Alighieri", "Marie Curie", "Albert Einstein", "Clara Barton", "Florence Nightingale"];
    const randomName = studentNames[Math.floor(Math.random() * studentNames.length)];
    const violations = ["salir de pantalla completa", "cambio de pestaña", "intento de copiar"];
    const violation = violations[Math.floor(Math.random() * violations.length)];
    
    try {
      await saveCheatingAlert(selectedActivityCode, {
        studentName: randomName,
        type: 'Falta Simulada',
        message: `Infracción proctoring: ${violation}`,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Open Edit Mode
  const handleOpenEditModal = () => {
    if (!activeActivity) return;
    setIsEditMode(true);
    setNewCode(activeActivity.code);
    setNewTitle(activeActivity.title);
    setNewDirectExam(activeActivity.directExam);
    setManualQuestions(activeActivity.questions || []);
    setManualFlowchart(activeActivity.flowchart || []);
    setIsAiMode(false); // Go directly to editor
    setActiveEditorTab('questions');
    setShowConfigModal(true);
  };

  // Read context files (.txt, .md) on the client side
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setContextFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setContextFileText(event.target.result);
    };
    reader.readAsText(file);
  };

  // Call Google Gemini API to generate Clinical Activity JSON
  const handleGenerateWithGemini = async () => {
    if (!aiTopic.trim()) {
      alert("Por favor escribe el tema clínico que deseas generar.");
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || customApiKey.trim();
    if (!apiKey) {
      alert("Error: No se ha configurado ninguna clave de Gemini API. Por favor, ingresa tu clave personal abajo.");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Actúa como un experto en educación médica y crea un reto interactivo sobre el siguiente tema: ${aiTopic}.
                    Genera exactamente 6 tarjetas de estudio (flowchart) con título, subtítulo, resumen (preview) y de 3 a 5 puntos clave (bullets) explicando la fisiopatología, diagnóstico o tratamiento.
                    Genera exactamente ${aiNumQuestions} preguntas de opción múltiple (con 4 opciones de respuesta y el índice correcto en correctAnswer, de 0 a 3).
                    Utiliza este documento como contexto para extraer la información y preguntas: ${contextFileText || 'Ninguno'}
                    Asegúrate de estructurar la respuesta EXACTAMENTE según el JSON Schema solicitado.`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  flowchart: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        title: { type: "STRING" },
                        subtitle: { type: "STRING" },
                        preview: { type: "STRING" },
                        bullets: { type: "ARRAY", items: { type: "STRING" } }
                      },
                      required: ["title", "subtitle", "preview", "bullets"]
                    }
                  },
                  questions: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        question: { type: "STRING" },
                        options: { type: "ARRAY", items: { type: "STRING" } },
                        correctAnswer: { type: "INTEGER" }
                      },
                      required: ["question", "options", "correctAnswer"]
                    }
                  }
                },
                required: ["title", "flowchart", "questions"]
              }
            }
          })
        }
      );

      const resData = await response.json();
      if (resData.error) {
        throw new Error(resData.error.message);
      }
      const textResponse = resData.candidates[0].content.parts[0].text;
      const parsedJson = JSON.parse(textResponse);

      setNewTitle(parsedJson.title || newTitle);
      setManualQuestions(parsedJson.questions || []);
      setManualFlowchart(parsedJson.flowchart || []);
      
      alert("¡Actividad generada con Gemini AI con éxito! Revisa la información a continuación y haz clic en 'Guardar Actividad' para publicarla.");
      setIsAiMode(false); // Switch to editor mode to preview
    } catch (e) {
      console.error("Gemini Generation failed:", e);
      alert(`Error al generar con Gemini: ${e.message || "Verifica tu clave API y conexión."}`);
    } finally {
      setAiGenerating(false);
    }
  };

  // Save custom Gemini API key locally
  const handleSaveCustomKey = (keyVal) => {
    setCustomApiKey(keyVal);
    localStorage.setItem('addison_custom_gemini_key', keyVal.trim());
  };

  // Save/Update Activity in Firestore
  const handleSaveCreatedActivity = async () => {
    if (!newCode.trim()) {
      alert("Ingresa un código único para la actividad.");
      return;
    }
    if (!newTitle.trim()) {
      alert("Ingresa el título de la actividad.");
      return;
    }
    if (manualQuestions.length === 0) {
      alert("La actividad debe tener al menos una pregunta.");
      return;
    }

    try {
      const codeUpper = newCode.trim().toUpperCase();
      const activityPayload = {
        code: codeUpper,
        title: newTitle.trim(),
        directExam: newDirectExam,
        questions: manualQuestions,
        flowchart: newDirectExam ? [] : (manualFlowchart.length > 0 ? manualFlowchart : defaultAddisonActivity.flowchart)
      };

      // Keep sessionActive if editing
      if (isEditMode && activeActivity) {
        activityPayload.sessionActive = activeActivity.sessionActive;
      } else {
        activityPayload.sessionActive = false;
      }

      await saveActivity(codeUpper, activityPayload);
      alert(`Actividad ${codeUpper} guardada con éxito.`);
      setShowConfigModal(false);
      
      // Reset forms
      setNewCode('');
      setNewTitle('');
      setNewDirectExam(false);
      setManualQuestions([]);
      setManualFlowchart([]);
      setAiTopic('');
      setContextFileName('');
      setContextFileText('');

      refreshActivities();
      setSelectedActivityCode(codeUpper);
    } catch (err) {
      console.error(err);
      alert("Fallo al guardar la actividad en la base de datos.");
    }
  };

  // Helper values
  const rankingList = [...results]
    .filter(r => r.estado && r.estado !== 'descalificado' && r.estado !== 'registrado')
    .sort((a, b) => {
      if (b.puntaje !== a.puntaje) {
        return b.puntaje - a.puntaje;
      }
      return parseTimeToSeconds(a.tiempo) - parseTimeToSeconds(b.tiempo);
    });

  const suggestedWinner = rankingList.length > 0 ? rankingList[0] : null;

  // Check if Gemini key is available in environment
  const isServerKeyAvailable = !!import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div className="teacher-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'stretch' }}>
      
      {/* 📁 Left Sidebar - Activity CRUD */}
      <aside className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>
          <BookOpen size={16} />
          <span>AULAS Y ACTIVIDADES</span>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => {
            setIsEditMode(false);
            setNewCode('');
            setNewTitle('');
            setNewDirectExam(false);
            setManualQuestions([]);
            setManualFlowchart([]);
            setIsAiMode(true);
            setShowConfigModal(true);
          }}
          style={{ padding: '0.6rem', fontSize: '0.85rem', width: '100%', gap: '0.25rem' }}
        >
          <Plus size={16} />
          Nueva actividad
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '420px', marginTop: '0.5rem' }}>
          {activitiesList.map((act) => {
            const isSelected = selectedActivityCode === act.code;
            return (
              <div 
                key={act.code}
                className={`option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedActivityCode(act.code)}
                style={{ 
                  padding: '0.65rem 0.85rem', 
                  fontSize: '0.85rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'var(--bg-panel)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                    {act.code}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                    {act.title}
                  </span>
                </div>
                {act.code !== 'ADDISON' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteActivity(act.code);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    className="delete-icon-btn"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* 🖥️ Right Main Area - Real-time Proctoring Dashboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Banner header */}
        <div className="teacher-header">
          <div className="teacher-title-area">
            <h2 style={{ fontSize: '2rem' }}>
              {activeActivity ? activeActivity.title : "Cargando..."}
            </h2>
            <p>
              Código de acceso para estudiantes: <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>{selectedActivityCode}</strong>
              {activeActivity?.directExam && <span style={{ marginLeft: '1rem', color: 'var(--warning)', fontSize: '0.85rem', border: '1px solid var(--warning)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>Modo: Examen Directo</span>}
            </p>
          </div>

          <div className="teacher-controls">
            <button 
              className={`btn ${activeActivity?.sessionActive ? 'btn-danger' : 'btn-primary'}`} 
              onClick={handleToggleSession}
              style={{
                background: activeActivity?.sessionActive ? 'linear-gradient(135deg, var(--warning) 0%, hsl(30, 80%, 45%) 100%)' : undefined,
                color: activeActivity?.sessionActive ? 'var(--text-main)' : undefined
              }}
            >
              {activeActivity?.sessionActive ? (
                <>
                  <PauseCircle size={18} />
                  <span>Pausar clase</span>
                </>
              ) : (
                <>
                  <PlayCircle size={18} />
                  <span>Iniciar clase</span>
                </>
              )}
            </button>

            {/* ✏️ Edit Active Activity Button */}
            <button 
              className="btn btn-secondary" 
              onClick={handleOpenEditModal}
              style={{ borderColor: 'var(--primary-border)' }}
            >
              <Edit size={16} style={{ color: 'var(--primary)' }} />
              Editar contenido
            </button>

            <button className="btn btn-secondary" onClick={onGoToHome}>
              Cerrar Sesión
            </button>

            <button className="btn btn-secondary" onClick={handleSimulateAlert} style={{ borderColor: 'var(--warning-border)' }}>
              <Sparkles size={16} style={{ color: 'var(--warning)' }} />
              Simular Alerta
            </button>

            <button className="btn btn-danger" onClick={handleClearData} disabled={isClearing || (results.length === 0 && alerts.length === 0)}>
              <Trash2 size={16} />
              Limpiar Datos
            </button>
          </div>
        </div>

        {/* Suggested Winner */}
        {suggestedWinner ? (
          <div className="winner-banner">
            <div className="winner-icon">
              <Trophy size={28} />
            </div>
            <div className="winner-details">
              <h3>Ganador sugerido de la sesión</h3>
              <p style={{ fontSize: '1.25rem' }}>
                <strong>{suggestedWinner.nombre}</strong> — {suggestedWinner.puntaje} puntos en {suggestedWinner.tiempo}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                (Mayor calificación en menor tiempo de respuesta, excluyendo descalificaciones)
              </span>
            </div>
          </div>
        ) : (
          <div className="winner-banner" style={{ background: 'var(--bg-card-glass)', borderColor: 'var(--border-color)' }}>
            <div className="winner-icon" style={{ background: 'var(--border-color)', color: 'var(--text-muted)' }}>
              <Users size={28} />
            </div>
            <div className="winner-details">
              <h3 style={{ color: 'var(--text-muted)' }}>Sin Ganador Sugerido</h3>
              <p style={{ color: 'var(--text-muted)' }}>Aún no hay estudiantes calificados en la sesión actual.</p>
            </div>
          </div>
        )}

        {/* Sync logs grid */}
        <div className="dashboard-grid">
          
          {/* Active registrations */}
          <div className="results-table-container">
            <div className="card panel-card">
              <h3>
                <FileSpreadsheet size={18} className="logo-icon" />
                Estudiantes de la sesión ({results.length})
              </h3>
              
              {loadingDashboard ? (
                <div className="empty-state">Sincronizando base de datos...</div>
              ) : results.length === 0 ? (
                <div className="empty-state">
                  <Users />
                  <p>Esperando registros de estudiantes con el código <strong>{selectedActivityCode}</strong>...</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Calificación</th>
                        <th>Tiempo</th>
                        <th>Estado</th>
                        <th>Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((res) => {
                        const isCheater = res.estado === 'descalificado';
                        return (
                          <tr key={res.id}>
                            <td style={{ fontWeight: '600', color: isCheater ? 'var(--danger)' : 'var(--text-main)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{res.nombre}</span>
                                {isCheater && (
                                  <span style={{ color: 'var(--danger)', fontSize: '0.7rem', fontWeight: '800', background: 'var(--danger-glow)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                                    <AlertCircle size={10} />
                                    <span>⚠️ ¡HIZO TRAMPA!</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>
                              {res.estado === 'registrado' ? '—' : `${res.puntaje} / ${activeActivity?.questions?.length || 7}`}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>
                              {res.estado === 'registrado' ? '—' : (res.tiempo || '0:00')}
                            </td>
                            <td>
                              {res.estado === 'registrado' ? (
                                <span className="badge" style={{ background: 'var(--warning-glow)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Lobby / Espera</span>
                              ) : isCheater ? (
                                <span className="badge badge-danger">Descalificado</span>
                              ) : (
                                <span className="badge badge-success">Completado</span>
                              )}
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {formatDateTime(res.fecha)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Cheating alerts */}
          <div className="alerts-list-container">
            <div className="card panel-card">
              <h3>
                <BellRing size={18} style={{ color: 'var(--danger)' }} />
                Registro de Alertas de Aula ({alerts.length})
              </h3>
              
              {alerts.length === 0 ? (
                <div className="empty-state">
                  <Clock />
                  <p>No se han detectado alertas de fraude en esta sesión.</p>
                </div>
              ) : (
                <div className="alerts-scrollable">
                  {alerts.map((alertItem) => (
                    <div key={alertItem.id} className="alert-item">
                      <div className="alert-item-header">
                        <span className="alert-student-name">
                          <AlertTriangle size={14} />
                          {alertItem.studentName}
                        </span>
                        <span className="alert-time">
                          {formatDateTime(alertItem.createdAt)}
                        </span>
                      </div>
                      <p className="alert-message">{alertItem.message}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span className="alert-badge">{alertItem.type || 'Supervisión'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ➕ Configuration Modal - Gemini Integration & Live CRUD Editor */}
      {showConfigModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="detail-modal" style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setShowConfigModal(false)}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              {isEditMode ? <Edit className="logo-icon" size={24} /> : <Plus className="logo-icon" size={24} />}
              <h2>{isEditMode ? `Editar Actividad: ${newCode}` : "Configurar Nueva Actividad"}</h2>
            </div>

            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Código único</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej. CUSHING"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  disabled={isEditMode}
                  style={{ fontFamily: 'var(--font-mono)', opacity: isEditMode ? 0.6 : 1 }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Título de Actividad</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej. Síndrome de Cushing Challenge"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={newDirectExam} 
                    onChange={(e) => {
                      setNewDirectExam(e.target.checked);
                      if (e.target.checked) setManualFlowchart([]); // Clear flow if direct
                    }} 
                    style={{ scale: '1.2', marginRight: '4px' }}
                  />
                  Examen Directo
                </label>
              </div>
            </div>

            {/* AI Generator tab toggles (Hidden in Edit Mode to focus on modifications) */}
            {!isEditMode && (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button 
                  type="button" 
                  className={`btn ${isAiMode ? 'btn-primary' : 'btn-ghost'}`} 
                  onClick={() => setIsAiMode(true)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Sparkles size={14} />
                  Generar con Gemini AI
                </button>
                
                <button 
                  type="button" 
                  className={`btn ${!isAiMode ? 'btn-primary' : 'btn-ghost'}`} 
                  onClick={() => setIsAiMode(false)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <FileSpreadsheet size={14} />
                  Editor Manual ({manualQuestions.length})
                </button>
              </div>
            )}

            {/* TAB A: Gemini Generative IA Form */}
            {isAiMode && !isEditMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(255,255,255,0.01)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {!isServerKeyAvailable && (
                  <div style={{ background: 'var(--warning-glow)', border: '1px solid var(--warning)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <KeyRound size={14} />
                      Clave de Gemini API Requerida
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Ingresa tu clave API personal de Google AI Studio para usar el generador (se guarda en tu localStorage):
                    </p>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Pega tu clave AI Studio aquí..."
                      value={customApiKey}
                      onChange={(e) => handleSaveCustomKey(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Tema Clínico (Ej. Fisiopatología de Diabetes Tipo 1)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Escribe el tema médico detallado..."
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label className="input-label">Número de preguntas</label>
                    <select 
                      className="form-control" 
                      value={aiNumQuestions}
                      onChange={(e) => setAiNumQuestions(parseInt(e.target.value))}
                    >
                      <option value={3}>3 Preguntas</option>
                      <option value={5}>5 Preguntas</option>
                      <option value={7}>7 Preguntas</option>
                      <option value={10}>10 Preguntas</option>
                      <option value={15}>15 Preguntas</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Upload size={13} />
                      Subir archivo de contexto (.txt, .md)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="file" 
                        accept=".txt,.md" 
                        onChange={handleFileUpload} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-panel)', color: contextFileName ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <FileText size={16} />
                        <span>{contextFileName || "Seleccionar archivo..."}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleGenerateWithGemini}
                  disabled={aiGenerating}
                  style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="logo-icon" size={16} style={{ animation: 'spin 2s linear infinite' }} />
                      <span>Generando Caso con Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generar Caso e Interacciones</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // TAB B: Dynamic Manual Editor (Questions and flowchart cards)
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Editor subtabs (Questions vs Flowchart cards) */}
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '8px' }}>
                  <button
                    type="button"
                    className={`btn ${activeEditorTab === 'questions' ? 'btn-secondary' : 'btn-ghost'}`}
                    onClick={() => setActiveEditorTab('questions')}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', flex: 1 }}
                  >
                    <ListTodo size={14} style={{ marginRight: '4px' }} />
                    Preguntas del Examen ({manualQuestions.length})
                  </button>
                  
                  {!newDirectExam && (
                    <button
                      type="button"
                      className={`btn ${activeEditorTab === 'cards' ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => {
                        // Initialize flowchart structure if empty
                        if (manualFlowchart.length === 0) {
                          setManualFlowchart(
                            Array.from({ length: 6 }, (_, i) => ({
                              title: `${i + 1}. Módulo de Estudio`,
                              subtitle: "Subtítulo explicativo",
                              preview: "Resumen corto de la tarjeta.",
                              bullets: ["Punto informativo 1", "Punto informativo 2"]
                            }))
                          );
                        }
                        setActiveEditorTab('cards');
                      }}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', flex: 1 }}
                    >
                      <BookOpen size={14} style={{ marginRight: '4px' }} />
                      Tarjetas de Estudio ({manualFlowchart.length})
                    </button>
                  )}
                </div>

                {/* Subtab 1: Questions Editor */}
                {activeEditorTab === 'questions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ color: 'var(--primary)' }}>Cuestionario de Preguntas</h4>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setManualQuestions([
                            ...manualQuestions,
                            { question: 'Escribe el enunciado de la pregunta aquí...', options: ['', '', '', ''], correctAnswer: 0 }
                          ]);
                        }}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        + Agregar Pregunta
                      </button>
                    </div>

                    {manualQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Pregunta {qIdx + 1}</span>
                          <button 
                            type="button" 
                            onClick={() => setManualQuestions(manualQuestions.filter((_, i) => i !== qIdx))}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Eliminar
                          </button>
                        </div>

                        <input 
                          type="text" 
                          className="form-control" 
                          value={q.question} 
                          onChange={(e) => {
                            const updated = [...manualQuestions];
                            updated[qIdx].question = e.target.value;
                            setManualQuestions(updated);
                          }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              <input 
                                type="radio" 
                                name={`correct-${qIdx}`} 
                                checked={q.correctAnswer === oIdx}
                                onChange={() => {
                                  const updated = [...manualQuestions];
                                  updated[qIdx].correctAnswer = oIdx;
                                  setManualQuestions(updated);
                                }}
                              />
                              <input 
                                type="text" 
                                className="form-control" 
                                style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={opt} 
                                placeholder={`Opción ${oIdx + 1}`}
                                onChange={(e) => {
                                  const updated = [...manualQuestions];
                                  updated[qIdx].options[oIdx] = e.target.value;
                                  setManualQuestions(updated);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtab 2: Flowchart Cards Editor */}
                {activeEditorTab === 'cards' && !newDirectExam && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ color: 'var(--primary)' }}>Tarjetas del Flujograma de Estudio</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mínimo sugerido: 6 módulos</span>
                    </div>

                    {manualFlowchart.map((card, cIdx) => (
                      <div key={cIdx} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Módulo {cIdx + 1}</span>
                          <button 
                            type="button" 
                            onClick={() => setManualFlowchart(manualFlowchart.filter((_, i) => i !== cIdx))}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Eliminar módulo
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>Título de Tarjeta</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={card.title} 
                              onChange={(e) => {
                                const updated = [...manualFlowchart];
                                updated[cIdx].title = e.target.value;
                                setManualFlowchart(updated);
                              }}
                            />
                          </div>

                          <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>Subtítulo Explicativo</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={card.subtitle} 
                              onChange={(e) => {
                                const updated = [...manualFlowchart];
                                updated[cIdx].subtitle = e.target.value;
                                setManualFlowchart(updated);
                              }}
                            />
                          </div>
                        </div>

                        <div className="input-group">
                          <label className="input-label" style={{ fontSize: '0.75rem' }}>Resumen Corto (Vista previa)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={card.preview} 
                            onChange={(e) => {
                              const updated = [...manualFlowchart];
                              updated[cIdx].preview = e.target.value;
                              setManualFlowchart(updated);
                            }}
                          />
                        </div>

                        <div className="input-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>Puntos Clave (Bullets)</label>
                            <button 
                              type="button" 
                              onClick={() => {
                                const updated = [...manualFlowchart];
                                updated[cIdx].bullets = [...(updated[cIdx].bullets || []), "Nuevo punto clave..."];
                                setManualFlowchart(updated);
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                            >
                              + Agregar Bullet
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {(card.bullets || []).map((bullet, bIdx) => (
                              <div key={bIdx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                  value={bullet} 
                                  onChange={(e) => {
                                    const updated = [...manualFlowchart];
                                    updated[cIdx].bullets[bIdx] = e.target.value;
                                    setManualFlowchart(updated);
                                  }}
                                />
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const updated = [...manualFlowchart];
                                    updated[cIdx].bullets = updated[cIdx].bullets.filter((_, i) => i !== bIdx);
                                    setManualFlowchart(updated);
                                  }}
                                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setManualFlowchart([
                          ...manualFlowchart,
                          { title: 'Nuevo módulo', subtitle: 'Subtítulo', preview: 'Descripción', bullets: [] }
                        ]);
                      }}
                      style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                    >
                      + Agregar Tarjeta de Estudio
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowConfigModal(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSaveCreatedActivity}
              >
                {isEditMode ? "Guardar Cambios" : "Guardar Actividad"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
