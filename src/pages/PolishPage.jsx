import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputPanel from '../components/InputPanel'
import ComparisonView from '../components/ComparisonView'
import PolishHistory from '../components/PolishHistory'
import VersionSelection from '../components/VersionSelection'
import { polishText, polishTextMultiVersion, selectVersion } from '../services/api'
import './PolishPage.css'

function PolishPage() {
  const navigate = useNavigate()
  const [originalText, setOriginalText] = useState('')
  const [polishedText, setPolishedText] = useState('')
  const [traceId, setTraceId] = useState(null)
  const [config, setConfig] = useState({
    style: 'academic',
    language: 'zh-CN',
    provider: 'doubao' // 默认使用豆包，但保持可选
  })
  const [isPolishing, setIsPolishing] = useState(false)
  const [error, setError] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // 多版本相关状态
  const [isMultiVersion, setIsMultiVersion] = useState(false)
  const [multiVersionData, setMultiVersionData] = useState(null)
  const [selectedVersion, setSelectedVersion] = useState(null) // 用户选择的版本
  const [currentStage, setCurrentStage] = useState('input') // 'input' | 'version-selection' | 'comparison'
  const [isReadOnly, setIsReadOnly] = useState(false) // 是否为只读模式（从历史记录加载）

  const handlePolish = async () => {
    if (!originalText.trim()) {
      alert('请输入需要润色的文本')
      return
    }

    setIsPolishing(true)
    setError('')

    try {
      // 根据模式选择调用单版本或多版本API
      if (isMultiVersion) {
        // 多版本模式
        const result = await polishTextMultiVersion({
          content: originalText,
          style: config.style,
          language: config.language,
          provider: config.provider
        })

        if (result.success && result.data) {
          setMultiVersionData(result.data)
          setTraceId(result.data.trace_id)

          // 确保 versions 对象存在
          if (result.data.versions) {
            // 多版本模式：跳转到版本选择页面
            setCurrentStage('version-selection')
            console.log('多版本润色成功, Trace ID:', result.data.trace_id)
            console.log('使用的提供商:', result.data.provider_used)
          } else {
            throw new Error('后端返回数据格式错误：缺少 versions 字段')
          }
        } else {
          throw new Error(result.message || '多版本润色失败')
        }
      } else {
        // 单版本模式
        const result = await polishText({
          content: originalText,
          style: config.style,
          language: config.language,
          provider: config.provider
        })

        // 新API响应格式: { success, data: { trace_id, polished_content, ... }, message, traceId(request_id) }
        if (result.success && result.data) {
          setPolishedText(result.data.polished_content)
          // 使用 data.trace_id 用于后续查询润色记录
          setTraceId(result.data.trace_id)
          // 单版本模式：直接跳转到对比页面
          setCurrentStage('comparison')
          console.log('润色成功, Trace ID:', result.data.trace_id)
          console.log('Request ID (用于日志追踪):', result.traceId)
          console.log('使用的提供商:', result.data.provider_used)
          console.log('使用的模型:', result.data.model_used)
        } else {
          throw new Error(result.message || '润色失败')
        }
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
    setTraceId(null)
    setError('')
    setMultiVersionData(null)
    setSelectedVersion(null)
    setCurrentStage('input')
    setIsReadOnly(false)
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleSelectRecord = (record) => {
    // 使用历史记录的内容
    setOriginalText(record.original_content || '')
    // 使用 final_content（用户最终确认的内容），如果没有则回退到 polished_content
    setPolishedText(record.final_content || record.polished_content || '')
    setTraceId(record.trace_id || null)

    // 更新配置
    setConfig({
      style: record.style,
      language: record.language,
      provider: record.provider
    })

    // 重置多版本状态
    setMultiVersionData(null)
    setIsMultiVersion(false)
    setSelectedVersion(null)
    setCurrentStage('comparison')
    setIsReadOnly(true) // 从历史记录加载，设置为只读模式
  }

  // 切换多版本模式
  const handleToggleMultiVersion = () => {
    setIsMultiVersion(!isMultiVersion)
  }

  // 处理版本选择
  const handleSelectVersion = async (versionKey) => {
    if (!multiVersionData || !multiVersionData.versions) return

    const versionData = multiVersionData.versions[versionKey]
    if (!versionData || versionData.status !== 'success') {
      alert(`该版本生成失败：${versionData?.error_message || '未知错误'}`)
      return
    }

    // 调用版本选择接口
    try {
      setIsPolishing(true)
      setError('')

      const result = await selectVersion(traceId, versionKey)

      if (result.success) {
        // 版本选择成功后，更新状态并跳转到对比页面
        setSelectedVersion(versionKey)
        setPolishedText(versionData.polished_content)
        setCurrentStage('comparison')
        console.log('版本选择成功:', result.data)
      } else {
        throw new Error(result.message || '选择版本失败')
      }
    } catch (err) {
      console.error('选择版本失败:', err)
      const errorMessage = err.message || '选择版本失败，请稍后重试'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsPolishing(false)
    }
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
        <div className="header-right">
          {currentStage === 'input' && (
            <button
              className={`multi-version-toggle ${isMultiVersion ? 'active' : ''}`}
              onClick={handleToggleMultiVersion}
              title={isMultiVersion ? '切换到单版本模式' : '切换到多版本模式'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {isMultiVersion ? '多版本模式' : '单版本模式'}
            </button>
          )}
          <button className="history-btn" onClick={() => setIsHistoryOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            历史记录
          </button>
        </div>
      </div>

      {currentStage === 'input' && (
        <InputPanel
          text={originalText}
          onTextChange={setOriginalText}
          config={config}
          onConfigChange={setConfig}
          onPolish={handlePolish}
          isPolishing={isPolishing}
        />
      )}

      {currentStage === 'version-selection' && (
        <VersionSelection
          versions={multiVersionData?.versions || {}}
          originalContent={multiVersionData?.original_content || originalText}
          originalLength={originalText.length}
          onSelectVersion={handleSelectVersion}
          isSelecting={isPolishing}
        />
      )}

      {currentStage === 'comparison' && (
        <ComparisonView
          originalText={originalText}
          polishedText={polishedText}
          traceId={traceId}
          onBack={handleClear}
          selectedVersion={selectedVersion}
          multiVersionData={isMultiVersion ? multiVersionData : null}
          originalLength={originalText.length}
          readOnly={isReadOnly}
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
