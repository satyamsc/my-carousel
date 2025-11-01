import { toPng, toJpeg } from 'html-to-image';
import { Slide, Template, SlideGeneratorOptions } from '../types';
import { analyzeContent } from './contentAnalyzer';

const DEFAULT_OPTIONS: SlideGeneratorOptions = {
  width: 1080,
  height: 1080,
  quality: 0.95,
  format: 'png',
  backgroundColor: '#ffffff',
};

/**
 * Generates slides from text content using the specified template
 */
export function generateSlides(
  textSlides: string[],
  template: Template
): Slide[] {
  return textSlides.map((content, index) => ({
    id: `slide-${index + 1}`,
    content,
    template,
    slideNumber: index + 1,
    totalSlides: textSlides.length,
  }));
}

/**
 * Creates a DOM element for a slide with the specified template styling
 */
export function createSlideElement(slide: Slide, includeSlideNumbers: boolean = true): HTMLElement {
  const slideElement = document.createElement('div');
  slideElement.className = 'slide-container';
  
  // Apply template styles
  const styles = getSlideStyles(slide.template);
  Object.assign(slideElement.style, styles);

  // Add header card if enabled
  if (slide.template.headerCard?.enabled) {
    const headerCard = document.createElement('div');
    headerCard.className = 'header-card';
    headerCard.style.cssText = `
      position: absolute;
      ${slide.template.headerCard.position.includes('top') ? 'top: 2rem;' : ''}
      ${slide.template.headerCard.position.includes('bottom') ? 'bottom: 2rem;' : ''}
      ${slide.template.headerCard.position.includes('left') ? 'left: 2rem;' : ''}
      ${slide.template.headerCard.position.includes('right') ? 'right: 2rem;' : ''}
      background-color: ${slide.template.headerCard.backgroundColor};
      color: ${slide.template.headerCard.textColor};
      padding: ${slide.template.headerCard.padding};
      border-radius: ${slide.template.headerCard.borderRadius};
      box-shadow: ${slide.template.headerCard.shadow};
      font-family: ${slide.template.fontFamily};
      z-index: 10;
      max-width: 300px;
      ${slide.template.headerCard.border ? `border: ${slide.template.headerCard.border};` : ''}
      ${slide.template.headerCard.backdropFilter ? `backdrop-filter: ${slide.template.headerCard.backdropFilter};` : ''}
      ${slide.template.headerCard.backdropFilter ? `-webkit-backdrop-filter: ${slide.template.headerCard.backdropFilter};` : ''}
    `;

    // Name and LinkedIn icon
    const nameContainer = document.createElement('div');
    nameContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    `;

    const nameElement = document.createElement('span');
    nameElement.textContent = slide.template.headerCard.name;
    nameElement.style.cssText = `
      font-size: ${slide.template.headerCard.fontSize};
      font-weight: ${slide.template.headerCard.fontWeight};
    `;

    nameContainer.appendChild(nameElement);

    if (slide.template.headerCard.linkedinIcon) {
      const linkedinIcon = document.createElement('span');
      linkedinIcon.textContent = 'in';
      
      // Use orange color for Satya Vulise template, blue for others
      const iconColor = slide.template.id === 'regular' ? '#FF6B35' : '#0077b5';
      
      linkedinIcon.style.cssText = `
        background-color: ${iconColor};
        color: white;
        padding: 0.125rem 0.25rem;
        border-radius: 0.125rem;
        font-size: 0.75rem;
        font-weight: bold;
        margin-left: 0.5rem;
      `;
      nameContainer.appendChild(linkedinIcon);
    }

    // Title/expertise
    const titleElement = document.createElement('div');
    titleElement.textContent = slide.template.headerCard.title;
    titleElement.style.cssText = `
      font-size: 0.75rem;
      line-height: 1.3;
      opacity: 0.9;
    `;

    headerCard.appendChild(nameContainer);
    headerCard.appendChild(titleElement);
    slideElement.appendChild(headerCard);
  }

  // Analyze content structure
  const structured = analyzeContent(slide.content);

  // Create main content wrapper with two-section layout
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'slide-content';
  contentWrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: center;
  `;

  // Check if we have structured content (Header/Body format)
  if (structured.title && structured.body) {
    // Create container for both sections with spacing
    const sectionsContainer = document.createElement('div');
    sectionsContainer.style.cssText = `
      width: calc(100% - 4rem);
      height: calc(100% - 4rem);
      margin: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    `;

    // Create Header Section - Standalone box with all corners rounded
    const headerSection = document.createElement('div');
    headerSection.className = 'slide-header-section';
    headerSection.style.cssText = `
      height: 20%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.6rem;
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 1rem;
      margin-bottom: 1rem;
    `;

    const headerText = document.createElement('div');
    headerText.textContent = structured.title;
    headerText.style.cssText = `
      font-family: ${slide.template.fontFamily};
      font-size: 1.8rem;
      font-weight: 600;
      color: ${slide.template.textColor};
      text-align: center;
      letter-spacing: ${slide.template.letterSpacing};
      line-height: ${slide.template.lineHeight};
      margin: 0;
      padding: 0;
    `;
    headerSection.appendChild(headerText);

    // Create Body Section - Separate box with all corners rounded
    const bodySection = document.createElement('div');
    bodySection.className = 'slide-body-section';
    bodySection.style.cssText = `
      height: 52%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.4rem 1.6rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 1rem;
      flex-direction: column;
    `;

    const bodyText = document.createElement('div');
    bodyText.style.cssText = `
      font-family: ${slide.template.fontFamily};
      font-size: 1.6rem;
      font-weight: 400;
      color: ${slide.template.textColor};
      line-height: ${slide.template.lineHeight};
      text-align: left;
      letter-spacing: ${slide.template.letterSpacing};
      max-width: 90%;
      word-wrap: break-word;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      margin: 0;
      padding: 0;
    `;

    // Split content by lines and create separate elements for better canvas rendering
    const lines = structured.body.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      const lineElement = document.createElement('div');
      lineElement.textContent = line.trim();
      lineElement.style.cssText = `
        margin: 0;
        padding: 0;
        line-height: ${slide.template.lineHeight};
        text-align: left;
      `;
      bodyText.appendChild(lineElement);
    });

    bodySection.appendChild(bodyText);

    // Add visual content if present
    if (structured.visualSnippet) {
      const codeContainer = document.createElement('div');
      codeContainer.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        padding: 1rem;
        margin-top: 1.5rem;
        overflow: auto;
        max-height: 150px;
        max-width: 90%;
      `;

      const pre = document.createElement('pre');
      pre.style.cssText = `
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.8rem;
        color: ${slide.template.textColor};
        white-space: pre-wrap;
        margin: 0;
        text-align: center;
      `;
      pre.textContent = structured.visualSnippet;
      codeContainer.appendChild(pre);
      bodySection.appendChild(codeContainer);
    }

    sectionsContainer.appendChild(headerSection);
    sectionsContainer.appendChild(bodySection);
    contentWrapper.appendChild(sectionsContainer);
  } else {
    // Fallback for unstructured content - single clean section
    const singleSection = document.createElement('div');
    singleSection.className = 'slide-single-section';
    singleSection.style.cssText = `
      width: calc(100% - 4rem);
      height: calc(100% - 4rem);
      margin: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 1rem;
    `;

    const contentElement = document.createElement('div');
    contentElement.className = 'slide-text';
    
    const textContent = slide.template.id === 'regular' ? 
      slide.content.toLowerCase() : slide.content;
    
    contentElement.style.cssText = `
      font-family: ${slide.template.fontFamily};
      font-size: 1.6rem;
      font-weight: 400;
      color: ${slide.template.textColor};
      line-height: ${slide.template.lineHeight};
      letter-spacing: ${slide.template.letterSpacing};
      max-width: 90%;
      word-wrap: break-word;
      hyphens: auto;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin: 0;
      padding: 0;
    `;

    // Split content by lines and create separate elements for better canvas rendering
    const lines = textContent.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      const lineElement = document.createElement('div');
      lineElement.textContent = line.trim();
      lineElement.style.cssText = `
        margin: 0;
        padding: 0;
        line-height: ${slide.template.lineHeight};
        text-align: left;
      `;
      contentElement.appendChild(lineElement);
    });

    singleSection.appendChild(contentElement);
    contentWrapper.appendChild(singleSection);
  }

  // Add slide number if enabled
  if (includeSlideNumbers) {
    const slideNumberElement = document.createElement('div');
    slideNumberElement.className = 'slide-number';
    slideNumberElement.textContent = `${slide.slideNumber} / ${slide.totalSlides}`;
    slideNumberElement.style.cssText = `
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      font-family: ${slide.template.fontFamily};
      font-size: 0.875rem;
      font-weight: 500;
      color: ${slide.template.accentColor};
      opacity: 0.8;
    `;
    slideElement.appendChild(slideNumberElement);
  }

  // Add signature
  const signatureElement = document.createElement('div');
  signatureElement.className = 'slide-signature';
  signatureElement.textContent = '@satya.vulise';
  signatureElement.style.cssText = `
    position: absolute;
    top: 0.75rem;
    left: 2rem;
    font-family: ${slide.template.fontFamily};
    font-size: 0.875rem;
    font-weight: 400;
    color: ${slide.template.textColor};
    opacity: 0.6;
    font-style: italic;
    letter-spacing: 0.025em;
  `;

  // Assemble the final slide structure
  slideElement.appendChild(contentWrapper);
  slideElement.appendChild(signatureElement);

  return slideElement;
}

/**
 * Converts a slide element to an image blob
 */
export async function slideToImage(
  slideElement: HTMLElement,
  options: Partial<SlideGeneratorOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Temporarily add to DOM for rendering
  const tempContainer = document.createElement('div');
  tempContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${opts.width}px;
    height: ${opts.height}px;
    z-index: -1;
  `;
  
  tempContainer.appendChild(slideElement);
  document.body.appendChild(tempContainer);

  try {
    const dataUrl = await (opts.format === 'png' ? toPng : toJpeg)(slideElement, {
      width: opts.width,
      height: opts.height,
      quality: opts.quality,
      backgroundColor: opts.backgroundColor,
      pixelRatio: 2, // For high-quality output
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    return blob;
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
}

/**
 * Generates and exports a single slide as an image
 */
export async function generateSlideImage(
  slide: Slide,
  options: Partial<SlideGeneratorOptions> = {},
  includeSlideNumbers: boolean = true
): Promise<Blob> {
  const slideElement = createSlideElement(slide, includeSlideNumbers);
  return await slideToImage(slideElement, options);
}

/**
 * Downloads a single slide image
 */
export async function downloadSlideImage(
  slide: Slide,
  filename?: string,
  options: Partial<SlideGeneratorOptions> = {},
  includeSlideNumbers: boolean = true
): Promise<void> {
  const blob = await generateSlideImage(slide, options, includeSlideNumbers);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `slide-${slide.slideNumber}.${options.format || 'png'}`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Gets CSS styles for a slide based on the template
 */
function getSlideStyles(template: Template): Partial<CSSStyleDeclaration> {
  const styles: any = {
    width: '1080px',
    height: '1080px',
    fontFamily: template.fontFamily,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  // Only apply padding if it's not '0'
  if (template.padding && template.padding !== '0') {
    styles.padding = template.padding;
  }

  // Only apply borderRadius if it's not '0'
  if (template.borderRadius && template.borderRadius !== '0') {
    styles.borderRadius = template.borderRadius;
  }

  // Only apply shadow if it's not 'none'
  if (template.shadow && template.shadow !== 'none') {
    styles.boxShadow = template.shadow;
  }

  // Only apply backgroundColor if gradient is not present
  if (!template.gradient && template.backgroundColor) {
    styles.backgroundColor = template.backgroundColor;
  }

  // Apply gradient background if specified
  if (template.gradient) {
    styles.background = `linear-gradient(${template.gradient.direction}, ${template.gradient.from}, ${template.gradient.to})`;
  }

  // Apply border if specified
  if (template.border) {
    styles.border = `${template.border.width} ${template.border.style} ${template.border.color}`;
  }

  return styles;
}

/**
 * Validates slide generation options
 */
export function validateSlideOptions(options: Partial<SlideGeneratorOptions>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (options.width && (options.width < 100 || options.width > 4000)) {
    errors.push('Width must be between 100 and 4000 pixels');
  }

  if (options.height && (options.height < 100 || options.height > 4000)) {
    errors.push('Height must be between 100 and 4000 pixels');
  }

  if (options.quality && (options.quality < 0.1 || options.quality > 1)) {
    errors.push('Quality must be between 0.1 and 1');
  }

  if (options.format && !['png', 'jpg'].includes(options.format)) {
    errors.push('Format must be either "png" or "jpg"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Estimates the file size of a generated slide
 */
export function estimateSlideFileSize(
  options: Partial<SlideGeneratorOptions> = {}
): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const pixels = opts.width * opts.height;
  
  // Rough estimation based on format and quality
  if (opts.format === 'png') {
    return Math.round(pixels * 0.5); // PNG is typically larger
  } else {
    return Math.round(pixels * 0.1 * opts.quality); // JPEG compression
  }
}