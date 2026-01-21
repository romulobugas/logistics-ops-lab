import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { authStorage } from '../../features/auth/authStorage';
import '../../styles/stock-shared.css';
import '../../styles/stock-activities.css';

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
}

interface StockActivity {
  id: string;
  type: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'FINALIZED' | 'CANCELLED';
  quantity: number;
  sku: {
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
  };
  lot?: StockLot | null;
  location?: StockLocation | null;
  destinationLocation?: StockLocation | null;
  assignedUser?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  createdAt: string;
}

interface ActiveOperator {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ActiveActivitiesPage = () => {
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [operators, setOperators] = useState<ActiveOperator[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [assignedFilter, setAssignedFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [eanInput, setEanInput] = useState('');
  const [eanConfirmed, setEanConfirmed] = useState(false);
  const [destinationInput, setDestinationInput] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const userId = authStorage.getUser()?.id;

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (statusFilter && activity.status !== statusFilter) {
        return false;
      }
      if (assignedFilter && activity.assignedUser?.id !== assignedFilter) {
        return false;
      }
      if (typeFilter && activity.type !== typeFilter) {
        return false;
      }
      // Incluir todas as atividades, incluindo canceladas
      return true;
    });
  }, [activities, statusFilter, assignedFilter, typeFilter]);

  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedActivityId) || null,
    [activities, selectedActivityId]
  );

  const locationLabel = (location?: StockLocation | null) => {
    if (!location) return '-';
    return `${location.deposit}-${location.street}-${location.block}-${location.level}-${location.apartment}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [activitiesData, operatorsData] = await Promise.all([
        api.get<StockActivity[]>('/stock/activities'),
        api.get<ActiveOperator[]>('/stock/operators'),
      ]);
      setActivities(activitiesData);
      setOperators(operatorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setEanInput('');
    setEanConfirmed(false);
    setDestinationInput('');
    setActionError(null);
    setActionMessage(null);
  }, [selectedActivityId]);

  const handleCancel = async (activityId: string) => {
    let reason = prompt('Motivo do cancelamento:');
    if (!reason || reason.trim() === '') {
      alert('O motivo do cancelamento é obrigatório.');
      return;
    }
    
    try {
      await api.patch(`/stock/activities/${activityId}/cancel`, { reason: reason.trim() });
      
      // Refresh activities list
      const data = await api.get<StockActivity[]>('/stock/activities');
      setActivities(data);
      
      // Clear selection if cancelled activity was selected
      if (selectedActivityId === activityId) {
        setSelectedActivityId(null);
      }
      
      setActionMessage('Atividade cancelada com sucesso!');
    } catch (error) {
      console.error('Error cancelling activity:', error);
      alert('Erro ao cancelar atividade. Tente novamente.');
    }
  };

  const handleAssign = async (activityId: string) => {
    if (!userId) return;
    await api.patch(`/stock/activities/${activityId}/assign`, { userId });
    setSelectedActivityId(activityId);
    fetchData();
  };

  const handleConfirmEan = () => {
    if (!selectedActivity) return;
    setActionError(null);
    const expected = selectedActivity.sku.ean?.trim();
    const typed = eanInput.trim();
    if (!typed) {
      setActionError('Informe o EAN para confirmar.');
      return;
    }
    if (expected && expected !== typed) {
      setActionError('EAN divergente. Confira o produto antes de seguir.');
      return;
    }
    setEanConfirmed(true);
    setActionMessage('EAN confirmado. Informe o endereço de destino.');
  };

  const handleFinalize = async () => {
    if (!selectedActivity) return;
    setActionError(null);
    setActionMessage(null);

    if (selectedActivity.type === 'TRANSFER' && !destinationInput.trim()) {
      setActionError('Digite o ID do endereço de destino.');
      return;
    }

    const confirmText = `Confirma a transferência do produto ${selectedActivity.sku.ean || 'SKU'}?`;
    const confirmed = window.confirm(confirmText);
    if (!confirmed) {
      return;
    }

    await api.patch(`/stock/activities/${selectedActivity.id}/complete`, {
      destinationLocationId: destinationInput.trim() || undefined,
      reason: 'Transferência confirmada pelo operador',
    });
    setActionMessage('Atividade finalizada com sucesso.');
    setSelectedActivityId(null);
    fetchData();
  };

  if (loading) return <div>Carregando atividades...</div>;
  if (error) return <div className="error-state">{error}</div>;

  const isActivityFinalized = selectedActivity?.status === 'FINALIZED' || selectedActivity?.status === 'CANCELLED' as any;

  return (
    <div className="stock-page">
      <header className="stock-header">
        <div>
          <h1>Convocação Ativa</h1>
          <p className="muted">Atividades aguardando operador. Confirme o EAN antes de concluir.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>Atualizar</button>
      </header>

      <section className="stock-panel filters">
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="FINALIZED">Finalizada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Tipo</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="IN">Entrada</option>
            <option value="OUT">Saída</option>
            <option value="TRANSFER">Transferência</option>
            <option value="RESERVE">Reserva</option>
            <option value="RELEASE">Liberação</option>
            <option value="ADJUSTMENT">Ajuste</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Operador</label>
          <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}>
            <option value="">Todos</option>
            {operators.map((operator) => (
              <option key={operator.userId} value={operator.userId}>
                {operator.user.firstName} {operator.user.lastName}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="stock-activities-grid">
        <section className="stock-panel">
          <div className="panel-header">
            <div>
              <h3>Atividades disponíveis</h3>
              <p className="muted">Clique para abrir ou assumir a atividade.</p>
            </div>
            <span className="badge">{filteredActivities.length} itens</span>
          </div>
          <div className="activity-list">
            {!filteredActivities.length ? (
              <div className="empty-state">Nenhuma atividade encontrada.</div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`activity-card ${activity.id === selectedActivityId ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedActivityId(activity.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedActivityId(activity.id);
                    }
                  }}
                >
                  <div className="activity-title">
                    <span className="activity-id">#{activity.id.slice(0, 8)}</span>
                    <span className={`status-pill status-${activity.status.toLowerCase()}`}>
                      {activity.status === 'PENDING' && 'Pendente'}
                      {activity.status === 'IN_PROGRESS' && 'Em andamento'}
                      {activity.status === 'FINALIZED' && 'Finalizada'}
                      {activity.status === 'CANCELLED' && 'Cancelada'}
                    </span>
                  </div>
                  <div className="activity-meta">
                    <div>
                      <strong>{activity.sku.ean || 'SKU'}</strong>
                      <div className="muted">
                        {activity.sku.product?.name || [activity.sku.brand, activity.sku.color, activity.sku.size]
                          .filter(Boolean)
                          .join(' ') || 'Sem descrição'}
                      </div>
                    </div>
                    <div className="activity-quantity">{activity.quantity} un.</div>
                  </div>
                  <div className="activity-meta muted">
                    Origem: {locationLabel(activity.location)}
                    {activity.type === 'TRANSFER' && (
                      <span>
                        {' → Destino: '}
                        {activity.destinationLocation
                          ? locationLabel(activity.destinationLocation)
                          : 'Não definido'}
                      </span>
                    )}
                  </div>
                  <div className="activity-actions">
                    {activity.status === 'PENDING' ? (
                      <>
                        <button
                          className="table-action"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAssign(activity.id);
                          }}
                        >
                          Assumir
                        </button>
                        <button
                          className="table-action danger"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCancel(activity.id);
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : activity.status === 'IN_PROGRESS' ? (
                      <>
                        <span className="activity-wait">
                          <span className="spinner" />
                          Em andamento
                        </span>
                        <button
                          className="table-action danger"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCancel(activity.id);
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <span className="activity-wait">
                        {activity.status === 'FINALIZED' ? 'Concluída' : 'Cancelada'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="stock-panel">
          <div className="panel-header">
            <div>
              <h3>Detalhes da atividade</h3>
              <p className="muted">Confirme o EAN para liberar a leitura do destino.</p>
            </div>
          </div>
          {!selectedActivity ? (
            <div className="empty-state">Selecione uma atividade para visualizar.</div>
          ) : (
            <div className="activity-detail">
              <div className="detail-row">
                <span className="muted">Atividade</span>
                <strong>#{selectedActivity.id}</strong>
              </div>
              <div className="detail-row">
                <span className="muted">Produto</span>
                <strong>{selectedActivity.sku.ean || 'SKU'} • {selectedActivity.sku.product?.name || 'Sem descrição'}</strong>
              </div>
              <div className="detail-row">
                <span className="muted">Quantidade</span>
                <strong>{selectedActivity.quantity} unidades</strong>
              </div>
              <div className="detail-row">
                <span className="muted">Origem</span>
                <strong>{locationLabel(selectedActivity.location)}</strong>
              </div>
              {selectedActivity.type === 'TRANSFER' && (
                <div className="detail-row">
                  <span className="muted">Destino</span>
                  <strong>
                    {selectedActivity.destinationLocation
                      ? locationLabel(selectedActivity.destinationLocation)
                      : 'Não definido'}
                  </strong>
                </div>
              )}

              <div className="field">
                <label>Confirmar EAN</label>
                <div className="ean-row">
                  <input
                    className="input"
                    value={eanInput}
                    onChange={(event) => setEanInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleConfirmEan();
                      }
                    }}
                    placeholder="Bipe ou digite o EAN"
                    disabled={eanConfirmed || isActivityFinalized}
                  />
                  <button className="btn btn-outline" type="button" onClick={handleConfirmEan} disabled={eanConfirmed || isActivityFinalized}>
                    {eanConfirmed ? 'Confirmado' : 'Confirmar'}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Endereço de destino</label>
                <input
                  className="input"
                  value={destinationInput}
                  onChange={(event) => setDestinationInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleFinalize();
                    }
                  }}
                  placeholder="Bipe o ID do endereço"
                  disabled={!eanConfirmed || isActivityFinalized}
                />
              </div>

              <div className="detail-actions">
                <button className="btn btn-primary" type="button" onClick={handleFinalize} disabled={!eanConfirmed || isActivityFinalized}>
                  Finalizar atividade
                </button>
              </div>
              {actionMessage && <div className="muted">{actionMessage}</div>}
              {actionError && <div className="error-state">{actionError}</div>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ActiveActivitiesPage;
