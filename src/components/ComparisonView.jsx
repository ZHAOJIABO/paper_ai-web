import { useState, useEffect } from 'react'
import { getComparisonDetails, applyChangeAction, applyBatchAction } from '../services/api'
import './ComparisonView.css'

function ComparisonView({ originalText, polishedText, traceId, onBack }) {
  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedChange, setSelectedChange] = useState(null)
  const [currentContent, setCurrentContent] = useState(polishedText)

  useEffect(() => {
    if (traceId) {
      loadComparisonData()
    } else {
      setLoading(false)
    }
  }, [traceId])

  const loadComparisonData = async () => {
    try {
      setLoading(true)
      const result = await getComparisonDetails(traceId)
      if (result.success && result.data) {
        setComparisonData(result.data)
        setCurrentContent(result.data.polished_content)
      } else {
        setError('无法加载对比数据')
      }
    } catch (err) {
      console.error('加载对比数据失败:', err)
      setError(err.message || '加载对比数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeClick = (changeId) => {
    if (!comparisonData) return
    const change = comparisonData.annotations.find(c => c.id === changeId)
    setSelectedChange(change)
  }

  const handleAcceptChange = async (changeId) => {
    try {
      const result = await applyChangeAction(traceId, {
        change_id: changeId,
        action: 'accept'
      })

      if (result.success && result.data) {
        setCurrentContent(result.data.updated_content)
        // 更新本地状态
        updateChangeStatus(changeId, 'accepted')
      }
    } catch (err) {
      console.error('接受修改失败:', err)
      alert(err.message || '接受修改失败')
    }
  }

  const handleRejectChange = async (changeId) => {
    try {
      const result = await applyChangeAction(traceId, {
        change_id: changeId,
        action: 'reject'
      })

      if (result.success && result.data) {
        setCurrentContent(result.data.updated_content)
        updateChangeStatus(changeId, 'rejected')
      }
    } catch (err) {
      console.error('拒绝修改失败:', err)
      alert(err.message || '拒绝修改失败')
    }
  }

  const handleAcceptAll = async () => {
    try {
      const result = await applyBatchAction(traceId, {
        action: 'accept_all'
      })

      if (result.success && result.data) {
        setCurrentContent(result.data.updated_content)
        // 更新所有修改状态
        setComparisonData(prev => ({
          ...prev,
          annotations: prev.annotations.map(ann => ({
            ...ann,
            status: 'accepted'
          }))
        }))
        alert(`成功应用 ${result.data.applied_count} 处修改`)
      }
    } catch (err) {
      console.error('全部接受失败:', err)
      alert(err.message || '全部接受失败')
    }
  }

  const updateChangeStatus = (changeId, status) => {
    setComparisonData(prev => ({
      ...prev,
      annotations: prev.annotations.map(ann =>
        ann.id === changeId ? { ...ann, status } : ann
      )
    }))

    // 如果当前选中的就是这个修改,更新选中状态
    if (selectedChange && selectedChange.id === changeId) {
      setSelectedChange(prev => ({ ...prev, status }))
    }
  }

  const highlightText = (content, annotations) => {
    if (!annotations || annotations.length === 0) {
      return <span>{content}</span>
    }

    const segments = []
    const sortedAnnotations = [...annotations].sort((a, b) =>
      a.polished_position.start - b.polished_position.start
    )

    let lastIndex = 0

    for (const change of sortedAnnotations) {
      const { start, end } = change.polished_position

      // 添加普通文本段
      if (lastIndex < start) {
        segments.push({
          text: content.substring(lastIndex, start),
          type: 'normal'
        })
      }

      // 添加高亮文本段
      segments.push({
        text: content.substring(start, end),
        changeId: change.id,
        color: change.highlight_color,
        type: change.type,
        status: change.status
      })

      lastIndex = end
    }

    // 添加剩余文本
    if (lastIndex < content.length) {
      segments.push({
        text: content.substring(lastIndex),
        type: 'normal'
      })
    }

    return (
      <>
        {segments.map((segment, index) =>
          segment.type === 'normal' ? (
            <span key={index}>{segment.text}</span>
          ) : (
            <span
              key={index}
              className={`highlight highlight-${segment.type} highlight-${segment.status}`}
              style={{ backgroundColor: segment.status === 'pending' ? segment.color : undefined }}
              onClick={() => handleChangeClick(segment.changeId)}
              title="点击查看详情"
            >
              {segment.text}
            </span>
          )
        )}
      </>
    )
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板')
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

  if (loading) {
    return (
      <div className="comparison-view">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>加载对比数据中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="comparison-view">
        <div className="error-state">
          <p>❌ {error}</p>
          <button className="retry-btn" onClick={loadComparisonData}>重试</button>
        </div>
      </div>
    )
  }

  // 如果没有traceId或对比数据，显示简单对比视图
  if (!traceId || !comparisonData) {
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
                <button className="action-btn" onClick={() => handleCopy(originalText)}>
                  📋 复制
                </button>
                <button className="action-btn" onClick={() => handleDownload(originalText, 'original.txt')}>
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
                <button className="action-btn primary" onClick={() => handleCopy(polishedText)}>
                  📋 复制
                </button>
                <button className="action-btn primary" onClick={() => handleDownload(polishedText, 'polished.txt')}>
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

  // 有对比数据的完整视图
  const pendingChanges = comparisonData.annotations.filter(a => a.status === 'pending')
  const acceptedChanges = comparisonData.annotations.filter(a => a.status === 'accepted')
  const rejectedChanges = comparisonData.annotations.filter(a => a.status === 'rejected')

  return (
    <div className="comparison-view enhanced">
      <div className="comparison-header">
        <button className="back-button" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回编辑
        </button>
        <div className="header-center">
          <h2 className="comparison-title">
            ✨ 智能对比
          </h2>
          <div className="stats-summary">
            <span className="stat-item">
              <span className="stat-label">修改总数:</span>
              <span className="stat-value">{comparisonData.metadata.total_changes}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">待处理:</span>
              <span className="stat-value pending">{pendingChanges.length}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">已接受:</span>
              <span className="stat-value accepted">{acceptedChanges.length}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">已拒绝:</span>
              <span className="stat-value rejected">{rejectedChanges.length}</span>
            </span>
          </div>
        </div>
        {pendingChanges.length > 0 && (
          <button className="accept-all-btn" onClick={handleAcceptAll}>
            ✓ 全部接受
          </button>
        )}
      </div>

      <div className="comparison-layout">
        <div className="text-panels">
          <div className="text-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <span className="title-icon">📄</span>
                原文
              </h3>
              <div className="panel-actions">
                <button className="action-btn" onClick={() => handleCopy(comparisonData.original_content)}>
                  📋 复制
                </button>
              </div>
            </div>
            <div className="text-content">
              <div className="text-display">{comparisonData.original_content}</div>
            </div>
          </div>

          <div className="text-panel polished">
            <div className="panel-header">
              <h3 className="panel-title">
                <span className="title-icon">✨</span>
                润色后（高亮显示修改）
              </h3>
              <div className="panel-actions">
                <button className="action-btn primary" onClick={() => handleCopy(currentContent)}>
                  📋 复制
                </button>
                <button className="action-btn primary" onClick={() => handleDownload(currentContent, 'polished.txt')}>
                  💾 下载
                </button>
              </div>
            </div>
            <div className="text-content">
              <div className="text-display highlighted">
                {highlightText(currentContent, comparisonData.annotations)}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-panel">
          <div className="panel-header">
            <h3 className="panel-title">修改详情</h3>
          </div>
          <div className="detail-content">
            {!selectedChange ? (
              <div className="empty-state">
                <p>👆 点击高亮文本查看修改详情</p>
                <div className="legend">
                  <h4>图例说明:</h4>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FFE082' }}></span>
                    <span>词汇优化</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#A5D6A7' }}></span>
                    <span>语法修正</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#90CAF9' }}></span>
                    <span>结构调整</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="change-detail">
                <div className="change-type-badge" data-type={selectedChange.type}>
                  {selectedChange.type === 'vocabulary' && '📝 词汇'}
                  {selectedChange.type === 'grammar' && '✏️ 语法'}
                  {selectedChange.type === 'structure' && '🔧 结构'}
                </div>

                <div className="change-section">
                  <h4>原文</h4>
                  <div className="text-box original">{selectedChange.original_text}</div>
                </div>

                <div className="change-section">
                  <h4>修改后</h4>
                  <div className="text-box polished">{selectedChange.polished_text}</div>
                </div>

                <div className="change-section">
                  <h4>修改理由</h4>
                  <p className="reason-text">{selectedChange.reason}</p>
                </div>

                <div className="change-meta">
                  <div className="meta-item">
                    <span className="meta-label">置信度:</span>
                    <span className="meta-value">{(selectedChange.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">影响:</span>
                    <span className="meta-value">{selectedChange.impact}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">状态:</span>
                    <span className={`status-badge ${selectedChange.status}`}>
                      {selectedChange.status === 'pending' && '⏳ 待处理'}
                      {selectedChange.status === 'accepted' && '✅ 已接受'}
                      {selectedChange.status === 'rejected' && '❌ 已拒绝'}
                    </span>
                  </div>
                </div>

                {selectedChange.status === 'pending' && (
                  <div className="change-actions">
                    <button
                      className="action-btn accept"
                      onClick={() => handleAcceptChange(selectedChange.id)}
                    >
                      ✓ 接受修改
                    </button>
                    <button
                      className="action-btn reject"
                      onClick={() => handleRejectChange(selectedChange.id)}
                    >
                      ✗ 拒绝修改
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="comparison-footer">
        <div className="statistics-summary">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-title">词汇优化</div>
              <div className="stat-number">{comparisonData.statistics.vocabulary_changes}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✏️</div>
            <div className="stat-info">
              <div className="stat-title">语法修正</div>
              <div className="stat-number">{comparisonData.statistics.grammar_changes}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔧</div>
            <div className="stat-info">
              <div className="stat-title">结构调整</div>
              <div className="stat-number">{comparisonData.statistics.structure_changes}</div>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <div className="stat-title">学术评分提升</div>
              <div className="stat-number">+{comparisonData.metadata.academic_score_improvement.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonView
