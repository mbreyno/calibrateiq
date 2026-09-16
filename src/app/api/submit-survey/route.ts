import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateAgeScore } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  try {
    const {
      advisor_id,
      first_name,
      last_name,
      email,
      dob,
      answers,
      selected_preferences,
      custom_answers,
      experience_level,   // legacy field, mapped into custom_answers below
      check_frequency,    // legacy field, mapped into custom_answers below
      comments,
    } = await req.json()

    if (!advisor_id || !first_name || !last_name || !email || !dob) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // ── 1. Verify advisor exists ─────────────────────────────────────────────
    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .select('id')
      .eq('id', advisor_id)
      .single()

    if (advisorError || !advisor) {
      return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
    }

    // ── 2. Insert client record ───────────────────────────────────────────────
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        advisor_id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        date_of_birth: dob || null,
        status: 'completed',
      })
      .select('id')
      .single()

    if (clientError || !newClient) {
      console.error('submit-survey — client insert error:', clientError)
      return NextResponse.json(
        { error: clientError?.message || 'Failed to save client record.' },
        { status: 500 }
      )
    }

    // ── 3. Insert questionnaire responses ─────────────────────────────────────
    // Strip null bytes from comments (PostgreSQL rejects \u0000 in text)
    const safeComments = (comments ?? '').replace(/\u0000/g, '').trim()

    // Sanitize custom-question answers: max 3, literal {question, answer} text.
    // Legacy clients loaded before the builder shipped may still send
    // experience_level / check_frequency — fold those in so nothing is lost.
    const rawAnswers: unknown[] = Array.isArray(custom_answers) ? custom_answers : []
    if (typeof experience_level === 'string' && experience_level) {
      rawAnswers.push({ question: 'How would you describe your investing experience today?', answer: experience_level })
    }
    if (typeof check_frequency === 'string' && check_frequency) {
      rawAnswers.push({ question: 'How often do you find yourself checking your investments?', answer: check_frequency })
    }
    const safeCustomAnswers = rawAnswers
      .filter((a): a is { question: string; answer: string } =>
        !!a && typeof (a as { question?: unknown }).question === 'string'
        && typeof (a as { answer?: unknown }).answer === 'string')
      .map(a => ({
        question: a.question.replace(/\u0000/g, '').trim().slice(0, 500),
        answer: a.answer.replace(/\u0000/g, '').trim().slice(0, 2000),
      }))
      .filter(a => a.question && a.answer)
      .slice(0, 3)

    const { error: respError } = await supabase
      .from('questionnaire_responses')
      .insert({
        client_id: newClient.id,
        q1: calculateAgeScore(dob),
        q2: answers?.q2 ?? null,
        q3: answers?.q3 ?? null,
        q4: answers?.q4 ?? null,
        q5: answers?.q5 ?? null,
        q6: answers?.q6 ?? null,
        q8: answers?.q8 ?? null,
        selected_preferences: selected_preferences ?? [],
        custom_answers: safeCustomAnswers,
        comments: safeComments || '',
      })

    if (respError) {
      console.error('submit-survey — response insert error:', respError)
      // Roll back the client record so the user can try again
      await supabase.from('clients').delete().eq('id', newClient.id)
      return NextResponse.json(
        { error: respError.message || 'Failed to save survey responses.' },
        { status: 500 }
      )
    }

    // ── 4. Fire advisor notification email ────────────────────────────────────
    // Must be awaited: Vercel terminates the serverless function on `return`,
    // which kills unawaited fetches before they open a connection. Errors are
    // caught so a Resend outage never fails the client's survey submission.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'
    await fetch(`${appUrl}/api/notify-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advisor_id,
        client_name: `${first_name.trim()} ${last_name.trim()}`,
        client_email: email.trim(),
      }),
    }).catch(err => {
      console.error('submit-survey → notify-advisor failed:', err)
    })

    return NextResponse.json({ ok: true, client_id: newClient.id })
  } catch (err) {
    console.error('submit-survey — unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
