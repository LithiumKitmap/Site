
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const PayPalCheckout = () => {
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
      
      // Créer l'URL de paiement PayPal
      const paypalEmail = 'narrowlebg2@gmail.com';
      const itemsDescription = cartItems.map(item => item.productName).join(', ');
      
      // Sauvegarder les items du panier dans le localStorage pour les récupérer après le retour de PayPal
      localStorage.setItem('pendingPayPalOrder', JSON.stringify({
        cartItems,
        userId: currentUser.id,
        timestamp: Date.now()
      }));
      
      // Construire l'URL PayPal avec les paramètres
      const returnUrl = `${window.location.origin}/payment-success?method=paypal`;
      const cancelUrl = `${window.location.origin}/checkout`;
      
      const paypalUrl = `https://www.paypal.com/paypalme/${paypalEmail}/${total.toFixed(2)}USD`;
      
      // Rediriger vers PayPal
      window.location.href = paypalUrl;
      
    } catch (error) {
      console.error('PayPal payment error:', error);
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
      className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold py-6 shadow-lg transition-all"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.438-3.106 7.51-7.21 7.51h-1.24c-.49 0-.837.33-.96.76l-1.256 5.932a.64.64 0 0 0 .658.601z" />
          </svg>
          {t('payWithPaypal')}
        </span>
      )}
    </Button>
  );
};

export default PayPalCheckout;
