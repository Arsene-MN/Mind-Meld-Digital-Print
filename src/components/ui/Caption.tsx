import type { Credit } from "@/content/types";

/** A museum-label caption: a title, and the photo credit when the photo isn't ours. */
export function Caption({ title, credit, className = "" }: { title: string; credit?: Credit; className?: string }) {
  return (
    <p className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
      <span className="font-sans text-[0.8rem] opacity-80">{title}</span>
      {credit && (
        <a href={credit.href} target="_blank" rel="noreferrer" className="ml-auto font-sans text-[0.7rem] opacity-60 underline-offset-2 hover:underline hover:opacity-100">
          {credit.text}
        </a>
      )}
    </p>
  );
}
