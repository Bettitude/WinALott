// BT Points — the only currency on WinALot.
// Admin sets the USD rate (e.g. 1 BTP = $0.01).
// All prices and balances are stored/sent as plain BTP numbers (decimals allowed).

export const BTP_SYMBOL = 'BTP';
export const BTP_LABEL  = 'BTP';

// Format with up to 2 decimal places, dropping trailing zeros (55.40 → "55.4", 100 → "100")
export function formatBTP(btp) {
  const n = Number(btp ?? 0);
  const display = n % 1 === 0
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `${display} BTP`;
}

// Short display: 12400 → "12.4k BTP", 1500000 → "1.5M BTP"
export function formatBTPShort(btp) {
  const n = Number(btp ?? 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M BTP`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k BTP`;
  return formatBTP(n);
}

// Legacy helpers kept for any code still importing them — these now treat BTP as-is
export function btpFromCents(value)   { return Number(value ?? 0); }
export function btpFromDollars(value) { return Number(value ?? 0); }
