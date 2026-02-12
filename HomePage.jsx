
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Server, UserCheck } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const HomePage = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ clients: 0 });

  useEffect(() => {
    fetchFeaturedProducts();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await pb.collection('users').getList(1, 1, {
        filter: 'role = "client"',
        $autoCancel: false
      });
      setStats({ clients: result.totalItems });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const products = await pb.collection('products').getList(1, 4, {
        filter: 'featured = true',
        sort: '-created',
        $autoCancel: false
      });
      setFeaturedProducts(products.items);
    } catch (error) {
      console.error('Error fetching featured products:', error);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{`GoldenShop - ${t('tagline')}`}</title>
        <meta name="description" content={t('tagline')} />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-4 max-w-4xl"
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight"
              animate={{ textShadow: ["0 0 10px #00d4ff", "0 0 20px #00d4ff", "0 0 10px #00d4ff"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Golden<span className="text-cyan-400">Shop</span>
            </motion.h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
              {t('tagline')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-lg px-8 py-6 shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all"
              >
                <Link to="/plugins">{t('browseProducts')}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/30 text-lg px-8 py-6"
              >
                <Link to="/community">{t('joinCommunity')}</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-[#111]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl flex items-center justify-between hover:border-cyan-500/50 transition-colors group"
              >
                <div>
                  <h3 className="text-gray-400 text-lg font-medium mb-1">{t('uniqueClients')}</h3>
                  <p className="text-4xl font-bold text-white group-hover:text-cyan-400 transition-colors">{stats.clients}+</p>
                </div>
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <UserCheck className="w-8 h-8 text-cyan-400" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl flex items-center justify-between hover:border-indigo-500/50 transition-colors group"
              >
                <div>
                  <h3 className="text-gray-400 text-lg font-medium mb-1">{t('discordMembers')}</h3>
                  <p className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{t('dataNotIdentified')}</p>
                </div>
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <Users className="w-8 h-8 text-indigo-400" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-[#0a0a0a]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4 glow-text">
                {t('featuredProducts')}
              </h2>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t('loading')}</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {featuredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] group"
                  >
                    <div className="relative overflow-hidden h-48">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={pb.files.getUrl(product, product.images[0], { thumb: '300x300' })}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-blue-900 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold opacity-50">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-60" />
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-white mb-1 group-hover:text-cyan-400 transition-colors">{product.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{t('creator')}: {product.creator}</p>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xl font-bold text-cyan-400">${product.price}</p>
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20 uppercase">
                          {product.type}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-white/5 hover:bg-cyan-500 hover:text-black text-white border border-white/10 hover:border-cyan-500 transition-all duration-300"
                      >
                        {t('addToCart')}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-20 bg-[#111] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">{t('meetFounders')}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">The minds behind GoldenShop, dedicated to bringing you the best Minecraft resources.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {/* Founder 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 relative group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-24 h-24 text-cyan-500" />
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                  N
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">NarrowLeBG</h3>
                <p className="text-cyan-400 font-medium mb-4">Co-Founder & Lead Developer</p>
                <p className="text-gray-400 leading-relaxed">
                  Expert in plugin development and system architecture. Passionate about creating efficient, scalable solutions for the Minecraft community.
                </p>
              </motion.div>

              {/* Founder 2 */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300 relative group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-24 h-24 text-yellow-500" />
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                  R
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ryzorx</h3>
                <p className="text-yellow-400 font-medium mb-4">Co-Founder & Creative Director</p>
                <p className="text-gray-400 leading-relaxed">
                  Visionary behind the GoldenShop aesthetic and user experience. Specializes in map design and community engagement strategies.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Trust Us */}
        <section className="py-20 bg-[#0a0a0a]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                {t('whyTrustUs')}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-colors"
              >
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('security')}</h3>
                <p className="text-gray-400">{t('securityDesc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-colors"
              >
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Server className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('reliability')}</h3>
                <p className="text-gray-400">{t('reliabilityDesc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-colors"
              >
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('communitySupport')}</h3>
                <p className="text-gray-400">{t('communitySupportDesc')}</p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
