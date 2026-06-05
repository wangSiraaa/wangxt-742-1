import { useState } from 'react';
import { GraduationCap, UserPlus, Search, Trash2, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { recommendEquipment } from '@/services/recommendService';
import type { SkillLevel, StudentRecord } from '@/types';

export default function CoachPage() {
  const { equipments, studentRecords, addStudentRecord, addToast } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [footSize, setFootSize] = useState<number>(42);
  const [isRecommending, setIsRecommending] = useState(false);

  const filteredRecords = studentRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = () => {
    if (!name.trim()) {
      addToast('error', '请输入学员姓名');
      return;
    }

    setIsRecommending(true);

    setTimeout(() => {
      const result = recommendEquipment(equipments, {
        skillLevel,
        height,
        weight,
        footSize,
        equipmentTypes: ['snowboard', 'boots', 'helmet'],
      });

      if (result.success && result.data) {
        const newRecord: StudentRecord = {
          id: Date.now().toString(),
          name: name.trim(),
          skillLevel,
          height,
          weight,
          footSize,
          recommendResults: result.data,
          createdAt: new Date(),
        };

        addStudentRecord(newRecord);
        addToast('success', `已为 ${name} 生成装备推荐`);
        
        setName('');
        setShowAddModal(false);
      } else {
        addToast('error', result.message);
      }

      setIsRecommending(false);
    }, 800);
  };

  const getSkillLevelLabel = (level: SkillLevel) => {
    const labels: Record<SkillLevel, string> = {
      beginner: '初学者',
      intermediate: '进阶者',
      advanced: '高级玩家',
    };
    return labels[level];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-500" />
            学员管理
          </h2>
          <p className="text-gray-500 mt-1">共 {studentRecords.length} 名学员</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-600 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          添加学员
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索学员姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">暂无学员记录</p>
          <p className="text-sm text-gray-400 mt-1">点击「添加学员」开始创建</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => (
            <StudentCard key={record.id} record={record} getSkillLevelLabel={getSkillLevelLabel} />
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                添加学员并推荐装备
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学员姓名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入学员姓名"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  滑雪水平
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="beginner">初学者</option>
                  <option value="intermediate">进阶者</option>
                  <option value="advanced">高级玩家</option>
                </select>
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
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleAddStudent}
                disabled={isRecommending}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRecommending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>生成推荐</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentCard({
  record,
  getSkillLevelLabel,
}: {
  record: StudentRecord;
  getSkillLevelLabel: (level: SkillLevel) => string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{record.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {getSkillLevelLabel(record.skillLevel)}
              </span>
              <span className="text-xs text-gray-500">
                {record.height}cm · {record.weight}kg · {record.footSize}码
              </span>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">推荐装备</h4>
        <div className="space-y-2">
          {record.recommendResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {result.equipment.name}
                </div>
                <div className="text-xs text-gray-500">
                  {result.recommendedSize.sizeLabel}
                </div>
              </div>
              <div className="text-xs text-gray-500 ml-2">
                库存: <span className="text-green-600 font-medium">{result.recommendedSize.stock}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          创建于 {new Date(record.createdAt).toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  );
}
