import { BudgetDashboard } from './components/BudgetDashboard';
import { useActualConnection } from './hooks/useActualConnection';
import './App.css';

export function App() {
  const { isConnected, error } = useActualConnection();

  if (error) {
    return (
      <div className="error-container">
        <h1>Connection Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="loading-container">
        <div className="tortoise-loader">🐢</div>
        <p>Connecting to your budget...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="mascot">🐢</span>
          <h1>GroundedAI</h1>
          <p className="tagline">slow down. spend smart.</p>
        </div>
      </header>
      <main className="app-main">
        <BudgetDashboard />
      </main>
    </div>
  );
}
