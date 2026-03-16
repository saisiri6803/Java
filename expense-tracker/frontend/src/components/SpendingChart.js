import React, { useRef, useEffect } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { EXPENSE_CATEGORIES, formatCurrency } from '../utils/constants';
import styles from './SpendingChart.module.css';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

export default function SpendingChart({ summary }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const expenseByCategory = summary?.expenseByCategory || {};
  const entries = Object.entries(expenseByCategory)
    .map(([cat, amt]) => {
      const info = EXPENSE_CATEGORIES.find(c => c.id === cat) ||
        { label: cat, color: '#a09890', icon: '✦' };
      return { ...info, amount: parseFloat(amt) };
    })
    .sort((a, b) => b.amount - a.amount);

  const total = entries.reduce((s, e) => s + e.amount, 0);

  useEffect(() => {
    if (!canvasRef.current || !entries.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: entries.map(e => e.label),
        datasets: [{
          data: entries.map(e => e.amount),
          backgroundColor: entries.map(e => e.color),
          borderWidth: 2,
          borderColor: '#fffdf7',
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [JSON.stringify(expenseByCategory),entries]);

  if (!entries.length) {
    return (
      <div className={styles.empty}>No expense data yet.</div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chartWrap}>
        <canvas ref={canvasRef} />
      </div>
      <div className={styles.breakdown}>
        {entries.map(e => (
          <div key={e.id} className={styles.catRow}>
            <span className={styles.dot} style={{ background: e.color }} />
            <span className={styles.catName}>{e.icon} {e.label}</span>
            <div className={styles.barWrap}>
              <div
                className={styles.bar}
                style={{ width: `${total ? Math.round(e.amount / total * 100) : 0}%`, background: e.color }}
              />
            </div>
            <span className={styles.pct}>
              {total ? Math.round(e.amount / total * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
