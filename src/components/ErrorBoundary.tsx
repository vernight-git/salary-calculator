import { Component, ReactNode, ErrorInfo } from 'react';
import { getTranslation, type SupportedLanguage } from '../i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  language?: SupportedLanguage;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch React errors and prevent full app crashes.
 * Displays a user-friendly error message instead of a blank screen.
 * Supports internationalization (English and German).
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, you could send this to an error tracking service like Sentry
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Get language from props or default to browser language
      let language = this.props.language;
      if (!language && typeof navigator !== 'undefined' && navigator.language) {
        try {
          const browserLang = navigator.language.split('-')[0];
          language = browserLang === 'de' ? 'de' : 'en';
        } catch {
          language = 'en';
        }
      }
      language = language || 'en';
      const t = getTranslation(language);

      return (
        <div
          style={{
            padding: '2rem',
            maxWidth: '600px',
            margin: '2rem auto',
            textAlign: 'center',
            backgroundColor: '#fee',
            border: '2px solid #c00',
            borderRadius: '8px'
          }}
        >
          <h1>{t.errorBoundaryTitle}</h1>
          <p>{t.errorBoundaryMessage}</p>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            {t.errorBoundaryRefresh}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
