import { useState } from "react";
import WheelChart, { FLOOR } from "./WheelChart";

const WHEEL_DOMAINS = [
  "Mission", "Money", "Body", "Spirit", "Home & Environment",
  "Growth", "Romance", "Family & Friends", "Fun", "Communities"
];

const OUTCOME_SECTIONS = [
  { key: "result", label: "Result", prompt: "What is the specific outcome? Write it as already done, present tense, emotionally charged.", placeholder: "I am... I have... I feel..." },
  { key: "purpose", label: "Purpose", prompt: "Why does this have to happen? What does it mean for your life, your freedom, your identity?", placeholder: "This matters because..." },
  { key: "map", label: "Massive Action Plan", prompt: "What are the 3 to 5 actions that will make this outcome inevitable?", placeholder: "The actions that move the needle..." },
  { key: "obstacles", label: "Obstacles", prompt: "What are the 2 to 3 things most likely to derail this? Name them now so they don't catch you off guard.", placeholder: "The things that will try to stop me..." },
  { key: "identity", label: "Identity", prompt: "Who do you need to become for this to be inevitable? Not what you need to do. Who you need to be.", placeholder: "I am someone who..." },
];

type QuarterlyItem = {
  number: string;
  label: string;
  type: "ritual" | "text" | "multi" | "wheel" | "cost" | "outcomes" | "declaration";
  question?: string;
  instruction?: string;
  placeholder?: string;
  questions?: string[];
};

// Scores below this leave a domain "in the red" for the quarterly cost question.
const COST_THRESHOLD = 6;

const QUARTERLY_PARTS: Array<{ part: string; title: string; time: string; items: QuarterlyItem[] }> = [
  {
    part: "Part 01",
    title: "Enter the State",
    time: "15–20 min",
    items: [
      {
        number: "01",
        label: "Pre-Session Ritual",
        type: "ritual",
        question: "Movement, music, something physical that shifts your state before you sit down. This happens before you open the app.",
      },
      {
        number: "02",
        label: "Evidence Review",
        type: "ritual",
        question: "Before you write anything, go through your last 90 days of photos, stories, calendar, and messages. Let the evidence remind you what actually happened. You lived more than you remember.",
      },
      {
        number: "03",
        label: "Gratitude Flood",
        type: "text",
        question: "Now that you've seen it — what are you genuinely proud of? What moments, wins, connections, growth?",
        instruction: "Go wide. Nothing is too small. The goal is to feel the evidence of your own momentum before you assess anything.",
        placeholder: "I'm proud of...",
      },
      {
        number: "04",
        label: "Acknowledgement",
        type: "text",
        question: "What did you do this quarter that was hard? What did it cost you, and what did it take to push through?",
        placeholder: "What was hard, what it cost, what it took...",
      },
    ],
  },
  {
    part: "Part 02",
    title: "Honest Look Back",
    time: "20 min",
    items: [
      {
        number: "05",
        label: "Last Quarter Scorecard",
        type: "multi",
        questions: [
          "What were your 3 outcomes?",
          "Did you hit them?",
          "What worked, what didn't, what surprised you?",
        ],
      },
      {
        number: "06",
        label: "Wheel of Life",
        type: "wheel",
        instruction: "Full honest score across all 10 domains. First number, no overthinking.",
      },
      {
        number: "07",
        label: "The Cost Question",
        type: "cost",
        question: "For each domain below 6: what has staying here cost you? And what will another 90 days at this level cost you?",
      },
      {
        number: "08",
        label: "The Real Question",
        type: "text",
        question: "Looking at this honestly, where are you lying to yourself?",
        placeholder: "The truth I've been avoiding...",
      },
    ],
  },
  {
    part: "Part 03",
    title: "Pull Forward",
    time: "20 min",
    items: [
      {
        number: "09",
        label: "The 1-Year Vision",
        type: "text",
        question: "If the next 12 months go exactly as you want, what is true?",
        instruction: "Be specific. Supercycle, Sabroso, body, relationships, experiences, who you've become. Write it as already done, present tense, emotionally charged.",
        placeholder: "A year from now, it's true that...",
      },
      {
        number: "10",
        label: "The 90-Day Slice",
        type: "text",
        question: "Of that 1-year vision, what portion is achievable and right to pursue in the next 90 days? What does winning this quarter look like, specifically?",
        placeholder: "Winning this quarter looks like...",
      },
      {
        number: "11",
        label: "The Feeling Question",
        type: "text",
        question: "When this quarter is done and you've hit your outcomes, how do you feel? What are you saying to yourself?",
        instruction: "Name it. This is your emotional target, not just your logical one.",
        placeholder: "I feel... I'm saying to myself...",
      },
    ],
  },
  {
    part: "Part 04",
    title: "Define the 3",
    time: "25 min",
    items: [
      {
        number: "12",
        label: "Identify the Right 3",
        type: "text",
        question: "Using the cost analysis and the vision, what are the 3 outcomes that matter most this quarter?",
        instruction: "Not the most urgent. The highest leverage. The ones that make you feel something.",
        placeholder: "The 3 that matter most...",
      },
      {
        number: "13",
        label: "Your 3 Outcomes",
        type: "outcomes",
        instruction: "For each of your 3 focus areas, answer all 5 questions. Write in present tense, as if it has already happened.",
      },
      {
        number: "14",
        label: "The Constraint Question",
        type: "text",
        question: "What is the single biggest thing standing between you and all 3 of these? If you removed it, how much faster does everything move?",
        placeholder: "The one constraint that's holding everything back...",
      },
    ],
  },
  {
    part: "Part 05",
    title: "Commitment",
    time: "15 min",
    items: [
      {
        number: "15",
        label: "What You Will Give Up",
        type: "text",
        question: "What behaviour, habit, or pattern has to stop for these 3 to happen?",
        placeholder: "I'm giving up...",
      },
      {
        number: "16",
        label: "What You Will Protect",
        type: "text",
        question: "What non-negotiables stay in place regardless of how busy it gets?",
        instruction: "For you: training, dance, connection, sleep.",
        placeholder: "I protect, no matter what...",
      },
      {
        number: "17",
        label: "The Cost of Not Doing This",
        type: "text",
        question: "Be specific. A year from now, if you didn't pursue these 3, what does that life look like? Feel like?",
        placeholder: "If I don't pursue these, a year from now...",
      },
      {
        number: "18",
        label: "Closing Declaration",
        type: "declaration",
        question: "One sentence per outcome, spoken out loud. Present tense. Full intensity.",
      },
    ],
  },
];

type WeeklyItem = {
  number: string;
  label: string;
  type: "ritual" | "text" | "multi" | "wheel" | "big3";
  question?: string;
  instruction?: string;
  placeholder?: string;
  fieldSm?: boolean;
  questions?: string[];
};

const WEEKLY_PHASES: Array<{ phase: string; title: string; time: string; items: WeeklyItem[] }> = [
  {
    phase: "Phase 01",
    title: "Review",
    time: "20 min",
    items: [
      {
        number: "01",
        label: "Opening Ritual",
        type: "ritual",
        question: "Read your 3 quarterly outcomes out loud. Full intensity. Own them.",
      },
      {
        number: "02",
        label: "Weekly Scorecard",
        type: "multi",
        questions: [
          "Did I move the needle on each of my 3 this week?",
          "What got in the way?",
          "What would I do differently?",
        ],
      },
      {
        number: "03",
        label: "Honest Reflection",
        type: "multi",
        questions: [
          "What went well this week?",
          "What could be improved?",
          "What did I learn, and how will I use it next week?",
        ],
      },
      {
        number: "04",
        label: "Wheel of Life Pulse",
        type: "wheel",
        instruction: "Quick 1-10 on each domain. First number, no overthinking.",
        questions: [
          "Which domains are below floor? (below 5 and declining)",
          "Is anything low enough to cost me focus or energy next week?",
        ],
      },
    ],
  },
  {
    phase: "Phase 02",
    title: "Design",
    time: "30 min",
    items: [
      {
        number: "05",
        label: "The Year-Forward Question",
        type: "text",
        question: "A year from now, what would I wish I had done this week?",
        instruction: "Answer this before touching anything else. It cuts through noise.",
        placeholder: "A year from now, I'll be glad I...",
      },
      {
        number: "06",
        label: "Weekly Big 3",
        type: "big3",
        question: "Three moves, one per quarterly outcome.",
        instruction: "Each one must be specific, completable, and scheduled before this session ends. Vague intentions don't count.",
      },
      {
        number: "07",
        label: "Floor Maintenance",
        type: "text",
        question: "Based on the Wheel pulse, what one or two things need a minimum viable action this week?",
        instruction: "Not growth. Just enough to stay stable and protect your energy.",
        placeholder: "The minimum viable actions that keep me stable...",
      },
      {
        number: "08",
        label: "Energy and Joy Plan",
        type: "text",
        question: "What will fill my tank this week? (movement, people, music, dancing, something new)",
        instruction: "This is not optional. Name it specifically. When is it happening?",
        placeholder: "What fills my tank, and exactly when it happens...",
      },
      {
        number: "09",
        label: "One Thing to Look Forward To",
        type: "text",
        question: "Something concrete in the next 7 days that genuinely excites you.",
        instruction: "If it doesn't exist yet, create it now. Text someone, book something, plan it before closing this session.",
        placeholder: "I'm looking forward to...",
      },
      {
        number: "10",
        label: "Closing Intention",
        type: "text",
        question: "One sentence. Sunday night, looking back: what would make this a week worth living?",
        placeholder: "This was a week worth living because...",
        fieldSm: true,
      },
    ],
  },
];

const DAILY_MORNING = [
  { icon: "◎", title: "Daily Big 3", prompt: "From your Weekly Big 3, what are the 3 tasks that move the needle today?", instruction: "Write them first. Do them first. Everything else is secondary.", fields: ["Big 3 #1", "Big 3 #2", "Big 3 #3"] },
  { icon: "◈", title: "Block the Time", prompt: "When exactly will you do each of your Big 3 today?", instruction: "Unscheduled intentions don't happen. Assign a time slot to each one.", fields: ["Big 3 #1 — time block", "Big 3 #2 — time block", "Big 3 #3 — time block"] },
];

const DAILY_EVENING = [
  { icon: "◉", title: "One Win", prompt: "What are you most proud of today?", instruction: "One sentence. No more.", placeholder: "Today I..." },
  { icon: "◌", title: "One Adjustment", prompt: "What would you do differently tomorrow?", instruction: "One thing only. Then close the book.", placeholder: "Tomorrow I will..." },
];

export default function PlanningSystem() {
  const [tab, setTab] = useState("quarterly");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [quarterlyAnswers, setQuarterlyAnswers] = useState<Record<string, string>>({});
  const [quarterlyRituals, setQuarterlyRituals] = useState<Record<string, boolean>>({});
  const [costAnswers, setCostAnswers] = useState<Record<string, string>>({});
  const [outcomes, setOutcomes] = useState<Array<Record<string, string>>>([
    { label: "", result: "", purpose: "", map: "", obstacles: "", identity: "" },
    { label: "", result: "", purpose: "", map: "", obstacles: "", identity: "" },
    { label: "", result: "", purpose: "", map: "", obstacles: "", identity: "" },
  ]);
  const [activeOutcome, setActiveOutcome] = useState(0);
  const [activeSubSection, setActiveSubSection] = useState("result");
  const [weeklyAnswers, setWeeklyAnswers] = useState<Record<string, string>>({});
  const [weeklyScores, setWeeklyScores] = useState<Record<string, number>>({});
  const [weeklyBig3, setWeeklyBig3] = useState(["", "", ""]);
  const [ritualDone, setRitualDone] = useState(false);
  const [dailyMorning, setDailyMorning] = useState<Record<string, string>>({ b1: "", b2: "", b3: "", t1: "", t2: "", t3: "" });
  const [dailyEvening, setDailyEvening] = useState({ win: "", adjust: "" });
  const [dateValue, setDateValue] = useState("");

  const updateOutcome = (idx: number, field: string, value: string) => {
    setOutcomes((prev) => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400;500&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #1A1714;
          --ink-mid: #2E2A26;
          --ink-light: #4A4540;
          --ink-muted: #7A7268;
          --ink-faint: #A8A298;
          --gold: #9A6E2A;
          --gold-bg: #FDF6E8;
          --ivory: #F7F3EC;
          --white: #FFFFFF;
          --border: #DDD6CA;
          --border-light: #EDE8DF;
        }

        .app { max-width: 820px; margin: 0 auto; padding: 48px 32px 80px; }

        .hd { margin-bottom: 40px; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
        .hd-eyebrow { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
        .hd-title { font-family: 'Playfair Display', serif; font-size: clamp(26px, 5vw, 44px); font-weight: 300; color: var(--ink); line-height: 1.15; }
        .hd-title em { font-style: italic; color: var(--gold); }
        .hd-sub { font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 300; font-style: normal; color: var(--ink-muted); margin-top: 8px; }

        .tab-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 12px; }
        .main-tabs { display: flex; gap: 2px; background: #EDE8DF; padding: 4px; border-radius: 8px; }
        .main-tab { background: none; border: none; padding: 10px 22px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-faint); cursor: pointer; border-radius: 5px; transition: all 0.2s; }
        .main-tab.on { background: var(--white); color: var(--ink); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }

        .print-btn { border: 1px solid var(--border); background: var(--white); border-radius: 4px; padding: 8px 16px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-muted); cursor: pointer; transition: all 0.15s; }
        .print-btn:hover { border-color: var(--gold); color: var(--gold); }

        /* DATE ROW */
        .date-row { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .date-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); flex-shrink: 0; }
        .date-input { border: none; border-bottom: 1px solid var(--border); background: none; font-family: 'Lato', sans-serif; font-size: 16px; color: var(--ink); padding: 4px 0; outline: none; min-width: 160px; }
        .date-input:focus { border-bottom-color: var(--gold); }

        /* CARD */
        .card { background: var(--white); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .card-header { padding: 20px 24px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 14px; }
        .card-num { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--gold); letter-spacing: 1px; flex-shrink: 0; width: 24px; }
        .card-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-muted); flex: 1; }
        .card-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: var(--ink); }
        .card-body { padding: 24px; }

        .instruction { font-family: 'Lato', sans-serif; font-size: 14px; font-style: normal; color: var(--ink-muted); margin-bottom: 20px; line-height: 1.6; }

        /* WHEEL */
        .wheel-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .wheel-item { display: flex; flex-direction: column; gap: 8px; }
        .wheel-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-light); }
        .wheel-score-row { display: flex; gap: 4px; flex-wrap: nowrap; }
        .score-btn { width: 32px; height: 32px; flex: 1; min-width: 0; border: 1px solid var(--border); background: var(--ivory); border-radius: 3px; font-family: 'DM Mono', monospace; font-size: 10px; color: var(--ink-muted); cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
        .score-btn.selected { background: var(--ink); border-color: var(--ink); color: var(--white); }
        .score-btn:hover:not(.selected) { border-color: var(--gold); color: var(--gold); }

        /* SPIDER CHART */
        .wheel-chart-wrap { margin-bottom: 8px; }
        .wheel-chart-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .wheel-chart-hint { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-faint); }
        .wheel-chart-avg { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-muted); white-space: nowrap; }
        .wheel-chart-avg strong { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: var(--gold); margin-left: 4px; }
        .wheel-chart-svg { display: block; width: 100%; height: auto; touch-action: none; -webkit-tap-highlight-color: transparent; }
        .wheel-chart-svg text { transition: fill 0.15s; }

        /* MANUAL SCORE FALLBACK */
        .wheel-precise { margin-top: 20px; border-top: 1px solid var(--border-light); padding-top: 16px; }
        .wheel-precise > summary { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-faint); cursor: pointer; list-style: none; margin-bottom: 16px; transition: color 0.15s; }
        .wheel-precise > summary::-webkit-details-marker { display: none; }
        .wheel-precise > summary::before { content: '＋ '; color: var(--gold); }
        .wheel-precise[open] > summary::before { content: '－ '; }
        .wheel-precise > summary:hover { color: var(--gold); }

        /* QUESTIONS */
        .question-block { display: flex; flex-direction: column; gap: 16px; }
        .q-item { display: flex; flex-direction: column; gap: 8px; }
        .q-prompt { font-family: 'Lato', sans-serif; font-size: 15px; font-style: normal; color: var(--ink-mid); line-height: 1.5; }
        .field { width: 100%; border: 1px solid var(--border); background: var(--ivory); border-radius: 4px; padding: 12px 14px; font-family: 'Lato', sans-serif; font-size: 14px; color: var(--ink); resize: vertical; min-height: 72px; line-height: 1.6; outline: none; transition: border-color 0.15s, background 0.15s; }
        .field:focus { border-color: var(--gold); background: var(--white); }
        .field::placeholder { color: var(--ink-faint); font-style: italic; }
        .field-sm { min-height: 44px; resize: none; }

        /* STEP NAV */
        .step-nav { display: flex; gap: 6px; margin-bottom: 24px; flex-wrap: wrap; }
        .step-btn { border: 1px solid var(--border); background: var(--white); border-radius: 4px; padding: 7px 14px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-faint); cursor: pointer; transition: all 0.15s; }
        .step-btn.on { background: var(--ink); border-color: var(--ink); color: var(--white); }
        .step-btn:hover:not(.on) { border-color: var(--gold); color: var(--gold); }

        /* SECTION SHOW/HIDE */
        .q-section { display: none; }
        .q-section.active { display: block; }
        .outcome-block { display: none; }
        .outcome-block.active { display: block; }
        .subsection-block { display: none; }
        .subsection-block.active { display: block; }

        /* OUTCOME TABS */
        .outcome-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .outcome-tab { border: 1px solid var(--border); background: var(--white); border-radius: 4px; padding: 8px 14px; cursor: pointer; transition: all 0.15s; }
        .outcome-tab.on { background: var(--ink); border-color: var(--ink); }
        .outcome-tab-n { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--ink-faint); display: block; margin-bottom: 2px; }
        .outcome-tab.on .outcome-tab-n { color: #8A8278; }
        .outcome-tab-name { font-family: 'Lato', sans-serif; font-size: 13px; color: var(--ink); display: block; }
        .outcome-tab.on .outcome-tab-name { color: var(--white); }
        .outcome-label-input { width: 100%; border: none; border-bottom: 1px solid var(--border); background: none; font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; color: var(--ink); padding: 0 0 8px 0; margin-bottom: 20px; outline: none; }
        .outcome-label-input::placeholder { color: var(--ink-faint); }
        .outcome-title-print { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: var(--ink); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); display: none; }

        .sub-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 20px; flex-wrap: wrap; }
        .sub-tab { background: none; border: none; padding: 8px 14px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-faint); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; }
        .sub-tab.on { color: var(--gold); border-bottom-color: var(--gold); }
        .sub-prompt { font-family: 'Lato', sans-serif; font-size: 14px; font-style: normal; color: var(--ink-light); margin-bottom: 12px; line-height: 1.6; padding: 10px 14px; background: var(--gold-bg); border-left: 2px solid var(--gold); border-radius: 0 4px 4px 0; }

        /* RITUAL */
        .ritual-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .ritual-text { font-family: 'Lato', sans-serif; font-size: 15px; font-style: normal; color: var(--ink-light); flex: 1; }
        .ritual-btn { border: 1px solid var(--ink); background: var(--ink); color: var(--white); border-radius: 4px; padding: 9px 18px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .ritual-btn.done { background: #2A6E5A; border-color: #2A6E5A; }

        /* BIG 3 */
        .big3-wrap { display: flex; flex-direction: column; gap: 10px; }
        .big3-row { display: flex; align-items: center; gap: 12px; background: var(--ivory); border: 1px solid var(--border); border-radius: 4px; padding: 10px 14px; transition: border-color 0.15s; }
        .big3-row:focus-within { border-color: var(--gold); }
        .big3-n { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--gold); flex-shrink: 0; }
        .big3-input { border: none; background: none; font-family: 'Lato', sans-serif; font-size: 15px; color: var(--ink); flex: 1; outline: none; }
        .big3-input::placeholder { color: var(--ink-faint); font-style: italic; }

        /* PHASE HEADER (WEEKLY) */
        .phase-header { display: flex; align-items: baseline; gap: 14px; margin-top: 36px; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .phase-header:first-of-type { margin-top: 0; }
        .phase-eyebrow { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); }
        .phase-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; color: var(--ink); flex: 1; }
        .phase-time { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-faint); }

        /* SECONDARY NOTE UNDER A PROMPT */
        .q-note { font-family: 'Lato', sans-serif; font-size: 13px; font-style: italic; color: var(--ink-muted); line-height: 1.5; margin-bottom: 10px; }

        /* AUTO-DETECTED BELOW-FLOOR DOMAINS */
        .floor-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .floor-chip { display: inline-flex; align-items: center; gap: 7px; background: #FBEEEA; border: 1px solid #E3BFB4; border-radius: 999px; padding: 5px 12px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #B0492F; }
        .floor-chip strong { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; }
        .floor-ok { font-family: 'Lato', sans-serif; font-size: 14px; color: #2A6E5A; margin-bottom: 12px; }
        .floor-empty { font-family: 'Lato', sans-serif; font-size: 13px; font-style: italic; color: var(--ink-faint); margin-bottom: 12px; }

        /* DAILY */
        .daily-section-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; margin-top: 28px; padding-top: 28px; border-top: 1px solid var(--border-light); }
        .daily-section-label:first-of-type { margin-top: 0; border-top: none; padding-top: 0; }
        .daily-block { background: var(--white); border: 1px solid var(--border); border-radius: 6px; padding: 20px 22px; margin-bottom: 12px; }
        .daily-top { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .daily-icon { font-size: 18px; color: var(--gold); }
        .daily-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: var(--ink); }
        .daily-prompt { font-family: 'Lato', sans-serif; font-size: 14px; font-style: normal; color: var(--ink-light); margin-bottom: 6px; line-height: 1.5; }
        .daily-instruction { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1px; color: var(--ink-faint); margin-bottom: 14px; text-transform: uppercase; }

        /* PRINT */
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .app { padding: 20px !important; }

          /* show all sections */
          .q-section { display: block !important; break-inside: avoid; margin-bottom: 24px; }
          .outcome-block { display: block !important; margin-bottom: 20px; break-inside: avoid; }
          .subsection-block { display: block !important; margin-bottom: 12px; }
          .outcome-title-print { display: block !important; }

          /* hide screen-only nav */
          .step-nav { display: none !important; }
          .outcome-tabs { display: none !important; }
          .sub-tabs { display: none !important; }
          .ritual-btn { display: none !important; }

          .card { box-shadow: none !important; border: 1px solid #ccc !important; break-inside: avoid; }
          .field { border: 1px solid #ccc !important; background: white !important; }
          .big3-row { border: 1px solid #ccc !important; background: white !important; }
          .daily-block { border: 1px solid #ccc !important; }
          .score-btn.selected { background: #1A1714 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sub-prompt { background: #FFF8EC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        @media (max-width: 600px) {
          .app { padding: 24px 16px 60px; }
          .main-tabs { width: 100%; }
          .main-tab { flex: 1; text-align: center; padding: 10px 8px; }
        }
      `}</style>

      <div className="app">
        <div className="hd no-print">
          <p className="hd-eyebrow">Personal Planning System</p>
          <h1 className="hd-title">The Questions &amp; <em>Exercises</em></h1>
          <p className="hd-sub">Quarterly outcomes. Weekly review. Daily execution.</p>
        </div>

        <div className="tab-bar no-print">
          <div className="main-tabs">
            {[{ id: "quarterly", label: "Quarterly" }, { id: "weekly", label: "Weekly" }, { id: "daily", label: "Daily" }].map((t) => (
              <button key={t.id} className={`main-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <button className="print-btn" onClick={() => window.print()}>
            ⎙ Print {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        </div>

        {/* DATE ROW */}
        <div className="date-row">
          <span className="date-label">Date</span>
          <input
            type="text"
            className="date-input"
            placeholder="dd / mm / yyyy"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
          />
        </div>

        {/* QUARTERLY */}
        {tab === "quarterly" && (
          <div>
            {QUARTERLY_PARTS.map((part) => (
              <div key={part.part}>
                <div className="phase-header">
                  <span className="phase-eyebrow">{part.part}</span>
                  <span className="phase-title">{part.title}</span>
                  <span className="phase-time">{part.time}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
                  {part.items.map((item) => (
                    <div className="card" key={item.number}>
                      <div className="card-header">
                        <span className="card-num">{item.number}</span>
                        <span className="card-label">{item.label}</span>
                      </div>
                      <div className="card-body">
                        {item.type === "ritual" && (
                          <div className="ritual-row">
                            <p className="ritual-text">{item.question}</p>
                            <button className={`ritual-btn no-print ${quarterlyRituals[item.number] ? "done" : ""}`} onClick={() => setQuarterlyRituals((prev) => ({ ...prev, [item.number]: !prev[item.number] }))}>
                              {quarterlyRituals[item.number] ? "✓ Done" : "Mark done"}
                            </button>
                          </div>
                        )}

                        {item.type === "text" && (
                          <>
                            <p className="q-prompt" style={{ marginBottom: item.instruction ? 4 : 10 }}>{item.question}</p>
                            {item.instruction && <p className="q-note">{item.instruction}</p>}
                            <textarea className="field" placeholder={item.placeholder} value={quarterlyAnswers[item.number] || ""} onChange={(e) => setQuarterlyAnswers((prev) => ({ ...prev, [item.number]: e.target.value }))} />
                          </>
                        )}

                        {item.type === "multi" && (
                          <div className="question-block">
                            {item.questions!.map((q, qi) => (
                              <div className="q-item" key={qi}>
                                <p className="q-prompt">{q}</p>
                                <textarea className="field field-sm" placeholder="Write your answer..." value={quarterlyAnswers[`${item.number}-${qi}`] || ""} onChange={(e) => setQuarterlyAnswers((prev) => ({ ...prev, [`${item.number}-${qi}`]: e.target.value }))} />
                              </div>
                            ))}
                          </div>
                        )}

                        {item.type === "wheel" && (
                          <>
                            <p className="instruction">{item.instruction}</p>
                            <WheelChart
                              domains={WHEEL_DOMAINS}
                              scores={scores}
                              onChange={(domain, value) => setScores((prev) => ({ ...prev, [domain]: value }))}
                            />
                            <details className="wheel-precise no-print">
                              <summary>Or set scores manually</summary>
                              <div className="wheel-grid">
                                {WHEEL_DOMAINS.map((domain) => (
                                  <div className="wheel-item" key={domain}>
                                    <span className="wheel-label">{domain}</span>
                                    <div className="wheel-score-row">
                                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                                        <button key={n} className={`score-btn ${scores[domain] === n ? "selected" : ""}`} onClick={() => setScores((prev) => ({ ...prev, [domain]: n }))}>{n}</button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </>
                        )}

                        {item.type === "cost" && (() => {
                          const anyScored = WHEEL_DOMAINS.some((d) => scores[d]);
                          const inRed = WHEEL_DOMAINS.filter((d) => scores[d] && scores[d] < COST_THRESHOLD);
                          return (
                            <>
                              <p className="q-prompt" style={{ marginBottom: 12 }}>{item.question}</p>
                              {!anyScored ? (
                                <p className="floor-empty">Score the Wheel of Life above — domains under {COST_THRESHOLD} will appear here automatically.</p>
                              ) : inRed.length === 0 ? (
                                <p className="floor-ok">✓ No domain is below {COST_THRESHOLD}. Nothing in the red this quarter.</p>
                              ) : (
                                <div className="question-block">
                                  {inRed
                                    .sort((a, b) => scores[a] - scores[b])
                                    .map((d) => (
                                      <div className="q-item" key={d}>
                                        <p className="q-prompt cost-domain">
                                          <span className="floor-chip">{d} <strong>{scores[d]}</strong></span>
                                        </p>
                                        <textarea className="field field-sm" placeholder="What has staying here cost you — and what will another 90 days at this level cost?" value={costAnswers[d] || ""} onChange={(e) => setCostAnswers((prev) => ({ ...prev, [d]: e.target.value }))} />
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {item.type === "outcomes" && (
                          <>
                            {item.instruction && (
                              <p className="instruction no-print" style={{ fontStyle: "italic" }}>{item.instruction}</p>
                            )}

                            <div className="outcome-tabs no-print">
                              {outcomes.map((o, i) => (
                                <div key={i} className={`outcome-tab ${activeOutcome === i ? "on" : ""}`} onClick={() => { setActiveOutcome(i); setActiveSubSection("result"); }}>
                                  <span className="outcome-tab-n">0{i + 1}</span>
                                  <span className="outcome-tab-name">{o.label || `Outcome ${i + 1}`}</span>
                                </div>
                              ))}
                            </div>

                            {outcomes.map((o: Record<string, string>, oi: number) => (
                              <div key={oi} className={`outcome-block ${activeOutcome === oi ? "active" : ""}`}>
                                <div className="outcome-title-print">0{oi + 1} — {o.label || `Outcome ${oi + 1}`}</div>

                                <input className={`outcome-label-input ${activeOutcome === oi ? "" : "no-print"}`} placeholder="Name this outcome area (e.g. Money, Body, Sabroso...)" value={(o.label ?? "") as string} onChange={(e) => updateOutcome(oi, "label", e.target.value)} />

                                <div className="sub-tabs no-print">
                                  {OUTCOME_SECTIONS.map((s) => (
                                    <button key={s.key} className={`sub-tab ${activeSubSection === s.key ? "on" : ""}`} onClick={() => setActiveSubSection(s.key)}>{s.label}</button>
                                  ))}
                                </div>

                                {OUTCOME_SECTIONS.map((s) => (
                                  <div key={s.key} className={`subsection-block ${activeSubSection === s.key ? "active" : ""}`}>
                                    <p className="sub-prompt">{s.prompt}</p>
                                    <textarea className="field" style={{ minHeight: 80 }} placeholder={s.placeholder} value={(o[s.key] ?? "") as string} onChange={(e) => updateOutcome(oi, s.key, e.target.value)} />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </>
                        )}

                        {item.type === "declaration" && (
                          <>
                            <p className="q-prompt" style={{ marginBottom: 12 }}>{item.question}</p>
                            <div className="big3-wrap">
                              {[0, 1, 2].map((j) => (
                                <div className="big3-row" key={j}>
                                  <span className="big3-n">0{j + 1}</span>
                                  <input className="big3-input" placeholder={outcomes[j]?.label ? `${outcomes[j].label} — declared in present tense...` : `Outcome ${j + 1} — declared in present tense...`} value={quarterlyAnswers[`${item.number}-${j}`] || ""} onChange={(e) => setQuarterlyAnswers((prev) => ({ ...prev, [`${item.number}-${j}`]: e.target.value }))} />
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WEEKLY */}
        {tab === "weekly" && (
          <div>
            {WEEKLY_PHASES.map((phase) => (
              <div key={phase.phase}>
                <div className="phase-header">
                  <span className="phase-eyebrow">{phase.phase}</span>
                  <span className="phase-title">{phase.title}</span>
                  <span className="phase-time">{phase.time}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
                  {phase.items.map((item) => (
                    <div className="card" key={item.number}>
                      <div className="card-header">
                        <span className="card-num">{item.number}</span>
                        <span className="card-label">{item.label}</span>
                      </div>
                      <div className="card-body">
                        {item.type === "ritual" && (
                          <div className="ritual-row">
                            <p className="ritual-text">{item.question}</p>
                            <button className={`ritual-btn no-print ${ritualDone ? "done" : ""}`} onClick={() => setRitualDone(!ritualDone)}>
                              {ritualDone ? "✓ Done" : "Mark done"}
                            </button>
                          </div>
                        )}

                        {item.type === "text" && (
                          <>
                            <p className="q-prompt" style={{ marginBottom: item.instruction ? 4 : 10 }}>{item.question}</p>
                            {item.instruction && <p className="q-note">{item.instruction}</p>}
                            <textarea className={`field ${item.fieldSm ? "field-sm" : ""}`} placeholder={item.placeholder} value={weeklyAnswers[item.number] || ""} onChange={(e) => setWeeklyAnswers((prev) => ({ ...prev, [item.number]: e.target.value }))} />
                          </>
                        )}

                        {item.type === "multi" && (
                          <div className="question-block">
                            {item.questions!.map((q, qi) => (
                              <div className="q-item" key={qi}>
                                <p className="q-prompt">{q}</p>
                                <textarea className="field field-sm" placeholder="Write your answer..." value={weeklyAnswers[`${item.number}-${qi}`] || ""} onChange={(e) => setWeeklyAnswers((prev) => ({ ...prev, [`${item.number}-${qi}`]: e.target.value }))} />
                              </div>
                            ))}
                          </div>
                        )}

                        {item.type === "wheel" && (() => {
                          const anyScored = WHEEL_DOMAINS.some((d) => weeklyScores[d]);
                          const belowFloor = WHEEL_DOMAINS.filter((d) => weeklyScores[d] && weeklyScores[d] < FLOOR);
                          return (
                            <>
                              <p className="instruction">{item.instruction}</p>
                              <WheelChart
                                domains={WHEEL_DOMAINS}
                                scores={weeklyScores}
                                onChange={(domain, value) => setWeeklyScores((prev) => ({ ...prev, [domain]: value }))}
                              />
                              <div className="question-block" style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-light)" }}>
                                {/* Auto-detected below-floor domains */}
                                <div className="q-item">
                                  <p className="q-prompt">{item.questions![0]}</p>
                                  {!anyScored ? (
                                    <p className="floor-empty">Score the wheel above — anything below {FLOOR} will surface here automatically.</p>
                                  ) : belowFloor.length === 0 ? (
                                    <p className="floor-ok">✓ Nothing below floor. Every scored domain is {FLOOR} or above.</p>
                                  ) : (
                                    <div className="floor-chips">
                                      {belowFloor
                                        .sort((a, b) => weeklyScores[a] - weeklyScores[b])
                                        .map((d) => (
                                          <span className="floor-chip" key={d}>
                                            {d} <strong>{weeklyScores[d]}</strong>
                                          </span>
                                        ))}
                                    </div>
                                  )}
                                  <textarea className="field field-sm" placeholder="Of these, which are also declining? Note anything worth tracking..." value={weeklyAnswers[`${item.number}-0`] || ""} onChange={(e) => setWeeklyAnswers((prev) => ({ ...prev, [`${item.number}-0`]: e.target.value }))} />
                                </div>
                                {/* Remaining questions */}
                                {item.questions!.slice(1).map((q, qi) => (
                                  <div className="q-item" key={qi + 1}>
                                    <p className="q-prompt">{q}</p>
                                    <textarea className="field field-sm" placeholder="Write your answer..." value={weeklyAnswers[`${item.number}-${qi + 1}`] || ""} onChange={(e) => setWeeklyAnswers((prev) => ({ ...prev, [`${item.number}-${qi + 1}`]: e.target.value }))} />
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        })()}

                        {item.type === "big3" && (
                          <>
                            <p className="q-prompt" style={{ marginBottom: item.instruction ? 4 : 12 }}>{item.question}</p>
                            {item.instruction && <p className="q-note" style={{ marginBottom: 12 }}>{item.instruction}</p>}
                            <div className="big3-wrap">
                              {[0, 1, 2].map((j) => (
                                <div className="big3-row" key={j}>
                                  <span className="big3-n">0{j + 1}</span>
                                  <input className="big3-input" placeholder={`Move ${j + 1} — one per quarterly outcome...`} value={weeklyBig3[j] ?? ""} onChange={(e) => { const u = [...weeklyBig3]; u[j] = e.target.value; setWeeklyBig3(u); }} />
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DAILY */}
        {tab === "daily" && (
          <div>
            <p className="daily-section-label">Morning</p>
            {DAILY_MORNING.map((block, i) => (
              <div className="daily-block" key={i}>
                <div className="daily-top">
                  <span className="daily-icon">{block.icon}</span>
                  <span className="daily-title">{block.title}</span>
                </div>
                <p className="daily-prompt">{block.prompt}</p>
                <p className="daily-instruction">{block.instruction}</p>
                <div className="big3-wrap">
                  {block.fields.map((f, j) => (
                    <div className="big3-row" key={j}>
                      <span className="big3-n">0{j + 1}</span>
                      <input className="big3-input" placeholder={f} value={i === 0 ? (dailyMorning[`b${j+1}`] || "") : (dailyMorning[`t${j+1}`] || "")} onChange={(e) => { const k = i === 0 ? `b${j+1}` : `t${j+1}`; setDailyMorning((prev) => ({ ...prev, [k]: e.target.value })); }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <p className="daily-section-label">Evening</p>
            {DAILY_EVENING.map((block, i) => (
              <div className="daily-block" key={i}>
                <div className="daily-top">
                  <span className="daily-icon" style={{ color: "#4A2A7A" }}>{block.icon}</span>
                  <span className="daily-title">{block.title}</span>
                </div>
                <p className="daily-prompt">{block.prompt}</p>
                <p className="daily-instruction">{block.instruction}</p>
                <textarea className="field field-sm" placeholder={block.placeholder} value={i === 0 ? dailyEvening.win : dailyEvening.adjust} onChange={(e) => setDailyEvening((prev) => ({ ...prev, [i === 0 ? "win" : "adjust"]: e.target.value }))} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}