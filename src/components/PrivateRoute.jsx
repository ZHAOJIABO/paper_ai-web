import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>
          <div style={{ marginBottom: '10px', textAlign: 'center' }}>
            ⏳ 加载中...
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    // 未登录，重定向到登录页
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
