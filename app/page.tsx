"use client";

import { useState } from "react";

const questions = [
  {
    question: "You're outside a building when the enemy calls in a Cruise Missile. Your teammates are eliminated. You're now in a 1v4. What should you prioritize?",
    answers: [
      "Sprint toward the nearest enemy",
      "Get inside and use the building to limit enemy angles",
      "Stay completely still in the open",
      "Reload and challenge the enemy team"
    ],
    correct: 1,
  },
  {
    question: "You know the enemy team has your general location. What's the smartest next move?",
    answers: [
      "Keep holding the exact same angle",
      "Move unpredictably while maintaining cover",
      "Run directly toward them",
      "Turn around and ignore them"
    ],
    correct: 1,
  },
];

export default function Home() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  function answer(index: number) {
    if (index === questions[question].correct) {
      setScore(score + 1);
    }

    if (question + 1 < questions.length) {
      setQuestion(question + 1);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setStarted(false);
    setQuestion(0);
    setScore(0);
    setFinished(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        {!started ? (
          <>
            <p className="text-sm tracking-[0.3em] text-red-500 mb-4">
              CALL OF DUTY
            </p>

            <h1 className="text-5xl font-black mb-4">
              COD GAME IQ
            </h1>

            <p className="text-gray-400 mb-8">
              Test your decision-making, awareness, positioning,
              and overall game sense.
            </p>

            <button
              onClick={() => setStarted(true)}
              className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold"
            >
              START IQ TEST
            </button>
          </>
        ) : finished ? (
          <>
            <p className="text-red-500 tracking-widest text-sm mb-3">
              TEST COMPLETE
            </p>

            <h2 className="text-4xl font-black mb-4">
              Your IQ Score
            </h2>

            <p className="text-6xl font-black mb-8">
              {score}/{questions.length}
            </p>

            <button
              onClick={restart}
              className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold"
            >
              RETAKE TEST
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-3">
              Question {question + 1} of {questions.length}
            </p>

            <h2 className="text-2xl font-bold mb-8">
              {questions[question].question}
            </h2>

            <div className="space-y-4">
              {questions[question].answers.map((choice, index) => (
                <button
                  key={choice}
                  onClick={() => answer(index)}
                  className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-red-500 px-5 py-4 rounded-xl"
                >
                  {answer}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
