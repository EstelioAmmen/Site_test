import { useState } from 'react';
import { AlertCircle, Copy, Check } from 'lucide-react';
import { LoadingModal } from '@/components/common/LoadingModal';
import { Currency } from '@/types';
import { useInventoryPrices } from '@/hooks/useInventoryPrices';

interface InventoryDisplayProps {
  steamId: string;
  selectedGame: number;
  currency: Currency;
  onToggleCart: (id: string) => void;
}

export function InventoryDisplay({ steamId, selectedGame, currency, onToggleCart }: InventoryDisplayProps) {
  const { inventory, loading, error } = useInventoryPrices(steamId, selectedGame);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (loading) {
    return (
      <LoadingModal
        isOpen={true}
        steps={[
          { status: 'loading', message: 'Добавляем цены к предметам' }
        ]}
        onClose={() => {}}
      />
    );
  }

  if (error || !inventory || inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle size={48} className="text-white/50 mb-4" />
        <p className="text-white/70 text-center">
          {error || 'Инвентарь пуст или не удалось загрузить предметы для выбранной игры.'}
        </p>
      </div>
    );
  }

  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.marketPrice * item.quantity), 0);

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Ваш инвентарь
        </h2>
        <div className="flex items-center gap-4">
          <p className="text-sm text-white/70">
            Всего предметов: <span className="text-white font-medium">{totalItems}</span>
          </p>
          <p className="text-sm text-white/70">
            Общая стоимость: <span className="text-[#06FF4C] font-medium">{currency.symbol} {totalValue.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {inventory.map((item) => (
          <div
            key={item.id}
            className={`bg-[#2C3035] rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
              item.marketPrice === 0 ? 'opacity-50' : ''
            }`}
            title={item.marketPrice === 0 ? 'Не удалось определить цену.' : undefined}
          >
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-[200px] object-contain bg-gradient-to-b from-[#1a1d24] to-[#2C3035] p-4 transition-transform duration-200 group-hover:scale-105"
              />
              {item.marketPrice > 0 && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={() => onToggleCart(item.id)}
                    className={`px-6 h-10 rounded-lg font-medium text-sm transition-all duration-200 transform scale-95 group-hover:scale-100 ${
                      item.inCart
                        ? 'bg-[#06FF4C] text-[#1E2128] hover:bg-[#00ff44] flex items-center gap-2'
                        : 'bg-[#3C73DD] text-white hover:bg-[#4d82ec]'
                    }`}
                  >
                    {item.inCart ? (
                      <>
                        <Check size={18} />
                        В корзине
                      </>
                    ) : (
                      'Добавить'
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="text-sm font-medium text-white/90 line-clamp-2 flex-1 group-hover:text-white transition-colors">
                  {item.name}
                </h3>
                <button
                  onClick={() => handleCopy(item.name, item.id)}
                  className={`shrink-0 w-8 h-8 rounded-lg bg-[#191C22] flex items-center justify-center transition-all duration-200 ${
                    copiedId === item.id 
                      ? 'text-[#06FF4C] scale-110' 
                      : 'text-white/50 hover:text-white hover:scale-110'
                  }`}
                >
                  {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/50 mb-1">Цена за штуку</p>
                  <p className={`text-sm ${item.marketPrice === 0 ? 'text-white/50 line-through' : 'text-white/90'}`}>
                    {currency.symbol} {item.basePrice.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-white/50 mb-1">Итого</p>
                  <p className={`text-sm font-bold transition-colors duration-200 ${
                    item.marketPrice === 0 
                      ? 'text-white/50 line-through'
                      : item.inCart 
                        ? 'text-[#06FF4C]' 
                        : 'text-white group-hover:text-[#06FF4C]'
                  }`}>
                    {currency.symbol} {(item.marketPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Количество:</span>
                  <span className="font-medium text-white">x{item.quantity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}