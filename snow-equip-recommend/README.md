# 雪场装备尺码推荐系统

基于 React + TypeScript + Vite 构建的雪场装备智能推荐 Web 应用。

## ✨ 功能特性

### 👤 三大角色入口

| 角色 | 功能说明 |
|------|----------|
| **游客** | 输入身高、体重、脚码等信息，智能推荐最合适的雪场装备 |
| **租赁柜台** | 库存管理、装备出库、装备清单记录 |
| **教练** | 学员信息管理、批量生成学员装备推荐 |

### 🎯 核心推荐逻辑

1. **初学者优先推荐稳定板型** - 容错率高，易于操控
2. **库存为零的尺码自动排除** - 确保推荐结果均可租赁
3. **智能尺码匹配** - 根据身高/体重/脚码计算最佳适配尺码
4. **匹配度评分** - 显示推荐装备的匹配百分比

### 🎯 装备类型支持

- 🏂 单板（稳定型、全山型、自由式、刻滑型）
- ⛷️ 双板
- 👟 雪鞋
- 🪖 头盔
- 🦯 雪杖

## 🚀 快速开始

### 安装依赖

```bash
cd snow-equip-recommend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run check
```

### 运行验证脚本

```bash
npm run validate
```

## ✅ 验收路径

### 输入初学者数据并验证推荐结果避开零库存尺码

**步骤 1：启动应用**
```bash
npm run dev
```

**步骤 2：进入游客角色**
- 打开首页，默认进入「游客」角色页面

**步骤 3：输入初学者数据**
- 滑雪水平：选择「初学者」
- 身高：输入 `165` cm
- 体重：输入 `55` kg
- 脚码：输入 `39` 码
- 需要租赁的装备：勾选「单板、雪鞋、头盔」

**步骤 4：点击「智能推荐」按钮**

**步骤 5：验证推荐结果**

✅ **验证点 1 - 稳定板型优先**
- 单板推荐结果应为「稳定型 (stable)」板型
- 例如：「稳定初学者雪板」或「新手友好稳定板」

✅ **验证点 2 - 零库存尺码被排除**
- 所有推荐尺码的库存数量均 > 0
- 不应出现库存为 0 的尺码

✅ **验证点 3 - 成功响应提示**
- 右上角显示绿色成功提示消息：「推荐成功！已为您找到最合适的装备」

**步骤 6：运行自动化验证脚本**
```bash
npm run validate
```

## 📁 项目结构

```
snow-equip-recommend/
├── src/
│   ├── components/          # 通用组件
│   │   ├── Navigation.tsx   # 导航菜单（三角色切换）
│   │   └── Toast.tsx        # 成功/失败提示组件
│   ├── data/
│   │   └── initialData.ts   # 初始化装备数据
│   ├── pages/
│   │   ├── Home.tsx         # 主页面
│   │   ├── TouristPage.tsx  # 游客页面 - 装备推荐
│   │   ├── RentalPage.tsx   # 租赁柜台 - 库存管理
│   │   └── CoachPage.tsx    # 教练页面 - 学员管理
│   ├── services/
│   │   └── recommendService.ts  # 推荐算法核心逻辑
│   ├── store/
│   │   └── appStore.ts      # Zustand 状态管理
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── scripts/
│   └── validate.ts          # 自动化验证脚本
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🧪 验证脚本说明

`npm run validate` 自动执行以下检查：

1. ✅ 初始化数据验证
2. ✅ 初学者优先推荐稳定板型
3. ✅ 推荐结果排除零库存尺码
4. ✅ 库存验证接口正确返回成功/失败
5. ✅ 无效参数边界检查
6. ✅ 综合场景验证

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **路由**: React Router DOM

## 📝 API 响应格式

系统统一使用以下响应格式：

```typescript
interface ApiResponse<T> {
  success: boolean;      // 是否成功
  message: string;       // 提示消息
  data?: T;              // 返回数据
}
```

### 成功响应示例

```json
{
  "success": true,
  "message": "推荐成功！已为您找到最合适的装备",
  "data": [
    {
      "equipment": { ... },
      "recommendedSize": { ... },
      "reason": "稳定板型非常适合初学者，150cm适合您的身材，库存充足",
      "matchScore": 95
    }
  ]
}
```

### 失败响应示例

```json
{
  "success": false,
  "message": "雪鞋没有可用的库存尺码"
}
```
