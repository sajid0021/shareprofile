import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-md border border-[#D9DDE1] bg-white px-3 text-sm text-[#1D2226] outline-none transition focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] ${className}`}
      {...props}
    />
  );
}
