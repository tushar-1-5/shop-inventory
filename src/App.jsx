import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import ToastContainer from './components/ui/Toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import CategoriesPage from './pages/CategoriesPage';
import ActivityLogPage from './pages/ActivityLogPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/new" element={<ProductFormPage />} />
                      <Route path="/products/:id/edit" element={<ProductFormPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/activity" element={<ActivityLogPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
