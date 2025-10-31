import { TextSplitterOptions } from '../types';

const DEFAULT_OPTIONS: TextSplitterOptions = {
  maxCharacters: 130,
  respectSentenceBoundaries: true,
  minWordsPerSlide: 3,
};

/**
 * Splits text into slides while respecting sentence boundaries and character limits
 */
export function splitTextIntoSlides(
  text: string,
  options: Partial<TextSplitterOptions> = {}
): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!text.trim()) {
    return [];
  }

  // Clean and normalize the text
  const cleanText = text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/([.!?])\s*([A-Z])/g, '$1\n$2'); // Add line breaks after sentences

  // Split into sentences
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .filter(sentence => sentence.trim().length > 0);

  if (sentences.length === 0) {
    return [];
  }

  const slides: string[] = [];
  let currentSlide = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    // If adding this sentence would exceed the character limit
    if (currentSlide && (currentSlide + ' ' + trimmedSentence).length > opts.maxCharacters) {
      // Check if current slide meets minimum word requirement
      if (getWordCount(currentSlide) >= opts.minWordsPerSlide) {
        slides.push(currentSlide.trim());
        currentSlide = trimmedSentence;
      } else {
        // If current slide is too short, try to fit the sentence anyway
        currentSlide = (currentSlide + ' ' + trimmedSentence).trim();
      }
    } else {
      // Add sentence to current slide
      currentSlide = currentSlide ? currentSlide + ' ' + trimmedSentence : trimmedSentence;
    }

    // If a single sentence is too long, split it by words
    if (currentSlide.length > opts.maxCharacters) {
      const splitResult = splitLongSentence(currentSlide, opts.maxCharacters, opts.minWordsPerSlide);
      slides.push(...splitResult.slides);
      currentSlide = splitResult.remainder;
    }
  }

  // Add the last slide if it has content
  if (currentSlide.trim()) {
    slides.push(currentSlide.trim());
  }

  // Post-process slides to ensure quality
  return postProcessSlides(slides, opts);
}

/**
 * Splits a long sentence into multiple parts
 */
function splitLongSentence(
  sentence: string,
  maxCharacters: number,
  minWords: number
): { slides: string[]; remainder: string } {
  const words = sentence.split(' ');
  const slides: string[] = [];
  let currentSlide = '';

  for (const word of words) {
    if (currentSlide && (currentSlide + ' ' + word).length > maxCharacters) {
      if (getWordCount(currentSlide) >= minWords) {
        slides.push(currentSlide.trim());
        currentSlide = word;
      } else {
        currentSlide = (currentSlide + ' ' + word).trim();
      }
    } else {
      currentSlide = currentSlide ? currentSlide + ' ' + word : word;
    }
  }

  return {
    slides,
    remainder: currentSlide,
  };
}

/**
 * Post-processes slides to ensure quality and consistency
 */
function postProcessSlides(slides: string[], options: TextSplitterOptions): string[] {
  return slides
    .map(slide => slide.trim())
    .filter(slide => slide.length > 0)
    .filter(slide => getWordCount(slide) >= Math.min(options.minWordsPerSlide, 1))
    .map(slide => {
      // Ensure proper sentence ending
      if (!/[.!?]$/.test(slide) && slide.length > 10) {
        // Only add period if it looks like a complete thought
        const words = slide.split(' ');
        if (words.length >= 3) {
          slide += '.';
        }
      }
      return slide;
    });
}

/**
 * Counts the number of words in a text
 */
function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimates reading time for a slide (in seconds)
 */
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = getWordCount(text);
  return Math.max(3, Math.ceil((wordCount / wordsPerMinute) * 60)); // Minimum 3 seconds
}

/**
 * Validates if text is suitable for slide generation
 */
export function validateTextForSlides(text: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!text.trim()) {
    errors.push('Text cannot be empty');
  }

  if (text.length < 10) {
    errors.push('Text is too short (minimum 10 characters)');
  }

  if (text.length > 10000) {
    warnings.push('Text is very long and may generate many slides');
  }

  const wordCount = getWordCount(text);
  if (wordCount < 3) {
    errors.push('Text must contain at least 3 words');
  }

  if (wordCount > 2000) {
    warnings.push('Text contains many words and may take time to process');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}