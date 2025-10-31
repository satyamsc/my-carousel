import { Template } from '../types';

export const TEMPLATES: Template[] = [
  {
    id: 'regular',
    name: 'Regular',
    description: 'Futuristic motivational design with rounded card overlay and neon gradient',
    backgroundColor: '#0D0D0D',
    textColor: '#FFFFFF',
    accentColor: '#B366FF',
    fontFamily: 'Inter, Poppins, sans-serif',
    fontSize: {
      title: '2.5rem',
      content: '1.5rem',
    },
    fontWeight: {
      title: '700',
      content: '700',
    },
    padding: '0',
    borderRadius: '0',
    shadow: 'none',
    gradient: {
      from: '#0D0D0D',
      to: '#B366FF',
      direction: 'to bottom right',
    },
    textAlign: 'center',
    lineHeight: '1.6',
    letterSpacing: '0.025em',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design with subtle elegance',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    accentColor: '#3b82f6',
    fontFamily: 'Inter, Poppins, sans-serif',
    fontSize: {
      title: '2.5rem',
      content: '1.5rem',
    },
    fontWeight: {
      title: '700',
      content: '700',
    },
    padding: '2.5rem',
    borderRadius: '0.75rem',
    shadow: '0 10px 25px -3px rgba(59, 130, 246, 0.15)',
    border: {
      width: '2px',
      color: '#3b82f6',
      style: 'solid',
    },
    textAlign: 'center',
    lineHeight: '1.6',
    letterSpacing: '0.025em',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High-contrast design with strong visual impact',
    backgroundColor: '#1e1b4b',
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    fontFamily: 'Inter, Poppins, sans-serif',
    fontSize: {
      title: '2.5rem',
      content: '1.5rem',
    },
    fontWeight: {
      title: '700',
      content: '700',
    },
    padding: '3.5rem',
    borderRadius: '1rem',
    shadow: '0 20px 25px -5px rgba(251, 191, 36, 0.3)',
    border: {
      width: '3px',
      color: '#fbbf24',
      style: 'solid',
    },
    textAlign: 'center',
    lineHeight: '1.6',
    letterSpacing: '0.025em',
  },
];

export const DEFAULT_TEMPLATE = TEMPLATES[0];

export const TEMPLATE_PREVIEW_STYLES = {
  'regular': {
    background: 'linear-gradient(135deg, #2d2d3a 0%, #8b5cf6 100%)',
    color: '#ffffff',
  },
  'minimal': {
    background: '#ffffff',
    color: '#1e293b',
    border: '2px solid #3b82f6',
  },
  'bold': {
    background: '#1e1b4b',
    color: '#ffffff',
    border: '3px solid #fbbf24',
  },
} as const;