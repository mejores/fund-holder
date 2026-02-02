import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import SuccessNotification from './SuccessNotification'
import './Register.css'

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('请填写用户名和密码')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await register(username, password)
      setShowSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="register-container">
        <div className="register-box">
          <h1 className="register-title">注册账号</h1>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="error-message">{error}</div>
            )}
            <button type="submit" className="register-button" disabled={isLoading}>
              {isLoading ? '注册中...' : '注册'}
            </button>
          </form>
          <div className="login-link">
            已有账号？<a href="/login">立即登录</a>
          </div>
        </div>
      </div>

      <SuccessNotification
        message="注册成功！即将跳转到登录页面..."
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </>
  )
}

export default Register
