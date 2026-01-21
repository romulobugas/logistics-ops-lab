import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/Login/LoginPage.tsx'
import HomePage from '../pages/Home/HomePage.tsx';
import ProductMaintenancePage from '../pages/Products/ProductMaintenancePage';
import ActiveActivitiesPage from '../pages/Stock/ActiveActivitiesPage';
import StockLocationsPage from '../pages/Stock/StockLocationsPage';
import StockMovementPage from '../pages/Stock/StockMovementPage';
import StockBalancePage from '../pages/Stock/StockBalancePage';
import TraceabilityPage from '../pages/Traceability.tsx';
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
    <Route
      path="/stock/active"
      element={
        <ProtectedRoute>
          <ActiveActivitiesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/stock/locations"
      element={
        <ProtectedRoute>
          <StockLocationsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/stock/movement"
      element={
        <ProtectedRoute>
          <StockMovementPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/stock/balance"
      element={
        <ProtectedRoute>
          <StockBalancePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/reports/traceability"
      element={
        <ProtectedRoute>
          <TraceabilityPage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)

export default App
