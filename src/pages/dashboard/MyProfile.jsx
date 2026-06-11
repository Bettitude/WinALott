import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiCheck, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { matchApi } from '../../api/matchApi';

export default function MyProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Payout details
  const [payout, setPayout] = useState({ bank_name: '', account_name: '', account_number: '', bank_code: '' });
  const [payoutLoading, setPayoutLoading] = useState(true);
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutSaved, setPayoutSaved] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  useEffect(() => {
    matchApi.getPayoutDetails()
      .then(res => {
        const d = res.data?.data?.details;
        if (d) setPayout({
          bank_name:      d.bank_name      || '',
          account_name:   d.account_name   || '',
          account_number: d.account_number || '',
          bank_code:      d.bank_code      || '',
        });
      })
      .catch(() => {})
      .finally(() => setPayoutLoading(false));
  }, []);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }));
  const setPd = (k, v) => setPayout(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    updateProfile(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.current) errs.current = 'Enter current password';
    if (!pwForm.newPass || pwForm.newPass.length < 8) errs.newPass = 'Min 8 characters';
    if (pwForm.newPass !== pwForm.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    await new Promise(r => setTimeout(r, 700));
    setPwForm({ current: '', newPass: '', confirm: '' });
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 3000);
  };

  const handlePayoutSave = async (e) => {
    e.preventDefault();
    setPayoutError('');
    if (!payout.bank_name || !payout.account_name || !payout.account_number) {
      setPayoutError('Bank name, account name, and account number are required.');
      return;
    }
    setPayoutSaving(true);
    try {
      await matchApi.savePayoutDetails(payout);
      setPayoutSaved(true);
      setTimeout(() => setPayoutSaved(false), 3000);
    } catch (err) {
      setPayoutError(err.response?.data?.error || 'Failed to save. Try again.');
    } finally {
      setPayoutSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white mb-8">My Profile</h1>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#1A4D8F] flex items-center justify-center text-white text-3xl font-black">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#F5C518] rounded-full flex items-center justify-center shadow-md hover:brightness-110 transition-all">
            <FiCamera className="w-4 h-4 text-[#1A1A2E]" />
          </button>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 mb-5">
        <h2 className="font-bold text-[#1A1A2E] dark:text-white mb-4">Account Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Display Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email (read-only)</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={user?.email || ''} readOnly
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700/50 text-gray-400 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Phone (optional)</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-[#1A4D8F] text-white hover:bg-[#0D2B5E]'
            } disabled:opacity-60`}>
            {saved ? <><FiCheck className="w-4 h-4" /> Saved!</> : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Payout / bank details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <FiCreditCard className="w-4 h-4 text-[#1A4D8F] dark:text-blue-400" />
          <h2 className="font-bold text-[#1A1A2E] dark:text-white">Payout / Bank Details</h2>
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-5">
          When you win, the admin uses these details to pay you. Keep them accurate.
        </p>

        {payoutLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <form onSubmit={handlePayoutSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Bank Name</label>
              <input
                value={payout.bank_name}
                onChange={e => setPd('bank_name', e.target.value)}
                placeholder="e.g. First Bank, GTBank, Zenith Bank"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Account Name</label>
              <input
                value={payout.account_name}
                onChange={e => setPd('account_name', e.target.value)}
                placeholder="Full name as on your account"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Account Number</label>
              <input
                value={payout.account_number}
                onChange={e => setPd('account_number', e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit account number"
                maxLength={10}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
              />
            </div>

            {payoutError && (
              <p className="flex items-center gap-1.5 text-xs text-red-500">
                <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />{payoutError}
              </p>
            )}

            <button type="submit" disabled={payoutSaving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                payoutSaved ? 'bg-green-500 text-white' : 'bg-[#1A4D8F] text-white hover:bg-[#0D2B5E]'
              } disabled:opacity-60`}>
              {payoutSaved
                ? <><FiCheck className="w-4 h-4" /> Details Saved!</>
                : payoutSaving ? 'Saving…' : 'Save Payout Details'}
            </button>
          </form>
        )}
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="font-bold text-[#1A1A2E] dark:text-white mb-4">Change Password</h2>
        <form onSubmit={handlePwSave} className="space-y-4">
          {[
            { k: 'current', label: 'Current Password', placeholder: '••••••••' },
            { k: 'newPass', label: 'New Password', placeholder: 'Min 8 characters' },
            { k: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{f.label}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={pwForm[f.k]} onChange={e => setPw(f.k, e.target.value)} placeholder={f.placeholder}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] dark:bg-slate-700 dark:text-white ${pwErrors[f.k] ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'}`} />
              </div>
              {pwErrors[f.k] && <p className="text-red-500 text-xs mt-1">{pwErrors[f.k]}</p>}
            </div>
          ))}
          <button type="submit"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              pwSaved ? 'bg-green-500 text-white' : 'bg-[#1A4D8F] text-white hover:bg-[#0D2B5E]'
            }`}>
            {pwSaved ? <><FiCheck className="w-4 h-4" /> Password Updated!</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
