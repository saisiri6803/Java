
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteTransaction } from '../services/api';
import {
  getCategoryInfo,
  formatCurrency,
  MONTH_NAMES,
} from '../utils/constants';
import styles from './TransactionList.module.css';
import ConfirmDialog from './ConfirmDialog';

type TransactionType = 'INCOME' | 'EXPENSE';

interface Transaction {
  id: number;
  type: TransactionType;
  description?: string | null;
  category: string;
  amount: number;
  date: string;
  notes?: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: () => void;
}
type FilterType = 'ALL' | TransactionType;

export default function TransactionList({
  transactions,
  loading,
  onDelete,
  onEdit
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');

  const [fromDate, setFromDate] = useState('');
const [toDate, setToDate] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

type SortOption = 'NEWEST' | 'OLDEST' | 'AMOUNT_HIGH' | 'AMOUNT_LOW';

const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

React.useEffect(() => {
  setCurrentPage(1);
}, [filter, search, fromDate, toDate, sortBy]);

  

function requestDelete(transaction: Transaction): void {
  setPendingDelete(transaction);
}

async function confirmDelete(): Promise<void> {
  if (!pendingDelete) return;

  const id = pendingDelete.id;

  try {
    setDeletingId(id);
    await deleteTransaction(id);

    toast.success('Transaction deleted successfully');
    setPendingDelete(null);
    onDelete?.();
  } catch {
    toast.error('Could not delete transaction. Please try again.');
    setPendingDelete(null);
  } finally {
    setDeletingId(null);
  }
}



  function clearFilters(): void {
  setFilter('ALL');
  setSearch('');
  setFromDate('');
  setToDate('');
}

  const filtered = transactions.filter((transaction) => {
  const matchType =
    filter === 'ALL' || transaction.type === filter;

  const searchTerm = search.trim().toLowerCase();

  const searchableText = [
    transaction.description,
    transaction.category,
    transaction.notes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const matchSearch = searchableText.includes(searchTerm);

  const matchFromDate =
    !fromDate || transaction.date >= fromDate;

  const matchToDate =
    !toDate || transaction.date <= toDate;

  return (
    matchType &&
    matchSearch &&
    matchFromDate &&
    matchToDate
  );
});
const sortedTransactions = [...filtered].sort((a, b) => {
  switch (sortBy) {
    case 'NEWEST':
      return b.date.localeCompare(a.date);

    case 'OLDEST':
      return a.date.localeCompare(b.date);

    case 'AMOUNT_HIGH':
      return b.amount - a.amount;

    case 'AMOUNT_LOW':
      return a.amount - b.amount;

    default:
      return 0;
  }
});
const totalPages = Math.ceil(sortedTransactions.length / pageSize);

React.useEffect(() => {
  setCurrentPage((page) =>
    Math.min(page, Math.max(1, totalPages))
  );
}, [totalPages]);

const paginatedTransactions = sortedTransactions.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

  function formatDate(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateStr;
    }

    return `${date.getDate()} ${
      MONTH_NAMES[date.getMonth()]
    } ${date.getFullYear()}`;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`${styles.tab} ${
                filter === item ? styles.activeTab : ''
              }`}
              onClick={() => setFilter(item)}
            >
              {item === 'ALL'
                ? 'All'
                : item.charAt(0) +
                  item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <input
          className={styles.search}
          type="text"
          placeholder="Search..."
          aria-label="Search transactions"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className={styles.dateFilters}>
  <input
    className={styles.dateInput}
    type="date"
    aria-label="Filter transactions from date"
    value={fromDate}
    max={toDate || undefined}
    onChange={(event) => setFromDate(event.target.value)}
  />

  <input
    className={styles.dateInput}
    type="date"
    aria-label="Filter transactions to date"
    value={toDate}
    min={fromDate || undefined}
    onChange={(event) => setToDate(event.target.value)}
  />
  <button
  type="button"
  className={styles.clearFilters}
  onClick={clearFilters}
  disabled={
    filter === 'ALL' &&
    !search &&
    !fromDate &&
    !toDate
  }
>
  Clear filters
</button>
</div>
<select
  className={styles.sortSelect}
  aria-label="Sort transactions"
  value={sortBy}
  onChange={(event) =>
    setSortBy(event.target.value as SortOption)
  }
>
  <option value="NEWEST">Newest first</option>
  <option value="OLDEST">Oldest first</option>
  <option value="AMOUNT_HIGH">Highest amount</option>
  <option value="AMOUNT_LOW">Lowest amount</option>
</select>
      </div>

      <div className={styles.list}>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`${styles.item} ${styles.skeletonItem}`}
            >
              <div className={styles.skeletonIcon} />

              <div className={styles.skeletonLines}>
                <div
                  className={styles.skeletonLine}
                  style={{ width: '60%' }}
                />
                <div
                  className={styles.skeletonLine}
                  style={{ width: '35%' }}
                />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            {search.trim() || filter !== 'ALL'
              ? 'No matching transactions found.'
              : 'No transactions yet. Add one!'}
          </div>
        ) : (
          paginatedTransactions.map((transaction) => {
            const info = getCategoryInfo(
              transaction.type,
              transaction.category
            );

            return (
              <div
                key={transaction.id}
                className={styles.item}
              >
                <div
                  className={styles.icon}
                  style={{ background: info.color + '18' }}
                >
                  {info.icon}
                </div>
                

                <div className={styles.info}>
                  <div className={styles.name}>
                    {transaction.description || 'Untitled transaction'}
                  </div>

                  <div className={styles.meta}>
                    {info.label} · {formatDate(transaction.date)}
                    {transaction.notes && (
                      <span className={styles.note}>
                        {' · '}{transaction.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`${styles.amount} ${
                    transaction.type === 'INCOME'
                      ? styles.inc
                      : styles.exp
                  }`}
                >
                  {transaction.type === 'INCOME' ? '+' : '−'}
                  {formatCurrency(transaction.amount)}
                </div>

                
<button
  type="button"
  className={styles.edit}
  onClick={() => onEdit?.(transaction)}
  disabled={deletingId === transaction.id}
  title="Edit transaction"
  aria-label={`Edit ${
    transaction.description || 'transaction'
  }`}
>
  Edit
</button>


                <button
                  type="button"
                  className={styles.del}
                  onClick={() => requestDelete(transaction)}
                  disabled={deletingId === transaction.id}
                  title="Delete transaction"
                  aria-label={`Delete ${
                    transaction.description || 'transaction'
                  }`}
                >
                  {deletingId === transaction.id ? '…' : '✕'}
                </button>
              </div>
              
            );
          }
        )
        )}
      </div>

      
{!loading && filtered.length > 0 && (
  <>
    <div className={styles.footer}>
      Showing {(currentPage - 1) * pageSize + 1}–
      {Math.min(currentPage * pageSize, filtered.length)} of{' '}
      {filtered.length} transactions

      <label className={styles.pageSizeLabel}>
        Per page
        <select
          className={styles.pageSizeSelect}
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>
    </div>

    {totalPages > 1 && (
      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() =>
            setCurrentPage((page) => Math.max(1, page - 1))
          }
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          className={styles.pageButton}
          onClick={() =>
            setCurrentPage((page) =>
              Math.min(totalPages, page + 1)
            )
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    )}
  </>
)}

    
<ConfirmDialog
  open={pendingDelete !== null}
  title="Delete transaction?"
  message={`Are you sure you want to delete "${
    pendingDelete?.description || 'Untitled transaction'
  }"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  danger
  onCancel={() => setPendingDelete(null)}
  onConfirm={confirmDelete}
/>

    </div>
  );
}
