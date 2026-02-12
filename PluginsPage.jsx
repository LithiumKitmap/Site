
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ExternalLink, Plus, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ProductModal from '@/components/ProductModal';

const PluginsPage = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const result = await pb.collection('products').getList(1, 50, {
        filter: 'type = "plugin"',
        sort: '-created',
        $autoCancel: false
      });
      setPlugins(result.items);
    } catch (err) {
      console.error("Error fetching plugins:", err);
      toast({
        title: t('error'),
        description: "Failed to load plugins",
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast({
        title: t('loginRequired'),
        description: t('pleaseLogin'),
        variant: 'destructive'
      });
      return;
    }

    try {
      await addToCart(product);
      toast({
        title: t('success'),
        description: t('addedToCart'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${t('plugins')} - GoldenShop`}</title>
        <meta name="description" content="Premium Minecraft Plugins" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white glow-text">{t('plugins')}</h1>
            
            {isAdmin && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Plugin
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            </div>
          ) : plugins.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a1a] rounded-xl border border-gray-800">
              <p className="text-gray-400 text-xl">No plugins available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] group flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    {plugin.images && plugin.images.length > 0 ? (
                      <img
                        src={pb.files.getUrl(plugin, plugin.images[0], { thumb: '300x300' })}
                        alt={plugin.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-blue-900 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold opacity-50">
                          {plugin.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-60" />
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{plugin.name}</h2>
                    <p className="text-sm text-gray-400 mb-3">
                      {t('creator')}: <span className="text-gray-300">{plugin.creator}</span>
                    </p>
                    
                    {plugin.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                        {plugin.description}
                      </p>
                    )}

                    {plugin.demoLink && (
                      <a
                        href={plugin.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('viewDemo')}
                      </a>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                      <span className="text-2xl font-bold text-cyan-400">
                        ${plugin.price}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(plugin)}
                        className="bg-white/5 hover:bg-cyan-500 hover:text-black text-white border border-white/10 hover:border-cyan-500 transition-all duration-300"
                      >
                        {t('buy')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type="plugin"
        onSuccess={fetchPlugins}
      />
    </>
  );
};

export default PluginsPage;
