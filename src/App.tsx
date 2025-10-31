import { useState, useEffect } from 'react';
import { Moon, Sun, Download, Wand2, FileText, Palette, Settings } from 'lucide-react';
import { AppState, Template, Slide, ExportProgress } from './types';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templates';
import { splitTextIntoSlides, validateTextForSlides } from './utils/textSplitter';
import { generateSlides, downloadSlideImage } from './utils/slideGenerator';
import { exportSlidesAsZip } from './utils/zipExporter';
import SlidePreview from './components/SlidePreview';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [appState, setAppState] = useState<AppState>({
    inputText: '',
    selectedTemplate: DEFAULT_TEMPLATE,
    slides: [],
    isGenerating: false,
    isDarkMode: false,
    exportProgress: {
      current: 0,
      total: 0,
      status: 'idle',
      message: '',
    },
    generationOptions: {
      template: DEFAULT_TEMPLATE,
      maxCharactersPerSlide: 130,
      respectSentenceBoundaries: true,
      includeSlideNumbers: true,
      exportFormat: 'png',
      quality: 0.95,
      width: 1080,
      height: 1080,
    },
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setAppState(prev => ({ ...prev, isDarkMode: savedDarkMode }));
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !appState.isDarkMode;
    setAppState(prev => ({ ...prev, isDarkMode: newDarkMode }));
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle text input change
  const handleTextChange = (text: string) => {
    setAppState(prev => ({ ...prev, inputText: text }));
    
    // Validate text
    const validation = validateTextForSlides(text);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
  };

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setAppState(prev => ({
      ...prev,
      selectedTemplate: template,
      generationOptions: {
        ...prev.generationOptions,
        template,
      },
    }));
  };

  // Generate slides
  const handleGenerateSlides = async () => {
    if (!appState.inputText.trim() || validationErrors.length > 0) {
      return;
    }

    setAppState(prev => ({ ...prev, isGenerating: true }));

    try {
      // Split text into slides
      const textSlides = splitTextIntoSlides(appState.inputText, {
        maxCharacters: appState.generationOptions.maxCharactersPerSlide,
        respectSentenceBoundaries: appState.generationOptions.respectSentenceBoundaries,
        minWordsPerSlide: 3,
      });

      // Generate slide objects
      const slides = generateSlides(
        textSlides,
        appState.selectedTemplate
      );

      setAppState(prev => ({ ...prev, slides, isGenerating: false }));
    } catch (error) {
      console.error('Error generating slides:', error);
      setAppState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Download single slide
  const handleDownloadSlide = async (slide: Slide) => {
    try {
      await downloadSlideImage(slide, undefined, {
        format: appState.generationOptions.exportFormat,
        quality: appState.generationOptions.quality,
        width: appState.generationOptions.width,
        height: appState.generationOptions.height,
      });
    } catch (error) {
      console.error('Error downloading slide:', error);
    }
  };

  // Export all slides as ZIP
  const handleExportZip = async () => {
    if (appState.slides.length === 0) return;

    try {
      await exportSlidesAsZip(
        appState.slides,
        (progress: ExportProgress) => {
          setAppState(prev => ({ ...prev, exportProgress: progress }));
        },
        {
          filename: 'carousel-slides',
          includeMetadata: true,
        },
        {
          format: appState.generationOptions.exportFormat,
          quality: appState.generationOptions.quality,
          width: appState.generationOptions.width,
          height: appState.generationOptions.height,
        }
      );
    } catch (error) {
      console.error('Error exporting ZIP:', error);
      setAppState(prev => ({
        ...prev,
        exportProgress: {
          current: 0,
          total: 0,
          status: 'error',
          message: 'Export failed',
        },
      }));
    }
  };

  const isExporting = appState.exportProgress.status === 'generating' || appState.exportProgress.status === 'exporting';

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Text to Carousel Generator
              </h1>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title={appState.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {appState.isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Text Input */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Input Text
              </h2>
              
              <textarea
                value={appState.inputText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter your text here. It will be automatically split into slides based on your settings..."
                className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              
              {/* Validation Messages */}
              {validationErrors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationWarnings.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                    {validationWarnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {appState.inputText.length} characters • {appState.inputText.split(/\s+/).filter(w => w.length > 0).length} words
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Template
              </h2>
              
              <div className="space-y-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      appState.selectedTemplate.id === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <div
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        style={{
                          background: template.gradient
                            ? `linear-gradient(${template.gradient.direction}, ${template.gradient.from}, ${template.gradient.to})`
                            : template.backgroundColor,
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Characters per Slide
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={appState.generationOptions.maxCharactersPerSlide}
                    onChange={(e) => setAppState(prev => ({
                      ...prev,
                      generationOptions: {
                        ...prev.generationOptions,
                        maxCharactersPerSlide: parseInt(e.target.value),
                      },
                    }))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {appState.generationOptions.maxCharactersPerSlide} characters
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="respectSentences"
                    checked={appState.generationOptions.respectSentenceBoundaries}
                    onChange={(e) => setAppState(prev => ({
                      ...prev,
                      generationOptions: {
                        ...prev.generationOptions,
                        respectSentenceBoundaries: e.target.checked,
                      },
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="respectSentences" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Respect sentence boundaries
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeNumbers"
                    checked={appState.generationOptions.includeSlideNumbers}
                    onChange={(e) => setAppState(prev => ({
                      ...prev,
                      generationOptions: {
                        ...prev.generationOptions,
                        includeSlideNumbers: e.target.checked,
                      },
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="includeNumbers" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Include slide numbers
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleGenerateSlides}
                disabled={!appState.inputText.trim() || validationErrors.length > 0 || appState.isGenerating}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {appState.isGenerating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Slides
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div>
            {appState.slides.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Generated Slides ({appState.slides.length})
                  </h2>
                  
                  <button
                    onClick={handleExportZip}
                    disabled={isExporting}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center"
                  >
                    {isExporting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </>
                    )}
                  </button>
                </div>

                {/* Export Progress */}
                {isExporting && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <LoadingSpinner progress={appState.exportProgress} size="md" />
                  </div>
                )}

                {/* Slides Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appState.slides.map((slide) => (
                    <SlidePreview
                      key={slide.id}
                      slide={slide}
                      onDownload={handleDownloadSlide}
                      isGenerating={appState.isGenerating}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {appState.slides.length === 0 && !appState.isGenerating && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No slides generated yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Enter your text and click "Generate Slides" to create beautiful carousel slides.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;