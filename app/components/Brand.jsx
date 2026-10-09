// Pic Pace brand primitives: the framed-photo-with-motion-lines logo mark, a
// check glyph and a slim linear meter. Pure SVG/CSS so server and client
// render identically.

export function LogoMark({ size = 22 }) {
  return (
    <svg className="pp-logo" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="pp-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B62F4" />
          <stop offset="1" stopColor="#6B4FE2" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#pp-logo-grad)" />
      <g fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.8 9h3.4M2.8 12h4.4M3.8 15h3.4" />
        <rect x="9.2" y="6.4" width="11" height="11.2" rx="2.2" />
        <path d="M10.6 15.6l3-3.2 2 2 1.6-1.5 2 2.1" />
      </g>
      <circle cx="17.1" cy="9.4" r="1.15" fill="#fff" />
    </svg>
  );
}

// Stroke check mark used in feature lists (colour comes from CSS `stroke`).
export function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

const clamp = (n) => Math.min(100, Math.max(0, Number(n) || 0));

// Slim linear meter. `dark` is for use on the violet band.
export function Meter({ pct = 0, dark = false, label }) {
  const p = clamp(pct);
  const cls = `pp-meter${dark ? " pp-meter--dark" : ""}${p >= 100 ? " is-full" : p >= 80 ? " is-high" : ""}`;
  return (
    <div className={cls} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)} aria-label={label}>
      <span style={{ width: `${p}%` }} />
    </div>
  );
}
