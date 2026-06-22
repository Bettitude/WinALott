import { FiShield, FiLock, FiUsers, FiFileText, FiMail } from 'react-icons/fi';

function AssuranceCard({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#1A4D8F]/10 text-[#1A4D8F] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-[#1A1A2E] text-sm">{title}</p>
        <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function Verify() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1A4D8F]/10 mb-4">
          <FiShield className="w-7 h-7 text-[#1A4D8F]" />
        </div>
        <h1 className="text-3xl font-black text-[#1A1A2E]">Provably Fair Draws</h1>
        <p className="text-gray-400 mt-2 max-w-lg mx-auto text-sm">
          Every WinALot draw is run through a verifiable randomization process designed so that
          no one — including WinALot — can predict or alter who wins ahead of time.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="space-y-6">
          <AssuranceCard
            icon={FiLock}
            title="Sealed Before Tickets Go on Sale"
            desc="Before a market opens for entries, the randomization input for that draw is locked in and cryptographically sealed. It cannot be changed once tickets are sold."
          />
          <AssuranceCard
            icon={FiUsers}
            title="Tied to Public Match Data"
            desc="The draw outcome depends in part on public information (such as the match itself) that no one party controls or can pre-arrange."
          />
          <AssuranceCard
            icon={FiFileText}
            title="Logged and Audited"
            desc="Every draw — its inputs, timestamp, and result — is recorded in an internal audit log reviewed as part of our compliance process."
          />
          <AssuranceCard
            icon={FiMail}
            title="Verifiable on Request"
            desc="If you have questions about a specific draw, contact support and our compliance team can confirm that draw was run fairly."
          />
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mt-6">
          <p className="text-xs text-gray-600 leading-relaxed">
            We keep the exact verification process internal to prevent it from being gamed. This
            does not affect how draws run — it only means we share verification details directly
            with you rather than publishing the method publicly.
          </p>
        </div>
      </div>
    </div>
  );
}
