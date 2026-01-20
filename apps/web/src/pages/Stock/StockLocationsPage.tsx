import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../../services/api';
import '../../styles/stock-shared.css';
import '../../styles/stock-locations.css';

interface StockLocation {
  id: string;
  deposit: string;
  street: string;
  block: string;
  level: string;
  apartment: string;
}

const emptyForm = {
  deposit: '',
  street: '',
  block: '',
  level: '',
  apartment: '',
};

const StockLocationsPage = () => {
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await api.get<StockLocation[]>('/stock/locations');
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      setSaving(true);
      await api.post<StockLocation>('/stock/locations', form);
      setForm(emptyForm);
      setMessage('Endereço cadastrado com sucesso.');
      fetchLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar endereço');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setMessage('ID copiado para a área de transferência.');
    } catch {
      setMessage('Não foi possível copiar o ID.');
    }
  };

  return (
    <div className="stock-page">
      <header className="stock-header">
        <div>
          <h1>Cadastro de Endereços</h1>
          <p className="muted">Depósito, Rua, Bloco, Nível e Apartamento devem ser únicos.</p>
        </div>
        <span className="badge">{locations.length} endereços</span>
      </header>

      <div className="stock-locations-grid">
        <section className="stock-panel">
          <div className="panel-header">
            <div>
              <h3>Novo endereço</h3>
              <p className="muted">Cadastre posições físicas do estoque.</p>
            </div>
          </div>
          <form className="stock-location-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Depósito</label>
              <input className="input" value={form.deposit} onChange={handleChange('deposit')} required />
            </div>
            <div className="field">
              <label>Rua</label>
              <input className="input" value={form.street} onChange={handleChange('street')} required />
            </div>
            <div className="field">
              <label>Bloco</label>
              <input className="input" value={form.block} onChange={handleChange('block')} required />
            </div>
            <div className="field">
              <label>Nível</label>
              <input className="input" value={form.level} onChange={handleChange('level')} required />
            </div>
            <div className="field">
              <label>Apartamento</label>
              <input className="input" value={form.apartment} onChange={handleChange('apartment')} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Cadastrar endereço'}
            </button>
            {message && <span className="muted">{message}</span>}
            {error && <span className="error-state">{error}</span>}
          </form>
        </section>

        <section className="stock-panel">
          <div className="panel-header">
            <div>
              <h3>Endereços cadastrados</h3>
              <p className="muted">Use o ID para bipar destino na convocação ativa.</p>
            </div>
            <button className="btn btn-outline" onClick={fetchLocations} disabled={loading}>
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="muted">Carregando endereços...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Endereço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {!locations.length ? (
                  <tr>
                    <td colSpan={3} className="empty-state">
                      Nenhum endereço encontrado.
                    </td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id}>
                      <td className="location-id">{location.id}</td>
                      <td>
                        <div>{`${location.deposit} • ${location.street} / ${location.block}`}</div>
                        <div className="location-address">
                          {`Nível ${location.level} • Apto ${location.apartment}`}
                        </div>
                      </td>
                      <td>
                        <button className="table-action secondary" onClick={() => handleCopyId(location.id)}>
                          Copiar ID
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

export default StockLocationsPage;
