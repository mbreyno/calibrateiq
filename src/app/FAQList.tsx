'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'How do I use CalibrateIQ?',
    a: 'CalibrateIQ is designed to be simple and easy to use. Once you create an account, all you need is your master link to send out survey invitations. This one universal link can be used every time, so you can place it in your email templates or workflows. Once a client completes the survey, they will show up on your dashboard and you can build a report that includes their survey.',
  },
  {
    q: "How is the risk score calculated, and what's your philosophy?",
    a: 'Many risk tolerance questionnaires only focus on risk preference — how a client feels about investing in the stock market. This ignores their risk capacity, which is based on their age and time horizon. CalibrateIQ measures both, but prioritizes risk capacity as the true metric that should inform asset allocation. Risk preference is available as a reference to help the advisor understand how much education is needed for the client.',
  },
  {
    q: 'How do I create an IPS?',
    a: 'Once surveys appear in your dashboard, you can pull them into reports to create an IPS. A report can include one survey for individuals or two surveys for a household (couple). You can add your own notes in the Advisor Notes section, then export the report as a branded PDF to deliver to the client.',
  },
  {
    q: 'Can I customize the report?',
    a: 'Yes! After creating an account, you can add your logo, firm name, and brand colors. You can also add investment preference options (ESG, crypto, etc.) that will be displayed during the survey. When selected by a client, these preferences appear on the IPS.',
  },
  {
    q: 'Is there a signature line so clients can sign off on the IPS?',
    a: 'Yes — this is an option you can toggle on or off in Firm Settings. When enabled, a signature page is added to the end of the exported PDF.',
  },
  {
    q: 'There are other risk tolerance tools out there — why build this one?',
    a: 'Many existing tools are too complicated, too expensive, and incorrectly base risk profiles on client preference instead of capacity. CalibrateIQ is a simple, low-cost alternative that measures what truly matters.',
  },
]

export default function FAQList() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {FAQS.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
          >
            <span className="text-base font-semibold text-forest-900">{item.q}</span>
            <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}>
              <svg className="w-3.5 h-3.5 text-forest-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-sm text-forest-700 leading-relaxed border-t border-cream-200 pt-4">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
