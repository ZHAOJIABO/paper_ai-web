# 论文润色对比功能 API 文档

## 概述

论文润色对比功能提供三个核心接口，用于查看原文与润色后文本的差异对比，以及对修改进行接受或拒绝的操作。

**基础信息：**
- Base URL: `/api/v1/polish/compare`
- 认证方式：JWT Bearer Token（在请求头中携带：`Authorization: Bearer <token>`）
- Content-Type: `application/json`

---

## 1. 获取对比详情

### 接口信息
```
GET /api/v1/polish/compare/:trace_id
```

### 功能说明
根据润色记录的 `trace_id` 获取原文和润色后文本的详细对比信息，包括所有修改标注、元数据和统计信息。

### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| trace_id | string | 是 | 润色记录的唯一标识 |

### 请求示例
```http
GET /api/v1/polish/compare/abc123def456 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 响应格式

#### 成功响应 (200 OK)
```json
{
  "code": 0,
  "message": "success",
  "trace_id": "request-uuid",
  "data": {
    "trace_id": "abc123def456",
    "original_content": "This is the original text with some errors.",
    "polished_content": "This is the polished text with corrections.",
    "annotations": [
      {
        "id": "change-001",
        "type": "vocabulary",
        "polished_position": {
          "start": 12,
          "end": 20,
          "line": 1
        },
        "polished_text": "polished",
        "original_text": "original",
        "reason": "Using more academic vocabulary enhances the professional tone",
        "alternatives": [
          {
            "text": "refined",
            "reason": "Another professional alternative"
          },
          {
            "text": "improved",
            "reason": "Simpler yet effective choice"
          }
        ],
        "confidence": 0.95,
        "impact": "Improves academic tone",
        "highlight_color": "#FFE082",
        "status": "pending"
      },
      {
        "id": "change-002",
        "type": "grammar",
        "polished_position": {
          "start": 35,
          "end": 46,
          "line": 1
        },
        "polished_text": "corrections",
        "original_text": "errors",
        "reason": "Better word choice for academic context",
        "alternatives": [],
        "confidence": 0.88,
        "impact": "Clarity improvement",
        "highlight_color": "#A5D6A7",
        "status": "pending"
      }
    ],
    "metadata": {
      "original_word_count": 8,
      "polished_word_count": 8,
      "total_changes": 2,
      "academic_score_improvement": 15.5
    },
    "statistics": {
      "vocabulary_changes": 1,
      "grammar_changes": 1,
      "structure_changes": 0
    }
  }
}
```

#### 错误响应

**404 Not Found - 记录不存在**
```json
{
  "code": 40401,
  "message": "记录不存在",
  "trace_id": "request-uuid"
}
```

**403 Forbidden - 无权访问**
```json
{
  "code": 40301,
  "message": "无权访问该记录",
  "trace_id": "request-uuid"
}
```

**401 Unauthorized - 未登录**
```json
{
  "code": 40101,
  "message": "未登录",
  "trace_id": "request-uuid"
}
```

### 数据结构说明

#### Change (修改标注)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 修改的唯一标识，用于后续操作 |
| type | string | 修改类型：`vocabulary`(词汇)、`grammar`(语法)、`structure`(结构) |
| polished_position | Position | 在润色后文本中的位置（用于前端高亮） |
| polished_text | string | 修改后的文本内容 |
| original_text | string | 原始文本内容 |
| reason | string | 修改的理由说明 |
| alternatives | Array<Alternative> | 可选的替代方案列表 |
| confidence | float | AI 置信度（0-1 之间） |
| impact | string | 此修改的影响维度说明 |
| highlight_color | string | 建议的高亮颜色（HEX格式） |
| status | string | 操作状态：`pending`(待处理)、`accepted`(已接受)、`rejected`(已拒绝) |

#### Position (位置信息)
| 字段 | 类型 | 说明 |
|------|------|------|
| start | int | 字符级起始位置（基于 Unicode 字符，即 rune） |
| end | int | 字符级结束位置 |
| line | int | 所在行号（可选，可能为0） |

#### Alternative (替代方案)
| 字段 | 类型 | 说明 |
|------|------|------|
| text | string | 替代文本内容 |
| reason | string | 使用该替代方案的理由 |

---

## 2. 应用单个修改操作

### 接口信息
```
POST /api/v1/polish/compare/:trace_id/action
```

### 功能说明
对单个修改执行接受或拒绝操作，可选择使用替代方案。

### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| trace_id | string | 是 | 润色记录的唯一标识 |

### 请求体参数
```json
{
  "change_id": "change-001",
  "action": "accept",
  "alternative_index": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| change_id | string | 是 | 要操作的修改标注 ID |
| action | string | 是 | 操作类型：`accept`(接受) 或 `reject`(拒绝) |
| alternative_index | int | 否 | 当 action 为 accept 时，可指定使用第几个替代方案（索引从0开始） |

### 请求示例
```http
POST /api/v1/polish/compare/abc123def456/action HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "change_id": "change-001",
  "action": "accept"
}
```

### 响应格式

#### 成功响应 (200 OK)
```json
{
  "code": 0,
  "message": "success",
  "trace_id": "request-uuid",
  "data": {
    "success": true,
    "updated_content": "This is the polished text with corrections.",
    "applied_changes": ["change-001"],
    "pending_changes": ["change-002", "change-003"]
  }
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 操作是否成功 |
| updated_content | string | 应用修改后的完整文本内容 |
| applied_changes | Array<string> | 已应用的修改 ID 列表 |
| pending_changes | Array<string> | 仍待处理的修改 ID 列表 |

#### 错误响应

**400 Bad Request - 参数错误**
```json
{
  "code": 40001,
  "message": "参数错误：action 必须是 accept 或 reject",
  "trace_id": "request-uuid"
}
```

**404 Not Found - 记录或修改不存在**
```json
{
  "code": 40401,
  "message": "记录不存在或修改ID不存在",
  "trace_id": "request-uuid"
}
```

---

## 3. 批量应用修改操作

### 接口信息
```
POST /api/v1/polish/compare/:trace_id/batch-action
```

### 功能说明
批量执行接受或拒绝操作。**注意：当前版本仅支持 `accept_all` 操作。**

### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| trace_id | string | 是 | 润色记录的唯一标识 |

### 请求体参数
```json
{
  "action": "accept_all",
  "change_ids": ["change-001", "change-002"]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 批量操作类型：`accept_all`(全部接受) 或 `reject_all`(全部拒绝，暂不支持) |
| change_ids | Array<string> | 否 | 指定要操作的修改 ID 列表，如果不提供则操作所有修改 |

### 请求示例

**全部接受所有修改：**
```http
POST /api/v1/polish/compare/abc123def456/batch-action HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "action": "accept_all"
}
```

**接受指定的修改：**
```http
POST /api/v1/polish/compare/abc123def456/batch-action HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "action": "accept_all",
  "change_ids": ["change-001", "change-002"]
}
```

### 响应格式

#### 成功响应 (200 OK)
```json
{
  "code": 0,
  "message": "success",
  "trace_id": "request-uuid",
  "data": {
    "success": true,
    "updated_content": "This is the final polished text with all corrections applied.",
    "applied_count": 5
  }
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 操作是否成功 |
| updated_content | string | 应用所有修改后的完整文本内容 |
| applied_count | int | 成功应用的修改数量 |

#### 错误响应

**400 Bad Request - 操作类型不支持**
```json
{
  "code": 40001,
  "message": "目前只支持 accept_all 操作",
  "trace_id": "request-uuid"
}
```

---

## 前端实现建议

### 1. 页面布局结构

建议采用三栏布局：

```
┌─────────────────────────────────────────────────────────┐
│  Header (trace_id, 统计信息, 批量操作按钮)               │
├──────────────┬─────────────────────┬────────────────────┤
│              │                     │                    │
│  原文显示    │   润色后文本显示    │   修改详情面板     │
│  (只读)      │   (高亮显示修改)    │   (当前选中的修改) │
│              │                     │                    │
│              │                     │  - 原文           │
│              │                     │  - 修改后         │
│              │                     │  - 理由           │
│              │                     │  - 替代方案       │
│              │                     │  - 操作按钮       │
│              │                     │                    │
└──────────────┴─────────────────────┴────────────────────┘
```

### 2. 高亮显示实现

**步骤：**
1. 调用 `GET /polish/compare/:trace_id` 获取对比数据
2. 在润色后文本中根据 `annotations` 数组中每个 `Change` 的 `polished_position` 进行高亮
3. 使用 `highlight_color` 字段指定的颜色
4. 根据 `type` 字段可选择不同的高亮样式：
   - `vocabulary`: 黄色系 (#FFE082)
   - `grammar`: 绿色系 (#A5D6A7)
   - `structure`: 蓝色系 (#90CAF9)

**示例代码（React + TypeScript）：**
```typescript
interface HighlightSegment {
  text: string;
  changeId?: string;
  color?: string;
  type?: string;
}

function highlightText(content: string, annotations: Change[]): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  const sortedAnnotations = [...annotations].sort((a, b) =>
    a.polished_position.start - b.polished_position.start
  );

  let lastIndex = 0;

  for (const change of sortedAnnotations) {
    const { start, end } = change.polished_position;

    // 添加普通文本段
    if (lastIndex < start) {
      segments.push({
        text: content.substring(lastIndex, start)
      });
    }

    // 添加高亮文本段
    segments.push({
      text: content.substring(start, end),
      changeId: change.id,
      color: change.highlight_color,
      type: change.type
    });

    lastIndex = end;
  }

  // 添加剩余文本
  if (lastIndex < content.length) {
    segments.push({
      text: content.substring(lastIndex)
    });
  }

  return segments;
}

// 渲染组件
function PolishedTextDisplay({ content, annotations, onChangeClick }) {
  const segments = highlightText(content, annotations);

  return (
    <div className="polished-text">
      {segments.map((segment, index) =>
        segment.changeId ? (
          <span
            key={index}
            className={`highlight highlight-${segment.type}`}
            style={{ backgroundColor: segment.color }}
            onClick={() => onChangeClick(segment.changeId)}
            title="点击查看详情"
          >
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </div>
  );
}
```

### 3. 交互流程

#### 3.1 查看修改详情
```typescript
// 1. 加载对比数据
async function loadComparison(traceId: string) {
  const response = await fetch(`/api/v1/polish/compare/${traceId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });

  const result = await response.json();
  return result.data;
}

// 2. 点击高亮文本，显示详情
function handleChangeClick(changeId: string) {
  const change = annotations.find(c => c.id === changeId);
  setSelectedChange(change);
  // 在右侧面板显示详情
}
```

#### 3.2 接受单个修改
```typescript
async function acceptChange(traceId: string, changeId: string, alternativeIndex?: number) {
  const response = await fetch(`/api/v1/polish/compare/${traceId}/action`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      change_id: changeId,
      action: 'accept',
      alternative_index: alternativeIndex
    })
  });

  const result = await response.json();

  if (result.code === 0) {
    // 更新本地状态
    updateChangeStatus(changeId, 'accepted');
    setUpdatedContent(result.data.updated_content);
  }
}
```

#### 3.3 拒绝单个修改
```typescript
async function rejectChange(traceId: string, changeId: string) {
  const response = await fetch(`/api/v1/polish/compare/${traceId}/action`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      change_id: changeId,
      action: 'reject'
    })
  });

  const result = await response.json();

  if (result.code === 0) {
    updateChangeStatus(changeId, 'rejected');
    setUpdatedContent(result.data.updated_content);
  }
}
```

#### 3.4 全部接受
```typescript
async function acceptAllChanges(traceId: string) {
  const response = await fetch(`/api/v1/polish/compare/${traceId}/batch-action`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'accept_all'
    })
  });

  const result = await response.json();

  if (result.code === 0) {
    // 更新所有修改状态为 accepted
    setAllChangesAccepted();
    setFinalContent(result.data.updated_content);
    showSuccessMessage(`成功应用 ${result.data.applied_count} 处修改`);
  }
}
```

### 4. 数据类型定义（TypeScript）

```typescript
// API 响应基础结构
interface ApiResponse<T> {
  code: number;
  message: string;
  trace_id: string;
  data?: T;
}

// 对比结果
interface ComparisonResult {
  trace_id: string;
  original_content: string;
  polished_content: string;
  annotations: Change[];
  metadata: Metadata;
  statistics: Statistics;
}

// 修改标注
interface Change {
  id: string;
  type: 'vocabulary' | 'grammar' | 'structure';
  polished_position: Position;
  polished_text: string;
  original_text: string;
  reason: string;
  alternatives: Alternative[];
  confidence: number;
  impact: string;
  highlight_color: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// 位置信息
interface Position {
  start: number;
  end: number;
  line: number;
}

// 替代方案
interface Alternative {
  text: string;
  reason: string;
}

// 元数据
interface Metadata {
  original_word_count: number;
  polished_word_count: number;
  total_changes: number;
  academic_score_improvement: number;
}

// 统计信息
interface Statistics {
  vocabulary_changes: number;
  grammar_changes: number;
  structure_changes: number;
}

// 单个操作请求
interface ChangeActionRequest {
  change_id: string;
  action: 'accept' | 'reject';
  alternative_index?: number;
}

// 单个操作响应
interface ChangeActionResponse {
  success: boolean;
  updated_content: string;
  applied_changes: string[];
  pending_changes: string[];
}

// 批量操作请求
interface BatchActionRequest {
  action: 'accept_all' | 'reject_all';
  change_ids?: string[];
}

// 批量操作响应
interface BatchActionResponse {
  success: boolean;
  updated_content: string;
  applied_count: number;
}
```

### 5. 状态管理建议

使用状态管理库（如 Redux、Zustand 等）管理以下状态：

```typescript
interface ComparisonState {
  traceId: string;
  originalContent: string;
  polishedContent: string;
  currentContent: string;        // 实时更新的内容
  annotations: Change[];
  metadata: Metadata;
  statistics: Statistics;
  selectedChangeId: string | null;
  loading: boolean;
  error: string | null;
}

// Actions
const actions = {
  loadComparison: async (traceId: string) => { /* ... */ },
  selectChange: (changeId: string) => { /* ... */ },
  acceptChange: async (changeId: string, altIndex?: number) => { /* ... */ },
  rejectChange: async (changeId: string) => { /* ... */ },
  acceptAll: async () => { /* ... */ },
  updateChangeStatus: (changeId: string, status: ActionStatus) => { /* ... */ }
};
```

### 6. 错误处理

```typescript
async function handleApiError(response: Response) {
  if (!response.ok) {
    const error = await response.json();

    switch (error.code) {
      case 40101:
        // 未登录，跳转到登录页
        redirectToLogin();
        break;
      case 40301:
        // 无权访问
        showError('您没有权限访问该记录');
        break;
      case 40401:
        // 记录不存在
        showError('记录不存在');
        break;
      case 40001:
        // 参数错误
        showError(error.message);
        break;
      default:
        showError('操作失败，请稍后重试');
    }

    throw new Error(error.message);
  }

  return response.json();
}
```

---

## 注意事项

1. **认证要求**：所有接口都需要在请求头中携带有效的 JWT token
2. **权限校验**：用户只能访问自己的润色记录
3. **字符位置**：`Position` 中的 `start` 和 `end` 是基于 Unicode 字符（rune）的位置，需要正确处理多字节字符
4. **状态管理**：前端需要本地维护修改的状态（pending/accepted/rejected），避免频繁请求
5. **批量操作限制**：当前版本只支持 `accept_all`，`reject_all` 将在后续版本支持
6. **替代方案**：使用替代方案时，传入 `alternative_index`（从0开始）

---

## 完整示例流程

```typescript
// 1. 页面加载时获取对比数据
useEffect(() => {
  async function init() {
    const data = await loadComparison(traceId);
    setComparisonData(data);
  }
  init();
}, [traceId]);

// 2. 用户点击高亮文本
<PolishedTextDisplay
  content={polishedContent}
  annotations={annotations}
  onChangeClick={(changeId) => {
    const change = annotations.find(c => c.id === changeId);
    setSelectedChange(change);
  }}
/>

// 3. 右侧面板显示详情和操作按钮
<DetailPanel change={selectedChange}>
  <button onClick={() => acceptChange(traceId, selectedChange.id)}>
    接受修改
  </button>
  <button onClick={() => rejectChange(traceId, selectedChange.id)}>
    拒绝修改
  </button>
  {selectedChange.alternatives.map((alt, index) => (
    <button key={index} onClick={() =>
      acceptChange(traceId, selectedChange.id, index)
    }>
      使用替代方案: {alt.text}
    </button>
  ))}
</DetailPanel>

// 4. 顶部批量操作
<button onClick={() => acceptAllChanges(traceId)}>
  全部接受
</button>
```

---

## 联系与支持

如有疑问或需要更多技术支持，请联系后端开发团队。
