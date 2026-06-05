import { create } from 'zustand';
import type { Equipment, RecommendResult, StudentRecord, EquipmentList, UserRole } from '@/types';
import { initialEquipments } from '@/data/initialData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppState {
  equipments: Equipment[];
  currentRole: UserRole;
  recommendResults: RecommendResult[];
  equipmentLists: EquipmentList[];
  studentRecords: StudentRecord[];
  toasts: Toast[];
  
  setCurrentRole: (role: UserRole) => void;
  setEquipments: (equipments: Equipment[]) => void;
  setRecommendResults: (results: RecommendResult[]) => void;
  addEquipmentList: (list: EquipmentList) => void;
  addStudentRecord: (record: StudentRecord) => void;
  updateStock: (equipmentId: string, sizeId: string, quantity: number) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  equipments: initialEquipments,
  currentRole: 'tourist',
  recommendResults: [],
  equipmentLists: [],
  studentRecords: [],
  toasts: [],

  setCurrentRole: (role) => set({ currentRole: role }),
  
  setEquipments: (equipments) => set({ equipments }),
  
  setRecommendResults: (results) => set({ recommendResults: results }),
  
  addEquipmentList: (list) => 
    set((state) => ({ equipmentLists: [...state.equipmentLists, list] })),
  
  addStudentRecord: (record) =>
    set((state) => ({ studentRecords: [...state.studentRecords, record] })),
  
  updateStock: (equipmentId, sizeId, quantity) =>
    set((state) => ({
      equipments: state.equipments.map((eq) =>
        eq.id === equipmentId
          ? {
              ...eq,
              sizes: eq.sizes.map((s) =>
                s.id === sizeId
                  ? { ...s, stock: Math.max(0, s.stock + quantity) }
                  : s
              ),
            }
          : eq
      ),
    })),
  
  addToast: (type, message) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
