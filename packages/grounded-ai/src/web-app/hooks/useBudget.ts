import { useState } from 'react';

const MCP_BRIDGE_URL = import.meta.env.VITE_MCP_BRIDGE_URL || 'http://localhost:3001';
const MCP_BEARER_TOKEN = import.meta.env.VITE_MCP_BEARER_TOKEN || 'dev-token';

export function useBudget() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callMCPTool = async (toolName: string, params: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await fetch(`${MCP_BRIDGE_URL}/mcp/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MCP_BEARER_TOKEN}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getBudgetStatus: (month?: string) => callMCPTool('get_budget_status', { month }),
    getTransactions: (accountId: string, startDate: string, endDate: string) =>
      callMCPTool('get_transactions', { accountId, startDate, endDate }),
    logTransaction: (accountId: string, transactions: unknown[]) =>
      callMCPTool('log_transaction', { accountId, transactions }),
    updateCategoryBudget: (month: string, categoryId: string, amount: number) =>
      callMCPTool('update_category_budget', { month, categoryId, amount }),
    deleteTransaction: (transactionId: string) =>
      callMCPTool('delete_transaction', { transactionId }),
    runBankSync: () => callMCPTool('run_bank_sync', {}),
  };
}
