const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing and using WinALot, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.' },
  { title: '2. Eligibility', body: 'You must be at least 18 years of age to participate. By using WinALot, you represent and warrant that you are 18 or older and have the legal capacity to enter into this agreement.' },
  { title: '3. How WinALot Works', body: 'WinALot is a football sweepstakes and prediction platform. Users purchase tickets for prediction markets on football matches. Users who match the admin\'s prediction are entered into a random draw. Winners are selected randomly from all correct predictors.' },
  { title: '4. Ticket Purchases & Refunds', body: 'All ticket purchases are final. Refunds are only issued if a match is cancelled or postponed before kick-off. Winnings from cancelled matches are automatically credited back to your account.' },
  { title: '5. Prize Payments', body: 'Prizes are credited to your WinALot account within 48 hours of the match result being confirmed. Withdrawal requests are processed within 1–3 business days. Minimum withdrawal amount is $5.00.' },
  { title: '6. Fair Play & Integrity', body: 'Any attempt to manipulate results, exploit the platform, or engage in fraudulent activity will result in immediate account suspension and forfeiture of winnings. WinALot reserves the right to void tickets and prizes in cases of suspected fraud.' },
  { title: '7. Intellectual Property', body: 'All content on WinALot, including text, graphics, logos, and software, is the property of Bettitude Inc. and protected by applicable intellectual property laws.' },
  { title: '8. Limitation of Liability', body: 'WinALot and Bettitude Inc. shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our liability is limited to the amount paid for the ticket in question.' },
  { title: '9. Changes to Terms', body: 'We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.' },
  { title: '10. Governing Law', body: 'These Terms are governed by the laws of the jurisdiction in which Bettitude Inc. is registered. Any disputes shall be resolved through binding arbitration.' },
];

export default function TermsAndConditions() {
  return (
    <div>
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-14 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-2">Terms and Conditions</h1>
        <p className="text-blue-200 text-sm">Last updated: April 2025</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-5">
        {sections.map(s => (
          <div key={s.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-2">{s.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
