/** Joins class names, filtering out falsy values. Mirrors the `clsx` pattern. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Format a date string to a readable locale string */
export function formatDate(date: string | undefined | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Derive a deterministic HSL colour from a string (used for avatars) */
export function stringToHsl(str: string): string {
  const hue = ((str?.charCodeAt(0) ?? 65) * 5) % 360;
  return `hsl(${hue},55%,55%)`;
}
