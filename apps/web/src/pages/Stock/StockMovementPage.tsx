import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../../services/api';
import '../../styles/stock-shared.css';
import '../../styles/stock-movement.css';

interface Product {
  id: string;
  code: string;
  name: string;
  skus: SKU[];
}

interface SKU {
  id: string;
  ean?: string;
  brand?: string;
  color?: string;
  size?: string;
  product?: {
    id: string;
    code: string;
    name: string;
  };
}

interface StockLocation {
  id: string;
  deposit: string;
  street: string;
  block: string;
  level: string;
  apartment: string;
}

interface StockLot {
  id: string;
  lotCode?: string;
  expiryDate?: string;
  quantity: number;
  locationId: string;
  location: StockLocation;
  sku: SKU;
}

const StockMovementPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [lots, setLots] = useState<StockLot[]>([]);
  const [selectedSkuId, setSelectedSkuId] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingLots, setLoadingLots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const skuOptions = useMemo(() => products.flatMap((product) => product.skus), [products]);
  const selectedSku = useMemo(() => skuOptions.find((sku) => sku.id === selectedSkuId), [skuOptions, selectedSkuId]);
  const selectedLot = useMemo(() => lots.find((lot) => lot.id === selectedLotId), [lots, selectedLotId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, locationsData] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<StockLocation[]>('/stock/locations'),
      ]);
      setProducts(productsData);
      setLocations(locationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar dados iniciais');
    } finally {
      setLoading(false);
    }
  };

  const fetchLots = async (skuId: string) => {
    try {
      setLoadingLots(true);
      const data = await api.get<StockLot[]>(`/stock/lots?skuId=${skuId}`);
      setLots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar lotes');
    } finally {
      setLoadingLots(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setLots([]);
    setSelectedLotId('');
    if (selectedSkuId) {
      fetchLots(selectedSkuId);
    }
  }, [selectedSkuId]);

  useEffect(() => {
    if (selectedLot) {
      setQuantity(selectedLot.quantity);
    }
  }, [selectedLot]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedSku || !selectedLot) {
      setError('Selecione um SKU e um lote de origem.');
      return;
    }

    if (!destinationLocationId) {
      setError('Informe o endereço de destino.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/stock/transfer', {
        skuCode: selectedSku.ean,
        lotId: selectedLot.id,
        locationId: selectedLot.locationId,
        destinationLocationId,
        quantity,
        reason: reason || 'Transferência solicitada via painel',
      });
      setMessage('Movimentação criada e enviada para convocação ativa.');
      setDestinationLocationId('');
      setReason('');
      fetchLots(selectedSku.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao solicitar transferência');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="muted">Carregando dados...</div>;
  }

  return (
    <div className="stock-page">
      <header className="stock-header">
        <div>
          <h1>Movimentação de SKU</h1>
          <p className="muted">Selecione o estoque de origem e envie para um endereço destino.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchInitialData}>Atualizar</button>
      </header>

      <div className="stock-movement-grid">
        <section className="stock-panel">
          <div className="panel-header">
            <div>
              <h3>Solicitar transferência</h3>
              <p className="muted">A atividade será criada e ficará disponível na convocação ativa.</p>
            </div>
          </div>
          <form className="stock-movement-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>SKU</label>
              <select
                className="select"
                value={selectedSkuId}
                onChange={(event) => setSelectedSkuId(event.target.value)}
                required
              >
                <option value="">Selecione um SKU</option>
                {skuOptions.map((sku) => (
                  <option key={sku.id} value={sku.id}>
                    {sku.ean || 'SKU'} • {sku.product?.name || sku.brand || 'Sem descrição'}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Lote / endereço de origem</label>
              <select
                className="select"
                value={selectedLotId}
                onChange={(event) => setSelectedLotId(event.target.value)}
                disabled={!lots.length}
                required
              >
                <option value="">Selecione o lote</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.lotCode || 'Sem lote'} • {lot.location.deposit}-{lot.location.street}-{lot.location.block}-{lot.location.level}-{lot.location.apartment}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Quantidade</label>
              <input
                className="input"
                type="number"
                min={1}
                max={selectedLot?.quantity ?? undefined}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                required
              />
            </div>

            <div className="field">
              <label>Endereço destino</label>
              <select
                className="select"
                value={destinationLocationId}
                onChange={(event) => setDestinationLocationId(event.target.value)}
                required
              >
                <option value="">Selecione o destino</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.deposit}-{location.street}-{location.block}-{location.level}-{location.apartment}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Motivo</label>
              <textarea
                className="textarea"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Opcional"
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Enviando...' : 'Criar atividade'}
            </button>
            {message && <span className="muted">{message}</span>}
            {error && <span className="error-state">{error}</span>}
          </form>
        </section>

        <section className="stock-panel">
          <div className="panel-header">
            <div>
              <h3>Estoque disponível</h3>
              <p className="muted">Selecione um lote para preencher automaticamente a origem.</p>
            </div>
            <span className="badge">{lots.length} lotes</span>
          </div>

          {loadingLots ? (
            <div className="muted">Carregando lotes...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Endereço</th>
                  <th>Qtd.</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {!lots.length ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Selecione um SKU para listar os lotes.
                    </td>
                  </tr>
                ) : (
                  lots.map((lot) => (
                    <tr key={lot.id} className={lot.id === selectedLotId ? 'row-selected' : undefined}>
                      <td>{lot.lotCode || 'Sem lote'}</td>
                      <td>
                        <span className="location-pill">{lot.location.deposit}</span>
                        {`${lot.location.street}-${lot.location.block}-${lot.location.level}-${lot.location.apartment}`}
                      </td>
                      <td>{lot.quantity}</td>
                      <td>
                        <button
                          className="table-action"
                          type="button"
                          onClick={() => setSelectedLotId(lot.id)}
                        >
                          Selecionar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default StockMovementPage;
