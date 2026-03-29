import { useEffect, useState } from 'react';

const MCP_BRIDGE_URL = import.meta.env.VITE_MCP_BRIDGE_URL || 'http://localhost:3001';
const MCP_BEARER_TOKEN = import.meta.env.VITE_MCP_BEARER_TOKEN || 'dev-token';

export function useActualConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch(`${MCP_BRIDGE_URL}/health`, {
          headers: {
            Authorization: `Bearer ${MCP_BEARER_TOKEN}`,
          },
        });

        if (response.ok) {
          setIsConnected(true);
          setError(null);
        } else {
          setError('Failed to connect to budget server');
        }
      } catch (err) {
        setError(`Connection error: ${(err as Error).message}`);
      }
    }

    checkConnection();
  }, []);

  return { isConnected, error };
}
