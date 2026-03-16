import React from 'react';
import { formatCurrency } from '../utils/constants';
import styles from './SummaryCards.module.css';

export default function SummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3].map(i => (
          <div key={i} className={`${styles.card} ${styles.skeleton}`} />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const { totalIncome = 0, totalExpense = 0, balance = 0,
          incomeCount = 0, expenseCount = 0, savingsRate = 0 } = summary;

  const spent = totalIncome > 0
    ? Math.round((totalExpense / totalIncome) * 100)
    : 0;

  return (
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.income}`}>
        <div className={styles.label}>Total Income</div>
        <div className={`${styles.amount} ${styles.pos}`}>{formatCurrency(totalIncome)}</div>
        <div className={styles.sub}>{incomeCount} transaction{incomeCount !== 1 ? 's' : ''}</div>
      </div>

      <div className={`${styles.card} ${styles.expense}`}>
        <div className={styles.label}>Total Expenses</div>
        <div className={`${styles.amount} ${styles.neg}`}>{formatCurrency(totalExpense)}</div>
        <div className={styles.sub}>{expenseCount} transaction{expenseCount !== 1 ? 's' : ''}</div>
      </div>

      <div className={`${styles.card} ${styles.balance}`}>
        <div className={styles.label}>Balance</div>
        <div className={`${styles.amount} ${parseFloat(balance) >= 0 ? styles.pos : styles.neg}`}>
          {parseFloat(balance) < 0 ? '−' : ''}{formatCurrency(balance)}
        </div>
        <div className={styles.sub}>
          {spent}% spent · {parseFloat(savingsRate).toFixed(1)}% saved
        </div>
      </div>
    </div>
  );
}
