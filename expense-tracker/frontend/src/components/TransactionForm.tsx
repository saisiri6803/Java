import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createTransaction, updateTransaction } from '../services/api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import styles from './TransactionForm.module.css';


interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string | null;
  amount: number;
  category: string;
  date: string;
  notes?: string | null;
}

const today = new Date().toISOString().split('T')[0];

type TransactionType = 'INCOME' | 'EXPENSE';

interface TransactionFormData {
  type: TransactionType;
  description: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
}
interface TransactionFormProps {
  onSuccess?: () => void;
  transactionToEdit?: Transaction | null;
  onDirtyChange?: (isDirty: boolean) => void;
}

const EMPTY_FORM: TransactionFormData = {
  type: 'EXPENSE',
  description: '',
  amount: '',
  category: 'food',
  date: today,
  notes: '',
};

export default function TransactionForm({
  onSuccess,
  transactionToEdit = null,
  onDirtyChange,
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  
React.useEffect(() => {
  if (transactionToEdit) {
    setForm({
      type: transactionToEdit.type,
      description: transactionToEdit.description ?? '',
      amount: String(transactionToEdit.amount),
      category: transactionToEdit.category,
      date: transactionToEdit.date.slice(0, 10),
      notes: transactionToEdit.notes ?? '',
    });
    setShowNotes(Boolean(transactionToEdit.notes));
  } else {
  setForm(EMPTY_FORM);
  setShowNotes(false);
  onDirtyChange?.(false);
}
}, [transactionToEdit]);


React.useEffect(() => {
  if (!transactionToEdit) {
    onDirtyChange?.(false);
    return;
  }

  const unchanged =
    form.type === transactionToEdit.type &&
    form.description === (transactionToEdit.description ?? '') &&
    form.amount === String(transactionToEdit.amount) &&
    form.category === transactionToEdit.category &&
    form.date === transactionToEdit.date.slice(0, 10) &&
    form.notes === (transactionToEdit.notes ?? '');

  onDirtyChange?.(!unchanged);
}, [form, transactionToEdit, onDirtyChange]);



  const categories = form.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(type) {
    const defaultCat = type === 'EXPENSE' ? 'food' : 'salary';
    setForm(f => ({ ...f, type, category: defaultCat }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim()) return toast.error('Description is required');
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (!form.date) return toast.error('Date is required');

    try {
      setLoading(true);
      
const payload = {
  description: form.description.trim(),
  amount: parseFloat(form.amount),
  type: form.type,
  category: form.category,
  date: form.date,
  notes: form.notes.trim() || null,
};

if (transactionToEdit) {
  await updateTransaction(transactionToEdit.id, payload);
  toast.success('Transaction updated successfully');
} else {
  await createTransaction(payload);
  toast.success(
    `${form.type === 'EXPENSE' ? 'Expense' : 'Income'} added!`
  );
}

      toast.success(`${form.type === 'EXPENSE' ? 'Expense' : 'Income'} added!`);
      setForm(EMPTY_FORM);
      setShowNotes(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Type Toggle */}
      <div className={styles.typeToggle}>
        <button
          type="button"
          className={`${styles.typeBtn} ${form.type === 'EXPENSE' ? styles.activeExpense : ''}`}
          onClick={() => handleTypeChange('EXPENSE')}
        >
          Expense
        </button>
        <button
          type="button"
          className={`${styles.typeBtn} ${form.type === 'INCOME' ? styles.activeIncome : ''}`}
          onClick={() => handleTypeChange('INCOME')}
        >
          Income
        </button>
      </div>

      {/* Description */}
      <div className={styles.group}>
        <label className={styles.label}>Description</label>
        <input
          className={styles.input}
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What was this for?"
          autoComplete="off"
        />
      </div>

      {/* Amount + Date */}
      <div className={styles.row}>
        <div className={styles.group}>
          <label className={styles.label}>Amount (₹)</label>
          <input
            className={styles.input}
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>Date</label>
          <input
            className={styles.input}
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Category */}
      <div className={styles.group}>
        <label className={styles.label}>Category</label>
        <select
          className={styles.select}
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Optional Notes */}
      <button
        type="button"
        className={styles.notesToggle}
        onClick={() => setShowNotes(s => !s)}
      >
        {showNotes ? '− Hide notes' : '+ Add notes (optional)'}
      </button>
      {showNotes && (
        <div className={styles.group}>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any extra details..."
            rows={2}
          />
        </div>
      )}

      
<button
  type="submit"
  className={`${styles.submitBtn} ${form.type === 'INCOME' ? styles.submitIncome : ''}`}
  disabled={loading}
>
  {loading
    ? transactionToEdit
      ? 'Saving...'
      : 'Adding...'
    : transactionToEdit
      ? 'Save Changes'
      : `Add ${form.type === 'EXPENSE' ? 'Expense' : 'Income'}`}
</button>

{transactionToEdit && (
  <button
    type="button"
    className={styles.notesToggle}
    disabled={loading}
    onClick={() => onSuccess?.()}
  >
    Cancel Edit
  </button>
)}

    </form>
  );
}
