import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/Login/LoginPage.tsx'
import HomePage from '../pages/Home/HomePage.tsx';
import ProductMaintenancePage from '../pages/Products/ProductMaintenancePage';
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
    <Route
      path="/products"
      element={
        <ProtectedRoute>
          <ProductMaintenancePage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)

export default App
