import { useState } from 'react';
import { Package, Plus, Minus, ClipboardList, Check } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { Equipment, EquipmentSize } from '@/types';

export default function RentalPage() {
  const { equipments, updateStock, addToast, equipmentLists, addEquipmentList } = useAppStore();
  const [selectedItems, setSelectedItems] = useState<Map<string, { equipment: Equipment; size: EquipmentSize; quantity: number }>>(new Map());
  const [activeTab, setActiveTab] = useState<'inventory' | 'lists'>('inventory');

  const handleQuantityChange = (equipment: Equipment, size: EquipmentSize, delta: number) => {
    const key = `${equipment.id}-${size.id}`;
    const current = selectedItems.get(key);

    if (delta > 0 && size.stock <= 0) {
      addToast('error', `${size.sizeLabel}库存不足，无法添加`);
      return;
    }

    if (delta > 0 && current && current.quantity >= size.stock) {
      addToast('error', `${size.sizeLabel}库存不足`);
      return;
    }

    const newQuantity = current ? current.quantity + delta : delta;
    
    if (newQuantity <= 0) {
      const newSelected = new Map(selectedItems);
      newSelected.delete(key);
      setSelectedItems(newSelected);
    } else {
      const newSelected = new Map(selectedItems);
      newSelected.set(key, { equipment, size, quantity: newQuantity });
      setSelectedItems(newSelected);
    }
  };

  const handleCreateList = () => {
    if (selectedItems.size === 0) {
      addToast('error', '请先选择装备');
      return;
    }

    const items = Array.from(selectedItems.values()).map(({ equipment, size, quantity }) => ({
      equipment,
      size,
      quantity,
    }));

    addEquipmentList({
      items,
      createdAt: new Date(),
    });

    items.forEach(({ equipment, size, quantity }) => {
      updateStock(equipment.id, size.id, -quantity);
    });

    setSelectedItems(new Map());
    addToast('success', '装备清单创建成功！');
  };

  const getEquipmentTypeName = (type: string) => {
    const names: Record<string, string> = {
      snowboard: '单板',
      ski: '双板',
      boots: '雪鞋',
      helmet: '头盔',
      poles: '雪杖',
    };
    return names[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            库存管理
          </span>
        </button>
        <button
          onClick={() => setActiveTab('lists')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'lists'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            装备清单 ({equipmentLists.length})
          </span>
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {equipments.map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <img
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{equipment.name}</h3>
                        <p className="text-sm text-gray-500">{equipment.brand}</p>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {getEquipmentTypeName(equipment.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{equipment.description}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {equipment.sizes.map((size) => {
                    const key = `${equipment.id}-${size.id}`;
                    const selected = selectedItems.get(key);
                    const isOutOfStock = size.stock <= 0;
                    
                    return (
                      <div
                        key={size.id}
                        className={`p-2 rounded-lg border text-center ${
                          isOutOfStock
                            ? 'bg-gray-50 border-gray-200 opacity-50'
                            : selected
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">{size.sizeLabel}</div>
                        <div className={`text-xs mb-2 ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
                          {isOutOfStock ? '无库存' : `库存: ${size.stock}`}
                        </div>
                        {!isOutOfStock && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleQuantityChange(equipment, size, -1)}
                              disabled={!selected}
                              className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">
                              {selected?.quantity || 0}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(equipment, size, 1)}
                              className="w-6 h-6 rounded bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-500" />
                已选装备
              </h3>
              
              {selectedItems.size === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">点击 + 添加装备到清单</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {Array.from(selectedItems.values()).map(({ equipment, size, quantity }) => (
                      <div
                        key={`${equipment.id}-${size.id}`}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {equipment.name}
                          </div>
                          <div className="text-xs text-gray-500">{size.sizeLabel}</div>
                        </div>
                        <div className="text-sm font-semibold text-blue-600 ml-2">
                          ×{quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-gray-600">装备总数</span>
                      <span className="font-semibold text-gray-900">
                        {Array.from(selectedItems.values()).reduce((sum, item) => sum + item.quantity, 0)} 件
                      </span>
                    </div>
                    <button
                      onClick={handleCreateList}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      确认出库
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {equipmentLists.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">暂无装备清单</p>
              <p className="text-sm text-gray-400 mt-1">在库存管理中选择装备并创建清单</p>
            </div>
          ) : (
            equipmentLists.map((list, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    清单 #{index + 1}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(list.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="space-y-2">
                  {list.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="text-sm font-medium">{item.equipment.name}</div>
                        <div className="text-xs text-gray-500">{item.size.sizeLabel}</div>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
