export type SelectKind = "none" | "likelihood" | "yesno";

export interface QuarterlyQuestion {
  id: string;
  focus: string;
  question: string;
  hint?: string;
  responsible: string;
  select: SelectKind;
  comment: boolean;
  commentLabel?: string;
}

export const LIKELIHOOD_OPTIONS = [
  "High (On-track)",
  "Medium (Fixable)",
  "Low (Major intervention needed)",
  "Not Applicable",
];
export const YESNO_OPTIONS = ["Yes", "No", "Not Applicable"];

export const optionsFor = (k: SelectKind) =>
  k === "likelihood" ? LIKELIHOOD_OPTIONS : k === "yesno" ? YESNO_OPTIONS : [];

const WSL = "Workstream Leads; Nevashan Govender (on behalf of the team at NICD)";
const PM = "Project Manager";

export const QUARTERLY_QUESTIONS: QuarterlyQuestion[] = [
  { id: "q1", focus: "STATUS UPDATE", question: "Last quarter progress", hint: "100 words", responsible: WSL, select: "none", comment: true },
  { id: "q2", focus: "STATUS UPDATE", question: "Key Achievements", hint: "100 words", responsible: WSL, select: "none", comment: true },
  { id: "q3", focus: "STATUS UPDATE", question: "Work Planned (for the next quarter)", responsible: WSL, select: "none", comment: true },
  { id: "q4", focus: "STATUS UPDATE", question: "Issues", hint: "30 words in bullet points", responsible: PM, select: "none", comment: true },
  { id: "q5", focus: "STATUS UPDATE", question: "Risks", hint: "30 words in bullet points", responsible: PM, select: "none", comment: true },
  { id: "q6", focus: "STATUS UPDATE", question: "Mitigation Measures to identified risks", hint: "60 words in bullet points", responsible: PM, select: "none", comment: true },
  { id: "q7", focus: "HIGH LEVEL MILESTONE PLANNING", question: "7a: High Level Planning for quarter 4 (October - December, 2026). 7b: What is the likelihood of meeting this quarter's milestone?", hint: "Plan: 30 words in bullet points", responsible: PM, select: "likelihood", comment: true },
  { id: "q8", focus: "HIGH LEVEL MILESTONE PLANNING", question: "8a: High Level Planning for quarter 1 (January - March, 2027). 8b: What is the likelihood of meeting this quarter's milestone?", hint: "Plan: 30 words in bullet points", responsible: PM, select: "likelihood", comment: true },
  { id: "q9", focus: "HIGH LEVEL MILESTONE PLANNING", question: "9a: High Level Planning for quarter 2 (April - June, 2027). 9b: What is the likelihood of meeting this quarter's milestone?", hint: "Plan: 30 words in bullet points", responsible: PM, select: "likelihood", comment: true },
  { id: "q10", focus: "HIGH LEVEL MILESTONE PLANNING", question: "Additional Information", hint: "60 words", responsible: PM, select: "none", comment: true },
  { id: "q11", focus: "FINANCIAL", question: "Financial: Likelihood of funds implemented as planned", responsible: PM, select: "likelihood", comment: false },
  { id: "q12", focus: "DELIVERY PARTNERS", question: "Of the current utilisation, how much was transferred to the delivery partners (USD)?", hint: "Provide the exact amount", responsible: PM, select: "none", comment: true, commentLabel: "Amount (USD)" },
  { id: "q13", focus: "DELIVERY PARTNERS", question: "Likelihood of partners utilising funds as planned", responsible: PM, select: "likelihood", comment: false },
  { id: "q14", focus: "DELIVERY PARTNERS", question: "Are you tracking the delivery partners' activities and expenditure in a structured way?", responsible: PM, select: "yesno", comment: false },
  { id: "q15", focus: "DELIVERY PARTNERS", question: "Other Updates", hint: "100 words", responsible: PM, select: "none", comment: true },
];

export const FOCUS_GROUPS = Array.from(new Set(QUARTERLY_QUESTIONS.map((q) => q.focus)));

export interface Answer { select?: string; comment?: string }
export type Answers = Record<string, Answer>;

export const wordCount = (s?: string) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);
export const hintLimit = (hint?: string) => {
  const m = hint?.match(/(\d+)\s*words/i);
  return m ? Number(m[1]) : undefined;
};
