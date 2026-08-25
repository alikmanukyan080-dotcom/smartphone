import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import './styles/global.css';
import './styles/components.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <FavoritesProvider>
            <CartProvider>
              <AdminAuthProvider>
                <App />
              </AdminAuthProvider>
            </CartProvider>
          </FavoritesProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
