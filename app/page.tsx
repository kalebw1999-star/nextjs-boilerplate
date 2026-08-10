"use client";

import { useEffect, useMemo, useState } from "react";

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
  mode: "DEN" | "SCAR";
  situation: string;
  answers: Answer[];
  correctAnswers: number[];
  multiSelect?: boolean;
  explanation: string;
};

type Attempt = {
  date: string;
  overall: number;
  recruitScore: number;
  archetype: string;
  scores: Scores;
};

type PlayerProfile = {
  name: string;
  createdAt: string;
  attempts: Attempt[];
  bestOverall: number;
  bestRecruitScore: number;
};

const STORAGE_KEY = "codiq-player-profile-v2";

const emptyScores = (): Scores => ({
  decisionMaking: 0,
  mapAwareness: 0,
  teamIQ: 0,
  objectiveIQ: 0,
  gunfightIQ: 0,
  adaptability: 0,
});

/* =========================================================
   TEN CODIQ SCENARIOS
   ========================================================= */

const questions: Question[] = [
  {
    mode: "DEN",
    situation:
      "You are holding P1. Your teammate is calling that an enemy is coming bottom U, their side. Your team is spawning back Dragon, and the enemy team is therefore spawning back P2. You can either watch Mid-Cut or watch bottom U. Which should you prioritize?",
    answers: [
      {
        text: "Watch Mid-Cut because an enemy coming from Mid-Cut can see and challenge you on P1 almost immediately.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Watch bottom U because the enemy coming from couches can reach the hill before the enemy coming through Mid-Cut.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 1,
        },
      },
      {
        text: "Watch Mid-Cut because the enemy coming from there has to go through couches before reaching you.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 0,
        },
      },
      {
        text: "Watch bottom U because the enemy coming through Mid-Cut has to rotate around the hill before challenging you.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 0,
        },
      },
    ],
    correctAnswers: [0, 2],
    multiSelect: true,
    explanation:
      "A and C are both correct. Mid-Cut is the immediate threat because an enemy there can see P1 almost instantly. The bottom-U player has to come through couches, touch the point area, and work around the hill before getting the same line of sight. That gives your teammates more opportunity to kill him before he reaches you.",
  },

  {
    mode: "DEN",
    situation:
      "You are holding P2. Your team is spawning back Dragon and the enemy is spawning back P2. You hear pressure developing from Garage and also see an enemy coming from Outer Roofs. Which threat should you prioritize watching?",
    answers: [
      {
        text: "Outer Roofs, because the enemy has the shorter route to P2 and Garage takes longer to reach the point.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 1,
        },
      },
      {
        text: "Garage, because that route is closer to the hill than Outer Roofs.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Inner Roofs, because every Roofs player will automatically reach the point before Garage.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 0,
        },
      },
      {
        text: "Outer Roofs, because Garage is farther from the point and gives you more time to react.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          adaptability: 3,
        },
      },
    ],
    correctAnswers: [1, 3],
    multiSelect: true,
    explanation:
      "B and D are both defensible based on the timing information. Garage is closer to the hill than Outer Roofs, so it deserves immediate attention. At the same time, a player already out of Roofs with strong movement can potentially arrive around the same time as Garage. The important concept is that Garage gives you less reaction time than Outer Roofs.",
  },

  {
    mode: "DEN",
    situation:
      "Your teammate is holding the hill on P3. You are positioned inside Tin. The enemy team is expected to rotate toward P4. Which side should you prioritize pushing?",
    answers: [
      {
        text: "Dojo, because getting through Dojo gives your team access to the Dragon-side spawns needed for the P4 rotation.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          objectiveIQ: 5,
          teamIQ: 5,
        },
      },
      {
        text: "Lockers, because the Lockers player will always reach P4 before someone coming through Dojo.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 1,
        },
      },
      {
        text: "Mid-Cut, because it is the fastest route to the next hill regardless of the enemy's position.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 1,
        },
      },
      {
        text: "Stay inside Tin because your teammate is already holding the hill.",
        scores: {
          objectiveIQ: 1,
          decisionMaking: 0,
        },
      },
    ],
    correctAnswers: [0],
    explanation:
      "Dojo is the priority because the goal is not simply reaching P4 first. You want to establish the Dragon-side spawns for the rotation. Pushing through Dojo helps your team create that spawn advantage while your teammate continues holding the current hill.",
  },

  {
    mode: "SCAR",
    situation:
      "You are holding P1. Your team is spawning back Blue while the enemy team is spawning back Green. One enemy is approaching Mid-Cut and another is approaching through Boats. Your teammate on Top Broken is watching P1, and you are responsible for the hill. Which enemy should you prioritize challenging?",
    answers: [
      {
        text: "The enemy at Mid-Cut, because they can directly challenge P1 and become an immediate threat to the hill.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          objectiveIQ: 5,
        },
      },
      {
        text: "The enemy coming through Boats, because they are closer to the spawn side of the map.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 1,
        },
      },
      {
        text: "The enemy at Mid-Cut, because the Boats player cannot be watched by your teammates.",
        scores: {
          decisionMaking: 2,
          mapAwareness: 2,
        },
      },
      {
        text: "The Boats player, because Mid-Cut is already covered by Top Broken.",
        scores: {
          decisionMaking: 2,
          mapAwareness: 2,
          teamIQ: 3,
        },
      },
    ],
    correctAnswers: [0],
    explanation:
      "A is the priority. The Mid-Cut player can directly threaten you on P1 much faster. The Boats player is coming through a route that your teammate can help cover, while Mid-Cut creates the more immediate challenge to your position.",
  },

  {
    mode: "SCAR",
    situation:
      "You are on P3 while your teammates are already controlling the hill. One teammate is on Plane Heady watching Boats, another is watching your team's back, and another is holding the point. An enemy is approaching from Bottom Blue. Which angle should you hold?",
    answers: [
      {
        text: "Boats, because Bottom Blue players are most likely to challenge through Boats.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 1,
        },
      },
      {
        text: "Your team's back, because Bottom Blue is closest to your spawn.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 1,
        },
      },
      {
        text: "Mid-Cut, because your teammates already have Boats, your back, and the point covered, leaving Mid-Cut as the important uncovered angle.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
        },
      },
      {
        text: "The point, because the enemy cannot challenge you unless they are already touching the hill.",
        scores: {
          objectiveIQ: 1,
          mapAwareness: 0,
        },
      },
    ],
    correctAnswers: [2],
    explanation:
      "C is correct. Your teammates already have the other important areas covered, so Mid-Cut is the missing piece of the setup. You can watch Mid-Cut without abandoning the hill, and that prevents an enemy from getting a free line onto your team.",
  },

  {
    mode: "SCAR",
    situation:
      "You are playing around P1. Your teammate has just spawned in on Back Dragon's side. You are also watching the minimap. A red dot suddenly appears near Couches. What information should you immediately use?",
    answers: [
      {
        text: "The red dot confirms that an enemy is currently firing near Couches.",
        scores: {
          mapAwareness: 5,
          decisionMaking: 4,
        },
      },
      {
        text: "Your teammate spawning on Back Dragon's side tells you the enemy team should be spawning on the opposite side, so you should use that information to anticipate their route.",
        scores: {
          mapAwareness: 5,
          teamIQ: 5,
          decisionMaking: 5,
        },
      },
      {
        text: "The kill feed tells you exactly which side of the map the enemy died on.",
        scores: {
          mapAwareness: 0,
        },
      },
      {
        text: "The red dot proves exactly where every enemy is spawning.",
        scores: {
          mapAwareness: 0,
          decisionMaking: 0,
        },
      },
    ],
    correctAnswers: [1, 3],
    multiSelect: true,
    explanation:
      "B and D are both correct in the intended sense. Your teammate's Back Dragon spawn gives you contextual information about the opposing spawn side. A red dot near Couches gives you additional information that an enemy is actively firing in that area. The important distinction is that the minimap does not reveal enemy positions unless they are actually exposed by something like gunfire.",
  },

  {
    mode: "SCAR",
    situation:
      "You see your teammate spawn on Back Dragon's side. You are holding P2 and trying to determine where the enemy team is likely coming from. A red dot then appears near Couches. Which information is most useful?",
    answers: [
      {
        text: "Your teammate spawning Back Dragon indicates the enemy should be spawning on the opposite side, while the Couches red dot confirms an enemy is actively pushing that lane.",
        scores: {
          mapAwareness: 5,
          decisionMaking: 5,
          teamIQ: 5,
          objectiveIQ: 4,
        },
      },
      {
        text: "The Couches red dot confirms the enemy is pushing from that side, so you should account for that pressure.",
        scores: {
          mapAwareness: 5,
          decisionMaking: 5,
        },
      },
      {
        text: "The kill feed tells you exactly where the enemy died, allowing you to determine their spawn.",
        scores: {
          mapAwareness: 0,
        },
      },
      {
        text: "Because you are on P2, the enemy cannot approach through Couches.",
        scores: {
          mapAwareness: 0,
          decisionMaking: 0,
        },
      },
    ],
    correctAnswers: [0, 1],
    multiSelect: true,
    explanation:
      "A and B are correct. Your teammate's spawn provides contextual information about the opposing spawn, while the red dot near Couches confirms active enemy presence there. The kill feed only tells you who killed whom; it does not tell you where the death happened. And Couches remains one of the important lanes for attacking P2.",
  },

  {
    mode: "SCAR",
    situation:
      "You are holding P1 and your teammate is on Top Broken watching P1. You are positioned near A18. One enemy is Mid and another is Top Red. Which enemy should you challenge first?",
    answers: [
      {
        text: "Challenge Top Red because that player appears to be the easier gunfight.",
        scores: {
          gunfightIQ: 3,
          decisionMaking: 2,
        },
      },
      {
        text: "Challenge Mid because Mid is closer to the hill and creates the more immediate threat.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          objectiveIQ: 5,
        },
      },
      {
        text: "Challenge Top Red because the Mid player will naturally expose themselves to your teammate on Top Broken watching P1.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
        },
      },
      {
        text: "Challenge Mid because the Top Red player is already being watched by your teammate.",
        scores: {
          decisionMaking: 4,
          teamIQ: 4,
          mapAwareness: 4,
        },
      },
    ],
    correctAnswers: [2],
    explanation:
      "C is the intended answer. The Mid player naturally has to expose themselves to your teammate on Top Broken watching P1. That means you do not need to force the Mid fight yourself. Taking Top Red removes another threat while your teammate's existing P1 vision helps deal with Mid.",
  },

  {
    mode: "SCAR",
    situation:
      "You are playing P3 and your team is already established on the hill. Your teammate on Plane Heady is watching Boats, another teammate is watching your back, and the third teammate is holding the point. An enemy could approach through Mid-Cut. What should you do?",
    answers: [
      {
        text: "Watch Mid-Cut, because you can cover it without giving up the hill and your teammates already have the other major approaches covered.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
        },
      },
      {
        text: "Watch Boats because it is the most common route even though Plane Heady is already watching it.",
        scores: {
          mapAwareness: 1,
          teamIQ: 0,
        },
      },
      {
        text: "Watch your back because the enemy should always spawn behind your team on P3.",
        scores: {
          mapAwareness: 0,
        },
      },
      {
        text: "Leave the hill and search for the enemy instead of holding an angle.",
        scores: {
          gunfightIQ: 3,
          objectiveIQ: -3,
          teamIQ: -2,
        },
      },
    ],
    correctAnswers: [0],
    explanation:
      "A is correct. Mid-Cut is the uncovered angle in the setup. You can watch it while still contributing to the hill, while Boats, your back, and the point are already being handled by teammates.",
  },

  {
    mode: "SCAR",
    situation:
      "You are reading the minimap during a rotation. Your teammate's spawn appears on Back Green, while an enemy red dot appears near Shop. You know your team is preparing for the next hill. What should you prioritize?",
    answers: [
      {
        text: "Use the Back Green spawn information to anticipate the enemy's likely side, then use the Shop red dot as confirmation of where an enemy is actively moving.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Challenge the Shop player immediately without considering the spawn information.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: 1,
        },
      },
      {
        text: "Use the kill feed to determine whether the enemy is coming from Shop.",
        scores: {
          mapAwareness: 0,
        },
      },
      {
        text: "Assume the entire enemy team is at Shop because one red dot appeared there.",
        scores: {
          mapAwareness: 0,
          decisionMaking: -1,
        },
      },
    ],
    correctAnswers: [0],
    explanation:
      "A is correct because strong minimap awareness comes from combining pieces of information rather than treating one piece as absolute. A teammate's spawn gives you contextual information about the opposing spawn side, while a red dot gives you a confirmed active enemy location.",
  },
];

/* =========================================================
   GAME LOGIC
   ========================================================= */

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
    const normalized = ((raw[key] + 50) / 100) * 100;

    result[key] = Math.max(
      0,
      Math.min(100, Math.round(normalized))
    );
  });

  return result;
}

function calculateOverall(scores: Scores) {
  return Math.round(
    Object.values(scores).reduce(
      (sum, value) => sum + value,
      0
    ) / 6
  );
}

function calculateRecruitScore(scores: Scores) {
  return Math.round(
    scores.teamIQ * 0.22 +
      scores.decisionMaking * 0.21 +
      scores.objectiveIQ * 0.19 +
      scores.adaptability * 0.16 +
      scores.mapAwareness * 0.14 +
      scores.gunfightIQ * 0.08
  );
}

function getArchetype(scores: Scores) {
  if (
    scores.teamIQ >= 82 &&
    scores.objectiveIQ >= 80 &&
    scores.decisionMaking >= 78
  ) {
    return {
      name: "SYSTEM PLAYER",
      description:
        "You naturally think about the win condition, teammate positioning, and the larger state of the match.",
    };
  }

  if (
    scores.gunfightIQ >= 84 &&
    scores.decisionMaking >= 76 &&
    scores.adaptability >= 72
  ) {
    return {
      name: "AGGRESSIVE PLAYMAKER",
      description:
        "You create pressure through individual plays while still showing an ability to adjust when the match changes.",
    };
  }

  if (
    scores.mapAwareness >= 84 &&
    scores.adaptability >= 80
  ) {
    return {
      name: "TEMPO CONTROLLER",
      description:
        "You consistently recognize developing pressure and adjust your positioning before situations become obvious.",
    };
  }

  if (
    scores.objectiveIQ >= 84 &&
    scores.teamIQ >= 78
  ) {
    return {
      name: "OBJECTIVE ANCHOR",
      description:
        "You understand how individual decisions affect the objective and create stable situations for your team.",
    };
  }

  if (
    scores.gunfightIQ >= 88 &&
    scores.teamIQ < 72
  ) {
    return {
      name: "MECHANICAL CARRY",
      description:
        "Your strongest value comes from creating individual advantages. Team-oriented decision making is the largest development area.",
    };
  }

  if (
    scores.decisionMaking >= 84 &&
    scores.adaptability >= 84
  ) {
    return {
      name: "ADAPTIVE IGL",
      description:
        "You recognize changing situations quickly and alter your plan instead of forcing the same strategy.",
    };
  }

  return {
    name: "VERSATILE PLAYMAKER",
    description:
      "Your strengths are relatively balanced, suggesting you can contribute in several different ways depending on what the team needs.",
  };
}

function getRecruitLabel(score: number) {
  if (score >= 90) return "ELITE PROSPECT";
  if (score >= 82) return "HIGH PRIORITY PROSPECT";
  if (score >= 74) return "DEVELOPING PROSPECT";
  if (score >= 65) return "EMERGING PLAYER";

  return "EARLY DEVELOPMENT";
}

function getRatingText(score: number) {
  if (score >= 90) return "Elite";
  if (score >= 82) return "Advanced";
  if (score >= 74) return "Strong";
  if (score >= 65) return "Developing";

  return "Foundation";
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 55) return "text-orange-400";

  return "text-red-400";
}

/* =========================================================
   COMPONENTS
   ========================================================= */

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
    <div className="bg-[#090909] border border-zinc-800 rounded-2xl p-5">
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

      <p className="text-[10px] uppercase tracking-wider text-gray-700 mt-2">
        {getRatingText(value)}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */

export default function Home() {
  const [profile, setProfile] =
    useState<PlayerProfile | null>(null);

  const [nameInput, setNameInput] =
    useState("");

  const [view, setView] = useState<
    "home" | "assessment" | "results" | "profile" | "team" | "clip"
  >("home");

  const [current, setCurrent] =
    useState(0);

  const [quizQuestions, setQuizQuestions] =
    useState<Question[]>([]);

  const [rawScores, setRawScores] =
    useState<Scores>(emptyScores());

  const [selectedAnswers, setSelectedAnswers] =
    useState<number[]>([]);

  const [feedbackVisible, setFeedbackVisible] =
    useState(false);

  const [feedbackCorrect, setFeedbackCorrect] =
    useState(false);

  const [latestScores, setLatestScores] =
    useState<Scores | null>(null);

  const [latestOverall, setLatestOverall] =
    useState(0);

  const [latestRecruitScore, setLatestRecruitScore] =
    useState(0);

  const [latestArchetype, setLatestArchetype] =
    useState("");

  const [clipFileName, setClipFileName] =
    useState("");

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function saveProfile(
    updated: PlayerProfile
  ) {
    setProfile(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  }

  function createPlayer() {
    const cleanName =
      nameInput.trim();

    if (!cleanName) return;

    const newProfile: PlayerProfile = {
      name: cleanName,
      createdAt:
        new Date().toISOString(),
      attempts: [],
      bestOverall: 0,
      bestRecruitScore: 0,
    };

    saveProfile(newProfile);
    setView("home");
  }

  function startAssessment() {
    if (!profile) {
      setView("home");
      return;
    }

    const randomized =
      shuffle(
        questions.map((question) => ({
          ...question,
          answers: shuffle(
            question.answers
          ),
        }))
      );

    setQuizQuestions(randomized);
    setRawScores(emptyScores());
    setCurrent(0);
    setSelectedAnswers([]);
    setFeedbackVisible(false);
    setLatestScores(null);

    setView("assessment");
  }

  function isCorrectSelection(
    question: Question,
    selections: number[]
  ) {
    const correct =
      [...question.correctAnswers].sort(
        (a, b) => a - b
      );

    const selected =
      [...selections].sort(
        (a, b) => a - b
      );

    if (
      correct.length !==
      selected.length
    ) {
      return false;
    }

    return correct.every(
      (value, index) =>
        value === selected[index]
    );
  }

  function submitAnswer() {
    const question =
      quizQuestions[current];

    if (!question) return;

    if (
      selectedAnswers.length === 0
    ) {
      return;
    }

    const correct =
      isCorrectSelection(
        question,
        selectedAnswers
      );

    setFeedbackCorrect(correct);
    setFeedbackVisible(true);

    const updated = {
      ...rawScores,
    };

    selectedAnswers.forEach(
      (answerIndex) => {
        const answer =
          question.answers[
            answerIndex
          ];

        (
          Object.keys(
            answer.scores
          ) as (keyof Scores)[]
        ).forEach((key) => {
          updated[key] +=
            answer.scores[key] ?? 0;
        });
      }
    );

    setRawScores(updated);
  }

  function answerQuestion(
    answerIndex: number
  ) {
    const question =
      quizQuestions[current];

    if (!question) return;

    if (question.multiSelect) {
      setSelectedAnswers((previous) =>
        previous.includes(answerIndex)
          ? previous.filter(
              (index) =>
                index !== answerIndex
            )
          : [
              ...previous,
              answerIndex,
            ]
      );

      return;
    }

    const answer =
      question.answers[
        answerIndex
      ];

    const correct =
      question.correctAnswers.includes(
        answerIndex
      );

    setSelectedAnswers([
      answerIndex,
    ]);

    setFeedbackCorrect(correct);
    setFeedbackVisible(true);

    const updated = {
      ...rawScores,
    };

    (
      Object.keys(
        answer.scores
      ) as (keyof Scores)[]
    ).forEach((key) => {
      updated[key] +=
        answer.scores[key] ?? 0;
    });

    setRawScores(updated);
  }

  function finishAssessment(
    finalScores: Scores
  ) {
    const calculated =
      calculateScores(finalScores);

    const overall =
      calculateOverall(
        calculated
      );

    const recruitScore =
      calculateRecruitScore(
        calculated
      );

    const archetype =
      getArchetype(
        calculated
      );

    setLatestScores(
      calculated
    );

    setLatestOverall(
      overall
    );

    setLatestRecruitScore(
      recruitScore
    );

    setLatestArchetype(
      archetype.name
    );

    if (profile) {
      const attempt: Attempt = {
        date:
          new Date().toISOString(),
        overall,
        recruitScore,
        archetype:
          archetype.name,
        scores:
          calculated,
      };

      const updatedProfile:
        PlayerProfile = {
        ...profile,
        attempts: [
          ...profile.attempts,
          attempt,
        ],
        bestOverall:
          Math.max(
            profile.bestOverall,
            overall
          ),
        bestRecruitScore:
          Math.max(
            profile.bestRecruitScore,
            recruitScore
          ),
      };

      saveProfile(
        updatedProfile
      );
    }

    setView("results");
  }

  function nextQuestion() {
    const next =
      current + 1;

    if (
      next >=
      quizQuestions.length
    ) {
      finishAssessment(
        rawScores
      );

      return;
    }

    setCurrent(next);
    setSelectedAnswers([]);
    setFeedbackVisible(false);
  }

  function resetPlayer() {
    localStorage.removeItem(
      STORAGE_KEY
    );

    setProfile(null);
    setLatestScores(null);
    setNameInput("");
    setView("home");
  }

  const stats = useMemo(() => {
    if (!latestScores)
      return [];

    return [
      [
        "Decision Making",
        latestScores.decisionMaking,
        "🧠",
      ],
      [
        "Map Awareness",
        latestScores.mapAwareness,
        "🗺️",
      ],
      [
        "Team IQ",
        latestScores.teamIQ,
        "🤝",
      ],
      [
        "Objective IQ",
        latestScores.objectiveIQ,
        "🎯",
      ],
      [
        "Gunfight IQ",
        latestScores.gunfightIQ,
        "⚡",
      ],
      [
        "Adaptability",
        latestScores.adaptability,
        "🔄",
      ],
    ] as const;
  }, [latestScores]);

  const strengths =
    [...stats]
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 2);

  const weakness =
    [...stats].sort(
      (a, b) =>
        a[1] - b[1]
    )[0];

  const archetype =
    latestScores
      ? getArchetype(
          latestScores
        )
      : null;

  function navButton(
    label: string,
    target: typeof view
  ) {
    return (
      <button
        onClick={() =>
          setView(target)
        }
        className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
          view === target
            ? "bg-red-600 text-white"
            : "text-gray-500 hover:text-white hover:bg-zinc-900"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      <div className="max-w-6xl mx-auto px-4 py-5 md:px-8">

        <header className="flex items-center justify-between border-b border-zinc-900 pb-5 mb-8">

          <button
            onClick={() =>
              setView("home")
            }
            className="font-black text-xl tracking-tight"
          >
            COD
            <span className="text-red-600">
              IQ
            </span>
          </button>

          {profile && (
            <nav className="flex gap-1 overflow-x-auto">
              {navButton(
                "TEST",
                "home"
              )}

              {navButton(
                "PROFILE",
                "profile"
              )}

              {navButton(
                "TEAM",
                "team"
              )}

              {navButton(
                "CLIP IQ",
                "clip"
              )}
            </nav>
          )}

        </header>

        {/* =================================================
            NEW PLAYER
           ================================================= */}

        {!profile &&
          view === "home" && (
            <section className="min-h-[75vh] flex items-center justify-center">

              <div className="w-full max-w-3xl text-center">

                <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/5 rounded-full px-4 py-2 mb-7">

                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />

                  <span className="text-xs font-bold tracking-[0.2em] text-red-500">
                    COMPETITIVE PLAYER ASSESSMENT
                  </span>

                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-5">
                  COD
                  <span className="text-red-600">
                    IQ
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-9">
                  Measure how you think,
                  adapt, communicate,
                  and make decisions
                  in competitive
                  Call of Duty situations.
                </p>

                <div className="max-w-md mx-auto">

                  <input
                    value={nameInput}
                    onChange={(e) =>
                      setNameInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        createPlayer();
                      }
                    }}
                    placeholder="Enter player name"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 outline-none rounded-xl px-5 py-4 mb-3 text-center"
                  />

                  <button
                    onClick={
                      createPlayer
                    }
                    className="w-full bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-black transition"
                  >
                    CREATE PLAYER PROFILE
                  </button>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mt-10">

                  {[
                    ["🧠", "Decision Making"],
                    ["🗺️", "Map Awareness"],
                    ["🤝", "Team IQ"],
                    ["🎯", "Objective IQ"],
                    ["⚡", "Gunfight IQ"],
                    ["🔄", "Adaptability"],
                  ].map(
                    ([icon, label]) => (
                      <div
                        key={label}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left"
                      >
                        <div className="text-xl mb-2">
                          {icon}
                        </div>

                        <p className="text-xs text-gray-400 font-semibold">
                          {label}
                        </p>
                      </div>
                    )
                  )}

                </div>

              </div>

            </section>
          )}

        {/* =================================================
            HOME
           ================================================= */}

        {profile &&
          view === "home" && (
            <section className="max-w-5xl mx-auto">

              <div className="mb-10">

                <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-bold">
                  PLAYER DASHBOARD
                </p>

                <h1 className="text-4xl md:text-6xl font-black mt-2">
                  {profile.name}
                </h1>

                <p className="text-gray-500 mt-3">
                  Build your competitive
                  profile through
                  scenario-based testing.
                </p>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Best Overall
                  </p>

                  <p className="text-4xl font-black mt-2">
                    {profile.bestOverall ||
                      "--"}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Recruit Score
                  </p>

                  <p className="text-4xl font-black text-red-500 mt-2">
                    {profile.bestRecruitScore ||
                      "--"}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Assessments
                  </p>

                  <p className="text-4xl font-black mt-2">
                    {
                      profile
                        .attempts
                        .length
                    }
                  </p>
                </div>

              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 md:p-10">

                <p className="text-red-500 text-xs font-bold tracking-[0.2em]">
                  RANKED PLAYER TEST
                </p>

                <h2 className="text-3xl md:text-4xl font-black mt-3">
                  10 scenarios.
                  One player profile.
                </h2>

                <p className="text-gray-500 mt-4 leading-relaxed max-w-2xl">
                  Each scenario presents
                  a specific competitive
                  match state. You will
                  need to use map knowledge,
                  spawn logic, timing,
                  minimap information,
                  teammate positioning,
                  and decision making.
                </p>

                <button
                  onClick={
                    startAssessment
                  }
                  className="mt-7 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-black"
                >
                  START 10-SCENARIO TEST →
                </button>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-2xl mb-3">
                    📈
                  </p>

                  <h3 className="font-black">
                    Progress
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Track assessment
                    scores and identify
                    changes in your
                    competitive profile.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-2xl mb-3">
                    🏆
                  </p>

                  <h3 className="font-black">
                    Recruit Score
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Summarizes the
                    decision-making traits
                    most valuable to a
                    coordinated team.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-2xl mb-3">
                    🎥
                  </p>

                  <h3 className="font-black">
                    Clip IQ
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Review gameplay
                    situations by breaking
                    down intent, information,
                    decisions, and adjustments.
                  </p>
                </div>

              </div>

            </section>
          )}

        {/* =================================================
            ASSESSMENT
           ================================================= */}

        {profile &&
          view === "assessment" &&
          quizQuestions.length > 0 && (
            <section className="max-w-3xl mx-auto">

              <div className="flex justify-between items-end mb-3">

                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                    CODIQ ASSESSMENT
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    {profile.name}
                  </p>
                </div>

                <p className="text-sm font-bold">
                  {current + 1}
                  <span className="text-gray-600">
                    {" "}
                    /{" "}
                    {
                      quizQuestions.length
                    }
                  </span>
                </p>

              </div>

              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-8">

                <div
                  className="h-full bg-red-600 transition-all"
                  style={{
                    width: `${
                      ((current + 1) /
                        quizQuestions.length) *
                      100
                    }%`,
                  }}
                />

              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">

                <div className="px-6 py-5 border-b border-zinc-800 flex justify-between">

                  <span className="text-xs font-black tracking-[0.18em] text-red-500">
                    {
                      quizQuestions[
                        current
                      ].mode
                    }
                  </span>

                  <span className="text-xs text-gray-700">
                    Scenario{" "}
                    {current + 1}
                  </span>

                </div>

                <div className="p-6 md:p-9">

                  <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-3">
                    {
                      quizQuestions[
                        current
                      ].situation
                    }
                  </h2>

                  {quizQuestions[
                    current
                  ].multiSelect && (
                    <p className="text-xs text-red-500 font-bold mb-7">
                      SELECT ALL THAT APPLY
                    </p>
                  )}

                  <div className="space-y-3">

                    {quizQuestions[
                      current
                    ].answers.map(
                      (
                        answer,
                        index
                      ) => {
                        const selected =
                          selectedAnswers.includes(
                            index
                          );

                        return (
                          <button
                            key={
                              answer.text
                            }
                            disabled={
                              feedbackVisible &&
                              !quizQuestions[
                                current
                              ].multiSelect
                            }
                            onClick={() =>
                              answerQuestion(
                                index
                              )
                            }
                            className={`group w-full text-left border rounded-2xl p-4 md:p-5 transition ${
                              selected
                                ? "border-red-500 bg-red-500/10"
                                : "bg-[#080808] border-zinc-800 hover:border-red-500/60 hover:bg-zinc-900"
                            }`}
                          >
                            <div className="flex items-center gap-4">

                              <span
                                className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-black ${
                                  selected
                                    ? "bg-red-600 border-red-500 text-white"
                                    : "bg-zinc-900 border-zinc-800 text-gray-500 group-hover:text-red-500"
                                }`}
                              >
                                {String.fromCharCode(
                                  65 +
                                    index
                                )}
                              </span>

                              <span className="text-sm md:text-base text-gray-300 group-hover:text-white leading-relaxed">
                                {
                                  answer.text
                                }
                              </span>

                              {selected && (
                                <span className="ml-auto text-red-500 font-black">
                                  ✓
                                </span>
                              )}

                            </div>
                          </button>
                        );
                      }
                    )}

                  </div>

                  {quizQuestions[
                    current
                  ].multiSelect &&
                    !feedbackVisible && (
                      <button
                        onClick={
                          submitAnswer
                        }
                        disabled={
                          selectedAnswers.length ===
                          0
                        }
                        className="w-full mt-5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-gray-600 px-7 py-4 rounded-xl font-black transition"
                      >
                        SUBMIT ANSWER
                      </button>
                    )}

                </div>

              </div>

              {feedbackVisible && (
                <div
                  className={`mt-4 rounded-2xl border p-6 ${
                    feedbackCorrect
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-red-500/30 bg-red-500/5"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black ${
                        feedbackCorrect
                          ? "bg-green-500/15 text-green-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {feedbackCorrect
                        ? "✓"
                        : "!"}
                    </div>

                    <div>

                      <p
                        className={`font-black ${
                          feedbackCorrect
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {feedbackCorrect
                          ? "CORRECT"
                          : "NOT QUITE"}
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        {feedbackCorrect
                          ? "Good read."
                          : "Review the map logic before moving on."}
                      </p>

                    </div>

                  </div>

                  <div className="mt-5">

                    <p className="text-sm font-bold text-gray-300 mb-2">
                      Why:
                    </p>

                    <p className="text-sm text-gray-500 leading-relaxed">
                      {
                        quizQuestions[
                          current
                        ].explanation
                      }
                    </p>

                  </div>

                  {!feedbackCorrect && (
                    <div className="mt-5 pt-5 border-t border-zinc-800">

                      <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">
                        Correct answer
                      </p>

                      <p className="text-sm text-green-400 font-semibold">
                        {
                          quizQuestions[
                            current
                          ].correctAnswers
                            .map(
                              (index) =>
                                `${String.fromCharCode(
                                  65 + index
                                )}`
                            )
                            .join(
                              " and "
                            )
                        }
                      </p>

                    </div>
                  )}

                  <button
                    onClick={
                      nextQuestion
                    }
                    className="w-full mt-6 bg-white text-black hover:bg-gray-200 px-7 py-4 rounded-xl font-black transition"
                  >
                    {current + 1 >=
                    quizQuestions.length
                      ? "VIEW RESULTS →"
                      : "NEXT QUESTION →"}
                  </button>

                </div>
              )}

            </section>
          )}

        {/* =================================================
            RESULTS
           ================================================= */}

        {profile &&
          view === "results" &&
          latestScores &&
          archetype && (
            <section className="max-w-5xl mx-auto pb-12">

              <div className="text-center mb-10">

                <p className="text-xs font-bold tracking-[0.25em] text-red-500 mb-4">
                  ASSESSMENT COMPLETE
                </p>

                <h1 className="text-5xl md:text-7xl font-black">
                  PLAYER DNA
                </h1>

                <p className="text-gray-600 mt-3">
                  {profile.name} • Assessment #
                  {
                    profile
                      .attempts
                      .length
                  }
                </p>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-5">

                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 text-center">

                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Overall IQ
                  </p>

                  <p className="text-6xl font-black mt-3">
                    {latestOverall}
                  </p>

                </div>

                <div className="bg-zinc-950 border border-red-900/30 rounded-3xl p-7 text-center">

                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Recruit Score
                  </p>

                  <p className="text-6xl font-black text-red-500 mt-3">
                    {
                      latestRecruitScore
                    }
                  </p>

                  <p className="text-xs text-gray-600 mt-2">
                    {
                      getRecruitLabel(
                        latestRecruitScore
                      )
                    }
                  </p>

                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 text-center">

                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Archetype
                  </p>

                  <p className="text-2xl font-black text-red-500 mt-5">
                    {
                      latestArchetype
                    }
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">

                {stats.map(
                  ([
                    name,
                    value,
                    icon,
                  ]) => (
                    <StatCard
                      key={name}
                      name={name}
                      value={value}
                      icon={icon}
                    />
                  )
                )}

              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-5">

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                  <p className="text-xs font-bold tracking-[0.2em] text-green-500">
                    CORE STRENGTHS
                  </p>

                  <div className="space-y-3 mt-5">

                    {strengths.map(
                      ([
                        name,
                        value,
                      ]) => (
                        <div
                          key={name}
                          className="flex justify-between bg-zinc-900 rounded-xl px-4 py-3"
                        >
                          <span className="text-sm">
                            {name}
                          </span>

                          <span className="font-black text-green-400">
                            {value}
                          </span>
                        </div>
                      )
                    )}

                  </div>

                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                  <p className="text-xs font-bold tracking-[0.2em] text-yellow-500">
                    DEVELOPMENT AREA
                  </p>

                  <div className="flex justify-between bg-zinc-900 rounded-xl px-4 py-3 mt-5">

                    <span className="text-sm">
                      {weakness[0]}
                    </span>

                    <span className="font-black text-yellow-400">
                      {weakness[1]}
                    </span>

                  </div>

                  <p className="text-xs text-gray-600 mt-4 leading-relaxed">
                    This is the lowest-scoring
                    area of the current
                    assessment. Repeated
                    assessments can show
                    whether this is a consistent
                    part of the player's profile.
                  </p>

                </div>

              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-7 mb-5">

                <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                  PROFILE ANALYSIS
                </p>

                <h2 className="text-2xl font-black mt-3">
                  {archetype.name}
                </h2>

                <p className="text-gray-400 leading-relaxed mt-3">
                  {
                    archetype.description
                  }
                </p>

                <div className="mt-6 pt-5 border-t border-zinc-800">

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Recruit Score weighs
                    decision quality, team
                    awareness, objective
                    understanding, adaptability,
                    and map awareness more
                    heavily than individual
                    gunfight performance.
                  </p>

                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  onClick={
                    startAssessment
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 px-7 py-4 rounded-xl font-black"
                >
                  RETAKE ASSESSMENT
                </button>

                <button
                  onClick={() =>
                    setView(
                      "profile"
                    )
                  }
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-7 py-4 rounded-xl font-black"
                >
                  VIEW FULL PROFILE
                </button>

              </div>

            </section>
          )}

        {/* =================================================
            PROFILE
           ================================================= */}

        {profile &&
          view === "profile" && (
            <section className="max-w-5xl mx-auto">

              <div className="mb-8">

                <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                  PLAYER PROFILE
                </p>

                <h1 className="text-5xl md:text-6xl font-black mt-2">
                  {profile.name}
                </h1>

                <p className="text-gray-600 mt-2">
                  Competitive DNA •{" "}
                  {
                    profile
                      .attempts
                      .length
                  }{" "}
                  assessments
                </p>

              </div>

              {profile.attempts
                .length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center">

                  <p className="text-gray-500">
                    Complete your first
                    assessment to build
                    your profile.
                  </p>

                  <button
                    onClick={
                      startAssessment
                    }
                    className="mt-5 bg-red-600 px-7 py-3 rounded-xl font-black"
                  >
                    START ASSESSMENT
                  </button>

                </div>
              ) : (
                <>

                  <div className="grid md:grid-cols-3 gap-4 mb-5">

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-xs text-gray-600 uppercase">
                        Best Overall
                      </p>

                      <p className="text-5xl font-black mt-2">
                        {
                          profile.bestOverall
                        }
                      </p>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-xs text-gray-600 uppercase">
                        Best Recruit
                      </p>

                      <p className="text-5xl font-black text-red-500 mt-2">
                        {
                          profile.bestRecruitScore
                        }
                      </p>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-xs text-gray-600 uppercase">
                        Attempts
                      </p>

                      <p className="text-5xl font-black mt-2">
                        {
                          profile
                            .attempts
                            .length
                        }
                      </p>

                    </div>

                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">

                    <div className="p-6 border-b border-zinc-800">

                      <h2 className="font-black text-xl">
                        Assessment History
                      </h2>

                    </div>

                    <div className="divide-y divide-zinc-900">

                      {[
                        ...profile.attempts,
                      ]
                        .reverse()
                        .map(
                          (
                            attempt,
                            index
                          ) => (
                            <div
                              key={`${attempt.date}-${index}`}
                              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >

                              <div>

                                <p className="font-bold">
                                  Assessment #
                                  {
                                    profile
                                      .attempts
                                      .length -
                                      index
                                  }
                                </p>

                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(
                                    attempt.date
                                  ).toLocaleDateString()}
                                </p>

                              </div>

                              <div className="flex items-center gap-5">

                                <div>
                                  <p className="text-[10px] text-gray-600 uppercase">
                                    Overall
                                  </p>

                                  <p className="font-black">
                                    {
                                      attempt.overall
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] text-gray-600 uppercase">
                                    Recruit
                                  </p>

                                  <p className="font-black text-red-500">
                                    {
                                      attempt.recruitScore
                                    }
                                  </p>
                                </div>

                                <div className="hidden sm:block">

                                  <p className="text-[10px] text-gray-600 uppercase">
                                    Archetype
                                  </p>

                                  <p className="text-xs font-bold">
                                    {
                                      attempt.archetype
                                    }
                                  </p>

                                </div>

                              </div>

                            </div>
                          )
                        )}

                    </div>

                  </div>

                </>
              )}

              <button
                onClick={
                  resetPlayer
                }
                className="text-xs text-gray-700 hover:text-red-500 mt-8"
              >
                Reset local player profile
              </button>

            </section>
          )}

        {/* =================================================
            TEAM LAB
           ================================================= */}

        {profile &&
          view === "team" && (
            <section className="max-w-5xl mx-auto">

              <div className="mb-8">

                <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                  TEAM LAB
                </p>

                <h1 className="text-5xl md:text-6xl font-black mt-2">
                  ROSTER VIEW
                </h1>

                <p className="text-gray-600 mt-3">
                  View the player's latest
                  competitive attributes,
                  role tendencies, and
                  recruiting profile.
                </p>

              </div>

              {profile.attempts
                .length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">

                  <p className="text-gray-500">
                    Complete an assessment
                    to create a roster
                    profile.
                  </p>

                </div>
              ) : (
                <>
                  {(() => {
                    const latest =
                      profile.attempts[
                        profile
                          .attempts
                          .length -
                          1
                      ];

                    return (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">

                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">

                          <div>

                            <p className="text-xs text-gray-600 uppercase">
                              Current Player
                            </p>

                            <h2 className="text-2xl font-black mt-1">
                              {
                                profile.name
                              }
                            </h2>

                          </div>

                          <div className="text-right">

                            <p className="text-3xl font-black text-red-500">
                              {
                                latest.recruitScore
                              }
                            </p>

                            <p className="text-[10px] text-gray-600 uppercase">
                              Recruit
                            </p>

                          </div>

                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-5">

                          {(
                            Object.entries(
                              latest.scores
                            ) as [
                              keyof Scores,
                              number
                            ][]
                          ).map(
                            ([
                              key,
                              value,
                            ]) => {

                              const labels: Record<
                                keyof Scores,
                                string
                              > = {
                                decisionMaking:
                                  "Decision Making",
                                mapAwareness:
                                  "Map Awareness",
                                teamIQ:
                                  "Team IQ",
                                objectiveIQ:
                                  "Objective IQ",
                                gunfightIQ:
                                  "Gunfight IQ",
                                adaptability:
                                  "Adaptability",
                              };

                              return (
                                <div
                                  key={key}
                                  className="bg-zinc-900 rounded-xl p-4"
                                >

                                  <p className="text-xs text-gray-600">
                                    {
                                      labels[
                                        key
                                      ]
                                    }
                                  </p>

                                  <p
                                    className={`text-2xl font-black mt-1 ${getScoreColor(
                                      value
                                    )}`}
                                  >
                                    {
                                      value
                                    }
                                  </p>

                                </div>
                              );
                            }
                          )}

                        </div>

                      </div>
                    );
                  })()}

                  <div className="grid md:grid-cols-3 gap-4 mt-5">

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-2xl mb-3">
                        🤝
                      </p>

                      <h3 className="font-black">
                        Team Fit
                      </h3>

                      <p className="text-xs text-gray-600 mt-2">
                        Highlights how a
                        player's decision
                        making and teamwork
                        profile fits a
                        coordinated roster.
                      </p>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-2xl mb-3">
                        📊
                      </p>

                      <h3 className="font-black">
                        Roster Balance
                      </h3>

                      <p className="text-xs text-gray-600 mt-2">
                        Displays the six
                        core attributes used
                        to understand where
                        a player contributes
                        most.
                      </p>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-2xl mb-3">
                        🏆
                      </p>

                      <h3 className="font-black">
                        Role Profile
                      </h3>

                      <p className="text-xs text-gray-600 mt-2">
                        Uses the player's
                        strongest attributes
                        to identify their
                        current competitive
                        archetype.
                      </p>

                    </div>

                  </div>

                </>
              )}

            </section>
          )}

        {/* =================================================
            CLIP IQ
           ================================================= */}

        {profile &&
          view === "clip" && (
            <section className="max-w-4xl mx-auto">

              <div className="mb-8">

                <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                  CLIP IQ
                </p>

                <h1 className="text-5xl md:text-6xl font-black mt-2">
                  GAMEPLAY REVIEW
                </h1>

                <p className="text-gray-600 mt-3">
                  Break down real gameplay
                  moments by examining
                  information, intention,
                  decision quality, and
                  adaptation.
                </p>

              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 md:p-10">

                <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">

                  <div className="text-5xl mb-5">
                    🎥
                  </div>

                  <h2 className="text-2xl font-black">
                    Gameplay Clip
                  </h2>

                  <p className="text-sm text-gray-600 max-w-lg mx-auto mt-3">
                    Select a gameplay clip
                    to associate with a
                    player's review session.
                  </p>

                  <label className="inline-block mt-6 bg-red-600 hover:bg-red-700 px-7 py-3 rounded-xl font-black cursor-pointer">

                    SELECT CLIP

                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file =
                          e.target
                            .files?.[0];

                        if (file) {
                          setClipFileName(
                            file.name
                          );
                        }
                      }}
                    />

                  </label>

                  {clipFileName && (
                    <p className="text-sm text-green-400 mt-5">
                      Selected:{" "}
                      {
                        clipFileName
                      }
                    </p>
                  )}

                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-5">

                  <div className="bg-zinc-900 rounded-2xl p-6">
                    <p className="text-xl mb-3">
                      🧭
                    </p>

                    <h3 className="font-black">
                      Situation
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Identify the match
                      state, objective,
                      teammate positions,
                      enemy information,
                      and available
                      options.
                    </p>
                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-6">
                    <p className="text-xl mb-3">
                      🧠
                    </p>

                    <h3 className="font-black">
                      Intent
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Explain what the
                      player was trying
                      to accomplish with
                      the decision.
                    </p>
                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-6">
                    <p className="text-xl mb-3">
                      🎯
                    </p>

                    <h3 className="font-black">
                      Decision
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Evaluate the choice
                      itself separately
                      from whether the
                      outcome was good
                      or bad.
                    </p>
                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-6">
                    <p className="text-xl mb-3">
                      🔄
                    </p>

                    <h3 className="font-black">
                      Adaptation
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Identify what
                      information should
                      change the player's
                      next decision.
                    </p>
                  </div>

                </div>

              </div>

            </section>
          )}

      </div>
    </main>
  );
}
