import React, { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SpendingChart from './components/SpendingChart';
import QuickStats from './components/QuickStats';
import Login from './components/Login';
import { useSummary } from './hooks/useSummary';
import { useTransactions } from './hooks/useTransactions';
import styles from './App.module.css';
import UserProfile from './components/UserProfile';

interface AuthUser {
  token: string;
  userId: number;
  name: string;
  email: string;
}

interface EditableTransaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string | null;
  amount: number;
  category: string;
  date: string;
  notes?: string | null;
}

// 1. Create a separate Dashboard component for all authenticated views and hooks
function Dashboard({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [refresh, setRefresh] = useState<number>(0);
  const [transactionToEdit, setTransactionToEdit] = useState<EditableTransaction | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const bump = useCallback(() => setRefresh(r => r + 1), []);

  const handleEditTransaction = useCallback(
    (transaction: EditableTransaction) => {
      if (
        hasUnsavedChanges &&
        !window.confirm('You have unsaved changes. Discard them and edit another transaction?')
      ) {
        return;
      }
      setTransactionToEdit(transaction);
    },
    [hasUnsavedChanges]
  );

  // These hooks will now ONLY execute when the user is logged in and Dashboard is mounted
  const { summary, loading: summaryLoading } = useSummary(refresh);
  const { transactions, loading: txLoading } = useTransactions({}, refresh);

  const now = new Date();
  const monthName = now.toLocaleString('en-IN', { month: 'long' });
  const year = now.getFullYear();

  return (
    <div className={styles.app}>
      
<header className={styles.header}>
  <div>
    <h1 className={styles.title}>Expense Tracker</h1>
    <p className={styles.sub}>
      Track your income & expenses with clarity
    </p>
  </div>

  <div>
    <span className={styles.monthBadge}>
      {monthName} {year}
    </span>

    <UserProfile
      name={user.name}
      email={user.email}
      onLogout={onLogout}
    />
  </div>
</header>


      <SummaryCards summary={summary} loading={summaryLoading} />

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>
                {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
              </span>
            </div>
            <TransactionForm
              onSuccess={() => {
                bump();
                setTransactionToEdit(null);
                setHasUnsavedChanges(false);
              }}
              transactionToEdit={transactionToEdit}
              onDirtyChange={setHasUnsavedChanges}
            />
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Transactions</span>
              <span className={styles.count}>{transactions.length} total</span>
            </div>
            <TransactionList
              transactions={transactions}
              loading={txLoading}
              onDelete={bump}
              onEdit={handleEditTransaction}
            />
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Spending by Category</span>
            </div>
            <SpendingChart summary={summary} />
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Quick Summary</span>
            </div>
            <QuickStats summary={summary} />
          </section>
        </div>
      </div>
    </div>
  );
}

// 2. Main App component acts as the gatekeeper
export default function App(): React.JSX.Element {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
  const savedUser = localStorage.getItem('user');
  return savedUser ? JSON.parse(savedUser) as AuthUser : null;
});

  useEffect(() => {
    const handleAuthLogout = () => {
      setToken(null);
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const handleLoginSuccess = useCallback((data: AuthUser) => {
  localStorage.setItem('token', data.token);

  const userData: AuthUser = {
    userId: data.userId,
    name: data.name,
    email: data.email,
    token: data.token,
  };

  localStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
  setToken(data.token);
}, []);

  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  setToken(null);
};

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            background: 'var(--surface)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
          },
        }}
      />

      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard user={user!} onLogout={handleLogout} />
      )}
    </>
  );
}