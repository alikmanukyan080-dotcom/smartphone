import ProductCard from './ProductCard.jsx';
import useReveal from '../hooks/useReveal.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-4">
      {Array.from({ length: count }).map((_, i) => (
        <div className="product-card" key={i}>
          <div className="skeleton" style={{ aspectRatio: '4/5', width: '100%' }} />
          <div style={{ padding: 16 }}>
            <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 14, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid({ products, emptyTitle, emptyBody }) {
  const { t } = useLanguage();
  useReveal([products]);

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <h3>{emptyTitle || t('no_phones_found')}</h3>
        <p>{emptyBody || t('no_phones_body')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
