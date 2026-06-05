import { useState } from 'react';
import { Sparkles, ChevronRight, Package, ShieldCheck, Zap } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { recommendEquipment } from '@/services/recommendService';
import type { SkillLevel, EquipmentType, RecommendResult } from '@/types';

const skillLevels: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'beginner', label: '初学者', description: '第一次滑雪或经验较少' },
  { value: 'intermediate', label: '进阶者', description: '能熟练滑行，尝试不同雪道' },
  { value: 'advanced', label: '高级玩家', description: '精通各种滑行技巧' },
];

const equipmentOptions: { value: EquipmentType; label: string; icon: typeof Package }[] = [
  { value: 'snowboard', label: '单板', icon: Package },
  { value: 'ski', label: '双板', icon: Package },
  { value: 'boots', label: '雪鞋', icon: Package },
  { value: 'helmet', label: '头盔', icon: ShieldCheck },
  { value: 'poles', label: '雪杖', icon: Zap },
];

export default function TouristPage() {
  const { equipments, recommendResults, setRecommendResults, addToast } = useAppStore();
  
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [footSize, setFootSize] = useState<number>(42);
  const [selectedTypes, setSelectedTypes] = useState<EquipmentType[]>(['snowboard', 'boots', 'helmet']);
  const [isLoading, setIsLoading] = useState(false);

  const toggleEquipmentType = (type: EquipmentType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const result = recommendEquipment(equipments, {
        skillLevel,
        height,
        weight,
        footSize,
        equipmentTypes: selectedTypes,
      });

      if (result.success) {
        setRecommendResults(result.data || []);
        addToast('success', result.message);
      } else {
        addToast('error', result.message);
      }
      
      setIsLoading(false);
    }, 800);
  };

  const getBoardTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      stable: '稳定型',
      all_mountain: '全山型',
      freestyle: '自由式',
      carving: '刻滑型',
    };
    return labels[type || ''] || '通用型';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              填写您的信息
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  滑雪水平
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {skillLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSkillLevel(level.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        skillLevel === level.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{level.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    min="100"
                    max="230"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    min="20"
                    max="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    脚码
                  </label>
                  <input
                    type="number"
                    value={footSize}
                    onChange={(e) => setFootSize(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    min="30"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  需要租赁的装备
                </label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedTypes.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleEquipmentType(option.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || selectedTypes.length === 0}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    智能推荐
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              推荐结果
            </h2>

            {recommendResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>填写信息后点击「智能推荐」</p>
                <p className="text-sm mt-1">系统将为您匹配最合适的装备</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendResults.map((result, index) => (
                  <ResultCard key={index} result={result} getBoardTypeLabel={getBoardTypeLabel} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  result,
  getBoardTypeLabel,
}: {
  result: RecommendResult;
  getBoardTypeLabel: (type?: string) => string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
      <img
        src={result.equipment.imageUrl}
        alt={result.equipment.name}
        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200';
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900">{result.equipment.name}</h3>
            <p className="text-sm text-gray-500">{result.equipment.brand}</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
            {result.recommendedSize.sizeLabel}
          </span>
        </div>
        
        {result.equipment.boardType && (
          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
            {getBoardTypeLabel(result.equipment.boardType)}
          </span>
        )}
        
        <p className="text-sm text-gray-600 mt-2">{result.reason}</p>
        
        <div className="flex items-center gap-4 mt-3">
          <div className="text-xs text-gray-500">
            库存: <span className={result.recommendedSize.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {result.recommendedSize.stock}件
            </span>
          </div>
          <div className="text-xs text-gray-500">
            匹配度: <span className="text-blue-600 font-medium">{result.matchScore}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
