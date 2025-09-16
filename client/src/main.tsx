import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TranslateProvider } from './src/contexts/TranslateContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslateProvider>
      <App />
    </TranslateProvider>
  </StrictMode>,
)
