import { useNavigate } from 'react-router-dom'
import './ComingSoon.css'

function ComingSoon({ icon, title, description }) {
  const navigate = useNavigate()

  return (
    <div className="coming-soon-page">
      <div className="page-header">
        <button className="back-home-btn" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回首页
        </button>
        <h1 className="page-title">{icon} {title}</h1>
      </div>

      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚧</div>
        <h2 className="coming-soon-title">该功能正在苦苦加班中</h2>
        <p className="coming-soon-text">
          {description || '我们的工程师正在努力开发这个功能，敬请期待！'}
        </p>
        <div className="coming-soon-features">
          <div className="feature-item">
            <span className="feature-icon">⏰</span>
            <span className="feature-text">即将上线</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">精心打磨</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚀</span>
            <span className="feature-text">值得期待</span>
          </div>
        </div>
        <button className="back-button" onClick={() => navigate('/')}>
          返回首页探索其他功能
        </button>
      </div>
    </div>
  )
}

export default ComingSoon
