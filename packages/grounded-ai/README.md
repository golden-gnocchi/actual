# GroundedAI — Budget + AI

A fork of [Actual Budget](https://actualbudget.org) with Claude AI integration via MCP (Model Context Protocol).

**Tagline:** _slow down. spend smart._

## Architecture

```
┌─────────────────────────┐
│  GroundedAI Web App     │  (Render static)
│  (Purple UI + Dashboard)│
└────────────┬────────────┘
             │ calls MCP tools
             ▼
┌─────────────────────────┐         ┌──────────────────┐
│  MCP Bridge Service     │◄────────┤  Claude.ai       │
│  (Render Node.js)       │         │  (Your Chat)     │
└────────────┬────────────┘         └──────────────────┘
             │ connects via API
             ▼
┌─────────────────────────┐
│  Actual Budget Server   │
│  (PikaPods SQLite)      │
└─────────────────────────┘
```

## Quick Start (Development)

### 1. Install dependencies
```bash
yarn install
```

### 2. Set up environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Start development servers
```bash
# Start MCP bridge (port 3001) + Web app (port 3002)
yarn dev

# Or run individually:
yarn dev:mcp
yarn dev:web
```

### 4. Connect to Actual
Make sure your Actual Budget server is running (locally or on PikaPods) and set `ACTUAL_SERVER_URL` in `.env.local`.

## Building

### Build both services
```bash
yarn build
# Output:
#   dist/mcp-bridge/server.js
#   dist/web/
```

### Build individual services
```bash
yarn build:mcp    # MCP bridge
yarn build:web    # React web app
```

## Deployment

### 1. PikaPods (Actual Budget server)

1. Sign up at [PikaPods](https://www.pikapods.com/)
2. Deploy Actual Budget app
3. Configure your budget and SimpleFIN
4. Note your sync server URL: `https://xxx.pikapods.com:5006`

### 2. Render (MCP bridge)

1. Push to GitHub
2. In Render dashboard: **New Service**
3. Connect GitHub repo
4. Use config in `render-mcp.yaml`:
   ```yaml
   Build Command: cd ../.. && yarn install && yarn workspace @grounded-ai/app build:mcp
   Start Command: node packages/grounded-ai/dist/mcp-bridge/server.js
   ```
5. Set environment variables:
   - `MCP_BEARER_TOKEN` — random secure token (e.g., `openssl rand -base64 32`)
   - `ACTUAL_SERVER_URL` — your PikaPods URL
   - `ACTUAL_BUDGET_ID` — from Actual dashboard
   - `ACTUAL_PASSWORD` — your Actual password
6. Deploy and copy the service URL (e.g., `https://grounded-ai-mcp.onrender.com`)

### 3. Render (Web app)

1. In Render dashboard: **New Static Site**
2. Connect GitHub repo
3. Use config in `render-web.yaml`:
   ```yaml
   Build Command: cd ../.. && yarn install && yarn workspace @grounded-ai/app build:web
   Publish Directory: packages/grounded-ai/dist/web
   ```
4. Set environment variables:
   - `VITE_MCP_BRIDGE_URL` — your MCP service URL from step 2
   - `VITE_MCP_BEARER_TOKEN` — same token as step 2
5. Deploy and note the web app URL

### 4. Connect to Claude.ai

1. Go to [Claude.ai Settings → Connectors](https://claude.ai/settings/connectors)
2. Add MCP Server:
   - **URL:** `https://your-mcp-service.onrender.com`
   - **Bearer Token:** Your `MCP_BEARER_TOKEN`
3. Test connection and start asking Claude about your budget!

## MCP Tools Available

The MCP bridge exposes these tools to Claude:

- `get_budget_status` — Current month: budgeted, spent, remaining by category
- `get_transactions` — Recent transactions, filterable by category
- `log_transaction` — Add an expense to an account
- `update_category_budget` — Change a category's monthly budget
- `delete_transaction` — Remove a transaction
- `run_bank_sync` — Trigger SimpleFIN sync

## Project Structure

```
packages/grounded-ai/
├── src/
│   ├── mcp-bridge/
│   │   └── server.ts          # Express server with MCP tools
│   └── web-app/
│       ├── main.tsx           # React entry point
│       ├── App.tsx            # Main component
│       ├── components/
│       │   └── BudgetDashboard.tsx
│       ├── hooks/
│       │   ├── useActualConnection.ts
│       │   └── useBudget.ts
│       ├── index.html         # Vite HTML template
│       ├── index.css          # Purple theme + global styles
│       └── App.css            # App layout
├── package.json
├── tsconfig.mcp.json          # MCP build config
├── vite.web.config.ts         # Vite web config
├── .env.example               # Environment template
├── render-mcp.yaml            # Render MCP deploy config
└── render-web.yaml            # Render web deploy config
```

## Design System

- **Primary:** `#7f77dd` (purple)
- **Dark:** `#26215C`
- **Fonts:** Syne (headings), DM Sans (body), DM Mono (numbers)
- **Mascot:** Purple chibi tortoise 🐢

## Development Tips

### Type Checking
```bash
yarn typecheck
```

### Debugging MCP Bridge
```bash
# Logs include all API calls
yarn dev:mcp
```

### Testing Web App
```bash
# Hot reload on http://localhost:3002
yarn dev:web
```

## Troubleshooting

**"Connection error" on web app?**
- Check `VITE_MCP_BRIDGE_URL` is correct
- Ensure MCP bearer token matches

**MCP bridge can't reach Actual?**
- Verify `ACTUAL_SERVER_URL` is reachable
- Check `ACTUAL_PASSWORD` and `ACTUAL_BUDGET_ID` are correct
- Test with `curl -H "Authorization: Bearer $TOKEN" https://your-mcp.onrender.com/health`

**Render cold start delays?**
- Free tier may take 30-60s on first request
- Deploy MCP bridge to paid tier if needed

## Contributing

This is a personal fork. For Actual Budget issues, see [actualbudget/actual](https://github.com/actualbudget/actual).

## License

MIT (fork of Actual Budget)
