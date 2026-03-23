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
  if (age < 45)  return 50
  if (age <= 55) return 40
  if (age <= 65) return 30
  if (age <= 75) return 20
  return 10
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
  {
    id: 'q7',
    category: 'informational',
    type: 'checkbox',
    question: 'Please select if any of the following areas are important to you:',
    options: [
      { label: 'Socially Responsible / ESG Investing', value: 'esg' },
      { label: 'Digital assets / crypto investing',    value: 'crypto' },
    ],
  },
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

  // Final category uses the more conservative of the two scores
  const combined = Math.min(capacityNorm, toleranceNorm)

  return {
    risk_capacity_score: capacityScore,
    risk_tolerance_score: toleranceScore,
    capacity_normalized: Math.round(capacityNorm),
    tolerance_normalized: Math.round(toleranceNorm),
    capacity_category: getCapacityCategory(capacityNorm),
    tolerance_category: getToleranceCategory(toleranceNorm),
    overall_category: getOverallCategory(combined),
    esg_preference: r.q7_esg,
    crypto_preference: r.q7_crypto,
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

function getOverallCategory(combined: number): RiskCategory {
  if (combined >= 80) return 'Aggressive'
  if (combined >= 60) return 'Moderately Aggressive'
  if (combined >= 40) return 'Moderate'
  if (combined >= 20) return 'Moderately Conservative'
  return 'Conservative'
}

// ─────────────────────────────────────────────
// ASSET ALLOCATION BY RISK CATEGORY
// ─────────────────────────────────────────────
export const ASSET_ALLOCATIONS: Record<RiskCategory, AssetAllocation> = {
  'Conservative':           { equities: 15,  fixed_income: 75, alternatives: 5,  cash: 5  },
  'Moderately Conservative':{ equities: 35,  fixed_income: 55, alternatives: 7,  cash: 3  },
  'Moderate':               { equities: 60,  fixed_income: 33, alternatives: 5,  cash: 2  },
  'Moderately Aggressive':  { equities: 80,  fixed_income: 15, alternatives: 4,  cash: 1  },
  'Aggressive':             { equities: 95,  fixed_income: 3,  alternatives: 2,  cash: 0  },
}

export const CATEGORY_COLORS: Record<RiskCategory, string> = {
  'Conservative':            '#52b788',
  'Moderately Conservative': '#74c69d',
  'Moderate':                '#d4a017',
  'Moderately Aggressive':   '#e07b26',
  'Aggressive':              '#c0392b',
}

export const CATEGORY_DESCRIPTIONS: Record<RiskCategory, string> = {
  'Conservative':
    'Preservation of capital is the primary objective. The portfolio emphasizes stability and income, accepting minimal volatility and lower long-term growth potential.',
  'Moderately Conservative':
    'Capital preservation with modest growth. The portfolio is weighted toward fixed income while allowing limited equity exposure for moderate long-term returns.',
  'Moderate':
    'A balanced approach to growth and stability. The portfolio holds a meaningful mix of equities and fixed income, accepting moderate volatility for solid long-term returns.',
  'Moderately Aggressive':
    'Growth-oriented with a tolerance for volatility. The portfolio is predominantly equity-focused, seeking above-average long-term returns while accepting periods of significant decline.',
  'Aggressive':
    'Maximum long-term growth is the primary objective. The portfolio is overwhelmingly equity-focused, accepting high volatility and potential for significant short-term losses in exchange for superior long-term returns.',
}
