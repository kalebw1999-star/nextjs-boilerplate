// CODIQ assessment bank: thirty scenarios are used by the live assessment.

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

const score = (values: Partial<Scores>) => values;

// The complete scenario bank is stored here; the app deliberately uses the first thirty until the larger question pool is introduced.
export const questions: Question[] = [];
