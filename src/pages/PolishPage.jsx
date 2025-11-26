import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputPanel from '../components/InputPanel'
import ComparisonView from '../components/ComparisonView'
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

      if (result.success) {
        setPolishedText(result.polishedText)
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

  return (
    <div className="polish-page">
      <div className="page-header">
        <button className="back-home-btn" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回首页
        </button>
        <h1 className="page-title">📝 论文润色</h1>
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
    </div>
  )
}

export default PolishPage
