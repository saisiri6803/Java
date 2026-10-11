
import axios from 'axios';

const api = axios.create({
  // Change from import.meta to standard Webpack environment mapping
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});



api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      } else {
        window.dispatchEvent(new Event('auth:logout'));
      }
    }

    return Promise.reject(error);
  }
);

export interface Transaction {
  id: number;
  description: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes?: string | null;
}

export interface TransactionFilters {
  type?: 'ALL' | 'INCOME' | 'EXPENSE';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionPayload {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    userId: number;
    name: string;
    email: string;
  };
}

export const register = (payload: {
  name: string;
  email: string;
  password: string;
}) => api.post<AuthResponse>('/auth/register', payload).then(r => r.data);

export const login = (payload: {
  email: string;
  password: string;
}) => api.post<AuthResponse>('/auth/login', payload).then(r => r.data);

export const getTransactions = (params: TransactionFilters = {}) =>
  api.get<{ data: Transaction[] }>('/transactions', { params })
    .then(r => r.data.data);

export const getTransactionById = (id: number) =>
  api.get<{ data: Transaction }>(`/transactions/${id}`)
    .then(r => r.data.data);

export const createTransaction = (payload: TransactionPayload) =>
  api.post<{ data: Transaction }>('/transactions', payload)
    .then(r => r.data.data);

export const updateTransaction = (
  id: number,
  payload: Partial<TransactionPayload>
) =>
  api.put<{ data: Transaction }>(`/transactions/${id}`, payload)
    .then(r => r.data.data);

export const deleteTransaction = (id: number) =>
  api.delete(`/transactions/${id}`).then(r => r.data);

export const getSummary = () =>
  api.get('/transactions/summary').then(r => r.data.data);

export default api;
