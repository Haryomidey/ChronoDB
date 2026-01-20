import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ChronoDB } from './server';

// Library Exports
export { ChronoDB };
export * from './backend/types';

// Render App if running in browser
if (typeof document !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
}

export default ChronoDB;