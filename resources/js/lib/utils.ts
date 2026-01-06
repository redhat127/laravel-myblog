import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { clientEnv } from './env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pageTitle = (title: string) => {
  return `${clientEnv.VITE_APP_NAME} - ${title}`;
};

export const showServerValidationError = (errors: Record<string, string>) => {
  const values = Object.values(errors);
  if (values.length > 0) {
    const message = values[0];
    toast.error(message);
  }
};

// Helper function to hash string to number
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Calculate contrast color (white or black) based on HSL values
export function getContrastColor(h: number, s: number, l: number): string {
  // Convert HSL to RGB to calculate luminance
  const hue = h / 360;
  const sat = s / 100;
  const light = l / 100;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue * 6) % 2) - 1));
  const m = light - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (hue < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (hue < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (hue < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (hue < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (hue < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  r = (r + m) * 255;
  g = (g + m) * 255;
  b = (b + m) * 255;

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
