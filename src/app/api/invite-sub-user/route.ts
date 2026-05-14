import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://calibrateiq.app'

// Sub-user limits per plan
const PLAN_LIMITS: Record<string, number> = {
  solo: 0,
  team: 9,
  plus: 24,
}

// ── Color helpers (same pattern as notify-advisor) ────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
}
function tint(hex: string, t: number): string {
  const [r,g,b] = hexToRgb(hex)
  const mix = (c: number) => Math.round(c + (255-c)*t).toString(16).padStart(2,'0')
  return `#${mix(r)}${mix(g)}${mix(b)}`
}

function buildInviteEmail(firmName: string, inviteUrl: string, colors: {
  primary: string; accent: string; surface: string; textBase: string
}) {
  const c = {
    primary:    colors.primary,
    accent:     colors.accent,
    text900:    colors.textBase,
    text700:    tint(colors.textBase, 0.26),
    text500:    tint(colors.primary, 0.54),
    text400:    tint(colors.primary, 0.65),
    divider:    tint(colors.primary, 0.88),
    accentBg:   tint(colors.accent,  0.88),
    accentText: tint(colors.accent,  -0.1),
    footerBg:   tint(colors.surface, 0.30),
    pageBg:     tint(colors.surface, 0.50),
  }

  const safeFirm = firmName.replace(/[<>"\\]/g, '').trim() || 'Your team'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>You're invited to join ${safeFirm} on CalibrateIQ</title>
</head>
<body style="margin:0;padding:0;background:${c.pageBg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${c.text900};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${c.pageBg};padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

          <!-- Header -->
          <tr>
            <td style="background:${c.primary};border-radius:14px 14px 0 0;padding:32px 36px 28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:14px;">
                    <!-- Logo mark -->
                    <div style="width:40px;height:40px;background:#ffffff;border-radius:10px;display:inline-block;text-align:center;line-height:40px;">
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="10" fill="${c.primary}"/>
                        <path d="M8 28 L16 18 L22 23 L30 13" stroke="${c.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="30" cy="13" r="3" fill="${c.accent}"/>
                        <path d="M8 32 L32 32" stroke="#52b788" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
                      </svg>
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">CalibrateIQ</p>
                    <p style="margin:2px 0 0;font-size:12px;color:rgba(255,255,255,0.6);letter-spacing:0.02em;">Advisor Portal</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 36px 32px;">

              <!-- Greeting -->
              <p style="margin:0 0 6px;font-size:24px;font-weight:700;color:${c.text900};letter-spacing:-0.4px;">
                You're invited! 🎉
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:${c.text500};line-height:1.6;">
                <strong style="color:${c.text700};">${safeFirm}</strong> has invited you to join their team on CalibrateIQ — the risk profiling platform built for financial advisors.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid ${c.divider};margin:0 0 28px;"/>

              <!-- What is CalibrateIQ -->
              <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:${c.text400};text-transform:uppercase;letter-spacing:0.08em;">
                What you'll get access to
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:22px;vertical-align:top;padding-top:1px;">
                        <span style="display:inline-block;width:16px;height:16px;background:${c.accentBg};border-radius:50%;text-align:center;line-height:16px;font-size:10px;color:${c.accentText};font-weight:700;">✓</span>
                      </td>
                      <td style="font-size:14px;color:${c.text700};line-height:1.5;">Send clients a shareable risk questionnaire link</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:22px;vertical-align:top;padding-top:1px;">
                        <span style="display:inline-block;width:16px;height:16px;background:${c.accentBg};border-radius:50%;text-align:center;line-height:16px;font-size:10px;color:${c.accentText};font-weight:700;">✓</span>
                      </td>
                      <td style="font-size:14px;color:${c.text700};line-height:1.5;">Dual-score risk profiling — capacity <em>and</em> tolerance</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:22px;vertical-align:top;padding-top:1px;">
                        <span style="display:inline-block;width:16px;height:16px;background:${c.accentBg};border-radius:50%;text-align:center;line-height:16px;font-size:10px;color:${c.accentText};font-weight:700;">✓</span>
                      </td>
                      <td style="font-size:14px;color:${c.text700};line-height:1.5;">Auto-generated Investment Policy Statements with your firm's branding</td>
                    </tr></table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td align="center" style="background:${c.primary};border-radius:10px;">
                    <a href="${inviteUrl}"
                       style="display:block;padding:16px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">
                      Accept invitation →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry note -->
              <p style="margin:0;font-size:12px;color:${c.text400};text-align:center;line-height:1.6;">
                This invitation link expires in 24 hours.<br/>
                If you weren't expecting this, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${c.footerBg};border-radius:0 0 14px 14px;padding:18px 36px;">
              <p style="margin:0;font-size:12px;color:${c.text400};text-align:center;line-height:1.6;">
                Sent by <strong>CalibrateIQ</strong> on behalf of ${safeFirm}<br/>
                <a href="${APP_URL}" style="color:${c.text400};">calibrateiq.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json().catch(() => ({}))
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Load admin's advisor row (including branding for the email)
  const { data: advisor } = await admin
    .from('advisors')
    .select('id, plan, firm_name, parent_advisor_id, subscription_status, brand_color, brand_accent, brand_surface, brand_text')
    .eq('user_id', user.id)
    .single()

  if (!advisor) return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
  if (advisor.parent_advisor_id) {
    return NextResponse.json({ error: 'Sub-users cannot invite team members.' }, { status: 403 })
  }
  if (advisor.subscription_status !== 'active') {
    return NextResponse.json({ error: 'An active subscription is required to invite team members.' }, { status: 403 })
  }

  const plan = advisor.plan ?? 'solo'
  const limit = PLAN_LIMITS[plan] ?? 0

  if (limit === 0) {
    return NextResponse.json({
      error: 'Your current plan (Solo) does not support team members. Upgrade to Team or Plus to invite sub-users.',
    }, { status: 403 })
  }

  // Count existing sub-users
  const { count } = await admin
    .from('advisors')
    .select('id', { count: 'exact', head: true })
    .eq('parent_advisor_id', advisor.id)

  if ((count ?? 0) >= limit) {
    return NextResponse.json({
      error: `You've reached the maximum of ${limit} sub-user${limit === 1 ? '' : 's'} for your plan.`,
    }, { status: 403 })
  }

  // Generate invite link server-side (does NOT send Supabase's default email)
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      data: {
        parent_advisor_id: advisor.id,
        role: 'sub_user',
      },
      redirectTo: `${APP_URL}/auth/callback`,
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    const msg = linkError?.message?.includes('already registered')
      ? 'That email address already has a CalibrateIQ account.'
      : (linkError?.message ?? 'Failed to generate invite link.')
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const inviteUrl = linkData.properties.action_link

  // Send branded email via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — invite link generated but email not sent:', inviteUrl)
    return NextResponse.json({ success: true })
  }

  const firmName   = advisor.firm_name || 'Your team'
  const fromEmail  = process.env.NOTIFY_FROM_EMAIL || 'onboarding@resend.dev'
  const safeFirm   = firmName.replace(/[<>"\\]/g, '').trim()

  const html = buildInviteEmail(firmName, inviteUrl, {
    primary:  advisor.brand_color   || '#1b4332',
    accent:   advisor.brand_accent  || '#d4a017',
    surface:  advisor.brand_surface || '#fefae0',
    textBase: advisor.brand_text    || advisor.brand_color || '#1b4332',
  })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${safeFirm} via CalibrateIQ <${fromEmail}>`,
      to: [email],
      subject: `You've been invited to join ${safeFirm} on CalibrateIQ`,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Resend error:', res.status, body)
    return NextResponse.json({ error: 'Invite created but failed to send email.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
