const API_BASE = '/api'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  user: {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
  }
  token: string
  roles: string[]
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Erro de autenticação' }))
    throw new Error(data.message || 'Erro de autenticação')
  }

  return response.json()
}
