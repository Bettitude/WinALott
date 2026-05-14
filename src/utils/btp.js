// BT Points system — 1 BTP = 1 cent (admin can adjust this rate)
// DB stores all monetary amounts in cents (integers)

export const BTP_RATE   = 1;   // 1 BTP per cent
export const BTP_LABEL  = 'BTP';
export const BTP_SYMBOL = '◈'; // visual icon for BTP

// cents in DB → BTP
export function btpFromCents(cents) {
  return Math.round((cents ?? 0) * BTP_RATE);
}

// dollars (already converted from cents/100) → BTP
export function btpFromDollars(dollars) {
  return Math.round((dollars ?? 0) * 100 * BTP_RATE);
}

// Format for display: 1234 → "1,234 BTP"
export function formatBTP(btp) {
  return `${Math.round(btp).toLocaleString()} BTP`;
}

// Short format: 12400 → "12.4k BTP"
export function formatBTPShort(btp) {
  const n = Math.round(btp);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M BTP`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k BTP`;
  return `${n} BTP`;
}
