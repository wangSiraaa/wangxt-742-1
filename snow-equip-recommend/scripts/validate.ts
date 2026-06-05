import { initialEquipments } from '../src/data/initialData';
import { recommendEquipment, validateStock } from '../src/services/recommendService';
import type { RecommendRequest, Equipment } from '../src/types';

console.log('========================================');
console.log('  雪场装备尺码推荐系统 - 验证脚本');
console.log('========================================\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${(e as Error).message}`);
    failed++;
  }
}

function assertTrue(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
  }
}

console.log('📦 1. 初始化数据验证\n');

test('初始装备数据不为空', () => {
  assertTrue(initialEquipments.length > 0, '初始装备数据应为非空数组');
  assertTrue(initialEquipments.length >= 5, '应包含至少5种不同装备');
});

test('包含稳定板型雪板', () => {
  const stableBoards = initialEquipments.filter(
    (e) => e.type === 'snowboard' && e.boardType === 'stable'
  );
  assertTrue(stableBoards.length >= 2, '应包含至少2款稳定板型雪板');
});

test('存在零库存尺码（用于验证排除逻辑）', () => {
  let hasZeroStock = false;
  for (const eq of initialEquipments) {
    for (const size of eq.sizes) {
      if (size.stock === 0) {
        hasZeroStock = true;
        break;
      }
    }
    if (hasZeroStock) break;
  }
  assertTrue(hasZeroStock, '初始化数据中应包含零库存尺码');
});

console.log('\n🧠 2. 推荐算法核心逻辑验证\n');

test('初学者优先推荐稳定板型', () => {
  const request: RecommendRequest = {
    skillLevel: 'beginner',
    height: 170,
    weight: 65,
    footSize: 42,
    equipmentTypes: ['snowboard'],
  };

  const result = recommendEquipment(initialEquipments, request);
  
  assertTrue(result.success, '推荐应该成功');
  assertTrue(result.data && result.data.length > 0, '应返回推荐结果');
  
  const snowboardResult = result.data?.find((r) => r.equipment.type === 'snowboard');
  assertTrue(snowboardResult !== undefined, '应推荐单板');
  assertEqual(
    snowboardResult?.equipment.boardType,
    'stable',
    '初学者应优先推荐稳定板型'
  );
});

test('推荐结果中不应包含零库存尺码', () => {
  const request: RecommendRequest = {
    skillLevel: 'beginner',
    height: 175,
    weight: 70,
    footSize: 40,
    equipmentTypes: ['snowboard', 'boots', 'helmet'],
  };

  const result = recommendEquipment(initialEquipments, request);
  
  assertTrue(result.success, '推荐应该成功');
  
  if (result.data) {
    for (const item of result.data) {
      assertTrue(
        item.recommendedSize.stock > 0,
        `${item.equipment.name} 的推荐尺码 ${item.recommendedSize.sizeLabel} 库存应为正，实际为 ${item.recommendedSize.stock}`
      );
    }
  }
});

test('零库存尺码验证接口返回失败', () => {
  let zeroStockEquipment: Equipment | null = null;
  let zeroStockSizeId = '';
  
  outer: for (const eq of initialEquipments) {
    for (const size of eq.sizes) {
      if (size.stock === 0) {
        zeroStockEquipment = eq;
        zeroStockSizeId = size.id;
        break outer;
      }
    }
  }

  if (zeroStockEquipment) {
    const result = validateStock(zeroStockEquipment, zeroStockSizeId);
    assertFalse(result.success, '零库存尺码验证应返回失败');
  } else {
    throw new Error('未找到零库存尺码用于测试');
  }
});

function assertFalse(condition: boolean, message: string) {
  if (condition) {
    throw new Error(message);
  }
}

test('有库存尺码验证接口返回成功', () => {
  let inStockEquipment: Equipment | null = null;
  let inStockSizeId = '';
  
  outer: for (const eq of initialEquipments) {
    for (const size of eq.sizes) {
      if (size.stock > 0) {
        inStockEquipment = eq;
        inStockSizeId = size.id;
        break outer;
      }
    }
  }

  if (inStockEquipment) {
    const result = validateStock(inStockEquipment, inStockSizeId);
    assertTrue(result.success, '有库存尺码验证应返回成功');
    assertTrue(result.data === true, 'data 应为 true');
  } else {
    throw new Error('未找到有库存尺码用于测试');
  }
});

console.log('\n📐 3. 参数边界验证\n');

test('无效身高返回错误响应', () => {
  const request: RecommendRequest = {
    skillLevel: 'beginner',
    height: 50,
    weight: 65,
    footSize: 42,
    equipmentTypes: ['snowboard'],
  };

  const result = recommendEquipment(initialEquipments, request);
  assertFalse(result.success, '无效身高应返回失败');
  assertTrue(result.message.includes('身高'), '错误信息应包含身高提示');
});

test('无效体重返回错误响应', () => {
  const request: RecommendRequest = {
    skillLevel: 'beginner',
    height: 170,
    weight: 500,
    footSize: 42,
    equipmentTypes: ['snowboard'],
  };

  const result = recommendEquipment(initialEquipments, request);
  assertFalse(result.success, '无效体重应返回失败');
  assertTrue(result.message.includes('体重'), '错误信息应包含体重提示');
});

test('未选择装备类型返回错误响应', () => {
  const request: RecommendRequest = {
    skillLevel: 'beginner',
    height: 170,
    weight: 65,
    footSize: 42,
    equipmentTypes: [],
  };

  const result = recommendEquipment(initialEquipments, request);
  assertFalse(result.success, '未选装备类型应返回失败');
  assertTrue(result.message.includes('装备类型'), '错误信息应包含装备类型提示');
});

console.log('\n🎯 4. 综合场景验证\n');

test('初学者典型数据 - 完整推荐流程', () => {
  const beginnerData: RecommendRequest = {
    skillLevel: 'beginner',
    height: 165,
    weight: 55,
    footSize: 39,
    equipmentTypes: ['snowboard', 'boots', 'helmet'],
  };

  console.log('   输入数据:');
  console.log(`     - 水平: 初学者`);
  console.log(`     - 身高: ${beginnerData.height}cm`);
  console.log(`     - 体重: ${beginnerData.weight}kg`);
  console.log(`     - 脚码: ${beginnerData.footSize}码`);

  const result = recommendEquipment(initialEquipments, beginnerData);
  
  assertTrue(result.success, '推荐应该成功');
  assertTrue(result.data && result.data.length === 3, '应返回3种装备推荐');

  console.log('   推荐结果:');
  if (result.data) {
    for (const item of result.data) {
      console.log(`     - ${item.equipment.name}`);
      console.log(`       板型: ${item.equipment.boardType || 'N/A'}`);
      console.log(`       尺码: ${item.recommendedSize.sizeLabel}`);
      console.log(`       库存: ${item.recommendedSize.stock}件`);
      console.log(`       匹配度: ${item.matchScore}%`);
      
      assertTrue(
        item.recommendedSize.stock > 0,
        `${item.equipment.name} 推荐尺码库存必须 > 0`
      );

      if (item.equipment.type === 'snowboard') {
        assertEqual(
          item.equipment.boardType,
          'stable',
          '初学者单板推荐应为稳定板型'
        );
      }
    }
  }
});

test('高级玩家优先推荐非稳定板型', () => {
  const request: RecommendRequest = {
    skillLevel: 'advanced',
    height: 175,
    weight: 70,
    footSize: 42,
    equipmentTypes: ['snowboard'],
  };

  const result = recommendEquipment(initialEquipments, request);
  
  assertTrue(result.success, '推荐应该成功');
  
  if (result.data && result.data[0]) {
    const boardType = result.data[0].equipment.boardType;
    assertTrue(
      boardType === 'freestyle' || boardType === 'carving' || boardType === 'all_mountain',
      `高级玩家不应优先推荐稳定板型，实际推荐了 ${boardType}`
    );
  }
});

console.log('\n========================================');
console.log('  验证结果汇总');
console.log('========================================');
console.log(`通过: ${passed}`);
console.log(`失败: ${failed}`);
console.log(`总计: ${passed + failed}`);

if (failed > 0) {
  console.log('\n❌ 部分测试未通过，请检查代码');
  process.exit(1);
} else {
  console.log('\n✅ 所有测试通过！系统运行正常');
  console.log('\n📝 验收路径验证说明:');
  console.log('   1. 打开首页，默认进入「游客」角色');
  console.log('   2. 滑雪水平选择「初学者」');
  console.log('   3. 输入身高165cm，体重55kg，脚码39码');
  console.log('   4. 选择装备类型：单板、雪鞋、头盔');
  console.log('   5. 点击「智能推荐」');
  console.log('   6. 验证推荐结果:');
  console.log('      - 单板应为稳定板型(stable)');
  console.log('      - 所有推荐尺码库存均 > 0');
  console.log('      - 显示成功提示消息');
  process.exit(0);
}
