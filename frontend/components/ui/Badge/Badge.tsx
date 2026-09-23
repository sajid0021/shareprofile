import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-[#E8F3FF] px-3 py-1 text-xs font-semibold text-[#0A66C2]">
      {children}
    </span>
  );
}
