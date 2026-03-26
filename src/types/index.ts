export interface Advisor {
  id: string
  user_id: string
  firm_name: string
  logo_url?: string | null
  signature_block?: boolean | null
  created_at: string
}

export interface Client {
  id: string
  advisor_id: string
  first_name: string
  last_name: string
  email: string
  date_of_birth?: string | null
  questionnaire_token: string
  status: 'pending' | 'completed'
  created_at: string
}

export interface QuestionnaireResponse {
  id: string
  client_id: string
  // Risk Capacity questions (scored 10–50 each)
  q1: number | null  // What is your current age?
  q2: number | null  // When do you expect to draw income?
  // Risk Tolerance questions (custom scoring — placeholder 10–50)
  q3: number | null  // For this investment, I intend to take
  q4: number | null  // Normal market expectations
  q5: number | null  // Poor market performance expectations
  q6: number | null  // 3-year performance attitude
  // Investment preferences (dynamic, advisor-configured)
  selected_preferences?: string[] | null  // array of InvestmentPreference IDs
  // Risk Tolerance continued
  q8: number | null  // 3-month performance attitude
  comments: string
  completed_at: string
}

export interface RiskProfile {
  risk_capacity_score: number       // 20–100 (Q1 + Q2)
  risk_tolerance_score: number      // 50–250 (Q3+Q4+Q5+Q6+Q8, placeholder scoring)
  capacity_category: CapacityCategory
  tolerance_category: ToleranceCategory
  overall_category: RiskCategory
  capacity_normalized: number       // 0–100
  tolerance_normalized: number      // 0–100
  selected_preferences?: string[]   // array of InvestmentPreference IDs selected by client
  comments: string
  client_name?: string              // Set by the dashboard after loading client data
}

export type RiskCategory =
  | 'Income'
  | 'Conservative Growth'
  | 'Moderate Growth'
  | 'Growth'
  | 'Aggressive Growth'

export type CapacityCategory = 'Low' | 'Moderate-Low' | 'Moderate' | 'Moderate-High' | 'High'
export type ToleranceCategory = 'Low' | 'Moderate-Low' | 'Moderate' | 'Moderate-High' | 'High'

export interface AssetAllocation {
  equities: number
  fixed_income: number
  alternatives: number
  cash: number
}

export interface IPSContent {
  client_name: string
  advisor_firm: string
  date_generated: string
  risk_category: RiskCategory
  investment_objectives: string
  time_horizon: string
  risk_summary: string
  asset_allocation: AssetAllocation
  investment_guidelines: string
  special_considerations: string
  advisor_notes: string
}

export interface InvestmentPolicyStatement {
  id: string
  client_id: string
  content: IPSContent
  created_at: string
  updated_at: string
}

export interface Household {
  id: string
  advisor_id: string
  name: string
  created_at: string
}

export interface HouseholdMember {
  id: string
  household_id: string
  client_id: string
}

export interface HouseholdIPS {
  id: string
  household_id: string
  content: IPSContent
  created_at: string
  updated_at: string
}

export interface QuestionOption {
  label: string
  score: number
}

export interface CheckboxOption {
  label: string
  value: string
}

export interface ScoredQuestion {
  id: string
  category: 'capacity' | 'tolerance'
  type: 'radio'
  question: string
  options: QuestionOption[]
}

export interface InfoQuestion {
  id: string
  category: 'informational'
  type: 'checkbox'
  question: string
  options: CheckboxOption[]
}

export type Question = ScoredQuestion | InfoQuestion

export interface InvestmentPreference {
  id: string
  advisor_id: string
  label: string
  icon: string
  sort_order: number
  created_at: string
}
