"use client";

import { useState } from "react";

type Scores = {
  decisionMaking: number;
  mapAwareness: number;
  teamIQ: number;
  objectiveIQ: number;
  gunfightIQ: number;
  adaptability: number;
};

type Answer = {
  text: string;
  scores: Scores;
};

type Question = {
  question: string;
  answers: Answer[];
};

const questions: Question[] = [
  {
    question:
      "You're outside a building when the enemy calls in a Cruise Missile. Your teammates are eliminated. You're now in a 1v4. What should you prioritize?",
    answers: [
      {
        text: "Sprint toward the nearest enemy",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: 0,
          objectiveIQ: 0,
          gunfightIQ: 3,
          adaptability: -1,
        },
      },
      {
        text: "Get inside and use the building to limit enemy angles",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 1,
          objectiveIQ: 1,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Stay completely still in the open",
        scores: {
          decisionMaking: -4,
          mapAwareness: -4,
          teamIQ: 0,
          objectiveIQ: 0,
          gunfightIQ: -1,
          adaptability: -3,
        },
      },
      {
        text: "Reload and challenge the enemy team",
        scores: {
          decisionMaking: -1,
          mapAwareness: 0,
          teamIQ: 0,
          objectiveIQ: 0,
          gunfightIQ: 4,
          adaptability: -2,
        },
      },
    ],
  },

  {
    question:
      "You know the enemy team has your general location. What's the smartest next move?",
    answers: [
      {
        text: "Keep holding the exact same angle",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: 0,
          objectiveIQ: 0,
          gunfightIQ: 2,
          adaptability: -4,
        },
      },
      {
        text: "Run directly toward them",
        scores: {
          decisionMaking: -2,
          mapAwareness: -2,
          teamIQ: -1,
          objectiveIQ: 0,
          gunfightIQ: 4,
          adaptability: 1,
        },
      },
      {
        text: "Turn around and ignore them",
        scores: {
          decisionMaking: -1,
          mapAwareness: -3,
          teamIQ: 0,
          objectiveIQ: -1,
          gunfightIQ: 0,
          adaptability: -2,
        },
      },
      {
        text: "Move unpredictably while maintaining cover",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 1,
          objectiveIQ: 1,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
    ],
  },

  {
    question:
      "You're playing BO7 Ranked Hardpoint on Sake. Your team has control of the current hill, but the next hill is about to become active. You are the closest player to the next hill while your teammates are still fighting for the current one. What is the highest-value decision?",
    answers: [
      {
        text: "Rotate toward the next hill and establish position before it activates",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 3,
          objectiveIQ: 4,
          gunfightIQ: 1,
          adaptability: 3,
        },
      },
      {
        text: "Stay on the current hill no matter what",
        scores: {
          decisionMaking: 0,
          mapAwareness: -1,
          teamIQ: 2,
          objectiveIQ: 1,
          gunfightIQ: 1,
          adaptability: -2,
        },
      },
      {
        text: "Leave the hill and immediately chase an enemy across the map",
        scores: {
          decisionMaking: -3,
          mapAwareness: -2,
          teamIQ: -2,
          objectiveIQ: -4,
          gunfightIQ: 4,
          adaptability: -1,
        },
      },
      {
        text: "Ignore the objective and look for kills",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -3,
          objectiveIQ: -4,
          gunfightIQ: 4,
          adaptability: -1,
        },
      },
    ],
  },

  {
    question:
      "You're in a BO7 Ranked Search and Destroy round. Your team has a 3v2 advantage, and you know where one enemy is, but you haven't located the last enemy. What is the best approach?",
    answers: [
      {
        text: "Split up completely and challenge both sides alone",
        scores: {
          decisionMaking: -2,
          mapAwareness: -2,
          teamIQ: -3,
          objectiveIQ: 0,
          gunfightIQ: 3,
          adaptability: -1,
        },
      },
      {
        text: "Push directly into the known enemy without waiting for teammates",
        scores: {
          decisionMaking: -2,
          mapAwareness: 0,
          teamIQ: -2,
          objectiveIQ: -1,
          gunfightIQ: 4,
          adaptability: 0,
        },
      },
      {
        text: "Slow the pace, maintain the numbers advantage, and force the remaining enemy to make the first mistake",
        scores: {
          decisionMaking: 4,
          mapAwareness: 3,
          teamIQ: 4,
          objectiveIQ: 3,
          gunfightIQ: 1,
          adaptability: 4,
        },
      },
      {
        text: "Sprint around the map looking for the last player",
        scores: {
          decisionMaking: -3,
          mapAwareness: -2,
          teamIQ: -2,
          objectiveIQ: -1,
          gunfightIQ: 3,
          adaptability: -2,
        },
      },
    ],
  },

  {
    question:
      "You're playing BO7 Ranked Overload. Your team has the objective device and is trying to move it toward an enemy zone. Two teammates are ahead fighting, while you're slightly behind with the device. The enemy team is starting to collapse on your route. What is the best decision?",
    answers: [
      {
        text: "Push forward alone with the device regardless of the enemy setup",
        scores: {
          decisionMaking: -2,
          mapAwareness: -2,
          teamIQ: -2,
          objectiveIQ: 1,
          gunfightIQ: 3,
          adaptability: -2,
        },
      },
      {
        text: "Wait for your teammates to create space and coordinate the next push",
        scores: {
          decisionMaking: 4,
          mapAwareness: 3,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 1,
          adaptability: 4,
        },
      },
      {
        text: "Drop the objective and chase the enemy players",
        scores: {
          decisionMaking: -3,
          mapAwareness: -1,
          teamIQ: -3,
          objectiveIQ: -4,
          gunfightIQ: 4,
          adaptability: -1,
        },
      },
      {
        text: "Run toward a completely different area of the map",
        scores: {
          decisionMaking: -2,
          mapAwareness: -2,
          teamIQ: -2,
          objectiveIQ: -3,
          gunfightIQ: 0,
          adaptability: -2,
        },
      },
    ],
  },
];

function shuffleAnswers(answers: Answer[]) {
  return [...answers].sort(() => Math.random() - 0.5);
}

function createEmptyScores(): Scores {
  return {
    decisionMaking: 0,
    mapAwareness: 0,
    teamIQ: 0,
    objectiveIQ: 0,
    gunfightIQ: 0,
    adaptability: 0,
  };
}

function calculateCategoryScore(value: number, questionCount: number) {
  const maxPossible = questionCount * 4;
  const minPossible = questionCount * -4;

  const percentage =
    ((value - minPossible) / (maxPossible - minPossible)) * 100;

  return Math.max(0, Math.min(100, Math.round(percentage)));
}

function getPlayerType(scores: Scores) {
  const categories = [
    { name: "Decision Maker", value: scores.decisionMaking },
    { name: "Map Controller", value: scores.mapAwareness },
    { name: "Team Player", value: scores.teamIQ },
    { name: "Objective Specialist", value: scores.objectiveIQ },
    { name: "Gunfighter", value: scores.gunfightIQ },
    { name: "Adaptive Playmaker", value: scores.adaptability },
  ];

  categories.sort((a, b) => b.value - a.value);

  return categories[0].name;
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(0);
  const [score, setScore] = useState<Scores>(createEmptyScores());
  const [finished, setFinished] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  function startTest() {
    const randomizedQuestions = questions.map((q) => ({
      ...q,
      answers: shuffleAnswers(q.answers),
    }));

    setShuffledQuestions(randomizedQuestions);
    setQuestion(0);
    setScore(createEmptyScores());
    setFinished(false);
    setStarted(true);
  }

  function answer(selectedAnswer: Answer) {
    const newScore = {
      decisionMaking:
        score.decisionMaking + selectedAnswer.scores.decisionMaking,
      mapAwareness: score.mapAwareness + selectedAnswer.scores.mapAwareness,
      teamIQ: score.teamIQ + selectedAnswer.scores.teamIQ,
      objectiveIQ: score.objectiveIQ + selectedAnswer.scores.objectiveIQ,
      gunfightIQ: score.gunfightIQ + selectedAnswer.scores.gunfightIQ,
      adaptability: score.adaptability + selectedAnswer.scores.adaptability,
    };

    setScore(newScore);

    if (question + 1 < shuffledQuestions.length) {
      setQuestion(question + 1);
    } else {
      setFinished(true);
    }
  }

  const categoryScores = {
    decisionMaking: calculateCategoryScore(
      score.decisionMaking,
      questions.length
    ),
    mapAwareness: calculateCategoryScore(
      score.mapAwareness,
      questions.length
    ),
    teamIQ: calculateCategoryScore(score.teamIQ, questions.length),
    objectiveIQ: calculateCategoryScore(score.objectiveIQ, questions.length),
    gunfightIQ: calculateCategoryScore(score.gunfightIQ, questions.length),
    adaptability: calculateCategoryScore(score.adaptability, questions.length),
  };

  const overallScore = Math.round(
    (categoryScores.decisionMaking +
      categoryScores.mapAwareness +
      categoryScores.teamIQ +
      categoryScores.objectiveIQ +
      categoryScores.gunfightIQ +
      categoryScores.adaptability) /
      6
  );

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl">
        {!started ? (
          <div className="text-center">
            <p className="text-sm tracking-[0.3em] text-red-500 mb-4">
              CALL OF DUTY
            </p>

            <h1 className="text-5xl font-black mb-4">
              COD GAME IQ
            </h1>

            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Measure how you think in competitive Call of Duty.
              Your answers are analyzed across multiple gameplay
              categories instead of simply being marked right or wrong.
            </p>

            <button
              onClick={startTest}
              className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold"
            >
              START IQ TEST
            </button>
          </div>
        ) : finished ? (
          <div>
            <div className="text-center mb-10">
              <p className="text-red-500 tracking-widest text-sm mb-3">
                ASSESSMENT COMPLETE
              </p>

              <h2 className="text-4xl font-black mb-4">
                COD GAME IQ
              </h2>

              <p className="text-7xl font-black">
                {overallScore}
              </p>

              <p className="text-gray-400 mt-2">
                Overall Game IQ
              </p>

              <p className="text-red-400 font-bold mt-6">
                Player Type: {getPlayerType(score)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <span>Decision Making</span>
                  <span>{categoryScores.decisionMaking}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${categoryScores.decisionMaking}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <span>Map Awareness</span>
                  <span>{categoryScores.mapAwareness}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${categoryScores.mapAwareness}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <span>Team IQ</span>
                  <span>{categoryScores.teamIQ}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${categoryScores.teamIQ}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <span>Objective IQ</span>
                  <span>{categoryScores.objectiveIQ}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${categoryScores.objectiveIQ}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <span>Gunfight IQ</span>
                  <span>{categoryScores.gunfightIQ}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${categoryScores.gunfightIQ}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <span>Adaptability</span>
                  <span>{categoryScores.adaptability}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${categoryScores.adaptability}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <button
                onClick={startTest}
                className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold"
              >
                RETAKE TEST
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>
                  Question {question + 1} of {shuffledQuestions.length}
                </span>

                <span>
                  {Math.round(
                    ((question + 1) / shuffledQuestions.length) * 100
                  )}
                  %
                </span>
              </div>

              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600"
                  style={{
                    width: `${
                      ((question + 1) / shuffledQuestions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-8">
                {shuffledQuestions[question].question}
              </h2>

              <div className="space-y-4">
                {shuffledQuestions[question].answers.map(
                  (answerOption) => (
                    <button
                      key={answerOption.text}
                      onClick={() => answer(answerOption)}
                      className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-red-500 hover:bg-zinc-800 px-5 py-4 rounded-xl transition"
                    >
                      {answerOption.text}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
