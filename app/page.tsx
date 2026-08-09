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
  mode: "HARDPOINT" | "SEARCH & DESTROY" | "OVERLOAD";
  situation: string;
  answers: Answer[];
};

const questions: Question[] = [
  {
    mode: "HARDPOINT",
    situation:
      "Your team is holding the current Hardpoint. You have about 20 seconds left, two teammates are already positioned for the next hill, and the enemy team is beginning to pressure your current hill. You are the closest player to the next hill. What do you do?",
    answers: [
      {
        text: "Stay on the current hill because every second is valuable.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 0,
          teamIQ: 2,
          objectiveIQ: 2,
          gunfightIQ: 1,
          adaptability: -1,
        },
      },
      {
        text: "Rotate early and help secure the next hill before the enemy can establish it.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 1,
          adaptability: 3,
        },
      },
      {
        text: "Push deep into the enemy side looking for kills before rotating.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -2,
          objectiveIQ: -3,
          gunfightIQ: 4,
          adaptability: 0,
        },
      },
      {
        text: "Wait until the current hill is completely contested before deciding.",
        scores: {
          decisionMaking: -1,
          mapAwareness: 1,
          teamIQ: 1,
          objectiveIQ: 0,
          gunfightIQ: 1,
          adaptability: -2,
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
        text: "Immediately challenge the enemy you know about before they reposition.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 1,
          teamIQ: 0,
          objectiveIQ: 1,
          gunfightIQ: 3,
          adaptability: 0,
        },
      },
      {
        text: "Split into three separate routes so someone eventually finds the last player.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -3,
          objectiveIQ: 0,
          gunfightIQ: 2,
          adaptability: -1,
        },
      },
      {
        text: "Keep the numbers advantage, use your information, and make the remaining enemies take the risk.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 3,
          gunfightIQ: 1,
          adaptability: 4,
        },
      },
      {
        text: "Sprint around the map looking for the missing enemy.",
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
    mode: "OVERLOAD",
    situation:
      "Your team has the Overload Device and is moving toward an enemy zone. Your carrier is approaching a dangerous choke point while two teammates are fighting ahead. You are slightly behind the carrier. What is your priority?",
    answers: [
      {
        text: "Move ahead and help create space while keeping the carrier's route protected.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 2,
          adaptability: 3,
        },
      },
      {
        text: "Leave the carrier and look for an isolated enemy.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -3,
          objectiveIQ: -4,
          gunfightIQ: 4,
          adaptability: 0,
        },
      },
      {
        text: "Stay directly beside the carrier without attempting to control space ahead.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 0,
          teamIQ: 3,
          objectiveIQ: 3,
          gunfightIQ: 0,
          adaptability: 0,
        },
      },
      {
        text: "Ignore the push and return toward your own side of the map.",
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

  {
    mode: "HARDPOINT",
    situation:
      "Your team is losing the current Hardpoint fight. You are the only teammate alive near the hill, while the other three teammates are already rotating toward the next hill. What gives your team the best chance of winning the next sequence?",
    answers: [
      {
        text: "Stay alive as long as possible and force the enemy to spend time clearing you.",
        scores: {
          decisionMaking: 3,
          mapAwareness: 3,
          teamIQ: 2,
          objectiveIQ: 3,
          gunfightIQ: 2,
          adaptability: 3,
        },
      },
      {
        text: "Chase the enemy players away from the hill.",
        scores: {
          decisionMaking: -1,
          mapAwareness: -1,
          teamIQ: -2,
          objectiveIQ: -2,
          gunfightIQ: 4,
          adaptability: -1,
        },
      },
      {
        text: "Immediately abandon the area and sprint straight to your teammates.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 2,
          teamIQ: 3,
          objectiveIQ: 2,
          gunfightIQ: 1,
          adaptability: 2,
        },
      },
      {
        text: "Keep taking the same fight until you win it.",
        scores: {
          decisionMaking: -3,
          mapAwareness: -2,
          teamIQ: -1,
          objectiveIQ: -2,
          gunfightIQ: 3,
          adaptability: -4,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "It is a 2v2 Search & Destroy round. Your teammate gets an elimination, making it a 2v1, but the enemy's last known position is uncertain. You have enough time to play slowly. What should you prioritize?",
    answers: [
      {
        text: "Immediately hunt the last player before they can reset.",
        scores: {
          decisionMaking: -1,
          mapAwareness: -1,
          teamIQ: -1,
          objectiveIQ: 0,
          gunfightIQ: 3,
          adaptability: 0,
        },
      },
      {
        text: "Use the numbers advantage, maintain communication, and restrict the enemy's options.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 3,
          gunfightIQ: 1,
          adaptability: 4,
        },
      },
      {
        text: "Separate completely so the enemy has more angles to worry about.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -3,
          objectiveIQ: 1,
          gunfightIQ: 2,
          adaptability: -1,
        },
      },
      {
        text: "Take the first aggressive fight you can find.",
        scores: {
          decisionMaking: -1,
          mapAwareness: 0,
          teamIQ: -1,
          objectiveIQ: 0,
          gunfightIQ: 4,
          adaptability: 1,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "The next Hardpoint is about to activate. Your team has two players near the rotation and two players still fighting around the old hill. The enemy has one player already close to the new hill. What information matters most before committing to the rotation?",
    answers: [
      {
        text: "How many kills you can get before leaving the current fight.",
        scores: {
          decisionMaking: 0,
          mapAwareness: -1,
          teamIQ: -1,
          objectiveIQ: -2,
          gunfightIQ: 3,
          adaptability: 0,
        },
      },
      {
        text: "Whether your teammates can safely establish the new hill while you help deny the enemy's route.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Whether the enemy player near the hill is carrying a streak.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 1,
          teamIQ: 0,
          objectiveIQ: 1,
          gunfightIQ: 2,
          adaptability: 1,
        },
      },
      {
        text: "Nothing. Everyone should rotate immediately regardless of the situation.",
        scores: {
          decisionMaking: -1,
          mapAwareness: -2,
          teamIQ: 0,
          objectiveIQ: 1,
          gunfightIQ: 1,
          adaptability: -2,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "The Overload Device has been dropped near the center. Your team is currently closer to it, but one teammate has just been eliminated while trying to pick it up. The enemy is likely rotating toward the area. What should you consider before sending another player for the Device?",
    answers: [
      {
        text: "Whether you can create enough space around the Device before attempting the pickup.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Whether the next player can get the pickup before anyone else gets another elimination.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 0,
          teamIQ: 1,
          objectiveIQ: 2,
          gunfightIQ: 2,
          adaptability: 1,
        },
      },
      {
        text: "Send the closest player immediately regardless of the enemy position.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -3,
          teamIQ: -1,
          objectiveIQ: 0,
          gunfightIQ: 2,
          adaptability: -2,
        },
      },
      {
        text: "Forget the Device and send everyone toward the enemy's side.",
        scores: {
          decisionMaking: -3,
          mapAwareness: -2,
          teamIQ: -3,
          objectiveIQ: -4,
          gunfightIQ: 4,
          adaptability: -1,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You are defending in Search & Destroy. Early in the round, your team gets no information from one side of the map, while multiple enemies are spotted elsewhere. What should you infer?",
    answers: [
      {
        text: "The quiet side is automatically safe.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -4,
          teamIQ: -1,
          objectiveIQ: -1,
          gunfightIQ: 1,
          adaptability: -2,
        },
      },
      {
        text: "The spotted enemies could be creating pressure while another player uses the quiet side.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 3,
          objectiveIQ: 3,
          gunfightIQ: 1,
          adaptability: 4,
        },
      },
      {
        text: "Everyone should immediately leave their positions and chase the spotted enemies.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -2,
          objectiveIQ: -1,
          gunfightIQ: 3,
          adaptability: -1,
        },
      },
      {
        text: "The enemy team must all be in the area where they were spotted.",
        scores: {
          decisionMaking: -1,
          mapAwareness: -2,
          teamIQ: 0,
          objectiveIQ: 0,
          gunfightIQ: 1,
          adaptability: -2,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team is ahead on Hardpoint, but the enemy has started consistently breaking your setup through the same route. You have died to that route twice in a row. What does strong adaptation look like?",
    answers: [
      {
        text: "Keep using the same setup and trust that the next gunfight will go differently.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -2,
          teamIQ: -1,
          objectiveIQ: 0,
          gunfightIQ: 3,
          adaptability: -4,
        },
      },
      {
        text: "Change the defensive setup and have a teammate help cover the repeated entry.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 3,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Push that route alone so the enemy cannot use it anymore.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 1,
          teamIQ: -1,
          objectiveIQ: -1,
          gunfightIQ: 4,
          adaptability: 2,
        },
      },
      {
        text: "Ignore the pattern because your team is still winning.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -2,
          teamIQ: -2,
          objectiveIQ: -1,
          gunfightIQ: 1,
          adaptability: -3,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "Your team is down 1v2 in Search & Destroy. You have information suggesting both enemies are separated, but you do not know exactly where either one is. The bomb is down in an exposed area. What is your best priority?",
    answers: [
      {
        text: "Take the fastest fight possible before both enemies can regroup.",
        scores: {
          decisionMaking: -1,
          mapAwareness: 0,
          teamIQ: 0,
          objectiveIQ: 0,
          gunfightIQ: 4,
          adaptability: 1,
        },
      },
      {
        text: "Use the bomb's location to force the enemies to make a decision while preserving your life.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 1,
          objectiveIQ: 4,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Immediately challenge the area where you last saw an enemy.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: 0,
          objectiveIQ: 1,
          gunfightIQ: 3,
          adaptability: 0,
        },
      },
      {
        text: "Sprint around the map until you find one of them.",
        scores: {
          decisionMaking: -3,
          mapAwareness: -2,
          teamIQ: -1,
          objectiveIQ: -1,
          gunfightIQ: 2,
          adaptability: -2,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team is attacking in Overload and the enemy has stopped your carrier near a choke point. Your carrier drops the Device and survives. Three enemies are visible near the route, but two of your teammates are still alive behind you. What is the strongest play?",
    answers: [
      {
        text: "Immediately pick up the Device and sprint through the choke point.",
        scores: {
          decisionMaking: -1,
          mapAwareness: -2,
          teamIQ: 0,
          objectiveIQ: 2,
          gunfightIQ: 2,
          adaptability: -1,
        },
      },
      {
        text: "Help clear or pressure the choke point so the carrier can safely continue the push.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 3,
          adaptability: 4,
        },
      },
      {
        text: "Ignore the Device and hunt the three visible enemies.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -2,
          objectiveIQ: -4,
          gunfightIQ: 4,
          adaptability: 0,
        },
      },
      {
        text: "Fall all the way back even though your team still has control of the area.",
        scores: {
          decisionMaking: -1,
          mapAwareness: 0,
          teamIQ: -1,
          objectiveIQ: -2,
          gunfightIQ: 1,
          adaptability: -1,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team is down significantly on Hardpoint, but you have finally established control of the current hill. The enemy has already started rotating toward the next hill. What is the biggest mistake to avoid?",
    answers: [
      {
        text: "Sending too many players toward the next hill and giving up the current hill for free.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 3,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 1,
          adaptability: 3,
        },
      },
      {
        text: "Trying to win every possible gunfight around the current hill.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 0,
          teamIQ: 0,
          objectiveIQ: 1,
          gunfightIQ: 3,
          adaptability: 0,
        },
      },
      {
        text: "Rotating one player early.",
        scores: {
          decisionMaking: 3,
          mapAwareness: 3,
          teamIQ: 3,
          objectiveIQ: 3,
          gunfightIQ: 1,
          adaptability: 3,
        },
      },
      {
        text: "Using the current hill to build enough time before making the next rotation.",
        scores: {
          decisionMaking: 3,
          mapAwareness: 3,
          teamIQ: 3,
          objectiveIQ: 4,
          gunfightIQ: 1,
          adaptability: 3,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "Your team has won several rounds by playing aggressively. The enemy has started slowing down and holding deeper positions. What should you change?",
    answers: [
      {
        text: "Keep rushing exactly the same way because it worked earlier.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -1,
          objectiveIQ: 0,
          gunfightIQ: 3,
          adaptability: -4,
        },
      },
      {
        text: "Recognize the adjustment and change your pace or approach to punish their slower setup.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 3,
          objectiveIQ: 3,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Tell everyone to rush even faster.",
        scores: {
          decisionMaking: -3,
          mapAwareness: -2,
          teamIQ: -2,
          objectiveIQ: -1,
          gunfightIQ: 4,
          adaptability: -3,
        },
      },
      {
        text: "Stop making plays entirely and wait for the enemy to move.",
        scores: {
          decisionMaking: -1,
          mapAwareness: 1,
          teamIQ: 0,
          objectiveIQ: 1,
          gunfightIQ: 0,
          adaptability: -1,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team is defending an Overload zone. The enemy carrier is moving toward your side, but their teammates are arriving from multiple routes. You have enough time to react. What should your team prioritize?",
    answers: [
      {
        text: "Everyone collapse directly onto the carrier's current position.",
        scores: {
          decisionMaking: 0,
          mapAwareness: -1,
          teamIQ: 0,
          objectiveIQ: 2,
          gunfightIQ: 3,
          adaptability: 0,
        },
      },
      {
        text: "Use the carrier's route to anticipate where the push is going and establish control around the likely approach.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Ignore the carrier and eliminate the support players first wherever possible.",
        scores: {
          decisionMaking: -1,
          mapAwareness: 1,
          teamIQ: 0,
          objectiveIQ: -3,
          gunfightIQ: 4,
          adaptability: 1,
        },
      },
      {
        text: "Give up the zone and fight the enemy in the middle of the map.",
        scores: {
          decisionMaking: -3,
          mapAwareness: -2,
          teamIQ: -2,
          objectiveIQ: -4,
          gunfightIQ: 3,
          adaptability: -1,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "You are holding a Hardpoint with one teammate. Two enemies are approaching from the same side while the other two enemies have not been seen recently. Your teammate wants to challenge immediately. What should influence your decision?",
    answers: [
      {
        text: "Challenge immediately because two enemies are visible.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 0,
          teamIQ: 1,
          objectiveIQ: 1,
          gunfightIQ: 4,
          adaptability: 1,
        },
      },
      {
        text: "Consider the unseen enemies, your teammate's position, and whether giving up the hill is worth the fight.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 4,
          objectiveIQ: 4,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Always wait for the enemies to enter the hill before fighting.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 2,
          teamIQ: 2,
          objectiveIQ: 3,
          gunfightIQ: 0,
          adaptability: 0,
        },
      },
      {
        text: "Leave the hill completely so you cannot be eliminated.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: -2,
          objectiveIQ: -3,
          gunfightIQ: 0,
          adaptability: -1,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You are the last player alive for your team in a Search & Destroy round. The enemy has numbers, but you have created a situation where they must eventually expose themselves to finish the objective. What should guide your decision?",
    answers: [
      {
        text: "Take the first available gunfight immediately.",
        scores: {
          decisionMaking: -2,
          mapAwareness: -1,
          teamIQ: 0,
          objectiveIQ: 0,
          gunfightIQ: 4,
          adaptability: 0,
        },
      },
      {
        text: "Use the objective and time to force the enemy into an unfavorable decision before committing to a fight.",
        scores: {
          decisionMaking: 4,
          mapAwareness: 4,
          teamIQ: 1,
          objectiveIQ: 4,
          gunfightIQ: 2,
          adaptability: 4,
        },
      },
      {
        text: "Move constantly so the enemy cannot predict you, even if it takes you away from the objective.",
        scores: {
          decisionMaking: 0,
          mapAwareness: 2,
          teamIQ: 0,
          objectiveIQ: -1,
          gunfightIQ: 2,
          adaptability: 3,
        },
      },
      {
        text: "Push directly into the enemy's strongest position.",
        scores: {
          decisionMaking: -3,
          mapAwareness: -3,
          teamIQ: 0,
          objectiveIQ: -1,
          gunfightIQ: 3,
          adaptability: -2,
        },
      },
    ],
  },
];

function shuffleAnswers(answers: Answer[]): Answer[] {
  const shuffled = [...answers];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
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

function calculateCategoryScore(value: number): number {
  const minimum = questions.length * -4;
  const maximum = questions.length * 4;

  const percentage =
    ((value - minimum) / (maximum - minimum)) * 100;

  return Math.max(0, Math.min(100, Math.round(percentage)));
}

function getPlayerType(scores: Scores): string {
  const categories = [
    ["Decision Maker", scores.decisionMaking],
    ["Map Controller", scores.mapAwareness],
    ["Team Player", scores.teamIQ],
    ["Objective Specialist", scores.objectiveIQ],
    ["Gunfighter", scores.gunfightIQ],
    ["Adaptive Playmaker", scores.adaptability],
  ] as const;

  const sorted = [...categories].sort((a, b) => b[1] - a[1]);

  return sorted[0][0];
}

function getPlayerDescription(scores: Scores): string {
  const playerType = getPlayerType(scores);

  const descriptions: Record<string, string> = {
    "Decision Maker":
      "You tend to prioritize the highest-value play and make decisions based on the state of the match rather than forcing the same approach every time.",
    "Map Controller":
      "You naturally think about positioning, routes, pressure, and where the next engagement is likely to happen.",
    "Team Player":
      "Your decisions consistently account for teammate positioning, numbers, and creating advantages for the entire squad.",
    "Objective Specialist":
      "You understand when the objective matters most and when giving up a small amount of objective pressure can create a larger advantage.",
    Gunfighter:
      "You show a strong preference for taking fights and creating opportunities through mechanical pressure and confidence.",
    "Adaptive Playmaker":
      "You show a strong tendency to recognize changing match conditions and adjust your plan instead of repeating failed decisions.",
  };

  return descriptions[playerType];
}

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{value}</span>
      </div>

      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-600 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Scores>(createEmptyScores());
  const [finished, setFinished] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);

  function startTest() {
    const randomized = questions.map((question) => ({
      ...question,
      answers: shuffleAnswers(question.answers),
    }));

    setTestQuestions(randomized);
    setQuestionIndex(0);
    setScores(createEmptyScores());
    setFinished(false);
    setStarted(true);
  }

  function selectAnswer(answer: Answer) {
    const updatedScores: Scores = {
      decisionMaking:
        scores.decisionMaking + answer.scores.decisionMaking,
      mapAwareness:
        scores.mapAwareness + answer.scores.mapAwareness,
      teamIQ: scores.teamIQ + answer.scores.teamIQ,
      objectiveIQ:
        scores.objectiveIQ + answer.scores.objectiveIQ,
      gunfightIQ:
        scores.gunfightIQ + answer.scores.gunfightIQ,
      adaptability:
        scores.adaptability + answer.scores.adaptability,
    };

    setScores(updatedScores);

    if (questionIndex + 1 < testQuestions.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setFinished(true);
    }
  }

  const categoryScores = {
    decisionMaking: calculateCategoryScore(scores.decisionMaking),
    mapAwareness: calculateCategoryScore(scores.mapAwareness),
    teamIQ: calculateCategoryScore(scores.teamIQ),
    objectiveIQ: calculateCategoryScore(scores.objectiveIQ),
    gunfightIQ: calculateCategoryScore(scores.gunfightIQ),
    adaptability: calculateCategoryScore(scores.adaptability),
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
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-3xl">
        {!started ? (
          <section className="text-center">
            <p className="text-xs tracking-[0.35em] text-red-500 font-bold mb-4">
              CALL OF DUTY
            </p>

            <h1 className="text-5xl md:text-6xl font-black mb-5">
              COD GAME IQ
            </h1>

            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
              A competitive gameplay assessment built around
              realistic BO7 Ranked match situations.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl mx-auto mb-8 text-sm">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                Decision Making
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                Map Awareness
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                Team IQ
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                Objective IQ
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                Gunfight IQ
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                Adaptability
              </div>
            </div>

            <button
              onClick={startTest}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 px-9 py-4 rounded-xl font-bold transition"
            >
              START IQ TEST
            </button>
          </section>
        ) : finished ? (
          <section>
            <div className="text-center mb-10">
              <p className="text-xs tracking-[0.3em] text-red-500 font-bold mb-3">
                ASSESSMENT COMPLETE
              </p>

              <h2 className="text-4xl md:text-5xl font-black mb-5">
                YOUR GAME IQ
              </h2>

              <div className="text-7xl font-black">
                {overallScore}
              </div>

              <p className="text-gray-400 mt-2">
                Overall Game IQ
              </p>

              <div className="mt-6 inline-block bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Player Type
                </p>

                <p className="text-red-500 font-bold text-xl">
                  {getPlayerType(scores)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <ScoreBar
                label="Decision Making"
                value={categoryScores.decisionMaking}
              />

              <ScoreBar
                label="Map Awareness"
                value={categoryScores.mapAwareness}
              />

              <ScoreBar
                label="Team IQ"
                value={categoryScores.teamIQ}
              />

              <ScoreBar
                label="Objective IQ"
                value={categoryScores.objectiveIQ}
              />

              <ScoreBar
                label="Gunfight IQ"
                value={categoryScores.gunfightIQ}
              />

              <ScoreBar
                label="Adaptability"
                value={categoryScores.adaptability}
              />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mt-6">
              <p className="text-gray-300 leading-relaxed">
                {getPlayerDescription(scores)}
              </p>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={startTest}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 px-8 py-4 rounded-xl font-bold transition"
              >
                RETAKE TEST
              </button>
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-7">
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>
                  Question {questionIndex + 1} of{" "}
                  {testQuestions.length}
                </span>

                <span>
                  {Math.round(
                    ((questionIndex + 1) /
                      testQuestions.length) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all"
                  style={{
                    width: `${
                      ((questionIndex + 1) /
                        testQuestions.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8">
              <div className="mb-5">
                <span className="inline-block text-xs font-bold tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                  {testQuestions[questionIndex].mode}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-8">
                {testQuestions[questionIndex].situation}
              </h2>

              <div className="space-y-3">
                {testQuestions[questionIndex].answers.map(
                  (answer, index) => (
                    <button
                      key={answer.text}
                      onClick={() => selectAnswer(answer)}
                      className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-red-500 hover:bg-zinc-800 active:bg-zinc-700 px-5 py-4 rounded-xl transition"
                    >
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 text-gray-400 text-sm font-bold mr-3">
                        {String.fromCharCode(65 + index)}
                      </span>

                      {answer.text}
                    </button>
                  )
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
