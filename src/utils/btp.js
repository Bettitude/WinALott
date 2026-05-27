// WAP (WinALot Points) — the only currency on WinALot.
// Admin sets the USD rate (e.g. 100 WAP = $1).
// All prices and balances are stored/sent as plain WAP numbers (decimals allowed).

export const BTP_SYMBOL = 'WAP';
export const BTP_LABEL  = 'WAP';

// Format with up to 2 decimal places, dropping trailing zeros (55.40 → "55.4", 100 → "100")
export function formatBTP(btp) {
  const n = Number(btp ?? 0);
  const display = n % 1 === 0
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `${display} WAP`;
}

// Short display: 12400 → "12.4k WAP", 1500000 → "1.5M WAP"
export function formatBTPShort(btp) {
  const n = Number(btp ?? 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M WAP`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k WAP`;
  return formatBTP(n);
}

// Legacy helpers kept for any code still importing them — these now treat BTP as-is
export function btpFromCents(value)   { return Number(value ?? 0); }
export function btpFromDollars(value) { return Number(value ?? 0); }
