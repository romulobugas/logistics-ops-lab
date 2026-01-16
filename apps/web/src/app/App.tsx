import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/Login/LoginPage.tsx'
import HomePage from '../pages/Home/HomePage.tsx'
import ProtectedRoute from './ProtectedRoute.tsx'

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)

export default App
