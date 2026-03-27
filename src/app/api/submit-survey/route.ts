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

    // ── 4. Fire advisor notification email (non-blocking) ─────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'
    fetch(`${appUrl}/api/notify-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advisor_id,
        client_name: `${first_name.trim()} ${last_name.trim()}`,
        client_email: email.trim(),
      }),
    }).catch(() => {})

    return NextResponse.json({ ok: true, client_id: newClient.id })
  } catch (err) {
    console.error('submit-survey — unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
