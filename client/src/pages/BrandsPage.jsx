import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BrandsPage() {
  const [brands, setBrands] = useState(null);

  useEffect(() => {
    api.get('/brands').then((res) => setBrands(res.data));
  }, []);

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: 28 }}>All Brands</h2>
        {!brands ? (
          <div className="grid grid-4">
            {Array.from({ length: 8 }).map((_, i) => <div className="skeleton" key={i} style={{ height: 100 }} />)}
          </div>
        ) : (
          <div className="grid grid-4">
            {brands.map((b) => (
              <Link key={b._id} to={`/brands/${b.slug}`} className="brand-tile" style={{ padding: '36px 16px' }}>
                {b.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
