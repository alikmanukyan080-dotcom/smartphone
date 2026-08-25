import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid.jsx';

export default function CategoryProducts() {
  const { slug } = useParams();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    setProducts(null);
    api.get('/products', { params: { category: slug, limit: 40 } }).then((res) => setProducts(res.data.items));
  }, [slug]);

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: 28, textTransform: 'capitalize' }}>{slug.replace(/-/g, ' ')}</h2>
        {!products ? <ProductGridSkeleton /> : <ProductGrid products={products} emptyTitle="No phones in this category yet" />}
      </div>
    </div>
  );
}
