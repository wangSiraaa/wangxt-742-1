import type {
  Equipment,
  RecommendRequest,
  RecommendResult,
  ApiResponse,
  EquipmentSize,
  EquipmentType,
  SkillLevel,
} from '@/types';

function isInRange(value: number, range?: [number, number]): boolean {
  if (!range) return true;
  return value >= range[0] && value <= range[1];
}

function calculateSizeScore(size: string, targetValue: number, ranges?: { [key: string]: number }): number {
  if (ranges && ranges[size] !== undefined) {
    const diff = Math.abs(parseInt(size) - ranges[size]);
    return Math.max(0, 100 - diff * 5);
  }
  return 50;
}

function getBoardTypePriority(skillLevel: SkillLevel): Map<string, number> {
  const priority = new Map<string, number>();
  
  if (skillLevel === 'beginner') {
    priority.set('stable', 100);
    priority.set('all_mountain', 60);
    priority.set('carving', 30);
    priority.set('freestyle', 20);
  } else if (skillLevel === 'intermediate') {
    priority.set('all_mountain', 100);
    priority.set('stable', 70);
    priority.set('carving', 60);
    priority.set('freestyle', 50);
  } else {
    priority.set('freestyle', 100);
    priority.set('carving', 90);
    priority.set('all_mountain', 80);
    priority.set('stable', 50);
  }
  
  return priority;
}

function findBestSize(
  equipment: Equipment,
  height: number,
  weight: number,
  footSize: number
): EquipmentSize | null {
  const availableSizes = equipment.sizes.filter(s => s.stock > 0);
  
  if (availableSizes.length === 0) {
    return null;
  }

  let bestSize: EquipmentSize | null = null;
  let bestScore = -1;

  for (const size of availableSizes) {
    let score = 0;

    if (equipment.type === 'snowboard' || equipment.type === 'ski') {
      const sizeCm = parseInt(size.size);
      const idealSize = height - 20;
      const diff = Math.abs(sizeCm - idealSize);
      score = Math.max(0, 100 - diff * 3);
      
      if (equipment.suitableHeightRange && isInRange(height, equipment.suitableHeightRange)) {
        score += 20;
      }
      if (equipment.suitableWeightRange && isInRange(weight, equipment.suitableWeightRange)) {
        score += 20;
      }
    } else if (equipment.type === 'boots') {
      const sizeNum = parseInt(size.size);
      if (sizeNum === footSize) {
        score = 100;
      } else {
        score = Math.max(0, 100 - Math.abs(sizeNum - footSize) * 20);
      }
    } else if (equipment.type === 'helmet') {
      const sizeOrder = ['S', 'M', 'L', 'XL'];
      const heightBasedSize = height < 165 ? 'S' : height < 175 ? 'M' : height < 185 ? 'L' : 'XL';
      if (size.size === heightBasedSize) {
        score = 100;
      } else {
        const idx1 = sizeOrder.indexOf(size.size);
        const idx2 = sizeOrder.indexOf(heightBasedSize);
        score = Math.max(0, 100 - Math.abs(idx1 - idx2) * 30);
      }
    } else if (equipment.type === 'poles') {
      const sizeCm = parseInt(size.size);
      const idealSize = Math.floor(height * 0.7);
      const diff = Math.abs(sizeCm - idealSize);
      score = Math.max(0, 100 - diff * 5);
    }

    if (score > bestScore) {
      bestScore = score;
      bestSize = size;
    }
  }

  return bestSize;
}

function generateReason(
  equipment: Equipment,
  size: EquipmentSize,
  skillLevel: SkillLevel
): string {
  const reasons: string[] = [];
  
  if (skillLevel === 'beginner' && equipment.boardType === 'stable') {
    reasons.push('稳定板型非常适合初学者');
  }
  
  reasons.push(`${size.sizeLabel}适合您的身材`);
  
  if (size.stock > 0 && size.stock <= 3) {
    reasons.push(`库存仅剩${size.stock}件，建议尽快预订`);
  } else if (size.stock > 3) {
    reasons.push('库存充足');
  }
  
  return reasons.join('，');
}

export function recommendEquipment(
  equipments: Equipment[],
  request: RecommendRequest
): ApiResponse<RecommendResult[]> {
  const { skillLevel, height, weight, footSize, equipmentTypes } = request;

  if (height < 100 || height > 230) {
    return {
      success: false,
      message: '身高数据无效，请输入100-230cm之间的数值',
    };
  }
  
  if (weight < 20 || weight > 200) {
    return {
      success: false,
      message: '体重数据无效，请输入20-200kg之间的数值',
    };
  }
  
  if (footSize < 30 || footSize > 50) {
    return {
      success: false,
      message: '脚码数据无效，请输入30-50码之间的数值',
    };
  }

  if (equipmentTypes.length === 0) {
    return {
      success: false,
      message: '请至少选择一种装备类型',
    };
  }

  const boardTypePriority = getBoardTypePriority(skillLevel);
  const results: RecommendResult[] = [];

  for (const eqType of equipmentTypes) {
    const typeEquipments = equipments.filter(e => e.type === eqType);
    
    if (typeEquipments.length === 0) {
      continue;
    }

    const scoredEquipments = typeEquipments.map(eq => {
      let score = 0;
      
      if (eq.boardType) {
        score += boardTypePriority.get(eq.boardType) || 40;
      } else {
        score += 60;
      }
      
      if (eq.suitableHeightRange && isInRange(height, eq.suitableHeightRange)) {
        score += 15;
      }
      if (eq.suitableWeightRange && isInRange(weight, eq.suitableWeightRange)) {
        score += 15;
      }
      
      return { equipment: eq, baseScore: score };
    });

    scoredEquipments.sort((a, b) => b.baseScore - a.baseScore);

    let foundMatch = false;
    for (const { equipment, baseScore } of scoredEquipments) {
      const bestSize = findBestSize(equipment, height, weight, footSize);
      
      if (bestSize) {
        const reason = generateReason(equipment, bestSize, skillLevel);
        results.push({
          equipment,
          recommendedSize: bestSize,
          reason,
          matchScore: baseScore,
        });
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      return {
        success: false,
        message: `${getEquipmentTypeName(eqType)}没有可用的库存尺码`,
      };
    }
  }

  if (results.length === 0) {
    return {
      success: false,
      message: '未找到符合条件的装备推荐',
    };
  }

  return {
    success: true,
    message: '推荐成功！已为您找到最合适的装备',
    data: results,
  };
}

function getEquipmentTypeName(type: EquipmentType): string {
  const names: Record<EquipmentType, string> = {
    snowboard: '雪板',
    ski: '双板',
    boots: '雪鞋',
    helmet: '头盔',
    poles: '雪杖',
  };
  return names[type];
}

export function validateStock(equipment: Equipment, sizeId: string): ApiResponse<boolean> {
  const size = equipment.sizes.find(s => s.id === sizeId);
  
  if (!size) {
    return {
      success: false,
      message: '未找到该尺码',
    };
  }
  
  if (size.stock <= 0) {
    return {
      success: false,
      message: `${size.sizeLabel}库存不足`,
    };
  }
  
  return {
    success: true,
    message: `${size.sizeLabel}库存充足`,
    data: true,
  };
}
