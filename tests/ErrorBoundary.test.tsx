import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  it('catches errors and displays error UI', () => {
    render(
      <ErrorBoundary language="en">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });

  it('displays German error message when language is de', () => {
    render(
      <ErrorBoundary language="de">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Hoppla/i)).toBeInTheDocument();
    expect(screen.getByText(/schief gelaufen/i)).toBeInTheDocument();
  });

  it('displays English error message when language is en', () => {
    render(
      <ErrorBoundary language="en">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('shows refresh button', () => {
    render(
      <ErrorBoundary language="en">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveTextContent(/Refresh/i);
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error fallback</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });

  it('logs error to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('detects browser language when not specified', () => {
    // Mock navigator.language to German
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'de-DE'
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Hoppla/i)).toBeInTheDocument();
  });

  it('defaults to English when browser language detection fails', () => {
    // Mock navigator.language to trigger fallback
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-FR'  // Unsupported language
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('handles errors with no message', () => {
    function ThrowNoMessage() {
      throw new Error();
    }

    render(
      <ErrorBoundary language="en">
        <ThrowNoMessage />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('does not show error when child does not throw', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });
});
