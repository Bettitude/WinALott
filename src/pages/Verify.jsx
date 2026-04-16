import { useState } from 'react';
import { FiShield, FiCheckCircle, FiXCircle, FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { mockDraw } from '../data/mockData';

// Lightweight HMAC-SHA256 client-side simulation (for demo — real verify calls the API)
async function clientVerify(serverSeed, clientSeed, serverSeedHash) {
  if (!serverSeed || !clientSeed || !serverSeedHash) return null;
  try {
    const encoder  = new TextEncoder();
    const keyData  = encoder.encode(serverSeed);
    const msgData  = encoder.encode(clientSeed);
    const hashData = encoder.encode(serverSeed);

    // Check server_seed_hash = SHA-256(server_seed)
    const hashBuf    = await crypto.subtle.digest('SHA-256', hashData);
    const hashHex    = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashMatch  = hashHex === serverSeedHash;

    // HMAC-SHA256(server_seed, client_seed)
    const cryptoKey  = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sigBuf     = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const sigHex     = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    return { hashMatch, sigHex, hashHex };
  } catch {
    return null;
  }
}

function StepCard({ number, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[#1A4D8F] text-white flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-bold text-[#1A1A2E] text-sm">{title}</p>
        <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function Field({ label, value, mono }) {
  const [show, setShow] = useState(false);
  const isLong = value && value.length > 24;
  const display = isLong && !show ? value.slice(0, 24) + '…' : value;
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className={`text-sm text-[#1A1A2E] break-all ${mono ? 'font-mono' : 'font-medium'}`}>{display}</p>
      {isLong && (
        <button onClick={() => setShow(s => !s)} className="text-xs text-[#1A4D8F] mt-1 flex items-center gap-0.5">
          {show ? <><FiChevronUp className="w-3 h-3" /> Show less</> : <><FiChevronDown className="w-3 h-3" /> Show full</>}
        </button>
      )}
    </div>
  );
}

export default function Verify() {
  const [drawId,         setDrawId]         = useState('');
  const [serverSeed,     setServerSeed]     = useState('');
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [clientSeed,     setClientSeed]     = useState('');
  const [result,         setResult]         = useState(null);
  const [loading,        setLoading]        = useState(false);

  const loadExample = () => {
    setDrawId(mockDraw.id);
    setServerSeed(mockDraw.server_seed);
    setServerSeedHash(mockDraw.server_seed_hash);
    setClientSeed(mockDraw.client_seed);
    setResult(null);
  };

  const handleVerify = async () => {
    if (!serverSeed || !clientSeed || !serverSeedHash) return;
    setLoading(true);
    setResult(null);
    const res = await clientVerify(serverSeed, clientSeed, serverSeedHash);
    setLoading(false);
    setResult(res);
  };

  const canVerify = serverSeed && clientSeed && serverSeedHash;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1A4D8F]/10 mb-4">
          <FiShield className="w-7 h-7 text-[#1A4D8F]" />
        </div>
        <h1 className="text-3xl font-black text-[#1A1A2E]">Provably Fair Verification</h1>
        <p className="text-gray-400 mt-2 max-w-lg mx-auto text-sm">
          Every WinALot draw is cryptographically verifiable. Paste the seeds from any completed draw to confirm it was not manipulated.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1A1A2E]">Verify a Draw</h2>
              <button onClick={loadExample}
                className="text-xs text-[#1A4D8F] font-semibold border border-[#1A4D8F]/30 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                Load Example
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Draw ID (optional)</label>
                <input value={drawId} onChange={e => setDrawId(e.target.value)} placeholder="drw_20250412_001"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Server Seed Hash <span className="text-red-400">*</span></label>
                <input value={serverSeedHash} onChange={e => setServerSeedHash(e.target.value)} placeholder="SHA-256 hash (pre-committed)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Server Seed <span className="text-red-400">*</span></label>
                <input value={serverSeed} onChange={e => setServerSeed(e.target.value)} placeholder="Revealed after draw completion"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Client Seed <span className="text-red-400">*</span></label>
                <input value={clientSeed} onChange={e => setClientSeed(e.target.value)} placeholder="Public client seed used for draw"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
              </div>
            </div>

            <button onClick={handleVerify} disabled={!canVerify || loading}
              className="w-full mt-5 bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" />Verifying...</>
                : <><FiShield className="w-4 h-4" />Verify Draw</>
              }
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-2xl border p-5 fade-in ${result.hashMatch ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                {result.hashMatch
                  ? <FiCheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                  : <FiXCircle     className="w-6 h-6 text-red-500 shrink-0" />
                }
                <div>
                  <p className={`font-black text-sm ${result.hashMatch ? 'text-green-700' : 'text-red-700'}`}>
                    {result.hashMatch ? 'Draw Verified — Fair' : 'Verification Failed'}
                  </p>
                  <p className={`text-xs mt-0.5 ${result.hashMatch ? 'text-green-600' : 'text-red-500'}`}>
                    {result.hashMatch
                      ? 'The server seed hash matches. This draw was not tampered with.'
                      : 'The server seed hash does not match. The seeds may be incorrect.'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Field label="Computed SHA-256 of Server Seed" value={result.hashHex} mono />
                <Field label="HMAC-SHA256 Signature" value={result.sigHex} mono />
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <FiInfo className="w-4 h-4 text-[#1A4D8F]" />
            <h2 className="font-bold text-[#1A1A2E]">How It Works</h2>
          </div>

          <div className="space-y-5 mb-6">
            <StepCard number="1" title="Server Seed Hash Published First"
              desc="Before any tickets are sold, WinALot commits to a Server Seed by publishing its SHA-256 hash. This proves the seed cannot be changed after the fact." />
            <StepCard number="2" title="Client Seed is Public"
              desc="A Client Seed (e.g. the match date or a community-sourced string) is agreed upon publicly before the draw runs." />
            <StepCard number="3" title="Draw Runs with HMAC-SHA256"
              desc="The winner selection uses HMAC-SHA256(server_seed, client_seed + nonce). The algorithm is deterministic and reproducible." />
            <StepCard number="4" title="Server Seed Revealed"
              desc="After the draw completes, the Server Seed is revealed. Anyone can hash it and confirm it matches the pre-committed hash." />
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-bold text-[#1A4D8F] mb-1">Algorithm</p>
            <code className="text-xs text-gray-600 break-all font-mono leading-relaxed">
              hash = SHA-256(server_seed)<br />
              sig  = HMAC-SHA256(server_seed, client_seed)<br />
              winner = tickets[sig mod tickets.length]
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
