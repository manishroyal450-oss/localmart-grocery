import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { FirebaseErrorBoundary } from './components/FirebaseErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseErrorBoundary>
      <FirebaseProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </FirebaseProvider>
    </FirebaseErrorBoundary>
  </StrictMode>,
);
