import Link from 'next/link'
import FAQList from './FAQList'

// ─── Icons (inline SVG for zero dependencies) ───────────────────────────────

function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#1b4332" />
      <path d="M8 28 L16 18 L22 23 L30 13" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="30" cy="13" r="3" fill="#d4a017"/>
      <path d="M8 32 L32 32" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-forest-700 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-100 text-gray-900">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-cream-100/90 backdrop-blur-sm border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="w-9 h-9" />
            <span className="text-xl font-bold text-forest-900 tracking-tight">CalibrateIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-forest-800">
            <a href="#features" className="hover:text-forest-900">Features</a>
            <a href="#how-it-works" className="hover:text-forest-900">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex text-sm font-medium text-forest-800 hover:text-forest-900 px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center text-sm font-semibold bg-forest-900 text-cream-100 px-5 py-2.5 rounded-lg hover:bg-forest-800 shadow-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-forest-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-forest-900/8 text-forest-800 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-forest-300/40">
            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
            Built exclusively for financial advisors
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-forest-900 leading-[1.08] tracking-tight mb-6">
            Simple Risk Profile{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-700 to-forest-500">
              &amp; IPS.
            </span>
          </h1>

          <p className="text-xl text-forest-800/80 max-w-2xl mx-auto leading-relaxed mb-10">
            Send branded risk assessment surveys to your clients, automatically score their
            Risk Capacity and Risk Preference, and generate a polished Investment Policy
            Statement — ready to review, annotate, and export as a PDF.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-forest-900 text-cream-100 text-base font-semibold px-8 py-4 rounded-xl hover:bg-forest-800 shadow-elevated"
            >
              Create your free account
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center text-base font-medium text-forest-800 px-8 py-4 rounded-xl border border-forest-300 hover:border-forest-500 hover:text-forest-900 bg-white/50"
            >
              See how it works
            </a>
          </div>

          <p className="text-sm text-forest-700/60 mt-5">
            Free for advisors · No credit card required
          </p>
        </div>

        {/* ── Dashboard mockup ──────────────────────────────────── */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="rounded-2xl bg-forest-900 shadow-elevated overflow-hidden border border-forest-800">
            {/* Window chrome */}
            <div className="bg-forest-950 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-forest-400 font-mono">app.calibrateiq.com/dashboard</span>
            </div>
            {/* Dashboard */}
            <div className="bg-cream-50 flex" style={{ height: 380 }}>
              {/* Sidebar */}
              <div className="w-52 bg-forest-900 p-4 flex flex-col gap-1 flex-shrink-0">
                <div className="flex items-center gap-2 mb-6">
                  <LogoMark className="w-7 h-7" />
                  <span className="text-xs font-bold text-cream-200">CalibrateIQ</span>
                </div>
                {[
                  { label: 'Dashboard', active: true },
                  { label: 'Surveys', active: false },
                  { label: 'Reports', active: false },
                  { label: 'Firm Settings', active: false },
                ].map(item => (
                  <div key={item.label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${item.active ? 'bg-forest-700 text-cream-100' : 'text-forest-300'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    {item.label}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs text-forest-600 font-medium mb-0.5">Wednesday, March 25</div>
                    <div className="text-base font-bold text-forest-900">Westbrook Wealth Management</div>
                  </div>
                  <div className="bg-forest-900 text-cream-100 text-xs font-semibold px-3 py-1.5 rounded-lg">Master link</div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['14','Total Surveys'],['9','Profiles Complete'],['5','Awaiting Response']].map(([n, l]) => (
                    <div key={l} className="bg-white rounded-xl p-3 border border-cream-300 shadow-card">
                      <div className="text-xl font-bold text-forest-900">{n}</div>
                      <div className="text-xs text-forest-600 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
                {/* Client rows */}
                <div className="bg-white rounded-xl border border-cream-300 shadow-card overflow-hidden">
                  <div className="px-4 py-2 border-b border-cream-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-forest-900">Recent Surveys</span>
                    <span className="text-xs text-forest-500">View all</span>
                  </div>
                  {[
                    ['Sarah Mitchell','Complete','#52b788'],
                    ['James &amp; Laura Thornton','Complete','#52b788'],
                    ['David Park','Pending','#d4a017'],
                    ['Carol Nguyen','Pending','#d4a017'],
                  ].map(([name, status, dot]) => (
                    <div key={name} className="flex items-center justify-between px-4 py-2 border-b border-cream-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-forest-200 flex items-center justify-center text-xs font-bold text-forest-800 flex-shrink-0">
                          {name[0]}
                        </div>
                        <span className="text-xs font-medium text-forest-900" dangerouslySetInnerHTML={{ __html: name }} />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${status === 'Complete' ? 'bg-forest-100 text-forest-800' : 'bg-gold-300/30 text-gold-700'}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-forest-900/10 rounded-full blur-xl" />
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────────────────── */}
      <section className="py-10 bg-forest-900/5 border-y border-forest-300/30">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-forest-700/70 mb-6 uppercase tracking-widest">
            Designed to align with industry best practices
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-forest-800/50 text-sm font-medium">
            {['FINRA-aligned process','Fiduciary-friendly workflow','Client-branded experience','Advisor-controlled data'].map(item => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckIcon />
                <span className="text-forest-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-forest-900 mb-4">
              Everything you need for thorough risk discovery
            </h2>
            <p className="text-lg text-forest-700/70 max-w-2xl mx-auto">
              From first contact to a signed Investment Policy Statement, CalibrateIQ
              guides you and your client through every step.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-cream-300 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-forest-100 flex items-center justify-center mb-4 text-2xl">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-forest-900 mb-2">{f.title}</h3>
                <p className="text-forest-700/70 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-forest-700/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-cream-100 mb-4">
              From signup to IPS in four steps
            </h2>
            <p className="text-lg text-forest-300 max-w-xl mx-auto">
              Your client gets a polished, branded experience. You get a
              compliant, exportable deliverable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-lg">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-cream-100 mb-1.5">{s.title}</h3>
                  <p className="text-forest-300 text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DUAL-SCORE SECTION ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 bg-forest-100 px-3 py-1 rounded-full mb-4">
              Risk Profiles
            </div>
            <h2 className="text-4xl font-bold text-forest-900 mb-5">
              Two scores. One clear picture.
            </h2>
            <p className="text-forest-700/70 leading-relaxed mb-6">
              CalibrateIQ separates <strong className="text-forest-900">Risk Capacity</strong> — a client&apos;s
              objective ability to absorb losses based on age, time horizon, and financial situation — from{' '}
              <strong className="text-forest-900">Risk Preference</strong> — their subjective emotional
              comfort with volatility. The final profile uses the more conservative of the two,
              keeping your recommendations defensible.
            </p>
            <ul className="space-y-3">
              {[
                '5 risk categories: Income through Aggressive Growth',
                'Separate capacity and preference scores, 0–100',
                'Household reports average both partners\' capacity scores',
                'Full audit trail of every client response',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-forest-800">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Accurate risk profile card mockup */}
          <div className="bg-white rounded-2xl border border-cream-300 shadow-elevated overflow-hidden">
            {/* Category banner — matches actual colored header */}
            <div className="p-5 text-white" style={{ backgroundColor: '#2d6a4f' }}>
              <div className="text-xs font-semibold opacity-75 mb-0.5">Overall Risk Category</div>
              <div className="text-2xl font-bold mb-1">Moderate Growth</div>
              <p className="text-xs opacity-80 leading-relaxed">
                A growth-oriented portfolio that accepts moderate short-term fluctuations in pursuit of solid long-term capital appreciation.
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Risk Capacity — primary gauge */}
              <div className="bg-white rounded-xl border-2 p-4" style={{ borderColor: '#1b4332' }}>
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1b4332' }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"/>
                  </svg>
                  Risk Capacity
                </div>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-3xl font-bold text-forest-900 leading-none">68</span>
                  <span className="text-xs text-forest-400 mb-0.5">/ 100</span>
                </div>
                <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '68%', backgroundColor: '#1b4332' }} />
                </div>
              </div>

              {/* Risk Preference — secondary gauge */}
              <div className="bg-cream-50 rounded-xl border p-4" style={{ borderColor: '#e8e0cc' }}>
                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7d6a' }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
                  </svg>
                  Risk Preference
                </div>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-2xl font-bold text-forest-600 leading-none">75</span>
                  <span className="text-xs text-forest-400 mb-0.5">/ 100</span>
                </div>
                <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '75%', backgroundColor: '#74c69d' }} />
                </div>
              </div>

              <p className="text-xs text-forest-500 text-center">
                Final category uses the more conservative of the two scores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── REPORTS SECTION ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-cream-200/60">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">

          {/* Report mockup */}
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden border border-cream-300 shadow-elevated">
            {/* Report header */}
            <div className="bg-white px-5 py-4 border-b border-cream-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-forest-600 font-medium mb-0.5">Household Report</div>
                <div className="text-sm font-bold text-forest-900">James &amp; Laura Thornton</div>
              </div>
              <div className="flex gap-2">
                <div className="bg-forest-900 text-cream-100 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" opacity="0.9"/>
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                    <text x="5" y="19.5" fontSize="5.5" fontWeight="900" fill="#1b4332" fontFamily="Arial, sans-serif" letterSpacing="0.5">PDF</text>
                  </svg>
                  Export PDF
                </div>
              </div>
            </div>

            {/* Combined category */}
            <div className="p-4 text-white text-sm" style={{ backgroundColor: '#2d6a4f' }}>
              <div className="text-xs opacity-75 mb-0.5">Combined Household Category</div>
              <div className="text-lg font-bold">Moderate Growth</div>
              <div className="text-xs opacity-70 mt-1">Determined by averaging both members&apos; Risk Capacity scores.</div>
            </div>

            {/* Side-by-side member cards */}
            <div className="bg-cream-50 p-4 grid grid-cols-2 gap-3">
              {[
                { name: 'James T.', capacity: 68, preference: 75, cat: 'Moderate Growth', color: '#2d6a4f' },
                { name: 'Laura T.', capacity: 55, preference: 60, cat: 'Conservative Growth', color: '#52b788' },
              ].map(m => (
                <div key={m.name} className="bg-white rounded-xl border border-cream-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-forest-900">{m.name}</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: m.color, fontSize: 9 }}>
                      {m.cat}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-forest-600">Capacity</span>
                        <span className="font-semibold text-forest-900">{m.capacity}</span>
                      </div>
                      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.capacity}%`, backgroundColor: '#1b4332' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-forest-600">Preference</span>
                        <span className="font-semibold text-forest-900">{m.preference}</span>
                      </div>
                      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.preference}%`, backgroundColor: '#74c69d' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Advisor notes preview */}
            <div className="bg-white border-t border-cream-200 p-4">
              <div className="text-xs font-semibold text-forest-900 mb-1.5">Advisor Notes</div>
              <p className="text-xs text-forest-600 leading-relaxed">
                James retires in 8 years; Laura continues working for 12. Prioritizing growth while maintaining capacity to weather short-term drawdowns...
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 bg-forest-100 px-3 py-1 rounded-full mb-4">
              IPS &amp; Reports
            </div>
            <h2 className="text-4xl font-bold text-forest-900 mb-5">
              A complete IPS, generated instantly.
            </h2>
            <p className="text-forest-700/70 leading-relaxed mb-6">
              Once your client completes their survey, CalibrateIQ generates a full Investment
              Policy Statement with their risk profile, scores, and all survey responses. Add your
              own advisor notes, then export a branded, print-ready PDF in one click.
              Couple and household reports show side-by-side profiles for joint accounts.
            </p>
            <ul className="space-y-3">
              {[
                'Individual and joint household reports',
                'Advisor notes field on every report',
                'Investor Understanding & Acceptance section built in',
                'Portfolio Category Legend with all 5 risk categories',
                'Full survey Q&A printed with the report',
                'Your firm logo and name on every exported PDF',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-forest-800">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── SURVEY EXPERIENCE ────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 bg-forest-100 px-3 py-1 rounded-full mb-4">
              Client Experience
            </div>
            <h2 className="text-4xl font-bold text-forest-900 mb-5">
              A survey your clients will actually complete.
            </h2>
            <p className="text-forest-700/70 leading-relaxed mb-6">
              Share a unique link for each client — or use your master link to collect surveys
              from multiple clients at once. The survey is clean, mobile-friendly, and branded
              with your firm logo and name. No client account needed, ever.
            </p>
            <ul className="space-y-3">
              {[
                'Unique per-client links, or a single master survey link',
                'No login or account required for clients',
                'Mobile-friendly, fully branded to your firm',
                'Only 8 focused questions — takes under 5 minutes',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-forest-800">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Survey mockup — two stacked question previews */}
          <div className="space-y-3">

            {/* Question 2 — Risk Capacity */}
            <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
              <div className="bg-white border-b border-cream-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-forest-900 flex items-center justify-center flex-shrink-0">
                    <LogoMark className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-forest-900 leading-tight">Westbrook Wealth Management</div>
                    <div className="text-xs text-forest-500">Investment Profile Questionnaire</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-forest-500">2 of 8</span>
                  <div className="w-16 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-forest-700 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#1b4332' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#1b4332' }} />
                  Risk Capacity
                </div>
                <p className="text-sm font-semibold text-forest-900 mb-3 leading-snug">
                  When do you expect to start drawing income from your investments?
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Not for at least 20 years', selected: false },
                    { label: 'In 11 to 19 years', selected: true },
                    { label: 'In 6 to 10 years', selected: false },
                    { label: 'In 1 to 5 years', selected: false },
                    { label: 'Within 1 year', selected: false },
                  ].map(opt => (
                    <div key={opt.label} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs cursor-pointer ${opt.selected ? 'border-forest-700 bg-forest-50 font-semibold text-forest-900' : 'border-cream-200 bg-cream-50 text-forest-700'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${opt.selected ? 'border-forest-700 bg-forest-700' : 'border-cream-400'}`}>
                        {opt.selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question 6 — Risk Preference */}
            <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#52b788' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#52b788' }} />
                    Risk Preference
                  </div>
                  <span className="text-xs text-forest-400">6 of 8</span>
                </div>
                <p className="text-sm font-semibold text-forest-900 mb-3 leading-snug">
                  Which best describes your attitudes about this investment&apos;s performance over the next three years?
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: 'I understand a loss of principal is a realistic possibility', selected: false },
                    { label: 'I can tolerate a loss', selected: false },
                    { label: 'I can tolerate a small loss', selected: true },
                    { label: "I'd have a hard time tolerating any losses", selected: false },
                    { label: 'I need to at least see some return', selected: false },
                  ].map(opt => (
                    <div key={opt.label} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs cursor-pointer ${opt.selected ? 'border-forest-600 bg-forest-50 font-semibold text-forest-900' : 'border-cream-200 bg-cream-50 text-forest-700'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${opt.selected ? 'border-forest-600 bg-forest-600' : 'border-cream-400'}`}>
                        {opt.selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-cream-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 bg-forest-100 px-3 py-1 rounded-full mb-4">
              FAQ
            </div>
            <h2 className="text-4xl font-bold text-forest-900">Frequently asked questions</h2>
          </div>
          <FAQList />
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-forest-700/50 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-cream-100 mb-4">
            Ready to know your clients&apos; risk profile?
          </h2>
          <p className="text-forest-300 mb-8 text-lg">
            Create your free account and send your first survey in under five minutes.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-gold-500 text-forest-950 text-base font-bold px-8 py-4 rounded-xl hover:bg-gold-400 shadow-elevated"
          >
            Start for free — no credit card needed
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-forest-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark className="w-7 h-7" />
            <span className="font-bold text-cream-200 text-sm">CalibrateIQ</span>
          </div>
          <p className="text-xs text-forest-500">
            © {new Date().getFullYear()} CalibrateIQ. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-forest-500">
            <a href="#" className="hover:text-forest-300">Privacy</a>
            <a href="#" className="hover:text-forest-300">Terms</a>
            <a href="mailto:support@calibrateiq.app" className="hover:text-forest-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🔗',
    title: 'Per-client & master survey links',
    description:
      'Generate a unique link for each client, or share your master link to collect surveys from multiple clients at once. No client account needed.',
  },
  {
    icon: '🎨',
    title: 'Your brand, front and center',
    description:
      'Upload your firm logo and name in Firm Settings. Your branding appears on every survey your clients see and on every PDF you export.',
  },
  {
    icon: '⚖️',
    title: 'Dual-score risk profiling',
    description:
      'Risk Capacity (objective ability to absorb losses) and Risk Preference (emotional comfort with volatility) are scored separately, 0–100 each.',
  },
  {
    icon: '👥',
    title: 'Individual & household reports',
    description:
      'Create single-client reports or combine two clients into a joint household report. Combined category is based on the average of both members\' Risk Capacity scores.',
  },
  {
    icon: '📝',
    title: 'Advisor notes on every report',
    description:
      'Add your own notes to each report — context about goals, special circumstances, or anything relevant. Notes are saved and included in the exported PDF.',
  },
  {
    icon: '📄',
    title: 'Branded PDF export',
    description:
      'Export any report as a print-ready PDF with your firm logo, name, and all survey responses included. Three clean pages, professionally formatted.',
  },
]

const STEPS = [
  {
    title: 'Set up your firm profile',
    description:
      'Add your firm name and logo in Firm Settings. Your branding will appear on every survey and IPS you generate.',
  },
  {
    title: 'Share your master survey link',
    description:
      'CalibrateIQ gives you one link to share with any client. Send it by email, text, or however you communicate — no setup needed for each client.',
  },
  {
    title: 'Client completes the survey',
    description:
      'Your client answers 7 questions at their own pace on any device. No account required. The experience is clean, mobile-friendly, and shows your firm branding.',
  },
  {
    title: 'Review the report and export the IPS',
    description:
      'Once submitted, view the full risk profile. Create a report, add advisor notes, and export a branded, three-page PDF with the full IPS and survey Q&A.',
  },
]
