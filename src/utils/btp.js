// WALP (WinALot Points) — the only currency on WinALot.
// 1 WALP = $1 USD. All prices and balances are stored/sent as plain WALP numbers (decimals allowed).

export const BTP_SYMBOL = 'WALP';
export const BTP_LABEL  = 'WALP';

// Format with up to 2 decimal places, dropping trailing zeros (55.40 → "55.4", 100 → "100")
export function formatBTP(btp) {
  const n = Number(btp ?? 0);
  const display = n % 1 === 0
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `${display} WALP`;
}

// Short display: 12400 → "12.4k WALP", 1500000 → "1.5M WALP"
export function formatBTPShort(btp) {
  const n = Number(btp ?? 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M WALP`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k WALP`;
  return formatBTP(n);
}

// Legacy helpers kept for any code still importing them — these now treat BTP as-is
export function btpFromCents(value)   { return Number(value ?? 0); }
export function btpFromDollars(value) { return Number(value ?? 0); }
