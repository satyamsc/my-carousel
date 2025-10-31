import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Slide, ZipExportOptions, SlideGeneratorOptions, ExportProgress } from '../types';
import { generateSlideImage } from './slideGenerator';

const DEFAULT_ZIP_OPTIONS: ZipExportOptions = {
  filename: 'carousel-slides',
  includeMetadata: true,
  compressionLevel: 6,
};

/**
 * Exports multiple slides as a ZIP file
 */
export async function exportSlidesAsZip(
  slides: Slide[],
  onProgress?: (progress: ExportProgress) => void,
  zipOptions: Partial<ZipExportOptions> = {},
  slideOptions: Partial<SlideGeneratorOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_ZIP_OPTIONS, ...zipOptions };
  const zip = new JSZip();

  // Initialize progress
  const totalSteps = slides.length + (opts.includeMetadata ? 1 : 0);
  let currentStep = 0;

  const updateProgress = (status: ExportProgress['status'], message: string) => {
    if (onProgress) {
      onProgress({
        current: currentStep,
        total: totalSteps,
        status,
        message,
      });
    }
  };

  try {
    updateProgress('generating', 'Starting slide generation...');

    // Generate and add each slide to the ZIP
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      updateProgress('generating', `Generating slide ${i + 1} of ${slides.length}...`);

      try {
        const imageBlob = await generateSlideImage(slide, slideOptions);
        const filename = `slide-${String(slide.slideNumber).padStart(2, '0')}.${slideOptions.format || 'png'}`;
        zip.file(filename, imageBlob);
        
        currentStep++;
        updateProgress('generating', `Generated slide ${i + 1} of ${slides.length}`);
      } catch (error) {
        console.error(`Error generating slide ${i + 1}:`, error);
        updateProgress('error', `Failed to generate slide ${i + 1}`);
        throw new Error(`Failed to generate slide ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Add metadata file if requested
    if (opts.includeMetadata) {
      updateProgress('generating', 'Adding metadata...');
      const metadata = generateMetadata(slides, slideOptions);
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));
      currentStep++;
    }

    // Generate and download ZIP
    updateProgress('exporting', 'Creating ZIP file...');
    
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: opts.compressionLevel,
      },
    });

    updateProgress('exporting', 'Downloading ZIP file...');
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${opts.filename}-${timestamp}.zip`;
    
    saveAs(zipBlob, filename);
    
    updateProgress('complete', `Successfully exported ${slides.length} slides`);
  } catch (error) {
    console.error('Error exporting slides:', error);
    updateProgress('error', error instanceof Error ? error.message : 'Export failed');
    throw error;
  }
}

/**
 * Generates metadata for the slide export
 */
function generateMetadata(
  slides: Slide[],
  slideOptions: Partial<SlideGeneratorOptions>
): any {
  return {
    exportInfo: {
      timestamp: new Date().toISOString(),
      totalSlides: slides.length,
      generator: 'Text to Carousel Generator',
      version: '1.0.0',
    },
    slideOptions: {
      width: slideOptions.width || 1080,
      height: slideOptions.height || 1080,
      format: slideOptions.format || 'png',
      quality: slideOptions.quality || 0.95,
    },
    template: slides[0]?.template ? {
      id: slides[0].template.id,
      name: slides[0].template.name,
      description: slides[0].template.description,
    } : null,
    slides: slides.map((slide) => ({
      slideNumber: slide.slideNumber,
      filename: `slide-${String(slide.slideNumber).padStart(2, '0')}.${slideOptions.format || 'png'}`,
      content: slide.content,
      characterCount: slide.content.length,
      wordCount: slide.content.split(/\s+/).filter(word => word.length > 0).length,
    })),
    statistics: {
      totalCharacters: slides.reduce((sum, slide) => sum + slide.content.length, 0),
      totalWords: slides.reduce((sum, slide) => 
        sum + slide.content.split(/\s+/).filter(word => word.length > 0).length, 0
      ),
      averageCharactersPerSlide: Math.round(
        slides.reduce((sum, slide) => sum + slide.content.length, 0) / slides.length
      ),
      averageWordsPerSlide: Math.round(
        slides.reduce((sum, slide) => 
          sum + slide.content.split(/\s+/).filter(word => word.length > 0).length, 0
        ) / slides.length
      ),
    },
  };
}

/**
 * Estimates the total size of the ZIP export
 */
export function estimateZipSize(
  slides: Slide[],
  slideOptions: Partial<SlideGeneratorOptions> = {},
  zipOptions: Partial<ZipExportOptions> = {}
): number {
  const opts = { ...DEFAULT_ZIP_OPTIONS, ...zipOptions };
  
  // Estimate individual slide size
  const slideSize = estimateSlideFileSize(slideOptions);
  const totalSlideSize = slideSize * slides.length;
  
  // Add metadata size if included
  const metadataSize = opts.includeMetadata ? 2048 : 0; // ~2KB for metadata
  
  // Apply compression ratio (ZIP typically achieves 10-30% compression for images)
  const compressionRatio = opts.compressionLevel >= 6 ? 0.85 : 0.9;
  
  return Math.round((totalSlideSize + metadataSize) * compressionRatio);
}

/**
 * Estimates individual slide file size
 */
function estimateSlideFileSize(options: Partial<SlideGeneratorOptions>): number {
  const width = options.width || 1080;
  const height = options.height || 1080;
  const quality = options.quality || 0.95;
  const format = options.format || 'png';
  
  const pixels = width * height;
  
  if (format === 'png') {
    return Math.round(pixels * 0.5); // PNG is typically larger
  } else {
    return Math.round(pixels * 0.1 * quality); // JPEG compression
  }
}

/**
 * Validates ZIP export options
 */
export function validateZipOptions(options: Partial<ZipExportOptions>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (options.filename && !/^[a-zA-Z0-9_-]+$/.test(options.filename)) {
    errors.push('Filename can only contain letters, numbers, hyphens, and underscores');
  }

  if (options.compressionLevel && (options.compressionLevel < 0 || options.compressionLevel > 9)) {
    errors.push('Compression level must be between 0 and 9');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a preview of what will be included in the ZIP export
 */
export function createZipPreview(
  slides: Slide[],
  zipOptions: Partial<ZipExportOptions> = {},
  slideOptions: Partial<SlideGeneratorOptions> = {}
): {
  files: Array<{ name: string; size: number; type: string }>;
  totalSize: number;
  estimatedDownloadTime: number;
} {
  const opts = { ...DEFAULT_ZIP_OPTIONS, ...zipOptions };
  const slideSize = estimateSlideFileSize(slideOptions);
  const format = slideOptions.format || 'png';
  
  const files: Array<{ name: string; size: number; type: string }> = [];
  
  // Add slide files
  slides.forEach(slide => {
    files.push({
      name: `slide-${String(slide.slideNumber).padStart(2, '0')}.${format}`,
      size: slideSize,
      type: `image/${format}`,
    });
  });
  
  // Add metadata file if included
  if (opts.includeMetadata) {
    files.push({
      name: 'metadata.json',
      size: 2048,
      type: 'application/json',
    });
  }
  
  const totalSize = estimateZipSize(slides, slideOptions, zipOptions);
  
  // Estimate download time (assuming 1 Mbps connection)
  const estimatedDownloadTime = Math.ceil(totalSize / (1024 * 1024 / 8)); // seconds
  
  return {
    files,
    totalSize,
    estimatedDownloadTime,
  };
}