import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid.jsx';
import useReveal from '../hooks/useReveal.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Home() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [popular, setPopular] = useState(null);
  const [newArrivals, setNewArrivals] = useState(null);
  const [deals, setDeals] = useState(null);
  const [heroProduct, setHeroProduct] = useState(null);

  useEffect(() => {
    api.get('/brands').then((res) => setBrands(res.data.slice(0, 6)));
    api.get('/products?sort=popularity&limit=8').then((res) => {
      setPopular(res.data.items);
      setHeroProduct(res.data.items[0] || null);
    });
    api.get('/products?sort=newest&limit=8').then((res) => setNewArrivals(res.data.items));
    api.get('/products?sort=discount&limit=8').then((res) =>
      setDeals(res.data.items.filter((p) => p.discountPercent > 0))
    );
  }, []);

  useReveal([popular, newArrivals, deals]);

  const whyItems = [
    [t('why_1_title'), t('why_1_body')],
    [t('why_2_title'), t('why_2_body')],
    [t('why_3_title'), t('why_3_body')],
    [t('why_4_title'), t('why_4_body')]
  ];

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-eyebrow">{t('hero_eyebrow')}</span>
            <h1>{t('hero_title')}</h1>
            <p className="lead">{t('hero_lead')}</p>
            <div className="hero-actions">
              <Link to="/phones" className="btn btn-signal">{t('hero_shop_now')}</Link>
              <Link to="/brands" className="btn btn-outline-light">{t('hero_explore')}</Link>
            </div>
          </div>
          <div className="hero-image-wrap">
            {heroProduct && (
              <img
                src={heroProduct.colors?.[0]?.images?.[0] || heroProduct.images?.[0]}
                alt={heroProduct.title}
              />
            )}
          </div>
        </div>
        <div className="container hero-spec-ticker">
          <span><b>5G</b> READY</span>
          <span><b>OLED / AMOLED</b> DISPLAYS</span>
          <span><b>100W</b> FAST CHARGING</span>
          <span><b>1–2 YR</b> OFFICIAL WARRANTY</span>
          <span><b>1–3 DAY</b> DELIVERY</span>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">{t('section_featured_brands')}</span>
              <h2 className="section-title">{t('section_shop_by_brand')}</h2>
            </div>
            <Link to="/brands" className="btn btn-ghost">{t('section_view_all_brands')}</Link>
          </div>
          <div className="brand-strip reveal">
            {brands.map((b, idx) => (
              <Link key={b._id} to={`/brands/${b.slug}`} className={`brand-tile brand-tile-${idx % 6}`}>
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dim">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">{t('section_popular')}</span>
              <h2 className="section-title">{t('section_popular_title')}</h2>
            </div>
            <Link to="/phones?sort=popularity" className="btn btn-ghost">{t('section_see_all')}</Link>
          </div>
          {popular ? <ProductGrid products={popular} /> : <ProductGridSkeleton />}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">{t('section_new')}</span>
              <h2 className="section-title">{t('section_new_title')}</h2>
            </div>
            <Link to="/phones?sort=newest" className="btn btn-ghost">{t('section_see_all')}</Link>
          </div>
          {newArrivals ? <ProductGrid products={newArrivals} /> : <ProductGridSkeleton />}
        </div>
      </section>

      {deals && deals.length > 0 && (
        <section className="section section-dim">
          <div className="container">
            <div className="section-head reveal">
              <div>
                <span className="eyebrow">{t('section_deals')}</span>
                <h2 className="section-title">{t('section_deals_title')}</h2>
              </div>
              <Link to="/phones?sort=discount" className="btn btn-ghost">{t('section_see_all')}</Link>
            </div>
            <ProductGrid products={deals} />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">{t('section_why')}</span>
              <h2 className="section-title">{t('section_why_title')}</h2>
            </div>
          </div>
          <div className="grid grid-4 reveal">
            {whyItems.map(([title, body], idx) => (
              <div className={`card why-card why-card-${idx % 4}`} style={{ padding: 22 }} key={title}>
                <h4 style={{ marginBottom: 8 }}>{title}</h4>
                <p className="text-muted" style={{ fontSize: 14 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container flex-between reveal" style={{ flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span className="eyebrow">Newsletter</span>
            <h2 className="section-title" style={{ color: 'white' }}>{t('newsletter_title')}</h2>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}

function NewsletterForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <form
      className="flex gap-8"
      style={{ flexWrap: 'wrap' }}
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setDone(true);
      }}
    >
      {done ? (
        <span style={{ color: 'white' }}>{t('newsletter_thanks')}!</span>
      ) : (
        <>
          <input
            type="email"
            required
            placeholder={t('newsletter_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '13px 16px', borderRadius: 6, border: 'none', minWidth: 260 }}
          />
          <button type="submit" className="btn btn-signal">{t('newsletter_button')}</button>
        </>
      )}
    </form>
  );
}
