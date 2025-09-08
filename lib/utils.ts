import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chunkText(text: string, size = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start += size - overlap; // step forward with overlap
  }
  return chunks.filter((c) => c.trim().length > 0);
}

export function validatePdf(file: File) {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  // Check file type
  if (file.type !== "application/pdf") {
    return { valid: false, error: "Only PDF files are allowed" };
  }

  // Check file size (in bytes)
  const maxSizeBytes = 1 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${1}MB`,
    };
  }

  return { valid: true };
}
