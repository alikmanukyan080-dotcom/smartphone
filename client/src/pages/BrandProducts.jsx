import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid.jsx';

export default function BrandProducts() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState(null);

  useEffect(() => {
    setProducts(null);
    api.get(`/brands/${slug}`).then((res) => setBrand(res.data));
    api.get('/products', { params: { brand: slug, limit: 40 } }).then((res) => setProducts(res.data.items));
  }, [slug]);

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: 8 }}>{brand?.name || 'Brand'}</h2>
        {brand?.description && <p className="text-muted" style={{ marginBottom: 28 }}>{brand.description}</p>}
        {!products ? <ProductGridSkeleton /> : <ProductGrid products={products} emptyTitle="No phones from this brand yet" />}
      </div>
    </div>
  );
}
