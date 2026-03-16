export const EXPENSE_CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',    icon: '🍜', color: '#c94a2a' },
  { id: 'rent',          label: 'Rent & Housing',   icon: '🏠', color: '#b04e90' },
  { id: 'transport',     label: 'Transport',        icon: '🚌', color: '#d08020' },
  { id: 'health',        label: 'Health',           icon: '❤️', color: '#c0362a' },
  { id: 'shopping',      label: 'Shopping',         icon: '🛍️', color: '#8040c0' },
  { id: 'utilities',     label: 'Utilities',        icon: '⚡', color: '#308060' },
  { id: 'entertainment', label: 'Entertainment',    icon: '🎬', color: '#1a6ab0' },
  { id: 'education',     label: 'Education',        icon: '📚', color: '#5a6020' },
  { id: 'other',         label: 'Other',            icon: '📦', color: '#a09890' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary',     label: 'Salary',      icon: '💼', color: '#2d7a4f' },
  { id: 'freelance',  label: 'Freelance',   icon: '💻', color: '#1d6a8f' },
  { id: 'investment', label: 'Investment',  icon: '📈', color: '#6b4f9e' },
  { id: 'bonus',      label: 'Bonus',       icon: '🎁', color: '#c0802a' },
  { id: 'other',      label: 'Other',       icon: '✦',  color: '#a09890' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function getCategoryInfo(type, catId) {
  const list = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find(c => c.id === catId) || { label: catId, icon: '✦', color: '#a09890' };
}

export function formatCurrency(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return '₹' + Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
