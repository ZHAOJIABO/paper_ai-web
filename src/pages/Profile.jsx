import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await logout()
      navigate('/login')
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  if (!user) {
    return null
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
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
    const badges = {
      active: { text: '正常', class: 'status-active' },
      inactive: { text: '未激活', class: 'status-inactive' },
      banned: { text: '已封禁', class: 'status-banned' }
    }
    return badges[status] || badges.inactive
  }

  const statusBadge = getStatusBadge(user.status)

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回首页
          </button>
          <h1>个人中心</h1>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="avatar-section">
              <div className="avatar">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} />
                ) : (
                  <span className="avatar-placeholder">
                    {user.nickname ? user.nickname[0].toUpperCase() : user.username[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="user-basic-info">
                <h2>{user.nickname || user.username}</h2>
                <span className={`status-badge ${statusBadge.class}`}>
                  {statusBadge.text}
                </span>
              </div>
            </div>

            <div className="info-section">
              <div className="info-item">
                <span className="info-label">用户名</span>
                <span className="info-value">{user.username}</span>
              </div>

              <div className="info-item">
                <span className="info-label">邮箱</span>
                <span className="info-value">
                  {user.email}
                  {user.email_verified ? (
                    <span className="verified-badge">已验证</span>
                  ) : (
                    <span className="unverified-badge">未验证</span>
                  )}
                </span>
              </div>

              {user.nickname && (
                <div className="info-item">
                  <span className="info-label">昵称</span>
                  <span className="info-value">{user.nickname}</span>
                </div>
              )}

              <div className="info-item">
                <span className="info-label">用户ID</span>
                <span className="info-value">#{user.id}</span>
              </div>

              <div className="info-item">
                <span className="info-label">注册时间</span>
                <span className="info-value">{formatDate(user.created_at)}</span>
              </div>

              {user.last_login_at && (
                <div className="info-item">
                  <span className="info-label">最后登录</span>
                  <span className="info-value">{formatDate(user.last_login_at)}</span>
                </div>
              )}
            </div>

            <div className="actions-section">
              <button className="logout-button" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 14H3C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 11L14 8L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
