interface MingleLogoProps { compact?: boolean; }

/** Two connected arches: an m built around a shared meeting point. */
export function MingleLogo({ compact = false }: MingleLogoProps) {
  return <span className={`mingle-logo${compact ? " mingle-logo-compact" : ""}`} role="img" aria-label="Mingle.lk">
    <svg viewBox={compact ? "0 0 48 48" : "4 5 40 32"} fill="none" aria-hidden="true" className="mingle-mark">
      <path d="M7 34V22a8.5 8.5 0 0 1 17 0v12M24 34V22a8.5 8.5 0 0 1 17 0v12" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="24" cy="9" r="3" fill="currentColor" />
    </svg>
    {!compact && <span className="mingle-wordmark" aria-hidden="true">ingle<span>.lk</span></span>}
  </span>;
}
