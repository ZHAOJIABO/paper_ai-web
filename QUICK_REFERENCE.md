# Paper AI-Web 快速参考指南

## 项目结构速览

```
paper-ai-web/
├── src/
│   ├── pages/
│   │   ├── PolishPage.jsx          ⭐ 核心业务逻辑
│   │   ├── Home.jsx, Login.jsx, Register.jsx, Profile.jsx
│   ├── components/
│   │   ├── InputPanel.jsx          输入面板
│   │   ├── ComparisonView.jsx      对比展示 (最复杂)
│   │   ├── PolishHistory.jsx       历史记录
│   │   ├── PrivateRoute.jsx        权限保护
│   ├── contexts/
│   │   └── AuthContext.jsx         认证上下文
│   ├── services/
│   │   └── api.js                  API 服务 (所有 API 调用)
│   └── App.jsx                     应用主组件
├── deployment/                     Docker 部署
├── docs/                           文档
└── SYSTEM_ANALYSIS.md              ⭐ 详细系统分析 (新增)
```

## 关键文件速查

| 文件 | 位置 | 用途 | 关键函数/类 |
|------|------|------|-----------|
| API 服务 | `src/services/api.js` | 所有后端通信 | `polishText()`, `getComparisonDetails()` |
| 认证 | `src/contexts/AuthContext.jsx` | 全局认证状态 | `useAuth()`, `login()`, `logout()` |
| 润色页面 | `src/pages/PolishPage.jsx` | 核心业务流程 | `handlePolish()`, `handleSelectRecord()` |
| 对比视图 | `src/components/ComparisonView.jsx` | 对比结果展示 | `highlightText()`, `handleChangeClick()` |
| 输入面板 | `src/components/InputPanel.jsx` | 文本输入和配置 | 无复杂逻辑 |
| 历史记录 | `src/components/PolishHistory.jsx` | 历史管理 | `loadRecords()`, `handleFilterChange()` |

## 核心 API 调用

### 润色功能
```javascript
// 执行润色
POST /api/v1/polish
{ content, style, language, provider }
→ { trace_id, polished_content, ... }

// 获取对比详情
GET /api/v1/polish/compare/:trace_id
→ { original_content, polished_content, annotations[], ... }

// 修改操作
POST /api/v1/polish/compare/:trace_id/action
{ change_id, action: 'accept'|'reject' }

// 批量操作
POST /api/v1/polish/compare/:trace_id/batch-action
{ action: 'accept_all'|'reject_all' }

// 历史记录
GET /api/v1/polish/records?page=1&page_size=20&...
```

### 认证功能
```javascript
POST /api/v1/auth/login { username, password }
POST /api/v1/auth/register { username, email, password, ... }
GET /api/v1/auth/me
POST /api/v1/auth/logout
POST /api/v1/auth/refresh { refresh_token }
```

## 权限系统速览

```javascript
// 检查登录状态
const { user, isAuthenticated, login, logout } = useAuth()

// Token 管理
getAccessToken()           获取 token
saveTokens(access, refresh) 保存 token
clearAuthData()            清除所有认证数据

// 路由保护
<Route path="/polish" element={
  <PrivateRoute>
    <PolishPage />
  </PrivateRoute>
}/>
```

## 状态管理速览

### PolishPage 的主要状态
```javascript
[originalText, setOriginalText]         输入的原文
[polishedText, setPolishedText]         返回的润色结果
[traceId, setTraceId]                   追踪 ID
[config, setConfig]                     { style, language, provider }
[isPolishing, setIsPolishing]           加载状态
[error, setError]                       错误信息
[isHistoryOpen, setIsHistoryOpen]       历史抽屉状态
```

### ComparisonView 的主要状态
```javascript
[comparisonData, setComparisonData]     完整对比数据
[selectedChange, setSelectedChange]     选中的修改
[currentContent, setCurrentContent]     当前展示内容
```

## 配置选项

### 润色风格 (Style)
- `academic` - 学术风格
- `formal` - 正式风格
- `concise` - 简洁风格
- `detailed` - 详细风格

### 目标语言 (Language)
- `zh-CN` / `zh` - 中文
- `en-US` / `en` - 英文
- `zh-TW` - 繁体中文

### AI 提供商 (Provider)
- `doubao` - 豆包 (推荐)
- `openai` - OpenAI GPT-4
- `claude` - Claude 3
- `gemini` - Google Gemini
- `qwen` - 通义千问

## 修改类型和颜色

| 类型 | 颜色代码 | RGB 值 | 用途 |
|------|---------|--------|------|
| vocabulary | #FFE082 | 255,224,130 | 词汇优化 |
| grammar | #A5D6A7 | 165,214,167 | 语法修正 |
| structure | #90CAF9 | 144,202,249 | 结构调整 |

## 常用操作流程

### 新用户使用润色功能
```
1. 访问 /login 登录或 /register 注册
2. 跳转到 /polish 页面
3. InputPanel: 输入文本 → 选择配置 → 点击开始润色
4. 获得结果后显示 ComparisonView
5. 用户可:
   - 查看对比
   - 接受/拒绝修改
   - 复制/下载结果
   - 从历史记录快速恢复
```

### 获取修改详情
```
1. ComparisonView 加载时调用 getComparisonDetails(traceId)
2. 用户点击高亮词汇
3. displayDetailPanel 显示修改详情:
   - 原文/修改后对比
   - 修改理由
   - 置信度和影响
   - 接受/拒绝按钮
```

### 应用修改
```
单个修改:
  user click → handleAcceptChange(changeId)
  → applyChangeAction(traceId, changeId, 'accept')
  → update currentContent
  → update comparisonData annotations status

全部接受:
  user click → handleAcceptAll()
  → applyBatchAction(traceId, 'accept_all')
  → update all annotations status
```

## 错误处理要点

### 常见错误码
```javascript
20001 - USER_EXISTS 用户已存在
20002 - PASSWORD_ERROR 密码错误
20004 - TOKEN_INVALID Token 无效
20005 - TOKEN_EXPIRED Token 已过期
20008 - UNAUTHORIZED 未授权
20009 - FORBIDDEN 权限不足
```

### API 错误处理模式
```javascript
try {
  const result = await polishText({...})
  if (result.success) {
    // 成功处理
  }
} catch (err) {
  console.error('失败:', err)
  setError(err.message)
  alert(err.message)
}
```

## 多版本润色实现思路

### 核心改动
1. **数据结构**: `polishedText` → `versions[]`
2. **UI 组件**: 新增 `VersionSelector` 标签栏
3. **API**: 新增 `polishTextMultiple()` 方法
4. **状态**: 新增 `selectedVersionId`

### 版本对象结构
```javascript
{
  version_id: string,
  provider: string,
  model: string,
  content: string,              // 润色内容
  trace_id: string,
  created_at: string,
  metadata: {
    processing_time_ms: number,
    academic_score: number,
    confidence: number
  },
  annotations: Array
}
```

### 实现步骤 (推荐顺序)
```
Phase 1: 数据结构 → UI 组件 → API 调用 → 版本切换
Phase 2: 版本对比 → 评分展示 → 批量导出
Phase 3: 版本融合 → 智能推荐 → A/B 测试
```

## 开发技巧

### 快速定位问题
```javascript
// 1. 检查 API 响应
console.log('API 响应:', result)

// 2. 检查状态更新
console.log('状态:', originalText, polishedText, traceId)

// 3. 检查 token
console.log('Token:', getAccessToken())

// 4. 检查错误
console.error('错误:', error)
```

### 调试对比数据
```javascript
// 在 ComparisonView 中打印完整数据
console.log('完整对比数据:', comparisonData)
console.log('修改列表:', comparisonData?.annotations)
console.log('选中修改:', selectedChange)
```

### 测试多版本流程
```javascript
// 模拟多个提供商响应
const mockVersions = [
  { version_id: 'v1', provider: 'doubao', content: '...' },
  { version_id: 'v2', provider: 'openai', content: '...' },
  { version_id: 'v3', provider: 'claude', content: '...' }
]
setVersions(mockVersions)
setSelectedVersionId('v1')
```

## 文件修改检查清单

### 如果要修改润色逻辑
- [ ] `src/pages/PolishPage.jsx` - 业务流程
- [ ] `src/services/api.js` - API 调用

### 如果要修改 UI
- [ ] `src/components/InputPanel.jsx` - 输入界面
- [ ] `src/components/ComparisonView.jsx` - 对比显示
- [ ] `src/components/*.css` - 样式

### 如果要修改认证
- [ ] `src/contexts/AuthContext.jsx` - 认证逻辑
- [ ] `src/components/PrivateRoute.jsx` - 路由保护
- [ ] `src/services/api.js` - 认证 API

### 如果要实现多版本
- [ ] `src/pages/PolishPage.jsx` - 数据结构和流程
- [ ] `src/components/InputPanel.jsx` - 提供商多选
- [ ] `src/components/ComparisonView.jsx` - 版本选择器
- [ ] `src/services/api.js` - 新的 API 方法

## 性能优化建议

1. **虚拟滚动**: 历史记录很多时使用 react-window
2. **防抖/节流**: 输入框实时处理使用防抖
3. **缓存**: 对比数据加载后缓存，避免重复请求
4. **代码分割**: 按需加载各页面
5. **图片优化**: 用户头像使用懒加载

## 相关文档

- **详细分析**: 查看 `SYSTEM_ANALYSIS.md` (1400+ 行详细文档)
- **API 文档**: 查看 `docs/API_USAGE.md`
- **部署文档**: 查看 `docs/DOCKER_DEPLOYMENT.md`
- **项目说明**: 查看 `README.md`

## 快速命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本

# 部署
./deploy.sh          # 完整部署到 Docker
./update.sh          # 快速更新前端代码
```

## 联系和支持

- 邮箱: 624345999@qq.com
- 项目作者: bobo

---

**最后更新**: 2024-12-04
**文档版本**: 1.0
**对应系统**: paper-ai-web v1.0.0
