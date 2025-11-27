import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const { register, login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nickname: '',
    password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // 如果已登录，跳转到首页
  if (isAuthenticated) {
    navigate('/')
    return null
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // 清除该字段的错误
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // 验证用户名
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (!/^[a-zA-Z0-9_]{3,50}$/.test(formData.username)) {
      newErrors.username = '用户名为3-50位，只能包含字母、数字、下划线'
    }

    // 验证邮箱
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    // 验证密码
    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 8) {
      newErrors.password = '密码至少8位'
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密码必须包含字母和数字'
    }

    // 验证确认密码
    if (!formData.confirm_password) {
      newErrors.confirm_password = '请确认密码'
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = '两次输入的密码不一致'
    }

    // 验证昵称（可选）
    if (formData.nickname && formData.nickname.length > 50) {
      newErrors.nickname = '昵称最多50位'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // 注册
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        nickname: formData.nickname || undefined
      })

      // 注册成功后自动登录
      await login({
        username: formData.username,
        password: formData.password
      })

      navigate('/')
    } catch (err) {
      setErrors({
        submit: err.message || '注册失败，请稍后重试'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>创建账号</h1>
          <p>加入 AI 学术助手，开启智能科研之旅</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 13c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="currentColor"/>
                <path d="M7 4h2v5H7zm0 6h2v2H7z" fill="currentColor"/>
              </svg>
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">用户名 *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="3-50位，只能包含字母、数字、下划线"
              disabled={loading}
              autoComplete="username"
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">邮箱 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱地址"
              disabled={loading}
              autoComplete="email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nickname">昵称（可选）</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="您的显示名称"
              disabled={loading}
              autoComplete="nickname"
              className={errors.nickname ? 'error' : ''}
            />
            {errors.nickname && <span className="field-error">{errors.nickname}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">密码 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="至少8位，包含字母和数字"
              disabled={loading}
              autoComplete="new-password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">确认密码 *</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="请再次输入密码"
              disabled={loading}
              autoComplete="new-password"
              className={errors.confirm_password ? 'error' : ''}
            />
            {errors.confirm_password && <span className="field-error">{errors.confirm_password}</span>}
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            已有账号？ <Link to="/login">立即登录</Link>
          </p>
          <p>
            <Link to="/">返回首页</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
