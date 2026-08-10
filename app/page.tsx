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
  mode: "HARDPOINT" | "SEARCH & DESTROY" | "OVERLOAD";
  situation: string;
  answers: Answer[];
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

const STORAGE_KEY = "codiq-player-profile-v1";

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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 3,
        },
      },
      {
        text: "Stay on the current hill and help maximize the remaining time.",
        scores: {
          objectiveIQ: 4,
          teamIQ: 2,
          decisionMaking: 2,
        },
      },
      {
        text: "Push deep looking for kills before rotating.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -2,
          objectiveIQ: -4,
          teamIQ: -2,
        },
      },
      {
        text: "Wait until the hill becomes completely contested before deciding.",
        scores: {
          decisionMaking: -2,
          adaptability: -2,
          objectiveIQ: 1,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 4,
          adaptability: 5,
        },
      },
      {
        text: "Immediately challenge the enemy you know about before they reposition.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: 1,
        },
      },
      {
        text: "Split into separate routes so someone eventually finds the last player.",
        scores: {
          mapAwareness: -2,
          teamIQ: -4,
          decisionMaking: -2,
        },
      },
      {
        text: "Sprint around the map looking for the missing enemy.",
        scores: {
          gunfightIQ: 3,
          mapAwareness: -3,
          decisionMaking: -3,
          teamIQ: -2,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 4,
        },
      },
      {
        text: "Stay directly beside the carrier and react to whatever appears.",
        scores: {
          teamIQ: 3,
          objectiveIQ: 3,
          decisionMaking: 2,
        },
      },
      {
        text: "Leave the carrier and look for an isolated enemy.",
        scores: {
          gunfightIQ: 5,
          teamIQ: -4,
          objectiveIQ: -5,
        },
      },
      {
        text: "Return toward your own side of the map.",
        scores: {
          decisionMaking: -3,
          objectiveIQ: -4,
          adaptability: -2,
        },
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
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          objectiveIQ: 4,
          adaptability: 4,
        },
      },
      {
        text: "Immediately leave and sprint toward your teammates.",
        scores: {
          teamIQ: 4,
          mapAwareness: 3,
          decisionMaking: 2,
        },
      },
      {
        text: "Push aggressively and try to eliminate everyone around the hill.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -1,
          adaptability: -1,
        },
      },
      {
        text: "Keep taking the same fight until you win it.",
        scores: {
          gunfightIQ: 3,
          decisionMaking: -4,
          adaptability: -5,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 4,
          teamIQ: 5,
          objectiveIQ: 4,
          adaptability: 5,
        },
      },
      {
        text: "Move separately so the enemy has more angles to worry about.",
        scores: {
          mapAwareness: 1,
          teamIQ: -3,
          decisionMaking: -1,
        },
      },
      {
        text: "Take the first aggressive fight you can find.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -1,
        },
      },
      {
        text: "Wait completely still and hope the enemy makes a mistake.",
        scores: {
          objectiveIQ: 2,
          adaptability: -2,
          decisionMaking: -1,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 4,
        },
      },
      {
        text: "How many kills you can get before leaving the current fight.",
        scores: {
          gunfightIQ: 4,
          objectiveIQ: -2,
        },
      },
      {
        text: "Whether the enemy near the hill has a powerful streak available.",
        scores: {
          decisionMaking: 2,
          mapAwareness: 2,
        },
      },
      {
        text: "Everyone should rotate immediately regardless of the situation.",
        scores: {
          decisionMaking: -2,
          teamIQ: -1,
          adaptability: -3,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Whether the closest player can get the pickup immediately.",
        scores: {
          objectiveIQ: 3,
          decisionMaking: 1,
        },
      },
      {
        text: "Send the closest player regardless of the enemy position.",
        scores: {
          objectiveIQ: 1,
          decisionMaking: -3,
          mapAwareness: -4,
        },
      },
      {
        text: "Forget the Device and send everyone toward the enemy.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
          teamIQ: -4,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 4,
          objectiveIQ: 4,
          adaptability: 5,
        },
      },
      {
        text: "The quiet side is probably safe enough to ignore.",
        scores: {
          mapAwareness: -4,
          decisionMaking: -2,
        },
      },
      {
        text: "Everyone should immediately chase the enemies that were spotted.",
        scores: {
          gunfightIQ: 4,
          teamIQ: -3,
          mapAwareness: -2,
        },
      },
      {
        text: "Assume everyone is in the area where the enemies were seen.",
        scores: {
          mapAwareness: -4,
          adaptability: -2,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Push that route alone so the enemy cannot use it anymore.",
        scores: {
          gunfightIQ: 5,
          adaptability: 2,
          teamIQ: -1,
        },
      },
      {
        text: "Keep the same setup and trust the next gunfight to go differently.",
        scores: {
          gunfightIQ: 3,
          adaptability: -5,
          decisionMaking: -3,
        },
      },
      {
        text: "Ignore the pattern because your team is still winning.",
        scores: {
          adaptability: -4,
          mapAwareness: -3,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          objectiveIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Take the fastest fight possible before they regroup.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -1,
        },
      },
      {
        text: "Move constantly until you happen to find one.",
        scores: {
          adaptability: 2,
          mapAwareness: 2,
          objectiveIQ: -1,
        },
      },
      {
        text: "Push directly into their strongest likely position.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: -4,
          mapAwareness: -4,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 4,
        },
      },
      {
        text: "Immediately pick up the Device and sprint through.",
        scores: {
          objectiveIQ: 3,
          gunfightIQ: 2,
          decisionMaking: -1,
        },
      },
      {
        text: "Ignore the Device and hunt the visible enemies.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
          teamIQ: -3,
        },
      },
      {
        text: "Fall all the way back even though your team still has control.",
        scores: {
          decisionMaking: -2,
          objectiveIQ: -3,
          adaptability: -2,
        },
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
        scores: {
          decisionMaking: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          mapAwareness: 4,
        },
      },
      {
        text: "Rotating one player early.",
        scores: {
          decisionMaking: 3,
          teamIQ: 3,
          objectiveIQ: 3,
        },
      },
      {
        text: "Trying to win every gunfight around the current hill.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: -1,
        },
      },
      {
        text: "Using the current hill to build enough time before the next rotation.",
        scores: {
          objectiveIQ: 5,
          decisionMaking: 3,
          adaptability: 2,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 4,
          adaptability: 5,
        },
      },
      {
        text: "Keep rushing exactly the same way because it worked earlier.",
        scores: {
          gunfightIQ: 4,
          adaptability: -5,
          decisionMaking: -3,
        },
      },
      {
        text: "Rush even faster to overwhelm them.",
        scores: {
          gunfightIQ: 5,
          adaptability: -3,
        },
      },
      {
        text: "Stop making plays entirely and wait for them to move.",
        scores: {
          adaptability: -2,
          objectiveIQ: 1,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Everyone collapse directly onto the carrier's current position.",
        scores: {
          gunfightIQ: 4,
          objectiveIQ: 3,
          decisionMaking: 1,
        },
      },
      {
        text: "Ignore the carrier and hunt support players wherever possible.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -4,
          decisionMaking: -1,
        },
      },
      {
        text: "Give up the zone and fight in the middle of the map.",
        scores: {
          gunfightIQ: 4,
          objectiveIQ: -5,
          teamIQ: -3,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 4,
        },
      },
      {
        text: "Challenge immediately because two enemies are visible.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: 1,
        },
      },
      {
        text: "Always wait for enemies to enter the hill before fighting.",
        scores: {
          objectiveIQ: 4,
          decisionMaking: 2,
        },
      },
      {
        text: "Leave the hill completely so you cannot be eliminated.",
        scores: {
          decisionMaking: -3,
          objectiveIQ: -4,
          teamIQ: -3,
        },
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
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          objectiveIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Take the first available gunfight immediately.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -3,
        },
      },
      {
        text: "Move constantly even if it takes you away from the objective.",
        scores: {
          adaptability: 3,
          objectiveIQ: -1,
        },
      },
      {
        text: "Push directly into the enemy's strongest position.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: -5,
          mapAwareness: -4,
        },
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

    result[key] = Math.max(
      0,
      Math.min(100, Math.round(normalized))
    );
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
        "You naturally think about the win condition, teammate positioning, and the larger state of the match.",
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
        "You create pressure through individual plays while still showing an ability to adapt when the match changes.",
    };
  }

  if (
    mapAwareness >= 84 &&
    adaptability >= 82
  ) {
    return {
      name: "TEMPO CONTROLLER",
      description:
        "You tend to recognize developing pressure and adjust your positioning before the situation becomes obvious.",
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
        "Your strongest value comes from creating individual advantages. Your team-oriented decision making is the main area to develop.",
    };
  }

  if (
    decisionMaking >= 84 &&
    adaptability >= 84
  ) {
    return {
      name: "ADAPTIVE IGL",
      description:
        "You show a strong ability to recognize changing situations and alter your plan instead of forcing the same strategy.",
    };
  }

  return {
    name: "VERSATILE PLAYMAKER",
    description:
      "Your strengths are relatively balanced, suggesting you can contribute in several different ways depending on what the team needs.",
  };
}

function calculateRecruitScore(scores: Scores) {
  const score =
    scores.teamIQ * 0.2 +
    scores.decisionMaking * 0.2 +
    scores.objectiveIQ * 0.18 +
    scores.adaptability * 0.17 +
    scores.mapAwareness * 0.15 +
    scores.gunfightIQ * 0.1;

  return Math.round(score);
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 55) return "text-orange-400";

  return "text-red-400";
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

export default function Home() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  const [nameInput, setNameInput] = useState("");

  const [view, setView] = useState<
    "home" | "assessment" | "results" | "profile" | "team" | "clip"
  >("home");

  const [current, setCurrent] = useState(0);

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);

  const [rawScores, setRawScores] = useState<Scores>(
    emptyScores()
  );

  const [latestScores, setLatestScores] = useState<Scores | null>(
    null
  );

  const [latestOverall, setLatestOverall] = useState(0);

  const [latestRecruitScore, setLatestRecruitScore] = useState(0);

  const [latestArchetype, setLatestArchetype] = useState("");

  const [clipFileName, setClipFileName] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function saveProfile(updated: PlayerProfile) {
    setProfile(updated);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  }

  function createPlayer() {
    const cleanName = nameInput.trim();

    if (!cleanName) return;

    const newProfile: PlayerProfile = {
      name: cleanName,
      createdAt: new Date().toISOString(),
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

    const randomized = shuffle(
      questions.map((question) => ({
        ...question,
        answers: shuffle(question.answers),
      }))
    );

    setQuizQuestions(randomized);
    setRawScores(emptyScores());
    setCurrent(0);
    setLatestScores(null);
    setView("assessment");
  }

  function answerQuestion(answer: Answer) {
    const updated = {
      ...rawScores,
    };

    (Object.keys(answer.scores) as (keyof Scores)[]).forEach(
      (key) => {
        updated[key] += answer.scores[key] ?? 0;
      }
    );

    setRawScores(updated);

    if (current + 1 >= quizQuestions.length) {
      const calculated = calculateScores(updated);

      const overall = Math.round(
        Object.values(calculated).reduce(
          (sum, value) => sum + value,
          0
        ) / 6
      );

      const recruitScore =
        calculateRecruitScore(calculated);

      const archetype = getArchetype(calculated);

      setLatestScores(calculated);
      setLatestOverall(overall);
      setLatestRecruitScore(recruitScore);
      setLatestArchetype(archetype.name);

      if (profile) {
        const attempt: Attempt = {
          date: new Date().toISOString(),
          overall,
          recruitScore,
          archetype: archetype.name,
          scores: calculated,
        };

        const updatedProfile: PlayerProfile = {
          ...profile,
          attempts: [...profile.attempts, attempt],
          bestOverall: Math.max(
            profile.bestOverall,
            overall
          ),
          bestRecruitScore: Math.max(
            profile.bestRecruitScore,
            recruitScore
          ),
        };

        saveProfile(updatedProfile);
      }

      setView("results");
    } else {
      setRawScores(updated);
      setCurrent(current + 1);
    }
  }

  function resetPlayer() {
    localStorage.removeItem(STORAGE_KEY);

    setProfile(null);
    setLatestScores(null);
    setNameInput("");
    setView("home");
  }

  const stats = useMemo(() => {
    if (!latestScores) return [];

    return [
      ["Decision Making", latestScores.decisionMaking, "🧠"],
      ["Map Awareness", latestScores.mapAwareness, "🗺️"],
      ["Team IQ", latestScores.teamIQ, "🤝"],
      ["Objective IQ", latestScores.objectiveIQ, "🎯"],
      ["Gunfight IQ", latestScores.gunfightIQ, "🔫"],
      ["Adaptability", latestScores.adaptability, "🔄"],
    ] as const;
  }, [latestScores]);

  const strengths = [...stats].sort(
    (a, b) => b[1] - a[1]
  ).slice(0, 2);

  const weakness = [...stats].sort(
    (a, b) => a[1] - b[1]
  )[0];

  const archetype = latestScores
    ? getArchetype(latestScores)
    : null;

  const navButton = (
    label: string,
    target: typeof view
  ) => (
    <button
      onClick={() => setView(target)}
      className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
        view === target
          ? "bg-red-600 text-white"
          : "text-gray-500 hover:text-white hover:bg-zinc-900"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-6xl mx-auto px-4 py-5 md:px-8">

        <header className="flex items-center justify-between border-b border-zinc-900 pb-5 mb-8">
          <button
            onClick={() => setView("home")}
            className="font-black text-xl tracking-tight"
          >
            COD<span className="text-red-600">IQ</span>
          </button>

          {profile && (
            <nav className="flex gap-1 overflow-x-auto">
              {navButton("TEST", "home")}
              {navButton("PROFILE", "profile")}
              {navButton("TEAM", "team")}
              {navButton("CLIP IQ", "clip")}
            </nav>
          )}
        </header>

        {!profile && view === "home" && (
          <section className="min-h-[75vh] flex items-center justify-center">
            <div className="w-full max-w-3xl text-center">

              <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/5 rounded-full px-4 py-2 mb-7">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />

                <span className="text-xs font-bold tracking-[0.2em] text-red-500">
                  COMPETITIVE PLAYER ASSESSMENT
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-5">
                COD<span className="text-red-600">IQ</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-9">
                A scenario-based assessment designed to measure
                how you think when competitive matches get complicated.
              </p>

              <div className="max-w-md mx-auto">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createPlayer();
                    }
                  }}
                  placeholder="Enter player name"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 outline-none rounded-xl px-5 py-4 mb-3 text-center"
                />

                <button
                  onClick={createPlayer}
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
                  ["🔫", "Gunfight IQ"],
                  ["🔄", "Adaptability"],
                ].map(([icon, label]) => (
                  <div
                    key={label}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left"
                  >
                    <div className="text-xl mb-2">{icon}</div>

                    <p className="text-xs text-gray-400 font-semibold">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-700 mt-8">
                Early prototype • Scores are experimental and will be
                calibrated through player testing.
              </p>
            </div>
          </section>
        )}

        {profile && view === "home" && (
          <section className="max-w-5xl mx-auto">

            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-bold">
                Welcome back
              </p>

              <h1 className="text-4xl md:text-6xl font-black mt-2">
                {profile.name}
              </h1>

              <p className="text-gray-500 mt-3">
                Your competitive profile is ready for another assessment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Best Overall
                </p>

                <p className="text-4xl font-black mt-2">
                  {profile.bestOverall || "--"}
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Recruit Score
                </p>

                <p className="text-4xl font-black mt-2 text-red-500">
                  {profile.bestRecruitScore || "--"}
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Assessments
                </p>

                <p className="text-4xl font-black mt-2">
                  {profile.attempts.length}
                </p>
              </div>

            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 md:p-10">

              <div className="max-w-2xl">
                <p className="text-red-500 text-xs font-bold tracking-[0.2em]">
                  CODIQ ASSESSMENT
                </p>

                <h2 className="text-3xl md:text-4xl font-black mt-3">
                  How do you actually think in ranked?
                </h2>

                <p className="text-gray-500 mt-4 leading-relaxed">
                  You will face 15 match-state scenarios. There is
                  no visible answer key. Choices are randomized and
                  different decisions influence different parts of your
                  player profile.
                </p>

                <button
                  onClick={startAssessment}
                  className="mt-7 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-black"
                >
                  START 15-SCENARIO ASSESSMENT →
                </button>
              </div>

            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <p className="text-2xl mb-3">📈</p>
                <h3 className="font-black">Track Progress</h3>
                <p className="text-xs text-gray-600 mt-2">
                  Compare your performance across attempts.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <p className="text-2xl mb-3">🏆</p>
                <h3 className="font-black">Recruit Score</h3>
                <p className="text-xs text-gray-600 mt-2">
                  A team-oriented profile built around decision quality.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <p className="text-2xl mb-3">🎥</p>
                <h3 className="font-black">Clip IQ</h3>
                <p className="text-xs text-gray-600 mt-2">
                  The next phase: comparing decisions with real gameplay.
                </p>
              </div>

            </div>
          </section>
        )}

        {profile && view === "assessment" && quizQuestions.length > 0 && (
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
                  / {quizQuestions.length}
                </span>
              </p>
            </div>

            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-red-600 transition-all"
                style={{
                  width: `${((current + 1) / quizQuestions.length) * 100}%`,
                }}
              />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">

              <div className="px-6 py-5 border-b border-zinc-800 flex justify-between">
                <span className="text-xs font-black tracking-[0.18em] text-red-500">
                  {quizQuestions[current].mode}
                </span>

                <span className="text-xs text-gray-700">
                  Scenario {current + 1}
                </span>
              </div>

              <div className="p-6 md:p-9">

                <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-9">
                  {quizQuestions[current].situation}
                </h2>

                <div className="space-y-3">
                  {quizQuestions[current].answers.map(
                    (answer, index) => (
                      <button
                        key={answer.text}
                        onClick={() => answerQuestion(answer)}
                        className="group w-full text-left bg-[#080808] border border-zinc-800 hover:border-red-500/60 hover:bg-zinc-900 rounded-2xl p-4 md:p-5 transition"
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

        {profile && view === "results" && latestScores && archetype && (
          <section className="max-w-5xl mx-auto pb-12">

            <div className="text-center mb-10">

              <p className="text-xs font-bold tracking-[0.25em] text-red-500 mb-4">
                ASSESSMENT COMPLETE
              </p>

              <h1 className="text-5xl md:text-7xl font-black">
                PLAYER DNA
              </h1>

              <p className="text-gray-600 mt-3">
                {profile.name} • Assessment #{profile.attempts.length}
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
                  {latestRecruitScore}
                </p>

                <p className="text-xs text-gray-600 mt-2">
                  {getRecruitLabel(latestRecruitScore)}
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 text-center">
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Archetype
                </p>

                <p className="text-2xl font-black text-red-500 mt-5">
                  {latestArchetype}
                </p>
              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              {stats.map(([name, value, icon]) => (
                <StatCard
                  key={name}
                  name={name}
                  value={value}
                  icon={icon}
                />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-5">

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                <p className="text-xs font-bold tracking-[0.2em] text-green-500">
                  CORE STRENGTHS
                </p>

                <div className="space-y-3 mt-5">
                  {strengths.map(([name, value]) => (
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
                  ))}
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
                  This is currently the lowest-scoring part of your
                  player profile. Future assessments can determine
                  whether this is a consistent pattern.
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
                {archetype.description}
              </p>

              <div className="mt-6 pt-5 border-t border-zinc-800">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Recruit Score emphasizes team-oriented decision
                  making, objective understanding, adaptability, and
                  map awareness. It is an experimental prototype metric,
                  not a verified competitive ranking.
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={startAssessment}
                className="flex-1 bg-red-600 hover:bg-red-700 px-7 py-4 rounded-xl font-black"
              >
                RETAKE ASSESSMENT
              </button>

              <button
                onClick={() => setView("profile")}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-7 py-4 rounded-xl font-black"
              >
                VIEW FULL PROFILE
              </button>

            </div>

          </section>
        )}

        {profile && view === "profile" && (
          <section className="max-w-5xl mx-auto">

            <div className="mb-8">
              <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                PLAYER PROFILE
              </p>

              <h1 className="text-5xl md:text-6xl font-black mt-2">
                {profile.name}
              </h1>

              <p className="text-gray-600 mt-2">
                Competitive DNA • {profile.attempts.length} assessments
              </p>
            </div>

            {profile.attempts.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center">
                <p className="text-gray-500">
                  Complete your first assessment to build your profile.
                </p>

                <button
                  onClick={startAssessment}
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
                      {profile.bestOverall}
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-xs text-gray-600 uppercase">
                      Best Recruit
                    </p>

                    <p className="text-5xl font-black text-red-500 mt-2">
                      {profile.bestRecruitScore}
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-xs text-gray-600 uppercase">
                      Attempts
                    </p>

                    <p className="text-5xl font-black mt-2">
                      {profile.attempts.length}
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
                    {[...profile.attempts]
                      .reverse()
                      .map((attempt, index) => (
                        <div
                          key={`${attempt.date}-${index}`}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div>
                            <p className="font-bold">
                              Assessment #{profile.attempts.length - index}
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
                                {attempt.overall}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] text-gray-600 uppercase">
                                Recruit
                              </p>

                              <p className="font-black text-red-500">
                                {attempt.recruitScore}
                              </p>
                            </div>

                            <div className="hidden sm:block">
                              <p className="text-[10px] text-gray-600 uppercase">
                                Archetype
                              </p>

                              <p className="text-xs font-bold">
                                {attempt.archetype}
                              </p>
                            </div>

                          </div>
                        </div>
                      ))}
                  </div>

                </div>
              </>
            )}

            <button
              onClick={resetPlayer}
              className="text-xs text-gray-700 hover:text-red-500 mt-8"
            >
              Reset local player profile
            </button>

          </section>
        )}

        {profile && view === "team" && (
          <section className="max-w-5xl mx-auto">

            <div className="mb-8">
              <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                TEAM LAB
              </p>

              <h1 className="text-5xl md:text-6xl font-black mt-2">
                ROSTER VIEW
              </h1>

              <p className="text-gray-600 mt-3">
                This is the first version of the future team dashboard.
                Currently it compares players saved on this device.
              </p>
            </div>

            {profile.attempts.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-gray-500">
                  Complete an assessment first.
                </p>
              </div>
            ) : (
              <>
                {(() => {
                  const latest =
                    profile.attempts[
                      profile.attempts.length - 1
                    ];

                  return (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">

                      <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-600 uppercase">
                            Current Player
                          </p>

                          <h2 className="text-2xl font-black mt-1">
                            {profile.name}
                          </h2>
                        </div>

                        <div className="text-right">
                          <p className="text-3xl font-black text-red-500">
                            {latest.recruitScore}
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
                          ) as [keyof Scores, number][]
                        ).map(([key, value]) => {

                          const labels: Record<
                            keyof Scores,
                            string
                          > = {
                            decisionMaking:
                              "Decision Making",
                            mapAwareness:
                              "Map Awareness",
                            teamIQ: "Team IQ",
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
                                {labels[key]}
                              </p>

                              <p
                                className={`text-2xl font-black mt-1 ${getScoreColor(
                                  value
                                )}`}
                              >
                                {value}
                              </p>
                            </div>
                          );
                        })}

                      </div>

                    </div>
                  );
                })()}

                <div className="grid md:grid-cols-3 gap-4 mt-5">

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-2xl mb-3">🤝</p>
                    <h3 className="font-black">
                      Team Fit
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Future versions can compare a player's profile
                      against specific roster roles.
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-2xl mb-3">📊</p>
                    <h3 className="font-black">
                      Roster Balance
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Future team dashboards can identify gaps across
                      a five-player roster.
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-2xl mb-3">🏆</p>
                    <h3 className="font-black">
                      Role Matching
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Match player tendencies to roles rather than
                      judging everyone by one overall score.
                    </p>
                  </div>

                </div>
              </>
            )}

          </section>
        )}

        {profile && view === "clip" && (
          <section className="max-w-4xl mx-auto">

            <div className="mb-8">
              <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                CLIP IQ
              </p>

              <h1 className="text-5xl md:text-6xl font-black mt-2">
                REAL GAMEPLAY
              </h1>

              <p className="text-gray-600 mt-3">
                The next layer of CODIQ: comparing what a player
                says they should do with what actually happens in-game.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 md:p-10">

              <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">

                <div className="text-5xl mb-5">
                  🎥
                </div>

                <h2 className="text-2xl font-black">
                  Upload a gameplay clip
                </h2>

                <p className="text-sm text-gray-600 max-w-lg mx-auto mt-3">
                  For this prototype, clips are only selected locally.
                  We are not pretending the site can automatically
                  analyze gameplay yet. The next version can connect
                  clip analysis to specific scenario questions.
                </p>

                <label className="inline-block mt-6 bg-red-600 hover:bg-red-700 px-7 py-3 rounded-xl font-black cursor-pointer">
                  SELECT CLIP

                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        setClipFileName(file.name);
                      }
                    }}
                  />
                </label>

                {clipFileName && (
                  <p className="text-sm text-green-400 mt-5">
                    Selected: {clipFileName}
                  </p>
                )}

              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-5">

                <div className="bg-zinc-900 rounded-2xl p-6">
                  <p className="text-xl mb-3">1️⃣</p>
                  <h3 className="font-black">
                    What were you trying to accomplish?
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Identify your intended objective before reviewing
                    the outcome.
                  </p>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-6">
                  <p className="text-xl mb-3">2️⃣</p>
                  <h3 className="font-black">
                    What information did you have?
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Separate what you actually knew from what you
                    assumed.
                  </p>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-6">
                  <p className="text-xl mb-3">3️⃣</p>
                  <h3 className="font-black">
                    What decision did you make?
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Explain the decision without judging the result.
                  </p>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-6">
                  <p className="text-xl mb-3">4️⃣</p>
                  <h3 className="font-black">
                    Would you make it again?
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    This becomes the foundation for future clip-based
                    decision analysis.
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
