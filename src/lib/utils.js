import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility functions for shadcn components
export function shadcnClassnames(baseClassname, ...inputs) {
  return cn(baseClassname, ...inputs);
}

export function shadcnStyles(baseStyles, ...inputs) {
  return Object.assign({}, baseStyles, ...inputs);
}
