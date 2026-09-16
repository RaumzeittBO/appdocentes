import assert from 'node:assert/strict';
import {
  calculateAntiCheatPenalty,
  calculateQuestionPoints,
  rankGameResults
} from '../src/utils/gameLogic.js';

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const students = Array.from({ length: 30 }, (_, index) => {
  const correctas = 15 - (index % 8);
  const seconds = 105 + (index * 4);
  const warnings = [5, 12, 21].includes(index) ? ((index % 3) + 1) : 0;
  let rawScore = 0;
  let streak = 0;

  for (let question = 0; question < 15; question += 1) {
    const isCorrect = question < correctas;
    streak = isCorrect ? streak + 1 : 0;
    rawScore += calculateQuestionPoints({
      isCorrect,
      secondsRemaining: 22 - ((index + question) % 12),
      streak
    });
  }

  const penalty = Array.from({ length: warnings }, (_, warning) => (
    calculateAntiCheatPenalty(warning + 1)
  )).reduce((total, value) => total + value, 0);

  return {
    id: `student-${index + 1}`,
    nombre: `Estudiante ${String(index + 1).padStart(2, '0')}`,
    correctas,
    totalPreguntas: 15,
    precision: correctas / 15,
    puntaje: Math.max(0, rawScore - penalty),
    rachaMax: correctas,
    advertencias: warnings,
    penalizacion: penalty,
    tiempo: formatTime(seconds),
    estado: 'completado'
  };
});

const ranking = rankGameResults(students, 15);
const winners = ranking.slice(0, 4);
const warnedStudents = students.filter((student) => student.advertencias > 0);

assert.equal(students.length, 30, 'Deben participar exactamente 30 estudiantes ficticios');
assert.equal(winners.length, 4, 'El podio debe contener exactamente 4 ganadores');
assert.equal(new Set(ranking.map((student) => student.id)).size, 30, 'No debe haber estudiantes duplicados');
assert.equal(warnedStudents.length, 3, 'El simulacro debe incluir 3 alumnos con alertas');
assert.ok(warnedStudents.every((student) => student.penalizacion > 0), 'Cada alerta debe descontar puntos');
assert.ok(ranking.every((student, index) => index === 0 || ranking[index - 1].precision >= student.precision), 'La precision debe dominar el ranking');

console.log('SIMULACRO AULANOVA: APROBADO');
console.log(`Participantes procesados: ${students.length}`);
console.log(`Examen: 15 preguntas por estudiante (${students.length * 15} respuestas evaluadas)`);
console.log(`Alertas antitrampa simuladas: ${warnedStudents.reduce((total, student) => total + student.advertencias, 0)}`);
console.log(`Estudiantes penalizados: ${warnedStudents.map((student) => student.nombre).join(', ')}`);
console.log('Podio final:');
winners.forEach((student, index) => {
  console.log(`${index + 1}. ${student.nombre} | ${student.correctas}/15 | ${student.puntaje} pts | ${student.tiempo}`);
});
