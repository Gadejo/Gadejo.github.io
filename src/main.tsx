import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { performanceService } from './services/performanceService'

// Initialize performance monitoring
performanceService.recordMetric('app-initialization', performance.now(), 'render');

// Monitor initial page load
window.addEventListener('load', () => {
  const loadTime = performance.now();
  performanceService.recordMetric('page-load-complete', loadTime, 'network');
  
  // Log performance summary after load
  setTimeout(() => {
    const summary = performanceService.getPerformanceSummary();
    console.log('Performance Summary:', summary);
  }, 1000);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)