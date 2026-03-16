import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteTransaction } from '../services/api';
import { getCategoryInfo, formatCurrency, MONTH_NAMES } from '../utils/constants';
import styles from './TransactionList.module.css';

export default function TransactionList({ transactions, loading, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  async function handleDelete(id) {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      setDeletingId(id);
      await deleteTransaction(id);
      toast.success('Deleted');
      onDelete?.();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = transactions.filter(t => {
    const matchType = filter === 'ALL' || t.type === filter;
    const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {['ALL', 'INCOME', 'EXPENSE'].map(f => (
            <button
              key={f}
              className={`${styles.tab} ${filter === f ? styles.activeTab : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input
          className={styles.search}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${styles.item} ${styles.skeletonItem}`}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
                <div className={styles.skeletonLine} style={{ width: '35%' }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            {search ? 'No results found.' : 'No transactions yet. Add one!'}
          </div>
        ) : (
          filtered.map(t => {
            const info = getCategoryInfo(t.type, t.category);
            return (
              <div key={t.id} className={styles.item}>
                <div
                  className={styles.icon}
                  style={{ background: info.color + '18' }}
                >
                  {info.icon}
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{t.description}</div>
                  <div className={styles.meta}>
                    {info.label} · {formatDate(t.date)}
                    {t.notes && <span className={styles.note}> · {t.notes}</span>}
                  </div>
                </div>
                <div className={`${styles.amount} ${t.type === 'INCOME' ? styles.inc : styles.exp}`}>
                  {t.type === 'INCOME' ? '+' : '−'}{formatCurrency(t.amount)}
                </div>
                <button
                  className={styles.del}
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  title="Delete"
                >
                  {deletingId === t.id ? '…' : '✕'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <div className={styles.footer}>
          Showing {filtered.length} of {transactions.length} transactions
        </div>
      )}
    </div>
  );
}
