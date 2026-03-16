import React, { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SpendingChart from './components/SpendingChart';
import QuickStats from './components/QuickStats';
import { useSummary } from './hooks/useSummary';
import { useTransactions } from './hooks/useTransactions';
import styles from './App.module.css';

export default function App() {
  const [refresh, setRefresh] = useState(0);
  const bump = useCallback(() => setRefresh(r => r + 1), []);

  const { summary, loading: summaryLoading } = useSummary(refresh);
  const { transactions, loading: txLoading } = useTransactions({}, refresh);

  const now = new Date();
  const monthName = now.toLocaleString('en-IN', { month: 'long' });
  const year = now.getFullYear();

  return (
    <div className={styles.app}>
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

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Expense Tracker</h1>
          <p className={styles.sub}>Track your income & expenses with clarity</p>
        </div>
        <div className={styles.monthBadge}>{monthName} {year}</div>
      </header>

      {/* Summary Cards */}
      <SummaryCards summary={summary} loading={summaryLoading} />

      {/* Main 2-column layout */}
      <div className={styles.mainGrid}>
        {/* Left column */}
        <div className={styles.leftCol}>
          {/* Add Transaction */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Add Transaction</span>
            </div>
            <TransactionForm onSuccess={bump} />
          </section>

          {/* Transaction List */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Transactions</span>
              <span className={styles.count}>{transactions.length} total</span>
            </div>
            <TransactionList
              transactions={transactions}
              loading={txLoading}
              onDelete={bump}
            />
          </section>
        </div>

        {/* Right column */}
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
