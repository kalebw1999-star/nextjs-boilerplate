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
  scores: Partial<Scores>;
};

type Question = {
  mode: "HARDPOINT" | "SEARCH & DESTROY" | "OVERLOAD";
  situation: string;
  answers: Answer[];
};

const emptyScores = (): Scores => ({
  decisionMaking: 0,
  mapAwareness: 0,
  teamIQ: 0,
  objectiveIQ: 0,
  gunfightIQ: 0,
  adaptability: 0,
});

const questions: Question[] = [
  {
    mode: "HARDPOINT",
    situation:
      "Your team is holding the current Hardpoint. You have about 20 seconds left, two teammates are already positioned for the next hill, and the enemy is beginning to pressure your current hill. You are the closest player to the next hill. What do you do?",
    answers: [
      {
        text: "Rotate early and help secure the next hill before the enemy can establish it.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, objectiveIQ: 5, adaptability: 3 },
      },
      {
        text: "Stay on the current hill and help maximize the remaining time.",
        scores: { objectiveIQ: 4, teamIQ: 2, decisionMaking: 2 },
      },
      {
        text: "Push deep looking for kills before rotating.",
        scores: { gunfightIQ: 5, decisionMaking: -2, objectiveIQ: -4, teamIQ: -2 },
      },
      {
        text: "Wait until the hill becomes completely contested before deciding.",
        scores: { decisionMaking: -2, adaptability: -2, objectiveIQ: 1 },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "Your team has a 3v2 advantage late in a Search & Destroy round. You know the location of one enemy, but the other has not been seen recently. Your team has plenty of time remaining. What is the best approach?",
    answers: [
      {
        text: "Keep the numbers advantage, use your information, and make the remaining enemies take the risk.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, objectiveIQ: 4, adaptability: 5 },
      },
      {
        text: "Immediately challenge the enemy you know about before they reposition.",
        scores: { gunfightIQ: 4, decisionMaking: 1 },
      },
      {
        text: "Split into separate routes so someone eventually finds the last player.",
        scores: { mapAwareness: -2, teamIQ: -4, decisionMaking: -2 },
      },
      {
        text: "Sprint around the map looking for the missing enemy.",
        scores: { gunfightIQ: 3, mapAwareness: -3, decisionMaking: -3, teamIQ: -2 },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team has the Overload Device and is moving toward an enemy zone. Your carrier is approaching a dangerous choke point while two teammates are fighting ahead. You are slightly behind the carrier. What is your priority?",
    answers: [
      {
        text: "Move ahead and help create space while keeping the carrier's route protected.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, objectiveIQ: 5, adaptability: 4 },
      },
      {
        text: "Stay directly beside the carrier and react to whatever appears.",
        scores: { teamIQ: 3, objectiveIQ: 3, decisionMaking: 2 },
      },
      {
        text: "Leave the carrier and look for an isolated enemy.",
        scores: { gunfightIQ: 5, teamIQ: -4, objectiveIQ: -5 },
      },
      {
        text: "Return toward your own side of the map.",
        scores: { decisionMaking: -3, objectiveIQ: -4, adaptability: -2 },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team is losing the current Hardpoint fight. You are the only teammate alive near the hill, while the other three teammates are already rotating toward the next hill. What gives your team the best chance of winning the next sequence?",
    answers: [
      {
        text: "Stay alive and force the enemy to spend time clearing you.",
        scores: { decisionMaking: 4, mapAwareness: 4, objectiveIQ: 4, adaptability: 4 },
      },
      {
        text: "Immediately leave and sprint toward your teammates.",
        scores: { teamIQ: 4, mapAwareness: 3, decisionMaking: 2 },
      },
      {
        text: "Push aggressively and try to eliminate everyone around the hill.",
        scores: { gunfightIQ: 5, decisionMaking: -1, adaptability: -1 },
      },
      {
        text: "Keep taking the same fight until you win it.",
        scores: { gunfightIQ: 3, decisionMaking: -4, adaptability: -5 },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "It is a 2v1 situation and you have plenty of time. The enemy's exact position is unknown. What should you prioritize?",
    answers: [
      {
        text: "Use the numbers advantage and restrict the enemy's options together.",
        scores: { decisionMaking: 5, mapAwareness: 4, teamIQ: 5, objectiveIQ: 4, adaptability: 5 },
      },
      {
        text: "Move separately so the enemy has more angles to worry about.",
        scores: { mapAwareness: 1, teamIQ: -3, decisionMaking: -1 },
      },
      {
        text: "Take the first aggressive fight you can find.",
        scores: { gunfightIQ: 5, decisionMaking: -1 },
      },
      {
        text: "Wait completely still and hope the enemy makes a mistake.",
        scores: { objectiveIQ: 2, adaptability: -2, decisionMaking: -1 },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "The next Hardpoint is about to activate. Your team has two players near the rotation and two players still fighting around the old hill. The enemy has one player already close to the new hill. What matters most?",
    answers: [
      {
        text: "Whether your teammates can establish the new hill while you help deny the enemy's route.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, objectiveIQ: 5, adaptability: 4 },
      },
      {
        text: "How many kills you can get before leaving the current fight.",
        scores: { gunfightIQ: 4, objectiveIQ: -2 },
      },
      {
        text: "Whether the enemy near the hill has a powerful streak available.",
        scores: { decisionMaking: 2, mapAwareness: 2 },
      },
      {
        text: "Nothing. Everyone should rotate immediately regardless of the situation.",
        scores: { decisionMaking: -2, teamIQ: -1, adaptability: -3 },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "The Overload Device has been dropped near the center. Your team is closer, but a teammate was eliminated trying to pick it up. The enemy is rotating toward the area. What should you consider before sending another player?",
    answers: [
      {
        text: "Whether you can create enough space around the Device before attempting the pickup.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, objectiveIQ: 5, adaptability: 5 },
      },
      {
        text: "Whether the closest player can get the pickup immediately.",
        scores: { objectiveIQ: 3, decisionMaking: 1 },
      },
      {
        text: "Send the closest player regardless of the enemy position.",
        scores: { objectiveIQ: 1, decisionMaking: -3, mapAwareness: -4 },
      },
      {
        text: "Forget the Device and send everyone toward the enemy.",
        scores: { gunfightIQ: 5, objectiveIQ: -5, teamIQ: -4 },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You are defending in Search & Destroy. Early in the round, your team gets no information from one side of the map while multiple enemies are spotted elsewhere. What should you consider?",
    answers: [
      {
        text: "The spotted enemies could be creating pressure while another player uses the quiet side.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 4, objectiveIQ: 4, adaptability: 5 },
      },
      {
        text: "The quiet side is probably safe enough to ignore.",
        scores: { mapAwareness: -4, decisionMaking: -2 },
      },
      {
        text: "Everyone should immediately chase the enemies that were spotted.",
        scores: { gunfightIQ: 4, teamIQ: -3, mapAwareness: -2 },
      },
      {
        text: "Assume everyone is in the area where the enemies were seen.",
        scores: { mapAwareness: -4, adaptability: -2 },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team is ahead, but the enemy has repeatedly broken your setup through the same route. You have died to that route twice. What does strong adaptation look like?",
    answers: [
      {
        text: "Change the defensive setup and have a teammate help cover the repeated entry.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, adaptability: 5 },
      },
      {
        text: "Push that route alone so the enemy cannot use it anymore.",
        scores: { gunfightIQ: 5, adaptability: 2, teamIQ: -1 },
      },
      {
        text: "Keep the same setup and trust the next gunfight to go differently.",
        scores: { gunfightIQ: 3, adaptability: -5, decisionMaking: -3 },
      },
      {
        text: "Ignore the pattern because your team is still winning.",
        scores: { adaptability: -4, mapAwareness: -3 },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You are alone against two enemies. You know the bomb's location, but both enemies are separated and their exact positions are unknown. What should guide your play?",
    answers: [
      {
        text: "Use the bomb's location to force the enemies to make a decision while preserving your life.",
        scores: { decisionMaking: 5, mapAwareness: 5, objectiveIQ: 5, adaptability: 5 },
      },
      {
        text: "Take the fastest fight possible before they regroup.",
        scores: { gunfightIQ: 5, decisionMaking: -1 },
      },
      {
        text: "Move constantly until you happen to find one.",
        scores: { adaptability: 2, mapAwareness: 2, objectiveIQ: -1 },
      },
      {
        text: "Push directly into their strongest likely position.",
        scores: { gunfightIQ: 4, decisionMaking: -4, mapAwareness: -4 },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team is attacking and the enemy has stopped your carrier near a choke point. The Device is dropped and your carrier survives. Three enemies are visible near the route while two teammates are behind you. What is the strongest play?",
    answers: [
      {
        text: "Help clear or pressure the choke point so the carrier can safely continue.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, objectiveIQ: 5, adaptability: 4 },
      },
      {
        text: "Immediately pick up the Device and sprint through.",
        scores: { objectiveIQ: 3, gunfightIQ: 2, decisionMaking: -1 },
      },
      {
        text: "Ignore the Device and hunt the visible enemies.",
        scores: { gunfightIQ: 5, objectiveIQ: -5, teamIQ: -3 },
      },
      {
        text: "Fall all the way back even though your team still has control.",
        scores: { decisionMaking: -2, objectiveIQ: -3, adaptability: -2 },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team is behind on Hardpoint but has finally established control of the current hill. The enemy has already started rotating toward the next hill. What mistake should you avoid?",
    answers: [
      {
        text: "Sending too many players toward the next hill and giving up the current hill for free.",
        scores: { decisionMaking: 5, teamIQ: 5, objectiveIQ: 5, mapAwareness: 4 },
      },
      {
        text: "Rotating one player early.",
        scores: { decisionMaking: 3, teamIQ: 3, objectiveIQ: 3 },
      },
      {
        text: "Trying to win every gunfight around the current hill.",
        scores: { gunfightIQ: 4, decisionMaking: -1 },
      },
      {
        text: "Using the current hill to build enough time before the next rotation.",
        scores: { objectiveIQ: 5, decisionMaking: 3, adaptability: 2 },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "Your team has won several rounds through aggression. The enemy has now started slowing down and holding deeper positions. What should you do?",
    answers: [
      {
        text: "Recognize the adjustment and change your pace or approach.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 4, adaptability: 5 },
      },
      {
        text: "Keep rushing exactly the same way because it worked earlier.",
        scores: { gunfightIQ: 4, adaptability: -5, decisionMaking: -3 },
      },
      {
        text: "Rush even faster to overwhelm them.",
        scores: { gunfightIQ: 5, adaptability: -3 },
      },
      {
        text: "Stop making plays entirely and wait for them to move.",
        scores: { adaptability: -2, objectiveIQ: 1 },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team is defending an Overload zone. The enemy carrier is approaching while their teammates are arriving from multiple routes. You have time to react. What should your team prioritize?",
    answers: [
      {
        text: "Use the carrier's route to anticipate the push and establish control around the likely approach.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, objectiveIQ: 5, adaptability: 5 },
      },
      {
        text: "Everyone collapse directly onto the carrier's current position.",
        scores: { gunfightIQ: 4, objectiveIQ: 3, decisionMaking: 1 },
      },
      {
        text: "Ignore the carrier and hunt support players wherever possible.",
        scores: { gunfightIQ: 5, objectiveIQ: -4, decisionMaking: -1 },
      },
      {
        text: "Give up the zone and fight in the middle of the map.",
        scores: { gunfightIQ: 4, objectiveIQ: -5, teamIQ: -3 },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "You are holding a Hardpoint with one teammate. Two enemies are approaching from the same side while the other two have not been seen recently. Your teammate wants to challenge immediately. What should influence your decision?",
    answers: [
      {
        text: "Consider the unseen enemies, your teammate's position, and whether giving up the hill is worth the fight.",
        scores: { decisionMaking: 5, mapAwareness: 5, teamIQ: 5, objectiveIQ: 5, adaptability: 4 },
      },
      {
        text: "Challenge immediately because two enemies are visible.",
        scores: { gunfightIQ: 5, decisionMaking: 1 },
      },
      {
        text: "Always wait for enemies to enter the hill before fighting.",
        scores: { objectiveIQ: 4, decisionMaking: 2 },
      },
      {
        text: "Leave the hill completely so you cannot be eliminated.",
        scores: { decisionMaking: -3, objectiveIQ: -4, teamIQ: -3 },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You are the last player alive. The enemy has numbers, but they must eventually expose themselves to finish the objective. What should guide your decision?",
    answers: [
      {
        text: "Use the objective and time to force the enemy into an unfavorable decision before committing to a fight.",
        scores: { decisionMaking: 5, mapAwareness: 5, objectiveIQ: 5, adaptability: 5 },
      },
      {
        text: "Take the first available gunfight immediately.",
        scores: { gunfightIQ: 5, decisionMaking: -3 },
      },
      {
        text: "Move constantly even if it takes you away from the objective.",
        scores: { adaptability: 3, objectiveIQ: -1 },
      },
      {
        text: "Push directly into the enemy's strongest position.",
        scores: { gunfightIQ: 4, decisionMaking: -5, mapAwareness: -4 },
      },
    ],
  },
];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function calculateScores(raw: Scores): Scores {
  const result = emptyScores();

  (Object.keys(result) as (keyof Scores)[]).forEach((key) => {
    const normalized = ((raw[key] + 40) / 80) * 100;
    result[key] = Math.max(0, Math.min(100, Math.round(normalized)));
  });

  return result;
}

function getArchetype(scores: Scores) {
  const {
    decisionMaking,
    mapAwareness,
    teamIQ,
    objectiveIQ,
    gunfightIQ,
    adaptability,
  } = scores;

  if (
    teamIQ >= 82 &&
    objectiveIQ >= 80 &&
    decisionMaking >= 78
  ) {
    return {
      name: "SYSTEM PLAYER",
      description:
        "You consistently make decisions around the win condition, teammate positioning, and the larger state of the match.",
    };
  }

  if (
    gunfightIQ >= 84 &&
    decisionMaking >= 78 &&
    adaptability >= 75
  ) {
    return {
      name: "AGGRESSIVE PLAYMAKER",
      description:
        "You create pressure through strong individual plays while still showing the ability to adjust when the match changes.",
    };
  }

  if (
    mapAwareness >= 84 &&
    adaptability >= 82
  ) {
    return {
      name: "TEMPO CONTROLLER",
      description:
        "You naturally recognize where pressure is developing and adjust your positioning before the situation becomes obvious.",
    };
  }

  if (
    objectiveIQ >= 84 &&
    teamIQ >= 78
  ) {
    return {
      name: "OBJECTIVE ANCHOR",
      description:
        "You understand how individual decisions affect the objective and tend to create stable situations for your team.",
    };
  }

  if (
    gunfightIQ >= 88 &&
    teamIQ < 72
  ) {
    return {
      name: "MECHANICAL CARRY",
      description:
        "Your strongest value comes from creating individual advantages, though your team-oriented decision making has room to catch up.",
    };
  }

  if (
    decisionMaking >= 84 &&
    adaptability >= 84
  ) {
    return {
      name: "ADAPTIVE IGL",
      description:
        "You show a strong ability to read changing situations and alter your plan instead of forcing a predetermined strategy.",
    };
  }

  return {
    name: "VERSATILE PLAYMAKER",
    description:
      "Your strengths are relatively balanced, suggesting you can contribute in several different ways depending on what the team needs.",
  };
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 55) return "text-orange-400";
  return "text-red-400";
}

function StatCard({
  name,
  value,
  icon,
}: {
  name: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl">{icon}</span>
        <span className={`text-2xl font-black ${getScoreColor(value)}`}>
          {value}
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-3">
        {name}
      </p>

      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-600 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [rawScores, setRawScores] = useState<Scores>(emptyScores());

  function startQuiz() {
    const randomized = shuffle(
      questions.map((question) => ({
        ...question,
        answers: shuffle(question.answers),
      }))
    );

    setQuizQuestions(randomized);
    setRawScores(emptyScores());
    setCurrent(0);
    setFinished(false);
    setStarted(true);
  }

  function answerQuestion(answer: Answer) {
    const updated = { ...rawScores };

    (Object.keys(answer.scores) as (keyof Scores)[]).forEach(
      (key) => {
        updated[key] += answer.scores[key] ?? 0;
      }
    );

    setRawScores(updated);

    if (current + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
    }
  }

  const scores = calculateScores(rawScores);

  const overall = Math.round(
    Object.values(scores).reduce(
      (sum, value) => sum + value,
      0
    ) / 6
  );

  const archetype = getArchetype(scores);

  const stats = [
    ["Decision Making", scores.decisionMaking, "🧠"],
    ["Map Awareness", scores.mapAwareness, "🗺️"],
    ["Team IQ", scores.teamIQ, "🤝"],
    ["Objective IQ", scores.objectiveIQ, "🎯"],
    ["Gunfight IQ", scores.gunfightIQ, "🔫"],
    ["Adaptability", scores.adaptability, "🔄"],
  ] as const;

  const sortedStats = [...stats].sort((a, b) => b[1] - a[1]);
  const strengths = sortedStats.slice(0, 2);
  const weakness = [...stats].sort((a, b) => a[1] - b[1])[0];

  return (
    <main className="min-h-screen bg-[#050505] text-white px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto">

        {!started && (
          <section className="min-h-[85vh] flex items-center justify-center">
            <div className="w-full max-w-3xl text-center">

              <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/5 rounded-full px-4 py-2 mb-7">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold tracking-[0.2em] text-red-500">
                  COMPETITIVE ASSESSMENT
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-5">
                COD<span className="text-red-600">IQ</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                Test how you think when the match gets complicated.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10">
                {stats.map(([name, , icon]) => (
                  <div
                    key={name}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left"
                  >
                    <div className="text-xl mb-2">{icon}</div>
                    <p className="text-xs md:text-sm text-gray-300 font-semibold">
                      {name}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={startQuiz}
                className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-xl font-black transition hover:scale-[1.02]"
              >
                START ASSESSMENT →
              </button>

              <p className="text-xs text-gray-600 mt-5">
                15 ranked scenarios • Six gameplay attributes
              </p>
            </div>
          </section>
        )}

        {started && !finished && quizQuestions.length > 0 && (
          <section className="max-w-3xl mx-auto pt-4 md:pt-10">

            <div className="flex justify-between mb-3">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-gray-600">
                  COD GAME IQ
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Assessment
                </p>
              </div>

              <p className="text-sm font-bold">
                {String(current + 1).padStart(2, "0")}
                <span className="text-gray-600">
                  {" "}
                  / {String(quizQuestions.length).padStart(2, "0")}
                </span>
              </p>
            </div>

            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${((current + 1) / quizQuestions.length) * 100}%`,
                }}
              />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">

              <div className="px-6 py-5 md:px-8 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-black tracking-[0.18em] text-red-500">
                  {quizQuestions[current].mode}
                </span>

                <span className="text-xs text-gray-600">
                  Choose your play
                </span>
              </div>

              <div className="p-6 md:p-8">

                <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-9">
                  {quizQuestions[current].situation}
                </h2>

                <div className="space-y-3">
                  {quizQuestions[current].answers.map(
                    (answer, index) => (
                      <button
                        key={answer.text}
                        onClick={() => answerQuestion(answer)}
                        className="group w-full text-left bg-[#0a0a0a] border border-zinc-800 hover:border-red-500/60 hover:bg-zinc-900 rounded-2xl p-4 md:p-5 transition"
                      >
                        <div className="flex items-center gap-4">

                          <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-red-500/40 flex items-center justify-center text-sm font-black text-gray-500 group-hover:text-red-500">
                            {String.fromCharCode(65 + index)}
                          </span>

                          <span className="text-sm md:text-base text-gray-300 group-hover:text-white leading-relaxed">
                            {answer.text}
                          </span>

                          <span className="ml-auto text-gray-700 group-hover:text-red-500">
                            →
                          </span>

                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

          </section>
        )}

        {started && finished && (
          <section className="max-w-4xl mx-auto pt-4 md:pt-10 pb-12">

            <div className="text-center mb-10">

              <p className="text-xs font-bold tracking-[0.25em] text-red-500 mb-4">
                ASSESSMENT COMPLETE
              </p>

              <h2 className="text-4xl md:text-6xl font-black mb-8">
                YOUR GAME IQ
              </h2>

              <div className="w-48 h-48 mx-auto rounded-full border-4 border-red-600/30 flex items-center justify-center">
                <div>
                  <p className="text-6xl font-black">
                    {overall}
                  </p>
                  <p className="text-xs tracking-[0.25em] text-gray-500 mt-2">
                    OVERALL
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <p className="text-xs text-gray-600 uppercase tracking-[0.2em] mb-2">
                  Player Profile
                </p>

                <div className="inline-block bg-red-600/10 border border-red-500/20 rounded-xl px-6 py-3">
                  <p className="text-xl font-black text-red-500">
                    {archetype.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {stats.map(([name, value, icon]) => (
                <StatCard
                  key={name}
                  name={name}
                  value={value}
                  icon={icon}
                />
              ))}
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-4">

              <p className="text-xs font-bold tracking-[0.2em] text-red-500 mb-3">
                PLAYER PROFILE
              </p>

              <h3 className="text-2xl font-black mb-3">
                {archetype.name}
              </h3>

              <p className="text-gray-400 leading-relaxed">
                {archetype.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <p className="text-xs font-bold tracking-[0.2em] text-green-500 mb-4">
                  CORE STRENGTHS
                </p>

                <div className="space-y-3">
                  {strengths.map(([name, value]) => (
                    <div
                      key={name}
                      className="flex justify-between bg-zinc-900 rounded-xl px-4 py-3"
                    >
                      <span className="text-sm text-gray-300">
                        {name}
                      </span>

                      <span className="font-black text-green-400">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <p className="text-xs font-bold tracking-[0.2em] text-yellow-500 mb-4">
                  DEVELOPMENT AREA
                </p>

                <div className="flex justify-between bg-zinc-900 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-300">
                    {weakness[0]}
                  </span>

                  <span className="font-black text-yellow-400">
                    {weakness[1]}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-4 leading-relaxed">
                  This is the attribute that currently contributes
                  the least to your overall profile. It does not
                  mean you are weak mechanically or as a player.
                </p>
              </div>
            </div>

            <div className="text-center">

              <button
                onClick={startQuiz}
                className="bg-red-600 hover:bg-red-700 px-9 py-4 rounded-xl font-black transition hover:scale-[1.02]"
              >
                RETAKE ASSESSMENT
              </button>

              <p className="text-xs text-gray-700 mt-4">
                Scoring and answer positions are randomized through
                the assessment structure.
              </p>

            </div>

          </section>
        )}
      </div>
    </main>
  );
}
