// Entry point: mounts the App into #root.
// Data folders validate at module load (via their index.js imports in the pages),
// so invalid content throws before the app can mount.
// No network calls, storage, environment variables or telemetry (S8, S10).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
