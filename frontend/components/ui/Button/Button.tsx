import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-[#0A66C2] text-white hover:bg-[#004182]",
    secondary:
      "border border-[#0A66C2] bg-white text-[#0A66C2] hover:bg-[#E8F3FF]",
    ghost:
      "text-[#666666] hover:bg-[#F3F2EF] hover:text-[#1D2226]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}