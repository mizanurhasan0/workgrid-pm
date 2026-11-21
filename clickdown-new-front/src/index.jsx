import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import 'react-quill-new/dist/quill.snow.css';
import App from './App';
import { AuthProvider } from './Context/AuthProvider';
import { GlobalProvider } from './Context/GlobalProvider';
import store from './store';
import './index.css';
import './Components/Theme/theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <GlobalProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GlobalProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
