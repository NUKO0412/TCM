// Médaillon « TCM / LORIENT » — repris à l'identique du SVG d'origine.
// Utilisé dans l'en-tête et le pied de page.
export function Logo() {
  return (
    <div className="mono-mark">
      <svg viewBox="0 0 120 120" aria-label="TCM Agencement">
        <circle cx="60" cy="60" r="56" fill="none" stroke="#C2904B" strokeWidth="3" />
        <circle cx="60" cy="60" r="49" fill="none" stroke="#C2904B" strokeWidth="1.5" opacity="0.55" />
        <text x="60" y="67" textAnchor="middle" fontFamily="'Fraunces',Georgia,serif" fontWeight="600" fontSize="30" fill="#F4EDDF">
          TCM
        </text>
        <line x1="46" y1="75" x2="74" y2="75" stroke="#C2904B" strokeWidth="1.4" opacity="0.7" />
        <text x="60" y="86" textAnchor="middle" fontFamily="'Space Mono',monospace" fontSize="6" letterSpacing="1.6" fill="#D9AC63">
          LORIENT
        </text>
      </svg>
    </div>
  )
}
