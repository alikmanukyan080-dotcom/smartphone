import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Cart() {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <h3>{t('cart_empty_title')}</h3>
        <p>{t('cart_empty_body')}</p>
        <Link to="/phones" className="btn btn-primary" style={{ marginTop: 16 }}>{t('shop_phones')}</Link>
      </div>
    );
  }

  const deliveryFee = subtotal >= 200 ? 0 : 5.99;

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: 28 }}>{t('your_cart')}</h2>
        <div className="checkout-layout">
          <div>
            {items.map((item) => (
              <div className="cart-line" key={`${item.productId}-${item.color}-${item.storage}`}>
                <img src={item.image} alt={item.title} />
                <div>
                  <Link to={`/phones/${item.slug}`}><strong>{item.title}</strong></Link>
                  <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {item.color && <span>{t('color_label')}: {item.color} </span>}
                    {item.storage && <span>· {t('storage_label')}: {item.storage}</span>}
                  </div>
                  <div className="flex-between" style={{ marginTop: 10, maxWidth: 220 }}>
                    <div className="qty-stepper">
                      <button onClick={() => updateQuantity(item, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item)}>{t('remove')}</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h4 style={{ marginBottom: 16 }}>{t('order_summary')}</h4>
            <div className="summary-row"><span>{t('subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row">
              <span>{t('delivery')}</span>
              <span>{deliveryFee === 0 ? t('free') : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total"><span>{t('total')}</span><span>${(subtotal + deliveryFee).toFixed(2)}</span></div>
            <Link to="/checkout" className="btn btn-signal btn-block" style={{ marginTop: 20 }}>
              {t('proceed_checkout')}
            </Link>
            <Link to="/phones" className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>
              {t('continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
