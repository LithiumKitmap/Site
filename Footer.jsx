
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] border-t border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">{t('aboutUs')}</h3>
            <p className="text-gray-400 text-sm">
              GoldenShop - {t('tagline')}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t('founder')}: NarrowLeBG
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/plugins" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                  {t('plugins')}
                </Link>
              </li>
              <li>
                <Link to="/maps" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                  {t('maps')}
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                  {t('community')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">{t('contact')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">{t('followUs')}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'fr' ? 'Français' : 'English'}</span>
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} GoldenShop. {t('copyright')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
