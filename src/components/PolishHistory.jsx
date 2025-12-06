import { useState, useEffect } from 'react'
import { getPolishRecords } from '../services/api'
import './PolishHistory.css'

function PolishHistory({ isOpen, onClose, onSelectRecord }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0
  })
  const [filters, setFilters] = useState({
    language: '',
    style: '',
    status: 'success' // 默认只显示成功的记录
  })

  useEffect(() => {
    if (isOpen) {
      loadRecords()
    }
  }, [isOpen, pagination.page, filters])

  const loadRecords = async () => {
    setLoading(true)
    setError('')

    try {
      const params = {
        page: pagination.page,
        page_size: pagination.page_size,
        exclude_text: false, // 需要显示文本内容
        ...filters
      }

      // 移除空值
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      const result = await getPolishRecords(params)

      // 后端返回的字段是 PascalCase，需要转换为前端使用的格式
      const normalizedRecords = (result.data.records || []).map(record => ({
        id: record.ID,
        user_id: record.UserID,
        trace_id: record.TraceID,
        original_content: record.OriginalContent,
        polished_content: record.PolishedContent,
        final_content: record.FinalContent, // 添加 final_content 字段
        style: record.Style,
        language: record.Language,
        provider: record.Provider,
        model: record.Model,
        status: record.Status,
        error_message: record.ErrorMessage,
        process_time_ms: record.ProcessTimeMs,
        created_at: record.CreatedAt
      }))

      setRecords(normalizedRecords)
      setPagination(prev => ({
        ...prev,
        total: result.data.total || 0
      }))
    } catch (err) {
      setError(err.message || '获取历史记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // 重置到第一页
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    return status === 'success' ? (
      <span className="status-badge success">成功</span>
    ) : (
      <span className="status-badge failed">失败</span>
    )
  }

  const getStyleLabel = (style) => {
    const labels = {
      academic: '学术',
      formal: '正式',
      concise: '简洁'
    }
    return labels[style] || style
  }

  const getLanguageLabel = (lang) => {
    return lang === 'zh' ? '中文' : lang === 'en' ? '英文' : lang
  }

  const totalPages = Math.ceil(pagination.total / pagination.page_size)

  if (!isOpen) return null

  return (
    <div className="polish-history-overlay" onClick={onClose}>
      <div className="polish-history-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>润色历史</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="drawer-filters">
          <select
            value={filters.language}
            onChange={(e) => handleFilterChange('language', e.target.value)}
            className="filter-select"
          >
            <option value="">所有语言</option>
            <option value="zh">中文</option>
            <option value="en">英文</option>
          </select>

          <select
            value={filters.style}
            onChange={(e) => handleFilterChange('style', e.target.value)}
            className="filter-select"
          >
            <option value="">所有风格</option>
            <option value="academic">学术</option>
            <option value="formal">正式</option>
            <option value="concise">简洁</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">所有状态</option>
            <option value="success">成功</option>
            <option value="failed">失败</option>
          </select>
        </div>

        <div className="drawer-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>加载中...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-button" onClick={loadRecords}>
                重试
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 42c-9.9 0-18-8.1-18-18s8.1-18 18-18 18 8.1 18 18-8.1 18-18 18z" fill="#ccc"/>
                <path d="M32 20v16l12 6" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>暂无历史记录</p>
            </div>
          ) : (
            <>
              <div className="records-list">
                {records.map((record) => (
                  <div key={record.id} className="record-item">
                    <div className="record-header">
                      <div className="record-meta">
                        <span className="record-date">{formatDate(record.created_at)}</span>
                        <span className="record-language">{getLanguageLabel(record.language)}</span>
                        <span className="record-style">{getStyleLabel(record.style)}</span>
                        {getStatusBadge(record.status)}
                      </div>
                      <div className="record-info">
                        <span className="record-provider">{record.provider}</span>
                        <span className="record-time">{record.process_time_ms}ms</span>
                      </div>
                    </div>

                    {record.status === 'success' ? (
                      <>
                        <div className="record-content">
                          <div className="content-section">
                            <label>原文：</label>
                            <p className="content-text">
                              {record.original_content?.substring(0, 100)}
                              {record.original_content?.length > 100 && '...'}
                            </p>
                          </div>
                          <div className="content-section">
                            <label>润色后：</label>
                            <p className="content-text">
                              {record.polished_content?.substring(0, 100)}
                              {record.polished_content?.length > 100 && '...'}
                            </p>
                          </div>
                        </div>

                        <button
                          className="use-button"
                          onClick={() => {
                            onSelectRecord(record)
                            onClose()
                          }}
                        >
                          查看此记录
                        </button>
                      </>
                    ) : (
                      <div className="error-info">
                        <p>{record.error_message || '润色失败'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    上一页
                  </button>
                  <span className="page-info">
                    第 {pagination.page} / {totalPages} 页 （共 {pagination.total} 条）
                  </span>
                  <button
                    className="page-button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PolishHistory
