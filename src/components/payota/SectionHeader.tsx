"use client";

import { Reveal } from "./Reveal";

export function SectionHeader({
  kicker,
  title,
  right,
  dense = false,
}: {
  kicker: string;
  title: React.ReactNode;
  right?: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <Reveal
      className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${
        dense ? "mb-8 md:mb-10" : "mb-12 md:mb-16"
      }`}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary">{kicker}</p>
        <h2
          className="mt-4 font-headline font-extrabold uppercase tracking-tighter"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
        >
          {title}
        </h2>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </Reveal>
  );
}