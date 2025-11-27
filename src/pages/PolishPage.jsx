import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputPanel from '../components/InputPanel'
import ComparisonView from '../components/ComparisonView'
import PolishHistory from '../components/PolishHistory'
import { polishText } from '../services/api'
import './PolishPage.css'

function PolishPage() {
  const navigate = useNavigate()
  const [originalText, setOriginalText] = useState('')
  const [polishedText, setPolishedText] = useState('')
  const [config, setConfig] = useState({
    style: 'academic',
    language: 'zh-CN',
    provider: 'doubao' // 默认使用豆包，但保持可选
  })
  const [isPolishing, setIsPolishing] = useState(false)
  const [error, setError] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const handlePolish = async () => {
    if (!originalText.trim()) {
      alert('请输入需要润色的文本')
      return
    }

    setIsPolishing(true)
    setError('')

    try {
      const result = await polishText({
        content: originalText,
        style: config.style,
        language: config.language,
        provider: config.provider
      })

      // 新API响应格式: { success, data: { polished_content, ... }, message, traceId }
      if (result.success && result.data) {
        setPolishedText(result.data.polished_content)
        console.log('润色成功, TraceID:', result.traceId)
        console.log('使用的提供商:', result.data.provider_used)
        console.log('使用的模型:', result.data.model_used)
      } else {
        throw new Error(result.message || '润色失败')
      }
    } catch (err) {
      console.error('润色失败:', err)
      const errorMessage = err.message || '润色失败，请检查后端服务是否正常运行'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsPolishing(false)
    }
  }

  const handleClear = () => {
    setOriginalText('')
    setPolishedText('')
    setError('')
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleSelectRecord = (record) => {
    // 使用历史记录的内容
    setOriginalText(record.original_content || '')
    setPolishedText(record.polished_content || '')

    // 更新配置
    setConfig({
      style: record.style,
      language: record.language,
      provider: record.provider
    })
  }

  return (
    <div className="polish-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-home-btn" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回首页
          </button>
          <h1 className="page-title">📝 论文润色</h1>
        </div>
        <button className="history-btn" onClick={() => setIsHistoryOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          历史记录
        </button>
      </div>

      {!polishedText ? (
        <InputPanel
          text={originalText}
          onTextChange={setOriginalText}
          config={config}
          onConfigChange={setConfig}
          onPolish={handlePolish}
          isPolishing={isPolishing}
        />
      ) : (
        <ComparisonView
          originalText={originalText}
          polishedText={polishedText}
          onBack={handleClear}
        />
      )}

      <PolishHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectRecord={handleSelectRecord}
      />
    </div>
  )
}

export default PolishPage
