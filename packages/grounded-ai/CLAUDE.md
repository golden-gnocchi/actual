# GroundedAI — Project Context for Claude Code

## What we're building
A fork of [Actual Budget](https://github.com/actualbudget/actual) (MIT licensed) with a Claude AI layer on top.
The app is called **GroundedAI**. Mascot is a purple chibi tortoise inspired by Master Oogway.
Tagline: *"slow down. spend smart."*

## Core architecture
- **Base**: Fork of `actualbudget/actual` — a local-first TypeScript monorepo
- **Our code lives exclusively in**: `packages/grounded-ai/` — never touch upstream packages
- **Upstream packages (read-only)**: `loot-core` (budget engine), `desktop-client` (React UI), `sync-server`
- **Database**: Actual uses SQLite locally + their own sync server. We use Actual as-is.
- **AI**: Anthropic Claude Sonnet via `@anthropic-ai/sdk`
- **MCP**: An MCP server so the user can talk to their budget directly from Claude.ai

## Git remote setup
```bash
origin    → https://github.com/vedant/actual.git       (our fork)
upstream  → https://github.com/actualbudget/actual.git  (pull updates from here)
```

To pull upstream Actual updates:
```bash
git fetch upstream
git merge upstream/master
# Conflicts should be near-zero since we don't touch their files
```

## What goes in packages/grounded-ai
- AI chat sidebar component (injected into desktop-client via a single import)
- MCP server routes (Express, exposes budget tools to Claude.ai)
- Purple theme overrides (CSS variables only)
- Tortoise mascot assets
- Custom onboarding / budget seeding for Vedant's categories

## MCP server tools (to build)
These tools let Claude.ai talk directly to the user's Actual budget:
- `get_budget_status` — current month spending by category, daily safe-to-spend
- `log_transaction` — add one or more expenses
- `get_transactions` — recent transaction history, filterable by category
- `update_category_budget` — change a category's monthly budget amount
- `delete_transaction` — remove a mistaken transaction
- `run_bank_sync` — trigger SimpleFIN bank sync

The MCP bridge uses `@actual-app/api` (Node.js npm package) to talk to the running Actual server.
**Important**: Actual's API is NOT a REST API. It's an npm package that runs as a local client.

## Actual API key facts
```js
import * as api from '@actual-app/api';

await api.init({
  dataDir: '/some/path',
  serverURL: 'http://localhost:5006',
  password: process.env.ACTUAL_PASSWORD,
});
await api.downloadBudget(process.env.ACTUAL_BUDGET_ID);

// Example calls
const budget = await api.getBudgetMonth('2026-03');
await api.importTransactions(accountId, transactions);
await api.setBudgetAmount(month, categoryId, amount);

await api.shutdown();
```

## Vedant's budget (pre-configured)
Income: **$10,830/mo** (C3.AI payroll + The Kp Group contract + DCU payroll)

| Category | Monthly Budget |
|---|---|
| Housing | $4,763 |
| Transportation | $1,281 |
| Food & Dining | $925 |
| Utilities & Subscriptions | $373 |
| Debt Payoff | $1,150 |
| Shopping & Personal | $300 |
| Fun Money | $500 |
| Family Support (Remitly) | $700 |
| Self-Development | $63 |
| Savings & Investments | $900 |

Key debts to track: Hearth home renovation loan (~$23,900 on AMEX), auto loan ($381/mo DCU).
Starbucks overspend is a recurring theme (~$220/mo actual vs $150 budget).

## Deployment plan
- **Actual server**: PikaPods (~$1.50/mo) or Render (free tier)
- **MCP bridge**: Separate Node.js service on Render (free tier)
- **Claude.ai connector**: User adds MCP server URL + bearer token in Claude.ai → Settings → Connectors

## Design system
- Primary color: `#7F77DD` (purple)
- Dark: `#26215C`
- Font: Syne (headings), DM Sans (body), DM Mono (numbers)
- Two-color mascot rule: only `#7F77DD` and `#26215C` (white allowed for beard/eyebrows/shines)

## What NOT to do
- Never modify files in `packages/loot-core`, `packages/desktop-client`, `packages/desktop-electron`, `packages/sync-server`
- Never hardcode API keys — use environment variables
- Never commit `.env` files
- The one exception: a single minimal import added to `desktop-client` to mount the AI sidebar

## Next steps (in order)
1. ✅ Fork actualbudget/actual on GitHub
2. ✅ Clone fork + add upstream remote
3. 🔲 Scaffold `packages/grounded-ai/`
4. 🔲 Build MCP server using `@actual-app/api`
5. 🔲 Build AI chat sidebar component
6. 🔲 Apply purple theme via CSS variable overrides
7. 🔲 Add mascot to login/onboarding screen
8. 🔲 Deploy Actual on PikaPods
9. 🔲 Deploy MCP bridge on Render
10. 🔲 Connect to Claude.ai via MCP connector

## Reference links
- Actual docs: https://actualbudget.org/docs
- Actual API reference: https://actualbudget.org/docs/api/reference
- Anthropic MCP docs: https://docs.anthropic.com/en/docs/agents-and-tools/mcp
- Our earlier budget analysis: Jan–Mar 2026 transaction data across 18 accounts
