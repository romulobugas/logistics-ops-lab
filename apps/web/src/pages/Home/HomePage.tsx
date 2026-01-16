import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authStorage } from '../../features/auth/authStorage'
import '../../styles/home.css'

const HomePage = () => {
  const [userName, setUserName] = useState('Usuário')
  const [userEmail, setUserEmail] = useState('')
  const [initials, setInitials] = useState('LO')
  const [roles, setRoles] = useState<string[]>([])

  useEffect(() => {
    const user = authStorage.getUser()
    if (!user) {
      return
    }

    const initialsValue = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    setInitials(initialsValue || 'LO')
    setUserName(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim())
    setUserEmail(user.email)
    setRoles(authStorage.getRoles())
  }, [])

  const handleLogout = () => {
    authStorage.clear()
    window.location.href = '/login'
  }

  return (
    <div className="home-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">🚚</div>
          <span>Logistics Ops Lab</span>
        </div>

        <nav className="menu-section">
          <h4>Visão Geral</h4>
          <Link className="menu-link active" to="/home">
            <span className="icon">📊</span> Dashboard
          </Link>
          <Link className="menu-link" to="/products">
            <span className="icon">📦</span> Manutenção de Produtos
          </Link>
          <a className="menu-link" href="#">
            <span className="icon">🔁</span> Movimentos
          </a>
          <a className="menu-link" href="#">
            <span className="icon">📉</span> Saldo de Estoque
          </a>
        </nav>

        <nav className="menu-section">
          <h4>Operação</h4>
          <a className="menu-link" href="#">
            <span className="icon">📝</span> Movimentação IN/OUT
          </a>
          <a className="menu-link" href="#">
            <span className="icon">🧾</span> Logs de Acesso
          </a>
          <a className="menu-link" href="#">
            <span className="icon">🧑‍💼</span> Usuários & Perfis
          </a>
          <a className="menu-link" href="#">
            <span className="icon">🔐</span> Permissões
          </a>
        </nav>

        <nav className="menu-section">
          <h4>Relatórios</h4>
          <a className="menu-link" href="#">
            <span className="icon">📈</span> Relatórios de Estoque
          </a>
          <a className="menu-link" href="#">
            <span className="icon">📋</span> Auditoria
          </a>
        </nav>

        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{userName}</strong>
            <small>{userEmail}</small>
          </div>
        </div>

        <button className="btn logout" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <main className="content">
        <div className="topbar">
          <div>
            <h2>Bem-vindo de volta 👋</h2>
            <p style={{ color: '#6b7280', marginTop: 4 }}>
              Operação pronta para iniciar.
            </p>
          </div>
          <div className="top-actions">
            <span className="badge">{roles.length ? roles.join(', ') : 'Autenticado'}</span>
            <button className="btn btn-outline" type="button">Atualizar dados</button>
            <button className="btn btn-primary" type="button">Novo SKU</button>
          </div>
        </div>

        <section className="grid">
          <div className="card">
            <h3>SKUs cadastrados</h3>
            <p>Cadastre e acompanhe códigos de produtos.</p>
          </div>
          <div className="card">
            <h3>Movimentos do dia</h3>
            <p>Entradas, saídas e ajustes de estoque.</p>
          </div>
          <div className="card">
            <h3>Saldo crítico</h3>
            <p>Itens abaixo do limite mínimo.</p>
          </div>
          <div className="card">
            <h3>Alertas operacionais</h3>
            <p>Notificações e pendências.</p>
          </div>
        </section>

        <section className="section">
          <header>
            <div>
              <h3>Atalhos operacionais</h3>
              <p style={{ color: '#6b7280', marginTop: 6 }}>
                Acesso rápido para rotas da API e operações principais.
              </p>
            </div>
            <span className="badge">Role: {roles.join(', ') || 'USER'}</span>
          </header>
          <div className="quick-links">
            <a href="/api/docs" target="_blank" rel="noreferrer">📚 Swagger / Docs da API</a>
            <a href="/api/health" target="_blank" rel="noreferrer">❤️ Health Check</a>
            <a href="/api/skus" target="_blank" rel="noreferrer">📦 POST /skus</a>
            <a href="/api/stock/in" target="_blank" rel="noreferrer">⬆️ POST /stock/in</a>
            <a href="/api/stock/out" target="_blank" rel="noreferrer">⬇️ POST /stock/out</a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
