import { useState, useEffect } from 'react';
import { Moon, Sun, Download, Wand2, FileText, Palette, Settings } from 'lucide-react';
import { AppState, Template, Slide, ExportProgress } from './types';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templates';
import { validateTextForSlides } from './utils/textSplitter';
import { downloadSlideImage } from './utils/slideGenerator';
import { exportSlidesAsZip } from './utils/zipExporter';
import { aiService } from './utils/aiService';
import SlidePreview from './components/SlidePreview';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [appState, setAppState] = useState<AppState>({
    inputText: '',
    selectedTemplate: DEFAULT_TEMPLATE,
    slides: [],
    isGenerating: false,
    isAIGenerating: false,
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
      numberOfSlides: 5,
      exportFormat: 'png',
      quality: 0.95,
      width: 1080,
      height: 1080,
    },
    aiGeneratedContent: null,
    showAIContent: false,
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
      // Use AI service to generate slide content
      const aiResult = await aiService.generateSlideContent(
        appState.inputText, 
        appState.generationOptions.numberOfSlides
      );

      // Convert AI slides to app slides
      const slides = aiResult.slides.map((aiSlide, index) => ({
        id: `slide-${index + 1}`,
        content: `${aiSlide.title}\n\n${aiSlide.body}`,
        template: appState.selectedTemplate,
        slideNumber: index + 1,
        totalSlides: aiResult.totalSlides,
      }));

      setAppState(prev => ({ 
        ...prev, 
        slides, 
        isGenerating: false,
        aiGeneratedContent: aiResult.slides,
        showAIContent: true
      }));
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
      }, appState.generationOptions.includeSlideNumbers);
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
        },
        appState.generationOptions.includeSlideNumbers
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
    <div className={`min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50 via-emerald-50 to-amber-50 dark:from-slate-950 dark:via-violet-950 dark:via-cyan-950 dark:to-emerald-950 transition-all duration-700 relative overflow-hidden`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
        </div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 dark:from-white/2 dark:via-transparent dark:to-black/10"></div>
      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300 animate-float">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Slide Generator
              </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  AI-Powered Slide Creation
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl bg-gradient-to-r from-gray-100/80 via-gray-200/80 to-gray-300/80 dark:from-gray-700/80 dark:via-gray-800/80 dark:to-gray-900/80 hover:from-gray-200/90 hover:via-gray-300/90 hover:to-gray-400/90 dark:hover:from-gray-600/90 dark:hover:via-gray-700/90 dark:hover:to-gray-800/90 transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/20 dark:border-gray-600/20"
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Text Input */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-600/30 p-8 hover:shadow-3xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden group">
              {/* Card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-cyan-500/5 to-emerald-500/5 dark:from-violet-400/10 dark:via-cyan-400/10 dark:to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative z-10">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Input Text
              </h2>
              
              <textarea
                value={appState.inputText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter your text here. It will be automatically split into slides based on your settings..."
                className="w-full h-48 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-400"
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
            </div>

            {/* Template Selection */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-600/30 p-8 hover:shadow-3xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden group">
              {/* Card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 dark:from-purple-400/10 dark:via-pink-400/10 dark:to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative z-10">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                Template
              </h2>
              
              <div className="space-y-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full p-5 rounded-2xl border-2 transition-all duration-500 text-left transform hover:scale-105 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-sm ${
                      appState.selectedTemplate.id === template.id
                        ? 'border-violet-500 bg-gradient-to-r from-violet-50/80 via-purple-50/80 to-fuchsia-50/80 dark:from-violet-900/40 dark:via-purple-900/40 dark:to-fuchsia-900/40 shadow-2xl ring-2 ring-violet-500/20'
                        : 'border-gray-200/50 dark:border-gray-600/50 hover:border-violet-300 dark:hover:border-violet-400 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80'
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
            </div>

            {/* Generation Controls */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-600/30 p-8 hover:shadow-3xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden group">
              {/* Card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-indigo-500/5 dark:from-green-400/10 dark:via-blue-400/10 dark:to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative z-10">
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="w-5 h-5 text-white" />
                </div>
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
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-blue-400"
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
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-blue-400"
                  />
                  <label htmlFor="includeNumbers" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Include slide numbers
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Slides
                  </label>
                  <select
                    value={appState.generationOptions.numberOfSlides}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value, 10);
                      console.log('Dropdown onChange:', { 
                        selectedValue: e.target.value, 
                        parsedValue: newValue, 
                        currentState: appState.generationOptions.numberOfSlides 
                      });
                      setAppState(prev => ({
                        ...prev,
                        generationOptions: {
                          ...prev.generationOptions,
                          numberOfSlides: newValue,
                        },
                      }));
                    }}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500"
                    style={{
                      color: 'black'
                    }}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleGenerateSlides}
                disabled={!appState.inputText.trim() || validationErrors.length > 0 || appState.isGenerating}
                className="w-full mt-8 bg-gradient-to-r from-violet-600 via-purple-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:via-fuchsia-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-500 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1 disabled:transform-none relative overflow-hidden group"
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
          </div>

          {/* LLM Output Section */}
          {appState.aiGeneratedContent && (
            <div className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-600/30 hover:shadow-3xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.01] relative overflow-hidden group">
              {/* Card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 dark:from-cyan-400/10 dark:via-blue-400/10 dark:to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative z-10">
              <div 
                className="p-4 cursor-pointer flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
                onClick={() => setAppState(prev => ({ ...prev, showAIContent: !prev.showAIContent }))}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  AI Generated Content
                </h2>
                <div className="text-gray-500 dark:text-gray-400">
                  {appState.showAIContent ? '−' : '+'}
                </div>
              </div>
              
              {appState.showAIContent && (
                <div className="p-6">
                  <div className="space-y-6">
                    {appState.aiGeneratedContent.map((slide, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {slide.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {slide.body}
                        </p>
                        {slide.imageDescription && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                            Image suggestion: {slide.imageDescription}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Results Section */}
          <div>
            {appState.slides.length > 0 && (
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-600/30 p-8 hover:shadow-3xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.01] relative overflow-hidden group">
                {/* Card inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5 dark:from-emerald-400/10 dark:via-green-400/10 dark:to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Generated Slides ({appState.slides.length})
                  </h2>
                  
                  <button
                    onClick={handleExportZip}
                    disabled={isExporting}
                    className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-500 disabled:cursor-not-allowed flex items-center shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1 disabled:transform-none relative overflow-hidden group"
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