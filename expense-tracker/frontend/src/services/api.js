import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Transactions ──────────────────────────────────────────────

export const getTransactions = (params = {}) =>
  api.get('/transactions', { params }).then(r => r.data.data);

export const getTransactionById = (id) =>
  api.get(`/transactions/${id}`).then(r => r.data.data);

export const createTransaction = (payload) =>
  api.post('/transactions', payload).then(r => r.data.data);

export const updateTransaction = (id, payload) =>
  api.put(`/transactions/${id}`, payload).then(r => r.data.data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then(r => r.data);

export const getSummary = () =>
  api.get('/transactions/summary').then(r => r.data.data);

export default api;
