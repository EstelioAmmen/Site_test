import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types';

interface UseInventoryPricesResult {
  inventory: InventoryItem[] | null;
  loading: boolean;
  error: string | null;
}

export function useInventoryPrices(steamId: string, selectedGame: number): UseInventoryPricesResult {
  const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!steamId) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    fetch(`https://api.buff-163.ru/getjsoninv/${steamId}`, {
      signal,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }
        const data = await response.json();
        const items = Array.isArray(data) ? data : [];
        
        const normalizedItems = items
          .filter(item => item.appId === selectedGame)
          .map(item => ({
            id: item.id || String(Math.random()),
            name: item.name || item.market_hash_name || '',
            image: item.image || `https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`,
            basePrice: Number(item.basePrice) || 0,
            marketPrice: Number(item.marketPrice) || 0,
            quantity: Number(item.quantity || item.count) || 1,
            inCart: false,
            tradable: Boolean(item.tradable),
            marketable: Boolean(item.marketable),
            appId: Number(item.appId)
          }));

        setInventory(normalizedItems);
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Inventory fetch cancelled');
          return;
        }
        console.error('Failed to fetch inventory:', err);
        setError('Инвентарь пуст или не удалось загрузить предметы для выбранной игры.');
        setInventory(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [steamId, selectedGame]);

  return { inventory, loading, error };
}