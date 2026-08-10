"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { questions, type Question, type Scores } from "./assessment-data";

const ASSESSMENT_QUESTIONS = questions.slice(0, 30);
const STORAGE_KEY = "codiq-player-profile-v3";
const ADMIN_USERNAME = "kynetic";
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

type ReviewItem = { mode: Question["mode"]; situation: string; answers: Array<{ text: string; correct: boolean }>; selectedIndex: number; explanation: string };
type Attempt = { date: string; overall: number; recruitScore: number; archetype: string; scores: Scores; review?: ReviewItem[] };
type PlayerProfile = { name: string; createdAt: string; isAdmin?: boolean; attempts: Attempt[]; bestOverall: number; bestRecruitScore: number };
type AssessmentStatus = { isAdmin: boolean; canTakeAssessment: boolean; nextAssessmentAt: string | null };

const emptyScores = (): Scores => ({ decisionMaking: 0, mapAwareness: 0, teamIQ: 0, objectiveIQ: 0, gunfightIQ: 0, adaptability: 0 });

function shuffle<T>(array: T[]) { const result = [...array]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }

function maxCategoryScores() {
  const max = emptyScores();
  for (const question of ASSESSMENT_QUESTIONS) {
    const correct = question.answers.find((answer) => answer.correct);
    if (!correct) continue;
    for (const key of Object.keys(max) as (keyof Scores)[]) max[key] += correct.scores[key] ?? 0;
  }
  return max;
}

function calculateScores(raw: Scores) {
  const max = maxCategoryScores();
  const result = emptyScores();
  for (const key of Object.keys(result) as (keyof Scores)[]) result[key] = max[key] ? Math.round((raw[key] / max[key]) * 100) : 0;
  return result;
}

function calculateOverall(scores: Scores) { return Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / 6); }
function calculateRecruitScore(scores: Scores) { return Math.round(scores.teamIQ * .22 + scores.decisionMaking * .21 + scores.objectiveIQ * .19 + scores.adaptability * .16 + scores.mapAwareness * .14 + scores.gunfightIQ * .08); }

function getArchetype(scores: Scores) {
  if (scores.teamIQ >= 82 && scores.objectiveIQ >= 80 && scores.decisionMaking >= 78) return { name: "SYSTEM PLAYER", description: "You naturally think about the win condition, teammate positioning, and the larger state of the match." };
  if (scores.gunfightIQ >= 84 && scores.decisionMaking >= 76 && scores.adaptability >= 72) return { name: "AGGRESSIVE PLAYMAKER", description: "You create pressure through individual plays while still showing an ability to adjust when the match changes." };
  if (scores.mapAwareness >= 84 && scores.adaptability >= 80) return { name: "TEMPO CONTROLLER", description: "You recognize developing pressure and adjust your positioning before situations become obvious." };
  if (scores.objectiveIQ >= 84 && scores.teamIQ >= 78) return { name: "OBJECTIVE ANCHOR", description: "You understand how individual decisions affect the objective and create stable situations for your team." };
  if (scores.gunfightIQ >= 88 && scores.teamIQ < 72) return { name: "MECHANICAL CARRY", description: "Your strongest value comes from creating individual advantages. Team-oriented decision making is the largest development area." };
  if (scores.decisionMaking >= 84 && scores.adaptability >= 84) return { name: "ADAPTIVE IGL", description: "You recognize changing situations quickly and alter your plan instead of forcing the same strategy." };
  return { name: "VERSATILE PLAYMAKER", description: "Your strengths are relatively balanced, suggesting you can contribute in several different ways depending on what the team needs." };
}

function getRecruitLabel(score: number) { if (score >= 90) return "ELITE PROSPECT"; if (score >= 82) return "HIGH PRIORITY PROSPECT"; if (score >= 74) return "DEVELOPING PROSPECT"; if (score >= 65) return "EMERGING PLAYER"; return "EARLY DEVELOPMENT"; }
function scoreColor(score: number) { if (score >= 85) return "text-green-400"; if (score >= 70) return "text-yellow-400"; if (score >= 55) return "text-orange-400"; return "text-red-400"; }
function formatRemaining(nextAt: string | null, now: number) { if (!nextAt) return ""; const ms = Math.max(0, new Date(nextAt).getTime() - now); const totalHours = Math.ceil(ms / 3600000); const days = Math.floor(totalHours / 24); const hours = totalHours % 24; return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`; }

export default function Home() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [view, setView] = useState<"home" | "assessment" | "results" | "profile" | "team" | "clip" | "review">("home");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [rawScores, setRawScores] = useState<Scores>(emptyScores());
  const [latestScores, setLatestScores] = useState<Scores | null>(null);
  const [latestOverall, setLatestOverall] = useState(0);
  const [latestRecruitScore, setLatestRecruitScore] = useState(0);
  const [latestArchetype, setLatestArchetype] = useState("");
  const [status, setStatus] = useState<AssessmentStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const [reviewError, setReviewError] = useState("");
  const [serverReview, setServerReview] = useState<ReviewItem[]>([]);
  const reviewRef = useRef<ReviewItem[]>([]);

  const isAdmin = Boolean(profile?.isAdmin || profile?.name?.toLowerCase() === ADMIN_USERNAME);
  const locked = Boolean(status && !status.canTakeAssessment && !isAdmin);
  const latestAttempt = profile?.attempts?.[profile.attempts.length - 1];
  const reviewVisible = Boolean(locked && !isAdmin && latestAttempt?.review);

  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setProfile(JSON.parse(saved)); } catch { localStorage.removeItem(STORAGE_KEY); } }, []);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60000); return () => window.clearInterval(timer); }, []);

  async function loadStatus() {
    try { const response = await fetch("/api/assessment/status", { cache: "no-store" }); if (response.ok) setStatus(await response.json()); } catch {}
  }
  useEffect(() => { if (profile) void loadStatus(); }, [profile?.name]);

  function saveProfile(updated: PlayerProfile) { setProfile(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); }

  async function startAssessment() {
    setStatusMessage("");
    const response = await fetch("/api/assessment/status", { cache: "no-store" });
    const fresh: AssessmentStatus = response.ok ? await response.json() : { isAdmin, canTakeAssessment: false, nextAssessmentAt: null };
    setStatus(fresh);
    if (!fresh.canTakeAssessment && !fresh.isAdmin) { setStatusMessage("Your assessment is locked for three days after completion."); setView("home"); return; }
    const randomized = shuffle(ASSESSMENT_QUESTIONS.map((question) => ({ ...question, answers: shuffle(question.answers) })));
    setQuizQuestions(randomized); setCurrent(0); setSelectedAnswers([]); setFeedbackVisible(false); setFeedbackCorrect(false); setRawScores(emptyScores()); setLatestScores(null); reviewRef.current = []; setView("assessment");
  }

  function addReviewItem(question: Question, selectedIndex: number) {
    const item: ReviewItem = { mode: question.mode, situation: question.situation, answers: question.answers.map((answer) => ({ text: answer.text, correct: answer.correct })), selectedIndex, explanation: question.explanation };
    reviewRef.current = [...reviewRef.current, item];
  }

  function answerQuestion(index: number) {
    const question = quizQuestions[current]; if (!question || feedbackVisible) return;
    const answer = question.answers[index];
    if (answer.correct) setRawScores((previous) => { const updated = { ...previous }; for (const key of Object.keys(updated) as (keyof Scores)[]) updated[key] += answer.scores[key] ?? 0; return updated; });
    addReviewItem(question, index); setSelectedAnswers([index]); setFeedbackCorrect(answer.correct); setFeedbackVisible(true);
  }

  function finishAssessment() {
    const calculated = calculateScores(rawScores); const overall = calculateOverall(calculated); const recruitScore = calculateRecruitScore(calculated); const archetype = getArchetype(calculated);
    const attempt: Attempt = { date: new Date().toISOString(), overall, recruitScore, archetype: archetype.name, scores: calculated, review: reviewRef.current };
    const updated: PlayerProfile = { ...(profile as PlayerProfile), attempts: [...(profile?.attempts ?? []), attempt], bestOverall: Math.max(profile?.bestOverall ?? 0, overall), bestRecruitScore: Math.max(profile?.bestRecruitScore ?? 0, recruitScore) };
    saveProfile(updated); setLatestScores(calculated); setLatestOverall(overall); setLatestRecruitScore(recruitScore); setLatestArchetype(archetype.name);
    if (!isAdmin) setStatus({ isAdmin: false, canTakeAssessment: false, nextAssessmentAt: new Date(Date.now() + COOLDOWN_MS).toISOString() });
    setView("results");
  }

  function nextQuestion() { if (current + 1 >= quizQuestions.length) finishAssessment(); else { setCurrent((value) => value + 1); setSelectedAnswers([]); setFeedbackVisible(false); setFeedbackCorrect(false); } }

  async function openReview() {
    setReviewError("");
    if (isAdmin || !locked) return;
    try { const response = await fetch("/api/assessment/review", { cache: "no-store" }); const data = await response.json(); if (!response.ok) { setReviewError(data.error ?? "Review is no longer available."); return; } setServerReview(data.review ?? []); setView("review"); }
    catch { setReviewError("Unable to load the review right now."); }
  }

  function navButton(label: string, target: typeof view) { return <button onClick={() => setView(target)} className={`px-3 py-2 rounded-lg text-xs font-bold transition ${view === target ? "bg-red-600 text-white" : "text-gray-500 hover:text-white hover:bg-zinc-900"}`}>{label}</button>; }

  const stats = useMemo(() => latestScores ? ([
    ["Decision Making", latestScores.decisionMaking, "🧠"], ["Map Awareness", latestScores.mapAwareness, "🗺️"], ["Team IQ", latestScores.teamIQ, "🤝"], ["Objective IQ", latestScores.objectiveIQ, "🎯"], ["Gunfight IQ", latestScores.gunfightIQ, "⚡"], ["Adaptability", latestScores.adaptability, "🔄"],
  ] as const) : [], [latestScores]);

  return <main className="min-h-screen bg-[#050505] text-white"><div className="max-w-6xl mx-auto px-4 py-5 md:px-8">
    <header className="flex items-center justify-between border-b border-zinc-900 pb-5 mb-8"><button onClick={() => setView("home")} className="font-black text-xl tracking-tight">CALL OF DUTY <span className="text-red-600">ESPORTS RECRUITER</span></button>{profile && <nav className="flex gap-1 overflow-x-auto">{navButton("TEST", "home")}{navButton("PROFILE", "profile")}{navButton("TEAM", "team")}{navButton("CLIP IQ", "clip")}</nav>}</header>

    {profile && view === "home" && <section className="max-w-5xl mx-auto"><div className="mb-8"><p className="text-xs uppercase tracking-[0.2em] text-red-500 font-bold">PLAYER DASHBOARD</p><h1 className="text-4xl md:text-6xl font-black mt-2">{profile.name}</h1><p className="text-gray-500 mt-3">Build your competitive profile through scenario-based testing.</p></div>
      {statusMessage && <div className="mb-5 border border-red-500/30 bg-red-500/5 rounded-2xl p-5 text-sm text-red-300">{statusMessage}</div>}
      <div className="grid md:grid-cols-3 gap-4 mb-8"><div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6"><p className="text-xs text-gray-600 uppercase">Best Overall</p><p className="text-4xl font-black mt-2">{profile.bestOverall || "--"}</p></div><div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6"><p className="text-xs text-gray-600 uppercase">Best Recruit</p><p className="text-4xl font-black text-red-500 mt-2">{profile.bestRecruitScore || "--"}</p></div><div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6"><p className="text-xs text-gray-600 uppercase">Assessments</p><p className="text-4xl font-black mt-2">{profile.attempts.length}</p></div></div>
      {locked && <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl p-6 mb-5"><p className="text-xs uppercase tracking-[0.2em] text-yellow-500 font-bold">ASSESSMENT LOCKED</p><p className="text-2xl font-black mt-2">{formatRemaining(status?.nextAssessmentAt ?? null, now)}</p><p className="text-sm text-gray-500 mt-2">Use this time to review your last assessment and study the decision logic.</p>{reviewVisible && <button onClick={openReview} className="mt-5 bg-white text-black px-6 py-3 rounded-xl font-black">REVIEW LAST TEST</button>}</div>}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 md:p-10"><p className="text-red-500 text-xs font-bold tracking-[0.2em]">RANKED PLAYER TEST</p><h2 className="text-3xl md:text-4xl font-black mt-3">30 competitive scenarios.</h2><p className="text-gray-500 mt-4 leading-relaxed max-w-2xl">Every scenario provides the score, positioning, information, timing, and objective state needed to make a real competitive decision.</p><button onClick={startAssessment} disabled={locked} className="mt-7 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-gray-600 px-8 py-4 rounded-xl font-black">{locked ? "TEST LOCKED" : "START 30-SCENARIO TEST →"}</button>{isAdmin && <p className="text-xs text-red-500 mt-3 font-bold">ADMIN TESTING MODE — COOLDOWN BYPASSED</p>}</div>
    </section>}

    {profile && view === "assessment" && quizQuestions.length > 0 && <section className="max-w-3xl mx-auto"><div className="flex justify-between items-end mb-3"><div><p className="text-xs font-bold tracking-[0.2em] text-red-500">ASSESSMENT</p><p className="text-sm text-gray-600 mt-1">{profile.name}</p></div><p className="text-sm font-bold">{current + 1}<span className="text-gray-600"> / {quizQuestions.length}</span></p></div><div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-8"><div className="h-full bg-red-600" style={{ width: `${((current + 1) / quizQuestions.length) * 100}%` }} /></div><div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden"><div className="px-6 py-5 border-b border-zinc-800 flex justify-between"><span className="text-xs font-black tracking-[0.18em] text-red-500">{quizQuestions[current].mode}</span><span className="text-xs text-gray-700">Scenario {current + 1}</span></div><div className="p-6 md:p-9"><h2 className="text-2xl md:text-3xl font-bold leading-snug mb-7">{quizQuestions[current].situation}</h2><div className="space-y-3">{quizQuestions[current].answers.map((answer, index) => { const selected = selectedAnswers.includes(index); return <button key={answer.text} disabled={feedbackVisible} onClick={() => answerQuestion(index)} className={`group w-full text-left border rounded-2xl p-4 md:p-5 transition ${selected ? "border-red-500 bg-red-500/10" : "bg-[#080808] border-zinc-800 hover:border-red-500/60 hover:bg-zinc-900"}`}><div className="flex items-center gap-4"><span className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-black ${selected ? "bg-red-600 border-red-500 text-white" : "bg-zinc-900 border-zinc-800 text-gray-500 group-hover:text-red-500"}`}>{String.fromCharCode(65 + index)}</span><span className="text-sm md:text-base text-gray-300 group-hover:text-white leading-relaxed">{answer.text}</span>{selected && <span className="ml-auto text-red-500 font-black">✓</span>}</div></button>; })}</div>{feedbackVisible && <div className={`mt-5 rounded-2xl border p-6 ${feedbackCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}><p className={`font-black ${feedbackCorrect ? "text-green-400" : "text-red-400"}`}>{feedbackCorrect ? "YES — THAT'S CORRECT" : "NO — THAT'S NOT THE BEST PLAY"}</p>{!feedbackCorrect && <div className="mt-4"><p className="text-xs uppercase tracking-wider text-gray-600 font-bold mb-2">Best answer</p>{quizQuestions[current].answers.filter((answer) => answer.correct).map((answer) => <p key={answer.text} className="text-sm text-green-400 font-semibold">{answer.text}</p>)}</div>}<div className="mt-5"><p className="text-sm font-bold text-gray-300 mb-2">Why</p><p className="text-sm text-gray-500 leading-relaxed">{quizQuestions[current].explanation}</p></div><button onClick={nextQuestion} className="w-full mt-6 bg-white text-black hover:bg-gray-200 px-7 py-4 rounded-xl font-black">{current + 1 >= quizQuestions.length ? "VIEW RESULTS →" : "NEXT QUESTION →"}</button></div>}</div></div></section>}

    {profile && view === "results" && latestScores && <section className="max-w-5xl mx-auto pb-12"><div className="text-center mb-10"><p className="text-xs font-bold tracking-[0.25em] text-red-500 mb-4">ASSESSMENT COMPLETE</p><h1 className="text-5xl md:text-7xl font-black">PLAYER DNA</h1><p className="text-gray-600 mt-3">{profile.name} • Assessment #{profile.attempts.length}</p></div><div className="grid md:grid-cols-3 gap-4 mb-5"><div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 text-center"><p className="text-xs text-gray-600 uppercase">Overall IQ</p><p className="text-6xl font-black mt-3">{latestOverall}</p></div><div className="bg-zinc-950 border border-red-900/30 rounded-3xl p-7 text-center"><p className="text-xs text-gray-600 uppercase">Recruit Score</p><p className="text-6xl font-black text-red-500 mt-3">{latestRecruitScore}</p><p className="text-xs text-gray-600 mt-2">{getRecruitLabel(latestRecruitScore)}</p></div><div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 text-center"><p className="text-xs text-gray-600 uppercase">Archetype</p><p className="text-2xl font-black text-red-500 mt-5">{latestArchetype}</p></div></div><div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">{stats.map(([name, value, icon]) => <div key={name} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"><div className="flex justify-between"><span>{icon}</span><span className={`text-2xl font-black ${scoreColor(value)}`}>{value}</span></div><p className="text-sm text-gray-400 mt-3">{name}</p><div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-3"><div className="h-full bg-red-600" style={{ width: `${value}%` }} /></div></div>)}</div>{!isAdmin && <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl p-6 mb-5"><p className="text-xs uppercase tracking-[0.2em] text-yellow-500 font-bold">3-DAY REVIEW WINDOW</p><p className="text-2xl font-black mt-2">{formatRemaining(status?.nextAssessmentAt ?? null, now)}</p><p className="text-sm text-gray-500 mt-2">Your next assessment will use a fresh randomized order.</p>{reviewVisible && <button onClick={openReview} className="mt-5 bg-white text-black px-6 py-3 rounded-xl font-black">REVIEW TEST</button>}</div>}<div className="flex gap-3"><button onClick={startAssessment} disabled={locked} className="flex-1 bg-red-600 disabled:bg-zinc-800 disabled:text-gray-600 px-7 py-4 rounded-xl font-black">{locked ? "TEST LOCKED" : "RETAKE ASSESSMENT"}</button><button onClick={() => setView("profile")} className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-7 py-4 rounded-xl font-black">VIEW PROFILE</button></div></section>}

    {profile && view === "review" && <section className="max-w-4xl mx-auto pb-12"><div className="mb-8"><p className="text-xs font-bold tracking-[0.2em] text-red-500">STUDY REVIEW</p><h1 className="text-5xl md:text-6xl font-black mt-2">LAST ASSESSMENT</h1><p className="text-gray-600 mt-3">Review your answer, the best answer, and the reasoning while the three-day lock is active.</p></div>{reviewError ? <div className="bg-zinc-950 border border-red-500/30 rounded-2xl p-7 text-red-300">{reviewError}</div> : <div className="space-y-5">{serverReview.map((item, index) => <div key={`${item.situation}-${index}`} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8"><div className="flex justify-between mb-4"><span className="text-xs font-black tracking-[0.18em] text-red-500">{item.mode}</span><span className="text-xs text-gray-600">Question {index + 1}</span></div><h2 className="text-xl md:text-2xl font-bold leading-snug">{item.situation}</h2><div className="space-y-3 mt-6">{item.answers.map((answer, answerIndex) => <div key={answer.text} className={`border rounded-xl p-4 ${answer.correct ? "border-green-500/30 bg-green-500/5" : answerIndex === item.selectedIndex ? "border-red-500/30 bg-red-500/5" : "border-zinc-800"}`}><div className="flex gap-3"><span className="font-black text-gray-600">{String.fromCharCode(65 + answerIndex)}</span><span className="text-sm text-gray-300">{answer.text}</span></div>{answer.correct && <p className="text-xs text-green-400 font-bold mt-2">BEST ANSWER</p>}{answerIndex === item.selectedIndex && <p className="text-xs text-red-400 font-bold mt-2">YOUR ANSWER</p>}</div>)}</div><div className="mt-6 pt-5 border-t border-zinc-800"><p className="text-xs uppercase tracking-wider text-gray-600 font-bold">Why</p><p className="text-sm text-gray-400 leading-relaxed mt-2">{item.explanation}</p></div></div>)}</div>}</section>}

    {profile && view === "profile" && <section className="max-w-5xl mx-auto"><div className="mb-8"><p className="text-xs font-bold tracking-[0.2em] text-red-500">PLAYER PROFILE</p><h1 className="text-5xl md:text-6xl font-black mt-2">{profile.name}</h1><p className="text-gray-600 mt-2">Competitive DNA • {profile.attempts.length} assessments</p></div>{profile.attempts.length === 0 ? <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center text-gray-500">Complete your first assessment to build your profile.</div> : <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"><div className="p-6 border-b border-zinc-800"><h2 className="font-black text-xl">Assessment History</h2></div><div className="divide-y divide-zinc-900">{[...profile.attempts].reverse().map((attempt, index) => <div key={`${attempt.date}-${index}`} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><p className="font-bold">Assessment #{profile.attempts.length - index}</p><p className="text-xs text-gray-600 mt-1">{new Date(attempt.date).toLocaleDateString()}</p></div><div className="flex items-center gap-5"><div><p className="text-[10px] text-gray-600 uppercase">Overall</p><p className="font-black">{attempt.overall}</p></div><div><p className="text-[10px] text-gray-600 uppercase">Recruit</p><p className="font-black text-red-500">{attempt.recruitScore}</p></div><div className="hidden sm:block"><p className="text-[10px] text-gray-600 uppercase">Archetype</p><p className="text-xs font-bold">{attempt.archetype}</p></div></div></div>)}</div></div>}</section>}

    {profile && view === "team" && <section className="max-w-5xl mx-auto"><div className="mb-8"><p className="text-xs font-bold tracking-[0.2em] text-red-500">TEAM LAB</p><h1 className="text-5xl md:text-6xl font-black mt-2">ROSTER VIEW</h1></div><div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-gray-500">Team and recruiting tools will be built here next.</div></section>}
    {profile && view === "clip" && <section className="max-w-4xl mx-auto"><div className="mb-8"><p className="text-xs font-bold tracking-[0.2em] text-red-500">CLIP IQ</p><h1 className="text-5xl md:text-6xl font-black mt-2">GAMEPLAY REVIEW</h1></div><div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 text-center text-gray-500">Gameplay clip review tools will be built here next.</div></section>}
  </div></main>;
}
