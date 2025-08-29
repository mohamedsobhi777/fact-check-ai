import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export interface FactCheckResult {
  verdict: string;
  explanation: string;
  sources: { url: string; snippet: string }[];
}

export function validateClaim(claim: string): boolean {
  return claim.trim().length > 0 && claim.trim().length <= 5000;
}

export function formatVerdict(verdict: string): string {
  switch (verdict.toLowerCase()) {
    case 'true':
      return 'True';
    case 'false':
      return 'False';
    case 'misleading':
      return 'Misleading';
    case 'mixed':
      return 'Mixed';
    case 'unverifiable':
      return 'Unverifiable';
    default:
      return 'Unknown';
  }
}

export function extractUrlFromText(text: string): string | null {
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}