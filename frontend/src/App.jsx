import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import FundSearch from './components/FundSearch'
import FundDetail from './components/FundDetail'
import MyFunds from './components/MyFunds'
import Login from './components/Login'
import Register from './components/Register'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MyFundsProvider } from './context/MyFundsContext'
import { dataSourceService } from './services/fundService'
import './App.css'

function App() {
  const [currentSource, setCurrentSource] = useState('mock')
  const [availableSources, setAvailableSources] = useState([])
  const [backendConnected, setBackendConnected] = useState(false)

  useEffect(() => {
    loadDataSourceInfo()
    checkBackendConnection()
  }, [])

  const checkBackendConnection = async () => {
    try {
      await dataSourceService.getCurrentSource()
      setBackendConnected(true)
    } catch (error) {
      console.error('无法连接到后端:', error)
      setBackendConnected(false)
    }
  }

  const loadDataSourceInfo = async () => {
    try {
      const [sources, current] = await Promise.all([
        dataSourceService.getAvailableSources(),
        dataSourceService.getCurrentSource()
      ])
      const sourceNames = Object.keys(sources)
      setAvailableSources(sourceNames)
      setCurrentSource(current.current_source)
      console.log('Available sources:', sourceNames)
      console.log('Current source:', current.current_source)
    } catch (error) {
      console.error('获取数据源信息失败:', error)
    }
  }

  const handleSourceChange = async (sourceName) => {
    try {
      await dataSourceService.setDataSource(sourceName)
      setCurrentSource(sourceName)
      alert(`已切换到 ${sourceName} 数据源`)
    } catch (error) {
      console.error('切换数据源失败:', error)
      alert('切换数据源失败')
    }
  }

  return (
    <AppContent
      currentSource={currentSource}
      availableSources={availableSources}
      backendConnected={backendConnected}
      handleSourceChange={handleSourceChange}
    />
  )}

function AppContent({ currentSource, availableSources, backendConnected, handleSourceChange }) {
  return (
    <AuthProvider>
      <MyFundsProvider>
        <AppContentWrapper
          currentSource={currentSource}
          availableSources={availableSources}
          backendConnected={backendConnected}
          handleSourceChange={handleSourceChange}
        />
      </MyFundsProvider>
    </AuthProvider>
  )
}

function AppContentWrapper({ currentSource, availableSources, backendConnected, handleSourceChange }) {
  const { currentUser, isAuthenticated, isLoading: authIsLoading, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="app">
      {authIsLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      ) : (
        <>
          <header className="app-header">
            <div className="header-content">
              <h1>基金管理系统</h1>
              <div className="header-nav">
                {isAuthenticated() ? (
                  <>
                    <Link to="/" className="nav-link">搜索基金</Link>
                    <Link to="/my-funds" className="nav-link">我的基金</Link>
                    <div className="user-menu">
                      <span className="user-name">欢迎, {currentUser.username}</span>
                      <div className="menu-toggle">
                        ⚙️
                      </div>
                      <div className="user-menu-dropdown">
                        <button onClick={handleLogout} className="menu-item">退出登录</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="nav-link">登录</Link>
                  </>
                )}
              </div>
              <div className="source-selector">
                <span>数据源:</span>
                {availableSources.length > 0 && (
                  <>
                    <select value={currentSource} onChange={(e) => handleSourceChange(e.target.value)}>
                      {availableSources.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                    <span className={`connection-status ${backendConnected ? 'connected' : 'disconnected'}`}>
                      {backendConnected ? '✓ 已连接' : '✗ 未连接'}
                    </span>
                  </>
                )}
                {availableSources.length === 0 && (
                  <span className="connection-status disconnected">加载中...</span>
                )}
              </div>
            </div>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<FundSearch />} />
              <Route path="/my-funds" element={
                isAuthenticated() ? <MyFunds /> : <Navigate to="/login" replace />
              } />
              <Route path="/fund/:fundCode" element={<FundDetail />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  )
}

export default App
