import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CalibrateIQ — Risk Profiling & IPS for Financial Advisors'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1b4332',
          padding: '72px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(82,183,136,0.25) 0%, transparent 70%)',
          }}
        />
        {/* Background glow bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          {/* Logo mark SVG */}
          <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#2d6a4f" />
            <path d="M8 28 L16 18 L22 23 L30 13" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="30" cy="13" r="3" fill="#d4a017"/>
            <path d="M8 32 L32 32" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          </svg>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#fefae0', letterSpacing: '-0.5px' }}>
            CalibrateIQ
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#fefae0',
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            marginBottom: 28,
            maxWidth: 820,
          }}
        >
          Simple Risk Profile{' '}
          <span style={{ color: '#52b788' }}>&amp; IPS.</span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 24,
            color: '#95d5b2',
            lineHeight: 1.5,
            maxWidth: 680,
            marginBottom: 'auto',
          }}
        >
          Branded client surveys · Dual-score risk profiles · Instant IPS generation · PDF export
        </div>

        {/* Bottom row: score cards */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          {/* Risk Capacity card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: '20px 24px',
              minWidth: 200,
            }}
          >
            <span style={{ fontSize: 11, color: '#95d5b2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
              Risk Capacity
            </span>
            <span style={{ fontSize: 48, fontWeight: 800, color: '#fefae0', lineHeight: 1 }}>68</span>
            <span style={{ fontSize: 13, color: '#74c69d', marginTop: 4 }}>/ 100</span>
            {/* Bar */}
            <div style={{ marginTop: 12, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
              <div style={{ width: '68%', height: '100%', backgroundColor: '#52b788', borderRadius: 99 }} />
            </div>
          </div>

          {/* Risk Preference card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: '20px 24px',
              minWidth: 200,
            }}
          >
            <span style={{ fontSize: 11, color: '#95d5b2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
              Risk Preference
            </span>
            <span style={{ fontSize: 48, fontWeight: 800, color: '#fefae0', lineHeight: 1 }}>75</span>
            <span style={{ fontSize: 13, color: '#74c69d', marginTop: 4 }}>/ 100</span>
            <div style={{ marginTop: 12, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
              <div style={{ width: '75%', height: '100%', backgroundColor: '#74c69d', borderRadius: 99 }} />
            </div>
          </div>

          {/* Category badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#2d6a4f',
              border: '1px solid rgba(82,183,136,0.3)',
              borderRadius: 16,
              padding: '20px 24px',
            }}
          >
            <span style={{ fontSize: 11, color: '#95d5b2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
              Category
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fefae0', lineHeight: 1.1 }}>
              Moderate{'\n'}Growth
            </span>
          </div>

          {/* CTA pill — right-aligned */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                backgroundColor: '#d4a017',
                color: '#1b4332',
                fontSize: 18,
                fontWeight: 800,
                padding: '16px 32px',
                borderRadius: 14,
              }}
            >
              Free for advisors →
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
