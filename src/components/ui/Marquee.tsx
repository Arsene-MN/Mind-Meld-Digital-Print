/** An endless, CSS-only ticker. Pauses on hover; stops under reduced motion. */
export function Marquee({ items, className = "", speed = 40 }: { items: string[]; className?: string; speed?: number }) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-[0.4em]">{t}</span>
          <span className="px-[0.4em] text-accent" aria-hidden>
            ✶
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`group flex overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="flex animate-[marquee_var(--speed)_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ "--speed": `${speed}s` } as React.CSSProperties}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
