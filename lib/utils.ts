import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtBalance(val: string | null | undefined, decimals = 4): string {
  const n = Number.parseFloat(val ?? "")
  return Number.isNaN(n) ? "—" : n.toFixed(decimals)
}
