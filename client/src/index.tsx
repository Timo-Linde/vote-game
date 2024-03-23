import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css'
import "tw-elements-react/dist/css/tw-elements-react.min.css";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);