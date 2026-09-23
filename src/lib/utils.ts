import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Standard utility for merging Tailwind CSS classes safely.
 * Required by ShadCN components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
