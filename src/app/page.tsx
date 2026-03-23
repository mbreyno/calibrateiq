import Link from 'next/link'

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
    <svg className="w-5 h-5 text-forest-700" viewBox="0 0 20 20" fill="currentColor">
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
            <a href="#pricing" className="hover:text-forest-900">Pricing</a>
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
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-forest-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-forest-900/8 text-forest-800 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-forest-300/40">
            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
            Built exclusively for financial advisors
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-forest-900 leading-[1.08] tracking-tight mb-6">
            Investment Profiles{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-700 to-forest-500">
              Made Simple.
            </span>
          </h1>

          <p className="text-xl text-forest-800/80 max-w-2xl mx-auto leading-relaxed mb-10">
            CalibrateIQ sends branded risk tolerance questionnaires to your clients,
            builds precise risk profiles, and auto-generates professional Investment
            Policy Statements — ready to review and export in minutes.
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
            Free forever for advisors · No credit card required
          </p>
        </div>

        {/* ── App preview mockup ────────────────── */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="rounded-2xl bg-forest-900 shadow-elevated overflow-hidden border border-forest-800">
            {/* Window chrome */}
            <div className="bg-forest-950 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-forest-400 font-mono">app.calibrateiq.com/dashboard</span>
            </div>
            {/* Dashboard mockup */}
            <div className="bg-cream-50 flex" style={{ height: 360 }}>
              {/* Sidebar */}
              <div className="w-56 bg-forest-900 p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-6">
                  <LogoMark className="w-7 h-7" />
                  <span className="text-xs font-bold text-cream-200">CalibrateIQ</span>
                </div>
                {['Dashboard','Clients','Settings'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${i === 0 ? 'bg-forest-700 text-cream-100' : 'text-forest-300 hover:text-cream-200'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div className="flex-1 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs text-forest-700 font-medium mb-0.5">Good morning</div>
                    <div className="text-lg font-bold text-forest-900">Westbrook Wealth Mgmt.</div>
                  </div>
                  <div className="bg-forest-900 text-cream-100 text-xs font-semibold px-4 py-2 rounded-lg">+ Add Client</div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[['12','Total Clients'],['8','Profiles Complete'],['4','Awaiting Response']].map(([n, l]) => (
                    <div key={l} className="bg-white rounded-xl p-3 border border-cream-300 shadow-card">
                      <div className="text-2xl font-bold text-forest-900">{n}</div>
                      <div className="text-xs text-forest-700/70 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
                {/* Client rows */}
                <div className="bg-white rounded-xl border border-cream-300 shadow-card overflow-hidden">
                  {[
                    ['Sarah Mitchell','Moderate','Complete'],
                    ['James Thornton','Aggressive','Complete'],
                    ['Linda Park','Pending questionnaire','Pending'],
                  ].map(([name, cat, status]) => (
                    <div key={name} className="flex items-center justify-between px-4 py-2.5 border-b border-cream-200 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-forest-200 flex items-center justify-center text-xs font-bold text-forest-800">
                          {name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-forest-900">{name}</div>
                          <div className="text-xs text-forest-600">{cat}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status === 'Complete' ? 'bg-forest-100 text-forest-800' : 'bg-gold-300/30 text-gold-700'}`}>
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
              From zero to IPS in four steps
            </h2>
            <p className="text-lg text-forest-300 max-w-xl mx-auto">
              Your client gets a polished, personalized experience. You get a
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

      {/* ── RISK PROFILE PREVIEW ────────────────────────────────────────── */}
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
              CalibrateIQ separates <strong className="text-forest-900">Risk Capacity</strong> — a client's
              objective ability to absorb losses based on age and time horizon — from{' '}
              <strong className="text-forest-900">Risk Tolerance</strong> — their subjective emotional
              comfort with volatility. The final profile always uses the more conservative of the
              two, keeping your recommendations defensible.
            </p>
            <ul className="space-y-3">
              {['5 risk categories from Conservative to Aggressive','Asset allocation targets for every profile','Automatic IPS generation from profile data','Full audit trail of client responses'].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-forest-800">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Profile card mockup */}
          <div className="bg-white rounded-2xl border border-cream-300 shadow-elevated p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs font-medium text-forest-600 mb-0.5">Risk Profile</div>
                <div className="text-xl font-bold text-forest-900">Sarah Mitchell</div>
              </div>
              <span className="bg-gold-400/20 text-gold-700 text-sm font-bold px-3 py-1 rounded-full border border-gold-400/30">
                Moderate
              </span>
            </div>

            <div className="space-y-4 mb-5">
              <ScoreBar label="Risk Capacity" score={65} color="#1b4332" />
              <ScoreBar label="Risk Tolerance" score={72} color="#2d6a4f" />
            </div>

            <div className="bg-cream-100 rounded-xl p-4 text-sm text-forest-700 leading-relaxed border border-cream-200 mb-5">
              A balanced approach to growth and stability. The portfolio holds a meaningful mix of
              equities and fixed income, accepting moderate volatility for solid long-term returns.
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[['60%','Equities'],['33%','Fixed Income'],['5%','Alt.'],['2%','Cash']].map(([val, lbl]) => (
                <div key={lbl} className="text-center bg-forest-50 rounded-xl p-2.5">
                  <div className="text-base font-bold text-forest-900">{val}</div>
                  <div className="text-xs text-forest-600 mt-0.5">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── IPS PREVIEW ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-cream-200/60">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          {/* IPS doc mockup */}
          <div className="order-2 lg:order-1 bg-white rounded-2xl border border-cream-300 shadow-elevated p-6 font-serif">
            <div className="text-center mb-5 pb-4 border-b border-cream-200">
              <div className="text-xs font-sans font-semibold text-forest-600 uppercase tracking-widest mb-1">Investment Policy Statement</div>
              <div className="text-lg font-bold text-forest-900">Sarah Mitchell</div>
              <div className="text-xs text-forest-600 font-sans mt-0.5">Prepared by Westbrook Wealth Management · {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
            <div className="space-y-3 text-sm text-forest-800 leading-relaxed">
              <div>
                <div className="font-sans text-xs font-bold text-forest-600 uppercase tracking-wider mb-1">Investment Objectives</div>
                <p className="text-xs text-forest-700">The primary investment objective for Sarah Mitchell is consistent with a Moderate risk profile. A balanced approach to growth and stability, accepting moderate volatility for solid long-term returns...</p>
              </div>
              <div>
                <div className="font-sans text-xs font-bold text-forest-600 uppercase tracking-wider mb-1">Asset Allocation</div>
                <p className="text-xs text-forest-700">Equities 60% · Fixed Income 33% · Alternatives 5% · Cash 2%</p>
              </div>
              <div>
                <div className="font-sans text-xs font-bold text-forest-600 uppercase tracking-wider mb-1">Investment Guidelines</div>
                <p className="text-xs text-forest-700">The portfolio should be reviewed at least annually and rebalanced when any asset class drifts more than 5% from target...</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <div className="flex-1 bg-forest-900 text-cream-100 text-xs font-sans font-semibold text-center py-2 rounded-lg">Export PDF</div>
              <div className="flex-1 border border-forest-300 text-forest-800 text-xs font-sans font-medium text-center py-2 rounded-lg">Edit</div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 bg-forest-100 px-3 py-1 rounded-full mb-4">
              IPS Generation
            </div>
            <h2 className="text-4xl font-bold text-forest-900 mb-5">
              A complete IPS, drafted in seconds.
            </h2>
            <p className="text-forest-700/70 leading-relaxed mb-6">
              Once a client completes their questionnaire, CalibrateIQ generates a full Investment
              Policy Statement pre-populated with their objectives, risk profile, and recommended
              asset allocation. You can edit any section before exporting a beautiful, branded PDF
              for your client's file.
            </p>
            <ul className="space-y-3">
              {['Auto-populated from risk profile data','All sections fully editable by the advisor','Export to print-ready PDF in one click','Your firm logo and branding on every document'].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-forest-800">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-forest-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-forest-700/70 mb-12">Start free. Upgrade when you're ready.</p>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-7">
              <div className="text-xs font-bold uppercase tracking-widest text-forest-600 mb-3">Starter</div>
              <div className="text-4xl font-bold text-forest-900 mb-1">Free</div>
              <div className="text-sm text-forest-600 mb-6">Forever, for individual advisors</div>
              <ul className="space-y-2.5 mb-7">
                {['Unlimited client questionnaires','Risk profile generation','IPS auto-generation','PDF export','Firm branding (logo + name)'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-forest-800">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block text-center bg-forest-900 text-cream-100 font-semibold text-sm py-3 rounded-xl hover:bg-forest-800">
                Get started free
              </Link>
            </div>
            {/* Pro coming soon */}
            <div className="bg-forest-900 rounded-2xl border border-forest-700 shadow-elevated p-7 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-gold-500/20 text-gold-400 text-xs font-bold px-2.5 py-1 rounded-full border border-gold-500/30">
                Coming soon
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-forest-400 mb-3">Pro</div>
              <div className="text-4xl font-bold text-cream-100 mb-1">$29<span className="text-xl font-medium text-forest-400">/mo</span></div>
              <div className="text-sm text-forest-400 mb-6">For growing advisory teams</div>
              <ul className="space-y-2.5 mb-7">
                {['Everything in Starter','Multi-advisor team access','Email questionnaire delivery','Client portal & history','Priority support','CRM integration (coming)'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-forest-300">
                    <svg className="w-5 h-5 text-gold-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full text-center bg-white/10 text-forest-300 font-semibold text-sm py-3 rounded-xl cursor-not-allowed">
                Notify me
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-forest-700/50 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-cream-100 mb-4">
            Ready to get to know your clients better?
          </h2>
          <p className="text-forest-300 mb-8 text-lg">
            Create your free account and send your first questionnaire in under five minutes.
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
            <a href="mailto:support@calibrateiq.com" className="hover:text-forest-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-forest-700 mb-1.5">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🔗',
    title: 'Shareable questionnaire links',
    description:
      'Generate a unique, secure link for each client. No account needed on their end — just click and answer.',
  },
  {
    icon: '🎨',
    title: 'Your brand, front and center',
    description:
      'Upload your firm logo and name. Every questionnaire and IPS your clients see carries your identity.',
  },
  {
    icon: '⚖️',
    title: 'Dual-score risk profiling',
    description:
      'Separate Risk Capacity from Risk Tolerance scores ensure your recommendations align with both financial reality and client psychology.',
  },
  {
    icon: '📄',
    title: 'Auto-generated IPS drafts',
    description:
      'Investment Policy Statements are created automatically from each client\'s risk profile — fully editable before you export.',
  },
  {
    icon: '📊',
    title: 'Asset allocation targets',
    description:
      'Each risk category maps to a recommended asset allocation. Adjust to fit your investment philosophy.',
  },
  {
    icon: '🔒',
    title: 'Secure and compliant',
    description:
      'All client data is stored securely. Responses are tied to your account only, never shared.',
  },
]

const STEPS = [
  {
    title: 'Set up your firm profile',
    description:
      'Add your firm name and upload your logo. Your branding will appear on every questionnaire and IPS you send.',
  },
  {
    title: 'Add a client and copy their link',
    description:
      'Enter the client\'s name and email. CalibrateIQ generates a unique questionnaire link you can share by email, text, or any channel you choose.',
  },
  {
    title: 'Client completes the questionnaire',
    description:
      'Your client answers 8 questions at their own pace. No account required. The experience is clean, mobile-friendly, and branded to your firm.',
  },
  {
    title: 'Review the profile and export the IPS',
    description:
      'Once submitted, view the full risk profile breakdown. Generate the IPS, make any edits, and export a beautiful, print-ready PDF for your client file.',
  },
]
