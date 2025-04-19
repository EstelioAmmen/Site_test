import { useState, useRef } from 'react';
import { LoadingStep, InventoryItem } from '@/types';

const initialItems: InventoryItem[] = [
  {
    id: '1',
    name: 'AWP | Wildfire (Field-Tested)',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJK9cyzhr-JkvbnJ4Tdn2xZ_Pp9i_vG8MKs3VLsqkY5Yz_0JoKQdQY4YVnQ_1K_wO7qgJC9up_MyXZnvyF37CnUgVXp1mwGHQtL/360fx360f',
    basePrice: 15000,
    marketPrice: 14500,
    quantity: 1,
    inCart: false,
    source: 'steam',
    tradable: true,
    marketable: true
  },
  {
    id: '2',
    name: 'AK-47 | Asiimov (Field-Tested)',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLHF8In221K1_EJrZGihItDBJFU4YlnT-QS-yO_m1pC_6ZrNwCRnuSErsXjbnBW01BxPb-dxxavJT1udNuM/360fx360f',
    basePrice: 12000,
    marketPrice: 11800,
    quantity: 1,
    inCart: false,
    source: 'tm_market',
    tradable: false,
    marketable: true
  },
  {
    id: '3',
    name: 'Butterfly Knife | Doppler (Factory New)',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeyQyoD8j1yg5RVtMmCmctOWJlI-YwyD_VG8w-nohsPt78zKz3Zhsygq4HnczEHk0k5SLrs4Un4yG8E/360fx360f',
    basePrice: 85000,
    marketPrice: 82000,
    quantity: 1,
    inCart: false,
    source: 'steam',
    tradable: true,
    marketable: false
  }
];

const initialLoadingSteps: LoadingStep[] = [
  { status: 'pending', message: 'Определяем ваш SteamID' },
  { status: 'pending', message: 'Отправляем запрос на получение предметов' },
  { status: 'pending', message: 'Добавляем цены к предметам' },
  { status: 'pending', message: 'Готово' }
];

export function useInventory() {
  const [selectedGame, setSelectedGame] = useState(730);
  const [showInventory, setShowInventory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>(initialLoadingSteps);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('price-desc');
  
  const checkButtonRef = useRef<HTMLButtonElement>(null);

  const updateStep = (index: number, status: LoadingStep['status'], errorMessage?: string) => {
    setLoadingSteps(steps => steps.map((step, i) => {
      if (i === index) {
        return { ...step, status, errorMessage };
      } else if (i > index) {
        return { ...step, status: 'pending' };
      }
      return step;
    }));
  };

  const handleInventoryCheck = async (user: User | null, profileUrl: string) => {
    if (!user) {
      return false;
    }

    setIsLoading(true);
    setShowLoadingModal(true);
    setLoadingSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));

    try {
      // Step 1: Resolve SteamID
      updateStep(0, 'loading');
      const steamidResponse = await fetch(
        `https://api.buff-163.ru/${selectedGame}/steamid?text=${encodeURIComponent(profileUrl)}`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!steamidResponse.ok) {
        throw new Error('steamid');
      }

      const { steamid64 } = await steamidResponse.json();
      updateStep(0, 'success');

      // Step 2: Fetch Inventory
      updateStep(1, 'loading');
      const inventoryResponse = await fetch(
        `https://api.buff-163.ru/inventory/${steamid64}/${selectedGame}`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!inventoryResponse.ok) {
        throw new Error('inventory');
      }

      const inventoryData = await inventoryResponse.json();
      updateStep(1, 'success');

      // Step 3: Add Prices (simulated)
      updateStep(2, 'loading');
      await new Promise(resolve => setTimeout(resolve, 1200));
      updateStep(2, 'success');

      // Step 4: Complete
      updateStep(3, 'loading');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep(3, 'success');

      // Auto-close after success
      setTimeout(() => {
        setShowLoadingModal(false);
        setShowInventory(true);
      }, 1000);

      return true;
    } catch (error) {
      const errorType = (error as Error).message;
      
      if (errorType === 'steamid') {
        updateStep(0, 'error', 'Не удалось определить ссылку на ваш профиль, попробуйте позже, или напишите в Поддержку');
      } else if (errorType === 'inventory') {
        updateStep(1, 'error', 'Проверьте, не скрыт ли ваш инвентарь в настройках профиля, если инвентарь открыт и в нем есть предметы, напишите в Поддержку');
      } else {
        updateStep(2, 'error', 'Не удалось определить цены. Попробуйте ещё раз или напишите в Поддержку');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseLoadingModal = () => {
    setShowLoadingModal(false);
    setLoadingSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
    setIsLoading(false);
    checkButtonRef.current?.focus();
  };

  return {
    selectedGame,
    setSelectedGame,
    showInventory,
    isLoading,
    items,
    setItems,
    loadingSteps,
    showLoadingModal,
    selectedFilter,
    setSelectedFilter,
    checkButtonRef,
    handleInventoryCheck,
    handleCloseLoadingModal
  };
}