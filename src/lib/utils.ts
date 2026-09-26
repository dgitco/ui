import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn's `cn`; consumers already have it at their own `@/lib/utils`. Here only for typechecking. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
