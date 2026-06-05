export type UserRole = 'tourist' | 'rental' | 'coach';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type EquipmentType = 'snowboard' | 'ski' | 'boots' | 'helmet' | 'poles';

export type BoardType = 'stable' | 'all_mountain' | 'freestyle' | 'carving';

export interface EquipmentSize {
  id: string;
  size: string;
  sizeLabel: string;
  stock: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  boardType?: BoardType;
  brand: string;
  sizes: EquipmentSize[];
  description: string;
  imageUrl: string;
  suitableHeightRange?: [number, number];
  suitableWeightRange?: [number, number];
  suitableFootSizeRange?: [number, number];
}

export interface RecommendRequest {
  skillLevel: SkillLevel;
  height: number;
  weight: number;
  footSize: number;
  equipmentTypes: EquipmentType[];
}

export interface RecommendResult {
  equipment: Equipment;
  recommendedSize: EquipmentSize;
  reason: string;
  matchScore: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface EquipmentList {
  items: {
    equipment: Equipment;
    size: EquipmentSize;
    quantity: number;
  }[];
  createdAt: Date;
}

export interface StudentRecord {
  id: string;
  name: string;
  skillLevel: SkillLevel;
  height: number;
  weight: number;
  footSize: number;
  recommendResults: RecommendResult[];
  createdAt: Date;
}
