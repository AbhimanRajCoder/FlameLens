/** Static fallback posters shown while GLBs load or when 3D is unavailable. */

export function IssPoster() {
  return (
    <svg viewBox="0 0 480 300" className="poster-svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="iss-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d3a56" />
          <stop offset="1" stopColor="#12233a" />
        </linearGradient>
      </defs>
      <ellipse cx="240" cy="150" rx="205" ry="72" fill="none" stroke="#66d9f2" strokeOpacity="0.18" strokeDasharray="3 7" />
      {/* truss */}
      <rect x="70" y="142" width="340" height="10" rx="3" fill="#2c4258" />
      {/* solar arrays */}
      {[96, 150, 306, 360].map((x) => (
        <g key={x}>
          <rect x={x - 14} y={78} width={28} height={58} rx="2" fill="url(#iss-panel)" stroke="#3d5a78" strokeWidth="1" />
          <rect x={x - 14} y={158} width={28} height={58} rx="2" fill="url(#iss-panel)" stroke="#3d5a78" strokeWidth="1" />
          <line x1={x} y1={136} x2={x} y2={158} stroke="#3d5a78" strokeWidth="2" />
        </g>
      ))}
      {/* modules */}
      <rect x="205" y="118" width="70" height="22" rx="10" fill="#46617d" />
      <rect x="222" y="98" width="36" height="62" rx="9" fill="#54718e" />
      <rect x="228" y="160" width="24" height="34" rx="7" fill="#3d5a78" />
      <circle cx="240" cy="129" r="4" fill="#66d9f2" fillOpacity="0.8" />
    </svg>
  );
}

export function MarsRoverPoster() {
  return (
    <svg viewBox="0 0 480 300" className="poster-svg" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="mars-poster-glow" cx="0.5" cy="1.2" r="1">
          <stop offset="0.4" stopColor="#5a2c22" />
          <stop offset="0.75" stopColor="#2c1712" />
          <stop offset="1" stopColor="#070b14" />
        </radialGradient>
      </defs>
      <circle cx="240" cy="580" r="350" fill="url(#mars-poster-glow)" />
      <circle cx="240" cy="580" r="350" fill="none" stroke="#e66a52" strokeOpacity="0.3" strokeWidth="1.4" />
      <g transform="translate(196 176)" fill="#3d2a24" stroke="#7a564a" strokeWidth="1.2">
        <rect x="0" y="0" width="88" height="24" rx="4" />
        <rect x="14" y="-18" width="40" height="18" rx="3" />
        <line x1="66" y1="-2" x2="78" y2="-34" />
        <rect x="72" y="-44" width="16" height="11" rx="2" />
        <line x1="10" y1="2" x2="-12" y2="-14" />
        <circle cx="-14" cy="-16" r="4" />
        <circle cx="12" cy="30" r="9" fill="#241812" />
        <circle cx="44" cy="30" r="9" fill="#241812" />
        <circle cx="76" cy="30" r="9" fill="#241812" />
      </g>
    </svg>
  );
}

export function LunarModulePoster() {
  return (
    <svg viewBox="0 0 480 300" className="poster-svg" aria-hidden="true" focusable="false">
      <line x1="40" y1="252" x2="440" y2="252" stroke="#a9b5c5" strokeOpacity="0.25" />
      {/* descent stage */}
      <polygon points="190,180 290,180 306,226 174,226" fill="#6b6f57" stroke="#8a8e70" strokeWidth="1" />
      <rect x="206" y="150" width="68" height="34" rx="6" fill="#9aa07c" />
      {/* ascent stage */}
      <polygon points="206,116 274,116 286,152 194,152" fill="#c8cbb0" stroke="#e0e2cc" strokeWidth="1" />
      <rect x="222" y="98" width="36" height="22" rx="5" fill="#d8dac4" />
      <circle cx="228" cy="132" r="5" fill="#111c2d" />
      <circle cx="252" cy="132" r="5" fill="#111c2d" />
      {/* legs */}
      <line x1="182" y1="222" x2="156" y2="250" stroke="#8a8e70" strokeWidth="3" />
      <line x1="298" y1="222" x2="324" y2="250" stroke="#8a8e70" strokeWidth="3" />
      <ellipse cx="152" cy="251" rx="12" ry="3.5" fill="#8a8e70" />
      <ellipse cx="328" cy="251" rx="12" ry="3.5" fill="#8a8e70" />
      {/* antenna */}
      <line x1="240" y1="98" x2="240" y2="76" stroke="#d8dac4" strokeWidth="2" />
      <circle cx="240" cy="73" r="6" fill="none" stroke="#d8dac4" strokeWidth="1.5" />
    </svg>
  );
}