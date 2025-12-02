import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import './App.css'
import Home from './pages/Home'
import PolishPage from './pages/PolishPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

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
                  AI 论文润色
                </h1>
              </Link>
              <UserMenu />
            </div>
            <p className="subtitle">专业的学术写作润色工具</p>
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
            <p>基于先进的AI技术，为您的学术论文提供专业的润色服务</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
              © 2024 AI论文润色助手 · 作者 bobo · 联系方式：624345999@qq.com
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
