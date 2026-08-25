import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import ProductGrid from '../components/ProductGrid.jsx';

export default function Favorites() {
  const { favorites } = useFavorites();
  const { t } = useLanguage();

  if (favorites.length === 0) {
    return (
      <div className="container empty-state">
        <h3>{t('no_favorites_title')}</h3>
        <p>{t('no_favorites_body')}</p>
        <Link to="/phones" className="btn btn-primary" style={{ marginTop: 16 }}>{t('shop_phones')}</Link>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: 28 }}>{t('your_favorites')}</h2>
        <ProductGrid products={favorites} />
      </div>
    </div>
  );
}
