// Bloc de définitions d'icônes SVG — repris à l'identique de l'original.
// Rendu une seule fois ; les composants y font référence via <use href="#i-…">.
export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <g id="i-arrow">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </g>
        <g id="i-send">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </g>
        <g id="i-lock">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </g>
        <g id="i-menu">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </g>
        <g id="i-pin">
          <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </g>
        <g id="i-phone">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
        </g>
        <g id="i-mail">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="3 7 12 13 21 7" />
        </g>
        <g id="i-plank">
          <rect x="3" y="6" width="18" height="4" rx="1" />
          <rect x="3" y="14" width="18" height="4" rx="1" />
          <line x1="9" y1="6" x2="9" y2="10" />
          <line x1="15" y1="14" x2="15" y2="18" />
        </g>
        <g id="i-door">
          <rect x="5" y="3" width="14" height="18" rx="1" />
          <circle cx="15.5" cy="12" r="1" />
        </g>
        <g id="i-kitchen">
          <rect x="3" y="4" width="18" height="6" rx="1" />
          <rect x="3" y="13" width="18" height="7" rx="1" />
          <line x1="8" y1="13" x2="8" y2="20" />
          <line x1="7" y1="7" x2="9" y2="7" />
        </g>
        <g id="i-books">
          <rect x="4" y="3" width="4" height="18" />
          <rect x="10" y="3" width="4" height="18" />
          <path d="M16 5l4 1-3 15-4-1" />
        </g>
        <g id="i-dress">
          <path d="M12 3a2 2 0 0 0-2 2c0 1 .8 1.6 2 2.2" />
          <line x1="12" y1="7" x2="4" y2="12" />
          <line x1="12" y1="7" x2="20" y2="12" />
          <rect x="3" y="12" width="18" height="2" rx="1" />
        </g>
        <g id="i-deck">
          <line x1="3" y1="20" x2="21" y2="20" />
          <line x1="6" y1="20" x2="6" y2="9" />
          <line x1="18" y1="20" x2="18" y2="9" />
          <path d="M4 9l8-4 8 4" />
        </g>
        <g id="i-instagram">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </g>
        <g id="i-facebook">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </g>
      </defs>
    </svg>
  )
}

// Petit utilitaire : une icône qui référence une définition par sa clé.
export function Icon({ name, className = 'i', style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style}>
      <use href={`#${name}`} />
    </svg>
  )
}
