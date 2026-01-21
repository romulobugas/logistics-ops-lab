import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import '../../styles/stock-shared.css';
import '../../styles/stock-balance.css';

interface StockBalance {
  id: string;
  quantity: number;
  updatedAt: string;
  sku: {
    id: string;
    ean?: string;
    brand?: string;
    color?: string;
    size?: string;
    unit?: {
      id: string;
      abbreviation: string;
    };
    product?: {
      id: string;
      code: string;
      name: string;
    };
  };
}

const StockBalancePage = () => {
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const data = await api.get<StockBalance[]>('/stock/balances');
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar saldo de estoque');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const filteredBalances = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return balances;
    return balances.filter((balance) => {
      const sku = balance.sku;
      return [
        sku.ean,
        sku.brand,
        sku.color,
        sku.size,
        sku.product?.name,
        sku.product?.code,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [balances, search]);

  const totalSkus = balances.length;
  const totalQuantity = balances.reduce((acc, balance) => acc + balance.quantity, 0);

  if (loading) {
    return <div className="muted">Carregando saldos...</div>;
  }

  return (
    <div className="stock-page">
      <header className="stock-header">
        <div>
          <h1>Saldo de Estoque</h1>
          <p className="muted">Acompanhe o saldo atual por SKU e produto.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchBalances}>Atualizar</button>
      </header>

      <section className="stock-panel stock-balance-grid">
        <div className="stock-balance-summary">
          <div className="balance-card">
            <span className="muted">SKUs monitorados</span>
            <strong>{totalSkus}</strong>
          </div>
          <div className="balance-card">
            <span className="muted">Quantidade total</span>
            <strong>{totalQuantity}</strong>
          </div>
        </div>

        <div className="balance-filter">
          <div className="field">
            <label>Buscar SKU / Produto</label>
            <input
              className="input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="EAN, marca, produto..."
            />
          </div>
        </div>
      </section>

      <section className="stock-panel">
        {error && <div className="error-state">{error}</div>}
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Produto</th>
              <th>Detalhes</th>
              <th>Unidade</th>
              <th>Saldo</th>
              <th>Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {!filteredBalances.length ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  Nenhum SKU encontrado.
                </td>
              </tr>
            ) : (
              filteredBalances.map((balance) => (
                <tr key={balance.id}>
                  <td><strong>{balance.sku.ean || '-'}</strong></td>
                  <td>{balance.sku.product?.name || '-'}</td>
                  <td className="muted">
                    {[balance.sku.brand, balance.sku.color, balance.sku.size]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </td>
                  <td>{balance.sku.unit?.abbreviation || '-'}</td>
                  <td><strong>{balance.quantity}</strong></td>
                  <td>{new Date(balance.updatedAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StockBalancePage;
