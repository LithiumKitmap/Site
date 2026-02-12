
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const GooglePayCheckout = () => {
  const { t } = useLanguage();
  const { cartItems, clearCart } = useCart();
  const { currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
      
      // Email Google Pay
      const googlePayEmail = 'narrowlebg@gmail.com';
      const itemsDescription = cartItems.map(item => item.productName).join(', ');
      
      // Sauvegarder les items du panier dans le localStorage pour les récupérer après le retour de Google Pay
      localStorage.setItem('pendingGooglePayOrder', JSON.stringify({
        cartItems,
        userId: currentUser.id,
        timestamp: Date.now()
      }));
      
      // Construire l'URL Google Pay
      const returnUrl = `${window.location.origin}/payment-success?method=googlepay`;
      const cancelUrl = `${window.location.origin}/checkout`;
      
      // Rediriger vers Google Pay (via Google Pay Send Money)
      const googlePayUrl = `https://pay.google.com/gp/w/u/0/home/sendcash?amount=${total.toFixed(2)}&currency=USD&recipient=${encodeURIComponent(googlePayEmail)}`;
      
      // Rediriger vers Google Pay
      window.location.href = googlePayUrl;
      
    } catch (error) {
      console.error('Google Pay payment error:', error);
      toast({
        title: t('purchaseFailed'),
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-black hover:bg-gray-900 text-white font-bold py-6 shadow-lg transition-all border border-gray-700"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
          </svg>
          {t('payWithGoogle')}
        </span>
      )}
    </Button>
  );
};

export default GooglePayCheckout;
