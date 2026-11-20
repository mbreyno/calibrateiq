import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateAgeScore, QUESTIONS } from '@/lib/scoring'
import { sendSurveyCompletedEmail } from '@/lib/notifyAdvisor'

// Never cache: these responses must always reflect the current database.
export const dynamic = 'force-dynamic'

/**
 * GET /api/survey/client/[token]
 *
 * Public endpoint — no auth required.
 * Looks up a client by questionnaire_token using the admin client, then the
 * owning advisor (RLS blocks anonymous reads of advisors, which is why the
 * legacy /q page rendered unbranded). Returns only public-facing fields.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  if (!token) return NextResponse.json({ error: 'Token required.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: client, error: clientError } = await admin
    .from('clients')
    .select('id, advisor_id, first_name, last_name, email, date_of_birth, status')
    .eq('questionnaire_token', token)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 })
  }

  const { data: advisor, error: advisorError } = await admin
    .from('advisors')
    .select('id, firm_name, logo_url, brand_color, brand_accent, brand_surface, brand_text, parent_advisor_id')
    .eq('id', client.advisor_id)
    .single()

  if (advisorError || !advisor) {
    return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
  }

  // Sub-users inherit branding from their parent firm
  let brandingAdvisor = advisor
  if (advisor.parent_advisor_id) {
    const { data: parent } = await admin
      .from('advisors')
      .select('firm_name, logo_url, brand_color, brand_accent, brand_surface, brand_text')
      .eq('id', advisor.parent_advisor_id)
      .single()

    if (parent) {
      brandingAdvisor = { ...advisor, ...parent }
    }
  }

  return NextResponse.json({ client, advisor: brandingAdvisor })
}

/**
 * POST /api/survey/client/[token]
 *
 * Public endpoint — no auth required. Submits the legacy per-client
 * questionnaire server-side. Anonymous callers have no direct table access,
 * so the response insert and status update happen here with the admin
 * client, scoped to the single client the token identifies.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    if (!token) return NextResponse.json({ error: 'Token required.' }, { status: 400 })

    const { answers, comments } = await req.json()
    const admin = createAdminClient()

    const { data: client } = await admin
      .from('clients')
      .select('id, advisor_id, first_name, last_name, email, date_of_birth, status')
      .eq('questionnaire_token', token)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found.' }, { status: 404 })
    if (client.status === 'completed') {
      return NextResponse.json({ error: 'This questionnaire has already been submitted.' }, { status: 409 })
    }

    // Only accept scores that are real options for each scored question;
    // q1 is derived server-side from the date of birth on file.
    const validScore = (id: string): number | null => {
      const q = QUESTIONS.find(x => x.id === id)
      const v = answers?.[id]
      if (!q || q.type !== 'radio' || typeof v !== 'number') return null
      return q.options.some(o => o.score === v) ? v : null
    }

    const { error: respError } = await admin
      .from('questionnaire_responses')
      .insert({
        client_id: client.id,
        q1: client.date_of_birth ? calculateAgeScore(client.date_of_birth) : null,
        q2: validScore('q2'),
        q3: validScore('q3'),
        q4: validScore('q4'),
        q5: validScore('q5'),
        q6: validScore('q6'),
        q8: validScore('q8'),
        selected_preferences: [],
        comments: (typeof comments === 'string' ? comments : '').replace(/\u0000/g, '').trim(),
      })

    if (respError) {
      console.error('survey/client submit — response insert error:', respError)
      return NextResponse.json({ error: 'Failed to save survey responses.' }, { status: 500 })
    }

    await admin.from('clients').update({ status: 'completed' }).eq('id', client.id)

    // Awaited: Vercel terminates the function on return. Never throws, so an
    // email failure can't fail the client's submission.
    await sendSurveyCompletedEmail({
      advisorId: client.advisor_id,
      clientName: `${client.first_name} ${client.last_name}`,
      clientEmail: client.email,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('survey/client submit — unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
