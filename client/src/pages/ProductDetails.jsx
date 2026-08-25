import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import ProductGrid from '../components/ProductGrid.jsx';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [storageIdx, setStorageIdx] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    api
      .get(`/products/slug/${slug}`)
      .then((res) => {
        setProduct(res.data.product);
        setRelated(res.data.related);
        setColorIdx(0);
        setStorageIdx(0);
        setActiveImg(0);
        setQuantity(1);
        try {
          const raw = localStorage.getItem('nova_recently_viewed');
          const list = raw ? JSON.parse(raw) : [];
          const filtered = list.filter((id) => id !== res.data.product._id);
          filtered.unshift(res.data.product._id);
          localStorage.setItem('nova_recently_viewed', JSON.stringify(filtered.slice(0, 10)));
        } catch {
          /* ignore */
        }
      })
      .catch(() => setNotFound(true));
    window.scrollTo(0, 0);
  }, [slug]);

  if (notFound) {
    return (
      <div className="container empty-state">
        <h3>{t('no_phones_found')}</h3>
        <Link to="/phones" className="btn btn-primary" style={{ marginTop: 16 }}>{t('shop_phones')}</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="pdp-layout">
          <div className="skeleton" style={{ aspectRatio: '1/1' }} />
          <div>
            <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 32, width: '80%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 100, width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  const color = product.colors?.[colorIdx];
  const storage = product.storageOptions?.[storageIdx];
  const images = color?.images?.length ? color.images : product.images;
  const price = storage?.price ?? product.price;
  const oldPrice = storage?.oldPrice ?? product.oldPrice;
  const stock = storage ? storage.stock : color ? color.stock : product.stock;
  const fav = isFavorite(product._id);

  function handleAddToCart(buyNow) {
    if (stock <= 0) {
      showToast(t('add_to_cart_disabled'), 'error');
      return;
    }
    addItem({
      productId: product._id,
      title: product.title,
      brand: product.brand?.name,
      slug: product.slug,
      image: images?.[0],
      color: color?.name || '',
      colorHex: color?.hex || '',
      storage: storage?.capacity || '',
      price,
      quantity
    });
    if (buyNow) navigate('/checkout');
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;
    try {
      const res = await api.post(`/products/${product._id}/reviews`, reviewForm);
      setProduct(res.data);
      setReviewForm({ name: '', rating: 5, comment: '' });
      showToast('OK');
    } catch {
      showToast('Error', 'error');
    }
  }

  const specs = [
    [t('spec_display'), product.display],
    [t('spec_processor'), product.processor],
    [t('spec_ram'), product.ram?.join(' / ')],
    [t('spec_camera'), product.camera],
    [t('spec_battery'), product.battery],
    [t('spec_os'), product.os],
    [t('spec_connectivity'), product.is5G ? '5G' : '4G LTE'],
    [t('spec_sim'), product.simType],
    [t('spec_dimensions'), product.dimensions],
    [t('spec_weight'), product.weight],
    [t('spec_warranty'), product.warranty]
  ].filter(([, v]) => v);

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <div className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
          <Link to="/phones">{t('nav_phones')}</Link> / <Link to={`/brands/${product.brand?.slug}`}>{product.brand?.name}</Link> / {product.title}
        </div>

        <div className="pdp-layout">
          <div>
            <div className="pdp-gallery-main">
              <img src={images?.[activeImg] || images?.[0]} alt={product.title} className={stock <= 0 ? 'img-faded' : ''} />
              {stock <= 0 && (
                <div className="out-of-stock-overlay">
                  <span className="badge badge-out-of-stock" style={{ fontSize: 13, padding: '8px 16px' }}>
                    {t('badge_out_of_stock')}
                  </span>
                </div>
              )}
            </div>
            {images?.length > 1 && (
              <div className="pdp-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    className={`pdp-thumb ${idx === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(idx)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-muted" style={{ textTransform: 'uppercase', fontSize: 12.5, letterSpacing: '0.05em' }}>
              {product.brand?.name}
            </span>
            <h1 style={{ fontSize: 30, marginTop: 6, marginBottom: 10 }}>{product.title}</h1>

            {product.numReviews > 0 && (
              <div className="flex gap-8" style={{ marginBottom: 14 }}>
                <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
                <span className="text-muted" style={{ fontSize: 13 }}>{product.numReviews}</span>
              </div>
            )}

            <div className="product-price-row" style={{ marginBottom: 20 }}>
              <span className="price" style={{ fontSize: 28 }}>${price?.toFixed(2)}</span>
              {oldPrice > price && <span className="old-price">${oldPrice.toFixed(2)}</span>}
              {oldPrice > price && (
                <span className="discount-tag">-{Math.round(((oldPrice - price) / oldPrice) * 100)}%</span>
              )}
            </div>

            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h5 style={{ fontSize: 13, marginBottom: 10 }}>{t('color_label')}: <span style={{ fontWeight: 400 }}>{color?.name}</span></h5>
                <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                  {product.colors.map((c, idx) => (
                    <button
                      key={c._id || c.name}
                      className={`color-option ${idx === colorIdx ? 'active' : ''} ${c.stock <= 0 ? 'disabled' : ''}`}
                      onClick={() => {
                        setColorIdx(idx);
                        setActiveImg(0);
                      }}
                    >
                      <span className="color-swatch" style={{ background: c.hex }} />
                      {c.name}
                      {c.stock <= 0 && <span className="mini-oos-tag">{t('out_of_stock')}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.storageOptions?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h5 style={{ fontSize: 13, marginBottom: 10 }}>{t('storage_label')}</h5>
                <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                  {product.storageOptions.map((s, idx) => (
                    <button
                      key={s._id || s.capacity}
                      className={`storage-option ${idx === storageIdx ? 'active' : ''}`}
                      disabled={s.stock <= 0}
                      onClick={() => setStorageIdx(idx)}
                    >
                      {s.capacity}{s.stock <= 0 ? ` · ${t('out_of_stock')}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-16" style={{ alignItems: 'center', marginBottom: 20 }}>
              <div className="qty-stepper">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <span className={stock > 0 ? 'stock-pill in' : 'stock-pill out'}>
                {stock > 0 ? `${t('in_stock')} · ${stock}` : t('out_of_stock')}
              </span>
            </div>

            <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-outline" style={{ flex: 1, minWidth: 160 }} disabled={stock <= 0} onClick={() => handleAddToCart(false)}>
                {stock <= 0 ? t('add_to_cart_disabled') : t('add_to_cart')}
              </button>
              <button className="btn btn-signal" style={{ flex: 1, minWidth: 160 }} disabled={stock <= 0} onClick={() => handleAddToCart(true)}>
                {t('buy_now')}
              </button>
              <button className={`icon-btn ${fav ? 'active' : ''}`} style={{ border: '1px solid var(--border-light)' }} onClick={() => toggleFavorite(product)}>
                {fav ? '♥' : '♡'}
              </button>
            </div>

            {product.description && (
              <p className="text-muted" style={{ marginTop: 24, fontSize: 14.5, lineHeight: 1.6 }}>
                {product.description}
              </p>
            )}
          </div>
        </div>

        {specs.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h3 style={{ marginBottom: 20 }}>{t('specifications')}</h3>
            <table className="spec-table">
              <tbody>
                {specs.map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {related?.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h3 style={{ marginBottom: 20 }}>{t('related_phones')}</h3>
            <ProductGrid products={related} />
          </div>
        )}

        <div style={{ marginTop: 64, maxWidth: 700 }}>
          <h3 style={{ marginBottom: 20 }}>{t('customer_reviews')}</h3>
          {product.reviews?.length > 0 ? (
            <div className="flex" style={{ flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {product.reviews.slice().reverse().map((r) => (
                <div className="review-card" key={r._id}>
                  <div className="flex-between">
                    <strong>{r.name}</strong>
                    <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ marginTop: 8, fontSize: 14 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ marginBottom: 28 }}>{t('no_reviews_yet')}</p>
          )}

          <form onSubmit={submitReview} className="card" style={{ padding: 20 }}>
            <h5 style={{ marginBottom: 14 }}>{t('write_review')}</h5>
            <div className="field">
              <label>{t('your_name')}</label>
              <input value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>{t('rating')}</label>
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{t('comment')}</label>
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary">{t('submit_review')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
