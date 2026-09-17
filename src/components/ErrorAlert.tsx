import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, FileSpreadsheet } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry, isRetrying }) => {
  return (
    <div className="max-w-xl mx-auto my-12 px-4" id="menu-fetch-error-state">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-200 shadow-lg text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2">
          Unable to Load Menu
        </h3>

        <p className="text-sm text-stone-600 mb-4 leading-relaxed">
          {message || 'We could not fetch the latest menu from the Google Sheet. Please check your internet connection or try again.'}
        </p>

        <div className="text-xs text-stone-400 bg-stone-50 border border-stone-100 rounded-xl p-3 mb-6 font-mono text-left overflow-x-auto">
          <div className="flex items-center gap-1.5 text-stone-500 font-semibold mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Target Google Sheet ID:</span>
          </div>
          <div className="truncate">1qVLdRKkLlQHDKtC7iZr4O1E-wSpNAjXzEssM-Zsb4og (Menudata)</div>
        </div>

        <button
          id="btn-retry-fetch"
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-98 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying Connection...' : 'Retry Fetching Menu'}</span>
        </button>
      </div>
    </div>
  );
};
export default ErrorAlert;
