import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingSpinnerProps } from '../types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  progress,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (!progress) {
    return (
      <div className={`flex items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-blue-400`} />
      </div>
    );
  }

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${containerSizeClasses[size]} ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-blue-400`} />
        {progress.total > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-semibold text-blue-600 dark:text-blue-400 ${textSizeClasses[size]}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progress.total > 0 && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between items-center mb-1">
            <span className={`${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-300`}>
              Progress
            </span>
            <span className={`${textSizeClasses[size]} text-gray-500 dark:text-gray-400`}>
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      {progress.message && (
        <div className="text-center max-w-xs">
          <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 leading-tight`}>
            {progress.message}
          </p>
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            progress.status === 'generating'
              ? 'bg-blue-500 animate-pulse'
              : progress.status === 'exporting'
              ? 'bg-purple-500 animate-pulse'
              : progress.status === 'complete'
              ? 'bg-green-500'
              : progress.status === 'error'
              ? 'bg-red-500'
              : 'bg-gray-400'
          }`}
        />
        <span className={`${textSizeClasses[size]} font-medium capitalize text-gray-700 dark:text-gray-300`}>
          {progress.status === 'generating' && 'Generating'}
          {progress.status === 'exporting' && 'Exporting'}
          {progress.status === 'complete' && 'Complete'}
          {progress.status === 'error' && 'Error'}
          {progress.status === 'idle' && 'Ready'}
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;