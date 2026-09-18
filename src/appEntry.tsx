import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './appShell.tsx';
import './appStyles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
