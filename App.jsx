
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import PluginsPage from '@/pages/PluginsPage';
import MapsPage from '@/pages/MapsPage';
import CommunityPage from '@/pages/CommunityPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import DashboardPage from '@/pages/DashboardPage';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/plugins" element={<PluginsPage />} />
                  <Route path="/maps" element={<MapsPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route 
                    path="/cart" 
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/payment-success" 
                    element={
                      <ProtectedRoute>
                        <PaymentSuccessPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute adminOnly>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
