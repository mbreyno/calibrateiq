/**
 * Optional "Other Information" investment-experience questions.
 * Documentation only — answers are stored as the literal option text and
 * shown on the report; they never contribute to risk scoring.
 * Shown on the survey only when the firm's advisors.ask_experience is true.
 */

export interface ExperienceQuestion {
  /** questionnaire_responses column the answer is stored in */
  field: 'experience_level' | 'check_frequency'
  question: string
  options: string[]
}

export const EXPERIENCE_QUESTIONS: ExperienceQuestion[] = [
  {
    field: 'experience_level',
    question: 'How would you describe your investing experience today?',
    options: [
      "New to investing — I haven't bought stocks, bonds, or funds on my own yet.",
      'Some experience — I understand the basics (asset classes, market ups and downs, diversification) and have made some investment decisions myself.',
      "Experienced — I've managed my own portfolio for years and I'm comfortable with more complex investments.",
    ],
  },
  {
    field: 'check_frequency',
    question: 'How often do you find yourself checking your investments?',
    options: [
      'Daily',
      'Weekly (or a few times a week)',
      'Monthly',
      'A few times a year',
      'Rarely — I set it and forget it',
    ],
  },
]
