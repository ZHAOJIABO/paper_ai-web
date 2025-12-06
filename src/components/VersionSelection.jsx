import React from 'react';
import './VersionSelection.css';

/**
 * 版本选择组件
 * 在多版本润色完成后，让用户选择一个版本进入详细对比
 */
const VersionSelection = ({ versions, originalContent, originalLength, onSelectVersion, isSelecting = false }) => {
  // 版本配置
  const versionConfig = {
    conservative: {
      name: '保守版本',
      description: '轻微润色，保持原意',
      color: '#4CAF50',
      icon: '🔒',
      theme: 'green'
    },
    balanced: {
      name: '均衡版本',
      description: '适度优化，提升表达',
      color: '#2196F3',
      icon: '⚖️',
      theme: 'blue'
    },
    aggressive: {
      name: '激进版本',
      description: '大幅改写，提升质量',
      color: '#FF9800',
      icon: '🚀',
      theme: 'orange'
    }
  };

  const versionKeys = ['conservative', 'balanced', 'aggressive'];

  // 计算字数变化
  const getLengthChange = (versionLength) => {
    const change = versionLength - originalLength;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}`;
  };

  return (
    <div className="version-selection">
      <div className="selection-header">
        <h2>✨ 多版本润色完成</h2>
        <p className="selection-subtitle">请选择一个版本查看详细对比</p>
      </div>

      {/* 原文显示区域 */}
      {originalContent && (
        <div className="original-text-section">
          <div className="section-header">
            <h3>📄 原文</h3>
            <span className="text-length">{originalLength} 字</span>
          </div>
          <div className="original-text-content">
            <pre className="text-preview">{originalContent}</pre>
          </div>
        </div>
      )}

      <div className="version-cards">
        {versionKeys.map((versionKey) => {
          const config = versionConfig[versionKey];
          const versionData = versions[versionKey];

          // 检查版本是否成功生成
          const isSuccess = versionData && versionData.status === 'success';
          const isFailed = versionData && versionData.status === 'failed';

          return (
            <div
              key={versionKey}
              className={`version-card ${config.theme} ${!isSuccess ? 'disabled' : ''}`}
              style={{ '--card-color': config.color }}
            >
              <div className="card-header">
                <span className="card-icon">{config.icon}</span>
                <h3 className="card-title">{config.name}</h3>
              </div>

              <p className="card-description">{config.description}</p>

              {isSuccess ? (
                <>
                  {/* 字数统计 */}
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="stat-label">润色后字数</span>
                      <span className="stat-value">
                        {versionData.polished_length} 字
                        <span className={`stat-change ${versionData.polished_length > originalLength ? 'increase' : 'decrease'}`}>
                          ({getLengthChange(versionData.polished_length)})
                        </span>
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">处理时间</span>
                      <span className="stat-value">
                        {(versionData.process_time_ms / 1000).toFixed(2)}s
                      </span>
                    </div>
                  </div>

                  {/* 内容预览 */}
                  <div className="card-preview">
                    <h4 className="preview-title">内容预览</h4>
                    <p className="preview-text">
                      {versionData.polished_content.substring(0, 150)}
                      {versionData.polished_content.length > 150 ? '...' : ''}
                    </p>
                  </div>

                  {/* 改进建议 */}
                  {versionData.suggestions && versionData.suggestions.length > 0 && (
                    <div className="card-suggestions">
                      <h4 className="suggestions-title">💡 改进重点</h4>
                      <ul className="suggestions-list">
                        {versionData.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 选择按钮 */}
                  <button
                    className="select-button"
                    onClick={() => onSelectVersion(versionKey)}
                    disabled={isSelecting}
                  >
                    {isSelecting ? '正在选择...' : '查看详细对比'}
                  </button>
                </>
              ) : isFailed ? (
                <div className="card-error">
                  <span className="error-icon">⚠️</span>
                  <p className="error-message">此版本生成失败</p>
                  {versionData.error_message && (
                    <p className="error-details">{versionData.error_message}</p>
                  )}
                </div>
              ) : (
                <div className="card-loading">
                  <span className="loading-spinner"></span>
                  <p>生成中...</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="selection-footer">
        <p className="footer-tip">
          提示：每个版本都有不同的润色强度，您可以根据需要选择最合适的版本
        </p>
      </div>
    </div>
  );
};

export default VersionSelection;
