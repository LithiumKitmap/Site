
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const { login, authWithOAuth2 } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: t('success'),
        description: t('login') + ' ' + t('success').toLowerCase(),
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
      toast({
        title: t('error'),
        description: err.message || 'Login failed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authWithOAuth2('google')
      .then(() => {
        toast({
          title: t('success'),
          description: t('login') + ' ' + t('success').toLowerCase(),
        });
        navigate('/');
      })
      .catch((err) => {
        toast({
          title: t('error'),
          description: err.message || 'OAuth login failed',
          variant: 'destructive'
        });
      });
  };

  const handleAppleLogin = () => {
    authWithOAuth2('apple')
      .then(() => {
        toast({
          title: t('success'),
          description: t('login') + ' ' + t('success').toLowerCase(),
        });
        navigate('/');
      })
      .catch((err) => {
        toast({
          title: t('error'),
          description: err.message || 'OAuth login failed',
          variant: 'destructive'
        });
      });
  };

  return (
    <>
      <Helmet>
        <title>{`${t('login')} - GoldenShop`}</title>
        <meta name="description" content={t('login')} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4 py-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('login')}</CardTitle>
            <CardDescription className="text-center">
              {t('welcome')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? t('loading') : t('login')}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                {t('loginWithGoogle')}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAppleLogin}
              >
                {t('loginWithApple')}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              {t('noAccount')}{' '}
              <Link to="/signup" className="text-green-600 hover:underline font-medium">
                {t('signup')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;
