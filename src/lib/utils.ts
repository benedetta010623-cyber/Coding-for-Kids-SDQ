import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats and normalizes image URLs (especially Imgur links) so they render properly in <img> tags.
 * Handles Imgur page links (e.g. https://imgur.com/xyz) and converts them to direct image URLs (https://i.imgur.com/xyz.png).
 */
export function formatImageUrl(url?: string): string {
  if (!url || !url.trim()) return '';
  let cleaned = url.trim();

  // Prepend protocol if protocol-relative
  if (cleaned.startsWith('//')) {
    cleaned = `https:${cleaned}`;
  }

  // 1) Direct Imgur image link e.g. https://imgur.com/xyz.png -> convert to https://i.imgur.com/xyz.png
  const directMatch = cleaned.match(/^(?:https?:\/\/)?(?:i\.|www\.)?imgur\.com\/([a-zA-Z0-9]+\.(?:png|jpg|jpeg|gif|webp))(?:[#?].*)?$/i);
  if (directMatch && directMatch[1]) {
    return `https://i.imgur.com/${directMatch[1]}`;
  }

  // 2) Imgur page link e.g. https://imgur.com/xyz or https://imgur.com/a/xyz -> convert to https://i.imgur.com/xyz.png
  const pageMatch = cleaned.match(/^(?:https?:\/\/)?(?:www\.)?imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)(?:[#?].*)?$/i);
  if (pageMatch && pageMatch[1]) {
    return `https://i.imgur.com/${pageMatch[1]}.png`;
  }

  return cleaned;
}

