import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const [hoverIndex, setHoverIndex] = useState(0);
  const fav = isFavorite(product._id);
  const totalStock =
  product.storageOptions?.reduce((s, o) => s + (o.stock || 0), 0) ||
  product.colors?.reduce((s, c) => s + (c.stock || 0), 0) ||
  product.stock || 0;
const outOfStock = totalStock <= 0;

  const images =
    product.colors?.[hoverIndex]?.images?.length
      ? product.colors[hoverIndex].images
      : product.images;

  return (
    <div className={`product-card reveal ${outOfStock ? 'is-out-of-stock' : ''}`}>
      <div className="product-card-media">
        <button
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product);
          }}
          aria-label="Toggle favorite"
        >
          <HeartIcon filled={fav} />
        </button>

        {product.badges?.length > 0 && (
          <div className="product-badges">
            {product.badges.slice(0, 2).map((b) => (
              <span key={b} className={`badge badge-${b.toLowerCase()}`}>
                {b.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        <Link to={`/phones/${product.slug}`}>
          <img src={images?.[0]} alt={product.title} loading="lazy" className={outOfStock ? 'img-faded' : ''} />
        </Link>

        {outOfStock && (
          <div className="out-of-stock-overlay">
            <span className="badge badge-out-of-stock">{t('badge_out_of_stock')}</span>
          </div>
        )}
      </div>

      <div className="product-card-body">
        <span className="text-muted product-brand">{product.brand?.name}</span>
        <Link to={`/phones/${product.slug}`}>
          <h3 className="product-title">{product.title}</h3>
        </Link>

        {product.colors?.length > 0 && (
          <div className="swatch-row">
            {product.colors.slice(0, 5).map((c, idx) => (
              <span
                key={c._id || c.name}
                className={`swatch-dot ${idx === hoverIndex ? 'active' : ''}`}
                style={{ background: c.hex }}
                title={c.name}
                onMouseEnter={() => setHoverIndex(idx)}
              />
            ))}
          </div>
        )}

        <div className="product-price-row">
          <span className="price">${product.price?.toFixed(2)}</span>
          {product.oldPrice > product.price && (
            <span className="old-price">${product.oldPrice.toFixed(2)}</span>
          )}
          {product.discountPercent > 0 && (
            <span className="discount-tag">-{product.discountPercent}%</span>
          )}
        </div>

        {product.storageOptions?.length > 0 && (
          <div className="mono text-muted product-storage-list">
            {product.storageOptions.map((s) => s.capacity).join(' · ')}
          </div>
        )}

        <Link
          to={`/phones/${product.slug}`}
          className={`btn btn-sm btn-block ${outOfStock ? 'btn-ghost' : 'btn-outline'}`}
          style={{ marginTop: 12 }}
        >
          {outOfStock ? t('out_of_stock') : t('view_details')}
        </Link>
      </div>
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
