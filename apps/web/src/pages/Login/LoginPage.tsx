import { useState } from 'react'
import { login } from '../../features/auth/authApi'
import { authStorage } from '../../features/auth/authStorage'
import '../../styles/login.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const data = await login({ email, password })
      authStorage.setUser(data.user)
      authStorage.setToken(data.token)
      authStorage.setRoles(data.roles)
      setStatus('success')
      setMessage('Login realizado com sucesso! Redirecionando...')
      setTimeout(() => {
        window.location.href = '/home'
      }, 1000)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Erro ao autenticar')
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span>🚚 Logistics Ops Lab</span>
        </div>
        <p className="login-subtitle">Plataforma de Operações Logísticas</p>

        {message && (
          <div className={`login-alert ${status}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>E-mail</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="login-field">
            <label>Senha</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <button className="login-btn" type="submit" disabled={status === 'loading'}>
            Entrar
          </button>
          {status === 'loading' && <div className="login-loading">Autenticando...</div>}
        </form>

        <div className="login-demo">
          <strong>Usuários de Demonstração</strong>
          <p>Administrador: teste@logistics.com / teste@123</p>
          <p>Usuário Comum: user@logistics.com / user123</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
