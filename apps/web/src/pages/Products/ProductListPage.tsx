import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

// Define types based on Prisma schema
interface Sku {
  id: string;
}

interface Product {
  id: string;
  code: string;
  description: string;
  skus: Sku[];
}

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await api.get<Product[]>('/products');
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Produtos</h1>
        <Link to="/products/new" className="btn btn-primary">Novo Produto</Link>
      </header>
      <div className="section">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Nº de SKUs</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Carregando...</td></tr>
            ) : error ? (
              <tr><td colSpan={4} style={{ color: 'red' }}>{error}</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td>{product.code}</td>
                  <td>{product.description}</td>
                  <td>{product.skus.length}</td>
                  <td>
                    <Link to={`/products/${product.id}`}>Ver Detalhes</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListPage;
