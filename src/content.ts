// All question/exercise content, shared by the planner tabs (App.tsx) and the Report page.

export const WHEEL_DOMAINS = [
  "Mission", "Money", "Body", "Spirit", "Home & Environment",
  "Growth", "Romance", "Family & Friends", "Fun", "Communities",
  "Creativity & Creation"
];

export const OUTCOME_SECTIONS = [
  { key: "result", label: "Result", prompt: "What is the specific outcome? Write it as already done, present tense, emotionally charged.", placeholder: "I am... I have... I feel..." },
  { key: "purpose", label: "Purpose", prompt: "Why does this have to happen? What does it mean for your life, your freedom, your identity?", placeholder: "This matters because..." },
  { key: "map", label: "Massive Action Plan", prompt: "What are the 3 to 5 actions that will make this outcome inevitable?", placeholder: "The actions that move the needle..." },
  { key: "obstacles", label: "Obstacles", prompt: "What are the 2 to 3 things most likely to derail this? Name them now so they don't catch you off guard.", placeholder: "The things that will try to stop me..." },
  { key: "identity", label: "Identity", prompt: "Who do you need to become for this to be inevitable? Not what you need to do. Who you need to be.", placeholder: "I am someone who..." },
];

export type QuarterlyItem = {
  number: string;
  label: string;
  type: "ritual" | "text" | "multi" | "wheel" | "cost" | "outcomes" | "declaration";
  question?: string;
  instruction?: string;
  placeholder?: string;
  questions?: string[];
};

// Scores below this leave a domain "in the red" for the quarterly cost question.
export const COST_THRESHOLD = 6;

export const QUARTERLY_PARTS: Array<{ part: string; title: string; time: string; items: QuarterlyItem[] }> = [
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

export type WeeklyItem = {
  number: string;
  label: string;
  type: "ritual" | "text" | "multi" | "wheel" | "big3";
  question?: string;
  instruction?: string;
  placeholder?: string;
  fieldSm?: boolean;
  questions?: string[];
};

export const WEEKLY_PHASES: Array<{ phase: string; title: string; time: string; items: WeeklyItem[] }> = [
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
        label: "Organise the Calendar",
        type: "ritual",
        question: "Open next week's calendar now. Block time for each of your Big 3 first, then arrange everything else around them.",
      },
      {
        number: "08",
        label: "Floor Maintenance",
        type: "text",
        question: "Based on the Wheel pulse, what one or two things need a minimum viable action this week?",
        instruction: "Not growth. Just enough to stay stable and protect your energy.",
        placeholder: "The minimum viable actions that keep me stable...",
      },
      {
        number: "09",
        label: "Energy and Joy Plan",
        type: "text",
        question: "What will fill my tank this week? (movement, people, music, dancing, something new)",
        instruction: "This is not optional. Name it specifically. When is it happening?",
        placeholder: "What fills my tank, and exactly when it happens...",
      },
      {
        number: "10",
        label: "One Thing to Look Forward To",
        type: "text",
        question: "Something concrete in the next 7 days that genuinely excites you.",
        instruction: "If it doesn't exist yet, create it now. Text someone, book something, plan it before closing this session.",
        placeholder: "I'm looking forward to...",
      },
      {
        number: "11",
        label: "Closing Intention",
        type: "text",
        question: "One sentence. Sunday night, looking back: what would make this a week worth living?",
        placeholder: "This was a week worth living because...",
        fieldSm: true,
      },
    ],
  },
];

export const DAILY_MORNING = [
  { icon: "◎", title: "Daily Big 3", prompt: "From your Weekly Big 3, what are the 3 tasks that move the needle today?", instruction: "Write them first. Do them first. Everything else is secondary.", fields: ["Big 3 #1", "Big 3 #2", "Big 3 #3"] },
  { icon: "◈", title: "Block the Time", prompt: "When exactly will you do each of your Big 3 today?", instruction: "Unscheduled intentions don't happen. Assign a time slot to each one.", fields: ["Big 3 #1 — time block", "Big 3 #2 — time block", "Big 3 #3 — time block"] },
];

export const DAILY_EVENING = [
  { icon: "◉", title: "One Win", prompt: "What are you most proud of today?", instruction: "One sentence. No more.", placeholder: "Today I..." },
  { icon: "◌", title: "One Adjustment", prompt: "What would you do differently tomorrow?", instruction: "One thing only. Then close the book.", placeholder: "Tomorrow I will..." },
];
