import './InputPanel.css'

function InputPanel({ text, onTextChange, config, onConfigChange, onPolish, isPolishing }) {
  const getWordCount = () => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getEstimatedTime = () => {
    const charCount = text.length
    if (charCount < 500) return '约 10 秒'
    if (charCount < 2000) return '约 30 秒'
    return '约 1 分钟'
  }

  return (
    <div className="input-panel">
      <div className="tips-banner">
        <span className="tips-icon">💡</span>
        <div className="tips-content">
          <strong>使用提示：</strong>
          粘贴您的论文内容，选择合适的润色配置，即可获得专业的润色建议
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <h2 className="panel-title">
            <span className="title-icon">📝</span>
            输入您的论文内容
          </h2>
          {text.length > 0 && (
            <div className="quick-stats">
              <span className="stat-badge">{text.length} 字符</span>
              <span className="stat-badge">{getWordCount()} 词</span>
            </div>
          )}
        </div>

        <div className="input-wrapper">
          <textarea
            className="text-input"
            placeholder="在此粘贴或输入需要润色的论文内容...&#10;&#10;支持中文、英文等多种语言&#10;建议输入完整的段落以获得更好的润色效果"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={12}
          />
          {text.length === 0 && (
            <div className="input-overlay">
              <div className="overlay-content">
                <span className="overlay-icon">📄</span>
                <p>开始输入或粘贴您的论文内容</p>
              </div>
            </div>
          )}
        </div>

        <div className="config-section">
          <h3 className="config-title">
            <span className="title-icon">⚙️</span>
            润色配置
          </h3>

          <div className="config-grid">
            <div className="config-item">
              <label className="config-label">
                <span className="label-icon">🎨</span>
                润色风格
              </label>
              <select
                className="config-select"
                value={config.style}
                onChange={(e) => onConfigChange({ ...config, style: e.target.value })}
              >
                <option value="academic">📚 学术风格</option>
                <option value="formal">👔 正式风格</option>
                <option value="concise">✂️ 简洁风格</option>
                <option value="detailed">📋 详细风格</option>
              </select>
            </div>

            <div className="config-item">
              <label className="config-label">
                <span className="label-icon">🌐</span>
                目标语言
              </label>
              <select
                className="config-select"
                value={config.language}
                onChange={(e) => onConfigChange({ ...config, language: e.target.value })}
              >
                <option value="zh-CN">🇨🇳 中文</option>
                <option value="en-US">🇺🇸 英文</option>
                <option value="zh-TW">🇹🇼 繁体中文</option>
              </select>
            </div>

            <div className="config-item">
              <label className="config-label">
                <span className="label-icon">🤖</span>
                AI 提供商
              </label>
              <select
                className="config-select"
                value={config.provider}
                onChange={(e) => onConfigChange({ ...config, provider: e.target.value })}
              >
                <option value="doubao">🚀 豆包 (推荐)</option>
                <option value="openai">OpenAI GPT-4</option>
                <option value="claude">Claude 3</option>
                <option value="gemini">Google Gemini</option>
                <option value="qwen">通义千问</option>
              </select>
            </div>
          </div>
        </div>

        <div className="action-section">
          <button
            className="polish-button"
            onClick={onPolish}
            disabled={isPolishing || !text.trim()}
          >
            {isPolishing ? (
              <>
                <span className="spinner"></span>
                正在润色中...
              </>
            ) : (
              <>
                <span className="button-icon">✨</span>
                开始润色
              </>
            )}
          </button>

          <div className="action-info">
            {text.length > 0 && !isPolishing && (
              <div className="info-item">
                <span className="info-icon">⏱️</span>
                <span className="info-text">预计耗时：{getEstimatedTime()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InputPanel
