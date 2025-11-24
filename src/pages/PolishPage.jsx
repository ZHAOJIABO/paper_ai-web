import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputPanel from '../components/InputPanel'
import ComparisonView from '../components/ComparisonView'
import './PolishPage.css'

function PolishPage() {
  const navigate = useNavigate()
  const [originalText, setOriginalText] = useState('')
  const [polishedText, setPolishedText] = useState('')
  const [config, setConfig] = useState({
    style: 'academic',
    language: 'zh-CN',
    provider: 'openai'
  })
  const [isPolishing, setIsPolishing] = useState(false)

  const handlePolish = async () => {
    if (!originalText.trim()) {
      alert('请输入需要润色的文本')
      return
    }

    setIsPolishing(true)

    // 模拟API调用
    setTimeout(() => {
      setPolishedText(`【润色后的文本】\n\n${originalText}\n\n（这是模拟输出，实际使用时请接入真实的AI API）`)
      setIsPolishing(false)
    }, 2000)
  }

  const handleClear = () => {
    setOriginalText('')
    setPolishedText('')
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
