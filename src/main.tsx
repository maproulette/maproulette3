import { QueryProvider } from './contexts/QueryProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Render the app
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <QueryProvider />
  </StrictMode>
);
