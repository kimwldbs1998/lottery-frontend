export function formatRs(value) {
  if (value === null || value === undefined) return '-';
  // Most amounts the API sends are already whole-rupee integer strings, but a few internal
  // ledger fields (pool/carryover) are plain BigDecimal strings that can carry a fractional
  // remainder (e.g. "200.0", "97.34") until it's truncated at an actual payout. Strip any
  // fractional part here so display never crashes on a non-integer string.
  let intPart = String(value);
  const dot = intPart.indexOf('.');
  if (dot !== -1) intPart = intPart.slice(0, dot);
  if (intPart === '' || intPart === '-') intPart = '0';
  const n = BigInt(intPart);
  const negative = n < 0n;
  const digits = (negative ? -n : n).toString();
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ',';
    out += digits[i];
  }
  return `Rs ${negative ? '-' : ''}${out}`;
}

export function formatDateTime(epochMillis) {
  if (!epochMillis) return '-';
  const d = new Date(Number(epochMillis));
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatCountdown(remainingSeconds) {
  const s = Math.max(0, Math.floor(remainingSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
