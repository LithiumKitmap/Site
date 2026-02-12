
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Globe, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: t('success'),
      description: t('logout') + ' ' + t('success').toLowerCase(),
    });
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/plugins', label: t('plugins') },
    { path: '/maps', label: t('maps') },
    { path: '/community', label: t('community') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] transition-all duration-300">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Golden<span className="text-cyan-400">Shop</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-all duration-300 relative py-1",
                  isActive(link.path)
                    ? "text-cyan-400 glow-text"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Globe className="w-4 h-4 mr-2" />
              <span className="font-medium">{language.toUpperCase()}</span>
            </Button>

            {isAuthenticated && (
              <Link to="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_10px_rgba(0,212,255,0.5)]">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] transition-all">
                    {t('signup')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {t('dashboard')}
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
