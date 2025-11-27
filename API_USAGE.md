# API 使用文档

## 概述

本文档说明如何使用 `src/services/api.js` 中提供的用户认证和论文润色 API。

**重要提示**：本API已完全按照后端规范实现，请参考 `FRONTEND_INTEGRATION.md` 获取完整的接口文档。

## API 基础配置

API 基础 URL 可以通过环境变量配置：

```bash
# .env 文件
VITE_API_BASE_URL=http://localhost:8080
```

## 统一响应格式

所有API都遵循后端统一响应格式：

```javascript
{
  code: 0,              // 错误码，0表示成功
  message: "success",   // 响应消息
  data: {...},          // 响应数据
  trace_id: "abc123"    // 请求追踪ID
}
```

前端API函数会自动处理这个格式，并返回简化的结果：

```javascript
{
  success: true,
  data: {...},          // 实际数据
  message: "success",
  traceId: "abc123"
}
```

## 错误码常量

```javascript
import { ErrorCodes, getErrorMessage } from './services/api'

// 错误码常量
ErrorCodes.SUCCESS          // 0 - 成功
ErrorCodes.PARAM_ERROR      // 10001 - 参数错误
ErrorCodes.USER_EXISTS      // 20001 - 用户已存在
ErrorCodes.PASSWORD_ERROR   // 20002 - 密码错误
ErrorCodes.USER_NOT_FOUND   // 20003 - 用户不存在
ErrorCodes.TOKEN_INVALID    // 20004 - Token无效
ErrorCodes.TOKEN_EXPIRED    // 20005 - Token过期
ErrorCodes.PASSWORD_WEAK    // 20006 - 密码强度不够
ErrorCodes.ACCOUNT_BANNED   // 20007 - 账号已被封禁
ErrorCodes.UNAUTHORIZED     // 20008 - 未授权
ErrorCodes.FORBIDDEN        // 20009 - 禁止访问

// 获取错误提示
const errorMsg = getErrorMessage(20002) // "密码错误"
```

## Token 管理工具函数

### Access Token 管理

```javascript
import {
  saveAccessToken,
  getAccessToken,
  removeAccessToken
} from './services/api'

// 保存 Access Token
saveAccessToken('your-access-token')

// 获取 Access Token
const token = getAccessToken()

// 删除 Access Token
removeAccessToken()
```

### Refresh Token 管理

```javascript
import {
  saveRefreshToken,
  getRefreshToken,
  removeRefreshToken
} from './services/api'

// 保存 Refresh Token
saveRefreshToken('your-refresh-token')

// 获取 Refresh Token
const refreshToken = getRefreshToken()

// 删除 Refresh Token
removeRefreshToken()
```

### Token 批量操作

```javascript
import {
  saveTokens,
  clearTokens,
  clearAuthData
} from './services/api'

// 同时保存两个 Token
saveTokens(accessToken, refreshToken)

// 清除所有 Token
clearTokens()

// 清除所有认证数据（包括Token和用户信息）
clearAuthData()
```

### 用户信息管理

```javascript
import {
  saveUserInfo,
  getUserInfo,
  removeUserInfo
} from './services/api'

// 保存用户信息
saveUserInfo({
  id: 1,
  username: 'user',
  email: 'user@example.com'
})

// 获取用户信息
const userInfo = getUserInfo()

// 删除用户信息
removeUserInfo()
```

### 登录状态检查

```javascript
import { isLoggedIn } from './services/api'

if (isLoggedIn()) {
  console.log('用户已登录')
}
```

## 用户认证相关 API

### 1. 用户注册 - register()

```javascript
import { register } from './services/api'

try {
  const result = await register({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Password123',
    confirm_password: 'Password123',
    nickname: 'John'  // 可选
  })

  console.log('注册成功:', result.message)
  console.log('用户信息:', result.data)
  console.log('TraceID:', result.traceId)
} catch (error) {
  console.error('错误码:', error.code)
  console.error('错误信息:', error.message)
}
```

**请求参数：**
- `username` (string, 必填): 用户名，3-50位，只能包含字母、数字、下划线
- `email` (string, 必填): 邮箱地址
- `password` (string, 必填): 密码，至少8位，必须包含字母和数字
- `confirm_password` (string, 必填): 确认密码，必须与password一致
- `nickname` (string, 可选): 昵称，最多50位

**返回结果：**
```javascript
{
  success: true,
  message: "success",
  data: {
    id: 1,
    username: "johndoe",
    email: "john@example.com",
    nickname: "John",
    avatar_url: "",
    status: "active",
    email_verified: false,
    created_at: "2024-01-01T10:00:00Z"
  },
  traceId: "abc123"
}
```

### 2. 用户登录 - login()

```javascript
import { login } from './services/api'

try {
  const result = await login({
    username: 'john@example.com',  // 可以是用户名或邮箱
    password: 'Password123'
  })

  console.log('登录成功:', result.message)
  console.log('用户信息:', result.data.user)
  // Token 已自动保存到 localStorage
} catch (error) {
  console.error('登录失败:', error.message)
}
```

**请求参数：**
- `username` (string): 用户名或邮箱
- `password` (string): 密码

**返回结果：**
```javascript
{
  success: true,
  message: "success",
  data: {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    expires_in: 7200,
    token_type: "Bearer",
    user: {
      id: 1,
      username: "johndoe",
      email: "john@example.com",
      nickname: "John",
      // ... 其他用户信息
    }
  },
  traceId: "abc123"
}
```

**注意：**
- `access_token` 和 `refresh_token` 会自动保存到 localStorage
- 用户信息会自动保存到 localStorage
- `access_token` 有效期为 2 小时

### 3. 获取当前用户信息 - getCurrentUser()

```javascript
import { getCurrentUser } from './services/api'

try {
  const result = await getCurrentUser()
  console.log('用户信息:', result.data)
  // 用户信息会自动更新到 localStorage
} catch (error) {
  if (error.code === 20008) {
    // 未授权，跳转到登录页
    window.location.href = '/login'
  }
}
```

**返回结果：**
```javascript
{
  success: true,
  data: {
    id: 1,
    username: "johndoe",
    email: "john@example.com",
    nickname: "John",
    avatar_url: "",
    status: "active",
    email_verified: false,
    last_login_at: "2024-01-01T10:00:00Z",
    created_at: "2024-01-01T09:00:00Z"
  },
  traceId: "abc123"
}
```

### 4. 刷新访问令牌 - refreshAccessToken()

```javascript
import { refreshAccessToken, getRefreshToken } from './services/api'

try {
  const refreshToken = getRefreshToken()
  const result = await refreshAccessToken(refreshToken)

  console.log('Token刷新成功')
  // 新的 access_token 已自动保存
} catch (error) {
  console.error('Token刷新失败:', error.message)
  // 刷新失败，所有认证数据已自动清除
  window.location.href = '/login'
}
```

**返回结果：**
```javascript
{
  success: true,
  data: {
    access_token: "new-access-token",
    expires_in: 7200,
    token_type: "Bearer"
  },
  traceId: "abc123"
}
```

### 5. 用户登出 - logout()

```javascript
import { logout } from './services/api'

try {
  await logout()
  console.log('登出成功')
  // Token 和用户信息已自动清除
  window.location.href = '/login'
} catch (error) {
  console.error('登出失败:', error.message)
}
```

**注意：** 即使后端请求失败，本地的 Token 和用户信息也会被清除。

## 论文润色相关 API

### 1. 论文润色 - polishText()

```javascript
import { polishText } from './services/api'

try {
  const result = await polishText({
    content: '需要润色的文本内容',
    style: 'academic',    // academic, formal, concise
    language: 'zh',       // zh, en
    provider: 'doubao'    // doubao, claude（可选）
  })

  console.log('润色后的文本:', result.data.polished_content)
  console.log('原文长度:', result.data.original_length)
  console.log('润色后长度:', result.data.polished_length)
  console.log('改进建议:', result.data.suggestions)
  console.log('使用的模型:', result.data.model_used)
  console.log('TraceID:', result.traceId)
} catch (error) {
  console.error('润色失败:', error.message)
}
```

**请求参数：**
- `content` (string, 必填): 需要润色的文本内容，最多10000字符
- `style` (string, 可选): 润色风格，默认 'academic'
  - `academic`: 学术风格
  - `formal`: 正式风格
  - `concise`: 简洁风格
- `language` (string, 可选): 目标语言，默认 'en'
  - `zh`: 中文
  - `en`: 英文
- `provider` (string, 可选): AI提供商
  - `doubao`: 豆包
  - `claude`: Claude

**返回结果：**
```javascript
{
  success: true,
  data: {
    polished_content: "润色后的文本内容",
    original_length: 25,
    polished_length: 38,
    suggestions: [
      "语言更加学术化",
      "增加了专业术语",
      "句式更加正式"
    ],
    provider_used: "doubao",
    model_used: "ep-m-20251124144251-5nxkx"
  },
  message: "success",
  traceId: "abc123"
}
```

### 2. 查询润色记录列表 - getPolishRecords()

```javascript
import { getPolishRecords } from './services/api'

try {
  const result = await getPolishRecords({
    page: 1,
    page_size: 20,
    language: 'zh',
    status: 'success',
    exclude_text: false
  })

  console.log('总记录数:', result.data.total)
  console.log('记录列表:', result.data.records)
} catch (error) {
  console.error('获取记录失败:', error.message)
}
```

**查询参数：** 所有参数都是可选的
- `page` (number): 页码，默认1
- `page_size` (number): 每页大小，默认20，最大100
- `provider` (string): 按提供商过滤
- `status` (string): 按状态过滤（success, failed）
- `language` (string): 按语言过滤（en, zh）
- `style` (string): 按风格过滤（academic, formal, concise）
- `exclude_text` (boolean): 是否排除大文本字段，默认false
- `start_time` (string): 开始时间，RFC3339格式
- `end_time` (string): 结束时间，RFC3339格式

### 3. 根据TraceID查询记录 - getPolishRecordByTraceId()

```javascript
import { getPolishRecordByTraceId } from './services/api'

try {
  const result = await getPolishRecordByTraceId('abc123')
  console.log('记录详情:', result.data)
} catch (error) {
  console.error('获取记录失败:', error.message)
}
```

### 4. 获取统计信息 - getPolishStatistics()

```javascript
import { getPolishStatistics } from './services/api'

try {
  const result = await getPolishStatistics({
    start_time: '2024-01-01T00:00:00Z',
    end_time: '2024-12-31T23:59:59Z'
  })

  console.log('总请求数:', result.data.total_count)
  console.log('成功率:', result.data.success_rate)
  console.log('平均处理时间:', result.data.avg_process_time_ms, 'ms')
  console.log('提供商统计:', result.data.provider_stats)
} catch (error) {
  console.error('获取统计信息失败:', error.message)
}
```

## 其他 API

### API 连接测试 - testConnection()

```javascript
import { testConnection } from './services/api'

const isConnected = await testConnection()
if (isConnected) {
  console.log('API 连接正常')
} else {
  console.log('API 连接失败')
}
```

## React 组件使用示例

### 登录组件

```jsx
import { useState } from 'react'
import { login, isLoggedIn, getUserInfo } from './services/api'

function LoginComponent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await login({ username, password })
      alert('登录成功！')
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    }
  }

  const userInfo = getUserInfo()
  const loggedIn = isLoggedIn()

  return (
    <div>
      {loggedIn ? (
        <div>
          <p>欢迎, {userInfo?.username}!</p>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名或邮箱"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
          />
          <button type="submit">登录</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      )}
    </div>
  )
}
```

### 论文润色组件

```jsx
import { useState } from 'react'
import { polishText } from './services/api'

function PolishComponent() {
  const [content, setContent] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePolish = async () => {
    if (!content.trim()) {
      alert('请输入内容')
      return
    }

    setLoading(true)
    try {
      const res = await polishText({
        content,
        style: 'academic',
        language: 'zh'
      })
      setResult(res.data)
    } catch (error) {
      alert('润色失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="请输入需要润色的文本..."
        rows={8}
      />
      <button onClick={handlePolish} disabled={loading}>
        {loading ? '润色中...' : '开始润色'}
      </button>

      {result && (
        <div>
          <h3>润色结果：</h3>
          <p>{result.polished_content}</p>
          <div>
            <small>
              原文长度: {result.original_length} |
              润色后长度: {result.polished_length}
            </small>
          </div>
        </div>
      )}
    </div>
  )
}
```

## 错误处理

所有 API 函数在出错时都会抛出错误对象：

```javascript
{
  success: false,
  code: 20002,              // 错误码
  message: "密码错误",       // 错误信息
  traceId: "xyz789"         // 请求追踪ID
}
```

建议使用 try-catch 块处理错误：

```javascript
try {
  const result = await someApiFunction(params)
  // 处理成功结果
} catch (error) {
  // 根据错误码进行不同处理
  if (error.code === 20008) {
    // 未授权，跳转登录
    window.location.href = '/login'
  } else if (error.code === 20005) {
    // Token过期，尝试刷新
    await refreshAccessToken(getRefreshToken())
  } else {
    // 显示错误消息给用户
    alert(error.message)
  }
}
```

## 注意事项

1. **Token 自动管理**：登录和注册成功后，access_token 和 refresh_token 会自动保存到 localStorage。

2. **用户信息同步**：获取或更新用户信息后，数据会自动同步到 localStorage。

3. **登出清理**：登出时会自动清除 localStorage 中的所有认证数据。

4. **Token 过期处理**：当 access_token 过期（错误码 20005）时，应使用 refresh_token 刷新。

5. **环境变量**：确保在 `.env` 文件中正确配置了 `VITE_API_BASE_URL`。

6. **认证头**：需要认证的接口会自动添加 `Authorization: Bearer {access_token}` 头。

7. **TraceID**：所有API响应都包含 traceId，可用于问题追踪。

## 完整文档参考

- 详细接口文档：[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
- 后端认证实现：AUTH_IMPLEMENTATION.md
- API测试指南：APIFOX_IMPORT_GUIDE.md
- OpenAPI规范：openapi.yaml
