# 多版本润色 API 文档

## 接口概述

同时生成三个不同强度的论文润色版本，供用户选择最合适的结果。

## 请求信息

```
POST /api/v1/polish/multi
Content-Type: application/json
Authorization: Bearer {access_token}
```

## 请求参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| content | string | ✅ | 待润色文本（最大10000字符） | "This paper discuss..." |
| language | string | ❌ | 目标语言：`en`/`zh`，默认`en` | "en" |
| style | string | ❌ | 润色风格：`academic`/`formal`/`concise`，默认`academic` | "academic" |
| provider | string | ❌ | AI提供商：`claude`/`doubao`，默认使用配置的提供商 | "doubao" |
| versions | array | ❌ | 指定版本：`conservative`/`balanced`/`aggressive`，不指定则生成全部 | ["balanced"] |

### 版本类型说明

- **conservative（保守版本）**：仅修正明显错误，保持原文风格
- **balanced（平衡版本）**：适度优化，兼顾准确性和学术性
- **aggressive（激进版本）**：大幅提升学术性，可能改变句式结构

## 响应格式

### 成功响应 (200)

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "trace_id": "1234567890",
    "original_length": 45,
    "provider_used": "doubao",
    "versions": {
      "conservative": {
        "polished_content": "This paper discusses...",
        "polished_length": 48,
        "suggestions": ["修正语法错误", "调整标点"],
        "process_time_ms": 1500,
        "model_used": "ep-m-20251124144251-5nxkx",
        "status": "success"
      },
      "balanced": {
        "polished_content": "This paper investigates...",
        "polished_length": 52,
        "suggestions": ["优化词汇", "改进结构"],
        "process_time_ms": 1800,
        "model_used": "ep-m-20251124144251-5nxkx",
        "status": "success"
      },
      "aggressive": {
        "polished_content": "This study comprehensively examines...",
        "polished_length": 58,
        "suggestions": ["大幅提升学术性", "重构句式"],
        "process_time_ms": 2100,
        "model_used": "ep-m-20251124144251-5nxkx",
        "status": "success"
      }
    }
  },
  "trace_id": "1234567890"
}
```

### 错误响应

| 状态码 | 说明 |
|--------|------|
| 400 | 参数错误（文本过长、参数格式错误等） |
| 401 | 未登录或 token 无效 |
| 403 | 无权限使用多版本功能 |
| 500 | 服务器错误 |

```json
{
  "code": 40300,
  "message": "您还未开通多版本润色功能",
  "trace_id": "1234567890"
}
```

## 前端示例代码

### JavaScript (Fetch)

```javascript
async function polishMultiVersion(content, language = 'en') {
  try {
    const response = await fetch('/api/v1/polish/multi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({
        content,
        language,
        style: 'academic'
      })
    });

    const result = await response.json();

    if (result.code === 0) {
      // 成功：显示三个版本
      const { conservative, balanced, aggressive } = result.data.versions;
      displayVersions(conservative, balanced, aggressive);
    } else {
      // 错误处理
      showError(result.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
    showError('网络错误，请稍后重试');
  }
}
```

### React Hook

```typescript
import { useState } from 'react';
import axios from 'axios';

interface VersionResult {
  polished_content: string;
  polished_length: number;
  suggestions: string[];
  process_time_ms: number;
  model_used: string;
  status: 'success' | 'failed';
  error_message?: string;
}

interface MultiVersionResponse {
  trace_id: string;
  original_length: number;
  provider_used: string;
  versions: {
    conservative: VersionResult;
    balanced: VersionResult;
    aggressive: VersionResult;
  };
}

export function useMultiVersionPolish() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MultiVersionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const polish = async (content: string, language: 'en' | 'zh' = 'en') => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/v1/polish/multi', {
        content,
        language,
        style: 'academic'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.data.code === 0) {
        setData(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  return { polish, loading, data, error };
}
```

## UI 设计建议

### 1. 标签页切换

```
┌──────────────────────────────────────────┐
│  原文 | 版本1-学术风格 | 版本2-简洁风格 | 版本3-专业风格  │
├──────────────────────────────────────────┤
│                                          │
│  [当前选中版本的对比视图]                   │
│                                          │
│  左侧：原文    右侧：润色版本              │
│                                          │
│  [应用此版本] [导出] [分享]               │
└──────────────────────────────────────────┘
```

### 2. 加载状态

- 显示三个版本的加载进度
- 某个版本失败时仍显示其他成功版本
- 预计耗时：3-5秒（三个版本并发生成）

### 3. 错误处理

```javascript
// 权限不足
if (response.data.code === 40300) {
  showUpgradeModal('您还未开通多版本功能，请联系管理员');
}

// 部分版本失败
if (versions.conservative.status === 'failed') {
  showWarning(`保守版本生成失败: ${versions.conservative.error_message}`);
  // 仍然显示其他成功的版本
}
```

## 注意事项

1. **超时时间**：建议设置 30 秒超时（三个版本并发，平均每个5-10秒）
2. **权限检查**：调用前可先调用 `/api/v1/auth/me` 检查用户是否有 `enable_multi_version` 权限
3. **防抖处理**：避免用户频繁点击导致重复请求
4. **文本长度**：前端应限制输入最大10000字符
5. **trace_id 保存**：响应中的 `trace_id` 用于后续查询和对比，建议保存

## 相关接口

- **查询记录**: `GET /api/v1/polish/records/:trace_id` - 根据 trace_id 查询润色记录
- **单版本润色**: `POST /api/v1/polish` - 仅生成一个版本（更快）
- **用户权限**: `GET /api/v1/auth/me` - 查看用户是否有多版本权限

## 完整示例

完整的前端实现示例请参考：`/docs/api/openapi.yaml`
