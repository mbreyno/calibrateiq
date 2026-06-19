import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How CalibrateIQ collects, uses, and protects information from advisors and their clients.',
}

const EFFECTIVE_DATE = 'June 19, 2026'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-forest-950 mb-2">Privacy Policy</h1>
        <p className="text-sm text-forest-600 mb-10">Effective {EFFECTIVE_DATE}</p>

        <div className="space-y-8 text-forest-800 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">1. Who we are</h2>
            <p>
              CalibrateIQ (&ldquo;CalibrateIQ,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;) is operated by Michael Reynolds LLC,
              based in Indiana, United States. CalibrateIQ provides software that financial advisors use
              to send risk-profile surveys to their clients and generate Investment Policy
              Statements. This policy explains how we collect, use, and share information through
              the CalibrateIQ service (the &ldquo;Service&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">2. Information we collect</h2>
            <p className="mb-3"><strong>From advisors who create accounts:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Account details: name, email address, password (stored hashed).</li>
              <li>Firm details you choose to add: firm name, logo, brand color, contact information.</li>
              <li>Billing information processed by our payment provider (see &ldquo;Subprocessors&rdquo; below).</li>
              <li>Usage data: pages visited, actions taken, IP address, browser, and device information.</li>
            </ul>
            <p className="mb-3"><strong>From end clients (the people advisors invite to take a survey):</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Identifiers the advisor provides: name, email, date of birth.</li>
              <li>Survey responses to questions about risk tolerance, time horizon, and investment preferences.</li>
              <li>Any free-text comments the client adds.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">3. How we use information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide the Service: store survey responses, calculate risk scores, generate IPS documents, and display results to the advisor who collected them.</li>
              <li>To operate accounts and process subscription billing.</li>
              <li>To communicate with advisors about their account, security, and service updates.</li>
              <li>To improve, secure, and troubleshoot the Service.</li>
              <li>To comply with applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">4. Roles for client data</h2>
            <p>
              Where an advisor (or their firm) invites an end client to complete a survey, the
              advisor determines what data is collected and how it is used. In those cases the
              advisor or firm acts as the controller of that data and CalibrateIQ processes it on
              their behalf. End clients should direct privacy requests about their data to their
              advisor in the first instance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">5. How we share information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>With the advisor (and any sub-users that advisor has invited) who owns the client record.</li>
              <li>With our subprocessors, who help us run the Service under written contracts.</li>
              <li>To comply with legal process, protect rights, or respond to security incidents.</li>
              <li>In connection with a merger, acquisition, or sale of assets, subject to this policy continuing to apply.</li>
            </ul>
            <p className="mt-3">We do not sell personal information and we do not share it for cross-context behavioral advertising.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">6. Subprocessors</h2>
            <p className="mb-3">We rely on the following service providers to run the Service:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> &mdash; database, authentication, and file storage.</li>
              <li><strong>Stripe</strong> &mdash; subscription billing and payment processing.</li>
              <li><strong>Netlify</strong> &mdash; web hosting and content delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">7. Data retention</h2>
            <p>
              We retain information for as long as the advisor&rsquo;s account is active and for a
              reasonable period afterwards to support business, legal, and audit requirements.
              Advisors can delete client records from their dashboard at any time, which removes
              the underlying client data from our active systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">8. Security</h2>
            <p>
              We use industry-standard measures to protect information, including encryption in
              transit, encrypted storage, role-based access controls, and row-level database
              security. No system is perfectly secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">9. Your rights</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, delete, or
              export your personal information, and to object to or restrict certain uses. To
              exercise these rights, email{' '}
              <a href="mailto:support@calibrateiq.app" className="underline hover:text-forest-900">support@calibrateiq.app</a>.
              If you are an end client and your data was provided by your advisor, please contact
              your advisor first.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">10. Children</h2>
            <p>
              The Service is not directed to children under 13, and we do not knowingly collect
              personal information from them. If you believe a child has provided us information,
              contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">11. International users</h2>
            <p>
              CalibrateIQ is operated from the United States. If you access the Service from
              outside the United States, your information will be transferred to and processed in
              the United States, which may have different data-protection rules than your country.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">12. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. If we make material changes, we will
              notify advisors by email or through the Service before the changes take effect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-forest-950 mb-2">13. Contact</h2>
            <p>
              Questions about this policy? Email{' '}
              <a href="mailto:support@calibrateiq.app" className="underline hover:text-forest-900">support@calibrateiq.app</a>.
            </p>
          </section>
        </div>

        <footer className="mt-16 pt-6 border-t border-cream-200 text-sm text-forest-600 flex items-center justify-between">
          <Link href="/" className="hover:text-forest-900">&larr; Back to home</Link>
          <Link href="/terms" className="hover:text-forest-900">Terms of Service &rarr;</Link>
        </footer>
      </main>
    </div>
  )
}
