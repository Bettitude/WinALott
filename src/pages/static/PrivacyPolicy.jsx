const sections = [
  { title: '1. Information We Collect', body: 'We collect information you provide directly (name, email, phone number), information generated through your use of the platform (prediction history, ticket purchases, transaction records), and technical information (IP address, browser type, device information).' },
  { title: '2. How We Use Your Information', body: 'We use your information to provide and improve our services, process transactions and payments, send account notifications and promotional communications (with your consent), prevent fraud and ensure platform security, and comply with legal obligations.' },
  { title: '3. Data Sharing', body: 'We do not sell your personal data. We may share information with payment processors, analytics providers, and legal authorities when required by law. All third-party partners are bound by strict data protection agreements.' },
  { title: '4. Data Security', body: 'We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits to protect your personal information.' },
  { title: '5. Cookies', body: 'We use cookies to enhance your experience, remember your preferences, and analyse platform usage. You can manage cookie preferences through your browser settings.' },
  { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal data. You may request a copy of your data or ask us to restrict processing. Contact us at privacy@winalot.com to exercise these rights.' },
  { title: '7. Data Retention', body: 'We retain your data for as long as your account is active or as needed to provide services. Transaction records are kept for 7 years for legal and financial compliance.' },
  { title: '8. Contact', body: 'For privacy-related enquiries, contact our Data Protection Officer at: privacy@winalot.com' },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-14 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-2">Privacy Policy</h1>
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
