import React, { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class FirebaseErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public declare props: Readonly<ErrorBoundaryProps>;
  public declare setState: (
    state:
      | ErrorBoundaryState
      | Partial<ErrorBoundaryState>
      | ((prevState: Readonly<ErrorBoundaryState>) => ErrorBoundaryState | Partial<ErrorBoundaryState>)
  ) => void;

  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error?.message || 'Something went wrong.';
    try {
      const parsed = JSON.parse(readable);
      if (parsed?.error) {
        if (String(parsed.error).includes('Quota exceeded')) {
          readable =
            'Daily Firebase Firestore free-tier quota limit reach ho gayi hai. Quota kal reset hoga.';
        } else {
          readable = `Database sync notice: ${parsed.error}`;
        }
      }
    } catch {
      // plain text error
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error, info: unknown): void {
    console.error('FirebaseErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-6 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Connection Issue Detected
              </h2>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                {this.state.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FirebaseErrorBoundary;
