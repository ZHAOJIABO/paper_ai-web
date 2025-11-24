import { useState } from 'react'
import './ComparisonView.css'

function ComparisonView({ originalText, polishedText, onBack }) {
  const [copiedOriginal, setCopiedOriginal] = useState(false)
  const [copiedPolished, setCopiedPolished] = useState(false)

  const handleCopy = async (text, setters) => {
    try {
      await navigator.clipboard.writeText(text)
      setters(true)
      setTimeout(() => setters(false), 2000)
    } catch (err) {
      alert('复制失败，请手动复制')
    }
  }

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <button className="back-button" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回编辑
        </button>
        <h2 className="comparison-title">
          ✨ 对比结果
          <span className="success-badge">✓ 润色完成</span>
        </h2>
      </div>

      <div className="comparison-grid">
        <div className="text-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <span className="title-icon">📄</span>
              原文
            </h3>
            <div className="panel-actions">
              <button
                className="action-btn"
                onClick={() => handleCopy(originalText, setCopiedOriginal)}
              >
                {copiedOriginal ? '✓ 已复制' : '📋 复制'}
              </button>
              <button
                className="action-btn"
                onClick={() => handleDownload(originalText, 'original.txt')}
              >
                💾 下载
              </button>
            </div>
          </div>
          <div className="text-content">
            <pre className="text-display">{originalText}</pre>
          </div>
        </div>

        <div className="text-panel polished">
          <div className="panel-header">
            <h3 className="panel-title">
              <span className="title-icon">✨</span>
              润色后
            </h3>
            <div className="panel-actions">
              <button
                className="action-btn primary"
                onClick={() => handleCopy(polishedText, setCopiedPolished)}
              >
                {copiedPolished ? '✓ 已复制' : '📋 复制'}
              </button>
              <button
                className="action-btn primary"
                onClick={() => handleDownload(polishedText, 'polished.txt')}
              >
                💾 下载
              </button>
            </div>
          </div>
          <div className="text-content">
            <pre className="text-display">{polishedText}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonView
