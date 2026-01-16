export type AuthUser = {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
}

export const authStorage = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  getUser: () => {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  },
  setUser: (user: AuthUser) => localStorage.setItem('user', JSON.stringify(user)),
  getRoles: () => {
    const raw = localStorage.getItem('roles')
    return raw ? (JSON.parse(raw) as string[]) : []
  },
  setRoles: (roles: string[]) => localStorage.setItem('roles', JSON.stringify(roles)),
  clear: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('roles')
  },
}
