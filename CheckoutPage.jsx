
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import PayPalCheckout from '@/components/PayPalCheckout';
import GooglePayCheckout from '@/components/GooglePayCheckout';

const CheckoutPage = () => {
  const { cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 flex items-center justify-center">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <Lock className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('loginToPurchase')}</h2>
          <p className="text-gray-400 mb-6">{t('loginToPurchaseDesc')}</p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <Link to="/login">{t('login')}</Link>
            </Button>
            <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
              <Link to="/signup">{t('signup')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 flex items-center justify-center">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('emptyCart')}</h2>
          <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold mt-4">
            <Link to="/plugins">{t('browseProducts')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${t('checkout')} - GoldenShop`}</title>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <ShoppingBag className="text-cyan-400" />
            {t('checkout')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-fit">
              <h2 className="text-xl font-bold text-white mb-6">{t('orderSummary')}</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{item.productName}</span>
                    <span className="text-white font-medium">${item.price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>{t('subtotal')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{t('tax')}</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2">
                  <span>{t('total')}</span>
                  <span className="text-cyan-400">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">{t('paymentMethod')}</h2>
              
              <div className="space-y-4">
                <PayPalCheckout />
                <GooglePayCheckout />
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                {t('securityDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
