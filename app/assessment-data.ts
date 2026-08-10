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

export { liveQuestions as questions } from "./live-assessment-data";
