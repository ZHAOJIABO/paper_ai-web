import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import './App.css'
import Home from './pages/Home'
import PolishPage from './pages/PolishPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ComingSoon from './pages/ComingSoon'

function UserMenu() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !user) {
    return (
      <div className="auth-buttons">
        <Link to="/login" className="auth-button login-btn">
          登录
        </Link>
        <Link to="/register" className="auth-button register-btn">
          注册
        </Link>
      </div>
    )
  }

  return (
    <div className="user-menu">
      <button className="user-button" onClick={() => navigate('/profile')}>
        <div className="user-avatar">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} />
          ) : (
            <span className="user-avatar-placeholder">
              {user.nickname ? user.nickname[0].toUpperCase() : user.username[0].toUpperCase()}
            </span>
          )}
        </div>
        <span className="user-name">{user.nickname || user.username}</span>
      </button>
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isProfilePage = location.pathname === '/profile'

  return (
    <div className="app">
      {!isAuthPage && !isProfilePage && (
        <header className="header">
          <div className="header-content">
            <div className="header-top">
              <Link to="/" className="brand-link">
                <h1 className="title">
                  <span className="title-icon">✨</span>
                  AI 学术助手
                </h1>
              </Link>
              <UserMenu />
            </div>
            <p className="subtitle">为科研工作者提供全流程智能支持 · 让学术研究更高效</p>
            {isHomePage && (
              <div className="feature-tags">
                <span className="feature-tag">🎓 学术专业</span>
                <span className="feature-tag">⚡ 快速高效</span>
                <span className="feature-tag">🌍 多语言支持</span>
                <span className="feature-tag">🔒 安全可靠</span>
              </div>
            )}
          </div>
        </header>
      )}

      <main className="main-content">
        <div className={isAuthPage || isProfilePage ? '' : 'container'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/polish"
              element={
                <PrivateRoute>
                  <PolishPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/translate"
              element={<ComingSoon icon="🌐" title="学术翻译" description="中英文互译功能正在开发中，将支持专业术语保留和学术风格翻译" />}
            />
            <Route
              path="/search"
              element={<ComingSoon icon="🔍" title="文献搜索" description="文献搜索和AI总结功能正在开发中，将帮助您快速找到相关研究" />}
            />
            <Route
              path="/proposal"
              element={<ComingSoon icon="📋" title="项目申请书" description="项目申请书撰写辅助功能正在开发中，将支持多种项目类型" />}
            />
            <Route
              path="/review"
              element={<ComingSoon icon="🎓" title="论文审稿" description="论文审稿意见生成功能正在开发中，将提供全面的审稿建议" />}
            />
            <Route
              path="/response"
              element={<ComingSoon icon="💬" title="审稿回复" description="审稿意见回复撰写功能正在开发中，将帮助您专业回复审稿意见" />}
            />
          </Routes>
        </div>
      </main>

      {!isAuthPage && !isProfilePage && (
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#" className="footer-link">📚 使用指南</a>
              <a href="#" className="footer-link">💡 常见问题</a>
              <a href="mailto:624345999@qq.com" className="footer-link">📧 联系我们</a>
              <a href="#" className="footer-link">🔐 隐私政策</a>
            </div>
            <p>基于先进的AI技术，为您的学术研究提供全流程智能支持</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
              © 2024 AI学术助手 · 作者 bobo · 联系方式：624345999@qq.com
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
