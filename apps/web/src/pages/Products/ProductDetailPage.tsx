import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

// Define types based on Prisma schema
interface Unit {
  abbreviation: string;
}

interface Sku {
  id: string;
  ean: string | null;
  description: string | null;
  unit: Unit;
}

interface Product {
  id: string;
  code: string;
  description: string;
  skus: Sku[];
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.get<Product>(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!product) return <div>Produto não encontrado.</div>;

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <Link to="/products">Voltar para Produtos</Link>
        <h1>{product.code} - {product.description}</h1>
      </header>

      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>SKUs Associados</h3>
          <Link to={`/products/${product.id}/skus/new`} className="btn btn-primary">Novo SKU</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>EAN</th>
              <th>Descrição</th>
              <th>Unidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {product.skus.length > 0 ? (
              product.skus.map(sku => (
                <tr key={sku.id}>
                  <td>{sku.ean || '-'}</td>
                  <td>{sku.description || '-'}</td>
                  <td>{sku.unit.abbreviation}</td>
                  <td>
                    <Link to={`/skus/${sku.id}/edit`}>Editar</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>Nenhum SKU cadastrado para este produto.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetailPage;
