
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

const ContactPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  React.useEffect(() => {
    toast({
      title: t('comingSoon'),
      description: t('featureNotImplemented'),
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>{`${t('contact')} - GoldenShop`}</title>
        <meta name="description" content={t('contact')} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('contact')}</h1>
          <p className="text-xl text-gray-600">{t('comingSoon')}</p>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
