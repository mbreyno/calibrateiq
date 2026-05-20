import type {
  QuestionnaireResponse,
  RiskProfile,
  RiskCategory,
  CapacityCategory,
  ToleranceCategory,
  Question,
  AssetAllocation,
} from '@/types'

// ─────────────────────────────────────────────
// AGE SCORE (derived from date of birth)
// Replaces Q1 — score calculated automatically
// ─────────────────────────────────────────────
export function calculateAgeScore(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  if (age < 45) return 50
  if (age > 85) return 10
  return 95 - age  // 1 point per year: age 45 → 50, 55 → 40, 65 → 30, 75 → 20, 85 → 10
}

// ─────────────────────────────────────────────
// QUESTIONNAIRE DEFINITION
// Q1 score is now derived from DOB via calculateAgeScore.
// Scores for Q2: 50 → 10 in steps of 10.
// Scores for Q3–Q8: 20 → 4 in steps of 4.
// ─────────────────────────────────────────────
export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'capacity',
    type: 'radio',
    question: 'What is your current age?',
    options: [
      { label: 'Less than 45',  score: 50 },
      { label: '45 to 55',      score: 40 },
      { label: '56 to 65',      score: 30 },
      { label: '66 to 75',      score: 20 },
      { label: 'Older than 75', score: 10 },
    ],
  },
  {
    id: 'q2',
    category: 'capacity',
    type: 'radio',
    question: 'When do you expect to start drawing income from your investments?',
    options: [
      { label: 'Not for at least 20 years', score: 50 },
      { label: 'In 11 to 19 years',         score: 40 },
      { label: 'In 6 to 10 years',          score: 30 },
      { label: 'In 1 to 5 years',           score: 20 },
      { label: 'Within 1 year',             score: 10 },
    ],
  },
  {
    id: 'q3',
    category: 'tolerance',
    type: 'radio',
    question: 'For this investment, I intend to take:',
    options: [
      { label: 'Higher risk in return for potentially superior returns',                    score: 20 },
      { label: 'Moderate to higher risk in return for potentially greater return',          score: 16 },
      { label: 'Moderate risk in return for some growth opportunity',                       score: 12 },
      { label: 'Low risk in return for a little growth opportunity',                        score: 8  },
      { label: 'Slight to no risk in return for general stability of principal',            score: 4  },
    ],
  },
  {
    id: 'q4',
    category: 'tolerance',
    type: 'radio',
    question: 'Assuming normal market conditions, what would you expect from this investment over time?',
    options: [
      { label: 'To generally keep pace with the stock market',                             score: 20 },
      { label: 'To slightly trail the stock market, but make a good profit',               score: 16 },
      { label: 'To trail the stock market, but make a moderate profit',                    score: 12 },
      { label: 'To have some stability, but make modest profits',                          score: 8  },
      { label: 'To have a high degree of stability, but make small profits',               score: 4  },
    ],
  },
  {
    id: 'q5',
    category: 'tolerance',
    type: 'radio',
    question: 'Suppose the stock market performs unusually poorly over the next decade. What would you expect from this investment?',
    options: [
      { label: 'To also perform poorly',                                                   score: 20 },
      { label: 'To make very little or nothing',                                           score: 16 },
      { label: 'To make a little gain',                                                    score: 12 },
      { label: 'To make a modest gain',                                                    score: 8  },
      { label: "To make gains, regardless of the stock market's performance",              score: 4  },
    ],
  },
  {
    id: 'q6',
    category: 'tolerance',
    type: 'radio',
    question: "Which of these statements would best describe your attitudes about the next THREE YEARS' performance of this investment?",
    options: [
      { label: 'I understand a loss of principal is a realistic possibility',              score: 20 },
      { label: 'I can tolerate a loss',                                                    score: 16 },
      { label: 'I can tolerate a small loss',                                              score: 12 },
      { label: "I'd have a hard time tolerating any losses",                               score: 8  },
      { label: 'I need to at least see some return',                                       score: 4  },
    ],
  },
  // q7 is now dynamic (advisor-configured investment preferences) — rendered separately in survey UI
  {
    id: 'q8',
    category: 'tolerance',
    type: 'radio',
    question: "Which of these statements would best describe your attitudes about the next THREE MONTHS' performance of this investment?",
    options: [
      { label: "I wouldn't worry about market fluctuations in that time frame",            score: 20 },
      { label: "If my investment declined greater than 20%, I'd be concerned",             score: 16 },
      { label: "If my investment declined greater than 10%, I'd be concerned",             score: 12 },
      { label: 'I can only tolerate small short-term fluctuations in my investment',       score: 8  },
      { label: "I'd have a hard time accepting any investment declines",                   score: 4  },
    ],
  },
]

// ─────────────────────────────────────────────
// SCORE RANGES
// Risk Capacity:  Q1 + Q2        → 20–100  (each 10–50)
// Risk Tolerance: Q3+Q4+Q5+Q6+Q8 → 20–100  (each 4–20)
// ─────────────────────────────────────────────
const CAPACITY_MIN = 20
const CAPACITY_MAX = 100
const TOLERANCE_MIN = 20
const TOLERANCE_MAX = 100

export function calculateRiskProfile(r: QuestionnaireResponse): RiskProfile {
  const capacityScore = (r.q1 ?? 0) + (r.q2 ?? 0)
  const toleranceScore = (r.q3 ?? 0) + (r.q4 ?? 0) + (r.q5 ?? 0) + (r.q6 ?? 0) + (r.q8 ?? 0)

  const capacityNorm = normalize(capacityScore, CAPACITY_MIN, CAPACITY_MAX)
  const toleranceNorm = normalize(toleranceScore, TOLERANCE_MIN, TOLERANCE_MAX)

  return {
    risk_capacity_score: capacityScore,
    risk_tolerance_score: toleranceScore,
    capacity_normalized: Math.round(capacityNorm),
    tolerance_normalized: Math.round(toleranceNorm),
    capacity_category: getCapacityCategory(capacityNorm),
    tolerance_category: getToleranceCategory(toleranceNorm),
    overall_category: getOverallCategory(capacityScore), // uses raw score (same value displayed as X/100)
    selected_preferences: r.selected_preferences?.filter(Boolean) ?? [],
    comments: r.comments,
  }
}

function normalize(score: number, min: number, max: number): number {
  return ((score - min) / (max - min)) * 100
}

function getCapacityCategory(norm: number): CapacityCategory {
  if (norm >= 80) return 'High'
  if (norm >= 60) return 'Moderate-High'
  if (norm >= 40) return 'Moderate'
  if (norm >= 20) return 'Moderate-Low'
  return 'Low'
}

function getToleranceCategory(norm: number): ToleranceCategory {
  if (norm >= 80) return 'High'
  if (norm >= 60) return 'Moderate-High'
  if (norm >= 40) return 'Moderate'
  if (norm >= 20) return 'Moderate-Low'
  return 'Low'
}

export function getOverallCategory(combined: number): RiskCategory {
  if (combined >= 80) return 'Aggressive Growth'
  if (combined >= 60) return 'Growth'
  if (combined >= 40) return 'Moderate Growth'
  if (combined >= 20) return 'Conservative Growth'
  return 'Income'
}

// ─────────────────────────────────────────────
// ASSET ALLOCATION BY RISK CATEGORY
// ─────────────────────────────────────────────
export const ASSET_ALLOCATIONS: Record<RiskCategory, AssetAllocation> = {
  'Income':             { equities: 15,  fixed_income: 75, alternatives: 5,  cash: 5  },
  'Conservative Growth':{ equities: 35,  fixed_income: 55, alternatives: 7,  cash: 3  },
  'Moderate Growth':    { equities: 60,  fixed_income: 33, alternatives: 5,  cash: 2  },
  'Growth':             { equities: 80,  fixed_income: 15, alternatives: 4,  cash: 1  },
  'Aggressive Growth':  { equities: 95,  fixed_income: 3,  alternatives: 2,  cash: 0  },
}

export const CATEGORY_COLORS: Record<RiskCategory, string> = {
  'Income':             '#4a7fb5',  // calm steel blue
  'Conservative Growth':'#52b788',  // teal green
  'Moderate Growth':    '#40916c',  // forest green
  'Growth':             '#d4a017',  // amber gold
  'Aggressive Growth':  '#c97c2a',  // warm burnt orange
}

export const CATEGORY_SCORE_RANGES: Record<RiskCategory, string> = {
  'Income':             '0 – 20',
  'Conservative Growth':'20 – 40',
  'Moderate Growth':    '40 – 60',
  'Growth':             '60 – 80',
  'Aggressive Growth':  '80 – 100',
}

export const CATEGORY_DESCRIPTIONS: Record<RiskCategory, string> = {
  'Income':
    'This portfolio is appropriate for investors whose primary objective is current income. The majority of assets in this portfolio are allocated to short-term and intermediate-term investments such as fixed-income securities (bonds). A portion of this portfolio may also be invested in equities (stocks), which are subject to price fluctuations, as protection against the erosion to purchasing power caused by inflation.',
  'Conservative Growth':
    'This portfolio is appropriate for investors who prefer a balanced mix of current income and capital appreciation, and are willing to tolerate some short-term price fluctuations associated with equity (stock) investments. The assets in this portfolio are balanced among equities (stocks) and fixed-income securities (bonds).',
  'Moderate Growth':
    'This portfolio is appropriate for investors whose primary objective is capital appreciation and to whom current income is of secondary importance. A moderate growth investor is willing to tolerate short-term price fluctuations. The assets in this portfolio are a mix of equities (stocks) and fixed-income securities (bonds), with a higher weighting towards equities (stocks).',
  'Growth':
    'This portfolio is appropriate for investors whose primary objective is long-term capital appreciation and who are willing to tolerate potentially large price fluctuations. Generating current income is not a primary goal. Assets in this portfolio are invested primarily (and in some cases entirely) in equities (stocks).',
  'Aggressive Growth':
    'This portfolio is appropriate for investors whose primary objective is maximum long-term capital appreciation and who are willing to tolerate more substantial, potentially large price fluctuations. Generating current income is not a goal. Assets in this portfolio are invested entirely (or almost entirely) in equities (stocks).',
}
