import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Catalog() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const SORT_OPTIONS = [
    { value: 'newest', label: t('sort_newest') },
    { value: 'price_asc', label: t('sort_price_asc') },
    { value: 'price_desc', label: t('sort_price_desc') },
    { value: 'popularity', label: t('sort_popularity') },
    { value: 'discount', label: t('sort_discount') },
    { value: 'rating', label: t('sort_rating') }
  ];

  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const storage = searchParams.get('storage') || '';
  const is5G = searchParams.get('is5G') || '';
  const inStock = searchParams.get('inStock') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    api.get('/brands').then((res) => setBrands(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { search, brand, sort, minPrice, maxPrice, storage, is5G, inStock, page, limit: 12 };
    Object.keys(params).forEach((k) => (params[k] === '' ? delete params[k] : null));
    api
      .get('/products', { params })
      .then((res) => setResult(res.data))
      .finally(() => setLoading(false));
  }, [search, brand, sort, minPrice, maxPrice, storage, is5G, inStock, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];

  const activeFilterCount = useMemo(
    () => [brand, minPrice, maxPrice, storage, is5G, inStock].filter(Boolean).length,
    [brand, minPrice, maxPrice, storage, is5G, inStock]
  );

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('catalog_title')}</span>
            <h2 className="section-title">{search ? t('catalog_results_for', { query: search }) : t('catalog_title')}</h2>
          </div>
          <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm mobile-filter-toggle" onClick={() => setMobileFiltersOpen(true)}>
              {t('filters')} {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border-light)' }}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className={`filters-panel ${mobileFiltersOpen ? 'open' : ''}`}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <strong>{t('filters')}</strong>
              <button className="btn btn-ghost btn-sm mobile-filter-toggle" onClick={() => setMobileFiltersOpen(false)}>{t('filters_close')}</button>
            </div>

            <div className="filter-group">
              <h5>{t('filter_brand')}</h5>
              <label className="filter-option">
                <input type="radio" name="brand" checked={!brand} onChange={() => updateParam('brand', '')} /> {t('filter_all_brands')}
              </label>
              {brands.map((b) => (
                <label className="filter-option" key={b._id}>
                  <input
                    type="radio"
                    name="brand"
                    checked={brand === b.slug}
                    onChange={() => updateParam('brand', b.slug)}
                  />
                  {b.name}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h5>{t('filter_price')}</h5>
              <div className="flex gap-8">
                <input
                  type="number"
                  placeholder={t('filter_min')}
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  style={{ width: '50%', padding: 8, border: '1px solid var(--border-light)', borderRadius: 6 }}
                />
                <input
                  type="number"
                  placeholder={t('filter_max')}
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  style={{ width: '50%', padding: 8, border: '1px solid var(--border-light)', borderRadius: 6 }}
                />
              </div>
            </div>

            <div className="filter-group">
              <h5>{t('filter_storage')}</h5>
              <label className="filter-option">
                <input type="radio" name="storage" checked={!storage} onChange={() => updateParam('storage', '')} /> {t('filter_any')}
              </label>
              {storageOptions.map((s) => (
                <label className="filter-option" key={s}>
                  <input type="radio" name="storage" checked={storage === s} onChange={() => updateParam('storage', s)} /> {s}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h5>{t('filter_connectivity')}</h5>
              <label className="filter-option">
                <input type="checkbox" checked={is5G === 'true'} onChange={(e) => updateParam('is5G', e.target.checked ? 'true' : '')} /> {t('filter_5g_only')}
              </label>
            </div>

            <div className="filter-group">
              <h5>{t('filter_availability')}</h5>
              <label className="filter-option">
                <input type="checkbox" checked={inStock === 'true'} onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')} /> {t('filter_in_stock_only')}
              </label>
            </div>

            <button
              className="btn btn-ghost btn-sm btn-block"
              onClick={() => setSearchParams({})}
            >
              {t('filter_clear')}
            </button>
          </aside>

          <div>
            {loading ? (
              <ProductGridSkeleton count={9} />
            ) : (
              <>
                <ProductGrid products={result?.items} emptyTitle={t('no_phones_found')} emptyBody={t('no_phones_body')} />
                {result && result.pages > 1 && (
                  <div className="flex-center gap-8" style={{ marginTop: 32 }}>
                    {Array.from({ length: result.pages }).map((_, i) => (
                      <button
                        key={i}
                        className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => updateParam('page', String(i + 1))}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
