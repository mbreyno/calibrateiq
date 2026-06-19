import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service',
  description: 'The agreement that governs your use of CalibrateIQ.',
}

const EFFECTIVE_DATE = 'June 19, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-cream-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-forest-900">CalibrateIQ</Link>
          <Link href="/" className="text-sm text-forest-600 hover:text-forest-900">
            &larr; Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-xl border border-gold-500/40 bg-gold-100/40 px-4 py-3 text-sm text-forest-800">
          <span className="font-semibold">Draft pending legal review.</span>{' '}
          This is a starting point. Replace bracketed placeholders and have counsel review
          before publishing.
        </div>

        <h1 className="text-3xl font-bold text-forest-950 mb-2">Terms of Service</h1>
        <p className="text-sm text-forest-600 mb-10">Effective {EFFECTIVE_DATE}</p>

        <div className="space-y-8 text-forest-800 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">1. Agreement</h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) form an agreement between you and [Legal Entity Name]
              (&ldquo;CalibrateIQ,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;) governing your access to and use of the CalibrateIQ
              service (the &ldquo;Service&rdquo;). By creating an account or otherwise using the Service, you
              agree to these Terms and to our{' '}
              <Link href="/privacy" className="underline hover:text-forest-900">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">2. The Service</h2>
            <p>
              CalibrateIQ is software that financial advisors use to send risk-profile surveys to
              their clients, score risk capacity and risk preference, and generate Investment
              Policy Statements. We may update, improve, or change features of the Service at any
              time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">3. Accounts</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must be at least 18 years old and able to enter into a binding contract.</li>
              <li>You are responsible for the accuracy of the information in your account and for keeping your password secure.</li>
              <li>You are responsible for everything that happens under your account, including the activity of any sub-users you invite.</li>
              <li>Notify us promptly at{' '}
                <a href="mailto:support@calibrateiq.app" className="underline hover:text-forest-900">support@calibrateiq.app</a>{' '}
                if you believe your account has been compromised.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">4. Subscriptions and billing</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Some features require a paid subscription. Pricing and plan terms are shown in the Service before you subscribe.</li>
              <li>Free trials end automatically on the date shown at signup. After the trial, your subscription renews at the then-current rate unless you cancel.</li>
              <li>Subscriptions renew on a recurring basis until cancelled. You can cancel at any time from your billing settings; cancellation takes effect at the end of the current billing period.</li>
              <li>Payments are processed by Stripe. By providing payment information, you authorize us and Stripe to charge that payment method for the fees due.</li>
              <li>Except where required by law, fees are non-refundable.</li>
              <li>We may change pricing on renewal with at least 30 days&rsquo; notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">5. Client data and your responsibilities</h2>
            <p className="mb-3">
              When you use the Service to collect information from your clients, you are the
              controller of that information and we are a processor acting on your instructions.
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You have the right to collect the client information you submit to the Service.</li>
              <li>You will provide your clients with whatever notices and obtain whatever consents are required under applicable law for the collection and processing through the Service.</li>
              <li>You will not use the Service in a way that violates any law, contract, or third-party right.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">6. Acceptable use</h2>
            <p className="mb-3">You will not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Reverse engineer, decompile, or attempt to access the source code of the Service except as permitted by law.</li>
              <li>Use the Service to send spam, malware, or unlawful content.</li>
              <li>Interfere with the integrity, security, or performance of the Service.</li>
              <li>Use the Service to build a competing product, or scrape or harvest data from the Service.</li>
              <li>Share your account credentials or allow access by anyone other than an authorized sub-user.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">7. Intellectual property</h2>
            <p>
              CalibrateIQ retains all rights, title, and interest in the Service, including the
              software, design, content, and trademarks. You retain ownership of the data you and
              your clients submit. You grant us a worldwide, non-exclusive license to host,
              process, and display that data solely to provide the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">8. No investment, legal, or tax advice</h2>
            <p>
              CalibrateIQ is a software tool. The risk scores, categories, and Investment Policy
              Statements it generates are intended to help advisors document their own
              recommendations and are not investment, legal, tax, or other professional advice
              from CalibrateIQ. Advisors are solely responsible for the advice they provide to
              their clients.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">9. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
              WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
              THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">10. Limitation of liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, CALIBRATEIQ AND ITS AFFILIATES WILL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
              ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION
              WITH THE SERVICE. OUR AGGREGATE LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING
              TO THESE TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE FEES YOU PAID
              US IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) USD $100.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">11. Indemnification</h2>
            <p>
              You will indemnify and hold CalibrateIQ and its affiliates harmless from claims,
              losses, and expenses (including reasonable attorneys&rsquo; fees) arising out of your use
              of the Service, your client data, your violation of these Terms, or your violation
              of any law or third-party right.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">12. Suspension and termination</h2>
            <p>
              We may suspend or terminate your access to the Service if you breach these Terms,
              if required by law, or to protect the Service or other users. You may stop using
              the Service and cancel your subscription at any time. Sections that by their nature
              should survive termination will survive, including ownership, disclaimers,
              limitation of liability, indemnification, and governing law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">13. Governing law and disputes</h2>
            <p>
              These Terms are governed by the laws of [State], without regard to its conflict-of-laws
              rules. Any dispute will be resolved in the state or federal courts located in
              [County, State], and you and we consent to the personal jurisdiction of those courts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">14. Changes to these Terms</h2>
            <p>
              We may update these Terms from time to time. If we make material changes we will
              notify advisors by email or through the Service before the changes take effect. Your
              continued use of the Service after the effective date constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">15. Contact</h2>
            <p>
              Questions about these Terms? Email{' '}
              <a href="mailto:support@calibrateiq.app" className="underline hover:text-forest-900">support@calibrateiq.app</a>{' '}
              or write to [Legal Entity Name], [Mailing Address].
            </p>
          </section>
        </div>

        <footer className="mt-16 pt-6 border-t border-cream-200 text-sm text-forest-600 flex items-center justify-between">
          <Link href="/privacy" className="hover:text-forest-900">&larr; Privacy Policy</Link>
          <Link href="/" className="hover:text-forest-900">Back to home &rarr;</Link>
        </footer>
      </main>
    </div>
  )
}
