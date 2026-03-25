import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(amount: string | number | bigint): string {
  const num = typeof amount === 'bigint' ? Number(amount) : Number(amount);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  }).format(num / 10_000_000); // Convert from stroops (10^7)
}

export function toStroops(amount: number): string {
  return Math.floor(amount * 10000000).toString();
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
