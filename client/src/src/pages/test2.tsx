import React, { useState } from "react";
import QuestionComponent from "../components/QuestionComponent";
import TTSQuestionComponent from "../components/AudioComponent";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const sampleQuestion: Question[] = [
  {
    id: "1",
    question: "Quelle est la capitale de la France ?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswer: "Paris",
  },
  {
    id: "2",
    question: "Quel est le plus grand océan du monde ?",
    options: ["Atlantique", "Indien", "Arctique", "Pacifique"],
    correctAnswer: "Pacifique",
  },
  {
    id: "3",
    question: "Qui a écrit 'Les Misérables' ?",
    options: [
      "Victor Hugo",
      "Émile Zola",
      "Charles Baudelaire",
      "Gustave Flaubert",
    ],
    correctAnswer: "Victor Hugo",
  },
];

const sampleAudioQuestion = [{
  id: "audio1",
  question: "Choisir la trudiction du mot cheval.",
  options: [
    "Horse",
    "Dog",
    "Cat",
    "Bird"
  ],
  correctAnswer: "Horse",
},
{
  id: "audio2",
  question: "Choisir la trudiction du mot maison.",
  options: [
    "Car",
    "House",
    "Tree",
    "River"
  ],
  correctAnswer: "House",
}]

export default function Test2() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const fetchAnswer = async (id: string, isCorrect: boolean): Promise<string> => {
    // Simule un appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        if (isCorrect) {
          setScore((prev) => prev + 1);
          resolve("Correct! Bien joué.");
        } else {
          resolve("Incorrect. Réessaie la prochaine fois.");
        }
      }, 300);
    });
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < sampleAudioQuestion.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setShowScore(true);
    }
  };

  const restart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
  };

  const current = sampleAudioQuestion[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 text-[#111827]">
      <h1 className="text-3xl font-bold mb-6">Quiz de Culture Générale</h1>

      {showScore ? (
        <div className="bg-white p-6 rounded-2xl shadow-2xl text-center">
          <h2 className="text-2xl font-semibold mb-4">Votre score</h2>
          <p className="text-xl mb-6">
            {score} / {sampleAudioQuestion.length}
          </p>
          <button
            onClick={restart}
            className="px-6 py-3 rounded-2xl bg-[#3B82F6] text-white shadow-md hover:scale-105 active:scale-95 transition"
          >
            Recommencer
          </button>
        </div>
      ) : (
        <>
          {/* ✅ key force le remontage pour réinitialiser l'état interne */}
          <TTSQuestionComponent
            key={current.id}
            question={current}
            fetchAnswer={fetchAnswer}
          />

          <button
            onClick={handleNextQuestion}
            className="mt-4 px-6 py-3 rounded-2xl bg-[#3B82F6] text-white shadow-md hover:scale-105 active:scale-95 transition"
          >
            Question suivante
          </button>
        </>
      )}
    </div>
  );
}
