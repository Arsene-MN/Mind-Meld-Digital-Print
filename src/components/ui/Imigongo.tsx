/**
 * A band of zig-zag triangles, a nod to Rwandan imigongo art.
 * Pure geometry used as a section divider, not an illustration.
 */
export function Imigongo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <pattern id="imigongo" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 80 L40 0 L80 80 Z" fill="currentColor" />
          <path d="M20 80 L40 40 L60 80 Z" fill="var(--color-paper)" />
          <path d="M30 80 L40 60 L50 80 Z" fill="var(--color-accent)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#imigongo)" />
    </svg>
  );
}
