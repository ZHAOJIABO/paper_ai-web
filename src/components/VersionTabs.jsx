import React from 'react';
import './VersionTabs.css';

/**
 * 版本标签页组件
 * 用于切换显示不同强度的润色版本
 */
const VersionTabs = ({
  versions = {},
  activeVersion,
  onVersionChange,
  loading = false,
  error = null
}) => {
  // 如果 versions 为 null 或 undefined，使用空对象
  const safeVersions = versions || {};

  // 版本配置
  const versionConfig = {
    conservative: {
      label: '保守版本',
      description: '仅修正明显错误',
      icon: '🔒',
      color: '#4CAF50'
    },
    balanced: {
      label: '平衡版本',
      description: '适度优化',
      icon: '⚖️',
      color: '#2196F3'
    },
    aggressive: {
      label: '激进版本',
      description: '大幅提升学术性',
      icon: '🚀',
      color: '#FF9800'
    }
  };

  const versionKeys = ['conservative', 'balanced', 'aggressive'];

  return (
    <div className="version-tabs-container">
      <div className="version-tabs">
        {versionKeys.map((versionKey) => {
          const config = versionConfig[versionKey];
          const versionData = safeVersions[versionKey];
          const isActive = activeVersion === versionKey;
          const hasError = versionData?.status === 'failed';
          const isLoading = loading && !versionData;

          return (
            <button
              key={versionKey}
              className={`version-tab ${isActive ? 'active' : ''} ${hasError ? 'error' : ''} ${isLoading ? 'loading' : ''}`}
              onClick={() => !hasError && !isLoading && onVersionChange(versionKey)}
              disabled={hasError || isLoading}
              style={{
                '--tab-color': config.color
              }}
            >
              <div className="tab-header">
                <span className="tab-icon">{config.icon}</span>
                <span className="tab-label">{config.label}</span>
              </div>
              <div className="tab-description">
                {isLoading ? (
                  <span className="loading-text">生成中...</span>
                ) : hasError ? (
                  <span className="error-text">生成失败</span>
                ) : (
                  config.description
                )}
              </div>
              {versionData && !hasError && (
                <div className="tab-stats">
                  <span className="stat-item">
                    {versionData.polished_length}字
                  </span>
                  <span className="stat-item">
                    {(versionData.process_time_ms / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 版本加载进度条 */}
      {loading && (
        <div className="version-loading-bar">
          <div className="loading-progress">
            <div className="progress-item">
              <span>保守版本</span>
              <div className="progress-bar">
                <div className={`progress-fill ${safeVersions.conservative ? 'complete' : 'active'}`}></div>
              </div>
            </div>
            <div className="progress-item">
              <span>平衡版本</span>
              <div className="progress-bar">
                <div className={`progress-fill ${safeVersions.balanced ? 'complete' : safeVersions.conservative ? 'active' : ''}`}></div>
              </div>
            </div>
            <div className="progress-item">
              <span>激进版本</span>
              <div className="progress-bar">
                <div className={`progress-fill ${safeVersions.aggressive ? 'complete' : safeVersions.balanced ? 'active' : ''}`}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="version-error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VersionTabs;