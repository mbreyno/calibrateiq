import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { advisor_id, client_name, client_email } = await req.json()

    if (!advisor_id || !client_name || !client_email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // ── 1. Look up the advisor's user_id and firm name ─────────────────────
    const supabase = createAdminClient()

    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .select('user_id, firm_name')
      .eq('id', advisor_id)
      .single()

    if (advisorError || !advisor) {
      return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
    }

    // ── 2. Resolve the advisor's email from auth.users ─────────────────────
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(
      advisor.user_id,
    )

    if (authError || !authData?.user?.email) {
      return NextResponse.json({ error: 'Could not resolve advisor email.' }, { status: 500 })
    }

    const advisorEmail = authData.user.email
    const firmName = advisor.firm_name || 'Your Firm'
    const fromEmail = process.env.NOTIFY_FROM_EMAIL || 'onboarding@resend.dev'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.com'

    // Strip characters that would break the RFC 5321 "Display Name <email>" format
    const safeDisplayName = firmName.replace(/[<>"\\]/g, '').trim()

    // ── 3. Send the notification email via Resend REST API ─────────────────
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — skipping email notification.')
      return NextResponse.json({ ok: true, skipped: true })
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f8fdf9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1b4332;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fdf9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background:#1b4332;border-radius:12px 12px 0 0;padding:28px 32px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">
                ${firmName}
              </p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">
                CalibrateIQ · Advisor Portal
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1b4332;">
                New survey completed 🎉
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#40916c;line-height:1.5;">
                A client has just finished their investment profile questionnaire.
              </p>

              <!-- Client card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f0faf3;border:1px solid #d8f3dc;border-radius:10px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#74c69d;text-transform:uppercase;letter-spacing:0.06em;">
                      Client
                    </p>
                    <p style="margin:0 0 14px;font-size:17px;font-weight:700;color:#1b4332;">
                      ${client_name}
                    </p>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#74c69d;text-transform:uppercase;letter-spacing:0.06em;">
                      Email
                    </p>
                    <p style="margin:0;font-size:15px;color:#2d6a4f;">
                      <a href="mailto:${client_email}" style="color:#2d6a4f;text-decoration:none;">${client_email}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1b4332;border-radius:8px;">
                    <a href="${appUrl}/dashboard/clients"
                       style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      View in dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0faf3;border-radius:0 0 12px 12px;padding:16px 32px;">
              <p style="margin:0;font-size:12px;color:#74c69d;text-align:center;">
                You're receiving this because you have a CalibrateIQ advisor account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${safeDisplayName} via CalibrateIQ <${fromEmail}>`,
        to: [advisorEmail],
        subject: `New survey completed — ${client_name}`,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('Resend error:', res.status, body)
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('notify-advisor error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
