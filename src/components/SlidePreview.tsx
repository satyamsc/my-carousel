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

  const getSlideStyle = () => {
    const template = slide.template;
    let style: React.CSSProperties = {
      backgroundColor: template.backgroundColor,
      color: template.textColor,
      fontFamily: template.fontFamily,
      padding: '1rem',
      borderRadius: template.borderRadius,
      boxShadow: template.shadow,
      textAlign: template.textAlign,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: template.textAlign === 'center' ? 'center' : 
                  template.textAlign === 'right' ? 'flex-end' : 'flex-start',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    };

    // Apply gradient background if specified
    if (template.gradient) {
      style.background = `linear-gradient(${template.gradient.direction}, ${template.gradient.from}, ${template.gradient.to})`;
    }

    // Apply border if specified
    if (template.border) {
      style.border = `${template.border.width} ${template.border.style} ${template.border.color}`;
    }

    return style;
  };

  const getFullSizeSlideStyle = () => {
    const template = slide.template;
    let style: React.CSSProperties = {
      width: '600px',
      height: '600px',
      fontFamily: template.fontFamily,
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: template.textAlign === 'center' ? 'center' : 
                  template.textAlign === 'right' ? 'flex-end' : 'flex-start',
    };

    // Apply padding if specified
    if (template.padding && template.padding !== '0') {
      style.padding = template.padding;
    }

    // Apply borderRadius if specified
    if (template.borderRadius && template.borderRadius !== '0') {
      style.borderRadius = template.borderRadius;
    }

    // Apply shadow if specified
    if (template.shadow && template.shadow !== 'none') {
      style.boxShadow = template.shadow;
    }

    // Apply background
    if (!template.gradient && template.backgroundColor) {
      style.backgroundColor = template.backgroundColor;
    }

    // Apply gradient background if specified
    if (template.gradient) {
      if (template.id === 'regular') {
        // Special gradient for Regular
        style.background = `radial-gradient(ellipse at 70% 50%, #7A00FF 0%, #B366FF 30%, #0D0D0D 70%)`;
      } else {
        style.background = `linear-gradient(${template.gradient.direction}, ${template.gradient.from}, ${template.gradient.to})`;
      }
    }

    // Apply border if specified
    if (template.border) {
      style.border = `${template.border.width} ${template.border.style} ${template.border.color}`;
    }

    return style;
  };

  return (
    <div
      className={`relative group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Container */}
      <div className="relative overflow-hidden rounded-t-lg">
        <div
          className="w-[200px] h-[200px] relative"
          style={getSlideStyle()}
        >
          {/* Header Card */}
          {slide.template.headerCard?.enabled && (
            <div 
              className="absolute z-10"
              style={{
                top: slide.template.headerCard.position.includes('top') ? '0.5rem' : 'auto',
                bottom: slide.template.headerCard.position.includes('bottom') ? '0.5rem' : 'auto',
                left: slide.template.headerCard.position.includes('left') ? '0.5rem' : 'auto',
                right: slide.template.headerCard.position.includes('right') ? '0.5rem' : 'auto',
                backgroundColor: slide.template.headerCard.backgroundColor,
                color: slide.template.headerCard.textColor,
                padding: '0.375rem', // Scaled down for preview
                borderRadius: slide.template.headerCard.borderRadius,
                boxShadow: slide.template.headerCard.shadow,
                fontSize: '0.5rem', // Scaled down for preview
                fontWeight: slide.template.headerCard.fontWeight,
                fontFamily: slide.template.fontFamily,
                maxWidth: '120px', // Limit width for preview
              }}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="font-semibold">{slide.template.headerCard.name}</span>
                {slide.template.headerCard.linkedinIcon && (
                  <span className="text-blue-600 text-xs">in</span>
                )}
              </div>
              <div 
                className="text-xs leading-tight opacity-90"
                style={{ fontSize: '0.4rem' }} // Even smaller for expertise tags
              >
                {slide.template.headerCard.title}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div 
            className="flex-1 flex items-center p-4"
            style={{
              fontSize: '0.75rem', // Scaled down for preview
              fontWeight: slide.template.fontWeight.content,
              lineHeight: slide.template.lineHeight,
              letterSpacing: slide.template.letterSpacing,
              textAlign: slide.template.textAlign,
              marginTop: slide.template.headerCard?.enabled ? '2rem' : '0', // Add space for header card
              paddingLeft: '1.5rem', // More left padding to match reference
              justifyContent: 'flex-start', // Align to left instead of center
            }}
          >
            {slide.content}
          </div>
          
          {/* Slide Number */}
          <div 
            className="absolute bottom-2 right-2 text-xs opacity-80"
            style={{
              color: slide.template.accentColor,
              fontFamily: slide.template.fontFamily,
            }}
          >
            {slide.slideNumber} / {slide.totalSlides}
          </div>
        </div>

        {/* Hover Overlay */}
        {isHovered && !isGenerating && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200">
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download slide"
              >
                {isDownloading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-4 h-4 text-gray-700" />
                )}
              </button>
              <button
                onClick={handlePreview}
                className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all duration-200"
                title="Preview slide"
              >
                <Eye className="w-4 h-4 text-gray-700" />
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

      {/* Slide Info */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Slide {slide.slideNumber}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {slide.template.name}
          </span>
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {slide.content}
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {slide.content.length} chars
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {slide.content.split(/\s+/).filter(word => word.length > 0).length} words
          </span>
        </div>
      </div>

      {/* Download Progress Indicator */}
      {isDownloading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleClosePreview}
        >
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClosePreview}
              className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-700 bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all duration-200 shadow-lg"
              title="Close preview"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Slide {slide.slideNumber} Preview
                </h3>
                
                {/* Full Size Slide Preview */}
                <div className="relative">
                  <div style={getFullSizeSlideStyle()}>
                    {/* Header Card */}
                    {slide.template.headerCard?.enabled && (
                      <div 
                        className="absolute z-10"
                        style={{
                          top: slide.template.headerCard.position.includes('top') ? '2rem' : 'auto',
                          bottom: slide.template.headerCard.position.includes('bottom') ? '2rem' : 'auto',
                          left: slide.template.headerCard.position.includes('left') ? '2rem' : 'auto',
                          right: slide.template.headerCard.position.includes('right') ? '2rem' : 'auto',
                          backgroundColor: slide.template.headerCard.backgroundColor,
                          color: slide.template.headerCard.textColor,
                          padding: slide.template.headerCard.padding,
                          borderRadius: slide.template.headerCard.borderRadius,
                          boxShadow: slide.template.headerCard.shadow,
                          fontSize: slide.template.headerCard.fontSize,
                          fontWeight: slide.template.headerCard.fontWeight,
                          fontFamily: slide.template.fontFamily,
                          maxWidth: '300px',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{slide.template.headerCard.name}</span>
                          {slide.template.headerCard.linkedinIcon && (
                            <span 
                              className="text-white text-xs px-1 py-0.5 rounded font-bold"
                              style={{
                                backgroundColor: slide.template.id === 'regular' ? '#FF6B35' : '#0077b5'
                              }}
                            >
                              in
                            </span>
                          )}
                        </div>
                        <div className="text-xs leading-tight opacity-90">
                          {slide.template.headerCard.title}
                        </div>
                      </div>
                    )}

                    {/* Main Content */}
                    <div 
                      className="flex-1 flex items-center justify-center"
                      style={{
                        paddingLeft: '6rem',
                        paddingRight: '6rem',
                        paddingTop: slide.template.headerCard?.enabled ? '4rem' : '2rem',
                        paddingBottom: '4rem',
                        textAlign: 'center',
                      }}
                    >
                      {slide.template.id === 'regular' ? (
                        <div
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            borderRadius: '1.5rem',
                            padding: '3rem 2.5rem',
                            margin: '2rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                            maxWidth: '600px',
                            width: '100%',
                          }}
                        >
                          {(() => {
                            const structured = analyzeContent(slide.content);
                            const { title, body, visual, visualSnippet } = structured;
                            const showStructured = Boolean(title || body || visual);
                            if (!showStructured) {
                              return (
                                <div
                                  style={{
                                    fontFamily: slide.template.fontFamily,
                                    fontSize: slide.template.fontSize.content,
                                    fontWeight: slide.template.fontWeight.content,
                                    color: slide.template.textColor,
                                    lineHeight: slide.template.lineHeight,
                                    letterSpacing: slide.template.letterSpacing,
                                    textAlign: 'center',
                                  }}
                                >
                                  {slide.content.toLowerCase()}
                                </div>
                              );
                            }

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                                {title && (
                                  <div
                                    style={{
                                      fontFamily: slide.template.fontFamily,
                                      fontSize: slide.template.fontSize.title,
                                      fontWeight: slide.template.fontWeight.title,
                                      color: slide.template.textColor,
                                      letterSpacing: slide.template.letterSpacing,
                                    }}
                                  >
                                    {title}
                                  </div>
                                )}
                                {body && (
                                  <div
                                    style={{
                                      fontFamily: slide.template.fontFamily,
                                      fontSize: slide.template.fontSize.content,
                                      fontWeight: slide.template.fontWeight.content,
                                      color: slide.template.textColor,
                                      lineHeight: slide.template.lineHeight,
                                      letterSpacing: slide.template.letterSpacing,
                                    }}
                                  >
                                    {body}
                                  </div>
                                )}
                                {(visual || visualSnippet) && (
                                  <div
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.06)',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      borderRadius: '0.75rem',
                                      padding: '1rem',
                                      overflow: 'auto',
                                      maxHeight: '300px',
                                    }}
                                  >
                                    {visual && (
                                      <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>{visual}</div>
                                    )}
                                    {visualSnippet && (
                                      <pre
                                        style={{
                                          fontFamily:
                                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                          fontSize: '0.875rem',
                                          color: slide.template.textColor,
                                          whiteSpace: 'pre-wrap',
                                          margin: 0,
                                        }}
                                      >
                                        {visualSnippet}
                                      </pre>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div
                          style={{
                            fontFamily: slide.template.fontFamily,
                            fontSize: slide.template.fontSize.content,
                            fontWeight: slide.template.fontWeight.content,
                            color: slide.template.textColor,
                            lineHeight: slide.template.lineHeight,
                            letterSpacing: slide.template.letterSpacing,
                            textAlign: 'center',
                            maxWidth: '100%',
                            wordWrap: 'break-word',
                          }}
                        >
                          {slide.content}
                        </div>
                      )}
                    </div>
                    
                    {/* Slide Number */}
                    <div 
                      className="absolute"
                      style={{
                        bottom: '2rem',
                        right: '2rem',
                        fontFamily: slide.template.fontFamily,
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: slide.template.accentColor,
                        opacity: 0.8,
                      }}
                    >
                      {slide.slideNumber} / {slide.totalSlides}
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

                {/* Slide Info */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Template: {slide.template.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {slide.content.length} characters • {slide.content.split(/\s+/).filter(word => word.length > 0).length} words
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidePreview;