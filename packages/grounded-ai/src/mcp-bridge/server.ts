import express, { Request, Response, NextFunction } from 'express';
import * as api from '@actual-app/api';

const app = express();
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3001;
const BEARER_TOKEN = process.env.MCP_BEARER_TOKEN || 'dev-token';
const ACTUAL_SERVER_URL = process.env.ACTUAL_SERVER_URL || 'http://localhost:5006';
const ACTUAL_BUDGET_ID = process.env.ACTUAL_BUDGET_ID || '';
const ACTUAL_PASSWORD = process.env.ACTUAL_PASSWORD || '';

// Middleware: Bearer token validation
const authenticateMCP = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token !== BEARER_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Apply auth to all MCP routes
app.use('/mcp', authenticateMCP);

// Initialize Actual API
let isInitialized = false;

async function initializeActual() {
  if (isInitialized) return;

  try {
    await api.init({
      dataDir: process.env.ACTUAL_DATA_DIR || '/tmp/actual-data',
      serverURL: ACTUAL_SERVER_URL,
      password: ACTUAL_PASSWORD,
    });

    await api.downloadBudget(ACTUAL_BUDGET_ID);
    isInitialized = true;
    console.log('✅ Actual API initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Actual API:', error);
    throw error;
  }
}

// MCP Tools

/**
 * get_budget_status - Current month spending by category, daily safe-to-spend
 */
app.post('/mcp/tools/get_budget_status', authenticateMCP, async (req: Request, res: Response) => {
  try {
    await initializeActual();

    const month = req.body.month || new Date().toISOString().slice(0, 7); // YYYY-MM
    const budget = await api.getBudgetMonth(month);

    res.json({
      month,
      categories: budget.byCategory || [],
      totalBudgeted: budget.totalBudgeted || 0,
      totalSpent: budget.totalSpent || 0,
      remaining: (budget.totalBudgeted || 0) - (budget.totalSpent || 0),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * get_transactions - Recent transaction history, filterable by category
 */
app.post('/mcp/tools/get_transactions', authenticateMCP, async (req: Request, res: Response) => {
  try {
    await initializeActual();

    const { limit = 50, categoryId } = req.body;
    const transactions = await api.getTransactions(limit, { categoryId });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * log_transaction - Add one or more expenses
 */
app.post('/mcp/tools/log_transaction', authenticateMCP, async (req: Request, res: Response) => {
  try {
    await initializeActual();

    const { accountId, transactions } = req.body;
    const result = await api.importTransactions(accountId, transactions);

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * update_category_budget - Change a category's monthly budget amount
 */
app.post('/mcp/tools/update_category_budget', authenticateMCP, async (req: Request, res: Response) => {
  try {
    await initializeActual();

    const { month, categoryId, amount } = req.body;
    await api.setBudgetAmount(month, categoryId, amount);

    res.json({ success: true, categoryId, amount, month });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * delete_transaction - Remove a mistaken transaction
 */
app.post('/mcp/tools/delete_transaction', authenticateMCP, async (req: Request, res: Response) => {
  try {
    await initializeActual();

    const { transactionId } = req.body;
    await api.deleteTransaction(transactionId);

    res.json({ success: true, transactionId });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * run_bank_sync - Trigger SimpleFIN bank sync
 */
app.post('/mcp/tools/run_bank_sync', authenticateMCP, async (req: Request, res: Response) => {
  try {
    await initializeActual();

    const result = await api.syncAccounts();

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', initialized: isInitialized });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Bridge running on port ${PORT}`);
  console.log(`📍 Connect to Claude.ai with Bearer token: ${BEARER_TOKEN}`);
});
