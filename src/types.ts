export interface Template {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: {
    title: string;
    content: string;
  };
  fontWeight: {
    title: string;
    content: string;
  };
  padding: string;
  borderRadius: string;
  shadow: string;
  gradient?: {
    from: string;
    to: string;
    direction: string;
  };
  border?: {
    width: string;
    color: string;
    style: string;
  };
  headerCard?: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    name: string;
    title: string;
    linkedinIcon: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    padding: string;
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    shadow: string;
  };
  textAlign: 'left' | 'center' | 'right';
  lineHeight: string;
  letterSpacing: string;
}

export interface Slide {
  id: string;
  content: string;
  template: Template;
  slideNumber: number;
  totalSlides: number;
}

export interface GenerationOptions {
  template: Template;
  maxCharactersPerSlide: number;
  respectSentenceBoundaries: boolean;
  includeSlideNumbers: boolean;
  exportFormat: 'png' | 'jpg';
  quality: number;
  width: number;
  height: number;
}

export interface ExportProgress {
  current: number;
  total: number;
  status: 'idle' | 'generating' | 'exporting' | 'complete' | 'error';
  message: string;
}

export interface SlidePreviewProps {
  slide: Slide;
  onDownload: (slide: Slide) => void;
  isGenerating: boolean;
  className?: string;
}

export interface LoadingSpinnerProps {
  progress?: ExportProgress;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface AppState {
  inputText: string;
  selectedTemplate: Template;
  slides: Slide[];
  isGenerating: boolean;
  isDarkMode: boolean;
  exportProgress: ExportProgress;
  generationOptions: GenerationOptions;
}

export interface TextSplitterOptions {
  maxCharacters: number;
  respectSentenceBoundaries: boolean;
  minWordsPerSlide: number;
}

export interface SlideGeneratorOptions {
  width: number;
  height: number;
  quality: number;
  format: 'png' | 'jpg';
  backgroundColor: string;
}

export interface ZipExportOptions {
  filename: string;
  includeMetadata: boolean;
  compressionLevel: number;
}