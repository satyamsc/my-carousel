import React, { useState } from 'react';
import { Download, Eye, X } from 'lucide-react';
import { SlidePreviewProps } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { analyzeContent } from '../utils/contentAnalyzer';

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  onDownload,
  isGenerating,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Extract analyzed content once to avoid multiple calls
  const analyzedContent = analyzeContent(slide.content);

  // Extract dynamic title from analyzed content
  const getSlideTitle = () => {
    if (analyzedContent.title) {
      return analyzedContent.title;
    }
    // Fallback: use first line or first 50 characters
    const firstLine = slide.content.split('\n')[0].trim();
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + '...';
    }
    return firstLine || 'Slide Content';
  };

  // Get the body content from analyzed content
  const getSlideBody = () => {
    return analyzedContent.body || slide.content;
  };

  const handleDownload = async () => {
    if (isDownloading || isGenerating) return;
    
    setIsDownloading(true);
    try {
      await onDownload(slide);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <>
      <div
        className={`relative group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/50 hover:border-white/40 dark:hover:border-gray-600/50 transform hover:scale-105 hover:-translate-y-2 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      {/* Preview Container */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className="w-[200px] h-[200px] relative flex flex-col items-center justify-center gap-2 p-3">
          {/* Header Box */}
          <div 
            className="flex-shrink-0 rounded-md p-1.5 w-full"
            style={{
              background: slide.template.gradient 
                ? `linear-gradient(${slide.template.gradient.direction}, ${slide.template.gradient.from}, ${slide.template.gradient.to})`
                : slide.template.backgroundColor,
              color: slide.template.textColor,
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div 
              style={{
                fontSize: '0.6rem',
                fontWeight: '700',
                fontFamily: slide.template.fontFamily,
                textAlign: 'center',
              }}
            >
              {getSlideTitle()}
            </div>
          </div>

          {/* Body Content Box */}
          <div 
            className="flex-1 rounded-md p-2.5 flex items-center justify-center w-full"
            style={{
              background: slide.template.gradient 
                ? `linear-gradient(${slide.template.gradient.direction}, ${slide.template.gradient.from}, ${slide.template.gradient.to})`
                : slide.template.backgroundColor,
              color: slide.template.textColor,
            }}
          >
            <div 
              style={{
                fontSize: '0.75rem',
                fontWeight: slide.template.fontWeight.content,
                lineHeight: slide.template.lineHeight,
                letterSpacing: slide.template.letterSpacing,
                textAlign: 'left',
                fontFamily: slide.template.fontFamily,
                whiteSpace: 'pre-line',
                margin: 0,
                padding: 0,
              }}
            >
              {getSlideBody()}
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        {isHovered && !isGenerating && (
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-t-2xl">
            <div className="flex space-x-4">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-110"
                title="Download slide"
              >
                {isDownloading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handlePreview}
                className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                title="Preview slide"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
    </div>

    {/* Preview Modal */}
    {showPreview && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/80 to-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={handleClosePreview}
        >
          <div 
            className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl max-h-[90vh] overflow-auto border border-white/20 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClosePreview}
              className="absolute top-6 right-6 z-10 p-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
              title="Close preview"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                  Slide {slide.slideNumber} Preview
                </h3>
                
                {/* Full Size Slide Preview */}
                <div className="relative">
                  <div 
                    className="flex flex-col items-center justify-center gap-6 p-8"
                    style={{
                      width: '800px',
                      height: '600px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    {/* Header Box */}
                    <div 
                      className="flex-shrink-0 rounded-lg p-5 w-full"
                      style={{
                        background: slide.template.gradient 
                          ? `linear-gradient(${slide.template.gradient.direction}, ${slide.template.gradient.from}, ${slide.template.gradient.to})`
                          : slide.template.backgroundColor,
                        color: slide.template.textColor,
                        height: '96px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div 
                        style={{
                          fontSize: '2rem',
                          fontWeight: '700',
                          fontFamily: slide.template.fontFamily,
                          textAlign: 'center',
                          lineHeight: slide.template.lineHeight,
                          margin: 0,
                          padding: 0,
                        }}
                      >
                        {getSlideTitle()}
                      </div>
                    </div>

                    {/* Body Content Box */}
                    <div 
                      className="flex-1 rounded-lg p-6 flex items-center justify-center w-full"
                      style={{
                        background: slide.template.gradient 
                          ? `linear-gradient(${slide.template.gradient.direction}, ${slide.template.gradient.from}, ${slide.template.gradient.to})`
                          : slide.template.backgroundColor,
                        color: slide.template.textColor,
                      }}
                    >
                      <div 
                        className="w-full"
                        style={{
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: slide.template.fontFamily,
                            fontSize: '1.5rem',
                            fontWeight: slide.template.fontWeight.content,
                            color: slide.template.textColor,
                            lineHeight: slide.template.lineHeight,
                            letterSpacing: slide.template.letterSpacing,
                            textAlign: 'left',
                            maxWidth: '100%',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-line',
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          {getSlideBody()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Signature */}
                    <div 
                      className="absolute"
                      style={{
                        top: '0.75rem',
                        left: '2rem',
                        fontFamily: slide.template.fontFamily,
                        fontSize: '0.875rem',
                        fontWeight: '400',
                        color: slide.template.textColor,
                        opacity: 0.6,
                        fontStyle: 'italic',
                        letterSpacing: '0.025em',
                      }}
                    >
                      @satya.vulise
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SlidePreview;