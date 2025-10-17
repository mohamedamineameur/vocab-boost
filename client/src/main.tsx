import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TranslateProvider } from './contexts/TranslateContext.tsx';

createRoot(document.getElementById('root')!).render(
  <TranslateProvider>
    <App />
  </TranslateProvider>
)
