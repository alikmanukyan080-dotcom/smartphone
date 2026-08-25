import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from './ToastContext';

const FavoritesContext = createContext(null);
const STORAGE_KEY = 'nova_favorites_v1';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (id) => favorites.some((f) => f._id === id);

  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f._id === product._id);
      if (exists) {
        showToast('Removed from favorites');
        return prev.filter((f) => f._id !== product._id);
      }
      showToast('Added to favorites');
      return [...prev, product];
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
