// API 服务模块 - 处理与后端的通信

// 获取 API 基础 URL
// 生产环境下为空字符串（使用相对路径），开发环境使用 localhost:8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:8080'

// ============================================
// 错误码常量
// ============================================

export const ErrorCodes = {
  SUCCESS: 0,
  PARAM_ERROR: 10001,
  USER_EXISTS: 20001,
  PASSWORD_ERROR: 20002,
  USER_NOT_FOUND: 20003,
  TOKEN_INVALID: 20004,
  TOKEN_EXPIRED: 20005,
  PASSWORD_WEAK: 20006,
  ACCOUNT_BANNED: 20007,
  UNAUTHORIZED: 20008,
  FORBIDDEN: 20009,
}

/**
 * 获取错误码对应的友好提示信息
 * @param {number} code - 错误码
 * @returns {string} 友好提示信息
 */
export function getErrorMessage(code) {
  const errorMessages = {
    [ErrorCodes.PARAM_ERROR]: '参数错误，请检查输入',
    [ErrorCodes.USER_EXISTS]: '用户已存在，请换用户名或邮箱',
    [ErrorCodes.PASSWORD_ERROR]: '密码错误',
    [ErrorCodes.USER_NOT_FOUND]: '用户不存在',
    [ErrorCodes.TOKEN_INVALID]: 'Token无效，请重新登录',
    [ErrorCodes.TOKEN_EXPIRED]: 'Token已过期，请重新登录',
    [ErrorCodes.PASSWORD_WEAK]: '密码强度不够，至少8位且包含字母和数字',
    [ErrorCodes.ACCOUNT_BANNED]: '账号已被封禁，请联系管理员',
    [ErrorCodes.UNAUTHORIZED]: '未授权，请先登录',
    [ErrorCodes.FORBIDDEN]: '权限不足',
  }
  return errorMessages[code] || '请求失败'
}

// ============================================
// Token 管理工具函数
// ============================================

const ACCESS_TOKEN_KEY = 'paper_ai_access_token'
const REFRESH_TOKEN_KEY = 'paper_ai_refresh_token'
const USER_INFO_KEY = 'paper_ai_user_info'

/**
 * 保存 Access Token 到 localStorage
 * @param {string} token - JWT access token
 */
export function saveAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * 获取保存的 Access Token
 * @returns {string|null} Token 或 null
 */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * 删除保存的 Access Token
 */
export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * 保存 Refresh Token 到 localStorage
 * @param {string} token - JWT refresh token
 */
export function saveRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * 获取保存的 Refresh Token
 * @returns {string|null} Token 或 null
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 删除保存的 Refresh Token
 */
export function removeRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 同时保存 Access Token 和 Refresh Token
 * @param {string} accessToken - Access Token
 * @param {string} refreshToken - Refresh Token
 */
export function saveTokens(accessToken, refreshToken) {
  saveAccessToken(accessToken)
  saveRefreshToken(refreshToken)
}

/**
 * 清除所有 Token
 */
export function clearTokens() {
  removeAccessToken()
  removeRefreshToken()
}

/**
 * 保存用户信息到 localStorage
 * @param {Object} userInfo - 用户信息对象
 */
export function saveUserInfo(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 获取保存的用户信息
 * @returns {Object|null} 用户信息对象或 null
 */
export function getUserInfo() {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 删除保存的用户信息
 */
export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  return !!getAccessToken()
}

/**
 * 清除所有登录状态数据
 */
export function clearAuthData() {
  clearTokens()
  removeUserInfo()
}

/**
 * 获取带有认证头的请求配置
 * @returns {Object} 包含认证头的配置对象
 */
function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  }
  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * 处理API响应
 * @param {Response} response - Fetch响应对象
 * @returns {Promise<Object>} 处理后的数据
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')

  if (!isJson) {
    throw new Error('服务器响应格式错误')
  }

  const data = await response.json()

  // 后端统一响应格式: { code, message, data, trace_id }
  if (data.code === ErrorCodes.SUCCESS) {
    return {
      success: true,
      data: data.data,
      message: data.message,
      traceId: data.trace_id
    }
  } else {
    // 处理错误码
    const errorMessage = data.message || getErrorMessage(data.code)
    throw {
      success: false,
      code: data.code,
      message: errorMessage,
      traceId: data.trace_id
    }
  }
}

// ============================================
// 用户认证相关 API
// ============================================

/**
 * 用户注册
 * @param {Object} params - 注册参数
 * @param {string} params.username - 用户名，3-50位，只能包含字母、数字、下划线
 * @param {string} params.email - 邮箱地址
 * @param {string} params.password - 密码，至少8位，包含字母和数字
 * @param {string} params.confirm_password - 确认密码，必须与password一致
 * @param {string} [params.nickname] - 昵称（可选），最多50位
 * @returns {Promise<Object>} 注册结果
 */
export async function register({ username, email, password, confirm_password, nickname }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        confirm_password,
        nickname
      })
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('用户注册失败:', error)
    if (error.success === false) {
      throw error
    }
    throw {
      success: false,
      message: error.message || '注册失败，请稍后重试'
    }
  }
}

/**
 * 用户登录
 * @param {Object} params - 登录参数
 * @param {string} params.username - 用户名或邮箱
 * @param {string} params.password - 密码
 * @returns {Promise<Object>} 登录结果，包含 access_token, refresh_token 和 user
 */
export async function login({ username, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    })

    const result = await handleResponse(response)

    // 登录成功后保存 tokens 和用户信息
    if (result.data && result.data.access_token) {
      saveTokens(result.data.access_token, result.data.refresh_token)
      if (result.data.user) {
        saveUserInfo(result.data.user)
      }
    }

    return result
  } catch (error) {
    console.error('用户登录失败:', error)
    if (error.success === false) {
      throw error
    }
    throw {
      success: false,
      message: error.message || '登录失败，请检查用户名和密码'
    }
  }
}

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} 用户信息
 */
export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    const result = await handleResponse(response)

    // 更新本地存储的用户信息
    if (result.data) {
      saveUserInfo(result.data)
    }

    return result
  } catch (error) {
    console.error('获取用户信息失败:', error)
    if (error.success === false) {
      throw error
    }
    throw {
      success: false,
      message: error.message || '获取用户信息失败'
    }
  }
}

/**
 * 刷新访问令牌
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<Object>} 新的 access_token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    })

    const result = await handleResponse(response)

    // 保存新的 access_token
    if (result.data && result.data.access_token) {
      saveAccessToken(result.data.access_token)
    }

    return result
  } catch (error) {
    console.error('刷新 Token 失败:', error)
    // 刷新失败，清除所有认证数据
    clearAuthData()
    if (error.success === false) {
      throw error
    }
    throw {
      success: false,
      message: error.message || '刷新 Token 失败'
    }
  }
}

/**
 * 用户登出
 * @returns {Promise<Object>} 登出结果
 */
export async function logout() {
  try {
    const refreshToken = getRefreshToken()

    if (refreshToken) {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      })

      // 无论后端是否成功，都清除本地存储的数据
      clearAuthData()

      try {
        return await handleResponse(response)
      } catch (error) {
        console.warn('登出请求失败:', error.message)
      }
    } else {
      clearAuthData()
    }

    return {
      success: true,
      message: '登出成功'
    }
  } catch (error) {
    console.error('用户登出失败:', error)
    // 即使请求失败，也清除本地数据
    clearAuthData()
    return {
      success: true,
      message: '登出成功'
    }
  }
}

// ============================================
// 论文润色相关 API
// ============================================

/**
 * 调用论文润色 API
 * @param {Object} params - 请求参数
 * @param {string} params.content - 需要润色的文本内容，最多10000字符
 * @param {string} [params.style] - 润色风格 (academic, formal, concise)，默认academic
 * @param {string} [params.language] - 目标语言 (zh, en)，默认en
 * @param {string} [params.provider] - AI 提供商 (doubao, claude)，可选
 * @returns {Promise<Object>} 润色结果
 */
export async function polishText({ content, style = 'academic', language = 'en', provider }) {
  try {
    // 将语言代码转换为后端需要的格式
    const langCode = language.startsWith('zh') ? 'zh' : language.startsWith('en') ? 'en' : 'en'

    const requestBody = {
      content,
      style,
      language: langCode
    }

    // provider 是可选的
    if (provider) {
      requestBody.provider = provider
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/polish`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody)
    })

    const result = await handleResponse(response)

    return {
      success: true,
      data: result.data,
      message: result.message,
      traceId: result.traceId
    }
  } catch (error) {
    console.error('论文润色失败:', error)
    if (error.success === false) {
      throw error
    }
    throw {
      success: false,
      message: error.message || '论文润色失败，请稍后重试'
    }
  }
}

/**
 * 查询润色记录列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码，默认1
 * @param {number} [params.page_size] - 每页大小，默认20，最大100
 * @param {string} [params.provider] - 按提供商过滤
 * @param {string} [params.status] - 按状态过滤：success、failed
 * @param {string} [params.language] - 按语言过滤：en、zh
 * @param {string} [params.style] - 按风格过滤：academic、formal、concise
 * @param {boolean} [params.exclude_text] - 是否排除大文本字段，默认false
 * @param {string} [params.start_time] - 开始时间，RFC3339格式
 * @param {string} [params.end_time] - 结束时间，RFC3339格式
 * @returns {Promise<Object>} 记录列表
 */
export async function getPolishRecords(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}/api/v1/polish/records${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('获取润色记录失败:', error)
    if (error.success === false) {
      throw error
    }
    throw {
      success: false,
      message: error.message || '获取润色记录失败'
    }
  }
}

/**
 * 根据TraceID查询记录
 * @param {string} traceId - 请求追踪ID
 * @returns {Promise<Object>} 记录详情
 */
export async function getPolishRecordByTraceId(traceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/polish/records/${traceId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('获取润色记录详情失败:', error)
    if (error.success === false) {
      throw error
    }
    throw {
      success: false,
      message: error.message || '获取记录详情失败'
    }
  }
}

/**
 * 获取统计信息
 * @param {Object} params - 查询参数
 * @param {string} [params.start_time] - 开始时间，RFC3339格式
 * @param {string} [params.end_time] - 结束时间，RFC3339格式
 * @returns {Promise<Object>} 统计信息
 */
export async function getPolishStatistics(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}/api/v1/polish/statistics${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('获取统计信息失败:', error)
    if (error.success === false) {
      throw error
    }
    throw {
      success: false,
      message: error.message || '获取统计信息失败'
    }
  }
}

/**
 * 测试 API 连接
 * @returns {Promise<boolean>} 连接是否成功
 */
export async function testConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response.ok
  } catch (error) {
    console.error('API 连接测试失败:', error)
    return false
  }
}
