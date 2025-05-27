import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getURLImagePicsum(
  id: number,
  width = 400,
  height = 300
): string {
  return `https://picsum.photos/id/${id}/${width}/${height}.webp`;
}
