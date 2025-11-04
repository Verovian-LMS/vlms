
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number to a string with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Convert a snake_case or kebab-case string to Title Case
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/[-_]/g, ' ')
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

/**
 * Get a consistent placeholder image from Unsplash based on a seed string
 * This ensures the same placeholder is used for the same content
 */
export function getPlaceholderImage(seed: string, width = 800, height = 600): string {
  // List of good quality Unsplash image IDs we can use as placeholders
  const imageIds = [
    'photo-1488590528505-98d2b5aba04b', // Computer
    'photo-1581091196277-9f6e9b96cc6a', // Educational
    'photo-1576091160399-112ba8d25d1d', // Professional
    'photo-1532938911079-1b06ac7ceec7', // Books
    'photo-1550831107-1553da8c8464', // Laboratory
    'photo-1576671414121-aa2d70260ade', // Technology
    'photo-1551884170-09fb70a3a2ed', // Campus
    'photo-1587854692152-cbe660dbde88', // Academic research
    'photo-1505751172876-fa1923c5c528', // Education
  ];
  
  // Use the seed to consistently select an image from the array
  let index = 0;
  for (let i = 0; i < seed.length; i++) {
    index += seed.charCodeAt(i);
  }
  index = index % imageIds.length;
  
  return `https://images.unsplash.com/${imageIds[index]}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

/**
 * Format bytes to a human-readable format (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format seconds to a duration string (mm:ss or hh:mm:ss)
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');
  
  if (hrs > 0) {
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }
  
  return `${formattedMins}:${formattedSecs}`;
}

/**
 * Truncate a string to a specific length and add ellipsis
 */
export function truncateString(str: string, num: number): string {
  if (!str) return '';
  if (str.length <= num) return str;
  
  return str.slice(0, num) + '...';
}
