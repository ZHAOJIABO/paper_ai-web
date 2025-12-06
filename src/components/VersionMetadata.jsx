import React from 'react';
import './VersionMetadata.css';

/**
 * 版本元数据组件
 * 显示每个版本的统计信息和修改建议
 */
const VersionMetadata = ({ versionData, originalLength }) => {
  if (!versionData || versionData.status === 'failed') {
    return (
      <div className="version-metadata error">
        <div className="metadata-error">
          <span className="error-icon">⚠️</span>
          <span>此版本生成失败</span>
          {versionData?.error_message && (
            <p className="error-details">{versionData.error_message}</p>
          )}
        </div>
      </div>
    );
  }

  const {
    polished_length,
    suggestions = [],
    process_time_ms,
    model_used
  } = versionData;

  // 计算变化
  const lengthChange = polished_length - originalLength;
  const lengthChangePercent = originalLength > 0
    ? ((lengthChange / originalLength) * 100).toFixed(1)
    : 0;

  return (
    <div className="version-metadata">
      {/* 统计信息卡片 */}
      <div className="metadata-stats">
        <div className="stat-card">
          <div className="stat-label">原文字数</div>
          <div className="stat-value">{originalLength}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">润色后</div>
          <div className="stat-value">{polished_length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">字数变化</div>
          <div className={`stat-value ${lengthChange > 0 ? 'increase' : lengthChange < 0 ? 'decrease' : 'neutral'}`}>
            {lengthChange > 0 ? '+' : ''}{lengthChange}
            <span className="stat-percent">({lengthChangePercent > 0 ? '+' : ''}{lengthChangePercent}%)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">处理时间</div>
          <div className="stat-value">{(process_time_ms / 1000).toFixed(2)}s</div>
        </div>
      </div>

      {/* 修改建议 */}
      {suggestions && suggestions.length > 0 && (
        <div className="metadata-suggestions">
          <div className="suggestions-header">
            <span className="suggestions-icon">💡</span>
            <span className="suggestions-title">修改说明</span>
          </div>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <span className="suggestion-bullet">•</span>
                <span className="suggestion-text">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 模型信息 */}
      {model_used && (
        <div className="metadata-model">
          <span className="model-label">使用模型：</span>
          <span className="model-value">{model_used}</span>
        </div>
      )}
    </div>
  );
};

export default VersionMetadata;