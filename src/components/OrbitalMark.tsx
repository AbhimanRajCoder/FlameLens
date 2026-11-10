export function OrbitalMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <ellipse
        cx="32"
        cy="34"
        rx="26"
        ry="10"
        fill="none"
        stroke="var(--ice-400)"
        strokeOpacity="0.55"
        strokeWidth="2"
        transform="rotate(-18 32 34)"
      />
      <path
        d="M32 12c3.6 6.2 9.8 9.6 9.8 17.4 0 6.6-4.4 11.6-9.8 11.6s-9.8-5-9.8-11.6c0-4.2 1.7-6.9 3.9-9.6.6 2.3 1.7 3.7 3.3 4.7C29 20.9 30.4 16.6 32 12z"
        fill="var(--ember-500)"
      />
      <path
        d="M32 24c1.9 3.2 4.6 5 4.6 8.9 0 3.4-2 5.9-4.6 5.9s-4.6-2.5-4.6-5.9c0-2.2.9-3.6 2-5 .3 1.2.9 1.9 1.7 2.4-.2-1.9.4-4.1.9-6.3z"
        fill="var(--amber-400)"
      />
      <circle cx="53" cy="25" r="2.4" fill="var(--ice-400)" />
    </svg>
  );
}