import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Minimal server-side color helpers ────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** Mix a hex color toward white by factor t (0 = original, 1 = white), return hex */
function tint(hex: string, t: number): string {
  const [r, g, b] = hexToRgb(hex)
  const mix = (c: number) => Math.round(c + (255 - c) * t).toString(16).padStart(2, '0')
  return `#${mix(r)}${mix(g)}${mix(b)}`
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { advisor_id, client_name, client_email } = await req.json()

    if (!advisor_id || !client_name || !client_email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // ── 1. Look up the advisor and their sub-users ─────────────────────────
    const supabase = createAdminClient()

    const [{ data: advisor, error: advisorError }, { data: subAdvisors }] = await Promise.all([
      supabase
        .from('advisors')
        .select('user_id, firm_name, brand_color, brand_accent, brand_surface, brand_text, notify_on_completion')
        .eq('id', advisor_id)
        .single(),
      supabase
        .from('advisors')
        .select('user_id, notify_on_completion')
        .eq('parent_advisor_id', advisor_id),
    ])

    if (advisorError || !advisor) {
      return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
    }

    // ── 2. Collect recipients: admin + sub-users who have notifications on ──
    const recipientUserIds: string[] = []

    if (advisor.notify_on_completion !== false) {
      recipientUserIds.push(advisor.user_id)
    }
    for (const sub of (subAdvisors ?? [])) {
      if (sub.notify_on_completion !== false) {
        recipientUserIds.push(sub.user_id)
      }
    }

    if (recipientUserIds.length === 0) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Resolve email addresses in parallel
    const emailResults = await Promise.all(
      recipientUserIds.map(uid => supabase.auth.admin.getUserById(uid))
    )
    const recipientEmails = emailResults
      .map(r => r.data?.user?.email)
      .filter((e): e is string => !!e)

    if (recipientEmails.length === 0) {
      return NextResponse.json({ error: 'Could not resolve any recipient emails.' }, { status: 500 })
    }

    // ── 3. Build the color palette from the advisor's brand settings ────────
    const primary  = advisor.brand_color   || '#1b4332'
    const accent   = advisor.brand_accent  || '#d4a017'
    const surface  = advisor.brand_surface || '#fefae0'
    const textBase = advisor.brand_text    || primary

    // Derive email-safe tints (no CSS variables — inline styles only in email)
    const c = {
      primary,                         // header bg, CTA button bg
      primaryDark:  tint(primary, -0), // same as primary (already dark)
      text900:      textBase,          // headings
      text700:      tint(textBase, 0.26), // body text, links
      text500:      tint(primary, 0.54),  // subtitle, label text
      text400:      tint(primary, 0.65),  // footer text
      card:         tint(primary, 0.91),  // client card bg
      cardBorder:   tint(primary, 0.83),  // client card border
      footerBg:     tint(surface,  0.30), // footer strip
      pageBg:       tint(surface,  0.50), // outer email bg
      accent,
    }

    const firmName      = advisor.firm_name || 'Your Firm'
    const fromEmail     = process.env.NOTIFY_FROM_EMAIL || 'onboarding@resend.dev'
    const appUrl        = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'
    const safeDisplayName = firmName.replace(/[<>"\\]/g, '').trim()

    // ── 4. Build the email ──────────────────────────────────────────────────
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
<body style="margin:0;padding:0;background:${c.pageBg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${c.text900};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${c.pageBg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background:${c.primary};border-radius:12px 12px 0 0;padding:28px 32px;">
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
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:${c.text900};">
                New survey completed 🎉
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:${c.text500};line-height:1.5;">
                A client has just finished their investment profile questionnaire.
              </p>

              <!-- Client card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:${c.card};border:1px solid ${c.cardBorder};border-radius:10px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:${c.text400};text-transform:uppercase;letter-spacing:0.06em;">
                      Client
                    </p>
                    <p style="margin:0 0 14px;font-size:17px;font-weight:700;color:${c.text900};">
                      ${client_name}
                    </p>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:${c.text400};text-transform:uppercase;letter-spacing:0.06em;">
                      Email
                    </p>
                    <p style="margin:0;font-size:15px;color:${c.text700};">
                      <a href="mailto:${client_email}" style="color:${c.text700};text-decoration:none;">${client_email}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${c.primary};border-radius:8px;">
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
            <td style="background:${c.footerBg};border-radius:0 0 12px 12px;padding:16px 32px;">
              <p style="margin:0;font-size:12px;color:${c.text400};text-align:center;">
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
        to: recipientEmails,
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
