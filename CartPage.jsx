
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Trash2, ShoppingBag, ArrowRight, Loader2, Download, Package, Wallet } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const CartPage = () => {
  const { cartItems, removeFromCart, loading: cartLoading } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [downloads, setDownloads] = useState([]);
  const [downloadsLoading, setDownloadsLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDownloads();
    }
  }, [isAuthenticated, currentUser]);

  const fetchDownloads = async () => {
    setDownloadsLoading(true);
    try {
      // Fetch completed orders and expand product details
      const result = await pb.collection('orders').getList(1, 50, {
        filter: `userId = "${currentUser.id}" && paymentStatus = "completed"`,
        sort: '-created',
        expand: 'productId',
        $autoCancel: false
      });
      setDownloads(result.items);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setDownloadsLoading(false);
    }
  };

  const handleDownload = (order) => {
    const product = order.expand?.productId;
    if (!product) return;

    // Check for download URL first, then file fields
    let url = product.download_url;
    
    if (!url) {
      // Fallback to file fields if download_url is empty
      const fileField = product.type === 'plugin' ? 'pluginFile' : 'mapFile';
      if (product[fileField]) {
        url = pb.files.getUrl(product, product[fileField]);
      }
    }

    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: t('error'),
        description: "Download link not available",
        variant: "destructive"
      });
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${t('cart')} - GoldenShop`}</title>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Cagnotte & Status Section */}
          {isAuthenticated && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    {t('cagnotteBalance').replace('{amount}', (currentUser?.cagnotte || 0).toFixed(2))}
                  </h3>
                  <p className="text-sm text-cyan-200/70 mt-1">{t('cagnotteReward')}</p>
                </div>
              </div>
              
              {currentUser?.role === 'client' && (
                <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-400" />
                      Status: Client
                    </h3>
                    <p className="text-sm text-green-200/70 mt-1">{t('clientStatus')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Downloads Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Download className="text-cyan-400" />
              {t('myDownloads')}
            </h2>

            {downloadsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            ) : downloads.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400 mb-2">{t('emptyDownloads')}</p>
                <p className="text-sm text-gray-500">{t('emptyDownloadsDesc')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {downloads.map((order) => {
                  const product = order.expand?.productId;
                  return (
                    <div key={order.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-white text-lg">{order.productName}</h3>
                          <p className="text-sm text-gray-400">{product?.creator || t('creator')}</p>
                        </div>
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">
                          Purchased
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                        <span className="text-sm text-gray-500">
                          {new Date(order.created).toLocaleDateString()}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleDownload(order)}
                          className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t('download')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Cart Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <ShoppingBag className="text-cyan-400" />
              {t('myCart')}
            </h2>

            {cartItems.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('emptyCart')}</h3>
                <p className="text-gray-400 mb-8">{t('emptyCartDesc')}</p>
                <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
                  <Link to="/plugins">{t('browseProducts')}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{item.productName}</h3>
                          <p className="text-sm text-gray-400">Digital Product</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-bold text-cyan-400 text-lg">${item.price}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-white mb-6">{t('orderSummary')}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-400">
                        <span>{t('subtotal')}</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>{t('tax')}</span>
                        <span>$0.00</span>
                      </div>
                      <div className="border-t border-gray-800 pt-3 flex justify-between text-white font-bold text-lg">
                        <span>{t('total')}</span>
                        <span className="text-cyan-400">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      asChild
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-6 shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] transition-all"
                    >
                      <Link to="/checkout">
                        {t('proceedToCheckout')} <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
