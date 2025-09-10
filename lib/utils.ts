import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Improved semantic-aware chunking
export function chunkTextSemantic(
  text: string,
  options: ChunkOptions = {}
): string[] {
  const {
    maxSize = 1000,
    overlap = 100,
    minChunkSize = 50,
    respectSentenceBoundaries = true,
    respectParagraphBoundaries = true,
  } = options;

  // Clean and normalize text
  const cleanText = text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  if (cleanText.length === 0) return [];

  // First, split by paragraphs if enabled
  const paragraphs = respectParagraphBoundaries
    ? cleanText.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [cleanText];

  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxSize) {
      // Paragraph fits in one chunk
      if (paragraph.trim().length >= minChunkSize) {
        chunks.push(paragraph.trim());
      }
      continue;
    }

    // Split long paragraphs
    if (respectSentenceBoundaries) {
      const paragraphChunks = chunkBySentences(
        paragraph,
        maxSize,
        overlap,
        minChunkSize
      );
      chunks.push(...paragraphChunks);
    } else {
      const paragraphChunks = chunkByWords(
        paragraph,
        maxSize,
        overlap,
        minChunkSize
      );
      chunks.push(...paragraphChunks);
    }
  }

  return chunks.filter((chunk) => chunk.trim().length >= minChunkSize);
}

// Split by sentences with overlap
function chunkBySentences(
  text: string,
  maxSize: number,
  overlap: number,
  minChunkSize: number
): string[] {
  // Better sentence splitting regex that handles abbreviations
  const sentences = text.match(/[^\.!?]+[\.!?]+(?=\s|$)/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";
  let i = 0;

  while (i < sentences.length) {
    const sentence = sentences[i].trim();

    // If adding this sentence would exceed maxSize, finalize current chunk
    if (currentChunk && currentChunk.length + sentence.length + 1 > maxSize) {
      if (currentChunk.length >= minChunkSize) {
        chunks.push(currentChunk.trim());
      }

      // Create overlap by including some previous content
      currentChunk = createSentenceOverlap(currentChunk, overlap);
    }

    currentChunk += (currentChunk ? " " : "") + sentence;
    i++;
  }

  // Add final chunk
  if (currentChunk.length >= minChunkSize) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Split by words with overlap
function chunkByWords(
  text: string,
  maxSize: number,
  overlap: number,
  minChunkSize: number
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    let chunk = "";
    let wordCount = 0;

    // Build chunk word by word
    for (let i = start; i < words.length; i++) {
      const word = words[i];
      const testChunk = chunk + (chunk ? " " : "") + word;

      if (testChunk.length > maxSize && chunk.length > 0) {
        break;
      }

      chunk = testChunk;
      wordCount++;
    }

    if (chunk.length >= minChunkSize) {
      chunks.push(chunk);
    }

    // Calculate overlap in words
    const overlapWords = Math.floor((overlap / chunk.length) * wordCount);
    start += Math.max(1, wordCount - overlapWords);
  }

  return chunks;
}

// Create overlapping context from the end of current chunk
function createSentenceOverlap(text: string, overlapSize: number): string {
  if (text.length <= overlapSize) return text;

  const truncated = text.slice(-overlapSize);
  // Try to start from a sentence boundary
  const sentenceStart = truncated.search(/[.!?]\s+/);

  return sentenceStart !== -1 ? truncated.slice(sentenceStart + 2) : truncated;
}

// RECOMMENDED: Optimized chunking specifically for PDFs
export function chunkPdfText(text: string): string[] {
  // First, clean up PDF-specific artifacts
  const cleanedText = text
    // Remove excessive whitespace
    .replace(/\s+/g, " ")
    // Remove page breaks and headers/footers patterns
    .replace(/\n\s*\d+\s*\n/g, "\n")
    .replace(/\n\s*Page\s+\d+.*?\n/gi, "\n")
    // Fix broken words from PDF extraction
    .replace(/([a-z])-\s+([a-z])/g, "$1$2")
    // Normalize line breaks
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  return chunkTextSemantic(cleanedText, {
    maxSize: 800, // Good balance of context and embedding quality
    overlap: 150, // Sufficient overlap for continuity
    minChunkSize: 100, // Filter out fragments
    respectSentenceBoundaries: true,
    respectParagraphBoundaries: true,
  });
}

// Utility to estimate token count (rough approximation)
export function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4);
}

// Utility to analyze chunking results
export function analyzeChunks(chunks: string[]): {
  totalChunks: number;
  avgLength: number;
  minLength: number;
  maxLength: number;
  estimatedTokens: number;
} {
  if (chunks.length === 0) {
    return {
      totalChunks: 0,
      avgLength: 0,
      minLength: 0,
      maxLength: 0,
      estimatedTokens: 0,
    };
  }

  const lengths = chunks.map((chunk) => chunk.length);
  const totalLength = lengths.reduce((sum, len) => sum + len, 0);

  return {
    totalChunks: chunks.length,
    avgLength: Math.round(totalLength / chunks.length),
    minLength: Math.min(...lengths),
    maxLength: Math.max(...lengths),
    estimatedTokens: estimateTokenCount(chunks.join(" ")),
  };
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

// utils/batchArray.ts
export function batchArray<T>(arr: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < arr.length; i += batchSize) {
    batches.push(arr.slice(i, i + batchSize));
  }
  return batches;
}
