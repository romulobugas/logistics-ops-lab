import { authStorage } from '../features/auth/authStorage';

const API_URL = '/api'; // Ajuste se a URL da sua API for diferente

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authStorage.getToken()}`,
});

export const getStockActivities = async () => {
  const response = await fetch(`${API_URL}/stock/activities`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch stock activities');
  }
  return response.json();
};

export const getActivityTraces = async (activityId: string) => {
  if (!activityId) return [];
  const response = await fetch(`${API_URL}/stock/activities/${activityId}/traces`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch activity traces');
  }
  return response.json();
};

export const getQueueStatus = async () => {
  const response = await fetch(`${API_URL}/stock/activities/queue/status`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch queue status');
  }
  return response.json();
};

export const getPendingActivities = async () => {
  const response = await fetch(`${API_URL}/stock/activities/queue/pending`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch pending activities');
  }
  return response.json();
};
