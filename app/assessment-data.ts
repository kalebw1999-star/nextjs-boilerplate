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

export const questions: Question[] = liveQuestions.map((question) => {
  if (question.situation.includes("first blood") && question.situation.includes("3v3")) {
    return {
      ...question,
      situation: "You are attacking in a 4v4. Your teammate gets first blood but is immediately traded, so you are now in a 3v3. You have 65 seconds left. What should happen next?",
      explanation: "The first blood created a temporary numbers advantage, but the teammate was immediately traded, returning the round to 3v3. The useful information from that engagement should still shape the next play instead of forcing another isolated challenge.",
    };
  }

  if (question.situation.includes("249") && question.situation.includes("247") && question.situation.includes("rotat")) {
    return {
      ...question,
      situation: "The score is 249–247 with 18 seconds left. Your team is winning, and the enemy team is pushing to contest the hill. What kind of defense should you prioritize?",
      explanation: "At 249–247, the enemy has to contest because the next point wins the game. The priority is to defend the current hill, protect the winning position, and take the necessary fights without giving up the objective.",
    };
  }

  if (question.situation.toLowerCase().includes("bomb carrier") && question.situation.toLowerCase().includes("hear")) {
    return {
      ...question,
      situation: question.situation.replace(/you hear the bomb carrier/gi, "you see the bomb carrier planting").replace(/hear the bomb carrier/gi, "see the bomb carrier planting"),
    };
  }

  return question;
});
