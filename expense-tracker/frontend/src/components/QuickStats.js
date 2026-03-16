import React from 'react';
import { formatCurrency } from '../utils/constants';
import styles from './QuickStats.module.css';

export default function QuickStats({ summary }) {
  if (!summary) return null;

  const { totalIncome, totalExpense, expenseCount, savingsRate } = summary;
  const income = parseFloat(totalIncome) || 0;
  const expense = parseFloat(totalExpense) || 0;
  const count = expenseCount || 0;
  const avgExpense = count > 0 ? expense / count : 0;

  const { expenseByCategory = {} } = summary;
  const maxEntry = Object.entries(expenseByCategory)
    .reduce((max, [, val]) => Math.max(max, parseFloat(val)), 0);

  const spentPct = income > 0 ? Math.min(100, Math.round(expense / income * 100)) : 0;
  const savedPct = Math.max(0, Math.round(parseFloat(savingsRate) || 0));

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <span className={styles.key}>Savings rate</span>
        <span className={`${styles.val} ${savedPct >= 20 ? styles.pos : savedPct < 0 ? styles.neg : ''}`}>
          {savedPct}%
        </span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${savedPct}%`, background: savedPct >= 20 ? 'var(--green)' : 'var(--amber)' }}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <span className={styles.key}>Spent of income</span>
        <span className={styles.val}>{spentPct}%</span>
      </div>
      <div className={styles.row}>
        <span className={styles.key}>Avg. expense</span>
        <span className={styles.val}>{formatCurrency(Math.round(avgExpense))}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.key}>Largest expense</span>
        <span className={styles.val}>{formatCurrency(maxEntry)}</span>
      </div>
    </div>
  );
}
