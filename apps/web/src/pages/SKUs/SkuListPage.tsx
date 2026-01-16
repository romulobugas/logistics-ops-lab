import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

// Define types based on Prisma schema
interface Product {
  code: string;
}

interface Sku {
  id: string;
  ean: string | null;
  description: string | null;
  product: Product;
}

const SkuListPage = () => {
  const [skus, setSkus] = useState<Sku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkus = async () => {
      try {
        setLoading(true);
        const data = await api.get<Sku[]>('/skus');
        setSkus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch SKUs');
      } finally {
        setLoading(false);
      }
    };

    fetchSkus();
  }, []);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>SKUs</h1>
      </header>
      <div className="section">
        <table>
          <thead>
            <tr>
              <th>EAN</th>
              <th>Descrição</th>
              <th>Produto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Carregando...</td></tr>
            ) : error ? (
              <tr><td colSpan={4} style={{ color: 'red' }}>{error}</td></tr>
            ) : (
              skus.map(sku => (
                <tr key={sku.id}>
                  <td>{sku.ean || '-'}</td>
                  <td>{sku.description || '-'}</td>
                  <td>{sku.product.code}</td>
                  <td>
                    <Link to={`/skus/${sku.id}/edit`}>Editar</Link>
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

export default SkuListPage;
