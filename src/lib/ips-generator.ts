import type { Client, Advisor, RiskProfile, IPSContent } from '@/types'
import { ASSET_ALLOCATIONS, CATEGORY_DESCRIPTIONS } from './scoring'

export function generateIPSContent(
  client: Client,
  advisor: Advisor,
  profile: RiskProfile
): IPSContent {
  const clientName = `${client.first_name} ${client.last_name}`
  const alloc = ASSET_ALLOCATIONS[profile.overall_category]
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const timeHorizonText = getTimeHorizonText(profile.risk_capacity_score)

  const specialParts: string[] = []
  if (profile.esg_preference) {
    specialParts.push(
      'The client has expressed interest in Socially Responsible / ESG (Environmental, Social, and Governance) investing. Where appropriate, ESG-screened securities and funds should be considered as part of the investment strategy.'
    )
  }
  if (profile.crypto_preference) {
    specialParts.push(
      'The client has expressed interest in digital assets and cryptocurrency. Any allocation to digital assets should be considered speculative and limited to a small portion of the overall portfolio, commensurate with the client\'s overall risk profile.'
    )
  }

  return {
    client_name: clientName,
    advisor_firm: advisor.firm_name,
    date_generated: today,
    risk_category: profile.overall_category,
    investment_objectives: generateObjectives(clientName, profile),
    time_horizon: timeHorizonText,
    risk_summary: generateRiskSummary(profile),
    asset_allocation: alloc,
    investment_guidelines: generateGuidelines(profile, alloc),
    special_considerations:
      specialParts.length > 0
        ? specialParts.join('\n\n')
        : 'No special investment considerations have been identified at this time.',
    advisor_notes: profile.comments
      ? `Client comments: "${profile.comments}"`
      : '',
  }
}

function generateObjectives(clientName: string, profile: RiskProfile): string {
  const categoryDesc = CATEGORY_DESCRIPTIONS[profile.overall_category]
  return `The primary investment objective for ${clientName} is consistent with a ${profile.overall_category} risk profile. ${categoryDesc}

The portfolio is designed to align with the client's capacity and tolerance for risk as determined through the CalibrateIQ risk assessment process. Investment decisions should reflect both the client's financial situation and their psychological comfort with market volatility.`
}

function getTimeHorizonText(capacityScore: number): string {
  if (capacityScore >= 84)
    return 'Long-term (20+ years). The client has a substantial time horizon, allowing the portfolio to weather short-term market volatility in pursuit of long-term growth.'
  if (capacityScore >= 68)
    return 'Long-to-medium term (11–19 years). The client has a meaningful time horizon that supports growth-oriented investing while beginning to consider capital preservation.'
  if (capacityScore >= 52)
    return 'Medium term (6–10 years). The portfolio should balance growth and capital preservation, with increasing attention to downside protection as the investment horizon approaches.'
  if (capacityScore >= 36)
    return 'Short-to-medium term (1–5 years). Capital preservation becomes increasingly important. The portfolio should limit volatility while maintaining modest growth potential.'
  return 'Short term (within 1 year). The primary focus should be capital preservation and liquidity. Volatility should be minimized.'
}

function generateRiskSummary(profile: RiskProfile): string {
  return `Based on the completed risk assessment, ${profile.client_name ?? 'the client'} has been classified as a ${profile.overall_category} investor.

Risk Capacity Score: ${profile.risk_capacity_score} / 100
Risk Tolerance Score: ${profile.risk_tolerance_score} / 250

Risk Capacity reflects the client's objective ability to absorb potential investment losses based on age and investment time horizon. The client's Risk Capacity is classified as ${profile.capacity_category}.

Risk Tolerance reflects the client's subjective comfort with investment risk and market volatility. The client's Risk Tolerance is classified as ${profile.tolerance_category}.

The overall ${profile.overall_category} classification is determined by taking the more conservative of the two measures, ensuring the portfolio recommendation aligns with both the client's financial circumstances and psychological comfort level.`
}

function generateGuidelines(
  profile: RiskProfile,
  alloc: ReturnType<typeof ASSET_ALLOCATIONS[keyof typeof ASSET_ALLOCATIONS]>
): string {
  return `Asset Allocation Target:
• Equities: ${alloc.equities}%
• Fixed Income: ${alloc.fixed_income}%
• Alternative Investments: ${alloc.alternatives}%
• Cash & Equivalents: ${alloc.cash}%

Rebalancing: The portfolio should be reviewed at least annually and rebalanced when any asset class drifts more than 5% from its target allocation.

Diversification: Equity exposure should be diversified across market capitalizations, geographies, and sectors. Fixed income holdings should be diversified across maturities and credit quality consistent with the client's risk profile.

Prohibited Strategies: Margin trading, short selling, and the use of leveraged products are not permitted unless explicitly approved by both the client and advisor.

Liquidity: Sufficient liquidity (minimum ${alloc.cash > 0 ? alloc.cash : 1}% in cash or equivalents) should be maintained to meet foreseeable near-term income needs.

Review: This Investment Policy Statement should be reviewed annually or upon any material change in the client's financial situation, goals, or risk profile.`
}
