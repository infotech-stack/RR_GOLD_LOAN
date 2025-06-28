import React from 'react';
import { createRoot } from 'react-dom/client'; // ✅ React 18
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './store';
import { register } from './serviceWorker';
import './fontLoader';
import 'bootstrap/dist/css/bootstrap.min.css';

const container = document.getElementById('root');
const root = createRoot(container); // ✅ Create root for React 18

root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);

register();
