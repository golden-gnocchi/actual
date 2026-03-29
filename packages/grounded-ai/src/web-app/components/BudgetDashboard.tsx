import { useEffect, useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import './BudgetDashboard.css';

type BudgetStatus = {
  month: string;
  categories: Array<{
    name: string;
    budgeted: number;
    spent: number;
    remaining: number;
  }>;
  totalBudgeted: number;
  totalSpent: number;
  remaining: number;
};

export function BudgetDashboard() {
  const { getBudgetStatus, loading } = useBudget();
  const [budget, setBudget] = useState<BudgetStatus | null>(null);

  useEffect(() => {
    async function loadBudget() {
      try {
        const data = await getBudgetStatus();
        setBudget(data);
      } catch (error) {
        console.error('Failed to load budget:', error);
      }
    }

    loadBudget();
  }, [getBudgetStatus]);

  if (loading || !budget) {
    return <div className="dashboard-loading">Loading budget...</div>;
  }

  const spentPercent = (budget.totalSpent / budget.totalBudgeted) * 100;
  const safeToSpend = Math.max(0, budget.remaining);

  return (
    <div className="dashboard">
      <section className="summary">
        <div className="summary-card">
          <h2>Month: {budget.month}</h2>
          <div className="summary-row">
            <span>Budgeted:</span>
            <strong className="amount budgeted">${budget.totalBudgeted.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>Spent:</span>
            <strong className="amount spent">${budget.totalSpent.toFixed(2)}</strong>
          </div>
          <div className="summary-row highlight">
            <span>Safe to Spend:</span>
            <strong className="amount safe">${safeToSpend.toFixed(2)}</strong>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(spentPercent, 100)}%` }} />
          </div>
          <p className="progress-text">{spentPercent.toFixed(0)}% of budget spent</p>
        </div>
      </section>

      <section className="categories">
        <h3>Categories</h3>
        <div className="category-grid">
          {budget.categories.map((cat) => (
            <div key={cat.name} className="category-card">
              <h4>{cat.name}</h4>
              <div className="category-stat">
                <span className="label">Budget:</span>
                <span className="value">${cat.budgeted.toFixed(2)}</span>
              </div>
              <div className="category-stat">
                <span className="label">Spent:</span>
                <span className="value">${cat.spent.toFixed(2)}</span>
              </div>
              <div className="category-stat">
                <span className="label">Remaining:</span>
                <span className={`value ${cat.remaining >= 0 ? 'positive' : 'negative'}`}>
                  ${cat.remaining.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
