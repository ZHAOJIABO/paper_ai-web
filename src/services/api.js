// API 服务模块 - 处理与后端的通信

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * 调用论文润色 API
 * @param {Object} params - 请求参数
 * @param {string} params.content - 需要润色的文本内容
 * @param {string} params.style - 润色风格 (academic, formal, concise, detailed)
 * @param {string} params.language - 目标语言 (zh, en)
 * @param {string} params.provider - AI 提供商 (doubao, openai, claude, gemini, qwen)
 * @returns {Promise<Object>} 润色结果
 */
export async function polishText({ content, style = 'academic', language = 'zh', provider = 'doubao' }) {
  try {
    // 将语言代码转换为后端需要的格式
    const langCode = language.startsWith('zh') ? 'zh' : language.startsWith('en') ? 'en' : 'zh'

    const response = await fetch(`${API_BASE_URL}/api/v1/polish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        style,
        language: langCode,
        provider
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // 根据后端返回的数据结构提取润色结果
    if (data.data && data.data.polished_content) {
      return {
        success: true,
        polishedText: data.data.polished_content,
        originalText: data.data.original_content || content
      }
    } else if (data.polished_content) {
      return {
        success: true,
        polishedText: data.polished_content,
        originalText: data.original_content || content
      }
    } else {
      throw new Error('返回数据格式错误')
    }
  } catch (error) {
    console.error('API 调用失败:', error)
    throw {
      success: false,
      message: error.message || '网络请求失败，请检查后端服务是否正常运行'
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
