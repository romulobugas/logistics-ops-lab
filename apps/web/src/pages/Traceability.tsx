import React, { useState, useEffect } from 'react';
import { getStockActivities, getActivityTraces, getQueueStatus, getPendingActivities } from '../services/traceability';
import '../styles/traceability.css';

interface StockActivity {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  sku: { ean: string };
  location?: { deposit: string; street: string; block: string; level: string; apartment: string } | null;
  destinationLocation?: { deposit: string; street: string; block: string; level: string; apartment: string } | null;
  assignedUser?: { id: string; firstName?: string; lastName?: string } | null;
  createdByUser?: { id: string; firstName?: string; lastName?: string } | null;
}

interface ActivityTrace {
  id: string;
  timestamp: string;
  status: 'QUEUED' | 'PROCESSING' | 'FINALIZED' | 'ERROR' | 'CANCELLED';
  source: 'API' | 'WORKER';
  message: string;
  userId: string | null;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
}

interface QueueStatus {
  messageCount: number;
  consumerCount: number;
}

interface PendingActivity {
  id: string;
  activityId: string;
  status: string;
  timestamp: string;
  source: string;
  message: string;
  userId: string | null;
  activity: StockActivity;
  queueInfo: {
    isStillInQueue: boolean;
    totalMessagesInQueue: number;
  };
}

const TraceabilityPage: React.FC = () => {
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [tracesMap, setTracesMap] = useState<Record<string, ActivityTrace[]>>({});
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [pendingActivities, setPendingActivities] = useState<PendingActivity[]>([]);
  const [showQueueInfo, setShowQueueInfo] = useState(false);

  const fetchUsers = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds));
    const users: Record<string, User> = {};
    for (const id of uniqueIds) {
      try {
        const res = await fetch(`/api/auth/users/${id}`, { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` } 
        });
        if (res.ok) {
          const user = await res.json();
          users[id] = user;
        }
      } catch (e) {
        console.warn('Failed to fetch user', id);
      }
    }
    setUsersMap(users);
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const [data, queue, pending] = await Promise.all([
          getStockActivities(),
          getQueueStatus(),
          getPendingActivities(),
        ]);
        setActivities(data);
        setQueueStatus(queue);
        setPendingActivities(pending);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar atividades.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchAllTraces = async () => {
      const allTraces: Record<string, ActivityTrace[]> = {};
      const userIds: string[] = [];
      
      for (const activity of activities) {
        try {
          const traces = await getActivityTraces(activity.id);
          allTraces[activity.id] = traces;
          traces.forEach((t: ActivityTrace) => t.userId && userIds.push(t.userId));
        } catch (e) {
          console.warn('Failed to fetch traces for activity', activity.id);
        }
      }
      
      setTracesMap(allTraces);
      if (userIds.length) await fetchUsers(userIds);
    };
    
    if (activities.length) fetchAllTraces();
  }, [activities]);

  const toggleExpand = async (id: string) => {
    const set = new Set(expandedActivities);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
      // Fetch traces on demand when expanding
      if (!tracesMap[id]) {
        try {
          const traces = await getActivityTraces(id);
          setTracesMap(prev => ({ ...prev, [id]: traces }));
          
          // Fetch users for these traces
          const userIds = traces.map((t: ActivityTrace) => t.userId).filter(Boolean) as string[];
          if (userIds.length) await fetchUsers(userIds);
        } catch (e) {
          console.warn('Failed to fetch traces for activity', id);
        }
      }
    }
    setExpandedActivities(set);
  };

  const formatSource = (source: 'API' | 'WORKER') => source === 'API' ? 'DB' : 'RMQ';
  const formatUserName = (userId: string | null) => {
    if (!userId) return 'Sistema';
    const user = usersMap[userId];
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || userId : userId;
  };
  const locationLabel = (loc?: { deposit: string; street: string; block: string; level: string; apartment: string } | null) =>
    loc ? `${loc.deposit}-${loc.street}-${loc.block}-${loc.level}-${loc.apartment}` : '-';

  return (
    <div className="traceability-container">
      <header className="traceability-header">
        <h1>Rastreabilidade de Atividades</h1>
        <p>Clique em uma atividade para expandir e ver o ciclo de vida completo.</p>
      </header>

      {/* Queue Status Section */}
      <div className="queue-status-section">
        <div className="queue-header" onClick={() => setShowQueueInfo(!showQueueInfo)}>
          <h3>Status da Fila RabbitMQ</h3>
          <span className="queue-toggle">{showQueueInfo ? '▼' : '▶'}</span>
        </div>
        
        {showQueueInfo && queueStatus && (
          <div className="queue-info">
            <div className="queue-stats">
              <div className="queue-stat">
                <span className="stat-label">Mensagens na Fila:</span>
                <span className="stat-value">{queueStatus.messageCount}</span>
              </div>
              <div className="queue-stat">
                <span className="stat-label">Consumidores Ativos:</span>
                <span className="stat-value">{queueStatus.consumerCount}</span>
              </div>
            </div>
            
            {pendingActivities.length > 0 && (
              <div className="pending-activities">
                <h4>Atividades Pendentes na Fila</h4>
                <div className="pending-list">
                  {pendingActivities.map((pending) => (
                    <div key={pending.id} className="pending-item">
                      <span className="pending-activity-id">#{pending.activityId.slice(0, 8)}</span>
                      <span className="pending-sku">{pending.activity.sku.ean}</span>
                      <span className="pending-type">{pending.activity.type}</span>
                      <span className="pending-time">
                        {new Date(pending.timestamp).toLocaleString()}
                      </span>
                      <span className="pending-badge">Na Fila</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Carregando...</p>}

      <div className="activities-list">
        {activities.map((activity) => {
          const isExpanded = expandedActivities.has(activity.id);
          const traces = tracesMap[activity.id] || [];
          return (
            <div key={activity.id} className="activity-block">
              <div className="activity-row" onClick={() => toggleExpand(activity.id)} role="button" tabIndex={0}>
                <span className="activity-id">#{activity.id.slice(0, 8)}</span>
                <span className="activity-sku">{activity.sku.ean}</span>
                <span className="activity-type">{activity.type}</span>
                <span className="activity-locations">
                  Origem: {locationLabel(activity.location)}
                  {activity.type === 'TRANSFER' && (
                    <> → Destino: {locationLabel(activity.destinationLocation)}</>
                  )}
                </span>
                <span className="activity-dates">
                  Criado: {new Date(activity.createdAt).toLocaleString()}
                </span>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && (
                <div className="traces-expand">
                  {traces.length === 0 ? (
                    <p className="no-traces">Nenhum histórico encontrado para esta atividade.</p>
                  ) : (
                    <table className="traces-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Status</th>
                          <th>Tipo de Evento</th>
                          <th>Mensagem</th>
                          <th>Usuário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {traces.map((trace) => (
                          <tr key={trace.id}>
                            <td>{new Date(trace.timestamp).toLocaleString()}</td>
                            <td><span className={`status-badge status-${trace.status.toLowerCase()}`}>{trace.status}</span></td>
                            <td><span className={`source-badge source-${trace.source.toLowerCase()}`}>{formatSource(trace.source)}</span></td>
                            <td>{trace.message}</td>
                            <td>{formatUserName(trace.userId)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TraceabilityPage;

