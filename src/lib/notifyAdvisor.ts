import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Emails the firm (admin + sub-users who have notifications on) that a client
 * completed their survey. Server-only: called directly by the survey submit
 * routes, never exposed as an HTTP endpoint, so it can't be triggered by
 * anyone who hasn't actually submitted a survey. Never throws.
 */

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

/** Client name and email come from whoever submitted the survey. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendSurveyCompletedEmail({ advisorId, clientName, clientEmail }: {
  advisorId: string
  clientName: string
  clientEmail: string
}): Promise<void> {
  try {
    if (!advisorId || !clientName || !clientEmail) return

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — skipping email notification.')
      return
    }

    // ── 1. Look up the advisor and their sub-users ─────────────────────────
    const supabase = createAdminClient()

    const [{ data: advisor }, { data: subAdvisors }] = await Promise.all([
      supabase
        .from('advisors')
        .select('user_id, firm_name, brand_color, brand_accent, brand_surface, brand_text, notify_on_completion')
        .eq('id', advisorId)
        .single(),
      supabase
        .from('advisors')
        .select('user_id, notify_on_completion')
        .eq('parent_advisor_id', advisorId),
    ])

    if (!advisor) {
      console.error('notifyAdvisor: advisor not found', advisorId)
      return
    }

    // ── 2. Collect recipients: admin + sub-users who have notifications on ──
    const recipientUserIds: string[] = []
    if (advisor.notify_on_completion !== false) recipientUserIds.push(advisor.user_id)
    for (const sub of (subAdvisors ?? [])) {
      if (sub.notify_on_completion !== false) recipientUserIds.push(sub.user_id)
    }
    if (recipientUserIds.length === 0) return

    const emailResults = await Promise.all(
      recipientUserIds.map(uid => supabase.auth.admin.getUserById(uid))
    )
    const recipientEmails = emailResults
      .map(r => r.data?.user?.email)
      .filter((e): e is string => !!e)

    if (recipientEmails.length === 0) {
      console.error('notifyAdvisor: could not resolve any recipient emails', advisorId)
      return
    }

    // ── 3. Build the color palette from the advisor's brand settings ────────
    const primary  = advisor.brand_color   || '#1b4332'
    const accent   = advisor.brand_accent  || '#d4a017'
    const surface  = advisor.brand_surface || '#fefae0'
    const textBase = advisor.brand_text    || primary

    // Email-safe tints (no CSS variables — inline styles only in email)
    const c = {
      primary,
      text900:    textBase,
      text700:    tint(textBase, 0.26),
      text500:    tint(primary, 0.54),
      text400:    tint(primary, 0.65),
      card:       tint(primary, 0.91),
      cardBorder: tint(primary, 0.83),
      footerBg:   tint(surface, 0.30),
      pageBg:     tint(surface, 0.50),
      accent,
    }

    const firmName        = advisor.firm_name || 'Your Firm'
    const fromEmail       = process.env.NOTIFY_FROM_EMAIL || 'onboarding@resend.dev'
    const appUrl          = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'
    const safeDisplayName = firmName.replace(/[<>"\\]/g, '').trim()
    const firmHtml        = escapeHtml(firmName)
    const nameHtml        = escapeHtml(clientName)
    const emailHtml       = escapeHtml(clientEmail)
    // Subject is plain text: strip line breaks so it stays a single header line
    const subjectName     = clientName.replace(/[\r\n]+/g, ' ').trim()

    // ── 4. Build and send the email ─────────────────────────────────────────
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
                ${firmHtml}
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
                      ${nameHtml}
                    </p>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:${c.text400};text-transform:uppercase;letter-spacing:0.06em;">
                      Email
                    </p>
                    <p style="margin:0;font-size:15px;color:${c.text700};">
                      <a href="mailto:${emailHtml}" style="color:${c.text700};text-decoration:none;">${emailHtml}</a>
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
        subject: `New survey completed — ${subjectName}`,
        html,
      }),
    })

    if (!res.ok) {
      console.error('notifyAdvisor: Resend error', res.status, await res.text())
    }
  } catch (err) {
    console.error('notifyAdvisor error:', err)
  }
}
