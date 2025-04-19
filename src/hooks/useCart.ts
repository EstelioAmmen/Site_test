import { useState } from 'react';
import { InventoryItem } from '@/types';

export function useCart() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleItemInCart = (items: InventoryItem[], setItems: (items: InventoryItem[]) => void) => (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, inCart: !item.inCart } : item
    ));
  };

  return {
    isCartOpen,
    setIsCartOpen,
    toggleItemInCart
  };
}