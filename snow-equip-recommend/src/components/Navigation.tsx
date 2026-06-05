import { User, Store, GraduationCap, Mountain } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { UserRole } from '@/types';

const roles: { key: UserRole; label: string; icon: typeof User; description: string }[] = [
  { key: 'tourist', label: '游客', icon: User, description: '装备智能推荐' },
  { key: 'rental', label: '租赁柜台', icon: Store, description: '库存与装备清单' },
  { key: 'coach', label: '教练', icon: GraduationCap, description: '学员装备管理' },
];

export default function Navigation() {
  const { currentRole, setCurrentRole } = useAppStore();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">雪场装备推荐系统</h1>
              <p className="text-xs text-gray-500">智能尺码匹配 · 库存实时同步</p>
            </div>
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = currentRole === role.key;
              return (
                <button
                  key={role.key}
                  onClick={() => setCurrentRole(role.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pb-3">
          {roles.map((role) =>
            currentRole === role.key ? (
              <p key={role.key} className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{role.label}：</span>
                {role.description}
              </p>
            ) : null
          )}
        </div>
      </div>
    </nav>
  );
}
