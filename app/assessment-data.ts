export type Scores = {
  decisionMaking: number;
  mapAwareness: number;
  teamIQ: number;
  objectiveIQ: number;
  gunfightIQ: number;
  adaptability: number;
};

export type Answer = {
  text: string;
  scores: Partial<Scores>;
  correct: boolean;
};

export type Question = {
  mode: "HARDPOINT" | "SEARCH & DESTROY";
  situation: string;
  answers: Answer[];
  explanation: string;
};

import { liveQuestions } from "./live-assessment-data";

const questionFixes: Record<string, Pick<Question, "situation" | "explanation">> = {
  "You are defending a 3v3. One enemy is heard near one site, while two were last seen on the other side. You have 35 seconds. How should you rotate?": {
    situation: "You are defending a 3v3. You see an enemy near one site, while two were last seen on the other side. You have 35 seconds. How should you rotate?",
    explanation: "The enemy you saw near the site is the immediate objective threat, but the other two attackers still matter. A controlled rotation supports the likely site without throwing away the information you already have.",
  },
  "The score is 249–247 with 18 seconds left. A teammate is on the hill while you have a clean angle on an enemy rotating toward the next one. What should you prioritize?": {
    situation: "The score is 249–247 with 18 seconds left. Your team is on the hill, and the enemy team is pushing to contest. What kind of defense should you prioritize?",
    explanation: "At 249–247, every remaining second is extremely valuable. The enemy has to contest the hill, so the priority is to protect the current winning position and take the necessary fight without abandoning the objective.",
  },
  "You are attacking 3v3. Your first player dies without a kill, but you now know the defender's exact angle. You have 65 seconds. What should happen next?": {
    situation: "You are attacking 3v3. Your teammate gets first blood but is immediately traded, returning the round to 3v3. You now know the defender's exact angle. You have 65 seconds. What should happen next?",
    explanation: "The trade still produced useful information. With 65 seconds, the team can adapt the entry and exploit the known position instead of feeding another isolated challenge.",
  },
};

export const questions: Question[] = liveQuestions.map((question) => {
  const fix = questionFixes[question.situation];
  return fix ? { ...question, ...fix } : question;
});
