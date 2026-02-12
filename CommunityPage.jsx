
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, MessageCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import pb from '@/lib/pocketbaseClient';

const CommunityPage = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ clients: 0 });

  useEffect(() => {
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

  return (
    <>
      <Helmet>
        <title>{`${t('community')} - GoldenShop`}</title>
        <meta name="description" content="Join the GoldenShop Community" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-5xl font-bold text-white mb-6 glow-text">{t('joinCommunity')}</h1>
            <p className="text-xl text-gray-400 mb-8">
              {t('communitySupportDesc')}
            </p>
            
            <Button 
              asChild
              size="lg"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-lg px-8 py-6 shadow-[0_0_20px_rgba(88,101,242,0.4)] hover:shadow-[0_0_30px_rgba(88,101,242,0.6)] transition-all"
            >
              <a href="https://discord.gg/kYZsDf4VNZ" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-6 h-6 mr-2" />
                Join Discord Server
              </a>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
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
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl flex items-center justify-between hover:border-[#5865F2]/50 transition-colors group"
            >
              <div>
                <h3 className="text-gray-400 text-lg font-medium mb-1">{t('discordMembers')}</h3>
                <p className="text-xl font-bold text-white group-hover:text-[#5865F2] transition-colors">{t('dataNotIdentified')}</p>
              </div>
              <div className="w-16 h-16 bg-[#5865F2]/10 rounded-full flex items-center justify-center group-hover:bg-[#5865F2]/20 transition-colors">
                <Users className="w-8 h-8 text-[#5865F2]" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 text-center">
              <h3 className="text-xl font-bold text-white mb-4">24/7 Support</h3>
              <p className="text-gray-400">Get help with your plugins and maps directly from our developers and community experts.</p>
            </div>
            <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 text-center">
              <h3 className="text-xl font-bold text-white mb-4">Exclusive Updates</h3>
              <p className="text-gray-400">Be the first to know about new releases, updates, and special discounts.</p>
            </div>
            <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 text-center">
              <h3 className="text-xl font-bold text-white mb-4">Showcase</h3>
              <p className="text-gray-400">Share your server projects and see how others are using GoldenShop resources.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityPage;
